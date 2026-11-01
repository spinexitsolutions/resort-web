import "server-only";
import { cookies } from "next/headers";
import crypto from "crypto";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@aranya.resort";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "aranya2026";
const SECRET = process.env.ADMIN_SECRET || "aranya-demo-secret-change-me";
export const COOKIE = "aranya_admin";

export function sign(value: string) {
  const mac = crypto.createHmac("sha256", SECRET).update(value).digest("hex");
  return `${value}.${mac}`;
}

export function verify(token?: string | null) {
  if (!token) return false;
  const i = token.lastIndexOf(".");
  if (i < 0) return false;
  const value = token.slice(0, i);
  const expected = sign(value);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  const exp = Number(value.split(":")[1]);
  return Number.isFinite(exp) && exp > Date.now();
}

export function createToken() {
  return sign(`admin:${Date.now() + 1000 * 60 * 60 * 24 * 7}`);
}

export async function isAdmin() {
  const store = await cookies();
  return verify(store.get(COOKIE)?.value);
}
