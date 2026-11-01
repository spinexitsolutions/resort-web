"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Experience } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";
import { EXPO, Img } from "./motion";

export default function ExperienceGrid({ items }: { items: Experience[] }) {
  const cats = useMemo(() => ["All", ...Array.from(new Set(items.map((e) => e.category)))], [items]);
  const [cat, setCat] = useState("All");
  const list = items.filter((e) => cat === "All" || e.category === cat);
  return (
    <div className="container-x py-16 md:py-24">
      <div className="mb-10 flex gap-1">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className="relative rounded-full px-4 py-2 text-sm">
            {cat === c && <motion.span layoutId="exp-cat" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.5, ease: EXPO }} />}
            <span className={cn("relative", cat === c ? "text-paper" : "text-ink/70")}>{c}</span>
          </button>
        ))}
      </div>
      <motion.div layout className="grid gap-5 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {list.map((e, i) => (
            <motion.article
              layout
              key={e.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.8, ease: EXPO, delay: i * 0.05 }}
              className={cn("group relative overflow-hidden rounded-[28px] text-white", i % 3 === 0 ? "aspect-[4/5] md:col-span-2 md:aspect-[21/9]" : "aspect-[4/5]")}
            >
              <Img src={e.image} alt={e.title} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-[1.6s] ease-expo group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
                <span className="eyebrow text-white/70">{e.category} · {e.duration}</span>
                <h3 className="mt-3 max-w-xl font-display text-4xl leading-none tracking-tight md:text-5xl">{e.title}</h3>
                <div className="mt-4 grid grid-rows-[0fr] transition-[grid-template-rows] duration-700 ease-expo group-hover:grid-rows-[1fr] max-md:grid-rows-[1fr]">
                  <div className="overflow-hidden">
                    <p className="max-w-md text-white/80">{e.description}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm">from {formatMoney(e.price)}</span>
                  <Link href={`/contact?type=general&subject=${encodeURIComponent(e.title)}`} className="rounded-full bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-accent">
                    Enquire
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
