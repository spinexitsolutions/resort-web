import { logActivity, mutate, uid } from "@/lib/db";
import { bad, isEmail, ok, str } from "@/lib/api";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = str(body?.email, 160).toLowerCase();
  if (!isEmail(email)) return bad("Please enter a valid email");
  return mutate((db) => {
    if (!db.subscribers.some((s) => s.email === email)) {
      db.subscribers.unshift({ id: uid("s"), email, createdAt: new Date().toISOString() });
      logActivity(db, "subscriber", `${email} joined the newsletter`);
    }
    return ok({ ok: true });
  });
}
