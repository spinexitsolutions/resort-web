"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const iso = (d: Date) => d.toISOString().slice(0, 10);

export default function BookingBar({ className, dark = true }: { className?: string; dark?: boolean }) {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const [checkIn, setCheckIn] = useState(iso(new Date(today.getTime() + 86400000 * 14)));
  const [checkOut, setCheckOut] = useState(iso(new Date(today.getTime() + 86400000 * 17)));
  const [guests, setGuests] = useState(2);

  const field = cn(
    "flex min-w-0 flex-1 flex-col justify-center rounded-2xl px-4 py-2.5 transition-colors md:rounded-full md:px-6",
    dark ? "hover:bg-white/10" : "hover:bg-ink/5",
  );
  const label = cn("eyebrow text-[0.6rem]", dark ? "text-white/55" : "text-muted");
  const input = "w-full bg-transparent text-[0.95rem] font-medium outline-none [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-60";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/book?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
      }}
      className={cn(
        "grid grid-cols-2 gap-1 rounded-[26px] p-1.5 md:flex md:items-stretch md:rounded-full",
        dark ? "glass-dark text-white ring-1 ring-white/15" : "bg-white text-ink ring-1 ring-line",
        className,
      )}
    >
      <label className={field}>
        <span className={label}>Arrive</span>
        <input type="date" value={checkIn} min={iso(today)} onChange={(e) => { setCheckIn(e.target.value); if (e.target.value >= checkOut) setCheckOut(iso(new Date(new Date(e.target.value).getTime() + 86400000 * 2))); }} className={cn(input, !dark && "[color-scheme:light]")} />
      </label>
      <label className={field}>
        <span className={label}>Depart</span>
        <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} className={cn(input, !dark && "[color-scheme:light]")} />
      </label>
      <div className={cn(field, "col-span-2 flex-row items-center justify-between md:col-span-1 md:flex-col md:items-start")}>
        <span className={label}>Guests</span>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Fewer guests" onClick={() => setGuests((g) => Math.max(1, g - 1))} className={cn("grid h-7 w-7 place-items-center rounded-full ring-1", dark ? "ring-white/25" : "ring-line")}>−</button>
          <span className="w-16 text-center text-[0.95rem] font-medium tabular-nums">{guests} {guests === 1 ? "adult" : "adults"}</span>
          <button type="button" aria-label="More guests" onClick={() => setGuests((g) => Math.min(8, g + 1))} className={cn("grid h-7 w-7 place-items-center rounded-full ring-1", dark ? "ring-white/25" : "ring-line")}>+</button>
        </div>
      </div>
      <button className="group col-span-2 flex h-14 items-center justify-center gap-2 rounded-[20px] bg-accent px-7 font-medium text-ink transition-transform active:scale-[0.98] md:col-span-1 md:h-auto md:rounded-full">
        Check availability
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 8h12M9 3l5 5-5 5" /></svg>
      </button>
    </form>
  );
}
