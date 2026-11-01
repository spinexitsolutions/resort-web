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
      <div className="mb-8 flex flex-col gap-1">
        <div className="eyebrow text-muted">{now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
        <h1 className="font-display text-[38px] leading-[1.05] tracking-tight md:text-[52px]">
          {greet}. <span className="text-muted">Here’s {db.settings.brand.name} today.</span>
        </h1>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-6">
        <Card className="col-span-2 flex items-center gap-5 !border-ink !bg-ink p-5 text-paper lg:col-span-2 lg:row-span-1">
          <div className="relative grid place-items-center">
            <Ring value={occupancy} size={92} />
            <div className="absolute text-xl font-semibold tabular-nums">{Math.round(occupancy * 100)}%</div>
          </div>
          <div>
            <div className="text-[12.5px] text-paper/60">Occupancy tonight</div>
            <div className="mt-1 text-[15px]">
              <span className="font-semibold">{inHouse.length}</span> of {inventory} keys occupied
            </div>
            <div className="mt-2 text-xs text-paper/50">
              {arrivals.filter((a) => a.checkIn === today).length} arriving · {departures.filter((d) => d.checkOut === today).length} departing today
            </div>
          </div>
        </Card>
        {kpis.slice(0, 4).map((k) => (
          <Card key={k.label} className="p-4 md:p-5">
            <div className="text-[12px] font-medium text-muted">{k.label}</div>
            <div className="mt-2.5 text-[26px] font-semibold tracking-tight tabular-nums md:text-[28px]">{k.value}</div>
            <div className={`mt-1 text-[11.5px] ${"up" in k ? (k.up ? "text-emerald-600" : "text-red-600") : "text-muted"}`}>{k.delta}</div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Revenue" subtitle="By check-in month · last 6 months" action={<span className="text-sm font-semibold tabular-nums">{formatMoney(months.reduce((s, m) => s + m.value, 0))}</span>} />
          <BarChart data={months} />
        </Card>
        <Card>
          <CardHeader title="Booking sources" subtitle="All time" />
          <Donut data={sources} centerLabel="bookings" />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Arrivals" subtitle="Next 7 days" action={<Link href="/admin/bookings" className="text-xs font-medium text-[color:var(--accent)]">View all</Link>} />
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
          <CardHeader title="Sales pipeline" subtitle={`${openLeads.length} open · ${formatMoney(pipelineValue)}`} action={<Link href="/admin/leads" className="text-xs font-medium text-[color:var(--accent)]">Open board</Link>} />
          <div className="space-y-2.5 p-5">
            {pipeline.map((p) => (
              <div key={p.stage} className="flex items-center gap-3">
                <div className="w-20 shrink-0 text-[13px] capitalize text-muted">{p.stage}</div>
                <div className="relative h-8 flex-1 overflow-hidden rounded-lg bg-mist">
                  <div
                    className="absolute inset-y-0 left-0 rounded-lg"
                    style={{
                      width: `${Math.max(6, (p.count / maxStage) * 100)}%`,
                      background: p.stage === "won" ? "#10b981" : p.stage === "lost" ? "#d4d4d8" : "color-mix(in oklab, var(--lagoon) 75%, white)",
                    }}
                  />
                  <span className="absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-ink">{p.count}</span>
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
