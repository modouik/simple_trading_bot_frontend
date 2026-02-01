import { NextResponse } from "next/server";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const isSecure =
    process.env.COOKIE_SECURE === "true" ||
    process.env.NODE_ENV === "production";
  res.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
