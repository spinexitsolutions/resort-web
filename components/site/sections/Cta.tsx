"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import BookingBar from "../BookingBar";
import { Img } from "../motion";

export default function Cta({ image }: { image: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  return (
    <section ref={ref} id="newsletter" className="relative overflow-hidden bg-ink py-28 text-paper md:py-44">
      <motion.div style={{ y }} className="absolute -inset-y-[15%] inset-x-0 opacity-50">
        <Img src={image} alt="" fill sizes="100vw" className="object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/40 to-ink" />
      <div className="container-x relative text-center">
        <p className="eyebrow text-paper/60">Book direct · Best rate guaranteed</p>
        <h2 className="mx-auto mt-6 max-w-[14ch] font-display text-[clamp(2.8rem,8vw,7.5rem)] leading-[0.9] tracking-[-0.03em]">
          Your villa is <span className="italic text-accent">waiting.</span>
        </h2>
        <div className="mx-auto mt-12 max-w-3xl text-left">
          <BookingBar />
        </div>
      </div>
    </section>
  );
}
