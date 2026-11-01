"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import type { SiteSettings, Venue } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EXPO, H2, Img, PillButton, SectionLabel, SplitReveal } from "../motion";

export default function Events({ events, venues }: { events: SiteSettings["events"]; venues: Venue[] }) {
  const ref = useRef<HTMLElement>(null);
  const [v, setV] = useState(-1);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const width = useTransform(scrollYProgress, [0, 1], ["86%", "100%"]);
  const radius = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const img = v >= 0 ? venues[v]?.image : events.image;

  return (
    <section ref={ref} id="events" className="bg-paper">
      <div className="flex justify-center">
      <motion.div style={{ width, borderRadius: radius }} className="relative min-h-svh overflow-hidden bg-ink text-white md:h-svh md:min-h-[640px]">
        <AnimatePresence initial={false}>
          <motion.div key={img} initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1, ease: EXPO }} className="absolute inset-0">
            <Img src={img} alt={events.heading} fill sizes="100vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/30" />

        <div className="container-x relative flex min-h-svh flex-col justify-between gap-10 pb-8 pt-24 md:h-full md:min-h-0 md:pb-12 md:pt-32">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <SectionLabel index="08" light>{events.eyebrow}</SectionLabel>
              <SplitReveal text={events.heading} className={`mt-6 max-w-[13ch] ${H2}`} italicWords={["sand"]} />
            </div>
            <div className="max-w-sm md:pt-14">
              <p className="text-white/85">{events.body}</p>
              <PillButton href="/contact?type=wedding" variant="accent" className="mt-6">Plan your celebration</PillButton>
            </div>
          </div>

          {/* venues — hover swaps the background */}
          <div className="grid border-t border-white/20 sm:grid-cols-3">
            {venues.map((ven, i) => (
              <button
                key={ven.id}
                onPointerEnter={() => setV(i)}
                onPointerLeave={() => setV(-1)}
                onClick={() => setV(v === i ? -1 : i)}
                className={cn("group relative border-white/20 py-4 text-left transition-colors sm:border-l sm:px-5 sm:first:border-l-0 sm:first:pl-0", "border-b sm:border-b-0")}
              >
                <span className="flex items-baseline gap-2">
                  <span className={cn("font-display text-[clamp(3rem,6vw,5.5rem)] leading-none tracking-[-0.05em] transition-colors duration-500", v === i ? "text-accent" : "text-white")}>{ven.capacity}</span>
                  <span className="text-sm text-white/60">guests</span>
                </span>
                <span className="mt-1 block font-semibold">{ven.name}</span>
                <span className="block text-sm text-white/60">{ven.description}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
      </div>
    </section>
  );
}
