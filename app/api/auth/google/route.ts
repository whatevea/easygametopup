import { NextResponse } from "next/server";
import { assertAuthEnv } from "@/lib/auth/config";
import { verifyGoogleIdToken } from "@/lib/auth/google";
import { buildAuthCookies, createAuthSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

type GoogleAuthBody = {
  idToken?: string;
};

export async function POST(request: Request) {
  assertAuthEnv();

  let body: GoogleAuthBody;
  try {
    body = (await request.json()) as GoogleAuthBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.idToken) {
    return NextResponse.json({ error: "idToken is required." }, { status: 400 });
  }

  const identity = await verifyGoogleIdToken(body.idToken);
  if (!identity) {
    return NextResponse.json(
      { error: "Google token verification failed." },
      { status: 401 },
    );
  }

  const email = identity.email.trim().toLowerCase();

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      googleId: identity.sub,
      emailVerified: identity.email_verified,
      name: identity.name ?? undefined,
      avatarUrl: identity.picture ?? undefined,
    },
    create: {
      email,
      googleId: identity.sub,
      emailVerified: identity.email_verified,
      name: identity.name,
      avatarUrl: identity.picture,
    },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
    },
  });

  const tokens = await createAuthSession({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const response = NextResponse.json(
    {
      user,
      message: "Google sign-in successful.",
    },
    { status: 200 },
  );

  for (const cookie of buildAuthCookies(tokens)) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }

  return response;
}
