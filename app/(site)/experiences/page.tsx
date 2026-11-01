import type { Metadata } from "next";
import { getDB } from "@/lib/db";
import PageHeader from "@/components/site/PageHeader";
import ExperienceGrid from "@/components/site/ExperienceGrid";

export const metadata: Metadata = { title: "Experiences" };

export default async function Page() {
  const db = await getDB();
  return (
    <>
      <PageHeader eyebrow="Experiences" title="The island, up close." accent={["up", "close."]} intro="Reef, rainforest and everything in between — guided by people who grew up here." />
      <ExperienceGrid items={db.experiences.filter((e) => e.active)} />
    </>
  );
}
