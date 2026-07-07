"use client";

/**
 * The Codex of Achievements — the grimoire itself. Filter by category,
 * rarity, and unlock state; entries closest to unlocking sort first.
 */

import { useMemo, useState } from "react";
import { AppNav } from "@/components/nav";
import { SectionTitle } from "@/components/ui";
import { AchievementCard } from "@/components/achievement";
import { CATEGORY_LABELS, RARITY_LABELS } from "@/lib/codex/achievements";
import type { Category, Rarity } from "@/lib/codex/types";
import { evaluateCodex } from "@/lib/codex/engine";
import { useIronStore, selectStats } from "@/lib/store";
import { cn } from "@/lib/utils";

type UnlockFilter = "all" | "unlocked" | "locked";

const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS) as Category[];
const RARITY_ORDER = Object.keys(RARITY_LABELS) as Rarity[];

export default function CodexPage() {
  const { workouts, profile, unlocked, hydrated } = useIronStore();
  const [category, setCategory] = useState<Category | "all">("all");
  const [rarity, setRarity] = useState<Rarity | "all">("all");
  const [state, setState] = useState<UnlockFilter>("all");
  const [query, setQuery] = useState("");

  const stats = useMemo(() => selectStats({ workouts, profile }), [workouts, profile]);
  const codex = useMemo(() => evaluateCodex(stats), [stats]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return codex
      .filter((p) => {
        const a = p.achievement;
        if (category !== "all" && a.category !== category) return false;
        if (rarity !== "all" && a.rarity !== rarity) return false;
        if (state === "unlocked" && !p.unlocked) return false;
        if (state === "locked" && p.unlocked) return false;
        if (q && ![a.name, a.lore, a.lifter, a.era].filter(Boolean).join(" ").toLowerCase().includes(q))
          return false;
        return true;
      })
      .sort((a, b) => {
        // Unlocked first (newest unlocks lead), then by closeness to unlock.
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        if (a.unlocked && b.unlocked)
          return (unlocked[b.achievement.id] ?? "").localeCompare(unlocked[a.achievement.id] ?? "");
        return b.fraction - a.fraction;
      });
  }, [codex, category, rarity, state, query, unlocked]);

  const unlockedCount = codex.filter((p) => p.unlocked).length;

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <SectionTitle sub={`${unlockedCount} of ${codex.length} pages unlocked · ${Math.floor((unlockedCount / codex.length) * 100)}% of the grimoire read`}>
          The Codex of Iron
        </SectionTitle>

        {/* Filters */}
        <div className="panel mb-5 space-y-3">
          <input
            className="input"
            placeholder="Search names, lifters, lore… (e.g. 'Coan', 'squat', 'Leipzig')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex flex-wrap gap-1.5">
            <FilterChip active={category === "all"} onClick={() => setCategory("all")}>All chapters</FilterChip>
            {CATEGORY_ORDER.map((c) => (
              <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
                {CATEGORY_LABELS[c]}
              </FilterChip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <FilterChip active={rarity === "all"} onClick={() => setRarity("all")}>Any rarity</FilterChip>
            {RARITY_ORDER.map((r) => (
              <FilterChip key={r} active={rarity === r} onClick={() => setRarity(r)} className={`rarity-${r}`}>
                {RARITY_LABELS[r]}
              </FilterChip>
            ))}
            <span className="mx-2 h-4 w-px bg-gunmetal-500" />
            {(["all", "unlocked", "locked"] as const).map((s) => (
              <FilterChip key={s} active={state === s} onClick={() => setState(s)}>
                {s === "all" ? "All" : s === "unlocked" ? "Unlocked" : "Still sealed"}
              </FilterChip>
            ))}
          </div>
        </div>

        {!hydrated ? (
          <p className="py-16 text-center text-xs uppercase tracking-[0.3em] text-parchment-500">
            Unsealing the grimoire…
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-sm italic text-parchment-500">
            No pages match. The codex is vast — loosen the filters.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <AchievementCard key={p.achievement.id} progress={p} unlockedAt={unlocked[p.achievement.id]} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-sm border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors",
        active
          ? "bevel border-gold-dim bg-forge-700 text-parchment-50"
          : "border-gunmetal-500 text-parchment-400 hover:border-parchment-500 hover:text-parchment-200",
        className,
      )}
    >
      {children}
    </button>
  );
}
