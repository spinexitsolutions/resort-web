"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api, downloadCSV } from "@/lib/admin-client";
import type { Booking, Guest, Inquiry } from "@/lib/types";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import { I } from "./icons";
import { useToast } from "./toast";
import { Avatar, Button, Card, Drawer, Empty, Field, Input, PageHeader, Pill, SearchInput, Segmented, Textarea, Toggle, useConfirm } from "./ui";

type Enriched = Guest & { stays: number; spend: number; last?: string };

export function GuestsClient({ guests, bookings, inquiries }: { guests: Guest[]; bookings: Booking[]; inquiries: Inquiry[] }) {
  const router = useRouter();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [rows, setRows] = useState(guests);
  useEffect(() => setRows(guests), [guests]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "vip" | "repeat">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Guest> | null>(null);
  const [tagInput, setTagInput] = useState("");

  const enriched: Enriched[] = useMemo(
    () =>
      rows.map((g) => {
        const own = bookings.filter((b) => (b.guestId === g.id || b.email.toLowerCase() === g.email.toLowerCase()) && b.status !== "cancelled");
        return {
          ...g,
          stays: own.length,
          spend: own.reduce((s, b) => s + b.total, 0),
          last: own.map((b) => b.checkIn).sort().at(-1),
        };
      }),
    [rows, bookings],
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return enriched
      .filter((g) => (filter === "all" ? true : filter === "vip" ? g.vip : g.stays > 1))
      .filter((g) => !s || [g.name, g.email, g.phone, g.city, ...g.tags].some((v) => v?.toLowerCase().includes(s)))
      .sort((a, b) => b.spend - a.spend);
  }, [enriched, q, filter]);

  const guest = enriched.find((g) => g.id === openId) ?? null;
  const guestBookings = guest ? bookings.filter((b) => b.guestId === guest.id || b.email.toLowerCase() === guest.email.toLowerCase()) : [];
  const guestLeads = guest ? inquiries.filter((i) => i.guestId === guest.id || i.email.toLowerCase() === guest.email.toLowerCase()) : [];

  const patch = async (id: string, p: Partial<Guest>, msg = "Guest updated") => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...p } : x)));
    try {
      await api(`/api/admin/guests/${id}`, "PATCH", p);
      toast(msg);
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const createGuest = async () => {
    if (!draft?.name || !draft.email) return toast("Name and email are required", "error");
    try {
      const g = await api<Guest>("/api/admin/guests", "POST", { tags: [], vip: false, notes: "", phone: "", city: "", ...draft, email: draft.email.toLowerCase() });
      setRows((r) => [g, ...r]);
      setDraft(null);
      toast("Guest added");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const remove = async () => {
    if (!guest || !(await confirm(`Remove ${guest.name} from CRM?`))) return;
    await api(`/api/admin/guests/${guest.id}`, "DELETE");
    setRows((r) => r.filter((x) => x.id !== guest.id));
    setOpenId(null);
    toast("Guest removed");
    router.refresh();
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!guest || !t || guest.tags.includes(t)) return;
    patch(guest.id, { tags: [...guest.tags, t] }, "Tag added");
    setTagInput("");
  };

  return (
    <>
      <PageHeader
        title="Guests"
        subtitle={`${rows.length} profiles · ${rows.filter((g) => g.vip).length} VIP`}
        actions={
          <>
            <Button onClick={() => downloadCSV("guests.csv", filtered.map(({ id, name, email, phone, city, vip, tags, stays, spend }) => ({ id, name, email, phone, city, vip, tags, stays, spend })))}>
              <I.download size={16} /> Export
            </Button>
            <Button variant="primary" onClick={() => setDraft({ name: "", email: "" })}>
              <I.plus size={16} /> Add guest
            </Button>
          </>
        }
      />
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Segmented value={filter} onChange={setFilter} options={[{ value: "all", label: "Everyone" }, { value: "vip", label: "VIP" }, { value: "repeat", label: "Repeat guests" }]} />
        <SearchInput value={q} onChange={setQ} placeholder="Name, email, city, tag…" />
      </div>

      {filtered.length === 0 ? (
        <Empty title="No guests found" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((g) => (
            <Card key={g.id} className="group cursor-pointer p-4 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5" onClick={() => setOpenId(g.id)}>
              <div className="flex items-start gap-3">
                <Avatar name={g.name} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-semibold">{g.name}</span>
                    {g.vip && <I.star size={14} className="shrink-0 fill-current text-[color:var(--accent)]" />}
                  </div>
                  <div className="truncate text-xs text-muted">{g.email}</div>
                  <div className="text-xs text-muted">{g.city || "—"}</div>
                </div>
                <div onClick={(e) => e.stopPropagation()} className="flex flex-col items-end gap-1">
                  <Toggle checked={g.vip} onChange={(v) => patch(g.id, { vip: v }, v ? `${g.name} is now VIP` : "VIP removed")} label="VIP" />
                  <span className="text-[10px] text-muted">VIP</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-mist/70 p-2.5 text-center">
                <div>
                  <div className="text-sm font-semibold tabular-nums">{g.stays}</div>
                  <div className="text-[10.5px] text-muted">Stays</div>
                </div>
                <div>
                  <div className="text-sm font-semibold tabular-nums">{formatMoney(g.spend).replace(".00", "")}</div>
                  <div className="text-[10.5px] text-muted">Lifetime</div>
                </div>
                <div>
                  <div className="text-sm font-semibold">{g.last ? formatDate(g.last, { month: "short", year: "2-digit" }) : "—"}</div>
                  <div className="text-[10.5px] text-muted">Last stay</div>
                </div>
              </div>
              {g.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {g.tags.map((t) => (
                    <span key={t} className="rounded-full border border-line px-2 py-0.5 text-[11px]">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Drawer
        open={!!guest}
        onClose={() => setOpenId(null)}
        title={guest?.name ?? ""}
        subtitle={guest ? `Guest since ${formatDate(guest.createdAt)}` : ""}
        footer={
          <Button variant="ghost" className="mr-auto text-red-600" onClick={remove}>
            <I.trash size={16} /> Remove guest
          </Button>
        }
      >
        {guest && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar name={guest.name} size={64} />
              <div className="min-w-0 space-y-1 text-sm">
                <a href={`mailto:${guest.email}`} className="flex items-center gap-2 truncate hover:underline">
                  <I.mail size={15} className="text-muted" /> {guest.email}
                </a>
                {guest.phone && (
                  <a href={`tel:${guest.phone}`} className="flex items-center gap-2 hover:underline">
                    <I.phone size={15} className="text-muted" /> {guest.phone}
                  </a>
                )}
                {guest.vip && <Pill tone="vip">VIP guest</Pill>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                ["Stays", String(guest.stays)],
                ["Lifetime value", formatMoney(guest.spend)],
                ["Enquiries", String(guestLeads.length)],
              ].map(([l, v]) => (
                <div key={l} className="rounded-2xl bg-white p-3 text-center ring-1 ring-line">
                  <div className="text-[15px] font-semibold tabular-nums">{v}</div>
                  <div className="text-[11px] text-muted">{l}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone">
                <Input defaultValue={guest.phone} key={`p-${guest.id}`} onBlur={(e) => e.target.value !== guest.phone && patch(guest.id, { phone: e.target.value })} />
              </Field>
              <Field label="City">
                <Input defaultValue={guest.city} key={`c-${guest.id}`} onBlur={(e) => e.target.value !== guest.city && patch(guest.id, { city: e.target.value })} />
              </Field>
            </div>

            <div>
              <div className="eyebrow mb-2 text-muted">Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {guest.tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => patch(guest.id, { tags: guest.tags.filter((x) => x !== t) }, "Tag removed")}
                    className="group flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-xs text-paper"
                  >
                    {t} <I.close size={11} className="opacity-50 group-hover:opacity-100" />
                  </button>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                    placeholder="+ Add tag"
                    className="w-24 rounded-full border border-dashed border-line bg-transparent px-2.5 py-1 text-xs outline-none focus:border-ink/40"
                  />
                </div>
              </div>
            </div>

            <Field label="Preferences & notes">
              <Textarea
                defaultValue={guest.notes}
                key={`n-${guest.id}`}
                placeholder="Dietary needs, room preferences, celebrations…"
                onBlur={(e) => e.target.value !== guest.notes && patch(guest.id, { notes: e.target.value }, "Notes saved")}
              />
            </Field>

            <div>
              <div className="eyebrow mb-2 text-muted">Stay history</div>
              {guestBookings.length === 0 ? (
                <p className="text-sm text-muted">No bookings yet.</p>
              ) : (
                <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-white ring-1 ring-line">
                  {guestBookings.map((b) => (
                    <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{b.roomName}</div>
                        <div className="text-xs text-muted">
                          {formatDate(b.checkIn, { day: "numeric", month: "short", year: "2-digit" })} · {b.nights}n · <span className="font-mono">{b.ref}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold tabular-nums">{formatMoney(b.total)}</div>
                        <Pill tone={b.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {guestLeads.length > 0 && (
              <div>
                <div className="eyebrow mb-2 text-muted">Enquiries</div>
                <ul className="space-y-2">
                  {guestLeads.map((l) => (
                    <li key={l.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-line">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{l.subject}</div>
                        <div className="text-xs text-muted">{formatDate(l.createdAt)}</div>
                      </div>
                      <Pill tone={l.stage} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <Drawer
        open={!!draft}
        onClose={() => setDraft(null)}
        title="Add guest"
        footer={
          <>
            <Button onClick={() => setDraft(null)}>Cancel</Button>
            <Button variant="primary" onClick={createGuest}>
              Add guest
            </Button>
          </>
        }
      >
        {draft && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full name" className="col-span-2">
              <Input value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} autoFocus />
            </Field>
            <Field label="Email" className="col-span-2">
              <Input type="email" value={draft.email ?? ""} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            </Field>
            <Field label="Phone">
              <Input value={draft.phone ?? ""} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
            </Field>
            <Field label="City">
              <Input value={draft.city ?? ""} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
            </Field>
            <div className={cn("col-span-2 flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3")}>
              <span className="text-sm font-medium">VIP guest</span>
              <Toggle checked={!!draft.vip} onChange={(v) => setDraft({ ...draft, vip: v })} />
            </div>
          </div>
        )}
      </Drawer>
      {dialog}
    </>
  );
}
