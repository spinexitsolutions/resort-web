import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import PageHeader from "@/components/site/PageHeader";
import { OfferCard } from "@/components/site/sections/Offers";
import { Reveal } from "@/components/site/motion";

export const metadata: Metadata = { title: "Offers" };

export default async function Page() {
  const db = await getDB();
  const items = db.offers.filter((o) => o.active);
  return (
    <>
      <PageHeader eyebrow="Offers · Book direct" title="Little reasons to say yes." accent={["yes."]} intro="Exclusive to our website — apply the code at checkout, or we'll apply it for you." />
      <div className="container-x grid gap-6 py-16 sm:grid-cols-2 md:py-24 lg:grid-cols-3">
        {items.map((o, i) => (
          <Reveal key={o.id} delay={i * 0.08}>
            <OfferCard o={o} />
          </Reveal>
        ))}
      </div>
    </>
  );
}
