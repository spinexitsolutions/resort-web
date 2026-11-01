import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import PageHeader from "@/components/site/PageHeader";
import GalleryGrid from "@/components/site/GalleryGrid";

export const metadata: Metadata = { title: "Gallery" };

export default async function Page() {
  const db = await getDB();
  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="Proof it's real."
        accent={["real."]}
        tone="lagoon"
        intro="No filters needed. Tap any frame to open it full screen — swipe or use your arrow keys."
        stats={[{ value: String(db.gallery.length), label: "Frames" }]}
        compact
      />
      <GalleryGrid items={db.gallery} />
    </>
  );
}
