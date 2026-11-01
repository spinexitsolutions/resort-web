import "server-only";
import { NextResponse } from "next/server";
import { isAdmin } from "./auth";

export const ok = (data: unknown, init?: number) => NextResponse.json(data, { status: init ?? 200 });
export const bad = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

export async function guard() {
  if (!(await isAdmin())) return bad("Unauthorized", 401);
  return null;
}

export const isEmail = (s: unknown) => typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
export const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
