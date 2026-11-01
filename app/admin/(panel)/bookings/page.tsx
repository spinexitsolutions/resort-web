import { getDB } from "@/lib/db";
import { BookingsClient } from "@/components/admin/BookingsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bookings" };

export default async function BookingsPage() {
  const db = await getDB();
  return <BookingsClient bookings={db.bookings} rooms={db.rooms} guests={db.guests} />;
}
