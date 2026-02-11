import { NextResponse } from "next/server";
import { assertAuthEnv } from "@/lib/auth/config";
import { hashPassword } from "@/lib/auth/password";
import { buildAuthCookies, createAuthSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

type RegisterBody = {
  email?: string;
  password?: string;
  name?: string;
};

export async function POST(request: Request) {
  assertAuthEnv();

  let body: RegisterBody;
  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();
  const name = body.name?.trim() || null;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
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
      message: "Registration successful.",
    },
    { status: 201 },
  );

  for (const cookie of buildAuthCookies(tokens)) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }

  return response;
}
