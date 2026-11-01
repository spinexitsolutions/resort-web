"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { compactMoney, formatMoney } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

export function BarChart({ data, height = 220 }: { data: { label: string; value: number; sub?: string }[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return (
    <div className="relative px-5 pb-4 pt-6">
      <div className="relative" style={{ height }}>
        {ticks.map((t) => (
          <div key={t} className="absolute inset-x-0 flex items-center gap-2" style={{ bottom: `${t * 100}%` }}>
            <span className="w-10 shrink-0 -translate-y-1/2 text-right text-[10px] tabular-nums text-muted">{compactMoney(max * t)}</span>
            <div className="h-px flex-1 -translate-y-1/2 bg-line" />
          </div>
        ))}
        <div className="absolute inset-y-0 left-12 right-0 flex items-end gap-2 md:gap-4">
          {data.map((d, i) => {
            const isLast = i === data.length - 1;
            return (
              <div
                key={d.label}
                className="relative flex h-full flex-1 items-end"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onTouchStart={() => setHover(i)}
              >
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: `${(d.value / max) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, delay: i * 0.07, ease }}
                  className="w-full rounded-t-[10px] rounded-b-[3px]"
                  style={{
                    background: isLast ? "var(--accent)" : hover === i ? "var(--ink)" : "color-mix(in oklab, var(--ink) 16%, transparent)",
                    transition: "background .25s",
                  }}
                />
                {hover === i && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-[11px] text-paper shadow-lg"
                  >
                    <div className="font-semibold">{formatMoney(d.value)}</div>
                    {d.sub && <div className="text-paper/60">{d.sub}</div>}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="ml-12 mt-2 flex gap-2 md:gap-4">
        {data.map((d) => (
          <div key={d.label} className="flex-1 text-center text-[11px] text-muted">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

const PALETTE = ["var(--ink)", "var(--accent)", "var(--lagoon)", "#8fa89b", "#d9c3a5", "#a3a3a3", "#6b7f8e"];

export function Donut({ data, centerLabel }: { data: { label: string; value: number }[]; centerLabel: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 52;
  const c = 2 * Math.PI * r;
  let acc = 0;
  const shown = hover !== null ? data[hover] : null;
  return (
    <div className="flex flex-col items-center gap-5 p-5 sm:flex-row">
      <div className="relative h-40 w-40 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle cx="70" cy="70" r={r} fill="none" stroke="var(--mist)" strokeWidth="16" />
          {data.map((d, i) => {
            const len = (d.value / total) * c;
            const off = acc;
            acc += len;
            return (
              <motion.circle
                key={d.label}
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth={hover === i ? 20 : 16}
                strokeDasharray={`${Math.max(0, len - 2)} ${c}`}
                initial={{ strokeDashoffset: c }}
                whileInView={{ strokeDashoffset: -off }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: i * 0.08, ease }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ transition: "stroke-width .2s", cursor: "pointer" }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-2xl font-semibold tabular-nums">{shown ? shown.value : total}</div>
            <div className="text-[11px] capitalize text-muted">{shown ? shown.label : centerLabel}</div>
          </div>
        </div>
      </div>
      <ul className="w-full space-y-2">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2.5 text-[13px]" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
            <span className="flex-1 capitalize">{d.label}</span>
            <span className="tabular-nums text-muted">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HBars({ data }: { data: { label: string; value: number; meta: string }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-3.5 p-5">
      {data.map((d, i) => (
        <li key={d.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[13px]">
            <span className="truncate font-medium">{d.label}</span>
            <span className="shrink-0 tabular-nums text-muted">
              {compactMoney(d.value)} · {d.meta}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-mist">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(d.value / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.06, ease }}
              className="h-full rounded-full"
              style={{ background: i === 0 ? "var(--accent)" : "var(--lagoon)" }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Ring({ value, size = 44 }: { value: number; size?: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" className="-rotate-90">
      <circle cx="22" cy="22" r={r} fill="none" stroke="var(--mist)" strokeWidth="5" />
      <motion.circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - Math.min(1, value)) }}
        transition={{ duration: 1.4, ease }}
      />
    </svg>
  );
}
