import { getDB } from "@/lib/db";
import Announcement from "@/components/site/Announcement";
import Cursor from "@/components/site/Cursor";
import Footer from "@/components/site/Footer";
import Intro from "@/components/site/Intro";
import Navbar from "@/components/site/Navbar";
import SmoothScroll from "@/components/site/SmoothScroll";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getDB();
  return (
    <SmoothScroll>
      <Intro config={settings.intro} images={[settings.hero.image, settings.hero.image2]}>
        <Announcement data={settings.announcement} />
        <Navbar brand={settings.brand} nav={settings.navbar} belowBanner={settings.announcement.enabled} />
        <main>{children}</main>
        <Footer settings={settings} />
        <Cursor />
      </Intro>
    </SmoothScroll>
  );
}
