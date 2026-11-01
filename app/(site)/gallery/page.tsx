import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import PageHeader from "@/components/site/PageHeader";
import GalleryGrid from "@/components/site/GalleryGrid";

export const metadata: Metadata = { title: "Gallery" };

export default async function Page() {
  const db = await getDB();
  return (
    <>
      <PageHeader eyebrow="Gallery" title="Proof it's real." accent={["real."]} />
      <GalleryGrid items={db.gallery} />
    </>
  );
}
