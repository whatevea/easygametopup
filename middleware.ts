import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/config";
import { verifyAccessToken } from "@/lib/auth/jwt";

const protectedApiMatchers = ["/api/purchase"];

function isProtectedPath(pathname: string): boolean {
  return protectedApiMatchers.some((path) => pathname.startsWith(path));
}

export async function middleware(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(authConfig.accessTokenCookie)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyAccessToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-auth-user-id", payload.sub);
  requestHeaders.set("x-auth-user-email", payload.email);
  requestHeaders.set("x-auth-user-role", payload.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/api/purchase/:path*"],
};
