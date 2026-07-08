"use client";

/**
 * Offline-first app state. Persists to localStorage; when Supabase is
 * configured and the user is signed in, mutations write through to the cloud
 * (see sync.ts). All achievement/XP math happens here so every entry point
 * (logging, onboarding, cloud hydrate) awards unlocks consistently.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Achievement } from "@/lib/codex/types";
import { computeStats, newlyUnlocked } from "@/lib/codex/engine";
import { PR_XP, workoutXp } from "@/lib/xp";
import { uid } from "@/lib/utils";
import { pushOrderState, pushProfile, pushUnlocks, pushWorkout } from "@/lib/sync";
import type { GeneratedOrder, UserOrderState } from "@/lib/orders";
import { orderStateKey } from "@/lib/orders";

export interface LoggedSet {
  lift: string;
  kg: number;
  reps: number;
  rpe?: number;
}

export interface Workout {
  id: string;
  /** yyyy-MM-dd */
  performedOn: string;
  bodyweightKg?: number | null;
  notes?: string;
  sets: LoggedSet[];
}

export interface Profile {
  name: string;
  bodyweightKg: number | null;
  experience: "novice" | "intermediate" | "advanced" | "elite";
  unit: "kg" | "lb";
  /** Opt-in: listed on the Arena roster and challengeable to duels. */
  arenaOpen: boolean;
}

export interface LogResult {
  newAchievements: Achievement[];
  xpGained: number;
  newPrs: number;
}

export interface CustomLift {
  slug: string;
  name: string;
}

interface IronState {
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  /** True once the initial cloud check (signed in or not) has completed. */
  cloudReady: boolean;
  setCloudReady: (v: boolean) => void;
  onboarded: boolean;
  profile: Profile;
  workouts: Workout[];
  /** achievement id → ISO timestamp of unlock */
  unlocked: Record<string, string>;
  xp: number;
  customLifts: CustomLift[];
  orderStates: Record<string, UserOrderState>;
  /** duel id → XP already granted for it (settlement happens exactly once). */
  duelXp: Record<string, number>;

  completeOnboarding: (profile: Profile, baseline: LoggedSet[]) => LogResult;
  updateProfile: (patch: Partial<Profile>) => void;
  logWorkout: (w: Omit<Workout, "id">) => LogResult;
  addCustomLift: (name: string) => CustomLift;
  awardDuelXp: (duelId: string, amount: number) => number;
  claimOrder: (order: GeneratedOrder) => void;
  setManualOrderProgress: (order: GeneratedOrder, requirementIndex: number, value: number) => void;
  completeOrder: (order: GeneratedOrder) => number;
  mergeCloudState: (cloud: {
    profile: Partial<Profile>;
    xp: number;
    workouts: Workout[];
    unlocked: Record<string, string>;
    orderStates: Record<string, UserOrderState>;
  }) => void;
  resetAll: () => void;
}

const DEFAULT_PROFILE: Profile = {
  name: "",
  bodyweightKg: null,
  experience: "novice",
  unit: "kg",
  arenaOpen: false,
};

/** Award unlocks + XP for the state after a mutation. Pure helper. */
function settleUnlocks(
  workouts: Workout[],
  bodyweightKg: number | null,
  unlocked: Record<string, string>,
  prevPrCount: number,
): { unlocked: Record<string, string>; result: LogResult; setCount: number } {
  const stats = computeStats(workouts, bodyweightKg);
  const fresh = newlyUnlocked(stats, new Set(Object.keys(unlocked)));
  const now = new Date().toISOString();
  const nextUnlocked = { ...unlocked };
  for (const a of fresh) nextUnlocked[a.id] = now;

  const newPrs = Math.max(0, stats.prCount - prevPrCount);
  const latest = workouts[workouts.length - 1];
  const xpGained =
    workoutXp(latest?.sets.length ?? 0) +
    newPrs * PR_XP +
    fresh.reduce((sum, a) => sum + a.xp, 0);

  return {
    unlocked: nextUnlocked,
    result: { newAchievements: fresh, xpGained, newPrs },
    setCount: latest?.sets.length ?? 0,
  };
}

