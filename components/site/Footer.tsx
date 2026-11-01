"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { SiteSettings } from "@/lib/types";
import NewsletterForm from "./NewsletterForm";

export default function Footer({ settings }: { settings: SiteSettings }) {
  const { brand, navbar, footer } = settings;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-30%", "0%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);

  return (
    <footer ref={ref} className="relative overflow-hidden bg-ink pb-28 text-paper md:pb-10">
      <motion.div style={{ y }} className="container-x pt-20 md:pt-28">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="eyebrow text-paper/50">Letters from the island</p>
            <h3 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight md:text-5xl">
              Slow news, <span className="text-accent">four times</span> a year.
            </h3>
            <div className="mt-8 max-w-md">
              <NewsletterForm dark />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm md:col-span-7 md:grid-cols-3">
            <div>
              <p className="eyebrow mb-4 text-paper/40">Explore</p>
              <ul className="space-y-2.5">
                {navbar.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-paper/75 transition-colors hover:text-accent">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-4 text-paper/40">Visit</p>
              <p className="leading-relaxed text-paper/75">{brand.address}</p>
              <p className="mt-4 font-mono text-xs text-paper/40">{brand.coordinates}</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="eyebrow mb-4 text-paper/40">Reach us</p>
              <ul className="space-y-2.5 text-paper/75">
                <li><a className="hover:text-accent" href={`tel:${brand.phone.replace(/\s/g, "")}`}>{brand.phone}</a></li>
                <li><a className="hover:text-accent" href={`mailto:${brand.email}`}>{brand.email}</a></li>
                <li><a className="hover:text-accent" href={`https://wa.me/${brand.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp concierge</a></li>
              </ul>
              <div className="mt-6 flex gap-3">
                {[
                  ["Instagram", brand.instagram],
                  ["Facebook", brand.facebook],
                  ["YouTube", brand.youtube],
                ].filter(([, h]) => h).map(([n, h]) => (
                  <a key={n} href={h} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-3 py-1.5 text-xs transition-colors hover:border-accent hover:text-accent">
                    {n}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div style={{ scale }} className="container-x mt-16 origin-bottom select-none md:mt-24">
        <p aria-hidden className="text-center font-display text-[27vw] leading-[0.75] tracking-[-0.04em] text-paper/[0.92] md:text-[23vw]">
          {brand.name.slice(0, -1)}
          <span className="text-accent">{brand.name.slice(-1)}</span>
        </p>
      </motion.div>

      <div className="container-x mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-paper/45 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} {brand.name}. Est. {brand.established}. {footer.note}</p>
        <div className="flex gap-5">
          <Link href="/contact" className="hover:text-paper">Contact</Link>
          <Link href="/offers" className="hover:text-paper">Offers</Link>
          <Link href="/admin" className="hover:text-paper">Staff login</Link>
        </div>
      </div>
    </footer>
  );
}
