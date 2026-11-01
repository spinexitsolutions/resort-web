"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useState } from "react";
import { I } from "./icons";

type Toast = { id: number; message: string; tone: "success" | "error" | "info" };
type Ctx = (message: string, tone?: Toast["tone"]) => void;

const ToastCtx = createContext<Ctx>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback<Ctx>((message, tone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 md:bottom-6 md:top-auto md:items-end md:pr-6"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-ink py-2.5 pl-3 pr-4 text-sm text-paper shadow-2xl shadow-black/20"
            >
              <span
                className={`grid h-5 w-5 place-items-center rounded-full ${
                  t.tone === "error" ? "bg-red-500" : t.tone === "info" ? "bg-lagoon" : "bg-emerald-500"
                }`}
              >
                {t.tone === "error" ? <I.close size={12} strokeWidth={3} /> : <I.check size={12} strokeWidth={3} />}
              </span>
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
