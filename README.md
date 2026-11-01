# ⚒️ Iron Milestones — The Codex of Iron

A gamified strength-training tracker that turns squat, bench, and deadlift progress into an epic
journey through the true history of the iron game. Log your lifts and unlock the recorded deeds of
Reg Park, Doug Hepburn, Ed Coan, Hermann Goerner, Katie Sandwina, Jón Páll Sigmarsson, and the
other old gods of the platform.

**The look:** Vitruvian Man meets Encarta '96 — Renaissance anatomical plates, parchment and
antique gold on deep military green, beveled 90s chrome, CRT scanlines, engraved medallions.

## What it does

- **The Codex of Iron** — 142 achievements across 11 chapters (the lift ladders, Total Dominance,
  Pound-for-Pound, Repetition Feats, Dedication, the Golden Era, Mythic). Each page carries
  historic lore, a rarity from Common to Legendary, an XP reward, and live progress bars. Unlocks
  are ceremonies, not toasts.
- **Fast workout logging** — mobile-first entry with live Epley 1RM estimates, RPE, bodyweight,
  notes, custom lifts, and automatic PR detection.
- **A real progression system** — XP for sessions, PRs, and unlocks; 99 levels; nine Iron Ranks
  from *Iron Novice* to *Mythic Colossus*, each with its motto. The full ladder lives on the
  Ranks page.
- **The Hall of Iron** — your estimated 1RMs measured plaque-by-plaque against sixteen legends.
- **The rhythm of training** — weekly streaks, a daily quote from a 64-entry roster, and a weekly
  challenge (same for everyone — suffer together).
- **Forge Orders & Iron Contracts** — rotating daily/weekly training prompts and harder optional
  contracts that can be claimed, progressed, and completed for XP. They are meant to keep users
  engaged with useful work — logging, consistency, rows, mobility, notes, volume — while leaving
  competition optional.
- **The Arena** — real head-to-head duels: challenge another signed-up lifter to a multi-day
  trial (volume moved, sets logged, or training days), watch live scores, and take the XP wager.
  The roster is opt-in, the orders board keeps solo work flowing, and simulated sparring ghosts
  fill the gap while the halls fill.
- **Your data, everywhere and nowhere** — offline-first in the browser with zero configuration;
  optional Supabase accounts with full two-way sync across devices; one-click JSON/CSV export.
  Displays in kg or lb, your choice.

## The journey

1. **Take the oath** — onboarding records your name, bodyweight, and current bests; the codex
   immediately honors every page you've already earned.
2. **Log sessions** — each one writes to the ledger, awards XP, and checks all 142 pages.
3. **Chase the pages** — the codex sorts locked achievements by how close you are; the dashboard
   surfaces your next unlocks.
4. **Claim Forge Orders** — on low-motivation days, take a small useful order from the board and
   get paid in XP for doing work that still serves training.
5. **Climb the ladder** — levels, ranks, streaks, and the Hall of Iron give the long arc.

## Tech

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Zustand · Supabase (Auth + Postgres + RLS)
· Recharts · Lucide. The achievement system is pure data + a pure evaluation engine — adding an
achievement is adding one object to one file.

Forge Orders and Iron Contracts follow the same pattern: canonical definitions live in
`src/lib/orders.ts`, while per-user claim/completion state syncs through Supabase in
`public.user_orders`.

## Alpha

This is a community alpha. The app runs with no setup at all: leave the Supabase variables unset
and it keeps the ledger in this browser (Forge Offline). Accounts, the Arena, and cross-device
sync need a Supabase project. Nothing in CI applies SQL — you run it by hand.

### 1. Database

In the Supabase SQL editor:

- **New project:** paste and run [`supabase/schema.sql`](supabase/schema.sql).
- **Project that already ran an older schema:** run
  [`supabase/migrations/20261031120000_security_hardening.sql`](supabase/migrations/20261031120000_security_hardening.sql)
  instead. It is idempotent. Re-running the full `schema.sql` is also safe.

### 2. Auth URLs

Authentication → URL configuration:

- **Site URL:** the origin people actually use. For a Vercel alpha that is
  `https://<your-project>.vercel.app`. Use `http://localhost:3000` while you are only developing
  locally.
- **Redirect URLs:** add every origin the app may return to, including the path Google sign-in
  asks for (`/dashboard`):
  - `http://localhost:3000/**`
  - `https://<your-project>.vercel.app/**`

Email links use the Site URL. Google sign-in sends the browser to
`<origin>/dashboard`, and that origin has to be on the allow list or Supabase rejects it.

### 3. Environment variables

Copy [`.env.example`](.env.example) to `.env.local` for `npm run dev`. On Vercel, set the same
public variables in Project Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Never set `SUPABASE_SERVICE_ROLE_KEY` on Vercel**, and never put it in a `NEXT_PUBLIC_`
variable. That key bypasses row level security. It belongs only in `.env.local`, for
`npm run seed:achievements` and `npm run arena:warden`.

The app needs Node.js 22 (`engines` is `22.x`).

```bash
npm ci
npm run dev
```

CI on pull requests runs `npm ci`, `npx tsc --noEmit`, `npm run lint`, `npm test`, and
`npm run build`.

## Try it

With no `.env.local`, `npm run dev` opens Forge Offline. Log a session, open the codex, and
export the ledger from Settings. Cloud sign-in and the Dueling Grounds stay off until the
variables above are set.
