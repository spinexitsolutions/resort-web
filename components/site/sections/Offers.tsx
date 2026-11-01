"use client";

import { useState } from "react";
import type { Offer } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Img, Reveal, SectionLabel, SplitReveal } from "../motion";
import Link from "next/link";

export function OfferCard({ o }: { o: Offer }) {
  const [copied, setCopied] = useState(false);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] bg-white ring-1 ring-line">
      <div className="relative aspect-[16/11] overflow-hidden">
        <Img src={o.image} alt={o.title} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition-transform duration-[1.4s] ease-expo group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white">{o.badge}</span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-3xl tracking-tight">{o.title}</h3>
        <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-muted">{o.description}</p>
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(o.code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
            className="rounded-full border border-dashed border-ink/30 px-4 py-2 font-mono text-xs tracking-widest transition-colors hover:border-ink"
          >
            {copied ? "Copied ✓" : o.code}
          </button>
          <Link href={`/book?code=${o.code}`} className="text-sm font-medium underline-offset-4 hover:underline">
            Book offer →
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted">Valid till {formatDate(o.validTill)}</p>
      </div>
    </article>
  );
}

export default function Offers({ items }: { items: Offer[] }) {
  return (
    <section id="offers" className="bg-mist py-24 md:py-36">
      <div className="container-x">
        <SectionLabel index="06">Offers</SectionLabel>
        <SplitReveal text="Reasons to come sooner." className="mt-5 font-display text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.025em]" italicWords={["sooner."]} />
        <div className="no-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
          {items.map((o, i) => (
            <Reveal key={o.id} delay={i * 0.1} className="w-[82vw] shrink-0 snap-center md:w-auto">
              <OfferCard o={o} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
