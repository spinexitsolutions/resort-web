"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Input } from "./ui";

const ease = [0.16, 1, 0.3, 1] as const;

export function LoginForm({ brand, tagline, image }: { brand: string; tagline: string; image: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("admin@aranya.resort");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Sign in failed");
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-dvh gap-2 bg-paper p-2 md:grid-cols-[1.15fr_1fr] md:gap-3 md:p-3">
      <motion.div
        initial={{ clipPath: "inset(6% 6% 6% 6% round 48px)" }}
        animate={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }}
        transition={{ duration: 1.4, ease }}
        className="relative h-[38dvh] overflow-hidden rounded-[28px] bg-ink md:h-auto"
      >
        <motion.img src={image} alt="" initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 2.2, ease }} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/30" />
        <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-black/25 py-1.5 pl-2 pr-3.5 text-xs font-semibold text-white backdrop-blur-md ring-1 ring-white/15 md:left-8 md:top-8">
          <span className="h-2 w-2 rounded-full bg-accent" /> Control room
        </div>
        <div className="absolute inset-x-5 bottom-5 text-white md:inset-x-10 md:bottom-10">
          <div className="overflow-hidden">
            <motion.div initial={{ y: "100%" }} animate={{ y: "0%" }} transition={{ duration: 1.2, delay: 0.4, ease }} className="font-display text-[clamp(4rem,12vw,11rem)] leading-[0.8] tracking-[-0.06em]">
              {brand}
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-3 text-lg font-semibold text-accent md:text-xl">
            {tagline}
          </motion.div>
        </div>
      </motion.div>

      <div className="flex items-center justify-center rounded-[28px] bg-white px-6 py-10 md:px-12">
        <motion.form onSubmit={submit} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.25, ease }} className="w-full max-w-sm">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-accent font-display text-2xl text-white">{brand[0]}</div>
          <h1 className="mt-6 font-display text-[3.4rem] leading-[0.85] tracking-[-0.055em]">
            Welcome <span className="text-accent">back.</span>
          </h1>
          <p className="mt-3 text-sm text-muted">Sign in to manage bookings, guests and every pixel of the website.</p>

          <div className="mt-8 space-y-4">
            <Field label="Email">
              <Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 bg-paper/60" />
            </Field>
            <Field label="Password">
              <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus className="h-12 bg-paper/60" />
            </Field>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: [0, -6, 6, -3, 0] }} className="mt-3 text-sm font-medium text-red-600">
              {error}
            </motion.p>
          )}

          <Button type="submit" variant="accent" loading={loading} className="mt-6 h-13 w-full py-4 text-[15px]">
            Sign in →
          </Button>

          <div className="mt-6 rounded-[20px] bg-ink p-4 text-xs leading-relaxed text-white/70">
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent">Demo access</div>
            Email <span className="font-semibold text-white">admin@aranya.resort</span>
            <br />
            Password{" "}
            <button type="button" onClick={() => setPassword("aranya2026")} className="rounded-full bg-white/10 px-2 py-0.5 font-semibold text-white hover:bg-accent">
              aranya2026
            </button>{" "}
            <span className="opacity-70">(tap to fill)</span>
          </div>

          <a href="/" className="mt-6 inline-block text-sm font-medium text-muted hover:text-ink">
            ← Back to website
          </a>
        </motion.form>
      </div>
    </div>
  );
}
