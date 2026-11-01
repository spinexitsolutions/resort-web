"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Room } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";
import RoomCard from "./RoomCard";
import { EXPO, Img } from "./motion";

export default function RoomsExplorer({ rooms }: { rooms: Room[] }) {
  const cats = useMemo(() => ["All", ...Array.from(new Set(rooms.map((r) => r.category)))], [rooms]);
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc" | "size">("featured");
  const [guests, setGuests] = useState(1);
  const [view, setView] = useState<"grid" | "list">("grid");

  const list = useMemo(() => {
    const l = rooms.filter((r) => (cat === "All" || r.category === cat) && r.guests >= guests);
    return [...l].sort((a, b) =>
      sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : sort === "size" ? b.size - a.size : Number(b.featured) - Number(a.featured),
    );
  }, [rooms, cat, sort, guests]);

  return (
    <div className="container-x py-14 md:py-20">
      {/* toolbar */}
      <div className="sticky top-3 z-30 mb-10 flex flex-wrap items-center gap-2 md:top-24">
        <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full bg-white p-1.5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.3)] ring-1 ring-line">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className="relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold">
              {cat === c && <motion.span layoutId="room-cat" className="absolute inset-0 rounded-full bg-accent" transition={{ duration: 0.5, ease: EXPO }} />}
              <span className={cn("relative transition-colors", cat === c ? "text-white" : "text-ink/60")}>
                {c}
                <span className="ml-1.5 text-xs opacity-60">{c === "All" ? rooms.length : rooms.filter((r) => r.category === c).length}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-full bg-white p-1.5 text-sm font-medium shadow-[0_10px_40px_-20px_rgba(0,0,0,0.3)] ring-1 ring-line">
          <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} aria-label="Guests" className="rounded-full bg-transparent px-3 py-2 outline-none">
            {[1, 2, 3, 4, 5].map((g) => (
              <option key={g} value={g}>{g}+ guests</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort" className="rounded-full bg-transparent px-3 py-2 outline-none">
            <option value="featured">Featured</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
            <option value="size">Largest</option>
          </select>
        </div>
        <div className="ml-auto flex rounded-full bg-ink p-1">
          {(["grid", "list"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} aria-label={`${v} view`} className="relative grid h-9 w-11 place-items-center rounded-full text-white">
              {view === v && <motion.span layoutId="room-view" className="absolute inset-0 rounded-full bg-accent" transition={{ duration: 0.4, ease: EXPO }} />}
              <svg viewBox="0 0 16 16" className="relative h-4 w-4" fill="currentColor">
                {v === "grid" ? <path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" /> : <path d="M2 3h12v2H2zM2 7h12v2H2zM2 11h12v2H2z" />}
              </svg>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "grid" ? (
          <motion.div key="grid" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {list.map((r, i) => (
                <motion.div key={r.id} layout initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.8, ease: EXPO, delay: i * 0.06 }}>
                  <RoomCard room={r} index={i} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.ul key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-t border-ink/15">
            {list.map((r, i) => (
              <motion.li key={r.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EXPO, delay: i * 0.05 }} className="border-b border-ink/15">
                <Link href={`/rooms/${r.slug}`} className="group grid items-center gap-4 py-5 md:grid-cols-[3rem_1fr_220px_auto] md:gap-8">
                  <span className="hidden text-sm font-semibold tabular-nums text-muted md:block">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-display text-[clamp(2.4rem,5.5vw,5rem)] leading-[0.9] tracking-[-0.05em] transition-colors duration-500 group-hover:text-accent">{r.name}</p>
                    <p className="mt-2 flex flex-wrap gap-1.5 text-xs font-semibold">
                      {[r.category, `${r.size} m²`, `${r.guests} guests`, `${r.view} view`].map((t) => (
                        <span key={t} className="rounded-full bg-ink/5 px-2.5 py-1">{t}</span>
                      ))}
                    </p>
                  </div>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl md:aspect-[4/3]">
                    <Img src={r.images[0]} alt={r.name} fill sizes="240px" className="object-cover transition-transform duration-[1.2s] ease-expo group-hover:scale-110" />
                  </div>
                  <div className="flex items-center justify-between gap-4 md:block md:text-right">
                    <p className="font-display text-3xl tracking-[-0.04em]">{formatMoney(r.price)}</p>
                    <p className="text-xs text-muted">per night</p>
                    <span className="mt-2 inline-grid h-11 w-11 place-items-center rounded-full bg-ink text-white transition-colors group-hover:bg-accent">→</span>
                  </div>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      {list.length === 0 && <p className="py-20 text-center text-muted">No stays match — try fewer guests.</p>}
    </div>
  );
}
