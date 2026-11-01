import { getDB, overlapping } from "@/lib/db";
import { bad, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const checkIn = url.searchParams.get("checkIn") ?? "";
  const checkOut = url.searchParams.get("checkOut") ?? "";
  const guests = Number(url.searchParams.get("guests") ?? 1);
  const code = (url.searchParams.get("code") ?? "").toUpperCase();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut) || checkOut <= checkIn)
    return bad("Please choose valid dates");
  const db = await getDB();
  const nights = Math.round((+new Date(checkOut) - +new Date(checkIn)) / 86400000);
  const offer = code ? db.offers.find((o) => o.active && o.code.toUpperCase() === code) : undefined;
  const rooms = db.rooms
    .filter((r) => r.active)
    .map((r) => {
      const left = r.inventory - overlapping(db, r.id, checkIn, checkOut);
      const subtotal = r.price * nights;
      const discount = offer ? Math.round((subtotal * offer.discount) / 100) : 0;
      return {
        id: r.id, slug: r.slug, name: r.name, image: r.images[0], price: r.price, guests: r.guests,
        left: Math.max(0, left), fits: r.guests >= guests, nights, subtotal, discount,
        taxes: Math.round((subtotal - discount) * 0.18), total: Math.round((subtotal - discount) * 1.18),
      };
    });
  return ok({ nights, offer: offer ? { code: offer.code, title: offer.title, discount: offer.discount } : null, invalidCode: !!code && !offer, rooms });
}
