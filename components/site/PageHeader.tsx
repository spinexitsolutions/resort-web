"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { EXPO, Img, SplitReveal } from "./motion";

export default function PageHeader({ eyebrow, title, intro, image, italic = [] }: { eyebrow: string; title: string; intro?: string; image?: string; italic?: string[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <header ref={ref} className="relative bg-paper pt-24 md:pt-36">
      <div className="container-x">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EXPO, delay: 0.3 }} className="eyebrow text-muted">
          {eyebrow}
        </motion.p>
        <SplitReveal as="h1" text={title} delay={0.35} italicWords={italic} className="mt-5 max-w-[18ch] font-display text-[clamp(3rem,9vw,8.5rem)] leading-[0.9] tracking-[-0.03em]" />
        {intro && (
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EXPO, delay: 0.7 }} className="mt-8 max-w-xl text-[1.0625rem] leading-relaxed text-muted text-pretty">
            {intro}
          </motion.p>
        )}
      </div>
      {image && (
        <div className="container-x mt-12 md:mt-16">
          <motion.div
            initial={{ clipPath: "inset(30% 10% 0% 10% round 28px)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0% round 28px)" }}
            transition={{ duration: 1.6, ease: EXPO, delay: 0.5 }}
            className="relative aspect-[4/5] overflow-hidden rounded-[28px] sm:aspect-[16/8]"
          >
            <motion.div style={{ y, scale }} className="absolute inset-0">
              <Img src={image} alt={title} fill priority sizes="100vw" className="object-cover" />
            </motion.div>
          </motion.div>
        </div>
      )}
    </header>
  );
}
