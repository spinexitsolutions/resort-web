"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { I, type IconName } from "./icons";
import { ToastProvider } from "./toast";

type NavItem = { href: string; label: string; icon: IconName; badge?: number };

export function AdminShell({
  children,
  brand,
  counts,
}: {
  children: React.ReactNode;
  brand: string;
  counts: { pending: number; newLeads: number };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("admin-collapsed") === "1");
    } catch {}
  }, []);
  useEffect(() => setSheet(false), [pathname]);

  const toggle = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem("admin-collapsed", c ? "0" : "1");
      } catch {}
      return !c;
    });
  };

  const groups: { title: string; items: NavItem[] }[] = [
    { title: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: "dashboard" }] },
    {
      title: "CRM",
      items: [
        { href: "/admin/bookings", label: "Bookings", icon: "calendar", badge: counts.pending },
        { href: "/admin/leads", label: "Leads", icon: "leads", badge: counts.newLeads },
        { href: "/admin/guests", label: "Guests", icon: "users" },
        { href: "/admin/subscribers", label: "Subscribers", icon: "mail" },
      ],
    },
    {
      title: "Content",
      items: [
        { href: "/admin/content/rooms", label: "Rooms & Villas", icon: "bed" },
        { href: "/admin/content/experiences", label: "Experiences", icon: "compass" },
        { href: "/admin/content/dining", label: "Dining", icon: "dining" },
        { href: "/admin/content/offers", label: "Offers", icon: "tag" },
        { href: "/admin/content/gallery", label: "Gallery", icon: "image" },
        { href: "/admin/content/testimonials", label: "Testimonials", icon: "quote" },
        { href: "/admin/content/faqs", label: "FAQs", icon: "help" },
        { href: "/admin/content/venues", label: "Venues", icon: "venue" },
      ],
    },
    { title: "Site", items: [{ href: "/admin/settings", label: "Settings", icon: "settings" }] },
  ];

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const tabs: NavItem[] = [
    { href: "/admin", label: "Home", icon: "dashboard" },
    { href: "/admin/bookings", label: "Bookings", icon: "calendar", badge: counts.pending },
    { href: "/admin/leads", label: "Leads", icon: "leads", badge: counts.newLeads },
    { href: "/admin/settings", label: "Site", icon: "settings" },
  ];

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-[#f7f6f3] text-ink">
        {/* Desktop sidebar */}
        <motion.aside
          animate={{ width: collapsed ? 76 : 256 }}
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
          className="fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-line bg-white/70 backdrop-blur-xl md:flex"
        >
          <div className="flex h-16 items-center gap-3 px-5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink font-display text-xl text-paper">
              {brand[0]}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate font-display text-xl leading-none">{brand}</div>
                <div className="eyebrow mt-1 text-[9px] text-muted">Control room</div>
              </div>
            )}
          </div>
          <nav className="no-scrollbar flex-1 overflow-y-auto px-3 pb-4">
            {groups.map((g) => (
              <div key={g.title} className="mt-4">
                {!collapsed ? (
                  <div className="eyebrow mb-1.5 px-3 text-[9.5px] text-muted">{g.title}</div>
                ) : (
                  <div className="mx-auto mb-2 h-px w-6 bg-line" />
                )}
                {g.items.map((it) => {
                  const Icon = I[it.icon];
                  const active = isActive(it.href);
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      title={collapsed ? it.label : undefined}
                      className={cn(
                        "relative mb-0.5 flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium transition-colors",
                        active ? "text-ink" : "text-ink/55 hover:bg-ink/[0.04] hover:text-ink",
                        collapsed && "justify-center px-0",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_0_0_1px_var(--line)]"
                          transition={{ type: "spring", stiffness: 500, damping: 40 }}
                        />
                      )}
                      <Icon size={18} className={cn("relative shrink-0", active && "text-[color:var(--accent)]")} />
                      {!collapsed && <span className="relative flex-1 truncate">{it.label}</span>}
                      {!!it.badge && (
                        <span
                          className={cn(
                            "relative grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[10.5px] font-semibold text-white",
                            collapsed && "absolute right-2 top-1 h-4 min-w-4 text-[9px]",
                          )}
                        >
                          {it.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className="space-y-1 border-t border-line p-3">
            <a
              href="/"
              target="_blank"
              className={cn("flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] text-ink/60 hover:bg-ink/[0.04] hover:text-ink", collapsed && "justify-center px-0")}
            >
              <I.external size={18} />
              {!collapsed && "View site"}
            </a>
            <button
              onClick={logout}
              className={cn("flex h-10 w-full items-center gap-3 rounded-xl px-3 text-[13.5px] text-ink/60 hover:bg-ink/[0.04] hover:text-ink", collapsed && "justify-center px-0")}
            >
              <I.logout size={18} />
              {!collapsed && "Sign out"}
            </button>
            <button
              onClick={toggle}
              className={cn("flex h-10 w-full items-center gap-3 rounded-xl px-3 text-[13.5px] text-ink/60 hover:bg-ink/[0.04] hover:text-ink", collapsed && "justify-center px-0")}
            >
              <I.sidebar size={18} />
              {!collapsed && "Collapse"}
            </button>
          </div>
        </motion.aside>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white/75 px-4 backdrop-blur-xl md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-ink font-display text-lg text-paper">{brand[0]}</div>
            <span className="font-display text-xl">{brand}</span>
          </div>
          <a href="/" target="_blank" className="flex items-center gap-1 rounded-full bg-mist px-3 py-1.5 text-xs font-medium">
            View site <I.external size={13} />
          </a>
        </header>

        <motion.main
          animate={{ paddingLeft: collapsed ? 76 : 256 }}
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
          className="admin-main min-h-dvh pb-28 md:pb-12"
        >
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-[1320px] px-4 pt-6 md:px-8 md:pt-10"
          >
            {children}
          </motion.div>
        </motion.main>

        {/* Mobile bottom tab bar */}
        <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-[22px] border border-line bg-white/85 px-1 py-1.5 shadow-xl shadow-black/5 backdrop-blur-xl md:hidden pb-[max(0.375rem,env(safe-area-inset-bottom))]">
          {tabs.map((t) => {
            const Icon = I[t.icon];
            const active = isActive(t.href) && !(t.href === "/admin/settings" && sheet);
            return (
              <Link key={t.href} href={t.href} className={cn("relative flex w-16 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10.5px] font-medium", active ? "text-ink" : "text-ink/45")}>
                {active && <motion.span layoutId="tab-active" className="absolute inset-0 rounded-2xl bg-mist" />}
                <Icon size={20} className="relative" />
                <span className="relative">{t.label}</span>
                {!!t.badge && <span className="absolute right-3 top-0.5 h-2 w-2 rounded-full bg-accent" />}
              </Link>
            );
          })}
          <button onClick={() => setSheet(true)} className={cn("flex w-16 flex-col items-center gap-0.5 py-1.5 text-[10.5px] font-medium", sheet ? "text-ink" : "text-ink/45")}>
            <I.menu size={20} />
            More
          </button>
        </nav>

        {/* Mobile sheet menu */}
        <AnimatePresence>
          {sheet && (
            <div className="fixed inset-0 z-50 md:hidden">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} className="absolute inset-0 bg-ink/35 backdrop-blur-sm" />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 380, damping: 40 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.6 }}
                onDragEnd={(_, i) => i.offset.y > 120 && setSheet(false)}
                className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[28px] bg-paper px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3"
              >
                <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-ink/15" />
                {groups.map((g) => (
                  <div key={g.title} className="mb-4">
                    <div className="eyebrow mb-2 px-1 text-[10px] text-muted">{g.title}</div>
                    <div className="grid grid-cols-3 gap-2">
                      {g.items.map((it) => {
                        const Icon = I[it.icon];
                        return (
                          <Link
                            key={it.href}
                            href={it.href}
                            className={cn(
                              "flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-white px-2 py-3 text-center text-[11.5px] font-medium",
                              isActive(it.href) && "border-ink/20 ring-2 ring-accent/30",
                            )}
                          >
                            <Icon size={20} />
                            {it.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <button onClick={logout} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-medium text-red-600 border border-line">
                  <I.logout size={18} /> Sign out
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
      <style>{`@media (max-width: 767px){.admin-main{padding-left:0!important}}`}</style>
    </ToastProvider>
  );
}
