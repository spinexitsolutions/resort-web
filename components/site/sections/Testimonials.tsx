"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Testimonial } from "@/lib/types";
import { EXPO, SectionLabel } from "../motion";

export default function Testimonials({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const DURATION = 7000;

  useEffect(() => {
    if (paused || items.length < 2) return;
    const id = setTimeout(() => setI((x) => (x + 1) % items.length), DURATION);
    return () => clearTimeout(id);
  }, [i, paused, items.length]);

  if (!items.length) return null;
  const t = items[i];

  return (
    <section id="testimonials" className="bg-ink py-24 text-paper md:py-40" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      <div className="container-x">
        <div className="flex items-center justify-between">
          <SectionLabel index="09" light>Guest notes</SectionLabel>
          <div className="flex gap-2">
            {["Previous", "Next"].map((label, k) => (
              <button
                key={label}
                aria-label={label}
                onClick={() => setI((x) => (x + (k ? 1 : -1) + items.length) % items.length)}
                className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-white/20 transition-colors hover:bg-paper hover:text-ink"
              >
                <svg viewBox="0 0 16 16" className={`h-3.5 w-3.5 ${k ? "" : "rotate-180"}`} fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 8h12M9 3l5 5-5 5" /></svg>
              </button>
            ))}
          </div>
        </div>

        <motion.div
          className="relative mt-12 min-h-[22rem] md:mt-16 md:min-h-[24rem]"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) setI((x) => (x + 1) % items.length);
            if (info.offset.x > 60) setI((x) => (x - 1 + items.length) % items.length);
          }}
        >
          <AnimatePresence mode="wait">
            <motion.figure key={t.id}>
              <blockquote className="font-display text-[clamp(1.9rem,4.6vw,4.25rem)] leading-[1.08] tracking-[-0.015em]">
                {("“" + t.quote + "”").split(" ").map((w, k) => (
                  <span key={k} className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-bottom">
                    <motion.span
                      className="inline-block"
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      exit={{ y: "-100%", opacity: 0, transition: { duration: 0.4, delay: k * 0.008 } }}
                      transition={{ duration: 0.9, ease: EXPO, delay: k * 0.025 }}
                    >
                      {w}
                    </motion.span>
                  </span>
                )).flatMap((el, k) => (k ? [" ", el] : [el]))}
              </blockquote>
              <motion.figcaption initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.5 } }} exit={{ opacity: 0 }} className="mt-10 flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-accent font-display text-xl text-white">{t.name[0]}</span>
                <span>
                  <span className="block font-medium">{t.name}</span>
                  <span className="text-sm text-paper/55">{t.location} · stayed in {t.stay}</span>
                </span>
                <span className="ml-auto hidden text-accent sm:block">{"★".repeat(t.rating)}</span>
              </motion.figcaption>
            </motion.figure>
          </AnimatePresence>
        </motion.div>

        <div className="mt-10 flex gap-2">
          {items.map((x, k) => (
            <button key={x.id} aria-label={`Show testimonial ${k + 1}`} onClick={() => setI(k)} className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/15">
              {k === i && (
                <motion.span
                  key={`${i}-${paused}`}
                  className="absolute inset-y-0 left-0 bg-paper"
                  initial={{ width: "0%" }}
                  animate={{ width: paused ? "0%" : "100%" }}
                  transition={{ duration: paused ? 0 : DURATION / 1000, ease: "linear" }}
                />
              )}
              {k < i && <span className="absolute inset-0 bg-paper/60" />}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
