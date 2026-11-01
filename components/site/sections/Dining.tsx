"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useState } from "react";
import type { Dining as DiningT } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EXPO, H2, Img, PillButton, SectionLabel, SplitReveal } from "../motion";

export default function Dining({ items }: { items: DiningT[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [open, setOpen] = useState<number>(-1);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 160, damping: 20 });
  const y = useSpring(my, { stiffness: 160, damping: 20 });

  return (
    <section id="dining" className="relative bg-paper py-24 md:py-36">
      <div className="container-x flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <SectionLabel index="04">Dining</SectionLabel>
          <SplitReveal text="Four kitchens. One island pantry." className={`mt-6 max-w-[13ch] ${H2}`} italicWords={["island", "pantry."]} inlineImage={{ after: 1, src: items[0]?.image ?? "" }} />
        </div>
        <div className="max-w-xs">
          <p className="text-muted">Half of what we serve is grown, caught or foraged within a few kilometres of your table.</p>
          <PillButton href="/dining" variant="ink" className="mt-6">Explore dining</PillButton>
        </div>
      </div>

      <div
        className="relative mt-14 md:mt-20"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set(e.clientX - r.left);
          my.set(e.clientY - r.top);
        }}
        onPointerLeave={() => setHover(null)}
      >
        <motion.div style={{ x, y }} className="pointer-events-none absolute left-0 top-0 z-20 hidden md:block">
          <AnimatePresence>
            {hover !== null && open !== hover && (
              <motion.div
                key={hover}
                initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: 4 }}
                exit={{ opacity: 0, scale: 0.7, rotate: 0 }}
                transition={{ duration: 0.5, ease: EXPO }}
                className="relative -ml-40 -mt-56 h-72 w-60 overflow-hidden rounded-[22px] shadow-2xl ring-4 ring-white"
              >
                <Img src={items[hover].image} alt={items[hover].name} fill sizes="260px" className="object-cover" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <ul className="border-t border-ink/15">
          {items.map((d, i) => {
            const isOpen = open === i;
            const active = hover === i || isOpen;
            return (
              <li key={d.id} className="relative overflow-hidden border-b border-ink/15" onPointerEnter={(e) => e.pointerType === "mouse" && setHover(i)}>
                {/* coral sweep */}
                <motion.span
                  aria-hidden
                  className="absolute inset-0 origin-bottom bg-accent"
                  initial={false}
                  animate={{ scaleY: active ? 1 : 0 }}
                  transition={{ duration: 0.6, ease: EXPO }}
                />
                <button onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} className="container-x relative flex w-full items-center gap-4 py-5 text-left md:gap-8 md:py-6">
                  <span className={cn("w-8 text-sm font-semibold tabular-nums transition-colors", active ? "text-white/70" : "text-muted")}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={cn("flex-1 font-display text-[clamp(2.6rem,8vw,7.5rem)] leading-[0.9] tracking-[-0.05em] transition-colors duration-500", active ? "text-white" : "text-ink")}>
                    {d.name}
                  </span>
                  <span className={cn("hidden text-right text-sm transition-colors sm:block", active ? "text-white/85" : "text-muted")}>
                    {d.cuisine}
                    <br />
                    {d.hours}
                  </span>
                  <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full text-xl transition-all duration-500 ease-expo", active ? "bg-white text-accent" : "bg-ink text-white", isOpen && "rotate-45")}>+</span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.7, ease: EXPO }} className="relative overflow-hidden">
                      <div className="container-x grid gap-6 pb-8 text-white sm:grid-cols-[260px_1fr] md:pl-[5.5rem]">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                          <Img src={d.image} alt={d.name} fill sizes="280px" className="object-cover" />
                        </div>
                        <div className="max-w-xl">
                          <p className="text-lg leading-relaxed">{d.description}</p>
                          <p className="mt-5 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm">Signature · {d.signature}</p>
                          <p className="mt-3 text-sm text-white/80 sm:hidden">{d.cuisine} · {d.hours}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
