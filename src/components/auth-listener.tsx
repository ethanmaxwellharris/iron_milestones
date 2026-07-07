"use client";

/**
 * Bridges Supabase auth ↔ local store: when a user signs in, cloud state is
 * pulled and merged (cloud wins, local-only work is kept). Renders nothing.
 * In Forge Offline mode (no env vars) this is inert.
 */

import { useEffect } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { hydrateFromCloud } from "@/lib/sync";
import { useIronStore } from "@/lib/store";

export function AuthListener() {
  const mergeCloudState = useIronStore((s) => s.mergeCloudState);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabase()!;

    const pull = async () => {
      const cloud = await hydrateFromCloud();
      if (cloud) mergeCloudState(cloud);
    };

    void pull();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") void pull();
    });
    return () => sub.subscription.unsubscribe();
  }, [mergeCloudState]);

  return null;
}
