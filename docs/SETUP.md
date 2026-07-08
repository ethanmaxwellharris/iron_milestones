# Setup & Deployment Guide

Everything operational: local dev, Supabase, seeding, and Vercel. The app is
offline-first — every step below is optional except `npm install` + `npm run dev`.

## Local development (offline mode — zero config)

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no configuration the app runs in **Forge
Offline** mode: all data persists in the browser's localStorage. Accounts and
cross-device sync are simply disabled.

## Supabase (accounts + cloud sync)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run the entire contents of [`supabase/schema.sql`](../supabase/schema.sql)
   — tables, RLS policies, signup trigger, storage bucket.
3. Copy `.env.example` → `.env.local` and fill in from Project Settings → API:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (secret key — only used by the seed script; never ship it)
4. Mirror the achievement codex into the database (enables SQL analytics over unlocks):
   ```bash
   npm run seed:achievements
   ```
   Idempotent — re-run whenever you add entries to `src/lib/codex/achievements.ts`.

### Sync model

The browser store is the source of truth for the UI (offline-first). When
signed in, every mutation writes through to Supabase; on sign-in the app does a
full two-way sync (cloud wins, local-only sessions are kept, missing history is
uploaded). RLS restricts every row to its owner.

### Google OAuth (optional)

1. Google Cloud Console → OAuth consent screen: set app name/logo (External type).
2. Credentials → Create OAuth client ID (Web application). Authorized redirect URI:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. Supabase → Authentication → Providers → Google: enable, paste Client ID + secret.

Email + password auth works with no extra setup.

## Deploy to Vercel

1. Push the repo to GitHub and import it at [vercel.com/new](https://vercel.com/new)
   (framework is pinned by `vercel.json`).
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` under
   Project → Settings → Environment Variables. Do **not** add the service-role key.
3. In Supabase → Authentication → URL Configuration set:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**` and `http://localhost:3000/**`

## Arena duels & the Forge Warden

Duels are head-to-head contests between two signed-up lifters on an objective metric
(volume / sets / training days) over a set window. Requirements:

- The latest `supabase/schema.sql` applied (adds `profiles.arena_open` and the `duels` table).
- Both lifters signed in and opted into the Arena rolls (a toggle on `/arena`).

Scores are self-reported from each lifter's own ledger when they visit the Arena (v1 is
honor-system, like a gym bet). The winner takes the XP wager; the loser collects a small
consolation; draws split the wager.

**Testing without real users:** seed the house opponent —

```bash
npm run arena:warden
```

This creates "The Forge Warden" (an arena-open test account) using the service-role key. Throw a
gauntlet at the Warden from `/arena`, then re-run the command to make the Warden accept and post
scores; each run plays one Warden turn.

## Expanding the codex

Achievements are pure data in [`src/lib/codex/achievements.ts`](../src/lib/codex/achievements.ts):

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

Requirement helpers: `lift`, `total`, `bw` (bodyweight multiple), `totalBw`,
`reps` (weight × reps in one set), `workouts`, `streak` (weeks), `prs`.
New requirement *types* need a variant in `types.ts` plus one `case` in
`engine.ts` — nothing else changes. Re-run the seed to mirror to Supabase.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run seed:achievements` | Upsert the codex into Supabase |
