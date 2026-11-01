"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { Room } from "@/lib/types";
import { cn } from "@/lib/utils";
import RoomCard from "./RoomCard";
import { EXPO } from "./motion";

export default function RoomsExplorer({ rooms }: { rooms: Room[] }) {
  const cats = useMemo(() => ["All", ...Array.from(new Set(rooms.map((r) => r.category)))], [rooms]);
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc" | "size">("featured");
  const [guests, setGuests] = useState(1);

  const list = useMemo(() => {
    const l = rooms.filter((r) => (cat === "All" || r.category === cat) && r.guests >= guests);
    return [...l].sort((a, b) =>
      sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : sort === "size" ? b.size - a.size : Number(b.featured) - Number(a.featured),
    );
  }, [rooms, cat, sort, guests]);

  return (
    <div className="container-x py-16 md:py-24">
      <div className="sticky top-3 z-20 -mx-2 mb-10 flex flex-wrap items-center gap-2 rounded-full p-2 md:top-24">
        <div className="glass no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full p-1 ring-1 ring-line">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className="relative shrink-0 rounded-full px-4 py-2 text-sm">
              {cat === c && <motion.span layoutId="room-cat" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.5, ease: EXPO }} />}
              <span className={cn("relative transition-colors", cat === c ? "text-paper" : "text-ink/70")}>{c}</span>
            </button>
          ))}
        </div>
        <div className="glass flex items-center gap-1 rounded-full p-1 text-sm ring-1 ring-line">
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
      </div>

      <motion.div layout className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((r, i) => (
            <motion.div key={r.id} layout initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.8, ease: EXPO, delay: i * 0.05 }}>
              <RoomCard room={r} index={i} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && <p className="py-20 text-center text-muted">No stays match — try fewer guests.</p>}
    </div>
  );
}
