"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import type { Experience } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { Img, PillButton, SectionLabel, SplitReveal } from "../motion";

export default function Experiences({ items }: { items: Experience[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section id="experiences" className="bg-ink pt-24 text-paper md:pt-36">
      <div className="container-x flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <SectionLabel index="03" light>Experiences</SectionLabel>
          <SplitReveal text="Days you'll still be telling stories about." className="mt-5 max-w-[15ch] font-display text-[clamp(2.4rem,6vw,5.5rem)] leading-[0.95] tracking-[-0.025em]" italicWords={["stories"]} />
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
  const scale = useTransform(progress, [start, 1], [1, 1 - (total - i) * 0.04]);
  const dim = useTransform(progress, [start, Math.min(1, start + 1 / total)], [0, i === total - 1 ? 0 : 0.5]);
  return (
    <div className="sticky h-[78svh] md:h-[80vh]" style={{ top: `calc(5rem + ${i * 18}px)` }}>
      <motion.article style={{ scale }} className="relative h-[72svh] origin-top overflow-hidden rounded-[28px] md:h-[74vh]">
        <Img src={item.image} alt={item.title} fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        <motion.div style={{ opacity: dim }} className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-12">
          <div className="flex items-center justify-between">
            <span className="glass-dark rounded-full px-3.5 py-1.5 text-xs">{item.category}</span>
            <span className="font-mono text-xs text-white/70">
              {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>
          <div className="grid gap-6 md:grid-cols-2 md:items-end">
            <h3 className="font-display text-[clamp(2.2rem,5vw,4.5rem)] leading-[0.95] tracking-tight">{item.title}</h3>
            <div className="md:justify-self-end md:text-right">
              <p className="max-w-sm text-white/80 md:ml-auto">{item.description}</p>
              <p className="mt-4 text-sm text-white/60">
                {item.duration} · from <span className="text-white">{formatMoney(item.price)}</span>
              </p>
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}
