import { NextResponse } from "next/server";
import { assertAuthEnv } from "@/lib/auth/config";
import { verifyPassword } from "@/lib/auth/password";
import { buildAuthCookies, createAuthSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  assertAuthEnv();

  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const tokens = await createAuthSession({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const response = NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      message: "Login successful.",
    },
    { status: 200 },
  );

  for (const cookie of buildAuthCookies(tokens)) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }

  return response;
}
