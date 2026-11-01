"use client";

import { AnimatePresence, animate, motion, useMotionTemplate, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { createContext, useContext, useEffect, useState } from "react";
import type { SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

const IntroCtx = createContext(true);
/** true once the intro has finished (or was skipped) — use to delay hero animations. */
export const useIntroDone = () => useContext(IntroCtx);

const KEY = "aranya:intro-seen";
const EXPO = [0.16, 1, 0.3, 1] as const;
const QUART = [0.76, 0, 0.24, 1] as const;

export default function Intro({ config, images, children }: { config: SiteSettings["intro"]; images?: string[]; children: React.ReactNode }) {
  // "pending" until we know whether to play (avoids SSR flash)
  const [state, setState] = useState<"pending" | "playing" | "done">(config.enabled ? "pending" : "done");

  useEffect(() => {
    if (!config.enabled) return;
    let seen = false;
    try {
      seen = !!(config.oncePerSession && sessionStorage.getItem(KEY));
    } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduce) {
      setState("done");
      return;
    }
    setState("playing");
    document.documentElement.style.overflow = "hidden";
  }, [config.enabled, config.oncePerSession]);

  const finish = () => {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
    document.documentElement.style.overflow = "";
    setState("done");
  };

  return (
    <IntroCtx.Provider value={state === "done"}>
      {/* Solid cover while deciding, prevents content flash before the intro mounts */}
      {state === "pending" && <div className="fixed inset-0 z-[100] bg-accent" />}
      <AnimatePresence>{state === "playing" && <IntroOverlay key="intro" config={config} images={images} onDone={finish} />}</AnimatePresence>
      {children}
    </IntroCtx.Provider>
  );
}

/**
 * The intro sequence. Sized with container units (cqw/cqh) so the exact same
 * component renders full-screen on the site and inside the admin preview.
 */
export function IntroOverlay({
  config,
  images,
  onDone,
  contained,
}: {
  config: SiteSettings["intro"];
  images?: string[];
  onDone?: () => void;
  contained?: boolean;
}) {
  const D = Math.max(1.6, Math.min(8, config.duration || 3));
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => String(Math.round(v)).padStart(3, "0"));
  const bar = useTransform(count, [0, 100], ["0%", "100%"]);
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const word = config.text || "Aranya";
  const letters = word.split("");
  const imgs = [images?.[0] || config.image, images?.[1] || config.image];
  // overlay only mounts on the client, so reading the viewport here is safe
  const [portrait] = useState(() => !contained && typeof window !== "undefined" && window.innerHeight > window.innerWidth);
  const cardW = portrait ? "36%" : "18%";
  const cardH = portrait ? "34%" : "46%";
  const cardTop = portrait ? "33%" : "27%";
  const pos = portrait ? [["16%", "48%"], ["14%", "50%"]] : [["36%", "46%"], ["33%", "49%"]];

  useEffect(() => {
    const c = animate(count, 100, { duration: D * 0.6, ease: [0.65, 0, 0.35, 1] });
    const t1 = setTimeout(() => setPhase(1), D * 600);
    const t2 = setTimeout(() => setPhase(2), D * 860);
    const t3 = setTimeout(() => onDone?.(), D * 1000);
    return () => {
      c.stop();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shell = cn(contained ? "absolute" : "fixed", "inset-0 z-[100] overflow-hidden [container-type:size]");

  /* ───────────── Counter: one giant number whose weight & width grow as it counts ───────────── */
  if (config.style === "counter") {
    return <CounterIntro shell={shell} config={config} count={count} rounded={rounded} bar={bar} phase={phase} />;
  }

  /* ───────────── Letters: each letter is a sticker that drops in ───────────── */
  if (config.style === "letters") {
    const tones = ["bg-accent text-white", "bg-paper text-ink", "bg-white text-ink", "bg-lagoon text-white"];
    return (
      <motion.div
        className={cn(shell, "grid place-items-center bg-ink text-white")}
        initial={{ clipPath: "circle(150% at 50% 50%)" }}
        exit={{ clipPath: "circle(0% at 50% 50%)", transition: { duration: 1, ease: QUART } }}
      >
        <div className="flex flex-col items-center gap-[3cqh]">
          <div className="flex flex-wrap justify-center gap-[1.2cqw] px-[4cqw]">
            {letters.map((l, i) => (
              <motion.span
                key={i}
                initial={{ y: "-120cqh", rotate: (i % 2 ? 1 : -1) * (20 + i * 6), opacity: 1 }}
                animate={
                  phase < 2
                    ? { y: 0, rotate: (i % 2 ? 1 : -1) * (phase === 1 ? 0 : 6 + (i % 3) * 3), opacity: 1 }
                    : { y: "-30cqh", rotate: (i % 2 ? -1 : 1) * 30, opacity: 0 }
                }
                transition={
                  phase < 2
                    ? { type: "spring", stiffness: 140, damping: 13, delay: 0.1 + i * (D * 0.05) }
                    : { duration: 0.7, ease: QUART, delay: i * 0.04 }
                }
                className={cn(
                  "grid min-w-[13cqw] place-items-center rounded-[3.5cqw] px-[2cqw] py-[1cqw] font-display text-[clamp(3rem,17cqw,15rem)] leading-[0.9] tracking-[-0.05em] shadow-2xl",
                  tones[i % tones.length],
                )}
              >
                {l === " " ? " " : l}
              </motion.span>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: phase < 2 ? 1 : 0, y: phase < 2 ? 0 : -10 }}
            transition={{ delay: phase < 2 ? D * 0.4 : 0, duration: 0.6, ease: EXPO }}
            className="rounded-full bg-white/10 px-[2.2cqw] py-[0.9cqw] text-[clamp(0.7rem,1.6cqw,1.1rem)] font-semibold ring-1 ring-white/15"
          >
            {config.subtext}
          </motion.p>
        </div>
      </motion.div>
    );
  }

  /* ───────────── Split (default "curtain"): forest & sea cards become the hero's two halves ───────────── */
  return (
    <motion.div className={cn(shell, "bg-accent text-ink")} exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeOut" } }}>
      {/* header row */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-[3cqw] md:p-[2.2cqw]">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: phase === 0 ? 1 : 0, y: 0 }}
          transition={{ duration: 0.6, ease: EXPO }}
          className="rounded-full bg-ink px-[1.6cqw] py-[0.7cqw] text-[clamp(0.65rem,1.3cqw,0.9rem)] font-semibold text-white"
        >
          {config.subtext}
        </motion.span>
        <motion.span animate={{ opacity: phase === 0 ? 1 : 0 }} className="font-display text-[clamp(1rem,2.4cqw,2rem)] tracking-[-0.04em] tabular-nums">
          <motion.span>{rounded}</motion.span>
        </motion.span>
      </div>

      {/* the two photo cards */}
      {[0, 1].map((k) => {
        const left = k === 0;
        return (
          <motion.div
            key={k}
            className="absolute top-0 z-10 overflow-hidden bg-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)]"
            initial={{
              left: pos[0][k],
              width: cardW,
              top: "120%",
              height: cardH,
              rotate: left ? -14 : 14,
              borderRadius: 28,
            }}
            animate={
              phase === 0
                ? { left: pos[1][k], width: cardW, top: cardTop, height: cardH, rotate: left ? -7 : 7, borderRadius: 28 }
                : portrait
                  ? { left: "0%", width: "100%", top: left ? "0%" : "50%", height: "50%", rotate: 0, borderRadius: 0 }
                  : { left: left ? "0%" : "50%", width: "50%", top: "0%", height: "100%", rotate: 0, borderRadius: 0 }
            }
            transition={phase === 0 ? { type: "spring", stiffness: 70, damping: 15, delay: 0.15 + k * 0.12 } : { duration: 1, ease: QUART, delay: k * 0.04 }}
          >
            <motion.div
              className="absolute bg-cover bg-center"
              style={
                portrait
                  ? { backgroundImage: `url(${imgs[k]})`, left: 0, right: 0, height: "200%", top: left ? "0%" : "-100%" }
                  : { backgroundImage: `url(${imgs[k]})`, top: 0, bottom: 0, width: "200%", left: left ? "0%" : "-100%" }
              }
              initial={{ scale: 1.3 }}
              animate={{ scale: phase === 0 ? 1.15 : 1.02 }}
              transition={{ duration: D * 0.8, ease: EXPO }}
            />
          </motion.div>
        );
      })}

      {/* seam that matches the hero */}
      <motion.span
        className={cn("absolute z-10 bg-white/70", portrait ? "inset-x-0 top-1/2 h-px origin-left" : "inset-y-0 left-1/2 w-px origin-top")}
        initial={portrait ? { scaleX: 0 } : { scaleY: 0 }}
        animate={portrait ? { scaleX: phase >= 1 ? 1 : 0 } : { scaleY: phase >= 1 ? 1 : 0 }}
        transition={{ duration: 0.9, ease: QUART, delay: 0.3 }}
      />

      {/* giant word, sits above the cards */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-center overflow-hidden mix-blend-normal">
        <div className="flex font-display text-[clamp(4rem,24cqw,24rem)] leading-[0.8] tracking-[-0.06em]">
          {letters.map((l, i) => (
            <motion.span
              key={i}
              initial={{ y: "110%" }}
              animate={{ y: phase === 0 ? "0%" : "-115%" }}
              transition={{ duration: phase === 0 ? 1.1 : 0.8, ease: phase === 0 ? EXPO : QUART, delay: phase === 0 ? 0.35 + i * 0.06 : i * 0.035 }}
              className={i === letters.length - 1 ? "text-white" : "text-ink"}
            >
              {l === " " ? " " : l}
            </motion.span>
          ))}
        </div>
      </div>

      {/* progress */}
      <div className="absolute inset-x-[3cqw] bottom-[3cqw] z-20 md:inset-x-[2.2cqw] md:bottom-[2.2cqw]">
        <motion.div animate={{ opacity: phase === 0 ? 1 : 0 }} className="h-[0.5cqh] min-h-1 overflow-hidden rounded-full bg-ink/15">
          <motion.div style={{ width: bar }} className="h-full rounded-full bg-ink" />
        </motion.div>
      </div>
    </motion.div>
  );
}

function CounterIntro({
  shell,
  config,
  count,
  rounded,
  bar,
  phase,
}: {
  shell: string;
  config: SiteSettings["intro"];
  count: MotionValue<number>;
  rounded: MotionValue<string>;
  bar: MotionValue<string>;
  phase: 0 | 1 | 2;
}) {
  const wght = useTransform(count, [0, 100], [200, 800]);
  const wdth = useTransform(count, [0, 100], [75, 100]);
  const font = useMotionTemplate`"wght" ${wght}, "wdth" ${wdth}, "opsz" 96`;
  return (
    <motion.div
      className={cn(shell, "flex flex-col justify-between bg-accent p-[3cqw] text-ink md:p-[2.2cqw]")}
      exit={{ y: "-100%", borderBottomLeftRadius: "40%", borderBottomRightRadius: "40%", transition: { duration: 1.1, ease: QUART } }}
    >
      <div className="flex items-center justify-between">
        <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-[clamp(1.4rem,4cqw,3rem)] leading-none tracking-[-0.04em]">
          {config.text}
        </motion.span>
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="rounded-full bg-ink px-[1.6cqw] py-[0.7cqw] text-[clamp(0.65rem,1.3cqw,0.9rem)] font-semibold text-white">
          {config.subtext}
        </motion.span>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden">
        <motion.span
          style={{ fontVariationSettings: font }}
          animate={{ y: phase === 2 ? "-30%" : "0%", opacity: phase === 2 ? 0 : 1 }}
          transition={{ duration: 0.6, ease: QUART }}
          className={cn("font-display text-[clamp(8rem,46cqw,48rem)] leading-[0.78] tracking-[-0.07em] tabular-nums transition-colors duration-500", phase >= 1 ? "text-white" : "text-ink")}
        >
          {rounded}
        </motion.span>
      </div>

      <div className="flex items-center gap-[2cqw]">
        <div className="h-[1.2cqh] min-h-2 flex-1 overflow-hidden rounded-full bg-ink/15">
          <motion.div style={{ width: bar }} className="h-full rounded-full bg-ink" />
        </div>
        <span className="text-[clamp(0.7rem,1.3cqw,0.95rem)] font-semibold">Loading the island</span>
      </div>
    </motion.div>
  );
}
