import { getDB } from "@/lib/db";
import { SubscribersClient } from "@/components/admin/SubscribersClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Subscribers" };

export default async function SubscribersPage() {
  const db = await getDB();
  return <SubscribersClient subscribers={db.subscribers} />;
}
