"use client";

import { animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/** Counts up the numeric part of a value like "600", "92%", "4.9". */
export default function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const m = value.match(/^([^\d]*)([\d.,]+)(.*)$/);
  const target = m ? parseFloat(m[2].replace(/,/g, "")) : NaN;
  const decimals = m && m[2].includes(".") ? m[2].split(".")[1].length : 0;
  const [display, setDisplay] = useState(m ? `${m[1]}${(0).toFixed(decimals)}${m[3]}` : value);

  useEffect(() => {
    if (!inView || !m || Number.isNaN(target)) return;
    const c = animate(0, target, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(`${m[1]}${v.toFixed(decimals)}${m[3]}`),
      onComplete: () => setDisplay(value),
    });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return <span ref={ref} className="tabular-nums">{display}</span>;
}
