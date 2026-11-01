import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import PageHeader from "@/components/site/PageHeader";
import { ParallaxImage, PillButton, Reveal } from "@/components/site/motion";

export const metadata: Metadata = { title: "Dining" };

export default async function Page() {
  const db = await getDB();
  const items = db.dining.filter((d) => d.active);
  return (
    <>
      <PageHeader eyebrow="Dining" title="Eat like an islander." accent={["islander."]} intro="Four kitchens, one pantry: our organic farm, the morning catch and the forest." image={items[0]?.image} />
      <div className="container-x space-y-24 py-24 md:space-y-40 md:py-36">
        {items.map((d, i) => (
          <section key={d.id} className="grid items-center gap-10 md:grid-cols-12 md:gap-16">
            <ParallaxImage src={d.image} alt={d.name} sizes="(min-width:768px) 55vw, 100vw" className={`aspect-[4/5] rounded-[28px] md:col-span-7 md:aspect-[5/4] ${i % 2 ? "md:order-2" : ""}`} />
            <div className="md:col-span-5">
              <Reveal>
                <p className="eyebrow text-muted">{String(i + 1).padStart(2, "0")} · {d.cuisine}</p>
                <h2 className="mt-4 font-display text-6xl tracking-tight md:text-7xl">{d.name}</h2>
                <p className="mt-6 text-[1.0625rem] leading-relaxed text-muted">{d.description}</p>
                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-line pt-6 text-sm">
                  <div>
                    <p className="eyebrow text-muted">Hours</p>
                    <p className="mt-1">{d.hours}</p>
                  </div>
                  <div>
                    <p className="eyebrow text-muted">Signature</p>
                    <p className="mt-1">{d.signature}</p>
                  </div>
                </div>
                <PillButton href={`/contact?type=dining&subject=${encodeURIComponent("Table at " + d.name)}`} variant="ink" className="mt-8">Reserve a table</PillButton>
              </Reveal>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
