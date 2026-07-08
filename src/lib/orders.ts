"use client";

import type { Profile, Workout } from "@/lib/store";
import type { LiftSlug } from "@/lib/codex/types";
import { estimate1Rm } from "@/lib/oneRm";

export type OrderKind = "daily" | "weekly" | "contract";
export type OrderStatus = "claimed" | "completed" | "expired";
export type OrderDifficulty = "steady" | "stout" | "heroic";

export type OrderRequirement =
  | { type: "manual"; label: string; target: number }
  | { type: "sessions"; count: number }
  | { type: "trained-days"; count: number }
  | { type: "sets"; count: number; lift?: LiftSlug }
  | { type: "volume"; kg: number }
  | { type: "lift-performed"; lift: LiftSlug }
  | { type: "training-note"; count: number }
  | { type: "heavy-single"; lift: LiftSlug; minPercentBest: number };

export interface OrderDefinition {
  id: string;
  kind: OrderKind;
  name: string;
  description: string;
  requirements: OrderRequirement[];
  xp: number;
  difficulty: OrderDifficulty;
  safetyTag?: "submaximal" | "manual" | "heavy";
}

export interface UserOrderState {
  orderId: string;
  periodKey: string;
  kind: OrderKind;
  status: OrderStatus;
  claimedAt: string;
  completedAt?: string;
  expiresAt: string;
  xpAwarded: number;
  manualProgress?: Record<string, number>;
}

export interface GeneratedOrder {
  definition: OrderDefinition;
  periodKey: string;
  expiresAt: string;
}

export interface RequirementProgress {
  label: string;
  current: number;
  target: number;
  fraction: number;
  manual: boolean;
}

export interface OrderProgress {
  order: GeneratedOrder;
  state?: UserOrderState;
  requirements: RequirementProgress[];
  fraction: number;
  complete: boolean;
  expired: boolean;
}

const DAILY_FORGE_ORDERS: OrderDefinition[] = [
  {
    id: "daily-log-session",
    kind: "daily",
    name: "Open the Ledger",
    description: "Log any honest session. The codex only honors what is written.",
    requirements: [{ type: "sessions", count: 1 }],
    xp: 45,
    difficulty: "steady",
    safetyTag: "submaximal",
  },
  {
    id: "daily-fifty-pushups",
    kind: "daily",
    name: "Chapel Floor Tax",
    description: "Do 50 pushups across the day. Break them up however the shoulders permit.",
    requirements: [{ type: "manual", label: "Pushups completed", target: 50 }],
    xp: 55,
    difficulty: "steady",
    safetyTag: "manual",
  },
  {
    id: "daily-row-sets",
    kind: "daily",
    name: "Reeves's Back Receipt",
    description: "Complete 3 sets of rows. A stronger back signs every other lift.",
    requirements: [{ type: "sets", lift: "row", count: 3 }],
    xp: 60,
    difficulty: "steady",
    safetyTag: "submaximal",
  },
  {
    id: "daily-warmup-craft",
    kind: "daily",
    name: "Oil the Hinges",
    description: "Do 10 minutes of mobility or warm-up work before the heavy things begin.",
    requirements: [{ type: "manual", label: "Minutes completed", target: 10 }],
    xp: 40,
    difficulty: "steady",
    safetyTag: "manual",
  },
  {
    id: "daily-write-note",
    kind: "daily",
    name: "Scribe's Margin",
    description: "Leave a training note on today's session. Patterns hide in the margins.",
    requirements: [{ type: "training-note", count: 1 }],
    xp: 35,
    difficulty: "steady",
    safetyTag: "submaximal",
  },
  {
    id: "daily-mainlift-sets",
    kind: "daily",
    name: "Three Plates of Practice",
    description: "Complete 3 working sets on any barbell lift.",
    requirements: [{ type: "sets", count: 3 }],
    xp: 50,
    difficulty: "steady",
    safetyTag: "submaximal",
  },
];

const WEEKLY_FORGE_ORDERS: OrderDefinition[] = [
  {
    id: "weekly-three-days",
    kind: "weekly",
    name: "Milo's Attendance",
    description: "Train on 3 separate days this week. The calf gets heavier whether you show up or not.",
    requirements: [{ type: "trained-days", count: 3 }],
    xp: 170,
    difficulty: "steady",
    safetyTag: "submaximal",
  },
  {
    id: "weekly-thirty-sets",
    kind: "weekly",
    name: "Thirty Marks on the Anvil",
    description: "Accumulate 30 logged sets this week. Small strikes still shape the blade.",
    requirements: [{ type: "sets", count: 30 }],
    xp: 190,
    difficulty: "stout",
    safetyTag: "submaximal",
  },
  {
    id: "weekly-big-three",
    kind: "weekly",
    name: "The Three Judges",
    description: "Train squat, bench, and deadlift at least once this week.",
    requirements: [
      { type: "lift-performed", lift: "squat" },
      { type: "lift-performed", lift: "bench" },
      { type: "lift-performed", lift: "deadlift" },
    ],
    xp: 210,
    difficulty: "stout",
    safetyTag: "submaximal",
  },
  {
    id: "weekly-volume",
    kind: "weekly",
    name: "The Long Furnace",
    description: "Move 8,000 kg of logged volume this week. Heat, repetition, shape.",
    requirements: [{ type: "volume", kg: 8000 }],
    xp: 220,
    difficulty: "stout",
    safetyTag: "submaximal",
  },
  {
    id: "weekly-two-notes",
    kind: "weekly",
    name: "Keeper's Margins",
    description: "Write training notes on 2 sessions this week.",
    requirements: [{ type: "training-note", count: 2 }],
    xp: 120,
    difficulty: "steady",
    safetyTag: "submaximal",
  },
];

