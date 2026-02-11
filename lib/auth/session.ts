import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { authConfig } from "@/lib/auth/config";
import { createAccessToken, verifyAccessToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

export type AuthUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  name: string | null;
};

export function generateRefreshToken(): string {
  return randomBytes(48).toString("base64url");
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createAuthSession(user: {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
}): Promise<{ accessToken: string; refreshToken: string }> {
  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + authConfig.refreshTokenTtlSeconds * 1000);

  await prisma.authSession.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const accessToken = await createAccessToken(user);
  return { accessToken, refreshToken };
}

export function buildAuthCookies(tokens: {
  accessToken: string;
  refreshToken: string;
}) {
  const cookieBase = {
    httpOnly: true,
    secure: authConfig.isProduction,
    sameSite: "lax" as const,
    path: "/",
  };

  return [
    {
      name: authConfig.accessTokenCookie,
      value: tokens.accessToken,
      options: {
        ...cookieBase,
        maxAge: authConfig.accessTokenTtlSeconds,
      },
    },
    {
      name: authConfig.refreshTokenCookie,
      value: tokens.refreshToken,
      options: {
        ...cookieBase,
        maxAge: authConfig.refreshTokenTtlSeconds,
      },
    },
  ];
}

export function buildClearedAuthCookies() {
  const cookieBase = {
    httpOnly: true,
    secure: authConfig.isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };

  return [
    {
      name: authConfig.accessTokenCookie,
      value: "",
      options: cookieBase,
    },
    {
      name: authConfig.refreshTokenCookie,
      value: "",
      options: cookieBase,
    },
  ];
}

export async function getCurrentUserFromCookies(): Promise<AuthUser | null> {
  const store = await cookies();
  const token = store.get(authConfig.accessTokenCookie)?.value;
  if (!token) {
    return null;
  }

  const payload = await verifyAccessToken(token);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
    },
  });

  if (!user) {
    return null;
  }

  return user;
}

export async function getCurrentUserFromMiddlewareHeaders(): Promise<AuthUser | null> {
  const headerStore = await headers();
  const userId = headerStore.get("x-auth-user-id");
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
    },
  });

  return user;
}
