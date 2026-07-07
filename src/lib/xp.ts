import type { Rarity } from "@/lib/codex/types";

/** XP granted when an achievement of a given rarity is unlocked. */
export const RARITY_XP: Record<Rarity, number> = {
  common: 50,
  uncommon: 100,
  rare: 250,
  epic: 500,
  legendary: 1000,
};

/** XP for logging a workout: base + per set, capped so volume can't be farmed. */
export function workoutXp(setCount: number): number {
  return Math.min(30 + setCount * 5, 90);
}

/** XP for each new personal record within a session. */
export const PR_XP = 40;

/** Cost to go from `level` to `level + 1`. Gentle early, steep later. */
function nextLevelCost(level: number): number {
  return 100 + (level - 1) * 60;
}

export function levelFromXp(xp: number): { level: number; into: number; needed: number } {
  let level = 1;
  let remaining = xp;
  while (remaining >= nextLevelCost(level) && level < 99) {
    remaining -= nextLevelCost(level);
    level += 1;
  }
  return { level, into: remaining, needed: nextLevelCost(level) };
}

/** Iron Rank ladder — the long-arc progression shown on the dashboard. */
export const IRON_RANKS: { name: string; minLevel: number; motto: string }[] = [
  { name: "Iron Novice", minLevel: 1, motto: "Every legend once trembled under an empty bar." },
  { name: "Bronze Lifter", minLevel: 3, motto: "The metal begins to answer you." },
  { name: "Iron Adept", minLevel: 6, motto: "Calluses are pages of your own codex." },
  { name: "Steel Journeyman", minLevel: 10, motto: "You no longer chase the weight. It waits for you." },
  { name: "Steel Titan", minLevel: 15, motto: "Plates bend their knee." },
  { name: "Golden Champion", minLevel: 21, motto: "The old masters would nod, once." },
  { name: "Master of the Forge", minLevel: 28, motto: "You shape iron; iron shaped you first." },
  { name: "Legendary Atlas", minLevel: 36, motto: "The sky rests easier on your shoulders." },
  { name: "Mythic Colossus", minLevel: 45, motto: "Your name is whispered in chalk dust." },
];

export function rankForLevel(level: number) {
  let rank = IRON_RANKS[0];
  for (const r of IRON_RANKS) {
    if (level >= r.minLevel) rank = r;
  }
  const next = IRON_RANKS[IRON_RANKS.indexOf(rank) + 1] ?? null;
  return { rank, next };
}
