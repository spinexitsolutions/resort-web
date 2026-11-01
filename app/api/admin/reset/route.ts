import { revalidatePath } from "next/cache";
import { resetDB } from "@/lib/db";
import { guard, ok } from "@/lib/api";

export async function POST() {
  const denied = await guard();
  if (denied) return denied;
  await resetDB();
  revalidatePath("/", "layout");
  return ok({ ok: true });
}
