import { getDB } from "@/lib/db";
import { GuestsClient } from "@/components/admin/GuestsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Guests" };

export default async function GuestsPage() {
  const db = await getDB();
  return <GuestsClient guests={db.guests} bookings={db.bookings} inquiries={db.inquiries} />;
}
