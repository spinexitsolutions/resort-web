export { clsx as cn } from "clsx";

export function formatMoney(n: number, currency = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `₹${Math.round(n).toLocaleString("en-IN")}`;
  }
}

export function compactMoney(n: number) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  return `₹${n}`;
}

export function nightsBetween(a: string, b: string) {
  const d = (new Date(b).getTime() - new Date(a).getTime()) / 86400000;
  return Math.max(0, Math.round(d));
}

export function formatDate(d: string | Date, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return new Date(d).toLocaleDateString("en-IN", opts);
}

export function timeAgo(d: string) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return formatDate(d);
}

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
