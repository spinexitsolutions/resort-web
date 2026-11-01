"use client";

import type { SiteSettings } from "@/lib/types";
import Counter from "../Counter";
import { Marquee, Reveal, ScrollText, SectionLabel, SlatImage, SpinBadge } from "../motion";

export default function Story({ story, brand }: { story: SiteSettings["story"]; brand: SiteSettings["brand"] }) {
  return (
    <section id="story" className="relative bg-paper">
      <Marquee
        items={["Overwater villas", "Rainforest suites", "Floating spa", "Barefoot dining", "Reef & ocean", "Since " + brand.established]}
        className="mt-12 border-y border-line py-5 font-display text-[clamp(1.6rem,3.4vw,2.8rem)] text-ink/85"
      />

      <div className="container-x grid gap-16 py-24 md:grid-cols-12 md:gap-10 md:py-36">
        {/* left: sticky numbers */}
        <div className="md:col-span-5">
          <div className="md:sticky md:top-28">
            <SectionLabel index="01">{story.eyebrow}</SectionLabel>
            <dl className="mt-10 divide-y divide-line border-y border-line">
              {story.stats.map((s, i) => (
                <Reveal key={s.label} delay={i * 0.07} y={24}>
                  <div className="group flex items-end justify-between gap-6 py-4">
                    <dt className="order-2 pb-3 text-right text-sm font-medium text-muted transition-colors group-hover:text-ink">{s.label}</dt>
                    <dd className="font-display text-[clamp(3.8rem,8vw,7rem)] leading-[0.85] tracking-[-0.05em] transition-colors duration-500 group-hover:text-accent">
                      <Counter value={s.value} />
                    </dd>
                  </div>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>

        {/* right: words + image */}
        <div className="md:col-span-7">
          <ScrollText text={story.heading} className="font-display text-[clamp(2.1rem,4.4vw,4.1rem)] leading-[0.98] tracking-[-0.035em]" />
          <Reveal>
            <p className="mt-10 max-w-lg text-[1.075rem] leading-relaxed text-muted text-pretty">{story.body}</p>
          </Reveal>
          <div className="relative mt-14">
            <SlatImage src={story.image} alt={story.imageAlt} className="aspect-[4/5] rounded-[32px] bg-mist md:aspect-[5/6]" sizes="(min-width:768px) 55vw, 100vw" />
            <SpinBadge text={`Est. ${brand.established} · ${brand.location} · `} className="absolute -bottom-10 -left-4 md:-left-12">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3c-3 4-3 8 0 12m0-12c3 4 3 8 0 12M4 15c3-1.5 13-1.5 16 0M12 15v6" /></svg>
            </SpinBadge>
          </div>
        </div>
      </div>
    </section>
  );
}
