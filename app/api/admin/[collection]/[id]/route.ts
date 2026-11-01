import { revalidatePath } from "next/cache";
import { isCollection, logActivity, mutate } from "@/lib/db";
import { bad, guard, ok } from "@/lib/api";

type Ctx = { params: Promise<{ collection: string; id: string }> };
type Row = Record<string, unknown> & { id: string };

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const { collection, id } = await params;
  if (!isCollection(collection)) return bad("Unknown collection", 404);
  const patch = await req.json();
  const item = await mutate((db) => {
    const list = db[collection] as unknown as Row[];
    const row = list.find((x) => x.id === id);
    if (!row) return null;
    Object.assign(row, patch, { id });
    if (collection === "bookings" && patch.status)
      logActivity(db, "crm", `Booking ${row.ref} marked ${patch.status}`);
    else if (collection === "inquiries" && patch.stage)
      logActivity(db, "crm", `Lead "${row.subject}" moved to ${patch.stage}`);
    return row;
  });
  if (!item) return bad("Not found", 404);
  revalidatePath("/", "layout");
  return ok(item);
}

export async function DELETE(_: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const { collection, id } = await params;
  if (!isCollection(collection)) return bad("Unknown collection", 404);
  await mutate((db) => {
    const list = db[collection] as unknown as Row[];
    (db as unknown as Record<string, Row[]>)[collection] = list.filter((x) => x.id !== id);
  });
  revalidatePath("/", "layout");
  return ok({ ok: true });
}
