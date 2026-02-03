import { NextResponse } from "next/server";
import { fallbackLng, languages } from "@/app/i18n/settings";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants";

const PUBLIC_FILE = /\.(.*)$/;

const resolveLng = (pathname) => {
  const [, lng] = pathname.split("/");
  return languages.includes(lng) ? lng : fallbackLng;
};

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = `/${fallbackLng}/login`;
    return NextResponse.rewrite(url);
  }

  if (pathname === "/signup") {
    const url = request.nextUrl.clone();
    url.pathname = `/${fallbackLng}/signup`;
    return NextResponse.rewrite(url);
  }

  const hasRefreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const lng = resolveLng(pathname);
  const isLoginRoute = pathname === `/${lng}/login`;
  const isSignupRoute = pathname === `/${lng}/signup`;

  if (!hasRefreshToken && !isLoginRoute && !isSignupRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};