-- ═══════════════════════════════════════════════════════════════════════════
-- IRON MILESTONES — Supabase schema
-- Run this in the Supabase SQL editor (or `supabase db push`) once per project.
-- Every user-owned table is protected by Row Level Security.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Profiles ────────────────────────────────────────────────────────────────
-- One row per auth user. Created automatically by the trigger below.
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  username      text unique,
  bodyweight_kg numeric(6, 2),
  experience    text check (experience in ('novice', 'intermediate', 'advanced', 'elite')),
  unit          text not null default 'kg' check (unit in ('kg', 'lb')),
  xp            integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create a profile when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Lifts ───────────────────────────────────────────────────────────────────
-- The lift catalogue. Core lifts (squat/bench/deadlift/ohp/row) are global
-- (user_id null); users may add custom lifts.
create table if not exists public.lifts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users (id) on delete cascade, -- null = global
  slug       text not null,
  name       text not null,
  created_at timestamptz not null default now(),
  unique (user_id, slug)
);

alter table public.lifts enable row level security;

create policy "Anyone can view global lifts, users their own"
  on public.lifts for select using (user_id is null or auth.uid() = user_id);
create policy "Users can insert own lifts"
  on public.lifts for insert with check (auth.uid() = user_id);
create policy "Users can delete own lifts"
  on public.lifts for delete using (auth.uid() = user_id);

insert into public.lifts (user_id, slug, name) values
  (null, 'squat',    'Back Squat'),
  (null, 'bench',    'Bench Press'),
  (null, 'deadlift', 'Deadlift'),
  (null, 'ohp',      'Overhead Press'),
  (null, 'row',      'Barbell Row')
on conflict do nothing;

-- ── Workouts & sets ─────────────────────────────────────────────────────────
create table if not exists public.workouts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  performed_on  date not null default current_date,
  bodyweight_kg numeric(6, 2),
  notes         text,
  created_at    timestamptz not null default now()
);

create index if not exists workouts_user_date_idx on public.workouts (user_id, performed_on desc);

alter table public.workouts enable row level security;

create policy "Users own their workouts (select)"
  on public.workouts for select using (auth.uid() = user_id);
create policy "Users own their workouts (insert)"
  on public.workouts for insert with check (auth.uid() = user_id);
create policy "Users own their workouts (update)"
  on public.workouts for update using (auth.uid() = user_id);
create policy "Users own their workouts (delete)"
  on public.workouts for delete using (auth.uid() = user_id);

create table if not exists public.workout_sets (
  id         uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  lift_slug  text not null,
  weight_kg  numeric(6, 2) not null check (weight_kg >= 0),
  reps       integer not null check (reps > 0),
  rpe        numeric(3, 1) check (rpe between 1 and 10),
  set_order  integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists workout_sets_user_lift_idx on public.workout_sets (user_id, lift_slug);

alter table public.workout_sets enable row level security;

create policy "Users own their sets (select)"
  on public.workout_sets for select using (auth.uid() = user_id);
create policy "Users own their sets (insert)"
  on public.workout_sets for insert with check (auth.uid() = user_id);
create policy "Users own their sets (update)"
  on public.workout_sets for update using (auth.uid() = user_id);
create policy "Users own their sets (delete)"
  on public.workout_sets for delete using (auth.uid() = user_id);

-- ── Achievements codex ──────────────────────────────────────────────────────
-- The canonical codex lives in src/lib/codex/achievements.ts (single source of
-- truth so unlock logic and content never drift). This table mirrors it for
-- querying/analytics and is populated by `npm run seed:achievements`.
create table if not exists public.achievements (
  id               text primary key,
  name             text not null,
  category         text not null,
  tier             text not null,
  rarity           text not null,
  lifter           text,
  era              text,
  lore             text not null,
  icon_description text not null,
  requirements     jsonb not null,
  xp               integer not null default 0
);

alter table public.achievements enable row level security;

create policy "Achievements are public"
  on public.achievements for select using (true);

-- ── User achievements (unlocks) ─────────────────────────────────────────────
create table if not exists public.user_achievements (
  user_id        uuid not null references auth.users (id) on delete cascade,
  achievement_id text not null,
  unlocked_at    timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

create policy "Users own their unlocks (select)"
  on public.user_achievements for select using (auth.uid() = user_id);
create policy "Users own their unlocks (insert)"
  on public.user_achievements for insert with check (auth.uid() = user_id);

-- ── Forge Orders & Iron Contracts ──────────────────────────────────────────
-- Canonical order/contract definitions live in src/lib/orders.ts. This table
-- stores only each user's claimed/completed state so the system syncs cleanly.
create table if not exists public.user_orders (
  user_id         uuid not null references auth.users (id) on delete cascade,
  order_id        text not null,
  period_key      text not null,
  kind            text not null check (kind in ('daily', 'weekly', 'contract')),
  status          text not null check (status in ('claimed', 'completed', 'expired')),
  claimed_at      timestamptz not null default now(),
  completed_at    timestamptz,
  expires_at      timestamptz not null,
  xp_awarded      integer not null default 0 check (xp_awarded >= 0),
  manual_progress jsonb not null default '{}'::jsonb,
  updated_at      timestamptz not null default now(),
  primary key (user_id, order_id, period_key)
);

create index if not exists user_orders_user_period_idx
  on public.user_orders (user_id, period_key);

alter table public.user_orders enable row level security;

create policy "Users own their orders (select)"
  on public.user_orders for select using (auth.uid() = user_id);
create policy "Users own their orders (insert)"
  on public.user_orders for insert with check (auth.uid() = user_id);
create policy "Users own their orders (update)"
  on public.user_orders for update using (auth.uid() = user_id);

-- ── Storage: avatars & lift photos ──────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

create policy "Avatar images are publicly readable"
  on storage.objects for select using (bucket_id = 'avatars');
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
