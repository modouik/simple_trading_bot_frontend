import { NextResponse } from "next/server";
import {
  BACKEND_BASE_URL,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/lib/auth/constants";
import { buildHmacHeaders } from "@/lib/auth/hmac";
import { verifyTurnstileToken } from "@/lib/turnstile/verify";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username: string;
      email?: string;
      password: string;
      save_user?: boolean;
      turnstile_token?: string;
    };
    const { username, email, password, save_user, turnstile_token } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

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

    const payload = {
      username: username.trim(),
      ...(email !== undefined && email !== "" && { email: email.trim() }),
      password,
      ...(save_user !== undefined && { save_user: !!save_user }),
    };
    const bodyStr = JSON.stringify(payload);
    const hmacHeaders = await buildHmacHeaders(bodyStr);

    const response = await fetch(`${BACKEND_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...hmacHeaders,
      },
      body: bodyStr,
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 402) {
      return NextResponse.json(data, { status: 402 });
    }

    if (!response.ok) {
      return NextResponse.json(
        data?.message ? { error: data.message, ...data } : data,
        { status: response.status }
      );
    }

    const res = NextResponse.json({
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
    });

    if (data.refresh_token) {
      const isSecureEnvironment = process.env.COOKIE_SECURE === "true";
      res.cookies.set(REFRESH_TOKEN_COOKIE, data.refresh_token, {
        httpOnly: true,
        secure: isSecureEnvironment,
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
      });
    }

    return res;
  } catch (error) {
    console.error("❌ Network error in register route:", error);
    return NextResponse.json(
      { error: "Network error" },
      { status: 500 }
    );
  }
}
