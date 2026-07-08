"use client";

/**
 * Arena Duels — head-to-head competition between two signed-up lifters.
 *
 * Model: a duel is declared by a challenger against an arena-open opponent,
 * on an objective metric (volume / sets / training days) over a window.
 * Each participant computes their OWN score from their OWN logged workouts
 * and pushes it to their column (v1 is honor-system, like a gym bet — RLS
 * confines writes to participants). Whoever refreshes after the window ends
 * finalizes the duel; XP settlement happens locally, once, via the store.
 *
 * Everything here is best-effort and null-safe when Supabase is absent.
 */

import { getSupabase } from "@/lib/supabase";
import type { Workout } from "@/lib/store";

export type DuelMetric = "volume" | "sets" | "trained-days";
export type DuelStatus = "pending" | "active" | "declined" | "completed" | "cancelled";

export const METRIC_LABELS: Record<DuelMetric, string> = {
  volume: "Volume moved (kg)",
  sets: "Sets logged",
  "trained-days": "Training days",
};

export const METRIC_LORE: Record<DuelMetric, string> = {
  volume: "Total kilograms moved — weight × reps, every logged set.",
  sets: "Every honest set written into the ledger counts one mark.",
  "trained-days": "Distinct days trained. Consistency as combat.",
};

export interface ArenaLifter {
  id: string;
  username: string;
  xp: number;
  experience: string | null;
}

export interface Duel {
  id: string;
  challengerId: string;
  opponentId: string;
  metric: DuelMetric;
  status: DuelStatus;
  wagerXp: number;
  durationDays: number;
  startsAt: string | null;
  endsAt: string | null;
  challengerScore: number;
  opponentScore: number;
  winnerId: string | null;
  createdAt: string;
  /** Filled in by fetchMyDuels via a roster lookup; may be missing. */
  names: Record<string, string>;
}

export const CONSOLATION_XP = 50;

// ── Scoring ──────────────────────────────────────────────────────────────────

/** A participant's score for the duel window, from their own workouts. */
export function computeDuelScore(
  workouts: Workout[],
  metric: DuelMetric,
  startsAt: string,
  endsAt: string,
): number {
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  const scoped = workouts.filter((w) => {
    const t = new Date(`${w.performedOn}T12:00:00`).getTime();
    return t >= start && t < end;
  });
  switch (metric) {
    case "volume":
      return Math.round(
        scoped.reduce((sum, w) => sum + w.sets.reduce((s, x) => s + x.kg * x.reps, 0), 0),
      );
    case "sets":
      return scoped.reduce((sum, w) => sum + w.sets.length, 0);
    case "trained-days":
      return new Set(scoped.map((w) => w.performedOn)).size;
  }
}

// ── Supabase operations ──────────────────────────────────────────────────────

