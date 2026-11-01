import { PillButton } from "@/components/site/motion";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[80svh] flex-col items-start justify-center py-32">
      <p className="eyebrow text-muted">404 · Lost at sea</p>
      <h1 className="mt-5 font-display text-[clamp(3rem,10vw,9rem)] leading-[0.9] tracking-[-0.03em]">
        This tide <span className="text-accent">went out.</span>
      </h1>
      <PillButton href="/" variant="ink" className="mt-10">Back to shore</PillButton>
    </div>
  );
}
