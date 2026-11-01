"use client";

import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import { createContext, useContext, useEffect, useState } from "react";
import type { SiteSettings } from "@/lib/types";
import { EXPO, QUART } from "./motion";

const IntroCtx = createContext(true);
/** true once the intro has finished (or was skipped) — use to delay hero animations. */
export const useIntroDone = () => useContext(IntroCtx);

const KEY = "aranya:intro-seen";

export default function Intro({ config, children }: { config: SiteSettings["intro"]; children: React.ReactNode }) {
  // "pending" until we know whether to play (avoids SSR flash)
  const [state, setState] = useState<"pending" | "playing" | "done">(config.enabled ? "pending" : "done");

  useEffect(() => {
    if (!config.enabled) return;
    const seen = config.oncePerSession && sessionStorage.getItem(KEY);
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
      {state === "pending" && <div className="fixed inset-0 z-[100] bg-ink" />}
      <AnimatePresence>{state === "playing" && <IntroOverlay key="intro" config={config} onDone={finish} />}</AnimatePresence>
      {children}
    </IntroCtx.Provider>
  );
}

function IntroOverlay({ config, onDone }: { config: SiteSettings["intro"]; onDone: () => void }) {
  const D = Math.max(1.6, Math.min(8, config.duration || 3));
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => String(Math.round(v)).padStart(3, "0"));
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const letters = (config.text || "Aranya").split("");
  const lineScale = useTransform(count, [0, 100], [0, 1]);

  useEffect(() => {
    const c = animate(count, 100, { duration: D * 0.62, ease: [0.65, 0, 0.35, 1] });
    const t1 = setTimeout(() => setPhase(1), D * 620);
    const t2 = setTimeout(() => setPhase(2), D * 880);
    const t3 = setTimeout(onDone, D * 1000);
    return () => {
      c.stop();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exit = { y: "-100%", transition: { duration: 1.1, ease: QUART } };

  if (config.style === "letters") {
    return (
      <motion.div exit={{ opacity: 0, transition: { duration: 0.8 } }} className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink text-paper">
        <div className="flex overflow-hidden font-display text-[22vw] leading-none md:text-[14vw]">
          {letters.map((l, i) => (
            <motion.span
              key={i}
              initial={{ y: "100%", opacity: 0 }}
              animate={phase < 2 ? { y: "0%", opacity: 1 } : { y: "-100%", opacity: 0 }}
              transition={{ duration: 1, ease: EXPO, delay: phase < 2 ? 0.2 + i * 0.08 : i * 0.04 }}
              className={i % 2 ? "italic text-accent" : ""}
            >
              {l}
            </motion.span>
          ))}
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: phase < 2 ? 0.7 : 0 }} transition={{ delay: 0.9, duration: 0.8 }} className="eyebrow mt-6">
          {config.subtext}
        </motion.p>
      </motion.div>
    );
  }

  if (config.style === "counter") {
    return (
      <motion.div exit={exit} className="fixed inset-0 z-[100] flex flex-col justify-between bg-ink p-6 text-paper md:p-10">
        <div className="flex items-start justify-between">
          <span className="eyebrow opacity-70">{config.text}</span>
          <span className="eyebrow opacity-70">{config.subtext}</span>
        </div>
        <div className="flex items-end justify-between">
          <motion.span className="font-display text-[34vw] leading-[0.8] tracking-tight md:text-[22vw]">{rounded}</motion.span>
          <motion.span className="mb-4 h-px flex-1 origin-left bg-paper/30 md:mb-10 md:ml-10" style={{ scaleX: lineScale }} />
        </div>
      </motion.div>
    );
  }

  // curtain (default): letters + counter, a framed image that expands to full bleed, then the curtain lifts.
  return (
    <motion.div exit={exit} className="fixed inset-0 z-[100] overflow-hidden bg-ink text-paper">
      <motion.div
        className="absolute inset-0"
        initial={{ clipPath: "inset(38% 36% 38% 36% round 999px)" }}
        animate={
          phase === 0
            ? { clipPath: "inset(36% 30% 36% 30% round 28px)" }
            : { clipPath: "inset(0% 0% 0% 0% round 0px)" }
        }
        transition={{ duration: phase === 0 ? D * 0.6 : 1.1, ease: phase === 0 ? EXPO : QUART }}
      >
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${config.image})` }}
          initial={{ scale: 1.5 }}
          animate={{ scale: phase === 0 ? 1.25 : 1 }}
          transition={{ duration: D * 0.8, ease: EXPO }}
        />
        <div className="absolute inset-0 bg-ink/30" />
      </motion.div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center mix-blend-difference">
        <div className="flex overflow-hidden font-display text-[19vw] leading-[0.9] md:text-[11vw]">
          {letters.map((l, i) => (
            <motion.span
              key={i}
              initial={{ y: "105%" }}
              animate={{ y: phase === 2 ? "-105%" : "0%" }}
              transition={{ duration: 1, ease: EXPO, delay: phase === 2 ? i * 0.03 : 0.15 + i * 0.07 }}
              className={i === 0 ? "" : i === letters.length - 1 ? "italic" : ""}
            >
              {l}
            </motion.span>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-6 md:p-10">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: phase === 2 ? 0 : 0.8, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="eyebrow max-w-[16rem]">
          {config.subtext}
        </motion.p>
        <motion.span animate={{ opacity: phase === 2 ? 0 : 1 }} className="font-mono text-sm tabular-nums">
          <motion.span>{rounded}</motion.span>
        </motion.span>
      </div>
    </motion.div>
  );
}
