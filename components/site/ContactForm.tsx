"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { EXPO } from "./motion";

const TYPES = [
  ["stay", "A stay"],
  ["wedding", "Wedding"],
  ["corporate", "Corporate"],
  ["spa", "Spa"],
  ["dining", "Dining"],
  ["general", "Something else"],
] as const;

export default function ContactForm({ initialType = "stay", initialSubject = "" }: { initialType?: string; initialSubject?: string }) {
  const [type, setType] = useState(TYPES.some(([t]) => t === initialType) ? initialType : "general");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setState("loading");
    const f = new FormData(e.currentTarget);
    const r = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...Object.fromEntries(f), type }),
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok) setState("done");
    else {
      setState("idle");
      setError(d.error ?? "Something went wrong");
    }
  }

  const input = "peer h-16 w-full rounded-[20px] bg-white px-5 pt-5 text-[1.0625rem] font-medium outline-none ring-1 ring-line transition-shadow placeholder:text-transparent focus:ring-2 focus:ring-accent";
  const lbl = "pointer-events-none absolute left-5 top-5 text-muted transition-all duration-300 peer-focus:top-2.5 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:text-xs";

  return (
    <AnimatePresence mode="wait">
      {state === "done" ? (
        <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EXPO }} className="rounded-[32px] bg-accent p-10 text-white md:p-14">
          <p className="font-display text-[clamp(3.5rem,8vw,6rem)] leading-[0.85] tracking-[-0.05em]">Thank you.</p>
          <p className="mt-4 max-w-sm text-white/85">Your note is with our team. Expect a personal reply within a few hours — usually much sooner.</p>
          <button onClick={() => setState("idle")} className="mt-8 text-sm underline underline-offset-4">Send another</button>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={submit} exit={{ opacity: 0, y: -20 }} className="space-y-6">
          <div>
            <p className="mb-4 font-display text-3xl tracking-[-0.04em]">I&apos;m interested in…</p>
            <div className="flex flex-wrap gap-2">
              {TYPES.map(([t, l]) => (
                <button type="button" key={t} onClick={() => setType(t)} className={cn("rounded-full px-5 py-2.5 text-sm font-semibold transition-all active:scale-95", type === t ? "bg-accent text-white" : "bg-white ring-1 ring-line hover:ring-ink")}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="relative block">
              <input name="name" required placeholder="Name" className={input} />
              <span className={lbl}>Your name</span>
            </label>
            <label className="relative block">
              <input name="email" type="email" required placeholder="Email" className={input} />
              <span className={lbl}>Email</span>
            </label>
            <label className="relative block">
              <input name="phone" placeholder="Phone" className={input} />
              <span className={lbl}>Phone (optional)</span>
            </label>
            <label className="relative block">
              <input name="subject" defaultValue={initialSubject} placeholder="Subject" className={input} />
              <span className={lbl}>Subject</span>
            </label>
          </div>
          <label className="relative block">
            <textarea name="message" required rows={4} placeholder="Message" className={cn(input, "h-auto resize-none pt-8 pb-4")} />
            <span className={lbl}>Tell us a little about your plans</span>
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={state === "loading"} className="group flex h-14 items-center gap-3 rounded-full bg-accent px-8 font-semibold text-white transition-transform active:scale-95 disabled:opacity-60">
            {state === "loading" ? "Sending…" : "Send message"}
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 8h12M9 3l5 5-5 5" /></svg>
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
