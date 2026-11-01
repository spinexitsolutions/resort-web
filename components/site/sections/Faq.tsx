"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Faq as FaqT } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EXPO, H2, SectionLabel, SplitReveal } from "../motion";

export default function Faq({ items }: { items: FaqT[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  return (
    <section id="faq" className="bg-mist py-24 md:py-36">
      <div className="container-x grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-28">
            <SectionLabel index="11">FAQ</SectionLabel>
            <SplitReveal text="Good questions." className={`mt-6 ${H2}`} italicWords={["questions."]} />
            <p className="mt-6 max-w-xs text-muted">Can&apos;t find yours? Our concierge replies within the hour.</p>
          </div>
        </div>
        <div className="space-y-2 md:col-span-8">
          {items.map((f, i) => {
            const isOpen = open === f.id;
            return (
              <motion.div
                key={f.id}
                layout
                transition={{ layout: { duration: 0.6, ease: EXPO } }}
                className={cn("overflow-hidden rounded-[24px] transition-colors duration-500", isOpen ? "bg-ink text-white" : "bg-white hover:bg-white/70")}
              >
                <motion.button layout="position" onClick={() => setOpen(isOpen ? null : f.id)} aria-expanded={isOpen} className="flex w-full items-center gap-5 p-5 text-left md:p-6">
                  <span className={cn("text-sm font-semibold tabular-nums", isOpen ? "text-accent" : "text-muted")}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 font-display text-[clamp(1.35rem,2.4vw,2rem)] leading-tight tracking-[-0.03em]">{f.question}</span>
                  <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl transition-all duration-500 ease-expo", isOpen ? "rotate-45 bg-accent text-white" : "bg-ink/5")}>+</span>
                </motion.button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.6, ease: EXPO }}>
                      <p className="max-w-2xl px-5 pb-6 leading-relaxed text-white/75 md:pl-[4.25rem] md:pr-6">{f.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
