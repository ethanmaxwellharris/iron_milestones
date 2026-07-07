"use client";

/**
 * Supabase browser client. The app is offline-first: when these env vars are
 * absent it runs entirely on localStorage ("Forge Offline" mode) and every
 * cloud call in sync.ts becomes a no-op.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) client = createBrowserClient(url!, anonKey!);
  return client;
}
