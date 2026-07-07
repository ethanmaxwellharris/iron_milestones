"use client";

import { levelFromXp, rankForLevel } from "@/lib/xp";
import { ProgressBar } from "@/components/ui";

export function RankBadge({ xp, compact = false }: { xp: number; compact?: boolean }) {
  const { level } = levelFromXp(xp);
  const { rank } = rankForLevel(level);
  if (compact) {
    return (
      <span className="flex items-center gap-2 text-xs">
        <span className="rounded-sm border border-gold-dim bg-gunmetal-800 px-1.5 py-0.5 font-serif text-gold-bright">
          Lv {level}
        </span>
        <span className="hidden uppercase tracking-widest text-parchment-300 sm:inline">{rank.name}</span>
      </span>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold-dim bg-gunmetal-800 font-serif text-lg text-gold-bright shadow-bevel">
        {level}
      </div>
      <div>
        <p className="plate-heading text-lg leading-tight">{rank.name}</p>
        <p className="text-[11px] italic text-parchment-400">“{rank.motto}”</p>
      </div>
    </div>
  );
}

export function XpBar({ xp }: { xp: number }) {
  const { level, into, needed } = levelFromXp(xp);
  const { next } = rankForLevel(level);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] uppercase tracking-widest text-parchment-400">
        <span>
          Level {level} · {xp.toLocaleString()} XP
        </span>
        <span>
          {into}/{needed} to Lv {level + 1}
          {next ? ` · next rank: ${next.name} (Lv ${next.minLevel})` : ""}
        </span>
      </div>
      <ProgressBar fraction={into / needed} />
    </div>
  );
}
