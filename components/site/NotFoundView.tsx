import Link from "next/link";

export default function NotFoundView() {
  return (
    <div className="bg-paper p-2 md:p-3">
      <div className="relative flex min-h-[92svh] flex-col justify-between overflow-hidden rounded-[28px] bg-accent p-6 pt-28 text-white md:p-12 md:pt-36">
        <span className="w-fit rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-ink">404 · Lost at sea</span>
        <p aria-hidden className="pointer-events-none absolute -right-[4%] top-1/2 -translate-y-1/2 select-none font-display text-[42vw] leading-none tracking-[-0.07em] text-white/10">404</p>
        <div className="relative">
          <h1 className="max-w-[10ch] font-display text-[clamp(3.6rem,11vw,10rem)] leading-[0.82] tracking-[-0.055em]">
            This tide <span className="text-ink">went out.</span>
          </h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="inline-flex h-12 items-center rounded-full bg-white px-6 font-semibold text-ink">Back to shore →</Link>
            <Link href="/rooms" className="inline-flex h-12 items-center rounded-full px-6 font-semibold ring-1 ring-white/40">See our villas</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
