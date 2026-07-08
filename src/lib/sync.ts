"use client";

/**
 * Best-effort cloud sync. The Zustand store is the source of truth for the
 * UI; when Supabase is configured and a user is signed in, mutations are
 * written through here, and hydrateFromCloud() pulls state on sign-in.
 * Failures are logged, never thrown — training data is never lost locally.
 */

import { getSupabase } from "./supabase";
import type { Workout, Profile } from "./store";
import type { UserOrderState } from "./orders";
import { orderStateKey } from "./orders";

async function userId(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function pushWorkout(w: Workout): Promise<void> {
  const supabase = getSupabase();
  const uid = await userId();
  if (!supabase || !uid) return;
  try {
    const { error } = await supabase.from("workouts").upsert({
      id: w.id,
      user_id: uid,
      performed_on: w.performedOn,
      bodyweight_kg: w.bodyweightKg ?? null,
      notes: w.notes ?? null,
    });
    if (error) throw error;
    // Idempotent re-push: replace this workout's sets rather than appending.
    await supabase.from("workout_sets").delete().eq("workout_id", w.id).eq("user_id", uid);
    const rows = w.sets.map((s, i) => ({
      workout_id: w.id,
      user_id: uid,
      lift_slug: s.lift,
      weight_kg: s.kg,
      reps: s.reps,
      rpe: s.rpe ?? null,
      set_order: i,
    }));
    const { error: setErr } = await supabase.from("workout_sets").insert(rows);
    if (setErr) throw setErr;
  } catch (e) {
    console.warn("[iron] cloud sync of workout failed (kept locally):", e);
  }
}

export async function pushUnlocks(ids: string[]): Promise<void> {
  const supabase = getSupabase();
  const uid = await userId();
  if (!supabase || !uid || ids.length === 0) return;
  try {
    await supabase
      .from("user_achievements")
      .upsert(ids.map((id) => ({ user_id: uid, achievement_id: id })), { ignoreDuplicates: true });
  } catch (e) {
    console.warn("[iron] cloud sync of unlocks failed:", e);
  }
}

export async function pushProfile(profile: Profile, xp: number): Promise<void> {
  const supabase = getSupabase();
  const uid = await userId();
  if (!supabase || !uid) return;
  try {
    await supabase.from("profiles").update({
      username: profile.name || null,
      bodyweight_kg: profile.bodyweightKg,
      experience: profile.experience,
      unit: profile.unit,
      xp,
      updated_at: new Date().toISOString(),
    }).eq("id", uid);
  } catch (e) {
    console.warn("[iron] cloud sync of profile failed:", e);
  }
}

export async function pushOrderState(order: UserOrderState): Promise<void> {
  const supabase = getSupabase();
  const uid = await userId();
  if (!supabase || !uid) return;
  try {
    await supabase.from("user_orders").upsert({
      user_id: uid,
      order_id: order.orderId,
      period_key: order.periodKey,
      kind: order.kind,
      status: order.status,
      claimed_at: order.claimedAt,
      completed_at: order.completedAt ?? null,
      expires_at: order.expiresAt,
      xp_awarded: order.xpAwarded,
      manual_progress: order.manualProgress ?? {},
    });
  } catch (e) {
    console.warn("[iron] cloud sync of order state failed:", e);
  }
}

/**
 * Upload the full local ledger. Called after sign-in merge so history that
 * was logged before the account existed (offline-first) reaches the cloud.
 */
export async function pushAllLocal(
  workouts: Workout[],
  profile: Profile,
  xp: number,
  unlockedIds: string[],
  orderStates: Record<string, UserOrderState> = {},
): Promise<void> {
  const uid = await userId();
  if (!uid) return;
  for (const w of workouts) await pushWorkout(w);
  await pushUnlocks(unlockedIds);
  for (const order of Object.values(orderStates)) await pushOrderState(order);
  await pushProfile(profile, xp);
}

/** Pull cloud state after sign-in. Returns null when unavailable. */
export async function hydrateFromCloud(): Promise<{
  profile: Partial<Profile>;
  xp: number;
  workouts: Workout[];
  unlocked: Record<string, string>;
  orderStates: Record<string, UserOrderState>;
} | null> {
  const supabase = getSupabase();
  const uid = await userId();
  if (!supabase || !uid) return null;
  try {
    const [profileRes, workoutsRes, setsRes, unlocksRes, orderRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).single(),
      supabase.from("workouts").select("*").eq("user_id", uid).order("performed_on"),
      supabase.from("workout_sets").select("*").eq("user_id", uid).order("set_order"),
      supabase.from("user_achievements").select("*").eq("user_id", uid),
      supabase.from("user_orders").select("*").eq("user_id", uid),
    ]);

    const setsByWorkout = new Map<string, { lift: string; kg: number; reps: number; rpe?: number }[]>();
    for (const s of setsRes.data ?? []) {
      const list = setsByWorkout.get(s.workout_id) ?? [];
      list.push({ lift: s.lift_slug, kg: Number(s.weight_kg), reps: s.reps, rpe: s.rpe ?? undefined });
      setsByWorkout.set(s.workout_id, list);
    }

    const workouts: Workout[] = (workoutsRes.data ?? []).map((w) => ({
      id: w.id,
      performedOn: w.performed_on,
      bodyweightKg: w.bodyweight_kg ? Number(w.bodyweight_kg) : null,
      notes: w.notes ?? undefined,
      sets: setsByWorkout.get(w.id) ?? [],
    }));

    const unlocked: Record<string, string> = {};
    for (const u of unlocksRes.data ?? []) unlocked[u.achievement_id] = u.unlocked_at;

    const orderStates: Record<string, UserOrderState> = {};
    for (const row of orderRes.data ?? []) {
      const state: UserOrderState = {
        orderId: row.order_id,
        periodKey: row.period_key,
        kind: row.kind,
        status: row.status,
        claimedAt: row.claimed_at,
        completedAt: row.completed_at ?? undefined,
        expiresAt: row.expires_at,
        xpAwarded: row.xp_awarded ?? 0,
        manualProgress: row.manual_progress ?? undefined,
      };
      orderStates[orderStateKey(state.orderId, state.periodKey)] = state;
    }

    const p = profileRes.data;
    return {
      profile: p
        ? {
            name: p.username ?? "",
            bodyweightKg: p.bodyweight_kg ? Number(p.bodyweight_kg) : null,
            experience: p.experience ?? "novice",
            unit: p.unit === "lb" ? "lb" : "kg",
          }
        : {},
      xp: p?.xp ?? 0,
      workouts,
      unlocked,
      orderStates,
    };
  } catch (e) {
    console.warn("[iron] cloud hydrate failed:", e);
    return null;
  }
}
