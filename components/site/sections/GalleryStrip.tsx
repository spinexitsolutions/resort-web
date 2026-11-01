"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { GalleryItem } from "@/lib/types";
import { H2, Img, PillButton, SectionLabel, SplitReveal } from "../motion";

export default function GalleryStrip({ items }: { items: GalleryItem[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-30%", "0%"]);
  const half = Math.ceil(items.length / 2);
  const rows = [items.slice(0, half), items.slice(half)];

  return (
    <section ref={ref} id="gallery" className="overflow-hidden bg-paper py-24 md:py-36">
      <div className="container-x mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <SectionLabel index="07">Gallery</SectionLabel>
          <SplitReveal text="A few frames from the island." className={`mt-6 max-w-[12ch] ${H2}`} italicWords={["frames"]} inlineImage={{ after: 2, src: items[2]?.src ?? "" }} />
        </div>
        <PillButton href="/gallery" variant="ink" className="self-start md:self-auto">Open gallery</PillButton>
      </div>
      <div className="flex flex-col gap-4 md:gap-6">
        {rows.map((row, r) => (
          <motion.div key={r} style={{ x: r ? x2 : x1 }} className="flex gap-4 md:gap-6">
            {[...row, ...row.slice(0, 3)].map((g, i) => (
              <div key={g.id + i} data-cursor="Gallery" className={`relative shrink-0 overflow-hidden rounded-[24px] ${i % 3 === 1 ? "aspect-[3/4] w-[44vw] md:w-[22vw]" : "aspect-[4/3] w-[62vw] md:w-[30vw]"}`}>
                <Img src={g.src} alt={g.caption} fill sizes="(min-width:768px) 30vw, 60vw" className="object-cover" />
                <span className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink">{g.caption}</span>
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
