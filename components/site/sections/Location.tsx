"use client";

import type { SiteSettings } from "@/lib/types";
import { PillButton, Reveal, SectionLabel, SplitReveal } from "../motion";

const STEPS = [
  { t: "Fly", d: "Into Port Blair (IXZ) — direct from Delhi, Mumbai, Chennai, Kolkata & Bengaluru.", time: "2–3 hrs" },
  { t: "Sail", d: "Our private ferry glides you across to Swaraj Dweep.", time: "90 min" },
  { t: "Arrive", d: "A short drive through the forest, and your butler is waiting.", time: "15 min" },
];

export default function Location({ brand }: { brand: SiteSettings["brand"] }) {
  return (
    <section id="location" className="bg-paper py-24 md:py-36">
      <div className="container-x grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <SectionLabel index="10">Getting here</SectionLabel>
          <SplitReveal text="Far enough to feel it. Close enough to make it." className="mt-5 font-display text-[clamp(2.2rem,4.5vw,4rem)] leading-[0.98] tracking-[-0.02em]" italicWords={["feel"]} />
          <ol className="mt-10 space-y-6">
            {STEPS.map((s, i) => (
              <Reveal key={s.t} delay={i * 0.08} y={20}>
                <li className="flex gap-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink font-mono text-xs text-paper">{i + 1}</span>
                  <div className="flex-1 border-b border-line pb-6">
                    <div className="flex items-baseline justify-between">
                      <p className="font-display text-2xl">{s.t}</p>
                      <p className="font-mono text-xs text-muted">{s.time}</p>
                    </div>
                    <p className="mt-1 text-[0.95rem] text-muted">{s.d}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <PillButton href="/contact" variant="ink">Arrange transfers</PillButton>
            <a href={`https://wa.me/${brand.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center rounded-full border border-ink/20 px-6 text-[0.95rem] font-medium hover:border-ink">WhatsApp us</a>
          </div>
        </div>
        <Reveal className="md:col-span-7">
          <div className="relative h-[420px] overflow-hidden rounded-[28px] ring-1 ring-line md:h-full md:min-h-[560px]">
            <iframe title="Map" src={brand.mapEmbed} className="absolute inset-0 h-full w-full grayscale-[0.6] contrast-[1.05]" loading="lazy" />
            <div className="glass absolute bottom-4 left-4 right-4 rounded-2xl p-4 md:right-auto md:max-w-xs">
              <p className="font-medium">{brand.name}</p>
              <p className="mt-1 text-sm text-muted">{brand.address}</p>
              <p className="mt-2 font-mono text-xs text-muted">{brand.coordinates}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
