"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Room } from "@/lib/types";
import { cn, formatMoney, nightsBetween } from "@/lib/utils";
import RoomCard from "./RoomCard";
import { EXPO, H2, Img, Reveal, ScrollText, SectionLabel } from "./motion";

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

  const hero = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const radius = useTransform(scrollYProgress, [0, 1], [28, 56]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);

  const go = (d: number) => {
    setDir(d);
    setIdx((i) => (i + d + room.images.length) % room.images.length);
  };
  // auto-advance the gallery
  useEffect(() => {
    if (room.images.length < 2) return;
    const t = setTimeout(() => go(1), 6000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const specs = [
    { v: String(room.size), u: "m²", l: "Living space" },
    { v: String(room.guests), u: "guests", l: "Sleeps up to" },
    { v: room.beds.split(" ")[0], u: room.beds.split(" ").slice(1).join(" "), l: "Beds" },
    { v: room.view, u: "", l: "View" },
  ];

  return (
    <article className="bg-paper">
      {/* gallery hero */}
      <section ref={hero} className="p-2 md:p-3">
        <motion.div
          style={{ scale, borderRadius: radius }}
          initial={{ clipPath: "inset(6% 6% 6% 6% round 48px)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }}
          transition={{ duration: 1.4, ease: EXPO, delay: 0.15 }}
          className="relative h-[92svh] min-h-[600px] origin-top overflow-hidden bg-ink text-white"
        >
          <AnimatePresence initial={false} custom={dir}>
            <motion.div
              key={idx}
              initial={{ clipPath: dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)", scale: 1.15 }}
              animate={{ clipPath: "inset(0 0 0 0%)", scale: 1 }}
              exit={{ opacity: 0.5, transition: { duration: 1.1 } }}
              transition={{ duration: 1.2, ease: EXPO }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, i) => (i.offset.x < -50 ? go(1) : i.offset.x > 50 ? go(-1) : null)}
              className="absolute inset-0"
            >
              <Img src={room.images[idx]} alt={`${room.name} ${idx + 1}`} fill priority sizes="100vw" className="pointer-events-none object-cover" />
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40" />

          <motion.div style={{ y: textY }} className="container-x pointer-events-none relative flex h-full flex-col justify-between pb-6 pt-24 md:pb-10 md:pt-32">
            <div className="pointer-events-auto flex flex-wrap items-center gap-2 text-sm">
              <Link href="/rooms" className="rounded-full bg-white/15 px-3 py-1.5 font-medium backdrop-blur-md hover:bg-white/25">← All stays</Link>
              <span className="rounded-full bg-accent px-3 py-1.5 font-semibold">{room.category}</span>
              <span className="rounded-full bg-white px-3 py-1.5 font-semibold text-ink">{formatMoney(room.price)}<span className="font-normal text-muted"> / night</span></span>
            </div>

            <div className="grid items-end gap-6 lg:grid-cols-[1fr_auto]">
              <div>
                <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EXPO, delay: 0.7 }} className="text-lg font-semibold text-accent">
                  {room.tagline}
                </motion.p>
                <h1 className="mt-2 max-w-[11ch] font-display text-[clamp(3.4rem,10vw,10rem)] leading-[0.82] tracking-[-0.055em]">
                  {room.name
                    .split(" ")
                    .map((w, i) => (
                      <span key={i} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
                        <motion.span initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 1.2, ease: EXPO, delay: 0.45 + i * 0.07 }} className="inline-block">
                          {w}
                        </motion.span>
                      </span>
                    ))
                    .flatMap((el, i) => (i ? [" ", el] : [el]))}
                </h1>
              </div>
              {/* thumbnails + controls */}
              <div className="pointer-events-auto flex items-center gap-2">
                {room.images.map((src, i) => (
                  <button
                    key={src + i}
                    onClick={() => {
                      setDir(i > idx ? 1 : -1);
                      setIdx(i);
                    }}
                    aria-label={`Photo ${i + 1}`}
                    className={cn("relative h-14 w-14 overflow-hidden rounded-2xl transition-all duration-500 ease-expo md:h-16 md:w-20", i === idx ? "ring-2 ring-accent ring-offset-2 ring-offset-black/0" : "opacity-60 hover:opacity-100")}
                  >
                    <Img src={src} alt="" fill sizes="80px" className="object-cover" />
                    {i === idx && (
                      <motion.span key={idx} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 6, ease: "linear" }} className="absolute inset-x-0 bottom-0 h-1 origin-left bg-accent" />
                    )}
                  </button>
                ))}
                <div className="ml-2 flex gap-1.5">
                  {[-1, 1].map((d) => (
                    <button key={d} aria-label={d < 0 ? "Previous photo" : "Next photo"} onClick={() => go(d)} className="grid h-12 w-12 place-items-center rounded-full bg-white text-ink transition-transform hover:bg-accent hover:text-white active:scale-90">
                      <svg viewBox="0 0 16 16" className={cn("h-4 w-4", d < 0 && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 8h12M9 3l5 5-5 5" /></svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* specs band */}
      <section className="container-x">
        <div className="grid grid-cols-2 border-b border-ink/15 md:grid-cols-4">
          {specs.map((s, i) => (
            <Reveal key={s.l} delay={i * 0.07} y={24}>
              <div className={cn("border-ink/15 py-8 md:px-6", i % 2 === 1 && "border-l pl-5 md:pl-6", i >= 2 && "border-t md:border-t-0", i === 2 && "md:border-l", i === 0 && "md:pl-0")}>
                <p className="text-sm font-medium text-muted">{s.l}</p>
                <p className="mt-2 font-display text-[clamp(2.6rem,5vw,4.5rem)] leading-none tracking-[-0.05em]">
                  {s.v}
                  {s.u && <span className="ml-1.5 text-[0.4em] tracking-[-0.02em] text-accent">{s.u}</span>}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* body + booking */}
      <section className="container-x grid gap-14 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-7">
          <SectionLabel index="✦">About this {room.category.toLowerCase()}</SectionLabel>
          <ScrollText text={room.description} className="mt-8 font-display text-[clamp(1.9rem,3.4vw,3.1rem)] leading-[1.02] tracking-[-0.035em]" />

          <h2 className="mt-16 text-sm font-semibold uppercase tracking-wider text-muted">In your {room.category.toLowerCase()}</h2>
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {room.amenities.map((a, i) => (
              <Reveal key={a} delay={i * 0.04} y={16}>
                <li className="group flex items-center gap-3 rounded-[20px] bg-white px-4 py-4 font-medium ring-1 ring-line transition-colors duration-500 hover:bg-ink hover:text-white">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-white">
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 8.5l3 3 7-7" /></svg>
                  </span>
                  {a}
                </li>
              </Reveal>
            ))}
          </ul>

          <Reveal>
            <div className="mt-12 rounded-[28px] bg-accent p-7 text-white md:p-9">
              <p className="font-display text-4xl leading-none tracking-[-0.04em]">Every stay includes</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Daily breakfast", "Jetty transfers", "Butler service", "Welcome ritual", "Kayaks & SUPs", "Wi-Fi throughout"].map((t) => (
                  <span key={t} className="rounded-full bg-white/15 px-3.5 py-2 text-sm font-medium">{t}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <aside className="md:col-span-5">
          <div className="sticky top-28 overflow-hidden rounded-[32px] bg-ink p-6 text-white shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)] md:p-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-white/60">From</p>
                <p className="font-display text-6xl leading-none tracking-[-0.05em]">{formatMoney(room.price)}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">per night</span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <label className="rounded-2xl bg-white/[0.07] p-3.5 ring-1 ring-white/10 focus-within:ring-accent">
                <span className="block text-[0.68rem] font-semibold uppercase tracking-wider text-white/50">Arrive</span>
                <input type="date" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-transparent font-semibold outline-none [color-scheme:dark]" />
              </label>
              <label className="rounded-2xl bg-white/[0.07] p-3.5 ring-1 ring-white/10 focus-within:ring-accent">
                <span className="block text-[0.68rem] font-semibold uppercase tracking-wider text-white/50">Depart</span>
                <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-transparent font-semibold outline-none [color-scheme:dark]" />
              </label>
              <div className="col-span-2 flex items-center justify-between rounded-2xl bg-white/[0.07] p-3.5 ring-1 ring-white/10">
                <span className="text-[0.68rem] font-semibold uppercase tracking-wider text-white/50">Guests</span>
                <div className="flex items-center gap-3">
                  <button type="button" aria-label="Fewer guests" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-accent">−</button>
                  <span className="w-6 text-center font-semibold tabular-nums">{guests}</span>
                  <button type="button" aria-label="More guests" onClick={() => setGuests((g) => Math.min(room.guests, g + 1))} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-accent">+</button>
                </div>
              </div>
            </div>
            <AnimatePresence>
              {nights > 0 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-5 space-y-2 text-sm">
                    <div className="flex justify-between text-white/65"><span>{formatMoney(room.price)} × {nights} nights</span><span>{formatMoney(subtotal)}</span></div>
                    <div className="flex justify-between text-white/65"><span>Taxes (18%)</span><span>{formatMoney(subtotal * 0.18)}</span></div>
                    <div className="flex items-baseline justify-between border-t border-white/10 pt-3"><span className="font-semibold">Total</span><span className="font-display text-3xl tracking-[-0.04em]">{formatMoney(subtotal * 1.18)}</span></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => router.push(`/book?room=${room.slug}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)}
              disabled={nights <= 0}
              className="group mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-40"
            >
              Reserve this {room.category.toLowerCase()}
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 8h12M9 3l5 5-5 5" /></svg>
            </button>
            <p className="mt-3 text-center text-xs text-white/50">No payment now · Free cancellation up to 14 days before arrival</p>
          </div>
        </aside>
      </section>

      {others.length > 0 && (
        <section className="bg-mist py-20 md:py-28">
          <div className="container-x flex items-end justify-between gap-6">
            <h2 className={H2}>
              You might <span className="text-accent">also love</span>
            </h2>
            <Link href="/rooms" className="hidden h-12 shrink-0 items-center rounded-full bg-ink px-6 font-semibold text-white md:inline-flex">All stays</Link>
          </div>
          <div className="no-scrollbar mt-10 flex snap-x gap-4 overflow-x-auto px-5 md:mx-auto md:grid md:max-w-[1440px] md:grid-cols-3 md:overflow-visible md:px-10">
            {others.map((r) => (
              <RoomCard key={r.id} room={r} className="w-[78vw] shrink-0 snap-center md:w-auto" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
