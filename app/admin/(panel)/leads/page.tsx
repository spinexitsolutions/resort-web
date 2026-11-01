import { getDB } from "@/lib/db";
import { LeadsBoard } from "@/components/admin/LeadsBoard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leads" };

export default async function LeadsPage() {
  const db = await getDB();
  return <LeadsBoard inquiries={db.inquiries} />;
}
