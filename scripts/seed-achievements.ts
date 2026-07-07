/**
 * Mirrors the canonical codex (src/lib/codex/achievements.ts) into the
 * Supabase `achievements` table. Idempotent — safe to re-run after adding
 * entries to the codex.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed:achievements
 * (or put both in .env.local — this script reads it.)
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { ACHIEVEMENTS } from "../src/lib/codex/achievements";

// Minimal .env.local loader (no dotenv dependency needed).
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
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Set them in .env.local (see .env.example) and re-run.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const rows = ACHIEVEMENTS.map((a) => ({
  id: a.id,
  name: a.name,
  category: a.category,
  tier: a.tier,
  rarity: a.rarity,
  lifter: a.lifter ?? null,
  era: a.era ?? null,
  lore: a.lore,
  icon_description: a.iconDescription,
  requirements: a.requirements,
  xp: a.xp,
}));

async function main() {
  const { error } = await supabase.from("achievements").upsert(rows);
  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
  console.log(`Seeded ${rows.length} achievements into the codex. Forge on.`);
}

void main();
