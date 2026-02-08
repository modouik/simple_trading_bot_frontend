import axios, { AxiosError, AxiosHeaders, AxiosRequestConfig } from "axios";
import {
  AUTH_SESSION_EXPIRED_EVENT,
  AUTH_SUBSCRIPTION_REQUIRED_EVENT,
  HEADER_AUTHORIZATION,
} from "./constants";
import {
  clearTokens,
  getAccessToken,
  isAccessTokenExpired,
  setTokens,
} from "./tokenStore";

type ApiMode = "TESTNET" | "PRODUCTION";

const DEFAULT_MODE: ApiMode = "PRODUCTION";

let currentMode: ApiMode =
  (process.env.NEXT_PUBLIC_MODE as ApiMode | undefined) ??
  (process.env.MODE as ApiMode | undefined) ??
  DEFAULT_MODE;

export const getApiMode = (): ApiMode => currentMode;

export const setApiMode = (mode: ApiMode) => {
  currentMode = mode;
};

/** BFF proxy: all API calls go through Next.js server; HMAC is signed server-side only. */
const client = axios.create({
  baseURL: "/api/proxy",
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
});

let refreshPromise: Promise<boolean> | null = null;

/** Point unique de refresh : utilisé par l’interceptor ET par AuthContext (visibility). Évite le double refresh qui invalide le token côté Laravel. */
const doRefresh = async (isRetry = false): Promise<boolean> => {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return false;
    const data = (await res.json()) as {
      access_token: string;
      expires_in: number;
    };
    if (!data?.access_token || !data?.expires_in) return false;
    setTokens(data.access_token, data.expires_in);
    return true;
  } catch {
    if (!isRetry) {
      await new Promise((r) => setTimeout(r, 1200));
      return doRefresh(true);
    }
    return false;
  }
};

export const refreshAccessToken = async (): Promise<boolean> => {
  if (refreshPromise) return refreshPromise;
  refreshPromise = doRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
};

client.interceptors.request.use(async (config) => {
  if (!getAccessToken() || isAccessTokenExpired()) {
    await refreshAccessToken();
  }

  const headers = AxiosHeaders.from(config.headers ?? {});
  const accessToken = getAccessToken();
  if (accessToken) {
    headers.set(HEADER_AUTHORIZATION, `Bearer ${accessToken}`);
  }

  // Inject mode in GET query params
  const mode = getApiMode();

  if (config.method?.toUpperCase() === "GET") {
    config.params = {
      ...(config.params || {}),
      mode,
    };
  } else {
    // Inject mode into body for POST/PUT/PATCH/DELETE
    if (config.data == null || typeof config.data !== "object") {
      config.data = { mode };
    } else if (!("mode" in (config.data as any))) {
      (config.data as any).mode = mode;
    }
  }

  config.headers = headers;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 402) {
      const data = error.response?.data as { message?: string; redirect_url?: string } | undefined;
      if (typeof window !== "undefined") {
        clearTokens();
        window.dispatchEvent(
          new CustomEvent(AUTH_SUBSCRIPTION_REQUIRED_EVENT, {
            detail: { message: data?.message, redirect_url: data?.redirect_url },
          })
        );
      }
      return Promise.reject(error);
    }
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const config = error.config as (AxiosRequestConfig & { _retry?: boolean });
    if (!config || config._retry) {
      return Promise.reject(error);
    }

    config._retry = true;
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      clearTokens();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
      }
      return Promise.reject(error);
    }

    const accessToken = getAccessToken();
    const headers = AxiosHeaders.from(config.headers ?? {});
    headers.set(HEADER_AUTHORIZATION, accessToken ? `Bearer ${accessToken}` : null);
    config.headers = headers;
    return client(config);
  }
);

export const authRequest = async <T = unknown>(
  options: AxiosRequestConfig
) => client.request<T>(options);
