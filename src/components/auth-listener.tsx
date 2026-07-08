"use client";

/**
 * Bridges Supabase auth ↔ local store. On sign-in (or page load with a
 * session) it performs a full two-way sync: pull cloud state and merge
 * (cloud wins, local-only work kept), then push the merged ledger back up so
 * history logged before the account existed reaches the cloud. Sets
 * `cloudReady` when the initial check completes so pages can safely decide
 * whether the user still needs onboarding. Renders nothing; inert offline.
 */

import { useEffect } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { hydrateFromCloud, pushAllLocal } from "@/lib/sync";
import { useIronStore } from "@/lib/store";

export async function fullSync(): Promise<void> {
  const { mergeCloudState, setCloudReady } = useIronStore.getState();
  try {
    const cloud = await hydrateFromCloud();
    if (cloud) {
      mergeCloudState(cloud);
      const merged = useIronStore.getState();
      await pushAllLocal(merged.workouts, merged.profile, merged.xp, Object.keys(merged.unlocked), merged.orderStates);
    }
  } finally {
    setCloudReady(true);
  }
}

export function AuthListener() {
  useEffect(() => {
    if (!isSupabaseConfigured) {
      useIronStore.getState().setCloudReady(true);
      return;
    }
    const supabase = getSupabase()!;

    void fullSync();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") void fullSync();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return null;
}
