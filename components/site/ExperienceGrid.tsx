"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Experience } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";
import { EXPO, Img, Tilt } from "./motion";

const PANELS = ["bg-accent text-white", "bg-ink text-white", "bg-lagoon text-white", "bg-white text-ink", "bg-[#E9E1D3] text-ink"];

export default function ExperienceGrid({ items }: { items: Experience[] }) {
  const cats = useMemo(() => ["All", ...Array.from(new Set(items.map((e) => e.category)))], [items]);
  const [cat, setCat] = useState("All");
  const list = items.filter((e) => cat === "All" || e.category === cat);

  return (
    <div className="container-x py-14 md:py-20">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 rounded-full bg-white p-1.5 ring-1 ring-line">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className="relative rounded-full px-5 py-2 text-sm font-semibold">
              {cat === c && <motion.span layoutId="exp-cat" className="absolute inset-0 rounded-full bg-accent" transition={{ duration: 0.5, ease: EXPO }} />}
              <span className={cn("relative", cat === c ? "text-white" : "text-ink/60")}>{c}</span>
            </button>
          ))}
        </div>
        <p className="text-sm font-medium text-muted">{list.length} experiences · guided by islanders</p>
      </div>

      <motion.div layout className="grid gap-4 md:grid-cols-2 md:gap-5">
        <AnimatePresence mode="popLayout">
          {list.map((e, i) => {
            const wide = i % 3 === 0;
            const panel = PANELS[i % PANELS.length];
            const light = panel.includes("text-white");
            return (
              <motion.div
                layout
                key={e.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, ease: EXPO, delay: i * 0.05 }}
                className={cn(wide && "md:col-span-2")}
              >
                <Tilt max={4} className="h-full">
                  <article className={cn("group grid h-full overflow-hidden rounded-[30px]", wide ? "md:grid-cols-[1.5fr_1fr]" : "grid-rows-[auto_1fr]")}>
                    <div className={cn("relative overflow-hidden", wide ? "aspect-[4/3] md:aspect-auto md:min-h-[460px]" : "aspect-[4/3]")}>
                      <Img src={e.image} alt={e.title} fill sizes="(min-width:768px) 60vw, 100vw" className="object-cover transition-transform duration-[1.6s] ease-expo group-hover:scale-105" />
                      <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ink">{e.category}</span>
                      <span className="absolute right-4 top-4 rounded-full bg-black/35 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">{e.duration}</span>
                    </div>
                    <div className={cn("flex flex-col justify-between gap-8 p-6 md:p-8", panel)}>
                      <span className={cn("font-display text-7xl leading-[0.8] tracking-[-0.05em]", light ? "text-white/25" : "text-ink/15")}>{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <h3 className="font-display text-[clamp(2.1rem,3.4vw,3.2rem)] leading-[0.9] tracking-[-0.045em]">{e.title}</h3>
                        <p className={cn("mt-3 max-w-md", light ? "text-white/80" : "text-ink/70")}>{e.description}</p>
                        <div className="mt-6 flex items-center justify-between gap-3">
                          <span className="text-sm">
                            from <span className="font-display text-2xl tracking-[-0.03em]">{formatMoney(e.price)}</span>
                          </span>
                          <Link
                            href={`/contact?type=general&subject=${encodeURIComponent(e.title)}`}
                            className={cn("rounded-full px-5 py-2.5 text-sm font-semibold transition-transform active:scale-95", light ? "bg-white text-ink" : "bg-ink text-white")}
                          >
                            Enquire →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                </Tilt>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
