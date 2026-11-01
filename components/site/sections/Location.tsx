"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { SiteSettings } from "@/lib/types";
import { H2, PillButton, Reveal, SectionLabel, SplitReveal } from "../motion";

const STEPS = [
  { t: "Fly", d: "Into Port Blair (IXZ) — direct from Delhi, Mumbai, Chennai, Kolkata & Bengaluru.", time: "2–3 h", icon: "M2 16l20-6-20-6 4 6-4 6zm4-6h8" },
  { t: "Sail", d: "Our private ferry glides you across to Swaraj Dweep.", time: "90 m", icon: "M3 17h18l-3 4H6l-3-4zm9-14v12M12 3l6 10H12" },
  { t: "Arrive", d: "A short drive through the forest — your butler is waiting.", time: "15 m", icon: "M12 21s-7-6.5-7-12a7 7 0 1114 0c0 5.5-7 12-7 12zm0-9a3 3 0 100-6 3 3 0 000 6z" },
];

export default function Location({ brand }: { brand: SiteSettings["brand"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.5"] });
  const line = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="location" className="bg-paper py-24 md:py-36">
      <div className="container-x">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel index="10">Getting here</SectionLabel>
            <SplitReveal text="Far enough to feel it. Close enough to make it." className={`mt-6 max-w-[14ch] ${H2}`} italicWords={["feel"]} />
          </div>
          <div className="flex flex-wrap gap-3">
            <PillButton href="/contact" variant="accent">Arrange transfers</PillButton>
            <a href={`https://wa.me/${brand.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center rounded-full px-6 text-[0.95rem] font-semibold ring-1 ring-ink/20 hover:ring-ink">WhatsApp us</a>
          </div>
        </div>

        {/* journey */}
        <div ref={ref} className="relative mt-16 md:mt-20">
          <div className="absolute left-[1.35rem] top-0 h-full w-0.5 bg-ink/10 md:left-0 md:top-[1.35rem] md:h-0.5 md:w-full">
            <motion.div style={{ height: line }} className="w-full bg-accent md:hidden" />
            <motion.div style={{ width: line }} className="hidden h-full bg-accent md:block" />
          </div>
          <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((s, i) => (
              <Reveal key={s.t} delay={i * 0.15} y={20}>
                <li className="flex gap-5 md:block">
                  <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-white ring-8 ring-paper">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d={s.icon} /></svg>
                  </span>
                  <div className="md:mt-8">
                    <div className="flex items-baseline gap-3">
                      <p className="font-display text-[clamp(2.6rem,5vw,4.5rem)] leading-none tracking-[-0.05em]">{s.t}</p>
                      <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">{s.time}</span>
                    </div>
                    <p className="mt-3 max-w-xs text-muted">{s.d}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal>
          <div className="relative mt-16 h-[380px] overflow-hidden rounded-[32px] bg-mist md:h-[480px]">
            <iframe title="Map" src={brand.mapEmbed} className="absolute inset-0 h-full w-full grayscale contrast-[1.1]" loading="lazy" />
            <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 rounded-[22px] bg-ink p-5 text-white md:right-auto md:max-w-sm">
              <p className="font-display text-3xl tracking-[-0.04em]">{brand.name}</p>
              <p className="text-sm text-white/70">{brand.address}</p>
              <p className="text-xs font-semibold text-accent">{brand.coordinates}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
