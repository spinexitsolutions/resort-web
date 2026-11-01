import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import { formatMoney } from "@/lib/utils";
import PageHeader from "@/components/site/PageHeader";
import RoomsExplorer from "@/components/site/RoomsExplorer";

export const metadata: Metadata = { title: "Rooms & Villas" };

export default async function RoomsPage() {
  const db = await getDB();
  const rooms = db.rooms.filter((r) => r.active);
  const from = Math.min(...rooms.map((r) => r.price));
  return (
    <>
      <PageHeader
        eyebrow="Stay"
        title="Rooms with a point of view."
        accent={["point", "view."]}
        intro="Overwater, under the canopy or on the cliff edge — every stay includes breakfast, butler service and jetty transfers."
        image={rooms.find((r) => r.featured)?.images[0]}
        stats={[
          { value: String(rooms.length), label: "Room types" },
          { value: String(rooms.reduce((a, r) => a + r.inventory, 0)), label: "Keys" },
          { value: Number.isFinite(from) ? formatMoney(from) : "—", label: "From / night" },
        ]}
      />
      <RoomsExplorer rooms={rooms} />
    </>
  );
}
