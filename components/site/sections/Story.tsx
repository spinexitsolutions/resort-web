"use client";

import type { SiteSettings } from "@/lib/types";
import Counter from "../Counter";
import { Marquee, ParallaxImage, Reveal, ScrollText, SectionLabel } from "../motion";

export default function Story({ story, brand }: { story: SiteSettings["story"]; brand: SiteSettings["brand"] }) {
  return (
    <section id="story" className="relative bg-paper pt-10 md:pt-0">
      <Marquee
        items={["Overwater villas", "Rainforest suites", "Floating spa", "Barefoot dining", "Reef & ocean", "Since " + brand.established]}
        className="mt-10 border-y border-line py-5 text-[clamp(1.5rem,3vw,2.5rem)] font-display font-semibold tracking-tight text-ink/80"
      />

      <div className="container-x grid gap-12 py-24 md:grid-cols-12 md:gap-8 md:py-40">
        <div className="md:col-span-3">
          <SectionLabel index="01">{story.eyebrow}</SectionLabel>
        </div>
        <div className="md:col-span-9">
          <ScrollText text={story.heading} className="font-display text-[clamp(2rem,4.6vw,4.25rem)] leading-[1.06] tracking-[-0.02em]" />
          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-2">
            <Reveal>
              <p className="max-w-md text-[1.0625rem] leading-relaxed text-muted text-pretty">{story.body}</p>
            </Reveal>
            <div className="grid grid-cols-2 gap-x-6 gap-y-10">
              {story.stats.map((s, i) => (
                <Reveal key={s.label} delay={i * 0.08}>
                  <div className="border-t border-line pt-4">
                    <p className="font-display text-5xl tracking-tight md:text-6xl">
                      <Counter value={s.value} />
                    </p>
                    <p className="mt-2 text-sm text-muted">{s.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-x pb-24 md:pb-40">
        <ParallaxImage src={story.image} alt={story.imageAlt} className="aspect-[4/5] rounded-[28px] sm:aspect-[16/9] md:aspect-[21/9]" strength={10} />
      </div>
    </section>
  );
}
