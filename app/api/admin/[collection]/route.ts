import { revalidatePath } from "next/cache";
import { getDB, isCollection, logActivity, mutate, uid } from "@/lib/db";
import { bad, guard, ok } from "@/lib/api";

type Ctx = { params: Promise<{ collection: string }> };

export async function GET(_: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const { collection } = await params;
  if (!isCollection(collection)) return bad("Unknown collection", 404);
  return ok((await getDB())[collection]);
}

export async function POST(req: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const { collection } = await params;
  if (!isCollection(collection)) return bad("Unknown collection", 404);
  const body = await req.json();
  const item = await mutate((db) => {
    const record = { ...body, id: uid(collection[0]), createdAt: body.createdAt ?? new Date().toISOString() };
    (db[collection] as unknown as Record<string, unknown>[]).unshift(record);
    logActivity(db, ["bookings", "inquiries", "guests"].includes(collection) ? "crm" : "cms", `Created ${collection.replace(/s$/, "")}: ${record.name ?? record.title ?? record.guestName ?? record.question ?? record.caption ?? record.email ?? record.id}`);
    return record;
  });
  revalidatePath("/", "layout");
  return ok(item, 201);
}

/** Bulk replace — used for re-ordering lists. */
export async function PUT(req: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const { collection } = await params;
  if (!isCollection(collection)) return bad("Unknown collection", 404);
  const body = await req.json();
  if (!Array.isArray(body)) return bad("Expected an array");
  await mutate((db) => {
    (db as unknown as Record<string, unknown>)[collection] = body;
  });
  revalidatePath("/", "layout");
  return ok(body);
}
