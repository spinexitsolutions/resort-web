"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/admin-client";
import type { Inquiry, LeadStage } from "@/lib/types";
import { cn, compactMoney, formatDate, formatMoney, timeAgo } from "@/lib/utils";
import { I } from "./icons";
import { useToast } from "./toast";
import { Avatar, Button, Drawer, Field, Input, PageHeader, Pill, SearchInput, Segmented, Select, Textarea, useConfirm } from "./ui";

const STAGES: { id: LeadStage; label: string; color: string }[] = [
  { id: "new", label: "New", color: "var(--accent)" },
  { id: "contacted", label: "Contacted", color: "var(--ink)" },
  { id: "qualified", label: "Qualified", color: "var(--lagoon)" },
  { id: "proposal", label: "Proposal", color: "#C9A27E" },
  { id: "won", label: "Won", color: "#2E8B57" },
  { id: "lost", label: "Lost", color: "#a1a1aa" },
];
const TYPES: Inquiry["type"][] = ["general", "wedding", "corporate", "spa", "dining", "stay"];

export function LeadsBoard({ inquiries }: { inquiries: Inquiry[] }) {
  const router = useRouter();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [rows, setRows] = useState(inquiries);
  useEffect(() => setRows(inquiries), [inquiries]);
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | Inquiry["type"]>("all");
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<LeadStage | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [mobileStage, setMobileStage] = useState<LeadStage>("new");
  const [note, setNote] = useState("");
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => (type === "all" || r.type === type) && (!s || [r.name, r.email, r.subject, r.message].some((v) => v.toLowerCase().includes(s))));
  }, [rows, q, type]);

  const lead = rows.find((r) => r.id === openId) ?? null;

  const update = async (id: string, patch: Partial<Inquiry>, msg?: string) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    try {
      await api(`/api/admin/inquiries/${id}`, "PATCH", patch);
      if (msg) toast(msg);
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const move = (id: string, stage: LeadStage) => {
    const l = rows.find((r) => r.id === id);
    if (!l || l.stage === stage) return;
    update(id, { stage }, `Moved to ${stage}`);
  };

  const addNote = () => {
    if (!lead || !note.trim()) return;
    const notes = [{ text: note.trim(), at: new Date().toISOString() }, ...lead.notes];
    update(lead.id, { notes }, "Note added");
    setNote("");
  };

  const create = async (form: FormData) => {
    const body = {
      guestId: "",
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      type: form.get("type") as Inquiry["type"],
      subject: String(form.get("subject") || ""),
      message: String(form.get("message") || ""),
      stage: "new" as LeadStage,
      value: Number(form.get("value") || 0),
      assignee: String(form.get("assignee") || ""),
      notes: [],
    };
    if (!body.name || !body.subject) return toast("Name and subject are required", "error");
    try {
      const created = await api<Inquiry>("/api/admin/inquiries", "POST", body);
      setRows((r) => [created, ...r]);
      setCreating(false);
      toast("Lead created");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const remove = async () => {
    if (!lead || !(await confirm(`Delete lead “${lead.subject}”?`))) return;
    await api(`/api/admin/inquiries/${lead.id}`, "DELETE");
    setRows((r) => r.filter((x) => x.id !== lead.id));
    setOpenId(null);
    toast("Lead deleted");
    router.refresh();
  };

  const openValue = rows.filter((r) => r.stage !== "won" && r.stage !== "lost").reduce((s, r) => s + (r.value || 0), 0);
  const wonValue = rows.filter((r) => r.stage === "won").reduce((s, r) => s + (r.value || 0), 0);

  const renderColumn = (stage: (typeof STAGES)[number], mobile = false) => {
    const items = filtered.filter((r) => r.stage === stage.id);
    const total = items.reduce((s, r) => s + (r.value || 0), 0);
    return (
      <div
        key={stage.id}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(stage.id);
        }}
        onDragLeave={() => setOver((o) => (o === stage.id ? null : o))}
        onDrop={(e) => {
          e.preventDefault();
          const id = e.dataTransfer.getData("text/plain") || dragId;
          if (id) move(id, stage.id);
          setDragId(null);
          setOver(null);
        }}
        className={cn(
          "flex flex-col rounded-[26px] p-2.5 transition-colors",
          mobile ? "w-full" : "w-[290px] shrink-0",
          over === stage.id ? "bg-accent/10 ring-2 ring-accent/40" : "bg-ink/[0.035]",
        )}
      >
        {!mobile && (
          <div className="flex items-center justify-between px-2 pb-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="font-display text-[1.5rem] leading-none tracking-[-0.04em]">{stage.label}</span>
              <span className="grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[11px] font-bold text-white" style={{ background: stage.color }}>{items.length}</span>
            </div>
            <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold tabular-nums ring-1 ring-line">{compactMoney(total)}</span>
          </div>
        )}
        <div className="flex min-h-[120px] flex-col gap-2">
          <AnimatePresence initial={false}>
            {items.map((r) => (
              <motion.article
                key={r.id}
                layout
                layoutId={mobile ? undefined : `lead-${r.id}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: dragId === r.id ? 0.4 : 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                draggable
                onDragStartCapture={(e: React.DragEvent) => {
                  e.dataTransfer.setData("text/plain", r.id);
                  e.dataTransfer.effectAllowed = "move";
                  setDragId(r.id);
                }}
                onDragEndCapture={() => setDragId(null)}
                onClick={() => setOpenId(r.id)}
                onKeyDown={(e) => e.key === "Enter" && setOpenId(r.id)}
                tabIndex={0}
                className="cursor-grab rounded-[22px] bg-white ring-1 ring-line p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 active:cursor-grabbing"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="eyebrow rounded-full bg-mist px-2 py-0.5 text-[9.5px] text-ink/70">{r.type}</span>
                  <span className="text-[11px] text-muted">{timeAgo(r.createdAt)}</span>
                </div>
                <h4 className="mt-2 text-[13.5px] font-semibold leading-snug">{r.subject}</h4>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{r.message}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar name={r.name} size={24} />
                    <span className="truncate text-xs">{r.name}</span>
                  </div>
                  {r.value > 0 && <span className="text-xs font-semibold tabular-nums">{compactMoney(r.value)}</span>}
                </div>
                {mobile && (
                  <div className="mt-3 border-t border-line pt-3" onClick={(e) => e.stopPropagation()}>
                    <Select value={r.stage} onChange={(e) => move(r.id, e.target.value as LeadStage)} aria-label="Move to stage" className="h-9">
                      {STAGES.map((s) => (
                        <option key={s.id} value={s.id}>
                          Move to: {s.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}
              </motion.article>
            ))}
          </AnimatePresence>
          {items.length === 0 && <div className="grid flex-1 place-items-center rounded-2xl border border-dashed border-line py-8 text-xs text-muted">Drop leads here</div>}
        </div>
      </div>
    );
  };

  return (
    <>
      <PageHeader
        title="Leads"
        subtitle={`${formatMoney(openValue)} open pipeline · ${formatMoney(wonValue)} won`}
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            <I.plus size={16} /> New lead
          </Button>
        }
      />
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Segmented value={type} onChange={setType} options={[{ value: "all", label: "All" }, ...TYPES.map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1) }))]} />
        <SearchInput value={q} onChange={setQ} placeholder="Search leads…" />
      </div>

      {/* Desktop kanban */}
      <div className="no-scrollbar -mx-4 hidden gap-3 overflow-x-auto px-4 pb-4 md:-mx-8 md:flex md:px-8">
        {STAGES.map((s) => renderColumn(s))}
      </div>

      {/* Mobile: stage tabs + list */}
      <div className="md:hidden">
        <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
          {STAGES.map((s) => {
            const n = filtered.filter((r) => r.stage === s.id).length;
            return (
              <button
                key={s.id}
                onClick={() => setMobileStage(s.id)}
                className={cn("flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium", mobileStage === s.id ? "border-accent bg-accent text-white" : "border-line bg-white")}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                {s.label} <span className="opacity-60">{n}</span>
              </button>
            );
          })}
        </div>
        {renderColumn(STAGES.find((s) => s.id === mobileStage)!, true)}
      </div>

      <Drawer
        open={!!lead}
        onClose={() => setOpenId(null)}
        title={lead?.subject ?? ""}
        subtitle={lead ? `${lead.name} · ${formatDate(lead.createdAt)}` : ""}
        footer={
          <>
            <Button variant="ghost" className="mr-auto text-red-600" onClick={remove}>
              <I.trash size={16} /> Delete
            </Button>
            {lead && (
              <a href={`mailto:${lead.email}?subject=${encodeURIComponent("Re: " + lead.subject)}`}>
                <Button variant="primary">
                  <I.mail size={16} /> Reply
                </Button>
              </a>
            )}
          </>
        }
      >
        {lead && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Avatar name={lead.name} size={48} />
              <div className="min-w-0">
                <div className="font-semibold">{lead.name}</div>
                <a href={`mailto:${lead.email}`} className="block truncate text-sm text-muted hover:text-ink">
                  {lead.email}
                </a>
                {lead.phone && (
                  <a href={`tel:${lead.phone}`} className="text-sm text-muted hover:text-ink">
                    {lead.phone}
                  </a>
                )}
              </div>
              <Pill tone={lead.stage} className="ml-auto" />
            </div>

            <div className="rounded-2xl bg-mist p-4 text-sm leading-relaxed">{lead.message}</div>

            <div>
              <div className="eyebrow mb-2 text-muted">Stage</div>
              <div className="grid grid-cols-3 gap-1.5">
                {STAGES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => move(lead.id, s.id)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-[12.5px] font-medium transition",
                      lead.stage === s.id ? "border-accent bg-accent text-white" : "border-line bg-white hover:bg-mist",
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Deal value (₹)">
                <Input type="number" defaultValue={lead.value} key={`v-${lead.id}`} onBlur={(e) => Number(e.target.value) !== lead.value && update(lead.id, { value: Number(e.target.value) }, "Value updated")} />
              </Field>
              <Field label="Assignee">
                <Input defaultValue={lead.assignee} key={`a-${lead.id}`} placeholder="Unassigned" onBlur={(e) => e.target.value !== lead.assignee && update(lead.id, { assignee: e.target.value }, "Assignee updated")} />
              </Field>
              <Field label="Type" className="col-span-2">
                <Select value={lead.type} onChange={(e) => update(lead.id, { type: e.target.value as Inquiry["type"] }, "Type updated")}>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div>
              <div className="eyebrow mb-2 text-muted">Notes & timeline</div>
              <div className="flex gap-2">
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Called, sent proposal…" onKeyDown={(e) => e.key === "Enter" && addNote()} />
                <Button variant="primary" onClick={addNote} disabled={!note.trim()}>
                  Add
                </Button>
              </div>
              <ol className="relative mt-4 space-y-3 pl-5">
                <span className="absolute bottom-1 left-[5px] top-1 w-px bg-line" />
                {lead.notes.map((n, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-5 top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-paper" />
                    <p className="text-sm">{n.text}</p>
                    <p className="text-[11px] text-muted">{timeAgo(n.at)}</p>
                  </li>
                ))}
                <li className="relative">
                  <span className="absolute -left-5 top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-paper" />
                  <p className="text-sm text-muted">Enquiry received</p>
                  <p className="text-[11px] text-muted">{formatDate(lead.createdAt)}</p>
                </li>
              </ol>
            </div>
          </div>
        )}
      </Drawer>

      <Drawer open={creating} onClose={() => setCreating(false)} title="New lead" subtitle="Log a phone call, walk-in or referral">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            create(new FormData(e.currentTarget));
          }}
          className="grid grid-cols-2 gap-3"
        >
          <Field label="Name" className="col-span-2"><Input name="name" required /></Field>
          <Field label="Email"><Input name="email" type="email" /></Field>
          <Field label="Phone"><Input name="phone" /></Field>
          <Field label="Type">
            <Select name="type" defaultValue="stay">
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Value (₹)"><Input name="value" type="number" defaultValue={0} /></Field>
          <Field label="Subject" className="col-span-2"><Input name="subject" required /></Field>
          <Field label="Assignee" className="col-span-2"><Input name="assignee" /></Field>
          <Field label="Message" className="col-span-2"><Textarea name="message" /></Field>
          <Button type="submit" variant="primary" className="col-span-2 mt-2 h-11">Create lead</Button>
        </form>
      </Drawer>
      {dialog}
    </>
  );
}
