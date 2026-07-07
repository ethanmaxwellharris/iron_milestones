/**
 * Core types for the Achievements Codex.
 *
 * The codex is data-driven: every achievement is a plain object whose
 * `requirements` array is evaluated against a lifter's aggregated stats.
 * To expand the codex, add entries to src/lib/codex/achievements.ts —
 * no engine changes needed unless you invent a new Requirement type.
 */

export type LiftSlug = "squat" | "bench" | "deadlift" | "ohp" | "row" | (string & {});

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type Tier = "novice" | "apprentice" | "journeyman" | "master" | "legend";

export type Category =
  | "squat"
  | "bench"
  | "deadlift"
  | "press"
  | "total"
  | "assistance"
  | "pound-for-pound"
  | "repetition"
  | "dedication"
  | "golden-era"
  | "mythic";

/** All requirements in an achievement are ANDed together. */
export type Requirement =
  /** Estimated 1RM on a lift reaches `kg`. */
  | { type: "lift"; lift: LiftSlug; kg: number }
  /** Squat + Bench + Deadlift estimated 1RMs sum to `kg`. */
  | { type: "total"; kg: number }
  /** Estimated 1RM on `lift` reaches `multiple` × bodyweight. */
  | { type: "bw-multiple"; lift: LiftSlug; multiple: number }
  /** S/B/D total reaches `multiple` × bodyweight. */
  | { type: "total-bw-multiple"; multiple: number }
  /** A single logged set of `lift` at ≥ `kg` for ≥ `reps`. */
  | { type: "reps"; lift: LiftSlug; kg: number; reps: number }
  /** Total workouts logged. */
  | { type: "workouts"; count: number }
  /** Consecutive weeks with ≥ 1 workout. */
  | { type: "streak"; weeks: number }
  /** Number of personal records set (any lift). */
  | { type: "prs"; count: number };

export interface Achievement {
  /** Stable id — never change once shipped; unlocks are stored against it. */
  id: string;
  name: string;
  category: Category;
  tier: Tier;
  rarity: Rarity;
  /** The historic lifter honored, if any. */
  lifter?: string;
  /** Era label shown on the card, e.g. "1953 · Vancouver". */
  era?: string;
  /** 1–3 sentences of flavor text — the grimoire page. */
  lore: string;
  /** Detailed art direction for icon generation (woodcut/engraving style). */
  iconDescription: string;
  requirements: Requirement[];
  /** XP granted on unlock (derived from rarity). */
  xp: number;
}

/** Aggregated lifter stats the engine evaluates requirements against. */
export interface LifterStats {
  bodyweightKg: number | null;
  /** Best estimated 1RM (Epley) per lift slug, in kg. */
  e1rms: Record<string, number>;
  /**
   * Rep PR frontier per lift: for each entry, `kg` is the heaviest weight
   * ever lifted for at least `reps` reps. Sorted by reps ascending.
   */
  repPRs: Record<string, { reps: number; kg: number }[]>;
  workoutCount: number;
  streakWeeks: number;
  prCount: number;
}

export interface RequirementProgress {
  label: string;
  current: number;
  target: number;
  /** 0..1, clamped. */
  fraction: number;
}

export interface AchievementProgress {
  achievement: Achievement;
  unlocked: boolean;
  /** 0..1 — minimum fraction across all requirements. */
  fraction: number;
  requirements: RequirementProgress[];
}
