-- ═══════════════════════════════════════════════════════════════════════════
-- Iron Milestones — security hardening
--
-- Apply this by hand in the Supabase SQL editor. schema.sql is the full
-- picture for a new project; this file upgrades a database that already ran
-- the previous schema. It is idempotent — safe to re-run.
--
-- After it succeeds, the API schema reloads on its own. If an RPC 404s,
-- use Dashboard → Settings → API → Reload schema.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Profiles: display name, collision-safe username, locked xp ─────────────

alter table public.profiles
  add column if not exists display_name text;

update public.profiles
set display_name = username
where display_name is null
  and username is not null;

-- Picks username, username-1, username-2, … Never raises on a collision.
create or replace function public.allocate_username(base text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  cleaned text;
  candidate text;
  n int := 0;
begin
  cleaned := lower(coalesce(base, ''));
  cleaned := regexp_replace(cleaned, '[^a-z0-9]+', '-', 'g');
  cleaned := btrim(cleaned, '-');
  if cleaned is null or cleaned = '' then
    cleaned := 'lifter';
  end if;
  cleaned := left(cleaned, 24);

  loop
    candidate := case when n = 0 then cleaned else cleaned || '-' || n::text end;
    exit when not exists (select 1 from public.profiles where username = candidate);
    n := n + 1;
    if n > 1000 then
      return cleaned || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
    end if;
  end loop;

  return candidate;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base text;
  display text;
  attempt int := 0;
begin
  base := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'username'), ''),
    split_part(coalesce(new.email, ''), '@', 1)
  );
  display := left(coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'username'), ''),
    nullif(btrim(split_part(coalesce(new.email, ''), '@', 1)), ''),
    'Lifter'
  ), 80);

  loop
    begin
      insert into public.profiles (id, username, display_name)
      values (new.id, public.allocate_username(base), display);
      exit;
    exception
      when unique_violation then
        attempt := attempt + 1;
        if attempt >= 5 then
          raise;
        end if;
    end;
  end loop;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Invoker on purpose. current_user is the role that issued the statement,
-- so a direct update from `authenticated` is rejected, while a security
-- definer function owned by postgres (and the service role) still can write.
create or replace function public.guard_profile_sensitive_columns()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  privileged boolean := current_user in ('postgres', 'supabase_admin', 'service_role');
begin
  if tg_op = 'INSERT' then
    if not privileged then
      new.xp := 0;
      new.username := 'lifter-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
    end if;
    return new;
  end if;

  if not privileged then
    if new.xp is distinct from old.xp then
      raise exception 'Direct xp updates are not allowed';
    end if;
    if new.username is distinct from old.username then
      raise exception 'Username cannot be changed directly';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_sensitive_columns on public.profiles;
create trigger profiles_guard_sensitive_columns
  before insert or update on public.profiles
  for each row execute function public.guard_profile_sensitive_columns();

-- Upper bound for a lifter's XP, from rows the server already stores.
-- Workout and duel math match the client. PR credit is an upper bound
-- (at most one PR per lift per workout). Achievement XP uses the catalog
-- when it is seeded, otherwise 1000. Order XP trusts xp_awarded up to 1000.
create or replace function public.xp_ceiling(p_user uuid)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  workout_xp bigint := 0;
  pr_xp bigint := 0;
  achievement_xp bigint := 0;
  order_xp bigint := 0;
  duel_xp bigint := 0;
  total bigint;
begin
  select coalesce(sum(least(30 + set_count * 5, 90)), 0)
    into workout_xp
  from (
    select w.id, count(s.id)::int as set_count
    from public.workouts w
    left join public.workout_sets s on s.workout_id = w.id
    where w.user_id = p_user
    group by w.id
  ) t;

  select coalesce(sum(lift_count * 40), 0)
    into pr_xp
  from (
    select w.id, count(distinct s.lift_slug)::int as lift_count
    from public.workouts w
    join public.workout_sets s on s.workout_id = w.id
    where w.user_id = p_user
      and s.weight_kg > 0
      and s.reps > 0
    group by w.id
  ) t;

  select coalesce(sum(case when a.xp is not null then a.xp else 1000 end), 0)
    into achievement_xp
  from public.user_achievements ua
  left join public.achievements a on a.id = ua.achievement_id
  where ua.user_id = p_user;

  select coalesce(sum(least(greatest(uo.xp_awarded, 0), 1000)), 0)
    into order_xp
  from public.user_orders uo
  where uo.user_id = p_user
    and uo.status = 'completed';

  select coalesce(sum(
    case
      when d.winner_id = p_user then d.wager_xp
      when d.winner_id is null then round(d.wager_xp / 2.0)::int
      else 50
    end
  ), 0)
    into duel_xp
  from public.duels d
  where d.status = 'completed'
    and p_user in (d.challenger_id, d.opponent_id);

  total := workout_xp + pr_xp + achievement_xp + order_xp + duel_xp;
  if total > 2147483647 then
    total := 2147483647;
  end if;
  return total::int;
