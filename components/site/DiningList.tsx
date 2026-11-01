"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import type { Dining } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Img, Reveal } from "./motion";

const TONES = ["bg-paper text-ink", "bg-ink text-white", "bg-lagoon text-white", "bg-accent text-white"];

export default function DiningList({ items }: { items: Dining[] }) {
  return (
    <div>
      {items.map((d, i) => (
        <Venue key={d.id} d={d} i={i} />
      ))}
    </div>
  );
}

function Venue({ d, i }: { d: Dining; i: number }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], [i % 2 ? "-20%" : "10%", i % 2 ? "5%" : "-25%"]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const rot = useTransform(scrollYProgress, [0, 1], [i % 2 ? 6 : -6, i % 2 ? -4 : 4]);
  const tone = TONES[i % TONES.length];
  const light = tone.includes("text-white");

  return (
    <section ref={ref} className={cn("relative overflow-hidden py-20 md:py-28", tone)}>
      {/* giant moving name */}
      <motion.p style={{ x }} aria-hidden className={cn("pointer-events-none whitespace-nowrap font-display text-[clamp(6rem,22vw,20rem)] leading-[0.8] tracking-[-0.06em]", light ? "text-white/10" : "text-ink/[0.06]")}>
        {d.name} · {d.name}
      </motion.p>

      <div className="container-x relative -mt-[clamp(3rem,10vw,9rem)] grid items-center gap-10 md:grid-cols-12">
        <motion.div style={{ rotate: rot }} className={cn("relative aspect-[4/5] overflow-hidden rounded-[32px] shadow-2xl md:col-span-6", i % 2 && "md:order-2 md:col-start-7")}>
          <motion.div style={{ y: imgY }} className="absolute -inset-y-[12%] inset-x-0">
            <Img src={d.image} alt={d.name} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
          </motion.div>
          <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ink">{d.cuisine}</span>
        </motion.div>
        <div className={cn("md:col-span-5", i % 2 ? "md:col-start-1" : "md:col-start-8")}>
          <Reveal>
            <span className={cn("text-sm font-semibold tabular-nums", light ? "text-white/60" : "text-accent")}>{String(i + 1).padStart(2, "0")} / Restaurant</span>
            <h2 className="mt-3 font-display text-[clamp(3.4rem,7vw,6.5rem)] leading-[0.85] tracking-[-0.055em]">{d.name}</h2>
            <p className={cn("mt-6 text-lg leading-relaxed", light ? "text-white/80" : "text-ink/70")}>{d.description}</p>
            <div className="mt-8 grid grid-cols-2 gap-2">
              <div className={cn("rounded-[20px] p-4", light ? "bg-white/10" : "bg-white")}>
                <p className={cn("text-xs font-semibold uppercase tracking-wider", light ? "text-white/55" : "text-muted")}>Hours</p>
                <p className="mt-1 font-semibold">{d.hours}</p>
              </div>
              <div className={cn("rounded-[20px] p-4", light ? "bg-white/10" : "bg-white")}>
                <p className={cn("text-xs font-semibold uppercase tracking-wider", light ? "text-white/55" : "text-muted")}>Signature</p>
                <p className="mt-1 font-semibold leading-snug">{d.signature}</p>
              </div>
            </div>
            <Link
              href={`/contact?type=dining&subject=${encodeURIComponent("Table at " + d.name)}`}
              className={cn("mt-8 inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold transition-transform active:scale-95", tone.startsWith("bg-accent") ? "bg-white text-ink" : "bg-accent text-white")}
            >
              Reserve a table →
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
