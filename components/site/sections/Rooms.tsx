"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Room } from "@/lib/types";
import RoomCard from "../RoomCard";
import { PillButton, SectionLabel, SplitReveal } from "../motion";

export default function Rooms({ rooms }: { rooms: Room[] }) {
  const track = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const measure = () => {
      if (!track.current) return;
      setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth + 40));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [rooms.length]);

  const header = (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <SectionLabel index="02">Rooms & Villas</SectionLabel>
        <SplitReveal text="Six ways to wake up somewhere else." className="mt-5 max-w-[16ch] font-display text-[clamp(2.4rem,6vw,5.5rem)] leading-[0.95] tracking-[-0.025em]" italicWords={["somewhere", "else"]} />
      </div>
      <PillButton href="/rooms" variant="ghost" className="self-start md:self-auto">View all stays</PillButton>
    </div>
  );

  return (
    <>
      {/* Mobile: native swipe carousel */}
      <section id="rooms" className="bg-paper py-20 md:hidden">
        <div className="container-x">{header}</div>
        <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2">
          {rooms.map((r, i) => (
            <RoomCard key={r.id} room={r} index={i} className="w-[82vw] shrink-0 snap-center" />
          ))}
        </div>
      </section>

      {/* Desktop: pinned horizontal scroll */}
      <section ref={section} className="relative hidden bg-paper md:block" style={{ height: `calc(100vh + ${distance}px)` }}>
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <div className="container-x mb-12">{header}</div>
          <motion.div ref={track} style={{ x }} className="flex gap-6 pl-10 will-change-transform">
            {rooms.map((r, i) => (
              <RoomCard key={r.id} room={r} index={i} className="w-[min(30vw,420px)] shrink-0" sizes="420px" />
            ))}
            <div className="flex w-[min(30vw,420px)] shrink-0 flex-col justify-center rounded-[24px] bg-ink p-10 text-paper">
              <p className="eyebrow text-paper/50">Not sure yet?</p>
              <p className="mt-4 font-display text-4xl leading-tight">Let our concierge match you to the right villa.</p>
              <PillButton href="/contact?type=stay" variant="paper" className="mt-8 self-start">Ask us</PillButton>
            </div>
          </motion.div>
          <div className="container-x mt-12">
            <div className="h-px w-full bg-line">
              <motion.div style={{ width: bar }} className="h-px bg-ink" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
