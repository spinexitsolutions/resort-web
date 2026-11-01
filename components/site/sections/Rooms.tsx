"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Room } from "@/lib/types";
import RoomCard from "../RoomCard";
import { H2, PillButton, SectionLabel, SplitReveal } from "../motion";

export default function Rooms({ rooms }: { rooms: Room[] }) {
  const track = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const [distance, setDistance] = useState(0);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(rooms.length - 1, Math.floor(v * rooms.length))));

  useEffect(() => {
    const measure = () => track.current && setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth + 40));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [rooms.length]);

  const header = (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <SectionLabel index="02">Rooms & Villas</SectionLabel>
        <SplitReveal text="Six ways to wake up somewhere else." className={`mt-6 max-w-[13ch] ${H2}`} italicWords={["somewhere", "else."]} inlineImage={{ after: 3, src: rooms[0]?.images[0] ?? "" }} />
      </div>
      <div className="flex items-end gap-6">
        <div className="hidden items-baseline font-display leading-none tracking-[-0.05em] md:flex" aria-hidden>
          <span className="relative block h-[1em] overflow-hidden text-[6.5rem] text-accent">
            <motion.span key={active} initial={{ y: "100%" }} animate={{ y: "0%" }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="block">
              {String(active + 1).padStart(2, "0")}
            </motion.span>
          </span>
          <span className="text-3xl text-ink/30">/{String(rooms.length).padStart(2, "0")}</span>
        </div>
        <PillButton href="/rooms" variant="ink">All stays</PillButton>
      </div>
    </div>
  );

  return (
    <>
      <section id="rooms" className="bg-paper py-20 md:hidden">
        <div className="container-x">{header}</div>
        <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
          {rooms.map((r, i) => (
            <RoomCard key={r.id} room={r} index={i} className="w-[80vw] shrink-0 snap-center" />
          ))}
        </div>
      </section>

      <section ref={section} className="relative hidden bg-paper md:block" style={{ height: `calc(100vh + ${distance}px)` }}>
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <div className="container-x mb-10">{header}</div>
          <motion.div ref={track} style={{ x }} className="flex gap-5 pl-10 will-change-transform">
            {rooms.map((r, i) => (
              <RoomCard key={r.id} room={r} index={i} className="w-[min(28vw,400px)] shrink-0" sizes="400px" />
            ))}
            <div className="flex w-[min(28vw,400px)] shrink-0 flex-col justify-between rounded-[28px] bg-accent p-8 text-white">
              <p className="text-sm font-semibold text-white/80">Not sure yet?</p>
              <p className="font-display text-[2.8rem] leading-[0.9] tracking-[-0.04em]">Let our concierge match you to the right villa.</p>
              <PillButton href="/contact?type=stay" variant="paper" className="self-start">Ask us</PillButton>
            </div>
          </motion.div>
          <div className="container-x mt-10">
            <div className="h-1 w-full overflow-hidden rounded-full bg-ink/10">
              <motion.div style={{ width: bar }} className="h-full rounded-full bg-accent" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
