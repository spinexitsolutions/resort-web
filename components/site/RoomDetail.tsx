"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Room } from "@/lib/types";
import { cn, formatMoney, nightsBetween } from "@/lib/utils";
import RoomCard from "./RoomCard";
import { EXPO, Img, Reveal, SplitReveal } from "./motion";

const iso = (d: Date) => d.toISOString().slice(0, 10);

export default function RoomDetail({ room, others, checkIn: ci, checkOut: co }: { room: Room; others: Room[]; checkIn: string; checkOut: string }) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const router = useRouter();
  const today = useMemo(() => iso(new Date()), []);
  const [checkIn, setCheckIn] = useState(ci);
  const [checkOut, setCheckOut] = useState(co);
  const [guests, setGuests] = useState(Math.min(2, room.guests));
  const nights = nightsBetween(checkIn, checkOut);
  const subtotal = nights * room.price;

  const go = (d: number) => {
    setDir(d);
    setIdx((i) => (i + d + room.images.length) % room.images.length);
  };

  return (
    <article className="bg-paper pb-24 pt-20 md:pt-28">
      <div className="container-x">
        <nav className="eyebrow mb-6 flex gap-2 text-muted">
          <Link href="/rooms" className="hover:text-ink">Stay</Link>
          <span>/</span>
          <span className="text-ink">{room.category}</span>
        </nav>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SplitReveal as="h1" text={room.name} delay={0.3} className="max-w-[14ch] font-display text-[clamp(2.8rem,8vw,7rem)] leading-[0.92] tracking-[-0.03em]" />
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="font-display text-2xl italic text-accent md:text-3xl">
            {room.tagline}
          </motion.p>
        </div>
      </div>

      {/* Gallery */}
      <div className="container-x mt-10">
        <motion.div
          initial={{ clipPath: "inset(20% 8% 0% 8% round 28px)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0% round 28px)" }}
          transition={{ duration: 1.4, ease: EXPO, delay: 0.4 }}
          className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-ink sm:aspect-[16/9]"
        >
          <AnimatePresence initial={false} custom={dir}>
            <motion.div
              key={idx}
              custom={dir}
              initial={{ clipPath: dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0 0 0%)" }}
              exit={{ opacity: 0.4, scale: 1.04, transition: { duration: 1 } }}
              transition={{ duration: 1, ease: EXPO }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, i) => (i.offset.x < -50 ? go(1) : i.offset.x > 50 ? go(-1) : null)}
              className="absolute inset-0"
            >
              <Img src={room.images[idx]} alt={`${room.name} ${idx + 1}`} fill priority sizes="100vw" className="pointer-events-none object-cover" />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 md:p-6">
            <span className="glass rounded-full px-3 py-1.5 font-mono text-xs">
              {String(idx + 1).padStart(2, "0")} / {String(room.images.length).padStart(2, "0")}
            </span>
            <div className="flex gap-2">
              {[-1, 1].map((d) => (
                <button key={d} aria-label={d < 0 ? "Previous photo" : "Next photo"} onClick={() => go(d)} className="glass grid h-11 w-11 place-items-center rounded-full transition-transform active:scale-90">
                  <svg viewBox="0 0 16 16" className={cn("h-3.5 w-3.5", d < 0 && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 8h12M9 3l5 5-5 5" /></svg>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto">
          {room.images.map((src, i) => (
            <button key={src + i} onClick={() => { setDir(i > idx ? 1 : -1); setIdx(i); }} className={cn("relative h-16 w-24 shrink-0 overflow-hidden rounded-xl transition-opacity", i === idx ? "opacity-100 ring-2 ring-ink ring-offset-2 ring-offset-paper" : "opacity-50 hover:opacity-80")}>
              <Img src={src} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="container-x mt-16 grid gap-14 md:mt-24 md:grid-cols-12">
        <div className="md:col-span-7">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line ring-1 ring-line sm:grid-cols-4">
            {[
              ["Size", `${room.size} m²`],
              ["Sleeps", `${room.guests} guests`],
              ["Beds", room.beds],
              ["View", room.view],
            ].map(([k, v]) => (
              <div key={k} className="bg-paper p-5">
                <p className="eyebrow text-muted">{k}</p>
                <p className="mt-2 font-medium">{v}</p>
              </div>
            ))}
          </div>
          <Reveal>
            <p className="mt-12 font-display text-3xl leading-snug tracking-tight md:text-4xl">{room.description}</p>
          </Reveal>
          <h2 className="eyebrow mt-14 text-muted">In your {room.category.toLowerCase()}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {room.amenities.map((a, i) => (
              <Reveal key={a} delay={i * 0.04} y={16}>
                <li className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 ring-1 ring-line">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/15 text-accent">✦</span>
                  {a}
                </li>
              </Reveal>
            ))}
          </ul>
          <div className="mt-14 rounded-2xl bg-mist p-6 text-sm leading-relaxed text-muted">
            <p className="font-medium text-ink">Every stay includes</p>
            <p className="mt-2">Daily breakfast at Banyan Café · Return jetty transfers · Butler service · Welcome ritual · Non-motorised water sports · Wi-Fi throughout</p>
          </div>
        </div>

        <aside className="md:col-span-5">
          <div className="sticky top-28 rounded-[28px] bg-white p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] ring-1 ring-line md:p-8">
            <p className="text-sm text-muted">From</p>
            <p className="font-display text-5xl tracking-tight">
              {formatMoney(room.price)} <span className="font-sans text-base text-muted">/ night</span>
            </p>
            <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl ring-1 ring-line">
              <label className="border-r border-line p-3">
                <span className="eyebrow block text-[0.6rem] text-muted">Arrive</span>
                <input type="date" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-transparent font-medium outline-none" />
              </label>
              <label className="p-3">
                <span className="eyebrow block text-[0.6rem] text-muted">Depart</span>
                <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-transparent font-medium outline-none" />
              </label>
              <label className="col-span-2 border-t border-line p-3">
                <span className="eyebrow block text-[0.6rem] text-muted">Guests</span>
                <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full bg-transparent font-medium outline-none">
                  {Array.from({ length: room.guests }, (_, i) => i + 1).map((g) => (
                    <option key={g} value={g}>{g} {g === 1 ? "adult" : "adults"}</option>
                  ))}
                </select>
              </label>
            </div>
            {nights > 0 && (
              <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between text-muted"><span>{formatMoney(room.price)} × {nights} nights</span><span>{formatMoney(subtotal)}</span></div>
                <div className="flex justify-between text-muted"><span>Taxes (18%)</span><span>{formatMoney(subtotal * 0.18)}</span></div>
                <div className="flex justify-between border-t border-line pt-2 font-medium"><span>Total</span><span>{formatMoney(subtotal * 1.18)}</span></div>
              </div>
            )}
            <button
              onClick={() => router.push(`/book?room=${room.slug}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)}
              disabled={nights <= 0}
              className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-ink font-medium text-paper transition-colors hover:bg-lagoon disabled:opacity-40"
            >
              Reserve this {room.category.toLowerCase()}
            </button>
            <p className="mt-3 text-center text-xs text-muted">Free cancellation up to 14 days before arrival</p>
          </div>
        </aside>
      </div>

      {others.length > 0 && (
        <div className="container-x mt-28">
          <h2 className="font-display text-4xl tracking-tight md:text-5xl">You might also love</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((r) => (
              <RoomCard key={r.id} room={r} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
