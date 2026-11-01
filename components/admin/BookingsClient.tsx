"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api, downloadCSV } from "@/lib/admin-client";
import type { Booking, BookingStatus, Guest, PaymentStatus, Room } from "@/lib/types";
import { cn, formatDate, formatMoney, nightsBetween } from "@/lib/utils";
import { I } from "./icons";
import { useToast } from "./toast";
import { Avatar, Button, Card, Drawer, Empty, Field, IconButton, Input, PageHeader, Pill, SearchInput, Segmented, Select, Textarea, useConfirm } from "./ui";

const STATUSES: BookingStatus[] = ["pending", "confirmed", "checked-in", "checked-out", "cancelled"];
const PAYMENTS: PaymentStatus[] = ["unpaid", "partial", "paid"];
const SOURCES: Booking["source"][] = ["website", "phone", "walk-in", "ota", "agent"];

type Draft = Omit<Booking, "id" | "createdAt" | "guestId"> & { id?: string; guestId?: string; createdAt?: string };

const iso = (d: Date) => d.toISOString().slice(0, 10);

function blank(rooms: Room[]): Draft {
  const r = rooms[0];
  const ci = new Date();
  ci.setDate(ci.getDate() + 1);
  const co = new Date(ci);
  co.setDate(co.getDate() + 2);
  return {
    ref: `ARN-${Date.now().toString(36).slice(-5).toUpperCase()}`,
    guestName: "",
    email: "",
    phone: "",
    roomId: r?.id ?? "",
    roomName: r?.name ?? "",
    checkIn: iso(ci),
    checkOut: iso(co),
    adults: 2,
    children: 0,
    nights: 2,
    total: r ? Math.round(r.price * 2 * 1.18) : 0,
    offerCode: "",
    status: "confirmed",
    payment: "unpaid",
    source: "phone",
    requests: "",
  };
}

