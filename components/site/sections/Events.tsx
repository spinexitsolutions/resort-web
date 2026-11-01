"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { SiteSettings, Venue } from "@/lib/types";
import { Img, PillButton, Reveal, SectionLabel, SplitReveal } from "../motion";

export default function Events({ events, venues }: { events: SiteSettings["events"]; venues: Venue[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const width = useTransform(scrollYProgress, [0, 1], ["82%", "100%"]);
  const radius = useTransform(scrollYProgress, [0, 1], [40, 0]);

  return (
    <section ref={ref} id="events" className="bg-paper">
      <div className="flex justify-center">
        <motion.div style={{ width, borderRadius: radius }} className="relative h-[92svh] min-h-[560px] overflow-hidden">
          <Img src={events.image} alt={events.heading} fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/20" />
          <div className="container-x absolute inset-0 flex flex-col justify-end pb-12 text-white md:pb-20">
            <SectionLabel index="08" light>{events.eyebrow}</SectionLabel>
            <SplitReveal text={events.heading} className="mt-5 max-w-[16ch] font-display text-[clamp(2.6rem,7vw,6.5rem)] leading-[0.92] tracking-[-0.025em]" italicWords={["sand"]} />
            <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <p className="max-w-md text-white/80">{events.body}</p>
              <PillButton href="/contact?type=wedding" variant="paper">Plan your celebration</PillButton>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="container-x grid gap-4 py-16 md:grid-cols-3 md:gap-6 md:py-24">
        {venues.map((v, i) => (
          <Reveal key={v.id} delay={i * 0.08}>
            <div className="group flex items-center gap-4 rounded-[22px] bg-white p-3 ring-1 ring-line">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                <Img src={v.image} alt={v.name} fill sizes="80px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="min-w-0">
                <p className="font-medium">{v.name}</p>
                <p className="truncate text-sm text-muted">{v.description}</p>
                <p className="eyebrow mt-1 text-accent">Up to {v.capacity} guests</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
