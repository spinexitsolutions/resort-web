"use client";

import Link from "next/link";
import type { Room } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";
import { Img } from "./motion";

export default function RoomCard({ room, index, className, sizes = "(min-width: 768px) 40vw, 85vw" }: { room: Room; index?: number; className?: string; sizes?: string }) {
  return (
    <Link href={`/rooms/${room.slug}`} data-cursor="View" className={cn("group block", className)}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-[28px] bg-mist">
        <Img src={room.images[0]} alt={room.name} fill sizes={sizes} className="object-cover transition-transform duration-[1.6s] ease-expo group-hover:scale-[1.08]" />
        {room.images[1] && (
          <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
            <Img src={room.images[1]} alt="" fill sizes={sizes} className="object-cover" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink backdrop-blur">{room.category}</span>
          <span className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white">
            {formatMoney(room.price)}
            <span className="font-normal text-white/80">/nt</span>
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          {index !== undefined && <span className="text-xs font-semibold tabular-nums text-white/60">{String(index + 1).padStart(2, "0")}</span>}
          <h3 className="mt-1 font-display text-[clamp(2rem,3vw,2.6rem)] leading-[0.9] tracking-[-0.04em]">{room.name}</h3>
          {/* specs drawer */}
          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-700 ease-expo group-hover:grid-rows-[1fr] max-md:grid-rows-[1fr]">
            <div className="overflow-hidden">
              <div className="mt-4 flex flex-wrap gap-1.5">
                {[`${room.size} m²`, `${room.guests} guests`, `${room.view} view`].map((t) => (
                  <span key={t} className="rounded-full bg-white/15 px-2.5 py-1 text-xs backdrop-blur-md">{t}</span>
                ))}
              </div>
              <p className="mt-3 text-sm text-white/75">{room.tagline}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
