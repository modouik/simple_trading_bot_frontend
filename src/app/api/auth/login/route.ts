import { NextResponse } from "next/server";
import {
  BACKEND_BASE_URL,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/lib/auth/constants";
import { buildHmacHeaders } from "@/lib/auth/hmac";

export async function POST(request: Request) {
  try {
    const { username, password } = (await request.json()) as {
      username: string;
      password: string;
    };

    console.log(`📡 Login attempt for ${username} to ${BACKEND_BASE_URL}`);

    const payload = { username, password };
    const body = JSON.stringify(payload);
    const hmacHeaders = await buildHmacHeaders(body);

    const response = await fetch(`${BACKEND_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...hmacHeaders,
      },
      body,
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
    };

    const res = NextResponse.json({
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
    });

    if (data.refresh_token) {
      // CORRECTION INFRASTRUCTURE :
      // On regarde la variable COOKIE_SECURE définie dans docker-compose
      // Si elle n'est pas définie, on assume false par sécurité pour éviter les blocages locaux
      const isSecureEnvironment = process.env.COOKIE_SECURE === "true";

      console.log(`🍪 Setting cookie. Secure mode: ${isSecureEnvironment} (Mode Affichage: ${process.env.NEXT_PUBLIC_MODE})`);

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
    console.error("❌ Network error in login route:", error);
    return NextResponse.json(
      { error: "Network error" },
      { status: 500 }
    );
  }
}