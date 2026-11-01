"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { GalleryItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EXPO, Img } from "./motion";
import { useLenis } from "./SmoothScroll";

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const cats = useMemo(() => ["All", ...Array.from(new Set(items.map((g) => g.category)))], [items]);
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const lenis = useLenis();
  const list = items.filter((g) => cat === "All" || g.category === cat);

  useEffect(() => {
    if (open === null) {
      lenis?.start();
      return;
    }
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((o) => (o === null ? o : (o + 1) % list.length));
      if (e.key === "ArrowLeft") setOpen((o) => (o === null ? o : (o - 1 + list.length) % list.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, list.length, lenis]);

  return (
    <div className="container-x py-16 md:py-24">
      <div className="no-scrollbar mb-10 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-white p-1.5 ring-1 ring-line">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className="relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold">
            {cat === c && <motion.span layoutId="gal-cat" className="absolute inset-0 rounded-full bg-accent" transition={{ duration: 0.5, ease: EXPO }} />}
            <span className={cn("relative", cat === c ? "text-white" : "text-ink/60")}>{c}</span>
          </button>
        ))}
      </div>

      <div className="columns-2 gap-3 md:columns-3 md:gap-5">
        {list.map((g, i) => (
          <motion.button
            key={g.id}
            layoutId={`gal-${g.id}`}
            onClick={() => setOpen(i)}
            data-cursor="Open"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EXPO, delay: (i % 3) * 0.06 }}
            className={cn("group relative mb-3 block w-full overflow-hidden rounded-[24px] md:mb-5", i % 4 === 0 ? "aspect-[3/4]" : i % 4 === 2 ? "aspect-square" : "aspect-[4/3]")}
          >
            <Img src={g.src} alt={g.caption} fill sizes="(min-width:768px) 33vw, 50vw" className="object-cover transition-transform duration-[1.2s] ease-expo group-hover:scale-105" />
            <span className="absolute bottom-3 left-3 translate-y-[150%] rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ink transition-transform duration-500 ease-expo group-hover:translate-y-0">
              {g.caption}
            </span>
            <span className="absolute right-3 top-3 grid h-9 w-9 scale-0 place-items-center rounded-full bg-accent text-white transition-transform duration-500 ease-expo group-hover:scale-100">+</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && list[open] && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[95] flex flex-col bg-ink/95 p-4 backdrop-blur-xl md:p-10" onClick={() => setOpen(null)}>
            <div className="flex items-center justify-between text-paper">
              <span className="font-display text-4xl tracking-[-0.04em]"><span className="text-accent">{String(open + 1).padStart(2, "0")}</span><span className="text-white/40"> / {String(list.length).padStart(2, "0")}</span></span>
              <button aria-label="Close" className="grid h-12 w-12 place-items-center rounded-full bg-accent text-white">✕</button>
            </div>
            <motion.div
              layoutId={`gal-${list[open].id}`}
              className="relative mx-auto my-4 w-full max-w-6xl flex-1 overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) setOpen((o) => (o! + 1) % list.length);
                if (info.offset.x > 60) setOpen((o) => (o! - 1 + list.length) % list.length);
              }}
            >
              <Img src={list[open].src} alt={list[open].caption} fill sizes="100vw" className="pointer-events-none object-contain" />
            </motion.div>
            <div className="flex items-center justify-between text-paper" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setOpen((o) => (o! - 1 + list.length) % list.length)} className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold hover:bg-accent">← Prev</button>
              <p className="font-display text-2xl tracking-[-0.03em]">{list[open].caption}</p>
              <button onClick={() => setOpen((o) => (o! + 1) % list.length)} className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold hover:bg-accent">Next →</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
