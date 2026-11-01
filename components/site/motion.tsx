"use client";

import { motion, useInView, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const EXPO = [0.16, 1, 0.3, 1] as const;
export const QUART = [0.76, 0, 0.24, 1] as const;

/** Fade + rise when scrolled into view. */
export function Reveal({ children, delay = 0, y = 40, className, once = true }: { children: ReactNode; delay?: number; y?: number; className?: string; once?: boolean }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-10% 0px" }}
      transition={{ duration: 1.1, ease: EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Masked line-by-word reveal for headlines. */
export function SplitReveal({ text, className, delay = 0, stagger = 0.045, as: Tag = "h2", italicWords = [] }: { text: string; className?: string; delay?: number; stagger?: number; as?: "h1" | "h2" | "h3" | "p" | "span"; italicWords?: string[] }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const words = text.split(" ");
  const MotionTag = motion[Tag];
  return (
    <MotionTag ref={ref as never} className={cn("text-balance", className)} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
          <motion.span
            className={cn("inline-block will-change-transform", italicWords.includes(w.replace(/[^\w]/g, "")) && "italic text-accent")}
            initial={{ y: "110%", rotate: 4 }}
            animate={inView ? { y: "0%", rotate: 0 } : undefined}
            transition={{ duration: 1.1, ease: EXPO, delay: delay + i * stagger }}
          >
            {w}
          </motion.span>
        </span>
      )).flatMap((el, i) => (i ? [" ", el] : [el]))}
    </MotionTag>
  );
}

/** Apple-style paragraph: each word brightens as you scroll through it. */
export function ScrollText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={cn("flex flex-wrap", className)}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  );
}
function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <span className="relative mr-[0.25em]">
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
}

/** Image that drifts within its frame as the page scrolls. */
export function ParallaxImage({ src, alt, className, strength = 12, priority, sizes = "100vw", reveal = true }: { src: string; alt: string; className?: string; strength?: number; priority?: boolean; sizes?: string; reveal?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);
  return (
    <motion.div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      initial={reveal ? { clipPath: "inset(12% 12% 12% 12% round 24px)" } : undefined}
      whileInView={reveal ? { clipPath: "inset(0% 0% 0% 0% round 0px)" } : undefined}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.4, ease: EXPO }}
    >
      <motion.div style={{ y }} className="absolute -inset-y-[14%] inset-x-0">
        <Img src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
      </motion.div>
    </motion.div>
  );
}

/** next/image for remote/known hosts, plain img for uploads/data URLs. */
export function Img({ src, alt, className, fill, priority, sizes, width, height }: { src: string; alt: string; className?: string; fill?: boolean; priority?: boolean; sizes?: string; width?: number; height?: number }) {
  const optimisable = src.startsWith("https://images.unsplash.com") || src.startsWith("https://plus.unsplash.com");
  if (!optimisable) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={cn(fill && "absolute inset-0 h-full w-full", className)} loading={priority ? "eager" : "lazy"} />;
  }
  return fill ? (
    <Image src={src} alt={alt} fill priority={priority} sizes={sizes ?? "100vw"} className={className} />
  ) : (
    <Image src={src} alt={alt} width={width ?? 1200} height={height ?? 800} priority={priority} sizes={sizes} className={className} />
  );
}

/** Button/link that leans toward the cursor. */
export function Magnetic({ children, className, strength = 0.35 }: { children: ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Pill CTA with a rolling-text hover. */
export function PillButton({ href, children, variant = "ink", className, onClick, type }: { href?: string; children: string; variant?: "ink" | "paper" | "accent" | "ghost" | "ghost-light"; className?: string; onClick?: () => void; type?: "button" | "submit" }) {
  const styles = {
    ink: "bg-ink text-paper",
    paper: "bg-paper text-ink",
    accent: "bg-accent text-ink",
    ghost: "border border-ink/20 text-ink hover:border-ink",
    "ghost-light": "border border-white/35 text-white hover:border-white",
  }[variant];
  const inner = (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-500 ease-expo group-hover:-translate-y-full">{children}</span>
      <span aria-hidden className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-expo group-hover:translate-y-0">
        {children}
      </span>
    </span>
  );
  const cls = cn(
    "group inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[0.9375rem] font-medium tracking-tight transition-[transform,background,border-color] duration-300 active:scale-[0.97]",
    styles,
    className,
  );
  if (href)
    return (
      <Link href={href} className={cls}>
        {inner}
        <Arrow />
      </Link>
    );
  return (
    <button type={type ?? "button"} onClick={onClick} className={cls}>
      {inner}
      <Arrow />
    </button>
  );
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={cn("h-3.5 w-3.5 transition-transform duration-500 ease-expo group-hover:translate-x-0.5 group-hover:-rotate-45", className)}>
      <path d="M2 8h12M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SectionLabel({ index, children, light }: { index?: string; children: ReactNode; light?: boolean }) {
  return (
    <div className={cn("eyebrow flex items-center gap-3", light ? "text-white/70" : "text-muted")}>
      {index && <span className={light ? "text-white" : "text-ink"}>{index}</span>}
      <span className={cn("h-px w-8", light ? "bg-white/40" : "bg-ink/25")} />
      <span>{children}</span>
    </div>
  );
}

export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const row = [...items, ...items];
  return (
    <div className={cn("relative flex overflow-hidden", className)}>
      <div className="animate-marquee flex shrink-0 whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="flex items-center">
            <span className="px-6 md:px-10">{t}</span>
            <span className="text-accent">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
