import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  BACKEND_BASE_URL,
  DEVICE_ID_COOKIE,
  DYNAMIC_HMAC_SECRET_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/lib/auth/constants";
import { buildHmacHeaders } from "@/lib/auth/hmac";
import { verifyTurnstileToken } from "@/lib/turnstile/verify";

function getOrCreateDeviceId(cookieValue: string | undefined): string {
  if (cookieValue && cookieValue.length > 0) return cookieValue;
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function POST(request: Request) {
  try {
    const reqBody = (await request.json()) as {
      username: string;
      password: string;
      turnstile_token?: string;
    };
    const { username, password, turnstile_token } = reqBody;

    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (secret) {
      if (!turnstile_token || typeof turnstile_token !== "string") {
        return NextResponse.json(
          { error: "Verification required. Please complete the challenge." },
          { status: 400 }
        );
      }
      const forwarded = request.headers.get("x-forwarded-for");
      const remoteip = forwarded?.split(",")[0]?.trim() ?? undefined;
      const { success } = await verifyTurnstileToken(secret, turnstile_token, remoteip);
      if (!success) {
        return NextResponse.json(
          { error: "Verification failed. Please try again." },
          { status: 400 }
        );
      }
    }

    console.log(`📡 Login attempt for ${username} to ${BACKEND_BASE_URL}`);

    const cookieStore = await cookies();
    const deviceId = getOrCreateDeviceId(cookieStore.get(DEVICE_ID_COOKIE)?.value);
    const payload = { username, password, device_id: deviceId };
    const bodyStr = JSON.stringify(payload);
    const hmacHeaders = await buildHmacHeaders(bodyStr);

    const response = await fetch(`${BACKEND_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...hmacHeaders,
      },
      body: bodyStr,
    });

    if (!response.ok) {
      console.warn("❌ Login failed at backend:", response.status);
      const data = await response.json().catch(() => ({}));
      if (response.status === 402) {
        return NextResponse.json(data, { status: 402 });
      }
      return NextResponse.json(
        data?.message ? { error: data.message, ...data } : { error: "Invalid credentials" },
        { status: response.status }
      );
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
      dynamic_hmac_secret?: string;
    };

    const res = NextResponse.json({
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
    });

    const isSecureEnvironment = process.env.COOKIE_SECURE === "true";

    if (data.refresh_token) {
      res.cookies.set(REFRESH_TOKEN_COOKIE, data.refresh_token, {
        httpOnly: true,
        secure: isSecureEnvironment,
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
      });
    }

    if (data.dynamic_hmac_secret) {
      res.cookies.set(DYNAMIC_HMAC_SECRET_COOKIE, data.dynamic_hmac_secret, {
        httpOnly: true,
        secure: isSecureEnvironment,
        sameSite: "strict",
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
      });
    }
    res.cookies.set(DEVICE_ID_COOKIE, deviceId, {
      httpOnly: true,
      secure: isSecureEnvironment,
      sameSite: "strict",
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });

    return res;
  } catch (error) {
    console.error("❌ Network error in login route:", error);
    return NextResponse.json(
      { error: "Network error" },
      { status: 500 }
    );
  }
}