const IRON_CONTRACTS: OrderDefinition[] = [
  {
    id: "contract-ledger-keeper",
    kind: "contract",
    name: "The Keeper's Ledger",
    description: "Log 3 sessions with notes before the contract expires. Memory is a poor training partner.",
    requirements: [{ type: "training-note", count: 3 }],
    xp: 360,
    difficulty: "stout",
    safetyTag: "submaximal",
  },
  {
    id: "contract-back-builder",
    kind: "contract",
    name: "Reeves's Scaffold",
    description: "Complete 12 row sets before expiry. Build the back that builds the rest.",
    requirements: [{ type: "sets", lift: "row", count: 12 }],
    xp: 420,
    difficulty: "stout",
    safetyTag: "submaximal",
  },
  {
    id: "contract-forge-volume",
    kind: "contract",
    name: "The Bellows Week",
    description: "Move 15,000 kg of logged volume before expiry. No drama, just heat.",
    requirements: [{ type: "volume", kg: 15000 }],
    xp: 520,
    difficulty: "heroic",
    safetyTag: "submaximal",
  },
  {
    id: "contract-atlas-single",
    kind: "contract",
    name: "Trial of Atlas",
    description: "Work up to a heavy squat single at 90% or more of your logged best. Rare work, earned by preparation.",
    requirements: [{ type: "heavy-single", lift: "squat", minPercentBest: 0.9 }],
    xp: 650,
    difficulty: "heroic",
    safetyTag: "heavy",
  },
];

export const ALL_ORDERS = [...DAILY_FORGE_ORDERS, ...WEEKLY_FORGE_ORDERS, ...IRON_CONTRACTS];

export function orderStateKey(orderId: string, periodKey: string) {
  return `${periodKey}:${orderId}`;
}

export function getGeneratedOrders(profile: Profile, workouts: Workout[], now = new Date()): GeneratedOrder[] {
  const dailyKey = periodKey("daily", now);
  const weeklyKey = periodKey("weekly", now);
  const daily = pickStable(DAILY_FORGE_ORDERS, `${dailyKey}:${profile.experience}`, 3);
  const weekly = pickStable(WEEKLY_FORGE_ORDERS, `${weeklyKey}:${profile.experience}`, 3);
  const contracts = availableContracts(profile, workouts, now).map((definition) => ({
    definition,
    periodKey: weeklyKey,
    expiresAt: expiryFor("contract", now),
  }));

  return [
    ...daily.map((definition) => ({ definition, periodKey: dailyKey, expiresAt: expiryFor("daily", now) })),
    ...weekly.map((definition) => ({ definition, periodKey: weeklyKey, expiresAt: expiryFor("weekly", now) })),
    ...contracts,
  ];
}

export function evaluateOrder(
  order: GeneratedOrder,
  workouts: Workout[],
  state?: UserOrderState,
  now = new Date(),
): OrderProgress {
  const start = startForPeriod(order.definition.kind, order.periodKey);
  const end = new Date(order.expiresAt);
  const scoped = workouts.filter((w) => {
    const d = workoutDate(w);
    return d >= start && d < end;
  });
  const requirements = order.definition.requirements.map((req, index) =>
    evaluateRequirement(req, scoped, workouts, state, index),
  );
  const fraction = requirements.reduce((min, req) => Math.min(min, req.fraction), 1);
  const expired = now.getTime() >= end.getTime();
  return {
    order,
    state,
    requirements,
    fraction,
    complete: fraction >= 1,
    expired,
  };
}

export function activeOrders(
  orders: GeneratedOrder[],
  states: Record<string, UserOrderState>,
  workouts: Workout[],
  now = new Date(),
) {
  return orders.map((order) => evaluateOrder(order, workouts, states[orderStateKey(order.definition.id, order.periodKey)], now));
}

