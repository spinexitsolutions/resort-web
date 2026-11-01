"use client";

import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
} from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SiteSettings } from "@/lib/types";
import { useIntroDone } from "../Intro";
import BookingBar from "../BookingBar";
import { EXPO, Img, Magnetic } from "../motion";

/**
 * "Forest | Sea" — the resort's tagline made interactive.
 * Two photographs share one frame; the seam between them follows the cursor (desktop)
 * or your thumb (mobile, vertical split). Each word's weight & width morph with the seam.
 */
export default function Hero({ hero, brand }: { hero: SiteSettings["hero"]; brand: SiteSettings["brand"] }) {
  const ready = useIntroDone();
  const section = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [vertical, setVertical] = useState(false);
  const [time, setTime] = useState("");

  // seam position 0..1
  const seam = useMotionValue(0.5);
  const s = useSpring(seam, { stiffness: 70, damping: 18, mass: 0.9 });
  const idle = useRef<AnimationPlaybackControls | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const set = () => setVertical(mq.matches);
    set();
    mq.addEventListener("change", set);
    const fmt = () => new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date());
    setTime(fmt());
    const t = setInterval(() => setTime(fmt()), 20000);
    return () => {
      mq.removeEventListener("change", set);
      clearInterval(t);
    };
  }, []);

  // gentle tidal sway while nobody is interacting
  const startIdle = () => {
    idle.current?.stop();
    idle.current = animate(seam, [seam.get(), 0.38, 0.62, 0.5], { duration: 9, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" });
  };
  useEffect(() => {
    if (!ready) return;
    seam.set(0.5);
    const t = setTimeout(startIdle, 1600);
    return () => {
      clearTimeout(t);
      idle.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const steer = (clientX: number, clientY: number) => {
    const r = frame.current?.getBoundingClientRect();
    if (!r) return;
    idle.current?.stop();
    const v = vertical ? (clientY - r.top) / r.height : (clientX - r.left) / r.width;
    seam.set(Math.min(0.86, Math.max(0.14, v)));
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(startIdle, 3500);
  };

  // derived visuals
  const pct = useTransform(s, (v) => `${v * 100}%`);
  const clip = useTransform(s, (v) => (vertical ? `inset(${v * 100}% 0% 0% 0%)` : `inset(0% 0% 0% ${v * 100}%)`));
  const leftW = useTransform(s, [0.14, 0.86], [260, 800]);
  const rightW = useTransform(s, [0.14, 0.86], [800, 260]);
  const leftWd = useTransform(s, [0.14, 0.86], [75, 100]);
  const rightWd = useTransform(s, [0.14, 0.86], [100, 75]);
  const leftFont = useMotionTemplate`"wght" ${leftW}, "wdth" ${leftWd}, "opsz" 96`;
  const rightFont = useMotionTemplate`"wght" ${rightW}, "wdth" ${rightWd}, "opsz" 96`;
  const leftImgX = useTransform(s, [0, 1], ["-6%", "0%"]);
  const rightImgX = useTransform(s, [0, 1], ["0%", "6%"]);

  // scroll-out
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });
  const frameScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const frameRadius = useTransform(scrollYProgress, [0, 1], [28, 56]);
  const wordsY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const spreadL = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const spreadR = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  const reveal = (delay: number, from: string = "100%") => ({
    initial: { y: from },
    animate: ready ? { y: "0%" } : undefined,
    transition: { duration: 1.4, ease: EXPO, delay },
  });
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 14, filter: "blur(6px)" },
    animate: ready ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined,
    transition: { duration: 1.1, ease: EXPO, delay },
  });

  return (
    <>
    <section ref={section} className="relative h-svh min-h-[620px] bg-paper p-2 md:p-3" aria-label={hero.title}>
      <motion.div
        ref={frame}
        style={{ scale: frameScale, borderRadius: frameRadius }}
        initial={{ clipPath: "inset(8% 8% 8% 8% round 48px)" }}
        animate={ready ? { clipPath: "inset(0% 0% 0% 0% round 0px)" } : undefined}
        transition={{ duration: 1.6, ease: EXPO }}
        onPointerMove={(e) => e.pointerType === "mouse" && steer(e.clientX, e.clientY)}
        className="relative h-full origin-top overflow-hidden bg-ink text-white"
      >
        {/* Left / top: forest */}
        <motion.div style={{ x: vertical ? 0 : leftImgX }} className="absolute -inset-x-[6%] inset-y-0">
          <motion.div initial={{ scale: 1.25 }} animate={ready ? { scale: 1.02 } : undefined} transition={{ duration: 2.4, ease: EXPO }} className="absolute inset-0">
            {hero.video ? (
              <video src={hero.video} poster={hero.image} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <Img src={hero.image} alt={hero.leftWord} fill priority sizes="100vw" className="object-cover" />
            )}
          </motion.div>
        </motion.div>
        {/* Right / bottom: sea */}
        <motion.div style={{ clipPath: clip }} className="absolute inset-0">
          <motion.div style={{ x: vertical ? 0 : rightImgX }} className="absolute -inset-x-[6%] inset-y-0">
            <motion.div initial={{ scale: 1.25 }} animate={ready ? { scale: 1.02 } : undefined} transition={{ duration: 2.4, ease: EXPO, delay: 0.1 }} className="absolute inset-0">
              <Img src={hero.image2 || hero.image} alt={hero.rightWord} fill priority sizes="100vw" className="object-cover" />
            </motion.div>
          </motion.div>
        </motion.div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,transparent_40%,rgba(0,0,0,0.35)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-black/55 via-black/20 to-transparent" />

        {/* The seam */}
        <motion.div
          style={vertical ? { top: pct } : { left: pct }}
          className={vertical ? "absolute inset-x-0 z-10 h-0" : "absolute inset-y-0 z-10 w-0"}
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={ready ? { scale: 1 } : undefined}
            transition={{ duration: 1.4, ease: EXPO, delay: 0.5 }}
            className={vertical ? "absolute inset-x-0 top-0 block h-px origin-left bg-white/70" : "absolute inset-y-0 left-0 block w-px origin-top bg-white/70"}
          />
          <motion.button
            type="button"
            aria-label="Drag to explore forest and sea"
            initial={{ scale: 0, rotate: -90 }}
            animate={ready ? { scale: 1, rotate: 0 } : undefined}
            transition={{ type: "spring", stiffness: 160, damping: 16, delay: 0.9 }}
            onPointerDown={(e) => {
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (e.buttons || e.pointerType !== "mouse") steer(e.clientX, e.clientY);
            }}
            className="absolute left-0 top-1/2 flex -translate-x-1/2 -translate-y-1/2 touch-none items-center gap-2 rounded-full bg-accent py-2 pl-2 pr-4 text-sm font-semibold text-white shadow-[0_10px_40px_-8px_var(--accent)] md:top-[46%]"
            style={vertical ? { left: "50%", top: 0 } : undefined}
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20">
              <svg viewBox="0 0 20 20" className={`h-4 w-4 ${vertical ? "rotate-90" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 5L2 10l5 5M13 5l5 5-5 5" />
              </svg>
            </span>
            <span className="whitespace-nowrap">{hero.connector}</span>
          </motion.button>
        </motion.div>

        {/* Top row */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-6 p-5 pt-14 md:p-8 md:pt-28">
          <div className="max-w-sm">
            <motion.div {...fade(0.3)} className="inline-flex items-center gap-2 rounded-full bg-black/25 py-1.5 pl-2 pr-3.5 text-xs font-medium backdrop-blur-md ring-1 ring-white/15">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              {hero.eyebrow}
            </motion.div>
            <motion.p {...fade(0.45)} className="mt-5 hidden text-[1.05rem] font-medium leading-relaxed text-white text-pretty [text-shadow:0_1px_18px_rgba(0,0,0,0.45)] md:block">
              {hero.subtitle}
            </motion.p>
            <motion.div {...fade(0.6)} className="mt-7 hidden items-center gap-3 md:flex">
              <Magnetic>
                <Link href="/book" className="group relative flex h-12 items-center gap-3 overflow-hidden rounded-full bg-white pl-5 pr-1.5 text-[0.95rem] font-semibold text-ink">
                  <span className="relative z-10 transition-colors duration-500 group-hover:text-white">{hero.ctaPrimary}</span>
                  <span className="relative z-10 grid h-9 w-9 place-items-center rounded-full bg-accent text-white">
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform duration-500 ease-expo group-hover:-rotate-45" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 8h12M9 3l5 5-5 5" /></svg>
                  </span>
                  <span className="absolute inset-0 origin-right scale-x-0 rounded-full bg-accent transition-transform duration-700 ease-expo group-hover:scale-x-100" />
                </Link>
              </Magnetic>
              <Link href="/rooms" className="h-12 rounded-full px-5 text-[0.95rem] font-medium leading-[3rem] text-white ring-1 ring-white/30 backdrop-blur-sm transition-colors hover:bg-white/10">
                {hero.ctaSecondary}
              </Link>
            </motion.div>
          </div>

          <motion.dl {...fade(0.5)} className="hidden grid-cols-2 gap-2 text-right lg:grid">
            {[
              ["Local time", time || "—"],
              ["Villas", "41"],
              ["Lat / Long", brand.coordinates.replace(/° /g, "°").split(",")[0]],
              ["Water", "28°C"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-black/20 px-4 py-3 backdrop-blur-md ring-1 ring-white/10">
                <dt className="text-[0.68rem] font-medium uppercase tracking-wider text-white/55">{k}</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums tracking-tight">{v}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* The two words */}
        <motion.div style={{ y: wordsY }} className="pointer-events-none absolute inset-0 z-[5] select-none">
          <motion.h1
            style={{ x: vertical ? 0 : spreadL }}
            className={
              vertical
                ? "absolute left-4 top-[24%] overflow-hidden leading-[0.82]"
                : "absolute bottom-6 left-6 overflow-hidden leading-[0.8] md:bottom-8 md:left-8"
            }
          >
            <motion.span {...reveal(0.25)} style={{ fontVariationSettings: leftFont }} className="block font-display text-[clamp(4.6rem,21vw,19rem)] tracking-[-0.05em]">
              {hero.leftWord}
            </motion.span>
          </motion.h1>
          <motion.p
            aria-hidden
            style={{ x: vertical ? 0 : spreadR }}
            className={
              vertical
                ? "absolute bottom-24 right-4 overflow-hidden text-right leading-[0.82]"
                : "absolute bottom-6 right-6 overflow-hidden text-right leading-[0.8] md:bottom-8 md:right-8"
            }
          >
            <motion.span {...reveal(0.4)} style={{ fontVariationSettings: rightFont }} className="block font-display text-[clamp(4.6rem,21vw,19rem)] tracking-[-0.05em]">
              {hero.rightWord}
            </motion.span>
          </motion.p>
        </motion.div>

      </motion.div>
    </section>

    {/* Dock: booking + (on mobile) the intro copy */}
    <div className="relative z-10 bg-paper px-2 pb-4 md:px-3">
      <div className="container-x">
        <div className="pt-8 md:hidden">
          <p className="text-[1.05rem] leading-relaxed text-ink/75 text-pretty">{hero.subtitle}</p>
          <div className="mt-5 flex gap-2">
            <Link href="/book" className="flex h-12 flex-1 items-center justify-center rounded-full bg-accent font-semibold text-white">{hero.ctaPrimary}</Link>
            <Link href="/rooms" className="flex h-12 flex-1 items-center justify-center rounded-full font-medium ring-1 ring-line">{hero.ctaSecondary}</Link>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: EXPO }}
          className="mx-auto mt-6 max-w-4xl md:-mt-10"
        >
          <BookingBar dark={false} className="shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]" />
        </motion.div>
      </div>
    </div>
    </>
  );
}
