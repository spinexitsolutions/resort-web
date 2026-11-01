"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Faq as FaqT } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EXPO, SectionLabel, SplitReveal } from "../motion";

export default function Faq({ items }: { items: FaqT[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  return (
    <section id="faq" className="bg-mist py-24 md:py-36">
      <div className="container-x grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <SectionLabel index="11">FAQ</SectionLabel>
          <SplitReveal text="Good questions." className="mt-5 font-display text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.025em]" italicWords={["questions."]} />
        </div>
        <div className="md:col-span-8">
          {items.map((f) => {
            const isOpen = open === f.id;
            return (
              <div key={f.id} className="border-b border-line">
                <button onClick={() => setOpen(isOpen ? null : f.id)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-6 py-6 text-left">
                  <span className="text-lg font-medium tracking-tight md:text-xl">{f.question}</span>
                  <span className={cn("relative h-4 w-4 shrink-0 transition-transform duration-500 ease-expo", isOpen && "rotate-180")}>
                    <span className="absolute left-0 top-1/2 h-px w-4 bg-ink" />
                    <span className={cn("absolute left-1/2 top-0 h-4 w-px bg-ink transition-transform duration-500 ease-expo", isOpen && "scale-y-0")} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.6, ease: EXPO }} className="overflow-hidden">
                      <p className="max-w-2xl pb-7 leading-relaxed text-muted">{f.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
