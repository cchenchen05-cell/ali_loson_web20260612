import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware({
  locales: ["zh", "en"],
  defaultLocale: "zh",
  localePrefix: "always",
});

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Handle admin routes - check auth
  if (pathname.startsWith("/admin")) {
    if (pathname.startsWith("/admin/login") || pathname.startsWith("/api")) {
      return NextResponse.next();
    }

    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Handle API routes
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Use next-intl middleware for frontend routes
  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};