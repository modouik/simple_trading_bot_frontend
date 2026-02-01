import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  BACKEND_BASE_URL,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/lib/auth/constants";
import { buildHmacHeaders } from "@/lib/auth/hmac";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
    if (!refreshToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = JSON.stringify({ refresh_token: refreshToken });
    const hmacHeaders = await buildHmacHeaders(body);

    const response = await fetch(`${BACKEND_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...hmacHeaders,
      },
      body,
    });

    if (!response.ok) {
      const res = NextResponse.json(
        { error: "Unauthorized" },
        { status: response.status }
      );
      res.cookies.set(REFRESH_TOKEN_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return res;
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
      const isSecure =
        process.env.COOKIE_SECURE === "true" ||
        process.env.NODE_ENV === "production";
      res.cookies.set(REFRESH_TOKEN_COOKIE, data.refresh_token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
      });
    }

    return res;
  } catch {
    return NextResponse.json(
      { error: "Network error" },
      { status: 500 }
    );
  }
}
