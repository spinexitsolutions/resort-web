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
        "inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-semibold transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2",
        size === "sm" ? "h-9 px-3.5 text-[13px]" : "h-11 px-5 text-sm",
        variant === "primary" && "bg-ink text-white hover:bg-accent",
        variant === "accent" && "bg-accent text-white shadow-[0_10px_24px_-12px_var(--accent)] hover:brightness-110",
        variant === "secondary" && "bg-white text-ink ring-1 ring-line hover:ring-ink/30",
        variant === "ghost" && "text-ink/70 hover:bg-ink/5 hover:text-ink",
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
        "grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink/60 transition hover:bg-ink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:opacity-30",
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
  "w-full rounded-[14px] border-0 bg-white px-4 text-[15px] font-medium text-ink ring-1 ring-line placeholder:font-normal placeholder:text-ink/35 transition focus:outline-none focus:ring-2 focus:ring-accent md:text-sm";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...rest },
  ref,
) {
  return <input ref={ref} className={cn(control, "h-11", className)} {...rest} />;
});

export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-[96px] py-2.5 leading-relaxed", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn(control, "h-11 appearance-none pr-9", className)} {...rest}>
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
      <span className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wider text-ink/55">{label}</span>
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
        checked ? "bg-accent" : "bg-ink/15",
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
    <div className="flex items-center justify-between gap-4 rounded-[18px] bg-white px-4 py-3.5 ring-1 ring-line">
      <div>
        <div className="text-sm font-semibold">{label}</div>
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
        className={cn(control, "h-11 rounded-full bg-white pl-10")}
      />
    </div>
  );
}

/* ---------- Layout bits ---------- */

export function PageHeader({ title, subtitle, actions, eyebrow }: { title: string; subtitle?: string; actions?: React.ReactNode; eyebrow?: string }) {
  const words = title.split(" ");
  return (
    <div className="mb-7 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 text-xs font-semibold ring-1 ring-line">
            <span className="h-5 w-5 rounded-full bg-accent" />
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-[clamp(2.8rem,6vw,5.2rem)] leading-[0.84] tracking-[-0.055em]">
          {words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
              <motion.span
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
                className={cn("inline-block", i === words.length - 1 && words.length > 1 && "text-accent")}
              >
                {w}
              </motion.span>
            </span>
          )).flatMap((el, i) => (i ? [" ", el] : [el]))}
        </h1>
        {subtitle && <p className="mt-3 text-sm font-medium text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-[26px] bg-white ring-1 ring-black/[0.04] shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_-20px_rgba(0,0,0,0.18)]", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, action, subtitle }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5">
      <div>
        <h3 className="font-display text-[1.45rem] leading-none tracking-[-0.03em]">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[26px] border-2 border-dashed border-ink/10 bg-white/50 px-6 py-16 text-center">
      <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-accent text-white">
        <I.sparkle size={20} />
      </div>
      <div className="font-display text-2xl tracking-[-0.03em]">{title}</div>
      {body && <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-ink/[0.06]", className)} />;
}

const PILL: Record<string, string> = {
  pending: "bg-accent/15 text-[color:var(--accent)]",
  confirmed: "bg-ink text-white",
  "checked-in": "bg-lagoon text-white",
  "checked-out": "bg-ink/[0.07] text-ink/60",
  cancelled: "bg-red-100 text-red-700",
  unpaid: "bg-accent/15 text-[color:var(--accent)]",
  partial: "bg-amber-100 text-amber-800",
  paid: "bg-lagoon/15 text-lagoon",
  new: "bg-accent text-white",
  contacted: "bg-ink text-white",
  qualified: "bg-lagoon text-white",
  proposal: "bg-amber-100 text-amber-800",
  won: "bg-lagoon/15 text-lagoon",
  lost: "bg-ink/[0.07] text-ink/50",
  active: "bg-lagoon/15 text-lagoon",
  hidden: "bg-ink/[0.07] text-ink/50",
  vip: "bg-accent text-white",
};

export function Pill({ tone, children, className }: { tone: string; children?: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold capitalize",
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
  const palette = ["var(--accent)", "var(--ink)", "var(--lagoon)", "#C9A27E", "#5B6B73"];
  const bg = palette[hash % palette.length];
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-full font-semibold text-white", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: bg,
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
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
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
              isDesktop ? "inset-y-3 right-3 rounded-[30px]" : "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[30px]",
            )}
          >
            {!isDesktop && <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-ink/15" />}
            <header className="flex items-start justify-between gap-4 px-5 pb-4 pt-5 md:px-7 md:pt-7">
              <div className="min-w-0">
                <h2 id={id} className="truncate font-display text-[2rem] leading-none tracking-[-0.04em]">
                  {title}
                </h2>
                {subtitle && <p className="mt-1.5 truncate text-sm text-muted">{subtitle}</p>}
              </div>
              <IconButton label="Close" onClick={onClose} className="h-10 w-10 bg-ink text-white hover:bg-accent">
                <I.close size={16} />
              </IconButton>
            </header>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-5 md:px-7" data-lenis-prevent>
              {children}
            </div>
            {footer && (
              <footer className="flex items-center justify-end gap-2 border-t border-line bg-white/60 px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] md:rounded-b-[30px] md:px-7">
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
            className="relative w-full max-w-sm rounded-[30px] bg-paper p-7 text-center shadow-2xl"
          >
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-accent text-white">
              <I.trash size={20} />
            </div>
            <p className="font-display text-2xl leading-tight tracking-[-0.03em]">{state.message}</p>
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
    <div className={cn("no-scrollbar inline-flex max-w-full overflow-x-auto rounded-full bg-white p-1 ring-1 ring-line", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "relative whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition-colors",
            value === o.value ? "text-white" : "text-ink/55 hover:text-ink",
          )}
        >
          {value === o.value && (
            <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 500, damping: 38 }} />
          )}
          <span className="relative">
            {o.label}
            {o.count !== undefined && <span className={cn("ml-1.5", value === o.value ? "text-accent" : "text-ink/40")}>{o.count}</span>}
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
      <div className="mt-3 font-display text-[2.6rem] leading-none tracking-[-0.045em] md:text-[3rem]">{value}</div>
      {delta && <div className="mt-1 text-xs text-muted">{delta}</div>}
    </Card>
  );
}
