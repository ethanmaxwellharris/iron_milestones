/**
 * The Codex engine: evaluates a lifter's aggregated stats against every
 * achievement's requirements and reports unlocks + fractional progress.
 * Pure functions — no store or network access — so they are trivially testable.
 */

import { ACHIEVEMENTS } from "./achievements";
import type {
  Achievement,
  AchievementProgress,
  LifterStats,
  Requirement,
  RequirementProgress,
} from "./types";
import { estimate1Rm } from "@/lib/oneRm";
import { liftName } from "@/lib/utils";

const BIG_THREE = ["squat", "bench", "deadlift"] as const;
const EPS = 1e-9;

// ── Workout shape the engine aggregates from ────────────────────────────────
export interface EngineSet {
  lift: string;
  kg: number;
  reps: number;
}

export interface EngineWorkout {
  id: string;
  /** ISO date, yyyy-MM-dd. */
  performedOn: string;
  bodyweightKg?: number | null;
  sets: EngineSet[];
}

// ── Stats aggregation ────────────────────────────────────────────────────────

/** ISO-week key (Mon-based) for streak counting, e.g. 2843 weeks since epoch. */
function isoWeekIndex(dateStr: string): number {
  const d = new Date(`${dateStr}T12:00:00`);
  const day = (d.getDay() + 6) % 7; // Mon = 0
  d.setDate(d.getDate() - day);
  return Math.floor(d.getTime() / (7 * 24 * 3600 * 1000));
}

export function computeStats(
  workouts: EngineWorkout[],
  profileBodyweightKg: number | null,
): LifterStats {
  const e1rms: Record<string, number> = {};
  // Max weight at each exact rep count, per lift (Pareto frontier source).
  const repMax: Record<string, Map<number, number>> = {};
  const weeks = new Set<number>();
  let prCount = 0;
  let bodyweightKg = profileBodyweightKg;

  const sorted = [...workouts].sort((a, b) => a.performedOn.localeCompare(b.performedOn));
  const runningBest: Record<string, number> = {};

  for (const w of sorted) {
    weeks.add(isoWeekIndex(w.performedOn));
    if (w.bodyweightKg) bodyweightKg = w.bodyweightKg;
    const prLiftsThisWorkout = new Set<string>();

    for (const s of w.sets) {
      if (s.kg <= 0 || s.reps <= 0) continue;
      const e1 = estimate1Rm(s.kg, s.reps);
      e1rms[s.lift] = Math.max(e1rms[s.lift] ?? 0, e1);

      const m = (repMax[s.lift] ??= new Map());
      m.set(s.reps, Math.max(m.get(s.reps) ?? 0, s.kg));

      // A PR = beating your previous best e1RM on a lift (max 1/lift/workout).
      if (e1 > (runningBest[s.lift] ?? 0) + EPS) {
        runningBest[s.lift] = e1;
        prLiftsThisWorkout.add(s.lift);
      }
    }
    prCount += prLiftsThisWorkout.size;
  }

  // Streak: consecutive trained weeks ending at the most recent trained week.
  let streakWeeks = 0;
  if (weeks.size > 0) {
    let week = Math.max(...weeks);
    while (weeks.has(week)) {
      streakWeeks += 1;
      week -= 1;
    }
  }

  const repPRs: LifterStats["repPRs"] = {};
  for (const [l, m] of Object.entries(repMax)) {
    repPRs[l] = [...m.entries()]
      .map(([reps, kg]) => ({ reps, kg }))
      .sort((a, b) => a.reps - b.reps);
  }

  return { bodyweightKg, e1rms, repPRs, workoutCount: workouts.length, streakWeeks, prCount };
}

// ── Requirement evaluation ───────────────────────────────────────────────────

function maxWeightAtReps(stats: LifterStats, l: string, reps: number): number {
  let best = 0;
  for (const entry of stats.repPRs[l] ?? []) {
    if (entry.reps >= reps) best = Math.max(best, entry.kg);
  }
  return best;
}

function bigThreeTotal(stats: LifterStats): number {
  return BIG_THREE.reduce((sum, l) => sum + (stats.e1rms[l] ?? 0), 0);
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function requirementProgress(stats: LifterStats, req: Requirement): RequirementProgress {
  switch (req.type) {
    case "lift": {
      const current = stats.e1rms[req.lift] ?? 0;
      return {
        label: `${liftName(req.lift)} ${req.kg} kg (e1RM)`,
        current, target: req.kg, fraction: clamp01(current / req.kg),
      };
    }
    case "total": {
      const current = bigThreeTotal(stats);
      return {
        label: `S/B/D total ${req.kg} kg`,
        current, target: req.kg, fraction: clamp01(current / req.kg),
      };
    }
    case "bw-multiple": {
      const bwKg = stats.bodyweightKg ?? 0;
      const current = stats.e1rms[req.lift] ?? 0;
      const target = bwKg > 0 ? bwKg * req.multiple : Number.POSITIVE_INFINITY;
      return {
        label: `${liftName(req.lift)} ${req.multiple}× bodyweight`,
        current,
        target: Number.isFinite(target) ? target : 0,
        fraction: bwKg > 0 ? clamp01(current / target) : 0,
      };
    }
    case "total-bw-multiple": {
      const bwKg = stats.bodyweightKg ?? 0;
      const current = bigThreeTotal(stats);
      const target = bwKg > 0 ? bwKg * req.multiple : 0;
      return {
        label: `Total ${req.multiple}× bodyweight`,
        current, target,
        fraction: bwKg > 0 ? clamp01(current / target) : 0,
      };
    }
    case "reps": {
      const current = maxWeightAtReps(stats, req.lift, req.reps);
      return {
        label: `${liftName(req.lift)} ${req.kg} kg × ${req.reps}`,
        current, target: req.kg, fraction: clamp01(current / req.kg),
      };
    }
    case "workouts":
      return {
        label: `${req.count} workouts logged`,
        current: stats.workoutCount, target: req.count,
        fraction: clamp01(stats.workoutCount / req.count),
      };
    case "streak":
      return {
        label: `${req.weeks}-week streak`,
        current: stats.streakWeeks, target: req.weeks,
        fraction: clamp01(stats.streakWeeks / req.weeks),
      };
    case "prs":
      return {
        label: `${req.count} personal records`,
        current: stats.prCount, target: req.count,
        fraction: clamp01(stats.prCount / req.count),
      };
  }
}

export function achievementProgress(stats: LifterStats, a: Achievement): AchievementProgress {
  const requirements = a.requirements.map((r) => requirementProgress(stats, r));
  const fraction = requirements.reduce((min, r) => Math.min(min, r.fraction), 1);
  return { achievement: a, unlocked: fraction >= 1 - EPS, fraction, requirements };
}

/** Progress for the whole codex, given current stats. */
export function evaluateCodex(stats: LifterStats): AchievementProgress[] {
  return ACHIEVEMENTS.map((a) => achievementProgress(stats, a));
}

/** Achievements newly earned relative to a set of already-unlocked ids. */
export function newlyUnlocked(stats: LifterStats, unlockedIds: Set<string>): Achievement[] {
  return ACHIEVEMENTS.filter(
    (a) => !unlockedIds.has(a.id) && achievementProgress(stats, a).unlocked,
  );
}
