"use client";

import type { SiteSettings } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { ParallaxImage, PillButton, Reveal, SectionLabel, SplitReveal } from "../motion";

export default function Spa({ spa }: { spa: SiteSettings["spa"] }) {
  return (
    <section id="spa" className="relative overflow-hidden bg-lagoon py-24 text-paper md:py-40">
      <div className="container-x grid items-center gap-12 md:grid-cols-2 md:gap-20">
        <ParallaxImage src={spa.image} alt={spa.heading} className="aspect-[4/5] rounded-[28px]" sizes="(min-width:768px) 50vw, 100vw" />
        <div>
          <SectionLabel index="05" light>{spa.eyebrow}</SectionLabel>
          <SplitReveal text={spa.heading} className="mt-5 font-display text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.98] tracking-[-0.02em]" italicWords={["rituals"]} />
          <Reveal>
            <p className="mt-6 max-w-md text-paper/75">{spa.body}</p>
          </Reveal>
          <ul className="mt-10 border-t border-white/15">
            {spa.rituals.map((r, i) => (
              <Reveal key={r.name} delay={i * 0.06} y={20}>
                <li className="flex items-baseline justify-between gap-4 border-b border-white/15 py-4">
                  <span className="text-[1.0625rem]">{r.name}</span>
                  <span className="flex-1 translate-y-[-4px] border-b border-dotted border-white/20" />
                  <span className="shrink-0 text-sm text-paper/60">{r.duration}</span>
                  <span className="w-20 shrink-0 text-right text-sm">{formatMoney(r.price)}</span>
                </li>
              </Reveal>
            ))}
          </ul>
          <PillButton href="/contact?type=spa" variant="paper" className="mt-10">Book a ritual</PillButton>
        </div>
      </div>
    </section>
  );
}
