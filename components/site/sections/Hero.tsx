"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { SiteSettings } from "@/lib/types";
import BookingBar from "../BookingBar";
import { useIntroDone } from "../Intro";
import { EXPO, Img, Magnetic, PillButton } from "../motion";

export default function Hero({ hero, brand }: { hero: SiteSettings["hero"]; brand: SiteSettings["brand"] }) {
  const ref = useRef<HTMLElement>(null);
  const ready = useIntroDone();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const clip = useTransform(scrollYProgress, [0, 0.8], ["inset(0% 0% 0% 0% round 0px)", "inset(6% 4% 10% 4% round 36px)"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.32]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const words = hero.title.split(" ");
  const enter = (i: number) => ({
    initial: { y: "115%" },
    animate: ready ? { y: "0%" } : undefined,
    transition: { duration: 1.3, ease: EXPO, delay: 0.15 + i * 0.07 },
  });

  return (
    <section ref={ref} className="relative h-[160svh] bg-ink">
      <div className="sticky top-0 h-svh overflow-hidden">
        <motion.div style={{ clipPath: clip }} className="absolute inset-0">
          <motion.div
            style={{ scale }}
            initial={{ opacity: 0.4 }}
            animate={ready ? { opacity: 1 } : undefined}
            transition={{ duration: 1.6 }}
            className="absolute inset-0"
          >
            {hero.video ? (
              <video src={hero.video} poster={hero.image} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <Img src={hero.image} alt={hero.title} fill priority sizes="100vw" className="object-cover" />
            )}
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/70" />
        </motion.div>

        <motion.div style={{ y: textY, opacity: fade }} className="container-x relative flex h-full flex-col justify-end pb-28 text-white md:justify-center md:pb-0 md:pt-24">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={ready ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1, ease: EXPO, delay: 0.1 }}
            className="eyebrow mb-5 flex items-center gap-3 text-white/80"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
            {hero.eyebrow}
          </motion.p>
          <h1 className="max-w-[14ch] font-display text-[clamp(3.2rem,11vw,10.5rem)] leading-[0.88] tracking-[-0.03em]" aria-label={hero.title}>
            {words.map((w, i) => (
              <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-bottom">
                <motion.span {...enter(i)} className={`inline-block ${i === words.length - 1 || i === words.length - 2 ? "italic" : ""}`}>
                  {w}
                </motion.span>
              </span>
            )).flatMap((el, i) => (i ? [" ", el] : [el]))}
          </h1>
          <div className="mt-7 flex flex-col gap-6 md:mt-10 md:flex-row md:items-end md:justify-between">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={ready ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 1.2, ease: EXPO, delay: 0.6 }}
              className="max-w-md text-[1.0625rem] leading-relaxed text-white/80 text-pretty"
            >
              {hero.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={ready ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 1.2, ease: EXPO, delay: 0.75 }}
              className="flex flex-wrap gap-3"
            >
              <Magnetic>
                <PillButton href="/book" variant="paper">{hero.ctaPrimary}</PillButton>
              </Magnetic>
              <PillButton href="/rooms" variant="ghost-light" className="hidden sm:inline-flex">{hero.ctaSecondary}</PillButton>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1.2, ease: EXPO, delay: 0.95 }}
          style={{ opacity: fade }}
          className="absolute inset-x-0 bottom-8 hidden md:block"
        >
          <div className="container-x flex items-end justify-between gap-6">
            <BookingBar className="max-w-3xl flex-1" />
            <div className="hidden text-right text-white/60 lg:block">
              <p className="font-mono text-xs">{brand.coordinates}</p>
              <p className="eyebrow mt-2 flex items-center justify-end gap-2">
                Scroll
                <span className="relative block h-6 w-px overflow-hidden bg-white/20">
                  <motion.span className="absolute inset-x-0 top-0 h-2 bg-white" animate={{ y: [-8, 24] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
