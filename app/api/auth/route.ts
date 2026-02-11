import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Use /api/auth/register, /api/auth/login, /api/auth/google, /api/auth/refresh, /api/auth/logout, /api/auth/me",
  });
}
