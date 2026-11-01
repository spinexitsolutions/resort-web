import Link from "next/link";
import { getDB } from "@/lib/db";
import { compactMoney, formatDate, formatMoney, timeAgo } from "@/lib/utils";
import type { LeadStage } from "@/lib/types";
import { BarChart, Donut, HBars, Ring } from "@/components/admin/Charts";
import { Avatar, Card, CardHeader, Pill } from "@/components/admin/ui";
import { I } from "@/components/admin/icons";

export const dynamic = "force-dynamic";

const iso = (d: Date) => d.toISOString().slice(0, 10);
const monthKey = (s: string) => s.slice(0, 7);

export default async function Dashboard() {
  const db = await getDB();
  const now = new Date();
  const today = iso(now);
  const thisMonth = monthKey(today);
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 15);
  const lastMonth = monthKey(iso(prev));

  const live = db.bookings.filter((b) => b.status !== "cancelled");
  const revOf = (m: string) => live.filter((b) => monthKey(b.checkIn) === m).reduce((s, b) => s + b.total, 0);
  const revenue = revOf(thisMonth);
  const revenuePrev = revOf(lastMonth);
  const revDelta = revenuePrev ? Math.round(((revenue - revenuePrev) / revenuePrev) * 100) : 0;
  const monthBookings = live.filter((b) => monthKey(b.checkIn) === thisMonth);
  const nightsSold = monthBookings.reduce((s, b) => s + b.nights, 0);
  const adr = nightsSold ? revenue / nightsSold : 0;
  const inventory = db.rooms.filter((r) => r.active).reduce((s, r) => s + r.inventory, 0) || 1;
  const inHouse = live.filter((b) => b.checkIn <= today && b.checkOut > today);
  const occupancy = inHouse.length / inventory;
  const openLeads = db.inquiries.filter((q) => q.stage !== "won" && q.stage !== "lost");
  const pipelineValue = openLeads.reduce((s, q) => s + (q.value || 0), 0);
  const createdThisMonth = db.bookings.filter((b) => monthKey(b.createdAt) === thisMonth).length;

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 15);
    const key = monthKey(iso(d));
    const list = live.filter((b) => monthKey(b.checkIn) === key);
    return {
      label: d.toLocaleDateString("en-IN", { month: "short" }),
      value: list.reduce((s, b) => s + b.total, 0),
      sub: `${list.length} bookings`,
    };
  });

  const sources = Object.entries(
    db.bookings.reduce<Record<string, number>>((acc, b) => ((acc[b.source] = (acc[b.source] || 0) + 1), acc), {}),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const roomPerf = db.rooms
    .map((r) => {
      const list = live.filter((b) => b.roomId === r.id);
      return { label: r.name, value: list.reduce((s, b) => s + b.total, 0), meta: `${list.length} stays` };
    })
    .sort((a, b) => b.value - a.value);

  const week = iso(new Date(now.getTime() + 7 * 86400000));
  const arrivals = live
    .filter((b) => b.checkIn >= today && b.checkIn <= week && b.status !== "checked-out")
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .slice(0, 6);
  const departures = live
    .filter((b) => b.checkOut >= today && b.checkOut <= week && b.status === "checked-in")
    .sort((a, b) => a.checkOut.localeCompare(b.checkOut))
    .slice(0, 6);

  const stages: LeadStage[] = ["new", "contacted", "qualified", "proposal", "won", "lost"];
  const pipeline = stages.map((s) => {
    const list = db.inquiries.filter((q) => q.stage === s);
    return { stage: s, count: list.length, value: list.reduce((a, q) => a + (q.value || 0), 0) };
  });
  const maxStage = Math.max(1, ...pipeline.map((p) => p.count));

  const hour = now.getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const kpis = [
    { label: "Revenue · this month", value: compactMoney(revenue), delta: `${revDelta >= 0 ? "▲" : "▼"} ${Math.abs(revDelta)}% vs last month`, up: revDelta >= 0 },
    { label: "Bookings · this month", value: String(monthBookings.length), delta: `${createdThisMonth} created this month` },
    { label: "Avg. daily rate", value: compactMoney(Math.round(adr)), delta: `${nightsSold} room-nights sold` },
    { label: "Open leads", value: String(openLeads.length), delta: `${compactMoney(pipelineValue)} in pipeline` },
    { label: "Subscribers", value: String(db.subscribers.length), delta: `${db.guests.length} guests in CRM` },
  ];

  return (
    <div>
      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-[30px] bg-accent p-6 text-white md:p-9">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 aspect-square w-[420px] rounded-full border border-white/20" />
        <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 aspect-square w-[260px] rounded-full border border-white/15" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
              {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </div>
            <h1 className="mt-5 max-w-[14ch] font-display text-[clamp(2.8rem,6.5vw,5.6rem)] leading-[0.84] tracking-[-0.055em]">
              {greet}. <span className="text-ink">Here’s {db.settings.brand.name} today.</span>
            </h1>
          </div>
          <div className="flex items-center gap-5 rounded-[24px] bg-ink p-4 pr-6">
            <div className="relative grid place-items-center">
              <Ring value={occupancy} size={96} />
              <div className="absolute font-display text-2xl tracking-[-0.04em] tabular-nums">{Math.round(occupancy * 100)}%</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Occupancy tonight</div>
              <div className="mt-1 font-display text-3xl leading-none tracking-[-0.04em]">
                {inHouse.length}<span className="text-white/40">/{inventory}</span> <span className="text-base font-sans font-medium tracking-normal text-white/70">keys</span>
              </div>
              <div className="mt-2 text-xs text-white/60">
                {arrivals.filter((a) => a.checkIn === today).length} arriving · {departures.filter((d) => d.checkOut === today).length} departing today
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {kpis.slice(0, 4).map((k, i) => (
          <Card key={k.label} className={`p-5 md:p-6 ${i === 0 ? "!bg-ink text-white" : ""}`}>
            <div className={`text-[11.5px] font-semibold uppercase tracking-wider ${i === 0 ? "text-white/50" : "text-muted"}`}>{k.label}</div>
            <div className="mt-4 font-display text-[2.6rem] leading-none tracking-[-0.05em] tabular-nums md:text-[3.4rem]">{k.value}</div>
            <div className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${"up" in k ? (k.up ? "bg-lagoon/15 text-lagoon" : "bg-red-100 text-red-700") : i === 0 ? "bg-white/10 text-white/70" : "bg-ink/5 text-muted"}`}>{k.delta}</div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Revenue" subtitle="By check-in month · last 6 months" action={<span className="rounded-full bg-accent px-3 py-1.5 text-sm font-bold tabular-nums text-white">{formatMoney(months.reduce((s, m) => s + m.value, 0))}</span>} />
          <BarChart data={months} />
        </Card>
        <Card>
          <CardHeader title="Booking sources" subtitle="All time" />
          <Donut data={sources} centerLabel="bookings" />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Arrivals" subtitle="Next 7 days" action={<Link href="/admin/bookings" className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent">View all</Link>} />
          <ul className="divide-y divide-line px-5 pb-3 pt-2">
            {arrivals.length === 0 && <li className="py-6 text-center text-sm text-muted">No arrivals this week</li>}
            {arrivals.map((b) => (
              <li key={b.id} className="flex items-center gap-3 py-3">
                <Avatar name={b.guestName} size={34} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{b.guestName}</div>
                  <div className="truncate text-xs text-muted">{b.roomName} · {b.nights}n</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium">{b.checkIn === today ? "Today" : formatDate(b.checkIn, { day: "numeric", month: "short" })}</div>
                  <Pill tone={b.status} className="mt-1" />
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Departures" subtitle="In-house guests leaving soon" />
          <ul className="divide-y divide-line px-5 pb-3 pt-2">
            {departures.length === 0 && <li className="py-6 text-center text-sm text-muted">No departures this week</li>}
            {departures.map((b) => (
              <li key={b.id} className="flex items-center gap-3 py-3">
                <Avatar name={b.guestName} size={34} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{b.guestName}</div>
                  <div className="truncate text-xs text-muted">{b.roomName}</div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-medium">{b.checkOut === today ? "Today" : formatDate(b.checkOut, { day: "numeric", month: "short" })}</div>
                  <Pill tone={b.payment} className="mt-1" />
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Room performance" subtitle="Revenue by room type" />
          <HBars data={roomPerf} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Sales pipeline" subtitle={`${openLeads.length} open · ${formatMoney(pipelineValue)}`} action={<Link href="/admin/leads" className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent">Open board</Link>} />
          <div className="space-y-2.5 p-5">
            {pipeline.map((p) => (
              <div key={p.stage} className="flex items-center gap-3">
                <div className="w-20 shrink-0 text-[13px] capitalize text-muted">{p.stage}</div>
                <div className="relative h-9 flex-1 overflow-hidden rounded-full bg-ink/[0.05]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${Math.max(6, (p.count / maxStage) * 100)}%`,
                      background: p.stage === "won" ? "var(--lagoon)" : p.stage === "lost" ? "color-mix(in oklab, var(--ink) 12%, transparent)" : p.stage === "new" ? "var(--accent)" : "var(--ink)",
                    }}
                  />
                  <span className={`absolute inset-y-0 left-3 flex items-center text-xs font-bold ${p.stage === "lost" ? "text-ink" : "text-white"}`}>{p.count}</span>
                </div>
                <div className="w-16 shrink-0 text-right text-xs tabular-nums text-muted">{compactMoney(p.value)}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Activity" subtitle="Live from website & team" />
          <ol className="relative px-5 pb-5 pt-3">
            <span className="absolute bottom-6 left-[29px] top-5 w-px bg-line" />
            {db.activity.slice(0, 8).map((a) => (
              <li key={a.id} className="relative flex gap-3 py-2">
                <span
                  className="relative z-10 mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full ring-4 ring-white"
                  style={{ background: a.kind === "booking" ? "var(--accent)" : a.kind === "inquiry" ? "var(--lagoon)" : a.kind === "subscriber" ? "#8fa89b" : "var(--ink)" }}
                >
                  {a.kind === "booking" ? <I.calendar size={10} className="text-white" /> : <I.sparkle size={10} className="text-white" />}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] leading-snug">{a.message}</p>
                  <p className="text-[11px] text-muted">{timeAgo(a.at)}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}
