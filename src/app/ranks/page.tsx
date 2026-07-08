"use client";

/**
 * The Rank Ladder — the full XP economy laid open: nine Iron Ranks with
 * their mottos, and all 99 levels with per-level and cumulative XP costs.
 * The lifter's current position is highlighted on both ladders.
 */

import { useMemo } from "react";
import { AppNav } from "@/components/nav";
import { Panel, SectionTitle } from "@/components/ui";
import { XpBar } from "@/components/xp";
import { useIronStore } from "@/lib/store";
import {
  IRON_RANKS,
  MAX_LEVEL,
  cumulativeXpForLevel,
  levelFromXp,
  nextLevelCost,
  rankForLevel,
} from "@/lib/xp";
import { cn } from "@/lib/utils";

export default function RanksPage() {
  const xp = useIronStore((s) => s.xp);
  const hydrated = useIronStore((s) => s.hydrated);
  const { level } = levelFromXp(xp);
  const { rank } = rankForLevel(level);

  const levels = useMemo(
    () =>
      Array.from({ length: MAX_LEVEL }, (_, i) => {
        const l = i + 1;
        return { level: l, cost: nextLevelCost(l), cumulative: cumulativeXpForLevel(l) };
      }),
    [],
  );

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <SectionTitle sub="How XP is earned, and where the road leads">The Rank Ladder</SectionTitle>

        {hydrated && (
          <Panel className="mb-6">
            <XpBar xp={xp} />
          </Panel>
        )}

        {/* How XP is earned */}
        <Panel className="mb-6">
          <p className="label">Earning XP</p>
          <ul className="grid gap-1.5 text-xs text-parchment-300 sm:grid-cols-2">
            <li>• Logging a session: 30 XP + 5 per set (max 90)</li>
            <li>• Each new personal record: 40 XP</li>
            <li>• Common achievement: 50 XP · Uncommon: 100 XP</li>
            <li>• Rare: 250 XP · Epic: 500 XP · Legendary: 1,000 XP</li>
          </ul>
        </Panel>

        {/* The nine Iron Ranks */}
        <SectionTitle sub="Nine titles on the long road — each with its motto">
          The Iron Ranks
        </SectionTitle>
        <div className="mb-8 space-y-2">
          {IRON_RANKS.map((r, i) => {
            const isCurrent = hydrated && r.name === rank.name;
            const reached = hydrated && level >= r.minLevel;
            return (
              <div
                key={r.name}
                className={cn(
                  "panel flex items-center gap-4 py-3",
                  isCurrent && "codex-card--unlocked border-gold-dim",
                  !reached && "opacity-70",
                )}
              >
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 font-serif text-sm",
                    reached ? "border-gold-dim text-gold-bright" : "border-gunmetal-500 text-parchment-500",
                  )}
                >
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn("plate-heading text-base leading-tight", !reached && "text-parchment-300")}>
                    {r.name}
                    {isCurrent && <span className="ml-2 text-[10px] uppercase tracking-widest text-gold-bright">← you are here</span>}
                  </p>
                  <p className="text-xs italic text-parchment-400">“{r.motto}”</p>
                </div>
                <div className="shrink-0 text-right text-[11px] uppercase tracking-wider text-parchment-500">
                  <p>Level {r.minLevel}+</p>
                  <p className="tabular-nums text-parchment-400">
                    {cumulativeXpForLevel(r.minLevel).toLocaleString()} XP
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* All 99 levels */}
        <SectionTitle sub={`Every level to ${MAX_LEVEL} — cost of the next step, and total XP to arrive`}>
          The Ninety-Nine Steps
        </SectionTitle>
        <Panel>
          <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            {levels.map((l) => {
              const isCurrent = hydrated && l.level === level;
              const rankStart = IRON_RANKS.find((r) => r.minLevel === l.level);
              return (
                <div key={l.level}>
                  {rankStart && (
                    <p className="mt-2 border-b border-gold-dark pb-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dim">
                      {rankStart.name}
                    </p>
                  )}
                  <div
                    className={cn(
                      "flex items-baseline justify-between gap-2 border-b border-gunmetal-600/40 py-1 text-xs tabular-nums",
                      isCurrent ? "text-gold-bright" : hydrated && l.level < level ? "text-parchment-500" : "text-parchment-300",
                    )}
                  >
                    <span className="font-serif">
                      Lv {l.level}
                      {isCurrent && " ✦"}
                    </span>
                    <span className="text-parchment-500">{l.cumulative.toLocaleString()} XP</span>
                    <span>{l.level < MAX_LEVEL ? `+${l.cost.toLocaleString()}` : "summit"}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-right text-[11px] italic text-parchment-500">
            Level {MAX_LEVEL} — the summit — sits at {cumulativeXpForLevel(MAX_LEVEL).toLocaleString()} XP total.
          </p>
        </Panel>
      </main>
    </>
  );
}
