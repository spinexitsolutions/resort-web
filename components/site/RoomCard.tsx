"use client";

import Link from "next/link";
import type { Room } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";
import { Img } from "./motion";

export default function RoomCard({ room, index, className, sizes = "(min-width: 768px) 40vw, 85vw" }: { room: Room; index?: number; className?: string; sizes?: string }) {
  return (
    <Link href={`/rooms/${room.slug}`} data-cursor="View" className={cn("group block", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-mist">
        <Img src={room.images[0]} alt={room.name} fill sizes={sizes} className="object-cover transition-transform duration-[1.4s] ease-expo group-hover:scale-[1.06]" />
        {room.images[1] && (
          <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
            <Img src={room.images[1]} alt="" fill sizes={sizes} className="object-cover" />
          </div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span className="glass rounded-full px-3 py-1.5 text-xs font-medium text-ink">{room.category}</span>
          {index !== undefined && <span className="font-mono text-xs text-white/80">{String(index + 1).padStart(2, "0")}</span>}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-5 pt-16 text-white">
          <p className="text-sm text-white/75">{room.tagline}</p>
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-[1.75rem] leading-tight tracking-tight">{room.name}</h3>
          <p className="mt-1 text-sm text-muted">
            {room.size} m² · {room.guests} guests · {room.view} view
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[0.95rem] font-medium">{formatMoney(room.price)}</p>
          <p className="text-xs text-muted">per night</p>
        </div>
      </div>
    </Link>
  );
}