async function me(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

function mapDuel(row: Record<string, unknown>, names: Record<string, string> = {}): Duel {
  return {
    id: row.id as string,
    challengerId: row.challenger_id as string,
    opponentId: row.opponent_id as string,
    metric: row.metric as DuelMetric,
    status: row.status as DuelStatus,
    wagerXp: Number(row.wager_xp),
    durationDays: Number(row.duration_days),
    startsAt: (row.starts_at as string | null) ?? null,
    endsAt: (row.ends_at as string | null) ?? null,
    challengerScore: Number(row.challenger_score),
    opponentScore: Number(row.opponent_score),
    winnerId: (row.winner_id as string | null) ?? null,
    createdAt: row.created_at as string,
    names,
  };
}

/** Whether this deployment can duel at all (Supabase + signed in). */
export async function arenaUserId(): Promise<string | null> {
  return me();
}

/** Toggle this lifter's presence on the Arena roster. */
export async function setArenaOpen(open: boolean): Promise<boolean> {
  const supabase = getSupabase();
  const uid = await me();
  if (!supabase || !uid) return false;
  const { error } = await supabase.from("profiles").update({ arena_open: open }).eq("id", uid);
  return !error;
}

/** Search the opt-in roster (excluding yourself). Empty query = most seasoned. */
export async function fetchRoster(query: string): Promise<ArenaLifter[]> {
  const supabase = getSupabase();
  const uid = await me();
  if (!supabase || !uid) return [];
  let q = supabase
    .from("profiles")
    .select("id, username, xp, experience")
    .eq("arena_open", true)
    .neq("id", uid)
    .order("xp", { ascending: false })
    .limit(10);
  if (query.trim()) q = q.ilike("username", `%${query.trim()}%`);
  const { data, error } = await q;
  if (error || !data) return [];
  return data
    .filter((r) => r.username)
    .map((r) => ({ id: r.id, username: r.username as string, xp: r.xp ?? 0, experience: r.experience }));
}

export async function declareDuel(
  opponentId: string,
  metric: DuelMetric,
  durationDays: number,
  wagerXp: number,
): Promise<string | null> {
  const supabase = getSupabase();
  const uid = await me();
  if (!supabase || !uid) return "Sign in to declare a duel.";
  const { error } = await supabase.from("duels").insert({
    challenger_id: uid,
    opponent_id: opponentId,
    metric,
    duration_days: durationDays,
    wager_xp: wagerXp,
  });
  return error ? error.message : null;
}

export async function respondToDuel(duel: Duel, accept: boolean): Promise<string | null> {
  const supabase = getSupabase();
  const uid = await me();
  if (!supabase || !uid) return "Sign in first.";
  const patch = accept
    ? {
        status: "active",
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + duel.durationDays * 86400000).toISOString(),
      }
    : { status: "declined" };
  const { error } = await supabase.from("duels").update(patch).eq("id", duel.id).eq("status", "pending");
  return error ? error.message : null;
}

export async function cancelDuel(duelId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from("duels").update({ status: "cancelled" }).eq("id", duelId).eq("status", "pending");
}

/** Push my current score for an active duel (called on Arena load). */
export async function pushMyScore(duel: Duel, workouts: Workout[]): Promise<void> {
  const supabase = getSupabase();
  const uid = await me();
  if (!supabase || !uid || duel.status !== "active" || !duel.startsAt || !duel.endsAt) return;
  const score = computeDuelScore(workouts, duel.metric, duel.startsAt, duel.endsAt);
  const column = uid === duel.challengerId ? "challenger_score" : "opponent_score";
  await supabase.from("duels").update({ [column]: score }).eq("id", duel.id);
}

/** Close out an active duel whose window has ended. Idempotent enough. */
export async function finalizeIfExpired(duel: Duel): Promise<void> {
  const supabase = getSupabase();
  if (!supabase || duel.status !== "active" || !duel.endsAt) return;
  if (Date.now() < new Date(duel.endsAt).getTime()) return;
  const winner =
    duel.challengerScore > duel.opponentScore
      ? duel.challengerId
      : duel.opponentScore > duel.challengerScore
        ? duel.opponentId
        : null;
  await supabase
    .from("duels")
    .update({ status: "completed", winner_id: winner })
    .eq("id", duel.id)
    .eq("status", "active");
}

/** All my duels, newest first, with participant names best-effort resolved. */
export async function fetchMyDuels(): Promise<Duel[]> {
  const supabase = getSupabase();
  const uid = await me();
  if (!supabase || !uid) return [];
  const { data, error } = await supabase
    .from("duels")
    .select("*")
    .or(`challenger_id.eq.${uid},opponent_id.eq.${uid}`)
    .order("created_at", { ascending: false })
    .limit(25);
  if (error || !data) return [];

  const ids = [...new Set(data.flatMap((d) => [d.challenger_id, d.opponent_id]))];
  const names: Record<string, string> = {};
  const { data: profiles } = await supabase.from("profiles").select("id, username").in("id", ids);
  for (const p of profiles ?? []) if (p.username) names[p.id] = p.username;

  return data.map((row) => mapDuel(row, names));
}

export function duelDaysLeft(duel: Duel): number {
  if (!duel.endsAt) return duel.durationDays;
  return Math.max(0, Math.ceil((new Date(duel.endsAt).getTime() - Date.now()) / 86400000));
}
