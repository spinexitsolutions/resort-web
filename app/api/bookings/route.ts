import { getDB, logActivity, mutate, overlapping, uid, upsertGuest } from "@/lib/db";
import { bad, isEmail, ok, str } from "@/lib/api";
import type { Booking } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return bad("Invalid request");
  const name = str(body.name, 120);
  const email = str(body.email, 160);
  const phone = str(body.phone, 40);
  const checkIn = str(body.checkIn, 10);
  const checkOut = str(body.checkOut, 10);
  const adults = Math.max(1, Math.min(10, Number(body.adults) || 1));
  const children = Math.max(0, Math.min(10, Number(body.children) || 0));
  if (!name) return bad("Please tell us your name");
  if (!isEmail(email)) return bad("Please enter a valid email");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut) || checkOut <= checkIn)
    return bad("Please choose valid dates");
  const db = await getDB();
  const room = db.rooms.find((r) => r.id === body.roomId && r.active);
  if (!room) return bad("Room not found");
  if (adults + children > room.guests + 1) return bad(`${room.name} sleeps up to ${room.guests} guests`);

  return mutate((db) => {
    if (room.inventory - overlapping(db, room.id, checkIn, checkOut) <= 0)
      return bad("Sorry — that villa just sold out for these dates", 409);
    const code = str(body.offerCode, 40).toUpperCase();
    const offer = code ? db.offers.find((o) => o.active && o.code.toUpperCase() === code) : undefined;
    const nights = Math.round((+new Date(checkOut) - +new Date(checkIn)) / 86400000);
    const subtotal = room.price * nights;
    const total = Math.round((subtotal - (offer ? (subtotal * offer.discount) / 100 : 0)) * 1.18);
    const guest = upsertGuest(db, { name, email, phone });
    const booking: Booking = {
      id: uid("b"),
      ref: `ARN-${Date.now().toString(36).slice(-5).toUpperCase()}`,
      guestId: guest.id,
      guestName: name,
      email,
      phone,
      roomId: room.id,
      roomName: room.name,
      checkIn,
      checkOut,
      adults,
      children,
      nights,
      total,
      offerCode: offer?.code ?? "",
      status: "pending",
      payment: "unpaid",
      source: "website",
      requests: str(body.requests, 1000),
      createdAt: new Date().toISOString(),
    };
    db.bookings.unshift(booking);
    logActivity(db, "booking", `New website booking ${booking.ref} · ${room.name} · ${name}`);
    return ok({ booking }, 201);
  });
}
