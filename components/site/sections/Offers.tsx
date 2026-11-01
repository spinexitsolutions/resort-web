"use client";

import Link from "next/link";
import { useState } from "react";
import type { Offer } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { H2, Img, Reveal, SectionLabel, SplitReveal, Tilt } from "../motion";

/** A boarding-pass style offer ticket. */
export function OfferCard({ o, tone = 0 }: { o: Offer; tone?: number }) {
  const [copied, setCopied] = useState(false);
  const tones = ["bg-white text-ink", "bg-ink text-paper", "bg-accent text-white"];
  const t = tones[tone % tones.length];
  const dark = tone % tones.length !== 0;
  const notch = "bg-[var(--notch,var(--mist))]";
  return (
    <Tilt className="h-full">
      <article className={cn("relative flex h-full flex-col overflow-hidden rounded-[28px] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)]", t)}>
        <div className="relative m-2 aspect-[16/10] overflow-hidden rounded-[22px]">
          <Img src={o.image} alt={o.title} fill sizes="(min-width:768px) 33vw, 85vw" className="object-cover" />
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ink">{o.badge}</span>
          <span className="absolute bottom-3 right-3 font-display text-6xl leading-none tracking-[-0.05em] text-white drop-shadow-lg">-{o.discount}%</span>
        </div>
        <div className="flex flex-1 flex-col px-6 pb-4 pt-3">
          <h3 className="font-display text-[2.2rem] leading-[0.92] tracking-[-0.04em]">{o.title}</h3>
          <p className={cn("mt-3 flex-1 text-[0.95rem] leading-relaxed", dark ? "opacity-75" : "text-muted")}>{o.description}</p>
        </div>
        {/* perforation */}
        <div className="relative my-1 flex items-center">
          <span className={cn("absolute -left-3 h-6 w-6 rounded-full", notch)} />
          <span className={cn("mx-5 h-px flex-1 border-t-2 border-dashed", dark ? "border-white/25" : "border-ink/15")} />
          <span className={cn("absolute -right-3 h-6 w-6 rounded-full", notch)} />
        </div>
        <div className="flex items-center justify-between gap-3 px-6 pb-6 pt-3">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(o.code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
            className="text-left"
          >
            <span className={cn("block text-[0.7rem] font-semibold uppercase tracking-wider", dark ? "opacity-60" : "text-muted")}>{copied ? "Copied!" : "Tap to copy"}</span>
            <span className="text-xl font-bold tracking-[0.12em]">{o.code}</span>
          </button>
          <Link href={`/book?code=${o.code}`} className={cn("rounded-full px-4 py-2.5 text-sm font-semibold", dark ? "bg-white text-ink" : "bg-ink text-white")}>
            Book →
          </Link>
        </div>
        <p className={cn("px-6 pb-5 text-xs", dark ? "opacity-55" : "text-muted")}>Valid till {formatDate(o.validTill)}</p>
      </article>
    </Tilt>
  );
}

export default function Offers({ items }: { items: Offer[] }) {
  return (
    <section id="offers" className="bg-mist py-24 md:py-36">
      <div className="container-x">
        <SectionLabel index="06">Offers</SectionLabel>
        <SplitReveal text="Reasons to come sooner." className={`mt-6 ${H2}`} italicWords={["sooner."]} />
        <div className="no-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
          {items.map((o, i) => (
            <Reveal key={o.id} delay={i * 0.1} className="w-[82vw] shrink-0 snap-center md:w-auto">
              <OfferCard o={o} tone={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
