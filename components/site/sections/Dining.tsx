"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useState } from "react";
import type { Dining as DiningT } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EXPO, Img, PillButton, SectionLabel, SplitReveal } from "../motion";

export default function Dining({ items }: { items: DiningT[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [open, setOpen] = useState(0);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 150, damping: 20 });
  const y = useSpring(my, { stiffness: 150, damping: 20 });

  return (
    <section id="dining" className="relative bg-paper py-24 md:py-40">
      <div className="container-x grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <SectionLabel index="04">Dining</SectionLabel>
          <SplitReveal text="Four kitchens. One island pantry." className="mt-5 font-display text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.025em]" italicWords={["island", "pantry."]} inlineImage={{ after: 1, src: items[0]?.image ?? "" }} />
          <p className="mt-6 max-w-sm text-muted">Half of what we serve is grown, caught or foraged within a few kilometres of your table.</p>
          <PillButton href="/dining" variant="ghost" className="mt-8">Explore dining</PillButton>
        </div>

        <div
          className="relative md:col-span-8"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            mx.set(e.clientX - r.left);
            my.set(e.clientY - r.top);
          }}
          onPointerLeave={() => setActive(null)}
        >
          {/* floating preview (desktop hover) */}
          <motion.div style={{ x, y }} className="pointer-events-none absolute left-0 top-0 z-10 hidden md:block">
            <AnimatePresence>
              {active !== null && (
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, ease: EXPO }}
                  className="relative -ml-36 -mt-48 h-64 w-72 overflow-hidden rounded-2xl shadow-2xl"
                >
                  <Img src={items[active].image} alt={items[active].name} fill sizes="300px" className="object-cover" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <ul className="border-t border-line">
            {items.map((d, i) => (
              <li key={d.id} className="border-b border-line" onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}>
                <button onClick={() => setOpen(open === i ? -1 : i)} className="group flex w-full items-center gap-5 py-6 text-left md:py-8">
                  <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className={cn("flex-1 font-display text-4xl tracking-tight transition-all duration-500 ease-expo md:text-6xl", active === i && "md:translate-x-3")}>{d.name}</span>
                  <span className="hidden text-right text-sm text-muted sm:block">
                    {d.cuisine}
                    <br />
                    <span className="text-xs">{d.hours}</span>
                  </span>
                  <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full ring-1 ring-line transition-transform duration-500 ease-expo", open === i && "rotate-45 bg-ink text-paper ring-ink")}>+</span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.7, ease: EXPO }} className="overflow-hidden">
                      <div className="grid gap-5 pb-8 sm:grid-cols-[200px_1fr] md:pl-10">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                          <Img src={d.image} alt={d.name} fill sizes="240px" className="object-cover" />
                        </div>
                        <div>
                          <p className="text-[1.0625rem] leading-relaxed">{d.description}</p>
                          <p className="mt-4 text-sm text-muted">
                            <span className="eyebrow mr-2 text-accent">Signature</span>
                            {d.signature}
                          </p>
                          <p className="mt-2 text-sm text-muted sm:hidden">{d.cuisine} · {d.hours}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
