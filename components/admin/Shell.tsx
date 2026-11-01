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
      <div className="min-h-dvh bg-paper text-ink">
        {/* Desktop sidebar */}
        <motion.aside
          animate={{ width: collapsed ? 80 : 264 }}
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
          className="fixed inset-y-3 left-3 z-40 hidden flex-col overflow-hidden rounded-[30px] bg-ink text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)] md:flex"
        >
          <div className="flex h-20 items-center gap-3 px-5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent font-display text-xl text-white">
              {brand[0]}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate font-display text-2xl leading-none tracking-[-0.04em]">{brand}</div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/45">Control room</div>
              </div>
            )}
          </div>
          <nav className="no-scrollbar flex-1 overflow-y-auto px-3 pb-4">
            {groups.map((g) => (
              <div key={g.title} className="mt-4">
                {!collapsed ? (
                  <div className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-white/35">{g.title}</div>
                ) : (
                  <div className="mx-auto mb-2 h-px w-6 bg-white/15" />
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
                        "relative mb-0.5 flex h-10 items-center gap-3 rounded-full px-3 text-[13.5px] font-medium transition-colors",
                        active ? "text-white" : "text-white/55 hover:bg-white/[0.07] hover:text-white",
                        collapsed && "justify-center px-0",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-full bg-accent"
                          transition={{ type: "spring", stiffness: 500, damping: 40 }}
                        />
                      )}
                      <Icon size={18} className="relative shrink-0" />
                      {!collapsed && <span className="relative flex-1 truncate">{it.label}</span>}
                      {!!it.badge && (
                        <span
                          className={cn(
                            "relative grid h-5 min-w-5 place-items-center rounded-full bg-white px-1.5 text-[10.5px] font-bold text-ink",
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
          <div className="space-y-1 border-t border-white/10 p-3">
            <a
              href="/"
              target="_blank"
              className={cn("flex h-10 items-center gap-3 rounded-full px-3 text-[13.5px] text-white/55 hover:bg-white/[0.07] hover:text-white", collapsed && "justify-center px-0")}
            >
              <I.external size={18} />
              {!collapsed && "View site"}
            </a>
            <button
              onClick={logout}
              className={cn("flex h-10 w-full items-center gap-3 rounded-full px-3 text-[13.5px] text-white/55 hover:bg-white/[0.07] hover:text-white", collapsed && "justify-center px-0")}
            >
              <I.logout size={18} />
              {!collapsed && "Sign out"}
            </button>
            <button
              onClick={toggle}
              className={cn("flex h-10 w-full items-center gap-3 rounded-full px-3 text-[13.5px] text-white/55 hover:bg-white/[0.07] hover:text-white", collapsed && "justify-center px-0")}
            >
              <I.sidebar size={18} />
              {!collapsed && "Collapse"}
            </button>
          </div>
        </motion.aside>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-paper/80 px-4 backdrop-blur-xl md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-accent font-display text-lg text-white">{brand[0]}</div>
            <span className="font-display text-2xl tracking-[-0.04em]">{brand}</span>
          </div>
          <a href="/" target="_blank" className="flex items-center gap-1 rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-white">
            View site <I.external size={13} />
          </a>
        </header>

        <motion.main
          animate={{ paddingLeft: collapsed ? 92 : 276 }}
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
          className="admin-main min-h-dvh pb-28 md:pb-12"
        >
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-[1320px] px-4 pt-4 md:px-8 md:pt-10"
          >
            {children}
          </motion.div>
        </motion.main>

        {/* Mobile bottom tab bar */}
        <nav className="glass-dark fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-full px-1.5 py-1.5 text-white shadow-2xl shadow-black/30 ring-1 ring-white/10 md:hidden">
          {tabs.map((t) => {
            const Icon = I[t.icon];
            const active = isActive(t.href) && !(t.href === "/admin/settings" && sheet);
            return (
              <Link key={t.href} href={t.href} className={cn("relative flex w-16 flex-col items-center gap-0.5 rounded-full py-1.5 text-[10.5px] font-semibold", active ? "text-white" : "text-white/50")}>
                {active && <motion.span layoutId="tab-active" className="absolute inset-0 rounded-full bg-accent" />}
                <Icon size={20} className="relative" />
                <span className="relative">{t.label}</span>
                {!!t.badge && <span className="absolute right-3 top-0.5 h-2 w-2 rounded-full bg-white" />}
              </Link>
            );
          })}
          <button onClick={() => setSheet(true)} className={cn("flex w-16 flex-col items-center gap-0.5 py-1.5 text-[10.5px] font-semibold", sheet ? "text-white" : "text-white/50")}>
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
                className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[30px] bg-ink px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 text-white"
              >
                <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/20" />
                {groups.map((g) => (
                  <div key={g.title} className="mb-4">
                    <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">{g.title}</div>
                    <div className="grid grid-cols-3 gap-2">
                      {g.items.map((it) => {
                        const Icon = I[it.icon];
                        return (
                          <Link
                            key={it.href}
                            href={it.href}
                            className={cn(
                              "flex flex-col items-center gap-1.5 rounded-[20px] bg-white/[0.07] px-2 py-3.5 text-center text-[11.5px] font-semibold",
                              isActive(it.href) && "bg-accent",
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
                <button onClick={logout} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-ink">
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
