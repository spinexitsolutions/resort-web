import { Fragment } from "react";
import { getDB } from "@/lib/db";
import type { SectionKey } from "@/lib/types";
import Hero from "@/components/site/sections/Hero";
import Story from "@/components/site/sections/Story";
import Rooms from "@/components/site/sections/Rooms";
import Experiences from "@/components/site/sections/Experiences";
import Dining from "@/components/site/sections/Dining";
import Spa from "@/components/site/sections/Spa";
import Offers from "@/components/site/sections/Offers";
import GalleryStrip from "@/components/site/sections/GalleryStrip";
import Events from "@/components/site/sections/Events";
import Testimonials from "@/components/site/sections/Testimonials";
import Location from "@/components/site/sections/Location";
import Faq from "@/components/site/sections/Faq";
import Cta from "@/components/site/sections/Cta";

export default async function Home() {
  const db = await getDB();
  const s = db.settings;
  const rooms = db.rooms.filter((r) => r.active);
  const featuredExp = db.experiences.filter((e) => e.active && e.featured);

  const render: Record<SectionKey, () => React.ReactNode> = {
    hero: () => <Hero hero={s.hero} brand={s.brand} />,
    story: () => <Story story={s.story} brand={s.brand} />,
    rooms: () => rooms.length > 0 && <Rooms rooms={rooms} />,
    experiences: () => featuredExp.length > 0 && <Experiences items={featuredExp} />,
    dining: () => <Dining items={db.dining.filter((d) => d.active)} />,
    spa: () => <Spa spa={s.spa} />,
    offers: () => db.offers.some((o) => o.active) && <Offers items={db.offers.filter((o) => o.active)} />,
    gallery: () => db.gallery.length > 0 && <GalleryStrip items={db.gallery} />,
    events: () => <Events events={s.events} venues={db.venues} />,
    testimonials: () => <Testimonials items={db.testimonials.filter((t) => t.active)} />,
    location: () => <Location brand={s.brand} />,
    faq: () => db.faqs.length > 0 && <Faq items={db.faqs} />,
    newsletter: () => <Cta image={s.intro.image || s.hero.image} />,
  };

  return (
    <>
      {s.sections
        .filter((x) => x.enabled && render[x.id])
        .map((x) => (
          <Fragment key={x.id}>{render[x.id]()}</Fragment>
        ))}
    </>
  );
}
