"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api, downloadCSV } from "@/lib/admin-client";
import type { Subscriber } from "@/lib/types";
import { formatDate, timeAgo } from "@/lib/utils";
import { I } from "./icons";
import { useToast } from "./toast";
import { Button, Card, Empty, IconButton, Input, PageHeader, SearchInput, Stat, useConfirm } from "./ui";

export function SubscribersClient({ subscribers }: { subscribers: Subscriber[] }) {
  const router = useRouter();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [rows, setRows] = useState(subscribers);
  useEffect(() => setRows(subscribers), [subscribers]);
  const [q, setQ] = useState("");
  const [email, setEmail] = useState("");

  const filtered = useMemo(() => rows.filter((s) => s.email.includes(q.trim().toLowerCase())), [rows, q]);
  const last30 = rows.filter((s) => Date.now() - new Date(s.createdAt).getTime() < 30 * 86400000).length;

  const remove = async (s: Subscriber) => {
    if (!(await confirm(`Unsubscribe ${s.email}?`))) return;
    setRows((r) => r.filter((x) => x.id !== s.id));
    await api(`/api/admin/subscribers/${s.id}`, "DELETE");
    toast("Subscriber removed");
    router.refresh();
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return toast("Enter a valid email", "error");
    if (rows.some((r) => r.email === v)) return toast("Already subscribed", "info");
    const s = await api<Subscriber>("/api/admin/subscribers", "POST", { email: v });
    setRows((r) => [s, ...r]);
    setEmail("");
    toast("Subscriber added");
    router.refresh();
  };

  return (
    <>
      <PageHeader
        title="Subscribers"
        subtitle="Newsletter audience from the website footer"
        actions={
          <Button onClick={() => downloadCSV("subscribers.csv", filtered.map((s) => ({ email: s.email, subscribed: s.createdAt })))}>
            <I.download size={16} /> Export CSV
          </Button>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="Total audience" value={String(rows.length)} />
        <Stat label="Joined last 30 days" value={String(last30)} />
        <Card className="col-span-2 p-4 md:col-span-1 md:p-5">
          <form onSubmit={add} className="flex h-full flex-col justify-between gap-3">
            <span className="text-[12.5px] font-medium text-muted">Add manually</span>
            <div className="flex gap-2">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" />
              <Button variant="primary" type="submit">
                Add
              </Button>
            </div>
          </form>
        </Card>
      </div>
      <div className="mb-3 flex justify-end">
        <SearchInput value={q} onChange={setQ} placeholder="Filter emails…" />
      </div>
      {filtered.length === 0 ? (
        <Empty title="No subscribers yet" body="Emails collected from the newsletter form will appear here." />
      ) : (
        <Card className="divide-y divide-line overflow-hidden">
          <AnimatePresence initial={false}>
            {filtered.map((s) => (
              <motion.div key={s.id} layout exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 px-4 py-3 md:px-5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mist text-ink/60">
                  <I.mail size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{s.email}</div>
                  <div className="text-xs text-muted" title={formatDate(s.createdAt)}>
                    Joined {timeAgo(s.createdAt)}
                  </div>
                </div>
                <IconButton label="Remove" onClick={() => remove(s)} className="hover:text-red-600">
                  <I.trash size={16} />
                </IconButton>
              </motion.div>
            ))}
          </AnimatePresence>
        </Card>
      )}
      {dialog}
    </>
  );
}
