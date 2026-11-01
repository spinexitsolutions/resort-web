"use client";

import { AnimatePresence, motion, Reorder } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/admin-client";
import type { SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ImageInput } from "./fields";
import { I } from "./icons";
import { useToast } from "./toast";
import { Button, Card, Field, IconButton, Input, PageHeader, Segmented, Textarea, Toggle, ToggleRow } from "./ui";

type Tab = "brand" | "theme" | "intro" | "navbar" | "announcement" | "hero" | "story" | "spa" | "events" | "sections" | "seo" | "danger";

const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: "brand", label: "Brand & Contact", hint: "Name, address, phone, socials" },
  { id: "theme", label: "Theme", hint: "Colours across the site" },
  { id: "intro", label: "Intro animation", hint: "The opening sequence" },
  { id: "navbar", label: "Navigation", hint: "Menu links & island widgets" },
  { id: "announcement", label: "Announcement", hint: "Top banner" },
  { id: "hero", label: "Hero", hint: "First screen of the homepage" },
  { id: "story", label: "Story", hint: "About section & stats" },
  { id: "spa", label: "Spa", hint: "Wellness section & rituals" },
  { id: "events", label: "Events", hint: "Weddings & celebrations" },
  { id: "sections", label: "Homepage layout", hint: "Order & visibility" },
  { id: "seo", label: "SEO & Footer", hint: "Search & sharing" },
  { id: "danger", label: "Demo data", hint: "Reset everything" },
];

type Path = (string | number)[];

function setIn<T>(obj: T, path: Path, value: unknown): T {
  const clone = structuredClone(obj) as unknown as Record<string | number, unknown>;
  let cur = clone;
  path.slice(0, -1).forEach((k) => {
    cur = cur[k] as Record<string | number, unknown>;
  });
  cur[path[path.length - 1]] = value;
  return clone as unknown as T;
}

