"use client";

/**
 * Best-effort cloud sync. The Zustand store is the source of truth for the
 * UI; when Supabase is configured and a user is signed in, mutations are
 * written through here, and hydrateFromCloud() pulls state on sign-in.
 * Failures stay local and are shown in the sync banner.
 */

import { getSupabase } from "./supabase";
import type { Workout, Profile } from "./store";
import type { UserOrderState } from "./orders";
import { orderStateKey } from "./orders";
import { reportSyncError } from "./sync-status";
import { isUuid } from "./utils";

async function userId(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function pushWorkout(w: Workout): Promise<boolean> {
  const supabase = getSupabase();
  const uid = await userId();
  if (!supabase || !uid) return false;
  if (!isUuid(w.id)) {
    console.warn("[iron] skipping cloud sync for non-uuid workout id");
    return false;
  }
  try {
    const { error } = await supabase.rpc("save_workout", {
      p_id: w.id,
      p_performed_on: w.performedOn,
      p_bodyweight_kg: w.bodyweightKg ?? null,
      p_notes: w.notes ?? null,
      p_sets: w.sets.map((s, i) => ({
        lift_slug: s.lift,
        weight_kg: s.kg,
        reps: s.reps,
        rpe: s.rpe ?? null,
        set_order: i,
      })),
    });
    if (error) throw error;
    return true;
  } catch (e) {
    reportSyncError(e);
    return false;
  }
}

/**
 * Deletes the workout row. Sets go with it via ON DELETE CASCADE.
 * Returns false only when a signed-in cloud delete failed, so the caller can
 * leave the local session in place and let the lifter retry.
 */
export async function removeWorkoutFromCloud(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const uid = await userId();
  if (!supabase || !uid || !isUuid(id)) return true;
  try {
    const { error } = await supabase.from("workouts").delete().eq("id", id).eq("user_id", uid);
    if (error) throw error;
    return true;
  } catch (e) {
    reportSyncError(e);
    return false;
  }
}

export async function pushUnlocks(ids: string[]): Promise<boolean> {
  const supabase = getSupabase();
  const uid = await userId();
  if (!supabase || !uid || ids.length === 0) return true;
  try {
    const { error } = await supabase
      .from("user_achievements")
      .upsert(ids.map((id) => ({ user_id: uid, achievement_id: id })), { ignoreDuplicates: true });
    if (error) throw error;
    return true;
  } catch (e) {
    reportSyncError(e);
    return false;
  }
}

/**
 * Writes the public profile fields, then asks the server to store XP.
 * Username is allocated at signup and is not overwritten here.
 */
export async function pushProfile(profile: Profile, xp: number): Promise<boolean> {
  const supabase = getSupabase();
  const uid = await userId();
  if (!supabase || !uid) return false;
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.name.trim() ? profile.name.trim() : null,
        bodyweight_kg: profile.bodyweightKg,
        experience: profile.experience,
        unit: profile.unit,
        arena_open: profile.arenaOpen ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", uid);
    if (error) throw error;

    const { data, error: xpError } = await supabase.rpc("sync_my_xp", { p_xp: Math.max(0, Math.round(xp)) });
    if (xpError) throw xpError;
    if (typeof data === "number" && data < xp) {
      console.warn("[iron] cloud xp capped", { claimed: xp, applied: data });
    }
    return true;
  } catch (e) {
    reportSyncError(e);
    return false;
  }
}

export async function pushOrderState(order: UserOrderState): Promise<boolean> {
  const supabase = getSupabase();
  const uid = await userId();
  if (!supabase || !uid) return false;
  try {
    const { error } = await supabase.from("user_orders").upsert({
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
    if (error) throw error;
    return true;
  } catch (e) {
    reportSyncError(e);
    return false;
  }
}

/**
 * Upload a session's rows before XP, so the server ceiling includes them.
 * Each step reports its own failure and later steps still run.
 */
export async function pushProgress(input: {
  workout?: Workout | null;
  unlockIds?: string[];
  order?: UserOrderState | null;
  profile: Profile;
  xp: number;
}): Promise<void> {
  if (input.workout) await pushWorkout(input.workout);
  if (input.unlockIds && input.unlockIds.length > 0) await pushUnlocks(input.unlockIds);
  if (input.order) await pushOrderState(input.order);
  await pushProfile(input.profile, input.xp);
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

    const failure = profileRes.error || workoutsRes.error || setsRes.error || unlocksRes.error || orderRes.error;
    if (failure) throw failure;

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
    const displayName = (p?.display_name as string | null | undefined)?.trim();
    const username = (p?.username as string | null | undefined)?.trim();
    return {
      profile: p
        ? {
            name: displayName || username || "",
            bodyweightKg: p.bodyweight_kg ? Number(p.bodyweight_kg) : null,
            experience: p.experience ?? "novice",
            unit: p.unit === "lb" ? "lb" : "kg",
            arenaOpen: Boolean(p.arena_open),
          }
        : {},
      xp: p?.xp ?? 0,
      workouts,
      unlocked,
      orderStates,
    };
  } catch (e) {
    reportSyncError(e);
    return null;
  }
}
