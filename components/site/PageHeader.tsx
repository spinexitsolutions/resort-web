"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { EXPO, Img } from "./motion";

type Stat = { value: string; label: string };

/**
 * Framed page hero shared by all inner pages.
 * - with `image`: full-bleed photo inside a rounded frame, giant white title
 * - without: a solid coral / ink / lagoon frame
 */
export default function PageHeader({
  eyebrow,
  title,
  intro,
  image,
  accent = [],
  stats = [],
  tone = "accent",
  compact,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  image?: string;
  accent?: string[];
  stats?: Stat[];
  tone?: "accent" | "ink" | "lagoon";
  compact?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const radius = useTransform(scrollYProgress, [0, 1], [28, 56]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);

  const bg = image ? "bg-ink" : tone === "ink" ? "bg-ink" : tone === "lagoon" ? "bg-lagoon" : "bg-accent";
  const words = title.split(" ");

  return (
    <header ref={ref} className="bg-paper p-2 md:p-3">
      <motion.div
        style={{ scale, borderRadius: radius }}
        initial={{ clipPath: "inset(6% 6% 6% 6% round 48px)" }}
        animate={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }}
        transition={{ duration: 1.4, ease: EXPO, delay: 0.15 }}
        className={cn("relative origin-top overflow-hidden text-white", bg, compact ? "min-h-[64svh]" : "min-h-[82svh]")}
      >
        {image ? (
          <>
            <motion.div style={{ y: imgY }} className="absolute inset-0">
              <motion.div initial={{ scale: 1.25 }} animate={{ scale: 1.05 }} transition={{ duration: 2.2, ease: EXPO }} className="absolute inset-0">
                <Img src={image} alt={title} fill priority sizes="100vw" className="object-cover" />
              </motion.div>
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/40" />
          </>
        ) : (
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* soft orbiting shapes keep solid frames alive */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute -right-[20%] -top-[30%] aspect-square w-[70vw] rounded-full border border-white/15"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
              className="absolute -right-[10%] -top-[18%] aspect-square w-[48vw] rounded-full border border-white/10"
            />
            <div className="absolute -bottom-1/3 -left-1/4 aspect-square w-[60vw] rounded-full bg-white/[0.06] blur-3xl" />
          </div>
        )}

        <motion.div style={{ y: textY }} className={cn("container-x relative flex flex-col justify-between gap-10 pb-6 pt-24 md:pb-10 md:pt-32", compact ? "min-h-[64svh]" : "min-h-[82svh]")}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <motion.nav initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EXPO, delay: 0.4 }} className="flex items-center gap-2 text-sm">
              <Link href="/" className="rounded-full bg-white/15 px-3 py-1.5 font-medium backdrop-blur-md transition-colors hover:bg-white/25">Aranya</Link>
              <span className="text-white/50">/</span>
              <span className={cn("rounded-full px-3 py-1.5 font-semibold", image ? "bg-accent" : "bg-white text-ink")}>{eyebrow}</span>
            </motion.nav>
            {stats.length > 0 && (
              <motion.dl initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EXPO, delay: 0.6 }} className="flex gap-2">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-2xl bg-black/20 px-4 py-2.5 text-right backdrop-blur-md ring-1 ring-white/15">
                    <dt className="text-[0.68rem] font-semibold uppercase tracking-wider text-white/60">{s.label}</dt>
                    <dd className="text-lg font-semibold tabular-nums tracking-tight">{s.value}</dd>
                  </div>
                ))}
              </motion.dl>
            )}
          </div>

          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <h1 aria-label={title} className="max-w-[12ch] font-display text-[clamp(3.6rem,11.5vw,11rem)] leading-[0.82] tracking-[-0.055em]">
              {words
                .map((w, i) => (
                  <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
                    <motion.span
                      initial={{ y: "110%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 1.2, ease: EXPO, delay: 0.45 + i * 0.06 }}
                      className={cn("inline-block", accent.includes(w) && (image ? "text-accent" : tone === "accent" ? "text-ink" : "text-accent"))}
                    >
                      {w}
                    </motion.span>
                  </span>
                ))
                .flatMap((el, i) => (i ? [" ", el] : [el]))}
            </h1>
            {intro && (
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: EXPO, delay: 0.85 }}
                className="max-w-sm text-[1.05rem] font-medium leading-relaxed text-white/85 text-pretty lg:mb-3"
              >
                {intro}
              </motion.p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </header>
  );
}