export const useIronStore = create<IronState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      cloudReady: false,
      setCloudReady: (v) => set({ cloudReady: v }),
      onboarded: false,
      profile: DEFAULT_PROFILE,
      workouts: [],
      unlocked: {},
      xp: 0,
      customLifts: [],
      orderStates: {},
      duelXp: {},

      awardDuelXp: (duelId, amount) => {
        const state = get();
        if (duelId in state.duelXp) return 0;
        const xp = state.xp + amount;
        set({ duelXp: { ...state.duelXp, [duelId]: amount }, xp });
        void pushProfile(state.profile, xp);
        return amount;
      },

      completeOnboarding: (profile, baseline) => {
        const state = get();
        const workouts = [...state.workouts];
        if (baseline.length > 0) {
          workouts.push({
            id: uid(),
            performedOn: new Date().toISOString().slice(0, 10),
            bodyweightKg: profile.bodyweightKg,
            notes: "Baseline bests (onboarding)",
            sets: baseline,
          });
        }
        const prev = computeStats(state.workouts, state.profile.bodyweightKg);
        const settled = settleUnlocks(workouts, profile.bodyweightKg, state.unlocked, prev.prCount);
        const xp = state.xp + settled.result.xpGained;
        set({ onboarded: true, profile, workouts, unlocked: settled.unlocked, xp });

        const added = workouts[workouts.length - 1];
        if (baseline.length > 0 && added) void pushWorkout(added);
        void pushUnlocks(settled.result.newAchievements.map((a) => a.id));
        void pushProfile(profile, xp);
        return settled.result;
      },

      updateProfile: (patch) => {
        const profile = { ...get().profile, ...patch };
        set({ profile });
        void pushProfile(profile, get().xp);
      },

      logWorkout: (w) => {
        const state = get();
        const workout: Workout = { ...w, id: uid() };
        const workouts = [...state.workouts, workout];
        const prev = computeStats(state.workouts, state.profile.bodyweightKg);
        const bw = w.bodyweightKg ?? state.profile.bodyweightKg;
        const settled = settleUnlocks(workouts, bw, state.unlocked, prev.prCount);
        const xp = state.xp + settled.result.xpGained;
        const profile = w.bodyweightKg
          ? { ...state.profile, bodyweightKg: w.bodyweightKg }
          : state.profile;
        set({ workouts, unlocked: settled.unlocked, xp, profile });

        void pushWorkout(workout);
        void pushUnlocks(settled.result.newAchievements.map((a) => a.id));
        void pushProfile(profile, xp);
        return settled.result;
      },

      addCustomLift: (name) => {
        const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const existing = get().customLifts.find((l) => l.slug === slug);
        if (existing) return existing;
        const liftDef = { slug, name: name.trim() };
        set({ customLifts: [...get().customLifts, liftDef] });
        return liftDef;
      },

      claimOrder: (order) => {
        const state = get();
        const key = orderStateKey(order.definition.id, order.periodKey);
        if (state.orderStates[key]) return;
        const now = new Date().toISOString();
        const orderState: UserOrderState = {
          orderId: order.definition.id,
          periodKey: order.periodKey,
          kind: order.definition.kind,
          status: "claimed",
          claimedAt: now,
          expiresAt: order.expiresAt,
          xpAwarded: 0,
        };
        set({ orderStates: { ...state.orderStates, [key]: orderState } });
        void pushOrderState(orderState);
      },

      setManualOrderProgress: (order, requirementIndex, value) => {
        const state = get();
        const key = orderStateKey(order.definition.id, order.periodKey);
        const existing = state.orderStates[key];
        if (!existing || existing.status === "completed") return;
        const next: UserOrderState = {
          ...existing,
          manualProgress: {
            ...(existing.manualProgress ?? {}),
            [String(requirementIndex)]: Math.max(0, Math.floor(value)),
          },
        };
        set({ orderStates: { ...state.orderStates, [key]: next } });
        void pushOrderState(next);
      },

      completeOrder: (order) => {
        const state = get();
        const key = orderStateKey(order.definition.id, order.periodKey);
        const existing = state.orderStates[key];
        if (!existing || existing.status === "completed" || existing.xpAwarded > 0) return 0;
        const xp = state.xp + order.definition.xp;
        const next: UserOrderState = {
          ...existing,
          status: "completed",
          completedAt: new Date().toISOString(),
          xpAwarded: order.definition.xp,
        };
        set({ orderStates: { ...state.orderStates, [key]: next }, xp });
        void pushOrderState(next);
        void pushProfile(state.profile, xp);
        return order.definition.xp;
      },

      mergeCloudState: (cloud) => {
        const state = get();
        // Cloud wins for anything it has; local-only workouts are kept.
        const byId = new Map(cloud.workouts.map((w) => [w.id, w]));
        for (const w of state.workouts) if (!byId.has(w.id)) byId.set(w.id, w);
        const workouts = [...byId.values()].sort((a, b) =>
          a.performedOn.localeCompare(b.performedOn),
        );
        const orderStates = { ...state.orderStates };
        for (const [key, cloudOrder] of Object.entries(cloud.orderStates)) {
          const local = orderStates[key];
          if (!local || cloudOrder.status === "completed" || local.status !== "completed") {
            orderStates[key] = cloudOrder;
          }
        }
        set({
          profile: { ...state.profile, ...cloud.profile },
          xp: Math.max(state.xp, cloud.xp),
          workouts,
          unlocked: { ...state.unlocked, ...cloud.unlocked },
          orderStates,
          onboarded: state.onboarded || cloud.workouts.length > 0 || !!cloud.profile.bodyweightKg,
        });
      },

      resetAll: () =>
        set({
          onboarded: false,
          profile: DEFAULT_PROFILE,
          workouts: [],
          unlocked: {},
          xp: 0,
          customLifts: [],
          orderStates: {},
          duelXp: {},
        }),
    }),
    {
      name: "iron-milestones",
      // Runs after localStorage hydration; the action is bound via closure so
      // it is safe to call here (the store variable itself isn't assigned yet).
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: ({ hydrated: _h, cloudReady: _c, ...rest }) => rest as IronState,
    },
  ),
);

/** Derived stats selector — memoize at call sites with useMemo if needed. */
export function selectStats(state: Pick<IronState, "workouts" | "profile">) {
  return computeStats(state.workouts, state.profile.bodyweightKg);
}
