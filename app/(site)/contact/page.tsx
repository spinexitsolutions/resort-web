import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import PageHeader from "@/components/site/PageHeader";
import ContactForm from "@/components/site/ContactForm";
import { Reveal } from "@/components/site/motion";

export const metadata: Metadata = { title: "Contact" };

export default async function Page({ searchParams }: { searchParams: Promise<{ type?: string; subject?: string }> }) {
  const { type, subject } = await searchParams;
  const { settings } = await getDB();
  const b = settings.brand;
  const tiles = [
    { k: "Call reservations", v: b.phone, h: `tel:${b.phone.replace(/\s/g, "")}`, c: "bg-accent text-white" },
    { k: "Write to us", v: b.email, h: `mailto:${b.email}`, c: "bg-ink text-white" },
    { k: "WhatsApp concierge", v: "Chat now", h: `https://wa.me/${b.whatsapp}`, c: "bg-lagoon text-white" },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's plan something lovely."
        accent={["lovely."]}
        tone="accent"
        intro="Weddings, offsites, a surprise anniversary or just a question about ferries — a real person replies within the hour."
        stats={[{ value: "< 1 hr", label: "Avg. reply" }]}
        compact
      />
      <div className="container-x grid gap-3 py-10 sm:grid-cols-3 md:py-14">
        {tiles.map((t, i) => (
          <Reveal key={t.k} delay={i * 0.08}>
            <a href={t.h} className={`group flex min-h-44 flex-col justify-between rounded-[28px] p-6 transition-transform duration-500 ease-expo hover:-translate-y-1 ${t.c}`}>
              <span className="flex items-center justify-between text-sm font-semibold opacity-75">
                {t.k}
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 transition-transform duration-500 group-hover:-rotate-45">→</span>
              </span>
              <span className="break-words font-display text-[clamp(1.7rem,2.6vw,2.4rem)] leading-none tracking-[-0.04em]">{t.v}</span>
            </a>
          </Reveal>
        ))}
      </div>
      <div className="container-x grid gap-14 pb-24 md:grid-cols-12">
        <div className="md:col-span-8">
          <ContactForm initialType={type} initialSubject={subject} />
        </div>
        <aside className="space-y-3 md:col-span-4">
          <div className="rounded-[28px] bg-white p-6 ring-1 ring-line">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Address</p>
            <p className="mt-2 font-medium leading-relaxed">{b.address}</p>
            <p className="mt-3 text-xs font-semibold text-accent">{b.coordinates}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[["Check-in", b.checkIn], ["Check-out", b.checkOut]].map(([k, v]) => (
              <div key={k} className="rounded-[24px] bg-white p-5 ring-1 ring-line">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">{k}</p>
                <p className="mt-1 font-display text-3xl tracking-[-0.04em]">{v}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
