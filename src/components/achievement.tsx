"use client";

/**
 * Achievement medallion + grimoire card. Icons are procedural "engraved
 * medallions": a rarity-colored ring, radial hatching, and a category glyph —
 * a consistent woodcut look for all 140+ entries without shipping 140 images.
 * (Each achievement also carries `iconDescription`, art direction for
 * generating real engraved plates later.)
 */

import {
  Anchor,
  CalendarCheck,
  Crown,
  Dumbbell,
  Mountain,
  Repeat2,
  Scale,
  ScrollText,
  Ship,
  Sparkles,
  Sun,
} from "lucide-react";
import type { AchievementProgress } from "@/lib/codex/types";
import { RARITY_LABELS, TIER_LABELS } from "@/lib/codex/achievements";
import type { Category, Rarity } from "@/lib/codex/types";
import { ProgressBar } from "@/components/ui";
import { formatWeight } from "@/lib/oneRm";
import { cn } from "@/lib/utils";

const CATEGORY_GLYPH: Record<Category, typeof Dumbbell> = {
  squat: Mountain,
  bench: Dumbbell,
  deadlift: Anchor,
  press: Sun,
  assistance: Ship,
  total: Crown,
  "pound-for-pound": Scale,
  repetition: Repeat2,
  dedication: CalendarCheck,
  "golden-era": ScrollText,
  mythic: Sparkles,
};

const RARITY_RING: Record<Rarity, string> = {
  common: "#a68a58",
  uncommon: "#567243",
  rare: "#6b8aa3",
  epic: "#b04343",
  legendary: "#e0bc4a",
};

export function AchievementMedallion({
  category,
  rarity,
  unlocked,
  size = 56,
}: {
  category: Category;
  rarity: Rarity;
  unlocked: boolean;
  size?: number;
}) {
  const Glyph = CATEGORY_GLYPH[category];
  const ring = unlocked ? RARITY_RING[rarity] : "#454d56";
  return (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full">
        <circle cx="32" cy="32" r="30" fill="#1d2125" stroke={ring} strokeWidth="2.5" />
        <circle cx="32" cy="32" r="25" fill="none" stroke={ring} strokeWidth="0.75" strokeDasharray="2 3" />
        {/* radial engraving hatches */}
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={32 + Math.cos(a) * 26.5}
              y1={32 + Math.sin(a) * 26.5}
              x2={32 + Math.cos(a) * 29}
              y2={32 + Math.sin(a) * 29}
              stroke={ring}
              strokeWidth="0.75"
              opacity="0.7"
            />
          );
        })}
      </svg>
      <Glyph
        size={size * 0.42}
        className={cn("relative", unlocked ? "text-parchment-100" : "text-gunmetal-400")}
        strokeWidth={1.5}
        color={unlocked ? ring : undefined}
      />
    </div>
  );
}

function formatReqValue(label: string, current: number, target: number): string {
  const isWeight = /kg|bodyweight/i.test(label);
  if (isWeight) return `${formatWeight(current)} / ${formatWeight(target)}`;
  return `${Math.floor(current)} / ${target}`;
}

export function AchievementCard({
  progress,
  unlockedAt,
  animate = false,
}: {
  progress: AchievementProgress;
  unlockedAt?: string;
  animate?: boolean;
}) {
  const { achievement: a, unlocked, fraction, requirements } = progress;
  return (
    <article
      className={cn(
        "codex-card flex flex-col gap-3",
        unlocked ? "codex-card--unlocked" : "codex-card--locked",
        animate && "animate-unlock-in",
      )}
    >
      <header className="flex items-start gap-3">
        <AchievementMedallion category={a.category} rarity={a.rarity} unlocked={unlocked} />
        <div className="min-w-0">
          <h3 className={cn("plate-heading text-base leading-snug", !unlocked && "text-parchment-300")}>
            {a.name}
          </h3>
          {(a.lifter || a.era) && (
            <p className="truncate text-[11px] uppercase tracking-widest text-parchment-500">
              {[a.lifter, a.era].filter(Boolean).join(" · ")}
            </p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className={cn("rounded-sm border px-1.5 py-px text-[10px] uppercase tracking-wider", `rarity-${a.rarity}`)}>
              {RARITY_LABELS[a.rarity]}
            </span>
            <span className="rounded-sm border border-gunmetal-500 px-1.5 py-px text-[10px] uppercase tracking-wider text-parchment-400">
              {TIER_LABELS[a.tier]}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-gold-dim">+{a.xp} XP</span>
          </div>
        </div>
      </header>

      <p className="text-[13px] italic leading-relaxed text-parchment-300">{a.lore}</p>

      <div className="mt-auto space-y-1.5">
        {requirements.map((r, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-baseline justify-between gap-2 text-[11px]">
              <span className="text-parchment-400">{r.label}</span>
              <span className={cn("tabular-nums", r.fraction >= 1 ? "text-gold-bright" : "text-parchment-300")}>
                {formatReqValue(r.label, r.current, r.target)}
              </span>
            </div>
            <ProgressBar fraction={r.fraction} />
          </div>
        ))}
        <p className="pt-1 text-right text-[10px] uppercase tracking-[0.2em]">
          {unlocked ? (
            <span className="text-gold-bright">
              ✦ Unlocked{unlockedAt ? ` · ${new Date(unlockedAt).toLocaleDateString()}` : ""}
            </span>
          ) : (
            <span className="text-parchment-500">{Math.floor(fraction * 100)}% forged</span>
          )}
        </p>
      </div>
    </article>
  );
}
