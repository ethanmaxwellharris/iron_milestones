import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("panel", className)}>{children}</div>;
}

export function SectionTitle({
  children,
  sub,
  className,
}: {
  children: ReactNode;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-4", className)}>
      <h2 className="plate-heading text-xl sm:text-2xl">{children}</h2>
      {sub && <p className="mt-0.5 text-xs uppercase tracking-[0.2em] text-parchment-500">{sub}</p>}
      <div className="rule-ornate" />
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="panel flex flex-col gap-0.5 py-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-parchment-500">
        {label}
      </span>
      <span className={cn("font-serif text-2xl", accent ? "text-gold-bright" : "text-parchment-50")}>
        {value}
      </span>
      {hint && <span className="text-[11px] text-parchment-400">{hint}</span>}
    </div>
  );
}

export function ProgressBar({ fraction, className }: { fraction: number; className?: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, fraction)) * 100);
  return (
    <div className={cn("progress-track", className)} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={cn("progress-fill", pct >= 100 && "progress-fill--done")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
