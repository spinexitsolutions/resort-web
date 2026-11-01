import { notFound } from "next/navigation";
import { getDB } from "@/lib/db";
import { SCHEMAS } from "@/lib/admin-schemas";
import { ResourceManager } from "@/components/admin/ResourceManager";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  return { title: SCHEMAS[resource]?.title ?? "Content" };
}

export default async function ContentPage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const schema = SCHEMAS[resource];
  if (!schema) notFound();
  const db = await getDB();
  const items = db[schema.key] as unknown as (Record<string, unknown> & { id: string })[];
  return <ResourceManager key={resource} resource={resource} items={items} />;
}
