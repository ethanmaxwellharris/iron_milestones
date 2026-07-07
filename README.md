# ⚒️ Iron Milestones — The Codex of Iron

A gamified strength-training tracker that turns squat, bench, and deadlift progress into an epic
journey through the true history of the iron game. Log your lifts; unlock the deeds of Reg Park,
Doug Hepburn, Ed Coan, Hermann Goerner, Jón Páll Sigmarsson, and the other old gods of the platform.

**Aesthetic:** Vitruvian Man meets Encarta '96 — Renaissance anatomical plates, parchment, antique
gold, deep military greens, beveled 90s chrome, and CRT scanlines.

## Features

- **Workout logger** — mobile-first quick entry with live Epley e1RM estimates, RPE, bodyweight,
  notes, and custom lifts. PRs are detected automatically.
- **The Codex of Iron** — **142 achievements** across 11 chapters (Squat, Bench, Deadlift, Press,
  Total Dominance, Pound-for-Pound, Repetition Feats, Dedication, the Golden Era, Mythic…), each
  with historic lore, rarity (Common → Legendary), tier, engraved medallion icon, XP reward, and
  per-requirement progress bars.
- **Hall of Iron** — your estimated 1RMs measured against the recorded feats of 16 legends.
- **Gamification** — XP, 99 levels, nine Iron Ranks (Iron Novice → Mythic Colossus), weekly
  training streaks, daily quotes, and weekly challenges.
- **Charts** — retro-styled cumulative e1RM progress lines (Recharts).
- **Offline-first** — with no configuration the app runs in **Forge Offline** mode
  (localStorage). Add Supabase credentials to enable accounts + cloud sync.
- **Data export** — one-click JSON (full state) and CSV (all sets).
- **PWA-friendly** — manifest, theme color, mobile bottom nav, safe-area padding.

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Zustand (persisted) · Supabase
(Auth + Postgres + RLS) · Recharts · Lucide icons · date-handling in plain ISO strings.

## Quick start (offline mode — zero config)

```bash
npm install
npm run dev
```

Open http://localhost:3000. Everything works; data lives in your browser.

## Full setup with Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run the entire contents of [`supabase/schema.sql`](supabase/schema.sql)
   (tables, RLS policies, signup trigger, storage bucket).
3. Copy `.env.example` → `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API)
   - `SUPABASE_SERVICE_ROLE_KEY` (only needed for seeding; never ship to the browser)
4. Mirror the codex into the database (optional but recommended — enables SQL analytics):
   ```bash
   npm run seed:achievements
   ```
5. (Optional) Enable the Google provider under Authentication → Providers for OAuth sign-in.
6. `npm run dev` — sign up, and your ledger syncs on every save.

**Sync model:** the browser store is the source of truth for the UI (offline-first). Mutations
write through to Supabase when signed in; on sign-in, cloud state is pulled and merged (cloud wins,
local-only sessions are kept). RLS restricts every row to its owner.

## Deploy to Vercel

1. Push this repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import the repo (framework auto-detects Next.js).
3. Add the two `NEXT_PUBLIC_SUPABASE_*` env vars in Project → Settings → Environment Variables.
4. Deploy. In Supabase, add your Vercel URL to Authentication → URL Configuration
   (Site URL + redirect URLs) so OAuth and email links return correctly.

## Project structure

```
supabase/schema.sql          # Tables + RLS + signup trigger + storage
scripts/seed-achievements.ts # Mirrors the codex into the achievements table
src/lib/codex/
  types.ts                   # Achievement, Requirement, LifterStats types
  achievements.ts            # ★ THE CODEX — 142 data-driven entries
  engine.ts                  # Pure evaluation: stats → progress/unlocks
src/lib/
  store.ts                   # Zustand persisted store; unlock/XP settlement
  sync.ts                    # Best-effort Supabase write-through + hydrate
  supabase.ts                # Browser client (null in offline mode)
  oneRm.ts                   # Epley/Brzycki, kg↔lb, formatting
  xp.ts                      # XP economy, levels, Iron Ranks
  legends.ts                 # Hall of Iron reference data
  motivation.ts              # Daily quotes + weekly challenges
src/components/              # Nav, codex cards, medallions, charts, dialogs…
src/app/                     # /, /onboarding, /dashboard, /log, /codex,
                             # /hall, /history, /settings, /login
```

## Expanding the codex

Everything is data-driven. To add achievements, edit
[`src/lib/codex/achievements.ts`](src/lib/codex/achievements.ts):

```ts
{
  id: "gold-my-new-legend",         // stable forever — unlocks key on it
  name: "The New Page",
  category: "golden-era",            // any Category from types.ts
  rarity: "epic",                    // tier + XP derive from rarity
  lifter: "Historic Name", era: "1962",
  lore: "One to three sentences of grimoire flavor.",
  iconDescription: "Art direction for a woodcut/engraving icon.",
  requirements: [lift("squat", 250), workouts(50)],  // ANDed helpers
},
```

Helpers: `lift`, `total`, `bw` (bodyweight multiple), `totalBw`, `reps` (weight×reps single set),
`workouts`, `streak` (weeks), `prs`. New requirement *types* go in `types.ts` + one `case` in
`engine.ts` — nothing else changes. Re-run `npm run seed:achievements` to mirror to Supabase.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `start` | Production build / serve |
| `npm run seed:achievements` | Upsert the codex into Supabase |

---

*"Milo did not lift the bull. He lifted the calf, every day, and the bull happened."*
