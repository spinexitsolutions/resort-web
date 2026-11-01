import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import { formatMoney } from "@/lib/utils";
import PageHeader from "@/components/site/PageHeader";
import ExperienceGrid from "@/components/site/ExperienceGrid";

export const metadata: Metadata = { title: "Experiences" };

export default async function Page() {
  const db = await getDB();
  const items = db.experiences.filter((e) => e.active);
  const from = Math.min(...items.map((e) => e.price));
  return (
    <>
      <PageHeader
        eyebrow="Experiences"
        title="The island, up close."
        accent={["up", "close."]}
        tone="accent"
        intro="Reef, rainforest and everything in between — guided by people who grew up here."
        stats={[
          { value: String(items.length), label: "Experiences" },
          { value: Number.isFinite(from) ? formatMoney(from) : "—", label: "From" },
        ]}
        compact
      />
      <ExperienceGrid items={items} />
    </>
  );
}