export function BookingsClient({ bookings, rooms, guests }: { bookings: Booking[]; rooms: Room[]; guests: Guest[] }) {
  const router = useRouter();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | BookingStatus>("all");
  const [payment, setPayment] = useState<"all" | PaymentStatus>("all");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState(bookings);
  useEffect(() => setRows(bookings), [bookings]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter(
      (b) =>
        (status === "all" || b.status === status) &&
        (payment === "all" || b.payment === payment) &&
        (!s || [b.guestName, b.email, b.ref, b.roomName, b.phone].some((v) => v?.toLowerCase().includes(s))),
    );
  }, [rows, q, status, payment]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    rows.forEach((b) => (c[b.status] = (c[b.status] || 0) + 1));
    return c;
  }, [rows]);

  const patch = async (b: Booking, p: Partial<Booking>) => {
    setRows((r) => r.map((x) => (x.id === b.id ? { ...x, ...p } : x)));
    try {
      await api(`/api/admin/bookings/${b.id}`, "PATCH", p);
      toast(`${b.ref} updated`);
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
      setRows(bookings);
    }
  };

  const setField = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => {
      if (!d) return d;
      const next = { ...d, [k]: v };
      if (k === "roomId" || k === "checkIn" || k === "checkOut") {
        const room = rooms.find((r) => r.id === next.roomId);
        next.roomName = room?.name ?? "";
        next.nights = nightsBetween(next.checkIn, next.checkOut);
        if (room) next.total = Math.round(room.price * next.nights * 1.18);
      }
      return next;
    });

  const save = async () => {
    if (!draft) return;
    if (!draft.guestName || !draft.email) return toast("Guest name and email are required", "error");
    if (draft.nights <= 0) return toast("Check-out must be after check-in", "error");
    setSaving(true);
    try {
      if (draft.id) {
        const { id, ...rest } = draft;
        await api(`/api/admin/bookings/${id}`, "PATCH", rest);
        toast("Booking saved");
      } else {
        let guest = guests.find((g) => g.email.toLowerCase() === draft.email.toLowerCase());
        if (!guest) {
          guest = await api<Guest>("/api/admin/guests", "POST", {
            name: draft.guestName,
            email: draft.email.toLowerCase(),
            phone: draft.phone,
            city: "",
            tags: [],
            vip: false,
            notes: "",
          });
        }
        await api("/api/admin/bookings", "POST", { ...draft, guestId: guest.id });
        toast(`Booking ${draft.ref} created`);
      }
      setDraft(null);
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!draft?.id) return;
    if (!(await confirm(`Delete booking ${draft.ref}?`))) return;
    await api(`/api/admin/bookings/${draft.id}`, "DELETE");
    toast("Booking deleted");
    setDraft(null);
    router.refresh();
  };

  const exportCSV = () =>
    downloadCSV(
      `bookings-${iso(new Date())}.csv`,
      filtered.map((b) => ({
        Ref: b.ref, Guest: b.guestName, Email: b.email, Phone: b.phone, Room: b.roomName, CheckIn: b.checkIn, CheckOut: b.checkOut,
        Nights: b.nights, Adults: b.adults, Children: b.children, Total: b.total, Status: b.status, Payment: b.payment, Source: b.source, Created: b.createdAt,
      })),
    );

  return (
    <>
      <PageHeader
        title="Bookings"
        subtitle={`${rows.filter((b) => b.status === "pending").length} awaiting confirmation · ${rows.length} total`}
        actions={
          <>
            <Segmented value={view} onChange={setView} options={[{ value: "list", label: "List" }, { value: "calendar", label: "Occupancy" }]} />
            <Button onClick={exportCSV}>
              <I.download size={16} /> Export
            </Button>
            <Button variant="primary" onClick={() => setDraft(blank(rooms))}>
              <I.plus size={16} /> New booking
            </Button>
          </>
        }
      />

      {view === "calendar" ? (
        <OccupancyCalendar bookings={rows} rooms={rooms} />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Segmented
              value={status}
              onChange={setStatus}
              options={[{ value: "all", label: "All", count: counts.all }, ...STATUSES.map((s) => ({ value: s, label: s.replace("-", " "), count: counts[s] || 0 }))]}
            />
            <div className="flex gap-2">
              <SearchInput value={q} onChange={setQ} placeholder="Guest, ref, room…" />
              <div className="w-36 shrink-0">
                <Select value={payment} onChange={(e) => setPayment(e.target.value as typeof payment)} aria-label="Payment filter">
                  <option value="all">Any payment</option>
                  {PAYMENTS.map((p) => (
                    <option key={p} value={p} className="capitalize">
                      {p}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <Empty title="No bookings match" body="Try a different filter or search term." />
          ) : (
            <>
              {/* Desktop table */}
              <Card className="hidden overflow-hidden md:block">
                <table className="w-full text-left text-[13.5px]">
                  <thead className="border-b border-line bg-mist/50 text-[11.5px] uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-5 py-3 font-medium">Guest</th>
                      <th className="px-3 py-3 font-medium">Room</th>
                      <th className="px-3 py-3 font-medium">Stay</th>
                      <th className="px-3 py-3 text-right font-medium">Total</th>
                      <th className="px-3 py-3 font-medium">Payment</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filtered.map((b) => (
                      <tr key={b.id} className="group cursor-pointer transition-colors hover:bg-mist/40" onClick={() => setDraft({ ...b })}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={b.guestName} size={32} />
                            <div className="min-w-0">
                              <div className="truncate font-medium">{b.guestName}</div>
                              <div className="font-mono text-[11px] text-muted">
                                {b.ref} · {b.source}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="max-w-[180px] truncate px-3 py-3">{b.roomName}</td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {formatDate(b.checkIn, { day: "numeric", month: "short" })} → {formatDate(b.checkOut, { day: "numeric", month: "short" })}
                          <div className="text-[11px] text-muted">
                            {b.nights} nights · {b.adults + b.children} guests
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right font-medium tabular-nums">{formatMoney(b.total)}</td>
                        <td className="px-3 py-3">
                          <Pill tone={b.payment} />
                        </td>
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <StatusSelect value={b.status} onChange={(s) => patch(b, { status: s })} />
                        </td>
                        <td className="pr-3 text-ink/30 group-hover:text-ink/60">
                          <I.right size={16} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              {/* Mobile cards */}
              <div className="space-y-2.5 md:hidden">
                {filtered.map((b) => (
                  <Card key={b.id} className="p-4 active:scale-[0.99] transition" onClick={() => setDraft({ ...b })}>
                    <div className="flex items-start gap-3">
                      <Avatar name={b.guestName} size={38} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="truncate font-medium">{b.guestName}</div>
                          <div className="font-semibold tabular-nums">{formatMoney(b.total)}</div>
                        </div>
                        <div className="truncate text-xs text-muted">{b.roomName}</div>
                        <div className="mt-1 text-xs">
                          {formatDate(b.checkIn, { day: "numeric", month: "short" })} → {formatDate(b.checkOut, { day: "numeric", month: "short" })} · {b.nights}n
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <Pill tone={b.payment} />
                      <StatusSelect value={b.status} onChange={(s) => patch(b, { status: s })} />
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <Drawer
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? `Booking ${draft.ref}` : "New booking"}
        subtitle={draft?.id ? `Created ${formatDate(draft.createdAt ?? "")} via ${draft.source}` : "Phone, walk-in or agent reservation"}
        footer={
          <>
            {draft?.id && (
              <Button variant="ghost" className="mr-auto text-red-600" onClick={remove}>
                <I.trash size={16} /> Delete
              </Button>
            )}
            <Button onClick={() => setDraft(null)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={save}>
              {draft?.id ? "Save changes" : "Create booking"}
            </Button>
          </>
        }
      >
        {draft && (
          <div className="space-y-6">
            <section className="grid grid-cols-2 gap-3">
              <div className="col-span-2 eyebrow text-muted">Guest</div>
              <Field label="Full name" className="col-span-2">
                <Input value={draft.guestName} onChange={(e) => setField("guestName", e.target.value)} list="guest-names" />
                <datalist id="guest-names">
                  {guests.map((g) => (
                    <option key={g.id} value={g.name} />
                  ))}
                </datalist>
              </Field>
              <Field label="Email">
                <Input type="email" value={draft.email} onChange={(e) => setField("email", e.target.value)} onFocus={() => {
                  const g = guests.find((x) => x.name === draft.guestName);
                  if (g && !draft.email) setDraft({ ...draft, email: g.email, phone: draft.phone || g.phone });
                }} />
              </Field>
              <Field label="Phone">
                <Input value={draft.phone} onChange={(e) => setField("phone", e.target.value)} />
              </Field>
            </section>

            <section className="grid grid-cols-2 gap-3">
              <div className="col-span-2 eyebrow text-muted">Stay</div>
              <Field label="Room" className="col-span-2">
                <Select value={draft.roomId} onChange={(e) => setField("roomId", e.target.value)}>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {formatMoney(r.price)}/night
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Check-in">
                <Input type="date" value={draft.checkIn} onChange={(e) => setField("checkIn", e.target.value)} />
              </Field>
              <Field label="Check-out">
                <Input type="date" value={draft.checkOut} min={draft.checkIn} onChange={(e) => setField("checkOut", e.target.value)} />
              </Field>
              <Field label="Adults">
                <Input type="number" min={1} value={draft.adults} onChange={(e) => setField("adults", Number(e.target.value))} />
              </Field>
              <Field label="Children">
                <Input type="number" min={0} value={draft.children} onChange={(e) => setField("children", Number(e.target.value))} />
              </Field>
              <div className="col-span-2 flex items-center justify-between rounded-2xl bg-ink px-4 py-3.5 text-paper">
                <div className="text-sm text-paper/70">
                  {draft.nights} nights · incl. 18% GST
                </div>
                <input
                  aria-label="Total"
                  type="number"
                  value={draft.total}
                  onChange={(e) => setDraft({ ...draft, total: Number(e.target.value) })}
                  className="w-36 bg-transparent text-right text-xl font-semibold tabular-nums outline-none"
                />
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              <div className="col-span-2 eyebrow text-muted">Status</div>
              <Field label="Booking status">
                <Select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as BookingStatus })}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Payment">
                <Select value={draft.payment} onChange={(e) => setDraft({ ...draft, payment: e.target.value as PaymentStatus })}>
                  {PAYMENTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Source">
                <Select value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value as Booking["source"] })}>
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Offer code">
                <Input value={draft.offerCode} onChange={(e) => setDraft({ ...draft, offerCode: e.target.value.toUpperCase() })} />
              </Field>
              <Field label="Special requests" className="col-span-2">
                <Textarea value={draft.requests} onChange={(e) => setDraft({ ...draft, requests: e.target.value })} />
              </Field>
            </section>
          </div>
        )}
      </Drawer>
      {dialog}
    </>
  );
}

function StatusSelect({ value, onChange }: { value: BookingStatus; onChange: (s: BookingStatus) => void }) {
  return (
    <label className="relative inline-flex">
      <Pill tone={value} className="pr-6" />
      <I.down size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-60" />
      <select
        aria-label="Change status"
        value={value}
        onChange={(e) => onChange(e.target.value as BookingStatus)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </label>
  );
}

function OccupancyCalendar({ bookings, rooms }: { bookings: Booking[]; rooms: Room[] }) {
  const [offset, setOffset] = useState(0);
  const base = new Date();
  const month = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const today = iso(new Date());
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(month.getFullYear(), month.getMonth(), i + 1, 12);
    return iso(d);
  });
  const live = bookings.filter((b) => b.status !== "cancelled");
  const occ = (roomId: string, d: string) => live.filter((b) => b.roomId === roomId && b.checkIn <= d && b.checkOut > d).length;
  const totalInv = rooms.reduce((s, r) => s + r.inventory, 0) || 1;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <IconButton label="Previous month" onClick={() => setOffset((o) => o - 1)}>
          <I.left size={18} />
        </IconButton>
        <div className="text-center">
          <div className="font-display text-2xl">{month.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</div>
          <button onClick={() => setOffset(0)} className="text-xs text-muted hover:text-ink">
            Today
          </button>
        </div>
        <IconButton label="Next month" onClick={() => setOffset((o) => o + 1)}>
          <I.right size={18} />
        </IconButton>
      </div>
      <div className="overflow-x-auto" data-lenis-prevent>
        <table className="w-full border-separate border-spacing-0 text-[11px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-[150px] bg-white px-4 py-2 text-left font-medium text-muted">Room</th>
              {dates.map((d) => {
                const dt = new Date(d);
                const we = dt.getDay() === 0 || dt.getDay() === 6;
                return (
                  <th key={d} className={cn("min-w-[30px] py-2 text-center font-medium", d === today ? "text-[color:var(--accent)]" : we ? "text-ink" : "text-muted")}>
                    <div className="text-[9px] uppercase opacity-60">{dt.toLocaleDateString("en-IN", { weekday: "narrow" })}</div>
                    {dt.getDate()}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id}>
                <td className="sticky left-0 z-10 border-t border-line bg-white px-4 py-2">
                  <div className="truncate text-[12.5px] font-medium">{r.name}</div>
                  <div className="text-muted">{r.inventory} keys</div>
                </td>
                {dates.map((d) => {
                  const n = occ(r.id, d);
                  const ratio = n / Math.max(1, r.inventory);
                  return (
                    <td key={d} className="border-t border-line p-0.5">
                      <div
                        title={`${r.name} · ${d}: ${n}/${r.inventory}`}
                        className={cn("grid h-8 place-items-center rounded-md font-medium tabular-nums", d === today && "ring-2 ring-accent/60")}
                        style={{
                          background: n ? `color-mix(in oklab, var(--lagoon) ${Math.round(18 + ratio * 72)}%, white)` : "var(--mist)",
                          color: ratio > 0.5 ? "white" : "var(--ink)",
                        }}
                      >
                        {n || ""}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td className="sticky left-0 z-10 border-t border-line bg-white px-4 py-2 text-[12.5px] font-semibold">Occupancy</td>
              {dates.map((d) => {
                const n = rooms.reduce((s, r) => s + occ(r.id, d), 0);
                return (
                  <td key={d} className="border-t border-line py-2 text-center font-semibold tabular-nums">
                    {Math.round((n / totalInv) * 100)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3 border-t border-line px-5 py-3 text-xs text-muted">
        <span className="h-3 w-3 rounded bg-mist" /> Free
        <span className="h-3 w-3 rounded" style={{ background: "color-mix(in oklab, var(--lagoon) 40%, white)" }} /> Partly booked
        <span className="h-3 w-3 rounded" style={{ background: "var(--lagoon)" }} /> Sold out · bottom row = % of all keys
      </div>
    </Card>
  );
}
