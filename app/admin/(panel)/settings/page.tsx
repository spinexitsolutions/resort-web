import { getDB } from "@/lib/db";
import { SettingsClient } from "@/components/admin/SettingsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const db = await getDB();
  return <SettingsClient settings={db.settings} />;
}
