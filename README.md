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
- **Your data, everywhere and nowhere** — offline-first in the browser with zero configuration;
  optional Supabase accounts with full two-way sync across devices; one-click JSON/CSV export.
  Displays in kg or lb, your choice.

## The journey

1. **Take the oath** — onboarding records your name, bodyweight, and current bests; the codex
   immediately honors every page you've already earned.
2. **Log sessions** — each one writes to the ledger, awards XP, and checks all 142 pages.
3. **Chase the pages** — the codex sorts locked achievements by how close you are; the dashboard
   surfaces your next unlocks.
4. **Climb the ladder** — levels, ranks, streaks, and the Hall of Iron give the long arc.

## Tech

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Zustand · Supabase (Auth + Postgres + RLS)
· Recharts · Lucide. The achievement system is pure data + a pure evaluation engine — adding an
achievement is adding one object to one file.

## Try it

```bash
npm install && npm run dev
```

That's the whole quick start — no accounts, no keys, data lives in your browser.

For Supabase accounts/sync, Google OAuth, Vercel deployment, seeding the codex into Postgres, and
how to add achievements, see **[docs/SETUP.md](docs/SETUP.md)**.

---

*"Milo did not lift the bull. He lifted the calf, every day, and the bull happened."*
