"use client";

import Link from "next/link";
import { useState } from "react";
import type { SiteSettings } from "@/lib/types";

export default function Announcement({ data }: { data: SiteSettings["announcement"] }) {
  const [show, setShow] = useState(true);
  if (!data.enabled || !show) return null;
  return (
    <div className="relative z-30 bg-accent text-ink">
      <div className="container-x flex h-9 items-center justify-center gap-3 text-center text-[0.8rem]">
        <Link href={data.link || "#"} className="truncate font-medium underline-offset-4 hover:underline">
          {data.text}
        </Link>
        <button aria-label="Dismiss" onClick={() => setShow(false)} className="absolute right-3 grid h-6 w-6 place-items-center rounded-full hover:bg-black/10">
          <svg viewBox="0 0 16 16" className="h-3 w-3" stroke="currentColor" strokeWidth="1.6"><path d="M3 3l10 10M13 3L3 13" /></svg>
        </button>
      </div>
    </div>
  );
}
