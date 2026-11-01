import { NextResponse } from "next/server";
import { ADMIN_EMAIL, ADMIN_PASSWORD, COOKIE, createToken } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (body?.email?.toLowerCase?.() !== ADMIN_EMAIL.toLowerCase() || body?.password !== ADMIN_PASSWORD)
    return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, createToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
