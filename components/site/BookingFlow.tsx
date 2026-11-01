"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import { EXPO, Img } from "./motion";

type Avail = {
  id: string; slug: string; name: string; image: string; price: number; guests: number; left: number; fits: boolean;
  nights: number; subtotal: number; discount: number; taxes: number; total: number;
};
type Result = { nights: number; offer: { code: string; title: string; discount: number } | null; invalidCode: boolean; rooms: Avail[] };
type Booking = { ref: string; roomName: string; checkIn: string; checkOut: string; total: number; guestName: string; email: string; nights: number };

const STEPS = ["Dates", "Villa", "Details", "Confirmed"];
const iso = (d: Date) => d.toISOString().slice(0, 10);

export default function BookingFlow(props: { checkIn?: string; checkOut?: string; guests?: number; room?: string; code?: string }) {
  const today = iso(new Date());
  const [step, setStep] = useState(0);
  const [checkIn, setCheckIn] = useState(props.checkIn ?? iso(new Date(Date.now() + 14 * 86400000)));
  const [checkOut, setCheckOut] = useState(props.checkOut ?? iso(new Date(Date.now() + 17 * 86400000)));
  const [adults, setAdults] = useState(props.guests ?? 2);
  const [children, setChildren] = useState(0);
  const [code, setCode] = useState(props.code ?? "");
  const [result, setResult] = useState<Result | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);

  const search = useCallback(async () => {
    setError("");
    setLoading(true);
    const r = await fetch(`/api/availability?checkIn=${checkIn}&checkOut=${checkOut}&guests=${adults + children}&code=${encodeURIComponent(code)}`);
    const d = await r.json();
    setLoading(false);
    if (!r.ok) return setError(d.error);
    setResult(d);
    if (props.room) {
      const pre = (d as Result).rooms.find((x) => x.slug === props.room && x.left > 0 && x.fits);
      if (pre) setRoomId(pre.id);
    }
    setStep(1);
  }, [checkIn, checkOut, adults, children, code, props.room]);

  // deep-link: if dates came in the URL, jump straight to villas
  useEffect(() => {
    if (props.checkIn && props.checkOut) search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chosen = result?.rooms.find((r) => r.id === roomId);

  async function confirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch("/api/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...f, roomId, checkIn, checkOut, adults, children, offerCode: result?.offer?.code ?? "" }),
    });
    const d = await r.json();
    setLoading(false);
    if (!r.ok) return setError(d.error);
    setBooking(d.booking);
    setStep(3);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="container-x pb-28 pt-24 md:pt-36">
      <div className="mx-auto max-w-5xl">
        {/* progress */}
        <ol className="mb-12 flex items-center gap-2 md:mb-16">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-2">
              <button
                disabled={i > step || step === 3}
                onClick={() => setStep(i)}
                className={cn("flex items-center gap-2 text-sm transition-colors", i <= step ? "text-ink" : "text-muted")}
              >
                <span className={cn("grid h-7 w-7 place-items-center rounded-full text-xs transition-colors", i < step ? "bg-accent text-white" : i === step ? "bg-ink text-paper" : "ring-1 ring-line")}>
                  {i < step ? "✓" : i + 1}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <span className="relative h-px flex-1 bg-line">
                  <motion.span className="absolute inset-y-0 left-0 bg-ink" animate={{ width: i < step ? "100%" : "0%" }} transition={{ duration: 0.8, ease: EXPO }} />
                </span>
              )}
            </li>
          ))}
        </ol>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.6, ease: EXPO }}>
            {step === 0 && (
              <div>
                <h1 className="font-display text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.95] tracking-[-0.03em]">
                  When are you <span className="text-accent">coming?</span>
                </h1>
                <div className="mt-10 grid gap-3 sm:grid-cols-2">
                  <Field label="Arrive"><input type="date" value={checkIn} min={today} onChange={(e) => { setCheckIn(e.target.value); if (e.target.value >= checkOut) setCheckOut(iso(new Date(new Date(e.target.value).getTime() + 2 * 86400000))); }} className="w-full bg-transparent text-xl outline-none" /></Field>
                  <Field label="Depart"><input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-transparent text-xl outline-none" /></Field>
                  <Field label="Adults"><Stepper value={adults} set={setAdults} min={1} max={8} /></Field>
                  <Field label="Children"><Stepper value={children} set={setChildren} min={0} max={6} /></Field>
                  <Field label="Promo code" className="sm:col-span-2">
                    <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. SLOWDOWN" className="w-full bg-transparent font-mono text-xl uppercase tracking-widest outline-none placeholder:text-muted/50" />
                  </Field>
                </div>
                {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
                <button onClick={search} disabled={loading} className="mt-8 flex h-14 w-full items-center justify-center rounded-full bg-ink font-medium text-paper transition-colors hover:bg-lagoon sm:w-auto sm:px-10">
                  {loading ? "Checking the island…" : "See available villas"}
                </button>
              </div>
            )}

            {step === 1 && result && (
              <div>
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <h1 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.95] tracking-[-0.03em]">Choose your villa</h1>
                  <p className="text-sm text-muted">
                    {formatDate(checkIn)} → {formatDate(checkOut)} · {result.nights} nights · {adults + children} guests
                  </p>
                </div>
                {result.offer && <p className="mt-4 inline-flex rounded-full bg-accent/15 px-4 py-2 text-sm text-ink">✦ {result.offer.title} applied — {result.offer.discount}% off</p>}
                {result.invalidCode && <p className="mt-4 text-sm text-red-600">That promo code isn&apos;t valid — showing standard rates.</p>}
                <div className="mt-8 grid gap-4">
                  {result.rooms.map((r) => {
                    const disabled = r.left === 0 || !r.fits;
                    return (
                      <button
                        key={r.id}
                        disabled={disabled}
                        onClick={() => setRoomId(r.id)}
                        className={cn(
                          "group grid grid-cols-[96px_1fr] gap-4 rounded-[22px] bg-white p-3 text-left ring-1 transition-all sm:grid-cols-[180px_1fr_auto] sm:items-center",
                          roomId === r.id ? "ring-2 ring-ink" : "ring-line hover:ring-ink/40",
                          disabled && "opacity-45",
                        )}
                      >
                        <div className="relative aspect-square overflow-hidden rounded-2xl sm:aspect-[4/3]">
                          <Img src={r.image} alt={r.name} fill sizes="180px" className="object-cover" />
                        </div>
                        <div>
                          <p className="font-display text-2xl leading-tight sm:text-3xl">{r.name}</p>
                          <p className="mt-1 text-sm text-muted">Sleeps {r.guests} · {formatMoney(r.price)}/night</p>
                          <p className={cn("mt-2 text-xs", r.left <= 2 && r.left > 0 ? "text-accent" : "text-muted")}>
                            {!r.fits ? `Too small for ${adults + children} guests` : r.left === 0 ? "Sold out for these dates" : r.left <= 2 ? `Only ${r.left} left` : "Available"}
                          </p>
                        </div>
                        <div className="col-span-2 flex items-center justify-between border-t border-line pt-3 sm:col-span-1 sm:block sm:border-0 sm:pr-4 sm:pt-0 sm:text-right">
                          {r.discount > 0 && <p className="text-xs text-muted line-through">{formatMoney(r.subtotal * 1.18)}</p>}
                          <p className="text-xl font-medium">{formatMoney(r.total)}</p>
                          <p className="text-xs text-muted">incl. taxes</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="sticky bottom-24 mt-8 flex justify-end md:bottom-6">
                  <button disabled={!chosen} onClick={() => setStep(2)} className="h-14 rounded-full bg-ink px-10 font-medium text-paper shadow-xl transition-colors hover:bg-lagoon disabled:opacity-30">
                    Continue {chosen && `· ${formatMoney(chosen.total)}`}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && chosen && (
              <div className="grid gap-10 md:grid-cols-12">
                <form onSubmit={confirm} className="space-y-4 md:col-span-7">
                  <h1 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.95] tracking-[-0.03em]">Almost there.</h1>
                  <p className="text-muted">We&apos;ll hold your villa and our reservations team will confirm within the hour.</p>
                  <div className="grid gap-3 pt-4 sm:grid-cols-2">
                    <Field label="Full name"><input name="name" required className="w-full bg-transparent text-lg outline-none" /></Field>
                    <Field label="Email"><input name="email" type="email" required className="w-full bg-transparent text-lg outline-none" /></Field>
                    <Field label="Phone" className="sm:col-span-2"><input name="phone" type="tel" required className="w-full bg-transparent text-lg outline-none" /></Field>
                    <Field label="Special requests" className="sm:col-span-2"><textarea name="requests" rows={3} placeholder="Airport transfer, dietary needs, celebrating something?" className="w-full resize-none bg-transparent outline-none placeholder:text-muted/60" /></Field>
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <button disabled={loading} className="flex h-14 w-full items-center justify-center rounded-full bg-ink font-medium text-paper transition-colors hover:bg-lagoon">
                    {loading ? "Reserving…" : `Request booking · ${formatMoney(chosen.total)}`}
                  </button>
                  <p className="text-center text-xs text-muted">No payment now. Free cancellation up to 14 days before arrival.</p>
                </form>
                <aside className="md:col-span-5">
                  <div className="sticky top-28 overflow-hidden rounded-[24px] bg-white ring-1 ring-line">
                    <div className="relative aspect-[16/10]"><Img src={chosen.image} alt={chosen.name} fill sizes="400px" className="object-cover" /></div>
                    <div className="space-y-2 p-6 text-sm">
                      <p className="font-display text-3xl">{chosen.name}</p>
                      <p className="text-muted">{formatDate(checkIn)} → {formatDate(checkOut)} · {adults} adults{children ? `, ${children} children` : ""}</p>
                      <div className="space-y-2 border-t border-line pt-4">
                        <Row k={`${formatMoney(chosen.price)} × ${chosen.nights} nights`} v={formatMoney(chosen.subtotal)} />
                        {chosen.discount > 0 && <Row k={`Offer ${result?.offer?.code}`} v={`− ${formatMoney(chosen.discount)}`} accent />}
                        <Row k="Taxes & fees (18%)" v={formatMoney(chosen.taxes)} />
                        <div className="flex justify-between border-t border-line pt-3 text-base font-medium"><span>Total</span><span>{formatMoney(chosen.total)}</span></div>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            )}

            {step === 3 && booking && (
              <div className="mx-auto max-w-2xl text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.2 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-accent text-3xl text-white">✓</motion.div>
                <h1 className="mt-8 font-display text-[clamp(2.6rem,7vw,5rem)] leading-[0.95] tracking-[-0.03em]">
                  See you soon, <span className="text-accent">{booking.guestName.split(" ")[0]}.</span>
                </h1>
                <p className="mx-auto mt-5 max-w-md text-muted">Your request is in. A confirmation is on its way to {booking.email}.</p>
                <div className="mt-10 rounded-[24px] bg-white p-6 text-left ring-1 ring-line">
                  <div className="flex items-center justify-between border-b border-line pb-4">
                    <span className="eyebrow text-muted">Booking reference</span>
                    <span className="font-mono text-lg tracking-widest">{booking.ref}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 text-sm">
                    <div><p className="text-muted">Villa</p><p className="font-medium">{booking.roomName}</p></div>
                    <div><p className="text-muted">Total</p><p className="font-medium">{formatMoney(booking.total)}</p></div>
                    <div><p className="text-muted">Arrive</p><p className="font-medium">{formatDate(booking.checkIn)}</p></div>
                    <div><p className="text-muted">Depart</p><p className="font-medium">{formatDate(booking.checkOut)}</p></div>
                  </div>
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link href="/experiences" className="h-12 rounded-full bg-ink px-6 leading-[3rem] text-paper">Plan experiences</Link>
                  <Link href="/" className="h-12 rounded-full px-6 leading-[3rem] ring-1 ring-line">Back home</Link>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block rounded-2xl bg-white px-5 py-3.5 ring-1 ring-line transition-shadow focus-within:ring-2 focus-within:ring-ink", className)}>
      <span className="eyebrow mb-1 block text-[0.6rem] text-muted">{label}</span>
      {children}
    </label>
  );
}

function Stepper({ value, set, min, max }: { value: number; set: (n: number) => void; min: number; max: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xl tabular-nums">{value}</span>
      <div className="flex gap-2">
        <button type="button" onClick={() => set(Math.max(min, value - 1))} className="grid h-9 w-9 place-items-center rounded-full ring-1 ring-line hover:ring-ink">−</button>
        <button type="button" onClick={() => set(Math.min(max, value + 1))} className="grid h-9 w-9 place-items-center rounded-full ring-1 ring-line hover:ring-ink">+</button>
      </div>
    </div>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className={cn("flex justify-between", accent ? "text-lagoon" : "text-muted")}>
      <span>{k}</span>
      <span>{v}</span>
    </div>
  );
}
