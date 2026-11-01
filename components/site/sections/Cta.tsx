"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import BookingBar from "../BookingBar";
import { Img } from "../motion";

export default function Cta({ image }: { image: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], ["8%", "-18%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-22%", "4%"]);
  const rot = useTransform(scrollYProgress, [0, 1], [-10, 8]);

  return (
    <section ref={ref} id="newsletter" className="relative overflow-hidden bg-accent py-24 text-white md:py-36">
      <div className="pointer-events-none select-none font-display leading-[0.82] tracking-[-0.06em]" aria-hidden>
        <motion.p style={{ x: x1 }} className="whitespace-nowrap text-[clamp(5rem,17vw,16rem)]">Your villa is</motion.p>
        <motion.p style={{ x: x2 }} className="whitespace-nowrap text-[clamp(5rem,17vw,16rem)] text-ink">waiting. waiting.</motion.p>
      </div>
      <motion.div style={{ rotate: rot }} className="absolute right-[6%] top-[12%] hidden h-56 w-44 overflow-hidden rounded-[28px] shadow-2xl ring-8 ring-white/20 lg:block">
        <Img src={image} alt="" fill sizes="200px" className="object-cover" />
      </motion.div>
      <div className="container-x relative mt-12">
        <h2 className="sr-only">Your villa is waiting</h2>
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-center text-sm font-semibold text-white/85">Book direct · Best rate guaranteed · Free cancellation</p>
          <BookingBar />
        </div>
      </div>
    </section>
  );
}
