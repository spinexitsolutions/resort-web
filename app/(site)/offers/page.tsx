import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import PageHeader from "@/components/site/PageHeader";
import { OfferCard } from "@/components/site/sections/Offers";
import { Reveal } from "@/components/site/motion";

export const metadata: Metadata = { title: "Offers" };

export default async function Page() {
  const db = await getDB();
  const items = db.offers.filter((o) => o.active);
  const best = Math.max(0, ...items.map((o) => o.discount));
  return (
    <>
      <PageHeader
        eyebrow="Offers"
        title="Little reasons to say yes."
        accent={["yes."]}
        tone="ink"
        intro="Exclusive to our website — apply the code at checkout, or we'll apply it for you."
        stats={[
          { value: String(items.length), label: "Live offers" },
          { value: `${best}%`, label: "Up to" },
        ]}
        compact
      />
      <div style={{ ["--notch" as string]: "var(--paper)" }} className="container-x grid gap-6 py-16 sm:grid-cols-2 md:py-24 lg:grid-cols-3">
        {items.map((o, i) => (
          <Reveal key={o.id} delay={i * 0.08}>
            <OfferCard o={o} tone={i} />
          </Reveal>
        ))}
      </div>
      <div className="container-x pb-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[32px] bg-accent p-8 text-white md:flex-row md:items-center md:p-12">
          <p className="max-w-xl font-display text-[clamp(2.2rem,4.5vw,4rem)] leading-[0.9] tracking-[-0.045em]">Booking for a group or a special occasion?</p>
          <a href="/contact?type=stay" className="inline-flex h-12 shrink-0 items-center rounded-full bg-white px-6 font-semibold text-ink">Ask for a private rate →</a>
        </div>
      </div>
    </>
  );
}
