"use client";

import { Reorder } from "framer-motion";
import { useRef, useState } from "react";
import { uploadFile } from "@/lib/admin-client";
import type { FieldDef } from "@/lib/admin-schemas";
import { cn } from "@/lib/utils";
import { I } from "./icons";
import { useToast } from "./toast";
import { Field, IconButton, Input, Select, Textarea, ToggleRow } from "./ui";

export function ImageInput({ value, onChange, compact }: { value: string; onChange: (v: string) => void; compact?: boolean }) {
  const toast = useToast();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const onFile = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    try {
      onChange(await uploadFile(f));
      toast("Image uploaded");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      className={cn("flex gap-3", compact ? "items-center" : "flex-col sm:flex-row sm:items-start")}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onFile(e.dataTransfer.files?.[0]);
      }}
    >
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className={cn(
          "group relative shrink-0 overflow-hidden rounded-xl border border-dashed border-line bg-mist",
          compact ? "h-11 w-16" : "aspect-[4/3] w-full sm:w-40",
        )}
        title="Upload image"
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full place-items-center text-ink/40">
            <I.image size={compact ? 16 : 24} />
          </span>
        )}
        <span className="absolute inset-0 grid place-items-center bg-ink/50 text-paper opacity-0 transition group-hover:opacity-100">
          {busy ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-paper border-t-transparent" /> : <I.upload size={18} />}
        </span>
      </button>
      <div className="min-w-0 flex-1 space-y-2">
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://images.unsplash.com/… or upload" />
        {!compact && (
          <p className="text-xs text-muted">Paste a URL, click the preview to upload, or drop a file. JPG/PNG/WebP up to 15MB.</p>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
    </div>
  );
}

export function ImagesInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [adding, setAdding] = useState("");
  return (
    <div className="space-y-3">
      <Reorder.Group axis="y" values={value} onReorder={onChange} className="space-y-2">
        {value.map((src, i) => (
          <Reorder.Item key={src} value={src} className="flex items-center gap-2 rounded-xl border border-line bg-white p-2">
            <I.grip size={16} className="shrink-0 cursor-grab text-ink/30" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
            <span className="min-w-0 flex-1 truncate text-xs text-muted">{i === 0 ? "Cover · " : ""}{src}</span>
            <IconButton label="Remove image" type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}>
              <I.close size={14} />
            </IconButton>
          </Reorder.Item>
        ))}
      </Reorder.Group>
      <ImageInput
        compact
        value={adding}
        onChange={(v) => {
          if (v && (v.startsWith("/") || v.startsWith("data:") || /^https?:\/\/.+\..+/.test(v))) {
            if (!value.includes(v)) onChange([...value, v]);
            setAdding("");
          } else setAdding(v);
        }}
      />
    </div>
  );
}

export function TagsInput({ value, onChange, placeholder = "Type and press Enter" }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [text, setText] = useState("");
  const add = () => {
    const t = text.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setText("");
  };
  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-xl border border-line bg-white p-1.5 focus-within:ring-4 focus-within:ring-accent/15">
      {value.map((t) => (
        <span key={t} className="flex items-center gap-1 rounded-full bg-mist py-1 pl-2.5 pr-1 text-xs">
          {t}
          <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((x) => x !== t))} className="grid h-4 w-4 place-items-center rounded-full hover:bg-ink/10">
            <I.close size={10} />
          </button>
        </span>
      ))}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !text && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={add}
        placeholder={value.length ? "" : placeholder}
        className="min-w-[120px] flex-1 bg-transparent px-1.5 text-sm outline-none"
      />
    </div>
  );
}

export function SchemaField({ def, value, onChange }: { def: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  if (def.type === "boolean")
    return <ToggleRow label={def.label} hint={def.hint} checked={!!value} onChange={onChange} />;

  let control: React.ReactNode;
  switch (def.type) {
    case "textarea":
      control = <Textarea value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} rows={4} />;
      break;
    case "number":
      control = <Input type="number" inputMode="decimal" value={value === undefined || value === null ? "" : Number(value)} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} />;
      break;
    case "date":
      control = <Input type="date" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "select":
      control = (
        <Select value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          {(def.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
      );
      break;
    case "image":
      control = <ImageInput value={String(value ?? "")} onChange={onChange} />;
      break;
    case "images":
      control = <ImagesInput value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} />;
      break;
    case "tags":
      control = <TagsInput value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} />;
      break;
    default:
      control = <Input value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} required={def.required} />;
  }
  return (
    <Field label={def.label} hint={def.hint} as={def.type === "image" || def.type === "images" || def.type === "tags" ? "div" : "label"}>
      {control}
    </Field>
  );
}
