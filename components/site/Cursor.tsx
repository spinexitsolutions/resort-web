"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

/** A soft follower cursor (desktop only). Elements with data-cursor="Label" grow it into a label bubble. */
export default function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 });
  const [label, setLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor]");
      setLabel(t?.dataset.cursor ?? null);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  if (!enabled) return null;
  return (
    <motion.div style={{ x: sx, y: sy }} className="pointer-events-none fixed left-0 top-0 z-[90]">
      <motion.div
        animate={{ width: label ? 92 : 10, height: label ? 92 : 10, opacity: label ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-paper text-ink shadow-xl"
      >
        {label && <span className="eyebrow text-[0.6rem]">{label}</span>}
      </motion.div>
    </motion.div>
  );
}
