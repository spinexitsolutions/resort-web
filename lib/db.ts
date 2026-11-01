import "server-only";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { buildSeed } from "./seed";
import type { Activity, CollectionKey, Database } from "./types";

/**
 * Tiny JSON-file database. Perfect for a demo / small property.
 * Writes go to ./data/db.json, falling back to the OS temp dir on
 * read-only hosts (e.g. serverless). Swap for Postgres/Prisma in production.
 */
const PRIMARY = path.join(process.cwd(), "data", "db.json");
const FALLBACK = path.join(os.tmpdir(), "aranya-db.json");

/**
 * Next can load this module more than once (route handlers and pages live in
 * different bundles), so the cache lives on globalThis and is re-validated
 * against the file's mtime — every reader sees writes immediately.
 */
const G = globalThis as unknown as { __aranyaDB?: { data: Database | null; mtime: number; queue: Promise<unknown> } };
const store = (G.__aranyaDB ??= { data: null, mtime: 0, queue: Promise.resolve() });

async function mtimeOf() {
  for (const p of [FALLBACK, PRIMARY]) {
    try {
      return (await fs.stat(p)).mtimeMs;
    } catch {}
  }
  return 0;
}

async function readFile(p: string): Promise<Database | null> {
  try {
    return JSON.parse(await fs.readFile(p, "utf8")) as Database;
  } catch {
    return null;
  }
}

async function writeFile(data: Database) {
  const json = JSON.stringify(data, null, 2);
  try {
    await fs.mkdir(path.dirname(PRIMARY), { recursive: true });
    await fs.writeFile(PRIMARY, json);
  } catch {
    await fs.writeFile(FALLBACK, json);
  }
  store.mtime = await mtimeOf();
}

export async function getDB(): Promise<Database> {
  const mtime = await mtimeOf();
  if (store.data && mtime === store.mtime) return store.data;
  store.mtime = mtime;
  const data = (await readFile(FALLBACK)) ?? (await readFile(PRIMARY));
  if (data) {
    // merge any newly-added top level keys from the seed
    const seed = buildSeed();
    const settings = { ...seed.settings, ...data.settings } as Record<string, unknown>;
    for (const [k, v] of Object.entries(seed.settings))
      if (v && typeof v === "object" && !Array.isArray(v))
        settings[k] = { ...v, ...((data.settings as unknown as Record<string, object>)[k] ?? {}) };
    store.data = { ...seed, ...data, settings: settings as unknown as Database["settings"] };
  } else {
    store.data = buildSeed();
    await writeFile(store.data);
  }
  return store.data;
}

/** Serialised mutation helper — avoids lost writes on concurrent requests. */
export function mutate<T>(fn: (db: Database) => T | Promise<T>): Promise<T> {
  const run = store.queue.then(async () => {
    const db = await getDB();
    const result = await fn(db);
    await writeFile(db);
    return result;
  });
  store.queue = run.catch(() => undefined);
  return run;
}

export async function resetDB() {
  return mutate((db) => {
    const fresh = buildSeed();
    Object.assign(db, fresh);
    return true;
  });
}

export const uid = (p = "") => p + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

export function logActivity(db: Database, kind: Activity["kind"], message: string) {
  db.activity.unshift({ id: uid("a"), kind, message, at: new Date().toISOString() });
  db.activity = db.activity.slice(0, 200);
}

export function isCollection(k: string): k is CollectionKey {
  return [
    "rooms", "experiences", "dining", "offers", "gallery", "testimonials", "faqs",
    "venues", "bookings", "inquiries", "guests", "subscribers", "activity",
  ].includes(k);
}

export function upsertGuest(db: Database, g: { name: string; email: string; phone?: string; city?: string }) {
  const email = g.email.trim().toLowerCase();
  let guest = db.guests.find((x) => x.email.toLowerCase() === email);
  if (!guest) {
    guest = {
      id: uid("g"),
      name: g.name,
      email,
      phone: g.phone ?? "",
      city: g.city ?? "",
      tags: [],
      vip: false,
      notes: "",
      createdAt: new Date().toISOString(),
    };
    db.guests.unshift(guest);
  } else {
    if (g.phone && !guest.phone) guest.phone = g.phone;
    if (g.name && !guest.name) guest.name = g.name;
  }
  return guest;
}

/** Number of overlapping, non-cancelled bookings for a room in [checkIn, checkOut). */
export function overlapping(db: Database, roomId: string, checkIn: string, checkOut: string, ignoreId?: string) {
  return db.bookings.filter(
    (b) =>
      b.roomId === roomId &&
      b.id !== ignoreId &&
      b.status !== "cancelled" &&
      b.checkIn < checkOut &&
      b.checkOut > checkIn,
  ).length;
}
