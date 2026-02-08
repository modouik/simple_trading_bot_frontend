import { NextResponse } from "next/server";
import {
  DEVICE_ID_COOKIE,
  DYNAMIC_HMAC_SECRET_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/constants";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const isSecure =
    process.env.COOKIE_SECURE === "true" ||
    process.env.NODE_ENV === "production";
  const clearOpt = {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
  res.cookies.set(REFRESH_TOKEN_COOKIE, "", clearOpt);
  res.cookies.set(DYNAMIC_HMAC_SECRET_COOKIE, "", { ...clearOpt, sameSite: "strict" });
  res.cookies.set(DEVICE_ID_COOKIE, "", { ...clearOpt, sameSite: "strict" });
  return res;
}
