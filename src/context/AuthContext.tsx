"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { refreshAccessToken } from "@/lib/auth/apiClient";
import { AUTH_SESSION_EXPIRED_EVENT, AUTH_SUBSCRIPTION_REQUIRED_EVENT } from "@/lib/auth/constants";
import { clearTokens, getAccessToken, isAccessTokenExpired, setTokens } from "@/lib/auth/tokenStore";

type LoginResult = { ok: true } | { ok: false; error: string };

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, turnstileToken?: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const bootstrap = async () => {
    setIsLoading(true);
    try {
      const isAuthPage =
        pathname != null &&
        typeof pathname === "string" &&
        (pathname.includes("/login") || pathname.includes("/signup"));
      if (isAuthPage) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      if (pathname == null) {
        setIsLoading(false);
        return;
      }
      if (getAccessToken() && !isAccessTokenExpired()) {
        setIsAuthenticated(true);
        return;
      }
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        clearTokens();
        setIsAuthenticated(false);
        return;
      }
      const data = (await res.json()) as {
        access_token: string;
        expires_in: number;
      };
      if (data?.access_token && data?.expires_in) {
        setTokens(data.access_token, data.expires_in);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
  }, [pathname]);

  // Quand la session expire (refresh échoué dans apiClient), déconnecter et rediriger vers login
  useEffect(() => {
    const handleSessionExpired = () => {
      clearTokens();
      setIsAuthenticated(false);
      router.replace("/login");
    };
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [router]);

  // Au retour sur l’onglet : un seul refresh (via apiClient) pour éviter que 2 requêtes utilisent le même refresh token (Laravel l’invalide après 1 use)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (typeof document === "undefined" || document.visibilityState !== "visible") return;
      if (getAccessToken() && !isAccessTokenExpired()) return;
      const ok = await refreshAccessToken();
      if (ok) setIsAuthenticated(true);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const login = async (
    username: string,
    password: string,
    turnstileToken?: string
  ): Promise<LoginResult> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          ...(turnstileToken && { turnstile_token: turnstileToken }),
        }),
      });

      if (res.status === 402) {
        const data = (await res.json().catch(() => ({}))) as { message?: string; redirect_url?: string };
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent(AUTH_SUBSCRIPTION_REQUIRED_EVENT, {
              detail: { message: data?.message, redirect_url: data?.redirect_url },
            })
          );
        }
        return { ok: false, error: data?.message || "Subscription required." };
      }

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        const message =
          data?.error ||
          (res.status === 401 || res.status === 403 ? "Invalid credentials." : "Login failed.");
        return { ok: false, error: message };
      }

      const data = (await res.json()) as {
        access_token: string;
        expires_in: number;
      };
      if (!data?.access_token || !data?.expires_in) {
        return { ok: false, error: "Invalid response from server." };
      }
      setTokens(data.access_token, data.expires_in);
      setIsAuthenticated(true);
      return { ok: true };
    } catch {
      return { ok: false, error: "Network error. Please try again." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      clearTokens();
      setIsAuthenticated(false);
      router.replace("/login");
    }
  };

  const value = useMemo(
    () => ({ isAuthenticated, isLoading, login, logout }),
    [isAuthenticated, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
