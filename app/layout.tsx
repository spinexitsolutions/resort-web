import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { getDB } from "@/lib/db";
import "./globals.css";

const sans = Instrument_Sans({ subsets: ["latin"], axes: ["wdth"], variable: "--font-body", display: "swap" });
const display = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz", "wdth"], variable: "--font-head", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getDB();
  return {
    title: { default: settings.seo.title, template: `%s — ${settings.brand.name}` },
    description: settings.seo.description,
    openGraph: { title: settings.seo.title, description: settings.seo.description, images: [settings.hero.image] },
  };
}

export const viewport: Viewport = {
  themeColor: "#121417",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getDB();
  const c = (v: string, fallback: string) => (/^#[0-9a-fA-F]{3,8}$|^(rgb|hsl|oklch)\([\d\s.,%/]+\)$/.test(v?.trim() ?? "") ? v.trim() : fallback);
  const t = {
    paper: c(settings.theme.paper, "#F2EEE8"),
    ink: c(settings.theme.ink, "#121417"),
    accent: c(settings.theme.accent, "#FF5B2E"),
    lagoon: c(settings.theme.lagoon, "#0D4F4A"),
  };
  const vars = `:root{--paper:${t.paper};--ink:${t.ink};--accent:${t.accent};--lagoon:${t.lagoon};}`;
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: vars }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
