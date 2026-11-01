import { revalidatePath } from "next/cache";
import { getDB, logActivity, mutate } from "@/lib/db";
import { guard, ok } from "@/lib/api";

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  return ok((await getDB()).settings);
}

/** Deep-merges a partial settings object. Arrays are replaced wholesale. */
function merge(target: Record<string, unknown>, patch: Record<string, unknown>) {
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === "object" && !Array.isArray(v) && target[k] && typeof target[k] === "object")
      merge(target[k] as Record<string, unknown>, v as Record<string, unknown>);
    else target[k] = v;
  }
}

export async function PUT(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const patch = await req.json();
  const settings = await mutate((db) => {
    merge(db.settings as unknown as Record<string, unknown>, patch);
    logActivity(db, "cms", `Site settings updated (${Object.keys(patch).join(", ")})`);
    return db.settings;
  });
  revalidatePath("/", "layout");
  return ok(settings);
}
