"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EXPO, Img } from "./motion";
import { useLenis } from "./SmoothScroll";

type Props = { brand: SiteSettings["brand"]; nav: SiteSettings["navbar"]; belowBanner?: boolean };

const WEATHER: Record<number, string> = { 0: "Clear", 1: "Fair", 2: "Partly cloudy", 3: "Cloudy", 45: "Mist", 51: "Drizzle", 61: "Rain", 63: "Rain", 65: "Heavy rain", 80: "Showers", 81: "Showers", 95: "Storm" };

function useIslandClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date());
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 15000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function useWeather(enabled: boolean, coords: string) {
  const [w, setW] = useState<{ t: number; label: string } | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const m = coords.match(/([\d.]+).*?([\d.]+)/);
    const lat = m ? m[1] : "11.97";
    const lon = m ? m[2] : "92.98";
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`)
      .then((r) => r.json())
      .then((d) => setW({ t: Math.round(d.current.temperature_2m), label: WEATHER[d.current.weather_code] ?? "Fair" }))
      .catch(() => setW({ t: 29, label: "Fair" }));
  }, [enabled, coords]);
  return w;
}

export default function Navbar({ brand, nav, belowBanner }: Props) {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hover, setHover] = useState(0);
  const pathname = usePathname();
  const lenis = useLenis();
  const time = useIslandClock();
  const weather = useWeather(nav.showWeather, brand.coordinates);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setCompact(y > 80);
    setHidden(y > 400 && y > prev + 4 ? true : y < prev - 4 ? false : hidden);
  });

  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const set = () => setDesktop(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, lenis]);

  const links = nav.links;

  return (
    <>
      {/* Top wordmark — always visible on mobile, fades as you scroll */}
      <motion.div
        animate={{ opacity: compact ? 0 : 1, y: compact ? -16 : 0 }}
        transition={{ duration: 0.5, ease: EXPO }}
        className={cn("pointer-events-none fixed inset-x-0 z-40", belowBanner ? "top-9" : "top-0", " flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))] mix-blend-difference text-white md:hidden")}
      >
        <Link href="/" className="pointer-events-auto font-display text-2xl tracking-tight">
          {brand.name}
        </Link>
        <span className="eyebrow">{time} IST</span>
      </motion.div>

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-md"
          />
        )}
      </AnimatePresence>

      {/* The Island */}
      <motion.nav
        aria-label="Main"
        initial={false}
        animate={{ y: hidden && !open ? (desktop ? -120 : 120) : 0 }}
        transition={{ duration: 0.6, ease: EXPO }}
        className={cn(
          "fixed left-1/2 z-[70]",
          "bottom-[max(1rem,env(safe-area-inset-bottom))] md:bottom-auto md:top-5",
          open ? "w-[calc(100vw-1.5rem)] max-w-[980px]" : "w-max max-w-[calc(100vw-1.5rem)]",
        )}
        style={{ x: "-50%" }}
      >
        <motion.div
          layout
          transition={{ layout: { duration: 0.75, ease: EXPO } }}
          style={{ borderRadius: open ? 30 : 999 }}
          className={cn(
            "relative overflow-hidden text-paper shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] ring-1 ring-white/10",
            "glass-dark",
          )}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {!open ? (
              <motion.div
                key="pill"
                layout="position"
                initial={{ opacity: 0, filter: "blur(6px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(6px)" }}
                transition={{ duration: 0.35 }}
                className="flex h-14 items-center gap-1 p-1.5"
              >
                <Link href="/" aria-label={`${brand.name} home`} className="relative grid h-11 w-11 shrink-0 place-items-center">
                  <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
                    <circle cx="22" cy="22" r="20" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1.5" />
                    <motion.circle cx="22" cy="22" r="20" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" style={{ pathLength: progress }} />
                  </svg>
                  <span className="font-display text-xl leading-none">{brand.name[0]}</span>
                </Link>

                <motion.div
                  animate={{ width: compact ? 0 : "auto", opacity: compact ? 0 : 1 }}
                  transition={{ duration: 0.6, ease: EXPO }}
                  className="hidden overflow-hidden md:block"
                >
                  <Link href="/" className="block whitespace-nowrap px-2 font-display text-[1.35rem] tracking-tight">
                    {brand.name}
                  </Link>
                </motion.div>

                {(nav.showClock || nav.showWeather) && (
                  <div className="hidden items-center gap-2 whitespace-nowrap rounded-full bg-white/[0.07] px-3.5 py-2 text-xs text-paper/80 sm:flex">
                    {nav.showClock && <span className="tabular-nums">{time}</span>}
                    {nav.showClock && nav.showWeather && weather && <span className="h-3 w-px bg-white/20" />}
                    {nav.showWeather && weather && (
                      <span>
                        {weather.t}° <span className="text-paper/50">{weather.label}</span>
                      </span>
                    )}
                  </div>
                )}

                <div className="hidden items-center lg:flex">
                  {links.slice(0, 4).map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={cn(
                        "relative rounded-full px-3.5 py-2 text-sm text-paper/75 transition-colors hover:text-paper",
                        pathname === l.href && "text-paper",
                      )}
                    >
                      {pathname === l.href && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-full bg-white/10" />}
                      <span className="relative">{l.label}</span>
                    </Link>
                  ))}
                </div>

                <button
                  onClick={() => setOpen(true)}
                  aria-expanded={open}
                  aria-label="Open menu"
                  className="group flex h-11 items-center gap-2.5 rounded-full px-4 text-sm transition-colors hover:bg-white/10"
                >
                  <span className="flex w-4 flex-col gap-[5px]">
                    <span className="h-px w-full bg-current transition-transform duration-500 ease-expo group-hover:translate-x-0.5" />
                    <span className="h-px w-2/3 bg-current transition-all duration-500 ease-expo group-hover:w-full" />
                  </span>
                  Menu
                </button>

                <Link
                  href="/book"
                  className="group relative flex h-11 items-center overflow-hidden rounded-full bg-paper px-5 text-sm font-medium text-ink"
                >
                  <span className="absolute inset-0 translate-y-full rounded-full bg-accent transition-transform duration-500 ease-expo group-hover:translate-y-0" />
                  <span className="relative transition-colors duration-500 group-hover:text-white">{nav.ctaLabel}</span>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.2, duration: 0.4 } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="max-h-[calc(100svh-2rem)] overflow-y-auto no-scrollbar"
                data-lenis-prevent
              >
                <div className="flex items-center justify-between p-3 pl-5">
                  <span className="eyebrow text-paper/60">
                    {brand.location} · {time}
                  </span>
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className="grid h-11 w-11 place-items-center rounded-full bg-white/10 transition-transform duration-500 ease-expo hover:rotate-90"
                  >
                    <svg viewBox="0 0 16 16" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 3l10 10M13 3L3 13" />
                    </svg>
                  </button>
                </div>

                <div className="grid gap-6 px-5 pb-5 md:grid-cols-[1.1fr_1fr] md:gap-8 md:px-8 md:pb-8">
                  <ul className="flex flex-col">
                    {links.map((l, i) => (
                      <motion.li
                        key={l.href + i}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: EXPO, delay: 0.25 + i * 0.05 }}
                        onMouseEnter={() => setHover(i)}
                        className="border-b border-white/10"
                      >
                        <Link href={l.href} onClick={() => setOpen(false)} className="group flex items-baseline gap-4 py-2.5 md:py-3">
                          <span className="font-mono text-[0.65rem] text-paper/40">{String(i + 1).padStart(2, "0")}</span>
                          <span
                            className={cn(
                              "font-display text-[2.1rem] leading-none tracking-tight transition-all duration-500 ease-expo md:text-5xl",
                              hover === i ? "translate-x-2 text-accent" : "text-paper",
                            )}
                          >
                            {l.label}
                          </span>
                        </Link>
                      </motion.li>
                    ))}
                  </ul>

                  <div className="hidden flex-col gap-4 md:flex">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[22px]">
                      <AnimatePresence initial={false}>
                        <motion.div
                          key={hover}
                          initial={{ clipPath: "inset(100% 0 0 0)", scale: 1.15 }}
                          animate={{ clipPath: "inset(0% 0 0 0)", scale: 1 }}
                          exit={{ opacity: 0, transition: { duration: 0.6, delay: 0.3 } }}
                          transition={{ duration: 0.9, ease: EXPO }}
                          className="absolute inset-0"
                        >
                          {links[hover] && <Img src={links[hover].image} alt={links[hover].label} fill sizes="420px" className="object-cover" />}
                        </motion.div>
                      </AnimatePresence>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5">
                        <span className="font-display text-2xl">{links[hover]?.label}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.55 } }}
                  className="grid gap-3 border-t border-white/10 px-5 py-5 text-sm text-paper/70 sm:grid-cols-3 md:px-8"
                >
                  <a href={`tel:${brand.phone.replace(/\s/g, "")}`} className="hover:text-paper">
                    <span className="eyebrow block text-paper/40">Call</span>
                    {brand.phone}
                  </a>
                  <a href={`mailto:${brand.email}`} className="hover:text-paper">
                    <span className="eyebrow block text-paper/40">Write</span>
                    {brand.email}
                  </a>
                  <div className="flex items-end gap-2">
                    <Link
                      href="/book"
                      onClick={() => setOpen(false)}
                      className="flex h-11 flex-1 items-center justify-center rounded-full bg-paper font-medium text-ink transition-colors hover:bg-accent hover:text-white"
                    >
                      {nav.ctaLabel} your stay
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.nav>
    </>
  );
}