export function SettingsClient({ settings: initial }: { settings: SiteSettings }) {
  const router = useRouter();
  const toast = useToast();
  const [s, setS] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [tab, setTab] = useState<Tab>("brand");
  const [saving, setSaving] = useState(false);
  const dirty = useMemo(() => JSON.stringify(s) !== JSON.stringify(saved), [s, saved]);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const set = (path: Path, value: unknown) => setS((prev) => setIn(prev, path, value));

  const save = async () => {
    setSaving(true);
    try {
      const next = await api<SiteSettings>("/api/admin/settings", "PUT", s);
      setS(next);
      setSaved(next);
      toast("Published to website");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (dirty) save();
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  const txt = (path: Path, label: string, opts: { area?: boolean; hint?: string; type?: string } = {}) => {
    let v: unknown = s;
    for (const k of path) v = (v as Record<string | number, unknown>)[k];
    return (
      <Field label={label} hint={opts.hint}>
        {opts.area ? (
          <Textarea value={String(v ?? "")} onChange={(e) => set(path, e.target.value)} rows={4} />
        ) : (
          <Input type={opts.type ?? "text"} value={String(v ?? "")} onChange={(e) => set(path, e.target.value)} />
        )}
      </Field>
    );
  };
  const img = (path: Path, label: string) => {
    let v: unknown = s;
    for (const k of path) v = (v as Record<string | number, unknown>)[k];
    return (
      <Field label={label} as="div">
        <ImageInput value={String(v ?? "")} onChange={(val) => set(path, val)} />
      </Field>
    );
  };

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Every word, colour and animation on the website — changes go live when you publish."
        actions={
          <>
            <a href="/" target="_blank" rel="noreferrer">
              <Button>
                <I.external size={16} /> View site
              </Button>
            </a>
            <Button variant="primary" onClick={save} loading={saving} disabled={!dirty}>
              {dirty ? "Publish changes" : "All changes live"}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Tabs */}
        <nav className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative shrink-0 rounded-xl px-3.5 py-2 text-left text-[13.5px] transition lg:py-2.5",
                tab === t.id ? "text-ink" : "text-ink/55 hover:text-ink max-lg:bg-white max-lg:ring-1 max-lg:ring-line",
              )}
            >
              {tab === t.id && <motion.span layoutId="settings-tab" className="absolute inset-0 rounded-xl bg-white shadow-sm ring-1 ring-line max-lg:bg-ink" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
              <span className={cn("relative block font-medium", tab === t.id && "max-lg:text-paper", t.id === "danger" && "text-red-600")}>{t.label}</span>
              <span className="relative hidden text-[11.5px] text-muted lg:block">{t.hint}</span>
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="min-w-0">
            {tab === "brand" && (
              <Panel title="Brand & contact">
                <Grid>
                  {txt(["brand", "name"], "Resort name")}
                  {txt(["brand", "tagline"], "Tagline")}
                  {txt(["brand", "location"], "Location")}
                  {txt(["brand", "coordinates"], "Coordinates", { hint: "Shown in the navbar & footer" })}
                  {txt(["brand", "phone"], "Phone")}
                  {txt(["brand", "email"], "Email")}
                  {txt(["brand", "whatsapp"], "WhatsApp number", { hint: "Digits only, with country code" })}
                  {txt(["brand", "established"], "Established")}
                  {txt(["brand", "checkIn"], "Check-in time")}
                  {txt(["brand", "checkOut"], "Check-out time")}
                </Grid>
                {txt(["brand", "address"], "Address", { area: true })}
                {txt(["brand", "mapEmbed"], "Map embed URL", { hint: "OpenStreetMap or Google Maps embed src" })}
                <Grid>
                  {txt(["brand", "instagram"], "Instagram")}
                  {txt(["brand", "facebook"], "Facebook")}
                  {txt(["brand", "youtube"], "YouTube")}
                  {txt(["brand", "currency"], "Currency code")}
                </Grid>
              </Panel>
            )}

            {tab === "theme" && (
              <Panel title="Theme colours">
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ["accent", "Accent", "Buttons, highlights, links"],
                      ["ink", "Ink", "Text & dark surfaces"],
                      ["paper", "Paper", "Page background"],
                      ["lagoon", "Lagoon", "Secondary colour"],
                    ] as const
                  ).map(([k, label, hint]) => (
                    <label key={k} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl ring-1 ring-line" style={{ background: s.theme[k] }}>
                        <input type="color" value={s.theme[k]} onChange={(e) => set(["theme", k], e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{label}</span>
                        <span className="block text-xs text-muted">{hint}</span>
                      </span>
                      <input value={s.theme[k]} onChange={(e) => set(["theme", k], e.target.value)} className="w-20 rounded-lg bg-mist px-2 py-1 font-mono text-xs uppercase outline-none" />
                    </label>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="self-center text-xs text-muted">Presets:</span>
                  {[
                    { name: "Island", accent: "#C08A4E", ink: "#0E1A16", paper: "#F3EFE7", lagoon: "#1F5C57" },
                    { name: "Monsoon", accent: "#7A9E7E", ink: "#141A1F", paper: "#EEF0EC", lagoon: "#2E4A5C" },
                    { name: "Desert", accent: "#C2603A", ink: "#2A1A12", paper: "#F6EEE3", lagoon: "#8C6A43" },
                    { name: "Noir", accent: "#D4B483", ink: "#0B0B0C", paper: "#F5F4F0", lagoon: "#3A3A3C" },
                  ].map((p) => (
                    <button key={p.name} onClick={() => set(["theme"], { accent: p.accent, ink: p.ink, paper: p.paper, lagoon: p.lagoon })} className="flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 text-xs font-medium hover:bg-mist">
                      <span className="flex -space-x-1">
                        {[p.ink, p.accent, p.lagoon, p.paper].map((c) => (
                          <span key={c} className="h-5 w-5 rounded-full ring-2 ring-white" style={{ background: c }} />
                        ))}
                      </span>
                      {p.name}
                    </button>
                  ))}
                </div>
                <div className="overflow-hidden rounded-[22px] ring-1 ring-line" style={{ background: s.theme.paper, color: s.theme.ink }}>
                  <div className="relative h-36 overflow-hidden" style={{ background: s.theme.lagoon }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.hero.image} alt="" className="h-full w-full object-cover opacity-70 mix-blend-luminosity" />
                    <div className="absolute inset-x-4 top-4 mx-auto flex max-w-xs items-center justify-between rounded-full px-4 py-2 text-xs" style={{ background: `${s.theme.ink}cc`, color: s.theme.paper }}>
                      <span className="font-display text-base">{s.brand.name}</span>
                      <span className="rounded-full px-3 py-1 font-medium" style={{ background: s.theme.accent, color: "#fff" }}>{s.navbar.ctaLabel}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="eyebrow" style={{ color: s.theme.accent }}>Live preview</div>
                    <div className="mt-1 font-display text-3xl leading-tight">{s.hero.title}</div>
                    <p className="mt-2 text-sm opacity-70">{s.hero.subtitle}</p>
                    <div className="mt-4 flex gap-2">
                      <span className="rounded-full px-4 py-2 text-sm font-medium" style={{ background: s.theme.ink, color: s.theme.paper }}>{s.hero.ctaPrimary}</span>
                      <span className="rounded-full border px-4 py-2 text-sm" style={{ borderColor: `${s.theme.ink}30` }}>{s.hero.ctaSecondary}</span>
                    </div>
                  </div>
                </div>
              </Panel>
            )}

            {tab === "intro" && (
              <Panel title="Intro animation">
                <ToggleRow label="Show intro animation" hint="Plays when a visitor first lands on the site" checked={s.intro.enabled} onChange={(v) => set(["intro", "enabled"], v)} />
                <ToggleRow label="Only once per session" hint="Returning page views skip the intro" checked={s.intro.oncePerSession} onChange={(v) => set(["intro", "oncePerSession"], v)} />
                <Field label="Style" as="div">
                  <Segmented
                    value={s.intro.style}
                    onChange={(v) => set(["intro", "style"], v)}
                    options={[
                      { value: "curtain", label: "Curtain reveal" },
                      { value: "counter", label: "Counter" },
                      { value: "letters", label: "Letters" },
                    ]}
                  />
                </Field>
                <IntroPreview intro={s.intro} theme={s.theme} />
                <Grid>
                  {txt(["intro", "text"], "Headline")}
                  {txt(["intro", "subtext"], "Subtext")}
                </Grid>
                <Field label={`Duration — ${s.intro.duration.toFixed(1)}s`}>
                  <input type="range" min={1.5} max={6} step={0.1} value={s.intro.duration} onChange={(e) => set(["intro", "duration"], Number(e.target.value))} className="w-full accent-[var(--accent)]" />
                </Field>
                {img(["intro", "image"], "Background image")}
              </Panel>
            )}

            {tab === "navbar" && (
              <Panel title="Navigation">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ToggleRow label="Live local clock" hint="Shown in the island navbar" checked={s.navbar.showClock} onChange={(v) => set(["navbar", "showClock"], v)} />
                  <ToggleRow label="Weather chip" hint="Temperature at the resort" checked={s.navbar.showWeather} onChange={(v) => set(["navbar", "showWeather"], v)} />
                </div>
                {txt(["navbar", "ctaLabel"], "Booking button label")}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[13px] font-medium text-ink/75">Menu links</span>
                    <Button size="sm" onClick={() => set(["navbar", "links"], [...s.navbar.links, { label: "New link", href: "/", image: "" }])}>
                      <I.plus size={14} /> Add link
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {s.navbar.links.map((l, i) => (
                      <div key={i} className="rounded-2xl border border-line bg-white p-3">
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-center text-xs text-muted">{i + 1}</span>
                          <Input value={l.label} onChange={(e) => set(["navbar", "links", i, "label"], e.target.value)} placeholder="Label" className="flex-1" />
                          <Input value={l.href} onChange={(e) => set(["navbar", "links", i, "href"], e.target.value)} placeholder="/path" className="flex-1 font-mono text-xs" />
                          <ListControls
                            i={i}
                            n={s.navbar.links.length}
                            onMove={(d) => set(["navbar", "links"], swap(s.navbar.links, i, i + d))}
                            onRemove={() => set(["navbar", "links"], s.navbar.links.filter((_, j) => j !== i))}
                          />
                        </div>
                        <div className="mt-2 pl-7">
                          <ImageInput compact value={l.image} onChange={(v) => set(["navbar", "links", i, "image"], v)} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted">Images appear as hover previews in the full-screen menu.</p>
                </div>
              </Panel>
            )}

            {tab === "announcement" && (
              <Panel title="Announcement bar">
                <ToggleRow label="Show announcement" checked={s.announcement.enabled} onChange={(v) => set(["announcement", "enabled"], v)} />
                {txt(["announcement", "text"], "Message")}
                {txt(["announcement", "link"], "Link")}
                <div className="rounded-xl px-4 py-2.5 text-center text-xs" style={{ background: s.theme.ink, color: s.theme.paper, opacity: s.announcement.enabled ? 1 : 0.4 }}>
                  {s.announcement.text} →
                </div>
              </Panel>
            )}

            {tab === "hero" && (
              <Panel title="Hero">
                {txt(["hero", "eyebrow"], "Eyebrow")}
                {txt(["hero", "title"], "Headline", { hint: "Keep it under ~8 words for the best animation" })}
                {txt(["hero", "subtitle"], "Subtitle", { area: true })}
                <Grid>
                  {txt(["hero", "ctaPrimary"], "Primary button")}
                  {txt(["hero", "ctaSecondary"], "Secondary button")}
                </Grid>
                <div className="grid gap-4 sm:grid-cols-3">
                  {txt(["hero", "leftWord"], "Left word", { hint: "e.g. Forest" })}
                  {txt(["hero", "connector"], "Connector", { hint: "Shown on the divider" })}
                  {txt(["hero", "rightWord"], "Right word", { hint: "e.g. Sea" })}
                </div>
                {img(["hero", "image"], "Left / top image")}
                {img(["hero", "image2"], "Right / bottom image")}
                {txt(["hero", "video"], "Background video URL (optional)", { hint: "MP4 — overrides the image when set" })}
              </Panel>
            )}

            {tab === "story" && (
              <Panel title="Our story">
                {txt(["story", "eyebrow"], "Eyebrow")}
                {txt(["story", "heading"], "Statement", { area: true, hint: "Animates word-by-word on scroll" })}
                {txt(["story", "body"], "Body", { area: true })}
                {img(["story", "image"], "Image")}
                {txt(["story", "imageAlt"], "Image alt text")}
                <ListEditor
                  label="Stats"
                  items={s.story.stats}
                  onChange={(v) => set(["story", "stats"], v)}
                  blank={{ value: "", label: "" }}
                  render={(it, up) => (
                    <>
                      <Input value={it.value} onChange={(e) => up({ ...it, value: e.target.value })} placeholder="41" className="w-24" />
                      <Input value={it.label} onChange={(e) => up({ ...it, label: e.target.value })} placeholder="Label" className="flex-1" />
                    </>
                  )}
                />
              </Panel>
            )}

            {tab === "spa" && (
              <Panel title="Spa & wellness">
                {txt(["spa", "eyebrow"], "Eyebrow")}
                {txt(["spa", "heading"], "Heading")}
                {txt(["spa", "body"], "Body", { area: true })}
                {img(["spa", "image"], "Image")}
                <ListEditor
                  label="Rituals"
                  items={s.spa.rituals}
                  onChange={(v) => set(["spa", "rituals"], v)}
                  blank={{ name: "", duration: "60 min", price: 0 }}
                  render={(it, up) => (
                    <>
                      <Input value={it.name} onChange={(e) => up({ ...it, name: e.target.value })} placeholder="Ritual" className="flex-1" />
                      <Input value={it.duration} onChange={(e) => up({ ...it, duration: e.target.value })} className="w-24" />
                      <Input type="number" value={it.price} onChange={(e) => up({ ...it, price: Number(e.target.value) })} className="w-24" />
                    </>
                  )}
                />
              </Panel>
            )}

            {tab === "events" && (
              <Panel title="Weddings & events">
                {txt(["events", "eyebrow"], "Eyebrow")}
                {txt(["events", "heading"], "Heading")}
                {txt(["events", "body"], "Body", { area: true })}
                {img(["events", "image"], "Image")}
                <p className="text-xs text-muted">Venues are managed under Content → Venues.</p>
              </Panel>
            )}

            {tab === "sections" && (
              <Panel title="Homepage layout">
                <p className="-mt-2 text-sm text-muted">Drag to reorder. Toggle to hide a section without deleting its content.</p>
                <Reorder.Group axis="y" values={s.sections} onReorder={(v) => set(["sections"], v)} className="space-y-2">
                  {s.sections.map((sec, i) => (
                    <Reorder.Item
                      key={sec.id}
                      value={sec}
                      whileDrag={{ scale: 1.02, boxShadow: "0 12px 30px rgba(0,0,0,.12)" }}
                      className={cn("flex items-center gap-3 rounded-2xl border border-line bg-white px-3 py-2.5", !sec.enabled && "opacity-55")}
                    >
                      <I.grip size={18} className="shrink-0 cursor-grab text-ink/30 active:cursor-grabbing" />
                      <span className="w-5 text-xs tabular-nums text-muted">{i + 1}</span>
                      <span className="flex-1 text-sm font-medium">{sec.label}</span>
                      <span className="hidden font-mono text-[11px] text-muted sm:inline">#{sec.id}</span>
                      <IconButton label="Move up" disabled={i === 0} onClick={() => set(["sections"], swap(s.sections, i, i - 1))}>
                        <I.up size={16} />
                      </IconButton>
                      <IconButton label="Move down" disabled={i === s.sections.length - 1} onClick={() => set(["sections"], swap(s.sections, i, i + 1))}>
                        <I.down size={16} />
                      </IconButton>
                      <Toggle checked={sec.enabled} onChange={(v) => set(["sections", i, "enabled"], v)} label={`Show ${sec.label}`} />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </Panel>
            )}

            {tab === "seo" && (
              <Panel title="SEO & footer">
                {txt(["seo", "title"], "Page title")}
                {txt(["seo", "description"], "Meta description", { area: true })}
                <div className="rounded-2xl border border-line bg-white p-4">
                  <div className="text-xs text-emerald-700">aranya.resort</div>
                  <div className="truncate text-lg text-[#1a0dab]">{s.seo.title}</div>
                  <div className="line-clamp-2 text-sm text-muted">{s.seo.description}</div>
                </div>
                {txt(["footer", "note"], "Footer note")}
              </Panel>
            )}

            {tab === "danger" && <DangerZone />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating save bar */}
      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 34 }}
            className="fixed inset-x-3 bottom-24 z-40 mx-auto flex max-w-md items-center justify-between gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-paper shadow-2xl md:bottom-6"
          >
            <span className="text-sm">Unsaved changes</span>
            <div className="flex gap-1.5">
              <Button size="sm" variant="ghost" className="text-paper/70 hover:bg-white/10 hover:text-paper" onClick={() => setS(saved)}>
                Discard
              </Button>
              <Button size="sm" variant="accent" loading={saving} onClick={save}>
                Publish
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function swap<T>(arr: T[], i: number, j: number): T[] {
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5 md:p-7">
      <h2 className="mb-5 font-display text-3xl tracking-tight">{title}</h2>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function ListControls({ i, n, onMove, onRemove }: { i: number; n: number; onMove: (d: -1 | 1) => void; onRemove: () => void }) {
  return (
    <div className="flex shrink-0">
      <IconButton label="Move up" disabled={i === 0} onClick={() => onMove(-1)}>
        <I.up size={15} />
      </IconButton>
      <IconButton label="Move down" disabled={i === n - 1} onClick={() => onMove(1)}>
        <I.down size={15} />
      </IconButton>
      <IconButton label="Remove" onClick={onRemove} className="hover:text-red-600">
        <I.trash size={15} />
      </IconButton>
    </div>
  );
}

function ListEditor<T>({
  label,
  items,
  onChange,
  blank,
  render,
}: {
  label: string;
  items: T[];
  onChange: (v: T[]) => void;
  blank: T;
  render: (item: T, update: (v: T) => void) => React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13px] font-medium text-ink/75">{label}</span>
        <Button size="sm" onClick={() => onChange([...items, structuredClone(blank)])}>
          <I.plus size={14} /> Add
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2 rounded-2xl border border-line bg-white p-2">
            {render(it, (v) => onChange(items.map((x, j) => (j === i ? v : x))))}
            <ListControls i={i} n={items.length} onMove={(d) => onChange(swap(items, i, i + d))} onRemove={() => onChange(items.filter((_, j) => j !== i))} />
          </div>
        ))}
      </div>
    </div>
  );
}

function IntroPreview({ intro, theme }: { intro: SiteSettings["intro"]; theme: SiteSettings["theme"] }) {
  const [run, setRun] = useState(0);
  const d = Math.max(1.2, intro.duration);
  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-[20px] ring-1 ring-line" style={{ background: theme.ink }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={intro.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
      <motion.div key={`${run}-${intro.style}`} className="absolute inset-0">
        {intro.style === "curtain" && (
          <>
            <motion.div initial={{ scaleY: 1 }} animate={{ scaleY: 0 }} transition={{ delay: d * 0.6, duration: d * 0.35, ease: [0.76, 0, 0.24, 1] }} style={{ originY: 0, background: theme.ink }} className="absolute inset-0" />
            <div className="absolute inset-0 grid place-items-center text-center" style={{ color: theme.paper }}>
              <div className="overflow-hidden">
                <motion.div initial={{ y: "110%" }} animate={{ y: ["110%", "0%", "0%", "-110%"] }} transition={{ duration: d * 0.7, times: [0, 0.35, 0.8, 1], ease: [0.16, 1, 0.3, 1] }} className="font-display text-4xl md:text-5xl">
                  {intro.text}
                </motion.div>
              </div>
            </div>
          </>
        )}
        {intro.style === "counter" && <CounterPreview d={d} intro={intro} theme={theme} />}
        {intro.style === "letters" && (
          <div className="absolute inset-0 grid place-items-center" style={{ color: theme.paper }}>
            <div className="flex font-display text-4xl md:text-6xl">
              {intro.text.split("").map((c, i) => (
                <motion.span key={i} initial={{ opacity: 0, y: 30, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.15 + i * (d * 0.06), duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                  {c === " " ? " " : c}
                </motion.span>
              ))}
            </div>
          </div>
        )}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: d * 0.3 }} className="absolute inset-x-0 bottom-5 text-center font-display text-sm" style={{ color: theme.paper }}>
          {intro.subtext}
        </motion.div>
      </motion.div>
      <button onClick={() => setRun((r) => r + 1)} className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium backdrop-blur">
        ↻ Replay
      </button>
      {!intro.enabled && <div className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-medium text-white">Disabled</div>}
    </div>
  );
}

function CounterPreview({ d, intro, theme }: { d: number; intro: SiteSettings["intro"]; theme: SiteSettings["theme"] }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (d * 800));
      setN(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [d]);
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-5" style={{ color: theme.paper }}>
      <div className="font-display text-2xl">{intro.text}</div>
      <div className="flex items-end justify-between">
        <div className="h-px flex-1 origin-left" style={{ background: theme.paper, transform: `scaleX(${n / 100})`, opacity: 0.5 }} />
        <div className="ml-4 font-display text-6xl tabular-nums leading-none">{n}</div>
      </div>
    </div>
  );
}

function DangerZone() {
  const toast = useToast();
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const reset = async () => {
    setBusy(true);
    try {
      await api("/api/admin/reset", "POST");
      toast("Demo data restored");
      router.refresh();
      setTimeout(() => window.location.reload(), 600);
    } catch (e) {
      toast((e as Error).message, "error");
      setBusy(false);
    }
  };
  return (
    <Card className="border-red-200 p-5 md:p-7">
      <h2 className="font-display text-3xl tracking-tight text-red-700">Reset demo data</h2>
      <p className="mt-2 max-w-lg text-sm text-muted">
        Restores every room, booking, lead, guest and setting to the original demo state. Uploaded files are kept. Type <span className="font-mono text-ink">RESET</span> to confirm.
      </p>
      <div className="mt-5 flex max-w-sm gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="RESET" />
        <Button variant="danger" disabled={text !== "RESET"} loading={busy} onClick={reset}>
          Reset
        </Button>
      </div>
    </Card>
  );
}
