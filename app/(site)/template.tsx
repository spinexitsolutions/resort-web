"use client";

import { motion } from "framer-motion";

/** Page transition: a curtain sweeps off, content rises in. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[80] origin-top bg-ink"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        style={{ transformOrigin: "top" }}
      />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}>
        {children}
      </motion.div>
    </>
  );
}
