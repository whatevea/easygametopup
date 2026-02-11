import { NextResponse } from "next/server";
import { authConfig, assertAuthEnv } from "@/lib/auth/config";
import {
  buildAuthCookies,
  buildClearedAuthCookies,
  generateRefreshToken,
  hashRefreshToken,
} from "@/lib/auth/session";
import { createAccessToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST() {
  assertAuthEnv();
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(authConfig.refreshTokenCookie)?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "Missing refresh token." }, { status: 401 });
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const session = await prisma.authSession.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
    const denied = NextResponse.json({ error: "Invalid refresh token." }, { status: 401 });
    for (const cookie of buildClearedAuthCookies()) {
      denied.cookies.set(cookie.name, cookie.value, cookie.options);
    }
    return denied;
  }

  const rotatedRefreshToken = generateRefreshToken();
  const rotatedHash = hashRefreshToken(rotatedRefreshToken);

  await prisma.authSession.update({
    where: { id: session.id },
    data: {
      tokenHash: rotatedHash,
      expiresAt: new Date(Date.now() + authConfig.refreshTokenTtlSeconds * 1000),
      revokedAt: null,
    },
  });

  const accessToken = await createAccessToken(session.user);

  const response = NextResponse.json({ message: "Session refreshed." }, { status: 200 });
  for (const cookie of buildAuthCookies({
    accessToken,
    refreshToken: rotatedRefreshToken,
  })) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }

  return response;
}
