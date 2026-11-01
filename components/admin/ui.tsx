"use client";

import { AnimatePresence, motion } from "framer-motion";
import { forwardRef, useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";
import { I } from "./icons";

/* ---------- Buttons ---------- */

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "accent";
  size?: "sm" | "md";
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button(
  { variant = "secondary", size = "md", loading, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2",
        size === "sm" ? "h-8 px-3 text-[13px]" : "h-10 px-4 text-sm",
        variant === "primary" && "bg-ink text-paper hover:bg-ink/85",
        variant === "accent" && "bg-accent text-white hover:brightness-110",
        variant === "secondary" && "border border-line bg-white text-ink hover:bg-mist",
        variant === "ghost" && "text-ink/70 hover:bg-mist hover:text-ink",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        className,
      )}
      {...rest}
    >
      {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
});

export function IconButton({ label, className, children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink/60 transition hover:bg-mist hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:opacity-30",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------- Form controls ---------- */

const control =
  "w-full rounded-xl border border-line bg-white px-3.5 text-[15px] text-ink placeholder:text-ink/35 transition focus:border-ink/30 focus:outline-none focus:ring-4 focus:ring-accent/15 md:text-sm";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...rest },
  ref,
) {
  return <input ref={ref} className={cn(control, "h-10", className)} {...rest} />;
});

export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-[96px] py-2.5 leading-relaxed", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn(control, "h-10 appearance-none pr-9", className)} {...rest}>
        {children}
      </select>
      <I.down size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/40" />
    </div>
  );
}

export function Field({ label, hint, children, className, as = "label" }: { label: string; hint?: string; children: React.ReactNode; className?: string; as?: "label" | "div" }) {
  const Tag = as;
  return (
    <Tag className={cn("block", className)}>
      <span className="mb-1.5 block text-[13px] font-medium text-ink/75">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </Tag>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        "relative inline-flex h-[26px] w-[44px] shrink-0 items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        checked ? "bg-emerald-500" : "bg-ink/15",
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 34 }}
        className={cn("h-[22px] w-[22px] rounded-full bg-white shadow-md", checked ? "ml-[20px]" : "ml-[2px]")}
      />
    </button>
  );
}

export function ToggleRow({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-white px-4 py-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted">{hint}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search…" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative w-full md:w-72">
      <I.search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(control, "h-10 rounded-full bg-white pl-10")}
      />
    </div>
  );
}

/* ---------- Layout bits ---------- */

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-display text-[34px] leading-none tracking-tight md:text-[44px]">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-2xl border border-line bg-white", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, action, subtitle }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5">
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white/60 px-6 py-16 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-mist text-ink/50">
        <I.sparkle size={20} />
      </div>
      <div className="font-medium">{title}</div>
      {body && <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-ink/[0.06]", className)} />;
}

const PILL: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-800",
  "checked-in": "bg-emerald-100 text-emerald-800",
  "checked-out": "bg-zinc-100 text-zinc-700",
  cancelled: "bg-red-100 text-red-700",
  unpaid: "bg-red-50 text-red-700",
  partial: "bg-amber-50 text-amber-800",
  paid: "bg-emerald-50 text-emerald-700",
  new: "bg-sky-100 text-sky-800",
  contacted: "bg-violet-100 text-violet-800",
  qualified: "bg-amber-100 text-amber-800",
  proposal: "bg-orange-100 text-orange-800",
  won: "bg-emerald-100 text-emerald-800",
  lost: "bg-zinc-100 text-zinc-600",
  active: "bg-emerald-50 text-emerald-700",
  hidden: "bg-zinc-100 text-zinc-600",
  vip: "bg-accent/15 text-[color:var(--accent)]",
};

export function Pill({ tone, children, className }: { tone: string; children?: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11.5px] font-medium capitalize",
        PILL[tone] ?? "bg-mist text-ink/70",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children ?? tone.replace("-", " ")}
    </span>
  );
}

export function Avatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  const hue = hash % 360;
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-full font-medium text-white", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, hsl(${hue} 35% 52%), hsl(${(hue + 40) % 360} 40% 38%))`,
      }}
    >
      {initials}
    </span>
  );
}

/* ---------- Drawer (slide-over / bottom sheet on mobile) ---------- */

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 560,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}) {
  const id = useId();
  const [isDesktop, setDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const set = () => setDesktop(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal aria-labelledby={id}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.aside
            initial={isDesktop ? { x: "100%" } : { y: "100%" }}
            animate={isDesktop ? { x: 0 } : { y: 0 }}
            exit={isDesktop ? { x: "100%" } : { y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            style={isDesktop ? { width: `min(${width}px, 100vw)` } : undefined}
            className={cn(
              "absolute flex flex-col bg-paper shadow-2xl",
              isDesktop ? "inset-y-2 right-2 rounded-[22px]" : "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[26px]",
            )}
          >
            {!isDesktop && <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-ink/15" />}
            <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 md:px-6">
              <div className="min-w-0">
                <h2 id={id} className="truncate text-lg font-semibold tracking-tight">
                  {title}
                </h2>
                {subtitle && <p className="truncate text-sm text-muted">{subtitle}</p>}
              </div>
              <IconButton label="Close" onClick={onClose} className="bg-mist">
                <I.close size={16} />
              </IconButton>
            </header>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 md:px-6" data-lenis-prevent>
              {children}
            </div>
            {footer && (
              <footer className="flex items-center justify-end gap-2 border-t border-line px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6">
                {footer}
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Confirm ---------- */

export function useConfirm() {
  const [state, setState] = useState<{ message: string; resolve: (v: boolean) => void } | null>(null);
  const confirm = (message: string) => new Promise<boolean>((resolve) => setState({ message, resolve }));
  const close = (v: boolean) => {
    state?.resolve(v);
    setState(null);
  };
  const dialog = (
    <AnimatePresence>
      {state && (
        <div className="fixed inset-0 z-[90] grid place-items-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => close(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="relative w-full max-w-sm rounded-[22px] bg-paper p-6 text-center shadow-2xl"
          >
            <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-red-50 text-red-600">
              <I.trash size={20} />
            </div>
            <p className="text-[15px] font-medium">{state.message}</p>
            <p className="mt-1 text-sm text-muted">This can’t be undone.</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button onClick={() => close(false)} autoFocus>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => close(true)}>
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
  return { confirm, dialog };
}

/* ---------- Segmented control ---------- */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("no-scrollbar inline-flex max-w-full overflow-x-auto rounded-full bg-ink/[0.06] p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
            value === o.value ? "text-ink" : "text-ink/55 hover:text-ink",
          )}
        >
          {value === o.value && (
            <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-full bg-white shadow-sm" transition={{ type: "spring", stiffness: 500, damping: 38 }} />
          )}
          <span className="relative">
            {o.label}
            {o.count !== undefined && <span className="ml-1.5 text-ink/40">{o.count}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

export function Stat({ label, value, delta, icon }: { label: string; value: string; delta?: string; icon?: React.ReactNode }) {
  return (
    <Card className="p-4 md:p-5">
      <div className="flex items-center justify-between text-muted">
        <span className="text-[12.5px] font-medium">{label}</span>
        {icon}
      </div>
      <div className="mt-3 text-[26px] font-semibold tracking-tight md:text-[30px]">{value}</div>
      {delta && <div className="mt-1 text-xs text-muted">{delta}</div>}
    </Card>
  );
}
