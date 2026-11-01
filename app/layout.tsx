import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { getDB } from "@/lib/db";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getDB();
  return {
    title: { default: settings.seo.title, template: `%s — ${settings.brand.name}` },
    description: settings.seo.description,
    openGraph: { title: settings.seo.title, description: settings.seo.description, images: [settings.hero.image] },
  };
}

export const viewport: Viewport = {
  themeColor: "#0e1a16",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getDB();
  const c = (v: string, fallback: string) => (/^#[0-9a-fA-F]{3,8}$|^(rgb|hsl|oklch)\([\d\s.,%/]+\)$/.test(v?.trim() ?? "") ? v.trim() : fallback);
  const t = {
    paper: c(settings.theme.paper, "#F3EFE7"),
    ink: c(settings.theme.ink, "#0E1A16"),
    accent: c(settings.theme.accent, "#C08A4E"),
    lagoon: c(settings.theme.lagoon, "#1F5C57"),
  };
  const vars = `:root{--paper:${t.paper};--ink:${t.ink};--accent:${t.accent};--lagoon:${t.lagoon};}`;
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: vars }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
