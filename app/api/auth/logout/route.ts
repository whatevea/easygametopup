import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/config";
import { buildClearedAuthCookies, hashRefreshToken } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(authConfig.refreshTokenCookie)?.value;

  if (refreshToken) {
    const tokenHash = hashRefreshToken(refreshToken);
    await prisma.authSession.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  const response = NextResponse.json({ message: "Logged out." }, { status: 200 });
  for (const cookie of buildClearedAuthCookies()) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }

  return response;
}
