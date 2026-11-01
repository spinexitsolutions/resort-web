import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getDB } from "@/lib/db";
import { AdminShell } from "@/components/admin/Shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const db = await getDB();
  return (
    <AdminShell
      brand={db.settings.brand.name}
      counts={{
        pending: db.bookings.filter((b) => b.status === "pending").length,
        newLeads: db.inquiries.filter((q) => q.stage === "new").length,
      }}
    >
      {children}
    </AdminShell>
  );
}
