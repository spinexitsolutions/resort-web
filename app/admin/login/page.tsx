import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getDB } from "@/lib/db";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  const { settings } = await getDB();
  return <LoginForm brand={settings.brand.name} tagline={settings.brand.tagline} image={settings.hero.image} />;
}
