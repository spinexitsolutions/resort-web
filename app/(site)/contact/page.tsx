import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import PageHeader from "@/components/site/PageHeader";
import ContactForm from "@/components/site/ContactForm";

export const metadata: Metadata = { title: "Contact" };

export default async function Page({ searchParams }: { searchParams: Promise<{ type?: string; subject?: string }> }) {
  const { type, subject } = await searchParams;
  const { settings } = await getDB();
  const b = settings.brand;
  return (
    <>
      <PageHeader eyebrow="Contact · Concierge" title="Let's plan something lovely." accent={["lovely."]} />
      <div className="container-x grid gap-16 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-7">
          <ContactForm initialType={type} initialSubject={subject} />
        </div>
        <aside className="space-y-8 md:col-span-4 md:col-start-9">
          {[
            ["Reservations", b.phone, `tel:${b.phone.replace(/\s/g, "")}`],
            ["Email", b.email, `mailto:${b.email}`],
            ["WhatsApp", "Chat with concierge", `https://wa.me/${b.whatsapp}`],
          ].map(([k, v, h]) => (
            <a key={k} href={h} className="group block border-b border-line pb-6">
              <p className="eyebrow text-muted">{k}</p>
              <p className="mt-2 font-display text-3xl tracking-tight transition-colors group-hover:text-accent">{v}</p>
            </a>
          ))}
          <div>
            <p className="eyebrow text-muted">Address</p>
            <p className="mt-2 leading-relaxed">{b.address}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-mist p-5 text-sm">
            <div><p className="eyebrow text-muted">Check-in</p><p className="mt-1 font-medium">{b.checkIn}</p></div>
            <div><p className="eyebrow text-muted">Check-out</p><p className="mt-1 font-medium">{b.checkOut}</p></div>
          </div>
        </aside>
      </div>
    </>
  );
}
