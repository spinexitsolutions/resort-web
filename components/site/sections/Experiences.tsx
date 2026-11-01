"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import type { Experience } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";
import { H2, Img, PillButton, SectionLabel, SplitReveal } from "../motion";

const PANELS = [
  "bg-accent text-white",
  "bg-paper text-ink",
  "bg-lagoon text-white",
  "bg-[#E9E1D3] text-ink",
  "bg-white text-ink",
];

export default function Experiences({ items }: { items: Experience[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section id="experiences" className="bg-ink pt-24 text-paper md:pt-36">
      <div className="container-x flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <SectionLabel index="03" light>Experiences</SectionLabel>
          <SplitReveal text="Days you'll still be telling stories about." className={`mt-6 max-w-[14ch] ${H2}`} italicWords={["stories"]} inlineImage={{ after: 1, src: items[1]?.image ?? items[0]?.image ?? "" }} />
        </div>
        <PillButton href="/experiences" variant="ghost-light" className="self-start md:self-auto">All experiences</PillButton>
      </div>

      <div ref={ref} className="container-x relative mt-14 pb-24 md:mt-20 md:pb-36">
        {items.map((e, i) => (
          <StackCard key={e.id} item={e} i={i} total={items.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}

function StackCard({ item, i, total, progress }: { item: Experience; i: number; total: number; progress: MotionValue<number> }) {
  const start = i / total;
  const scale = useTransform(progress, [start, 1], [1, 1 - (total - i) * 0.035]);
  const imgScale = useTransform(progress, [start, Math.min(1, start + 1 / total)], [1.15, 1]);
  const panel = PANELS[i % PANELS.length];
  const light = panel.includes("text-white");
  return (
    <div className="sticky h-[80svh] md:h-[78vh]" style={{ top: `calc(4.5rem + ${i * 16}px)` }}>
      <motion.article
        style={{ scale }}
        className="relative grid h-[74svh] origin-top grid-rows-[1.15fr_1fr] overflow-hidden rounded-[32px] md:h-[72vh] md:grid-cols-[1.35fr_1fr] md:grid-rows-1"
      >
        <div className="relative overflow-hidden">
          <motion.div style={{ scale: imgScale }} className="absolute inset-0">
            <Img src={item.image} alt={item.title} fill sizes="(min-width:768px) 60vw, 100vw" className="object-cover" />
          </motion.div>
          <span className="absolute left-4 top-4 rounded-full bg-black/30 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">{item.category}</span>
        </div>
        <div className={cn("flex flex-col justify-between p-6 md:p-10", panel)}>
          <div className="flex items-start justify-between">
            <span className={cn("font-display text-[clamp(3.5rem,8vw,7rem)] leading-[0.8] tracking-[-0.05em]", light ? "text-white/25" : "text-ink/15")}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", light ? "bg-white/15" : "bg-ink/5")}>{item.duration}</span>
          </div>
          <div>
            <h3 className="font-display text-[clamp(2rem,3.6vw,3.4rem)] leading-[0.9] tracking-[-0.04em]">{item.title}</h3>
            <p className={cn("mt-3 hidden max-w-sm md:block", light ? "text-white/80" : "text-ink/70")}>{item.description}</p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">from {formatMoney(item.price)}</span>
              <Link
                href={`/contact?type=general&subject=${encodeURIComponent(item.title)}`}
                className={cn("rounded-full px-4 py-2 text-sm font-semibold transition-transform active:scale-95", light ? "bg-white text-ink" : "bg-ink text-white")}
              >
                Enquire →
              </Link>
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}
