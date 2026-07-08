/**
 * The Forge Warden — a house lifter for testing the Arena duel loop before
 * real users arrive. Requires SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).
 *
 * Each run plays one "turn" for the Warden:
 *   1. Ensures the Warden auth user + arena-open profile exist.
 *   2. Accepts any pending duels challenged against the Warden.
 *   3. Posts a plausible score on the Warden's side of active duels,
 *      scaled by how much of the duel window has elapsed.
 *
 * Usage:  npm run arena:warden        (run again any time to advance its turn)
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const WARDEN_EMAIL = "warden@iron-milestones.local";
const WARDEN_NAME = "The Forge Warden";

/** Hourly pace the Warden "trains" at, per metric, for a 7-day duel. */
const WEEKLY_PACE: Record<string, number> = {
  volume: 11000, // kg
  sets: 26,
  "trained-days": 4,
};

async function ensureWarden(): Promise<string> {
  // listUsers pages default 50 — fine for a young project.
  const { data: list } = await supabase.auth.admin.listUsers();
  const existing = list?.users.find((u) => u.email === WARDEN_EMAIL);
  let id = existing?.id;
  if (!id) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: WARDEN_EMAIL,
      password: crypto.randomUUID(), // never used; the Warden acts via this script
      email_confirm: true,
      user_metadata: { username: WARDEN_NAME },
    });
    if (error || !data.user) throw new Error(`Could not forge the Warden: ${error?.message}`);
    id = data.user.id;
    console.log("⚒ The Forge Warden has been forged.");
  }
  const { error } = await supabase.from("profiles").upsert({
    id,
    username: WARDEN_NAME,
    experience: "advanced",
    xp: 4200,
    arena_open: true,
    unit: "kg",
  });
  if (error) throw new Error(`Warden profile failed: ${error.message}`);
  return id;
}

async function playTurn(wardenId: string) {
  // Accept pending challenges.
  const { data: pending } = await supabase
    .from("duels")
    .select("*")
    .eq("opponent_id", wardenId)
    .eq("status", "pending");
  for (const duel of pending ?? []) {
    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + duel.duration_days * 86400000);
    await supabase
      .from("duels")
      .update({ status: "active", starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString() })
      .eq("id", duel.id);
    console.log(`⚔ Warden accepts a ${duel.metric} duel (${duel.duration_days} days, ${duel.wager_xp} XP).`);
  }

  // Post scores on active duels: pace × elapsed fraction, ±15% grit.
  const { data: active } = await supabase
    .from("duels")
    .select("*")
    .eq("opponent_id", wardenId)
    .eq("status", "active");
  for (const duel of active ?? []) {
    const start = new Date(duel.starts_at).getTime();
    const end = new Date(duel.ends_at).getTime();
    const elapsed = Math.min(1, Math.max(0, (Date.now() - start) / (end - start)));
    const weekPace = WEEKLY_PACE[duel.metric] ?? 20;
    const pace = (weekPace / 7) * duel.duration_days;
    const grit = 0.85 + Math.random() * 0.3;
    const score = Math.round(pace * elapsed * grit);
    await supabase.from("duels").update({ opponent_score: score }).eq("id", duel.id);
    console.log(`⚒ Warden posts ${score} (${duel.metric}) — ${Math.round(elapsed * 100)}% of the window burned.`);
  }

  if ((pending?.length ?? 0) + (active?.length ?? 0) === 0) {
    console.log("The Warden sharpens tools and waits. Throw a gauntlet from /arena, then run this again.");
  }
}

async function main() {
  const wardenId = await ensureWarden();
  await playTurn(wardenId);
  console.log("Turn complete.");
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
