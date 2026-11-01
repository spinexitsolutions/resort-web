"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function NewsletterForm({ dark }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    const r = await fetch("/api/newsletter", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
    const d = await r.json().catch(() => ({}));
    if (r.ok) {
      setState("done");
      setEmail("");
    } else {
      setState("error");
      setMsg(d.error ?? "Something went wrong");
    }
  }

  return (
    <form onSubmit={submit} className="relative">
      <div className={cn("flex items-center gap-2 rounded-full p-1.5 pl-5 ring-1 transition-shadow focus-within:ring-2", dark ? "bg-white/5 ring-white/15 focus-within:ring-accent" : "bg-white ring-line focus-within:ring-ink")}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          aria-label="Email address"
          className={cn("h-11 min-w-0 flex-1 bg-transparent text-[0.95rem] outline-none", dark ? "placeholder:text-paper/35" : "placeholder:text-muted")}
        />
        <button disabled={state === "loading"} className={cn("h-11 shrink-0 rounded-full px-5 text-sm font-medium transition-colors", dark ? "bg-paper text-ink hover:bg-accent" : "bg-ink text-paper hover:bg-lagoon")}>
          {state === "loading" ? "…" : "Subscribe"}
        </button>
      </div>
      <AnimatePresence>
        {(state === "done" || state === "error") && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cn("mt-3 pl-5 text-sm", state === "error" ? "text-red-400" : dark ? "text-accent" : "text-lagoon")}>
            {state === "done" ? "You're on the list. Welcome to the island ✦" : msg}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