end;
$$;

-- Sets xp for the signed-in lifter. Never raises stored xp above the ceiling.
-- Does not lower an existing value (a pre-migration hand edit stays put;
-- correct that with a privileged update if you need to).
create or replace function public.sync_my_xp(p_xp integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  ceiling integer;
  current_xp integer;
  applied integer;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  if p_xp is null or p_xp < 0 then
    raise exception 'XP must be zero or greater';
  end if;

  select xp into current_xp from public.profiles where id = uid;
  if not found then
    raise exception 'Profile not found';
  end if;

  ceiling := public.xp_ceiling(uid);
  applied := least(p_xp, ceiling);
  if current_xp > applied then
    applied := current_xp;
  end if;

  update public.profiles
  set xp = applied,
      updated_at = now()
  where id = uid;

  return applied;
end;
$$;

-- Arena roster: opt-in lifters, public columns only.
-- Runs as the view owner (security_invoker stays false) so it can read
-- profiles after the broad SELECT policy is gone, but it never projects
-- bodyweight or other private columns.
drop policy if exists "Arena-open profiles are visible to lifters" on public.profiles;

create or replace view public.arena_roster as
select
  p.id,
  p.username,
  coalesce(nullif(btrim(p.display_name), ''), p.username) as display_name,
  p.xp,
  p.experience
from public.profiles p
where p.arena_open = true;

alter view public.arena_roster set (security_invoker = false);

-- Names for duel participants who may have left the rolls.
create or replace function public.duel_lifter_names(p_ids uuid[])
returns table (id uuid, username text, display_name text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.username, p.display_name
  from public.profiles p
  where p_ids is not null
    and p.id = any(p_ids)
    and (
      p.id = auth.uid()
      or p.arena_open
      or exists (
        select 1
        from public.duels d
        where auth.uid() in (d.challenger_id, d.opponent_id)
          and p.id in (d.challenger_id, d.opponent_id)
      )
    );
$$;

-- ── Duels: no direct insert or update ───────────────────────────────────────

drop policy if exists "Challengers declare duels" on public.duels;
drop policy if exists "Participants update their duels" on public.duels;

create or replace function public.create_duel(
  p_opponent_id uuid,
  p_metric text,
  p_duration_days integer,
  p_wager_xp integer
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  new_id uuid;
begin
  if uid is null then
    raise exception 'Sign in to declare a duel.';
  end if;
  if p_opponent_id is null or p_opponent_id = uid then
    raise exception 'You cannot duel yourself.';
  end if;
  if p_metric not in ('volume', 'sets', 'trained-days') then
    raise exception 'Unknown duel metric.';
  end if;
  if p_duration_days is null or p_duration_days < 3 or p_duration_days > 30 then
    raise exception 'Duel length must be between 3 and 30 days.';
  end if;
  if p_wager_xp is null or p_wager_xp < 50 or p_wager_xp > 1000 then
    raise exception 'Wager must be between 50 and 1000 XP.';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = p_opponent_id and arena_open
  ) then
    raise exception 'That lifter is not on the Arena rolls.';
  end if;

  insert into public.duels (
    challenger_id, opponent_id, metric, status, wager_xp, duration_days,
    challenger_score, opponent_score, winner_id, starts_at, ends_at
  ) values (
    uid, p_opponent_id, p_metric, 'pending', p_wager_xp, p_duration_days,
    0, 0, null, null, null
  )
  returning id into new_id;

  return new_id;
end;
$$;

create or replace function public.accept_duel(p_duel_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  duel public.duels%rowtype;
begin
  if uid is null then
    raise exception 'Sign in first.';
  end if;

  select * into duel from public.duels where id = p_duel_id for update;
  if not found then
    raise exception 'Duel not found.';
  end if;
  if duel.opponent_id <> uid then
    raise exception 'Only the challenged lifter can accept.';
  end if;
  if duel.status <> 'pending' then
    raise exception 'This duel is no longer pending.';
  end if;

  update public.duels
  set status = 'active',
      starts_at = now(),
      ends_at = now() + (duel.duration_days * interval '1 day')
  where id = duel.id;
end;
$$;

create or replace function public.decline_duel(p_duel_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  duel public.duels%rowtype;
begin
  if uid is null then
    raise exception 'Sign in first.';
  end if;

  select * into duel from public.duels where id = p_duel_id for update;
  if not found then
    raise exception 'Duel not found.';
  end if;
  if duel.opponent_id <> uid then
    raise exception 'Only the challenged lifter can decline.';
  end if;
  if duel.status <> 'pending' then
    raise exception 'This duel is no longer pending.';
  end if;

  update public.duels set status = 'declined' where id = duel.id;
end;
$$;

create or replace function public.cancel_duel(p_duel_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  duel public.duels%rowtype;
begin
  if uid is null then
    raise exception 'Sign in first.';
  end if;

  select * into duel from public.duels where id = p_duel_id for update;
  if not found then
    raise exception 'Duel not found.';
  end if;
  if duel.challenger_id <> uid then
    raise exception 'Only the challenger can withdraw.';
  end if;
  if duel.status <> 'pending' then
    raise exception 'This duel is no longer pending.';
  end if;

  update public.duels set status = 'cancelled' where id = duel.id;
end;
$$;

create or replace function public.report_duel_score(p_duel_id uuid, p_score numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  duel public.duels%rowtype;
begin
  if uid is null then
    raise exception 'Sign in first.';
  end if;
  if p_score is null or p_score < 0 then
    raise exception 'Score cannot be negative.';
  end if;

  select * into duel from public.duels where id = p_duel_id for update;
  if not found then
    raise exception 'Duel not found.';
  end if;
  if uid not in (duel.challenger_id, duel.opponent_id) then
    raise exception 'You are not in this duel.';
  end if;
  if duel.status <> 'active' then
    raise exception 'Scores can only be reported on an active duel.';
  end if;
  if duel.ends_at is null or now() >= duel.ends_at then
    raise exception 'The duel window has closed.';
  end if;

  if uid = duel.challenger_id then
    update public.duels set challenger_score = p_score where id = duel.id;
  else
    update public.duels set opponent_score = p_score where id = duel.id;
  end if;
end;
$$;

create or replace function public.finalize_duel(p_duel_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  duel public.duels%rowtype;
  winner uuid;
begin
  if uid is null then
    raise exception 'Sign in first.';
  end if;

  select * into duel from public.duels where id = p_duel_id for update;
  if not found then
    raise exception 'Duel not found.';
  end if;
  if uid not in (duel.challenger_id, duel.opponent_id) then
    raise exception 'You are not in this duel.';
  end if;
  if duel.status = 'completed' then
    return;
  end if;
  if duel.status <> 'active' then
    raise exception 'Only an active duel can be finalized.';
  end if;
  if duel.ends_at is null or now() < duel.ends_at then
    raise exception 'This duel is still in progress.';
  end if;

  if duel.challenger_score > duel.opponent_score then
    winner := duel.challenger_id;
  elsif duel.opponent_score > duel.challenger_score then
    winner := duel.opponent_id;
  else
    winner := null;
  end if;

  update public.duels
  set status = 'completed',
      winner_id = winner
  where id = duel.id;
end;
$$;

-- ── Workouts: parent ownership, one-transaction save ───────────────────────

drop policy if exists "Users own their sets (insert)" on public.workout_sets;
create policy "Users own their sets (insert)"
  on public.workout_sets for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

drop policy if exists "Users own their sets (update)" on public.workout_sets;
create policy "Users own their sets (update)"
  on public.workout_sets for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

create or replace function public.save_workout(
  p_id uuid,
  p_performed_on date,
  p_bodyweight_kg numeric,
  p_notes text,
  p_sets jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  if p_id is null then
    raise exception 'Workout id required';
  end if;
  if p_sets is not null and jsonb_typeof(p_sets) <> 'array' then
    raise exception 'Sets must be a list';
  end if;
  if exists (
    select 1
    from jsonb_to_recordset(coalesce(p_sets, '[]'::jsonb)) as s(
      lift_slug text,
      weight_kg numeric,
      reps integer,
      rpe numeric,
      set_order integer
    )
    where s.lift_slug is null
       or btrim(s.lift_slug) = ''
       or s.weight_kg is null
       or s.weight_kg < 0
       or s.reps is null
       or s.reps <= 0
       or (s.rpe is not null and (s.rpe < 1 or s.rpe > 10))
  ) then
    raise exception 'Each set needs a lift, a non-negative weight, and at least one rep';
  end if;

  insert into public.workouts (id, user_id, performed_on, bodyweight_kg, notes)
  values (p_id, uid, coalesce(p_performed_on, current_date), p_bodyweight_kg, nullif(p_notes, ''))
  on conflict (id) do update
    set performed_on = excluded.performed_on,
        bodyweight_kg = excluded.bodyweight_kg,
        notes = excluded.notes
    where public.workouts.user_id = uid;

  if not exists (select 1 from public.workouts where id = p_id and user_id = uid) then
    raise exception 'Workout not found or not owned';
  end if;

  delete from public.workout_sets where workout_id = p_id and user_id = uid;

  insert into public.workout_sets (workout_id, user_id, lift_slug, weight_kg, reps, rpe, set_order)
  select
    p_id,
    uid,
    s.lift_slug,
    s.weight_kg,
    s.reps,
    s.rpe,
    coalesce(s.set_order, 0)
  from jsonb_to_recordset(coalesce(p_sets, '[]'::jsonb)) as s(
    lift_slug text,
    weight_kg numeric,
    reps integer,
    rpe numeric,
    set_order integer
  );
end;
$$;

-- ── Grants ──────────────────────────────────────────────────────────────────
-- Supabase grants wide table privileges by default. Take back the columns
-- and statements the client must not touch. service_role keeps its own
-- grants so local admin scripts (the Forge Warden) still run.

revoke update on table public.profiles from public, anon, authenticated;
grant select, insert on table public.profiles to authenticated;
grant update (
  display_name,
  bodyweight_kg,
  experience,
  unit,
  arena_open,
  updated_at
) on table public.profiles to authenticated;

revoke all on table public.duels from public, anon, authenticated;
grant select on table public.duels to authenticated;

revoke all on table public.arena_roster from public, anon;
grant select on table public.arena_roster to authenticated;

revoke all on function public.allocate_username(text) from public, anon, authenticated;
revoke all on function public.guard_profile_sensitive_columns() from public, anon, authenticated;
revoke all on function public.xp_ceiling(uuid) from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

revoke all on function public.sync_my_xp(integer) from public, anon;
grant execute on function public.sync_my_xp(integer) to authenticated;

revoke all on function public.duel_lifter_names(uuid[]) from public, anon;
grant execute on function public.duel_lifter_names(uuid[]) to authenticated;

revoke all on function public.create_duel(uuid, text, integer, integer) from public, anon;
grant execute on function public.create_duel(uuid, text, integer, integer) to authenticated;

revoke all on function public.accept_duel(uuid) from public, anon;
grant execute on function public.accept_duel(uuid) to authenticated;

revoke all on function public.decline_duel(uuid) from public, anon;
grant execute on function public.decline_duel(uuid) to authenticated;

revoke all on function public.cancel_duel(uuid) from public, anon;
grant execute on function public.cancel_duel(uuid) to authenticated;

revoke all on function public.report_duel_score(uuid, numeric) from public, anon;
grant execute on function public.report_duel_score(uuid, numeric) to authenticated;

revoke all on function public.finalize_duel(uuid) from public, anon;
grant execute on function public.finalize_duel(uuid) to authenticated;

revoke all on function public.save_workout(uuid, date, numeric, text, jsonb) from public, anon;
grant execute on function public.save_workout(uuid, date, numeric, text, jsonb) to authenticated;
