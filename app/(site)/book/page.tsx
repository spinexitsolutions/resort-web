import type { Metadata } from "next";
import BookingFlow from "@/components/site/BookingFlow";

export const metadata: Metadata = { title: "Reserve" };

type SP = Promise<{ checkIn?: string; checkOut?: string; guests?: string; room?: string; code?: string }>;

export default async function Page({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const valid = (d?: string) => (d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : undefined);
  return (
    <BookingFlow
      checkIn={valid(sp.checkIn)}
      checkOut={valid(sp.checkOut)}
      guests={sp.guests ? Math.max(1, Math.min(8, Number(sp.guests) || 2)) : undefined}
      room={sp.room}
      code={sp.code}
    />
  );
}
