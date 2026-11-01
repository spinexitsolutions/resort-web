import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import PageHeader from "@/components/site/PageHeader";
import DiningList from "@/components/site/DiningList";

export const metadata: Metadata = { title: "Dining" };

export default async function Page() {
  const db = await getDB();
  const items = db.dining.filter((d) => d.active);
  return (
    <>
      <PageHeader
        eyebrow="Dining"
        title="Eat like an islander."
        accent={["islander."]}
        intro="Four kitchens, one pantry: our organic farm, the morning catch and the forest."
        image={items[0]?.image}
        stats={[
          { value: String(items.length), label: "Kitchens" },
          { value: "50%", label: "Home-grown" },
        ]}
      />
      <DiningList items={items} />
    </>
  );
}
