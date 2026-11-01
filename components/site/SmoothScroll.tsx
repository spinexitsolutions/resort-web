"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const LenisCtx = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisCtx);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const raf = useRef(0);
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const l = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), touchMultiplier: 1.4 });
    setLenis(l);
    const loop = (time: number) => {
      l.raf(time);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf.current);
      l.destroy();
    };
  }, []);

  useEffect(() => {
    if (window.location.hash) return;
    lenis?.scrollTo(0, { immediate: true });
  }, [pathname, lenis]);

  // smooth anchor links
  useEffect(() => {
    if (!lenis) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const hashIdx = href.indexOf("#");
      if (hashIdx < 0) return;
      const path = href.slice(0, hashIdx) || window.location.pathname;
      if (path !== window.location.pathname) return;
      const el = document.getElementById(href.slice(hashIdx + 1));
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -20, duration: 1.6 });
      history.replaceState(null, "", href.slice(hashIdx));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [lenis]);

  return <LenisCtx.Provider value={lenis}>{children}</LenisCtx.Provider>;
}
