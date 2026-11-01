import { logActivity, mutate, uid, upsertGuest } from "@/lib/db";
import { bad, isEmail, ok, str } from "@/lib/api";
import type { Inquiry } from "@/lib/types";

const TYPES: Inquiry["type"][] = ["general", "wedding", "corporate", "spa", "dining", "stay"];

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return bad("Invalid request");
  const name = str(body.name, 120);
  const email = str(body.email, 160);
  const message = str(body.message, 4000);
  if (!name) return bad("Please tell us your name");
  if (!isEmail(email)) return bad("Please enter a valid email");
  if (message.length < 5) return bad("Please add a short message");
  const type = TYPES.includes(body.type) ? (body.type as Inquiry["type"]) : "general";
  return mutate((db) => {
    const guest = upsertGuest(db, { name, email, phone: str(body.phone, 40) });
    const inquiry: Inquiry = {
      id: uid("q"),
      guestId: guest.id,
      name,
      email,
      phone: str(body.phone, 40),
      type,
      subject: str(body.subject, 200) || `${type[0].toUpperCase()}${type.slice(1)} enquiry`,
      message,
      stage: "new",
      value: 0,
      assignee: "",
      notes: [],
      createdAt: new Date().toISOString(),
    };
    db.inquiries.unshift(inquiry);
    logActivity(db, "inquiry", `New ${type} enquiry from ${name}`);
    return ok({ ok: true }, 201);
  });
}
