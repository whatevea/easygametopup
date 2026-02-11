import { NextResponse } from "next/server";
import { getCurrentUserFromCookies } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUserFromCookies();

  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user }, { status: 200 });
}