function evaluateRequirement(
  req: OrderRequirement,
  scoped: Workout[],
  allWorkouts: Workout[],
  state: UserOrderState | undefined,
  index: number,
): RequirementProgress {
  switch (req.type) {
    case "manual": {
      const current = state?.manualProgress?.[String(index)] ?? 0;
      return progress(req.label, current, req.target, true);
    }
    case "sessions":
      return progress("Sessions logged", scoped.length, req.count, false);
    case "trained-days":
      return progress("Training days", new Set(scoped.map((w) => w.performedOn)).size, req.count, false);
    case "sets": {
      const current = scoped.reduce(
        (sum, w) => sum + w.sets.filter((s) => !req.lift || s.lift === req.lift).length,
        0,
      );
      return progress(req.lift ? `${liftLabel(req.lift)} sets` : "Logged sets", current, req.count, false);
    }
    case "volume": {
      const current = scoped.reduce(
        (sum, w) => sum + w.sets.reduce((setSum, s) => setSum + s.kg * s.reps, 0),
        0,
      );
      return progress("Volume moved", Math.round(current), req.kg, false);
    }
    case "lift-performed": {
      const current = scoped.some((w) => w.sets.some((s) => s.lift === req.lift)) ? 1 : 0;
      return progress(`${liftLabel(req.lift)} trained`, current, 1, false);
    }
    case "training-note": {
      const current = scoped.filter((w) => (w.notes ?? "").trim().length > 0).length;
      return progress("Sessions with notes", current, req.count, false);
    }
    case "heavy-single": {
      const previousBest = bestE1Rm(
        allWorkouts.filter((w) => workoutDate(w) < scopedStart(scoped)),
        req.lift,
      );
      const target = previousBest * req.minPercentBest;
      const current = bestSingle(scoped, req.lift);
      return progress(`${liftLabel(req.lift)} heavy single`, current, target || 1, false);
    }
  }
}

function progress(label: string, current: number, target: number, manual: boolean): RequirementProgress {
  const safeTarget = Math.max(1, target);
  return {
    label,
    current,
    target,
    fraction: Math.min(1, Math.max(0, current / safeTarget)),
    manual,
  };
}

function availableContracts(profile: Profile, workouts: Workout[], now: Date): OrderDefinition[] {
  const weekKey = periodKey("weekly", now);
  const picks = pickStable(IRON_CONTRACTS.filter((c) => c.safetyTag !== "heavy"), `${weekKey}:contracts`, 2);
  const hasRecentSquat = workouts.some((w) => daysBetween(workoutDate(w), now) <= 21 && w.sets.some((s) => s.lift === "squat"));
  const experienced = profile.experience === "advanced" || profile.experience === "elite";
  if (hasRecentSquat && experienced) picks.push(IRON_CONTRACTS.find((c) => c.id === "contract-atlas-single")!);
  return picks;
}

function pickStable<T>(items: T[], seed: string, count: number): T[] {
  return [...items]
    .map((item, index) => ({ item, score: hash(`${seed}:${index}`) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, count)
    .map(({ item }) => item);
}

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function periodKey(kind: OrderKind, date: Date): string {
  if (kind === "daily") return `daily:${date.toISOString().slice(0, 10)}`;
  const week = isoWeek(date);
  return `weekly:${week.year}-W${String(week.week).padStart(2, "0")}`;
}

function expiryFor(kind: OrderKind, date: Date): string {
  const d = new Date(date);
  if (kind === "daily") d.setDate(d.getDate() + 1);
  else d.setDate(d.getDate() + 7);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function startForPeriod(kind: OrderKind, key: string): Date {
  if (kind === "daily") return new Date(`${key.replace("daily:", "")}T00:00:00`);
  const [, value] = key.split(":");
  const [yearText, weekText] = value.split("-W");
  return dateFromIsoWeek(Number(yearText), Number(weekText));
}

function isoWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

function dateFromIsoWeek(year: number, week: number) {
  const d = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const day = d.getUTCDay() || 7;
  if (day <= 4) d.setUTCDate(d.getUTCDate() - day + 1);
  else d.setUTCDate(d.getUTCDate() + 8 - day);
  return d;
}

function workoutDate(w: Workout) {
  return new Date(`${w.performedOn}T12:00:00`);
}

function daysBetween(a: Date, b: Date) {
  return Math.max(0, (b.getTime() - a.getTime()) / 86400000);
}

function liftLabel(lift: string) {
  return lift.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function bestSingle(workouts: Workout[], lift: string) {
  return workouts.reduce((best, w) => {
    for (const s of w.sets) {
      if (s.lift === lift && s.reps === 1) best = Math.max(best, s.kg);
    }
    return best;
  }, 0);
}

function bestE1Rm(workouts: Workout[], lift: string) {
  return workouts.reduce((best, w) => {
    for (const s of w.sets) {
      if (s.lift === lift) best = Math.max(best, estimate1Rm(s.kg, s.reps));
    }
    return best;
  }, 0);
}

function scopedStart(scoped: Workout[]) {
  if (scoped.length === 0) return new Date();
  return workoutDate(scoped.reduce((earliest, w) => (w.performedOn < earliest.performedOn ? w : earliest)));
}
