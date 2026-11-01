"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/admin-client";
import { SCHEMAS } from "@/lib/admin-schemas";
import { cn, formatMoney, slugify } from "@/lib/utils";
import { SchemaField } from "./fields";
import { I } from "./icons";
import { useToast } from "./toast";
import { Button, Card, Drawer, Empty, IconButton, PageHeader, Pill, SearchInput, Toggle, useConfirm } from "./ui";

type Row = Record<string, unknown> & { id: string };

const text = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));

export function ResourceManager({ resource, items }: { resource: string; items: Row[] }) {
  const schema = SCHEMAS[resource];
  const router = useRouter();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [rows, setRows] = useState(items);
  useEffect(() => setRows(items), [items]);
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState<Row | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => schema.fields.some((f) => text(r[f.key]).toLowerCase().includes(s)));
  }, [rows, q, schema]);

  const cover = (r: Row): string => {
    if (!schema.imageField) return "";
    const v = r[schema.imageField];
    return Array.isArray(v) ? text(v[0]) : text(v);
  };

  const url = `/api/admin/${schema.key}`;

  const open = (r: Row) => {
    setIsNew(false);
    setSlugTouched(true);
    setDraft(structuredClone(r));
  };
  const create = () => {
    setIsNew(true);
    setSlugTouched(false);
    setDraft({ id: "", ...structuredClone(schema.defaults) });
  };

  const setField = (k: string, v: unknown) =>
    setDraft((d) => {
      if (!d) return d;
      const next = { ...d, [k]: v };
      if (schema.key === "rooms" && k === "name" && !slugTouched) next.slug = slugify(String(v));
      if (k === "slug") setSlugTouched(true);
      return next;
    });

  const save = async () => {
    if (!draft) return;
    const missing = schema.fields.find((f) => f.required && !text(draft[f.key]).trim());
    if (missing) return toast(`${missing.label} is required`, "error");
    if (schema.key === "rooms" && !text(draft.slug)) draft.slug = slugify(text(draft.name));
    setSaving(true);
    try {
      if (isNew) {
        const { id: _omit, ...body } = draft;
        void _omit;
        const created = await api<Row>(url, "POST", body);
        setRows((r) => [created, ...r]);
        toast(`${schema.singular} created`);
      } else {
        const { id, ...body } = draft;
        const updated = await api<Row>(`${url}/${id}`, "PATCH", body);
        setRows((r) => r.map((x) => (x.id === id ? updated : x)));
        toast(`${schema.singular} saved`);
      }
      setDraft(null);
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (r: Row) => {
    if (!(await confirm(`Delete “${text(r[schema.titleField]) || schema.singular}”?`))) return;
    setRows((x) => x.filter((y) => y.id !== r.id));
    setDraft(null);
    try {
      await api(`${url}/${r.id}`, "DELETE");
      toast(`${schema.singular} deleted`);
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const duplicate = async (r: Row) => {
    const { id: _omit, ...body } = r;
    void _omit;
    const title = text(body[schema.titleField]);
    if (title) body[schema.titleField] = `${title} (copy)`;
    if (schema.key === "rooms") body.slug = `${text(body.slug)}-copy`;
    const created = await api<Row>(url, "POST", body);
    setRows((x) => [created, ...x]);
    toast("Duplicated");
    router.refresh();
  };

  const toggle = async (r: Row, v: boolean) => {
    if (!schema.toggleField) return;
    setRows((x) => x.map((y) => (y.id === r.id ? { ...y, [schema.toggleField!]: v } : y)));
    await api(`${url}/${r.id}`, "PATCH", { [schema.toggleField]: v });
    toast(v ? "Now visible on site" : "Hidden from site", v ? "success" : "info");
    router.refresh();
  };

  const move = async (r: Row, dir: -1 | 1) => {
    const i = rows.findIndex((x) => x.id === r.id);
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    setRows(next);
    try {
      await api(url, "PUT", next);
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const canReorder = !q;

  const Controls = ({ r, i }: { r: Row; i: number }) => (
    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
      {canReorder && (
        <>
          <IconButton label="Move up" onClick={() => move(r, -1)} disabled={i === 0}>
            <I.up size={16} />
          </IconButton>
          <IconButton label="Move down" onClick={() => move(r, 1)} disabled={i === rows.length - 1}>
            <I.down size={16} />
          </IconButton>
        </>
      )}
      <IconButton label="Duplicate" onClick={() => duplicate(r)}>
        <I.plus size={16} />
      </IconButton>
      <IconButton label="Delete" onClick={() => remove(r)} className="hover:text-red-600">
        <I.trash size={16} />
      </IconButton>
    </div>
  );

  return (
    <>
      <PageHeader
        title={schema.title}
        subtitle={`${schema.subtitle} · ${rows.length} items`}
        actions={
          <>
            <SearchInput value={q} onChange={setQ} placeholder={`Search ${schema.title.toLowerCase()}…`} />
            <Button variant="primary" onClick={create}>
              <I.plus size={16} /> Add {schema.singular.toLowerCase()}
            </Button>
          </>
        }
      />

      {filtered.length === 0 ? (
        <Empty
          title={q ? "Nothing matches your search" : `No ${schema.title.toLowerCase()} yet`}
          body={q ? undefined : "Create the first one — it will appear on the website instantly."}
          action={!q && <Button variant="primary" onClick={create}>Add {schema.singular.toLowerCase()}</Button>}
        />
      ) : schema.layout === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <AnimatePresence initial={false}>
            {filtered.map((r, i) => (
              <motion.div layout key={r.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <div className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-2xl bg-mist" onClick={() => open(r)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cover(r)} alt={text(r.caption)} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                  <div className="absolute inset-x-3 bottom-3 text-paper">
                    <div className="truncate text-sm font-medium">{text(r[schema.titleField]) || "Untitled"}</div>
                    <div className="text-[11px] text-paper/70">{text(r[schema.subtitleField ?? ""])}</div>
                  </div>
                  <div className="absolute right-2 top-2 rounded-full bg-white/90 opacity-0 backdrop-blur transition group-hover:opacity-100 max-md:opacity-100">
                    <Controls r={r} i={i} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : schema.layout === "cards" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {filtered.map((r, i) => {
              const toggled = schema.toggleField ? !!r[schema.toggleField] : true;
              return (
                <motion.div layout key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <Card className={cn("group h-full cursor-pointer overflow-hidden transition hover:shadow-xl hover:shadow-black/5", !toggled && "opacity-60")} onClick={() => open(r)}>
                    {schema.imageField && (
                      <div className="relative aspect-[16/10] overflow-hidden bg-mist">
                        {cover(r) && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cover(r)} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                        )}
                        <div className="absolute left-3 top-3 flex gap-1.5">
                          {schema.toggleField && <Pill tone={toggled ? "active" : "hidden"} className="bg-white/90 backdrop-blur">{toggled ? "Live" : "Hidden"}</Pill>}
                          {r.featured === true && <Pill tone="vip" className="bg-white/90 backdrop-blur">Featured</Pill>}
                        </div>
                        {schema.priceField && (
                          <div className="absolute bottom-3 right-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-medium text-paper backdrop-blur">
                            {formatMoney(Number(r[schema.priceField]) || 0)}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-semibold">{text(r[schema.titleField]) || "Untitled"}</div>
                          <div className="line-clamp-1 text-sm text-muted">{text(r[schema.subtitleField ?? ""])}</div>
                        </div>
                        {schema.toggleField && <Toggle checked={toggled} onChange={(v) => toggle(r, v)} label="Visible" />}
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-line pt-2">
                        <span className="text-xs text-muted">#{i + 1}</span>
                        <Controls r={r} i={i} />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="divide-y divide-line overflow-hidden">
          <AnimatePresence initial={false}>
            {filtered.map((r, i) => {
              const toggled = schema.toggleField ? !!r[schema.toggleField] : true;
              return (
                <motion.div
                  layout
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  onClick={() => open(r)}
                  className={cn("flex cursor-pointer items-center gap-3 px-4 py-3.5 transition hover:bg-mist/40 md:px-5", !toggled && "opacity-60")}
                >
                  <span className="w-6 shrink-0 text-xs tabular-nums text-muted">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{text(r[schema.titleField]) || "Untitled"}</div>
                    <div className="line-clamp-1 text-xs text-muted">{text(r[schema.subtitleField ?? ""])}</div>
                  </div>
                  {typeof r.category === "string" && <span className="hidden rounded-full bg-mist px-2.5 py-0.5 text-[11px] sm:inline">{r.category}</span>}
                  {typeof r.rating === "number" && <span className="hidden text-xs text-[color:var(--accent)] sm:inline">{"★".repeat(Math.round(r.rating))}</span>}
                  {schema.toggleField && (
                    <span onClick={(e) => e.stopPropagation()}>
                      <Toggle checked={toggled} onChange={(v) => toggle(r, v)} label="Visible" />
                    </span>
                  )}
                  <div className="hidden md:block">
                    <Controls r={r} i={i} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Card>
      )}

      <Drawer
        open={!!draft}
        onClose={() => setDraft(null)}
        title={isNew ? `New ${schema.singular.toLowerCase()}` : `Edit ${schema.singular.toLowerCase()}`}
        subtitle={draft ? text(draft[schema.titleField]) || undefined : undefined}
        width={620}
        footer={
          <>
            {!isNew && draft && (
              <Button variant="ghost" className="mr-auto text-red-600" onClick={() => remove(draft)}>
                <I.trash size={16} /> Delete
              </Button>
            )}
            <Button onClick={() => setDraft(null)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={save}>
              {isNew ? "Create" : "Save changes"}
            </Button>
          </>
        }
      >
        {draft && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
            className="grid grid-cols-2 gap-4"
          >
            {schema.fields.map((f) => (
              <div key={f.key} className={f.half ? "col-span-2 sm:col-span-1" : "col-span-2"}>
                <SchemaField def={f} value={draft[f.key]} onChange={(v) => setField(f.key, v)} />
              </div>
            ))}
            <button type="submit" hidden />
          </form>
        )}
      </Drawer>
      {dialog}
    </>
  );
}
