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
    <div className="grid min-h-dvh bg-paper md:grid-cols-[1.1fr_1fr]">
      <div className="relative h-[34dvh] overflow-hidden md:h-auto">
        <motion.img
          src={image}
          alt=""
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-ink/10" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease }}
          className="absolute inset-x-6 bottom-6 text-paper md:inset-x-12 md:bottom-12"
        >
          <div className="eyebrow text-paper/70">Control room</div>
          <div className="mt-2 font-display text-5xl leading-none md:text-7xl">{brand}</div>
          <div className="mt-2 font-display text-xl text-paper/80 md:text-2xl">{tagline}</div>
        </motion.div>
      </div>

      <div className="flex items-center justify-center px-6 py-10 md:px-12">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease }}
          className="w-full max-w-sm"
        >
          <h1 className="font-display text-4xl tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">Sign in to manage bookings, guests and every pixel of the website.</p>

          <div className="mt-8 space-y-4">
            <Field label="Email">
              <Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
            <Field label="Password">
              <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
            </Field>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: [0, -6, 6, -3, 0] }} className="mt-3 text-sm text-red-600">
              {error}
            </motion.p>
          )}

          <Button type="submit" variant="primary" loading={loading} className="mt-6 h-12 w-full text-[15px]">
            Sign in
          </Button>

          <div className="mt-6 rounded-2xl border border-dashed border-line bg-white/60 p-4 text-xs leading-relaxed text-muted">
            <div className="eyebrow mb-1 text-[10px] text-ink/60">Demo access</div>
            Email <span className="font-mono text-ink">admin@aranya.resort</span>
            <br />
            Password{" "}
            <button type="button" onClick={() => setPassword("aranya2026")} className="font-mono text-ink underline decoration-dotted underline-offset-2">
              aranya2026
            </button>{" "}
            <span className="opacity-70">(tap to fill)</span>
          </div>

          <a href="/" className="mt-6 inline-block text-sm text-muted hover:text-ink">
            ← Back to website
          </a>
        </motion.form>
      </div>
    </div>
  );
}
