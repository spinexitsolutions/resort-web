import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import PageHeader from "@/components/site/PageHeader";
import RoomsExplorer from "@/components/site/RoomsExplorer";

export const metadata: Metadata = { title: "Rooms & Villas" };

export default async function RoomsPage() {
  const db = await getDB();
  return (
    <>
      <PageHeader
        eyebrow="Stay · 41 villas & suites"
        title="Rooms with a point of view."
        italic={["point", "view."]}
        intro="Overwater, under the canopy or on the cliff edge — every stay includes breakfast, butler service and transfers from the jetty."
        image={db.rooms.find((r) => r.featured)?.images[0]}
      />
      <RoomsExplorer rooms={db.rooms.filter((r) => r.active)} />
    </>
  );
}
