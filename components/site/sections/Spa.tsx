"use client";

import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { SiteSettings } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { H2, Img, PillButton, Reveal, SectionLabel, SplitReveal } from "../motion";

export default function Spa({ spa }: { spa: SiteSettings["spa"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const r = useTransform(scrollYProgress, [0, 0.75], [16, 80]);
  const clip = useMotionTemplate`circle(${r}% at 50% 50%)`;
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.35, 1]);
  const inOpacity = useTransform(scrollYProgress, [0, 0.22, 0.3], [1, 1, 0]);
  const outOpacity = useTransform(scrollYProgress, [0.34, 0.44, 0.78, 0.9], [0, 1, 1, 0]);
  const ring = useTransform(scrollYProgress, [0, 0.75], [1, 4.2]);

  return (
    <section id="spa" className="relative bg-lagoon text-paper">
      {/* breathing circle */}
      <div ref={ref} className="relative h-[230vh]">
        <div className="sticky top-0 grid h-svh place-items-center overflow-hidden">
          <motion.div style={{ scale: ring }} className="absolute aspect-square w-[min(36vw,320px)] rounded-full border border-white/15" />
          <motion.div style={{ clipPath: clip }} className="absolute inset-0">
            <motion.div style={{ scale: imgScale }} className="absolute inset-0">
              <Img src={spa.image} alt={spa.heading} fill sizes="100vw" className="object-cover" />
            </motion.div>
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>
          <div className="pointer-events-none relative grid place-items-center whitespace-nowrap text-center [text-shadow:0_4px_40px_rgba(0,0,0,0.45)]">
            <motion.p style={{ opacity: inOpacity }} className="[grid-area:1/1] font-display text-[clamp(3.5rem,13vw,12rem)] leading-none tracking-[-0.05em]">
              Breathe in
            </motion.p>
            <motion.p style={{ opacity: outOpacity }} className="[grid-area:1/1] font-display text-[clamp(3.5rem,13vw,12rem)] leading-none tracking-[-0.05em] text-white">
              Breathe out
            </motion.p>
          </div>
          <div className="absolute left-0 top-0 p-5 pt-24 md:p-10 md:pt-28">
            <SectionLabel index="05" light>{spa.eyebrow}</SectionLabel>
          </div>
        </div>
      </div>

      {/* rituals */}
      <div className="container-x relative pb-24 pt-8 md:pb-36">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <SplitReveal text={spa.heading} className={H2} italicWords={["rituals"]} />
            <Reveal>
              <p className="mt-6 max-w-md text-paper/75">{spa.body}</p>
              <PillButton href="/contact?type=spa" variant="accent" className="mt-8">Book a ritual</PillButton>
            </Reveal>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:col-span-7">
            {spa.rituals.map((rt, i) => (
              <Reveal key={rt.name} delay={i * 0.08} y={30}>
                <div className="group flex h-full flex-col justify-between rounded-[26px] bg-white/[0.06] p-6 ring-1 ring-white/10 transition-colors duration-500 hover:bg-accent">
                  <div className="flex items-start justify-between">
                    <span className="font-display text-6xl leading-none tracking-[-0.05em] text-white/25 transition-colors group-hover:text-white/40">
                      {rt.duration.replace(/\D+/g, "")}
                      <span className="ml-1 text-xl">min</span>
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">{formatMoney(rt.price)}</span>
                  </div>
                  <p className="mt-10 text-xl font-semibold leading-tight tracking-tight">{rt.name}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
