import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/saas", "/b2bproduct", "/b2cproduct"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is protected
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  
  if (!isProtected) {
    return NextResponse.next();
  }
  
  // Check for auth cookie
  const authCookie = request.cookies.get("site_auth");
  
  if (authCookie?.value === "authenticated") {
    return NextResponse.next();
  }
  
  // Redirect to login page with return URL
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("returnTo", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/saas/:path*", "/b2bproduct/:path*", "/b2cproduct/:path*"],
};

