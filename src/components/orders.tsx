"use client";

import Link from "next/link";
import { Check, ChevronRight, Hammer, ScrollText, Sparkles } from "lucide-react";
import { ProgressBar } from "@/components/ui";
import { useIronStore } from "@/lib/store";
import type { OrderProgress } from "@/lib/orders";
import { cn } from "@/lib/utils";

export function OrderCard({ progress, compact = false }: { progress: OrderProgress; compact?: boolean }) {
  const claimOrder = useIronStore((s) => s.claimOrder);
  const completeOrder = useIronStore((s) => s.completeOrder);
  const setManualOrderProgress = useIronStore((s) => s.setManualOrderProgress);

  const { order, state, complete, expired } = progress;
  const definition = order.definition;
  const claimed = Boolean(state);
  const done = state?.status === "completed";
  const canComplete = claimed && complete && !done && !expired;
  const Icon = definition.kind === "contract" ? ScrollText : Hammer;

  return (
    <article className={cn("codex-card", compact && "p-3")}>
      <header className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dim">
            {definition.kind === "contract" ? "Iron Contract" : definition.kind === "daily" ? "Daily Forge Order" : "Weekly Forge Order"}
          </p>
          <h3 className={cn("plate-heading mt-1", compact ? "text-base" : "text-lg")}>{definition.name}</h3>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-gold-dark bg-gunmetal-900 text-gold-bright">
          <Icon size={18} />
        </div>
      </header>

      <p className="relative mt-2 text-xs leading-relaxed text-parchment-300">{definition.description}</p>

      <div className="relative mt-3 space-y-2.5">
        {progress.requirements.map((req, index) => (
          <div key={`${definition.id}-${index}`}>
            <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
              <span className="text-parchment-200">{req.label}</span>
              <span className="shrink-0 tabular-nums text-parchment-500">
                {Math.min(req.current, req.target).toLocaleString()} / {req.target.toLocaleString()}
              </span>
            </div>
            <ProgressBar fraction={req.fraction} />
            {claimed && !done && req.manual && req.current < req.target && (
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  className="btn-ghost px-2 py-1 text-[10px]"
                  onClick={() => setManualOrderProgress(order, index, req.current + 1)}
                >
                  +1
                </button>
                <button
                  type="button"
                  className="btn-ghost px-2 py-1 text-[10px]"
                  onClick={() => setManualOrderProgress(order, index, req.current + 5)}
                >
                  +5
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <footer className="relative mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gunmetal-600 pt-3">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-gold-dim">
          <Sparkles size={12} /> +{definition.xp} XP
        </span>
        {done ? (
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-gold-bright">
            <Check size={13} /> Reward granted
          </span>
        ) : expired ? (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-parchment-500">Expired</span>
        ) : !claimed ? (
          <button type="button" className="btn-gold px-3 py-1.5 text-[10px]" onClick={() => claimOrder(order)}>
            Claim
          </button>
        ) : (
          <button
            type="button"
            className={cn("btn-gold px-3 py-1.5 text-[10px]", !canComplete && "cursor-not-allowed opacity-50")}
            disabled={!canComplete}
            onClick={() => completeOrder(order)}
          >
            Complete
          </button>
        )}
      </footer>
    </article>
  );
}

export function OrdersLink() {
  return (
    <Link href="/arena" className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest text-gold-dim hover:text-gold-bright">
      Open the full board <ChevronRight size={13} />
    </Link>
  );
}
