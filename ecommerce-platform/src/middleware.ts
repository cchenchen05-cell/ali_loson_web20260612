import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const locales = ["zh", "en"];

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

  // Frontend internationalization
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  // Redirect to default locale if no locale prefix
  const locale = req.cookies.get("NEXT_LOCALE")?.value || "zh";
  const newUrl = new URL(`/${locale}${pathname}`, req.url);
  newUrl.search = req.nextUrl.search;
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};