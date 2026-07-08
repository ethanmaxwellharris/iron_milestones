# Forge Orders and Iron Contracts Handoff

## What changed

This branch adds a solo-first engagement system to Iron Milestones:

- **Forge Orders**: rotating daily and weekly training prompts that users can claim, progress, and complete for XP.
- **Iron Contracts**: harder optional challenges with larger XP rewards.
- **Arena page**: reframed from competition-first to an orders/contracts board, with optional competition shown as a secondary area.
- **Dashboard panel**: compact "Today's Forge Orders" section so the daily habit loop is visible without replacing workout logging.
- **Supabase sync**: claimed/completed order state syncs through a new `user_orders` table, while definitions remain in app code.

The product intent is practical training guidance in game-language clothing. Orders should nudge useful work: logging, consistency, rows, mobility, notes, volume, and occasional careful heavier work. They should not become a slot-machine chore list or push frequent max attempts.

## Key files

- `src/lib/orders.ts`
  - Canonical Forge Order and Iron Contract definitions.
  - Stable daily/weekly generation.
  - Progress evaluation against workouts and manual progress.
  - Safety gating for heavy contracts.

- `src/components/orders.tsx`
  - Reusable order card UI.
  - Claim, manual increment, completion, reward, expired, and completed states.

- `src/app/arena/page.tsx`
  - Full orders board with Daily, Weekly, and Contracts tabs.
  - Optional competition ledger moved lower on the page.

- `src/app/dashboard/page.tsx`
  - Compact daily Forge Orders panel.

- `src/lib/store.ts`
  - Adds `orderStates`.
  - Adds `claimOrder`, `setManualOrderProgress`, and `completeOrder`.
  - Awards order XP once and syncs profile XP afterward.

- `src/lib/sync.ts`
  - Adds `pushOrderState`.
  - Hydrates order state from Supabase.
  - Includes order state in full local push after sign-in.

- `supabase/schema.sql`
  - Adds `public.user_orders` with Row Level Security.

## Supabase notes

Order definitions intentionally live in code, similar to achievements. Supabase stores only per-user state:

- `order_id`
- `period_key`
- `kind`
- `status`
- `claimed_at`
- `completed_at`
- `expires_at`
- `xp_awarded`
- `manual_progress`

Before cloud sync works for orders, run the updated `supabase/schema.sql` in Supabase SQL Editor or push the schema through the Supabase CLI. Until then, order state still works locally through Zustand persistence.

## Current behavior

- Daily Forge Orders rotate by date and user experience.
- Weekly Forge Orders rotate by ISO week and user experience.
- Iron Contracts rotate weekly.
- Heavy Iron Contracts are conservative: the squat-heavy contract only appears for advanced/elite users with recent squat history.
- Manual orders, like pushups or mobility, use manual progress buttons.
- Workout-derived orders update from logged workouts.
- Completing an order awards XP once.
- Supabase failures are best-effort and non-blocking, matching the rest of the app.

## Follow-up ideas

- Add toast/ceremony feedback when an order is completed.
- Add direct numeric input for manual orders instead of only `+1` and `+5`.
- Add more personalized order pools by experience, recent lift frequency, and weak-point trends.
- Add a "dismiss/swap order" mechanic if an order is not appropriate that day.
- Add analytics or admin-editable order definitions later only if the content grows beyond code-owned data.
- Decide whether old completed orders should appear in a history view.

## Verification performed

- `npm run build` passed.
- Local `/arena` route returned `200`.
