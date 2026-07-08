"use client";

/**
 * The Dueling Grounds — the Arena's primary competition surface.
 * Handles the whole duel lifecycle against real signed-up lifters:
 * roster search → declaration → accept/decline → live scores → settlement.
 * Degrades honestly: offline mode and signed-out states get clear prompts,
 * and the roster is opt-in via profiles.arena_open.
 */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Hourglass, Search, Shield, Swords, Trophy } from "lucide-react";
import { Panel, ProgressBar } from "@/components/ui";
import { useIronStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  CONSOLATION_XP,
  METRIC_LABELS,
  METRIC_LORE,
  arenaUserId,
  cancelDuel,
  declareDuel,
  duelDaysLeft,
  fetchMyDuels,
  fetchRoster,
  finalizeIfExpired,
  pushMyScore,
  respondToDuel,
  setArenaOpen,
  type ArenaLifter,
  type Duel,
  type DuelMetric,
} from "@/lib/duels";
import { cn } from "@/lib/utils";

export function DuelingGrounds() {
  const { profile, workouts, updateProfile, awardDuelXp } = useIronStore();
  const [uid, setUid] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [duels, setDuels] = useState<Duel[]>([]);
  const [roster, setRoster] = useState<ArenaLifter[]>([]);
  const [query, setQuery] = useState("");
  const [opponent, setOpponent] = useState<ArenaLifter | null>(null);
  const [metric, setMetric] = useState<DuelMetric>("volume");
  const [duration, setDuration] = useState(7);
  const [wager, setWager] = useState(250);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const loadDuels = useCallback(async () => {
    let list = await fetchMyDuels();
    // Report my score for live duels, close out any that have ended.
    let changed = false;
    for (const d of list) {
      if (d.status === "active") {
        await pushMyScore(d, workouts);
        await finalizeIfExpired(d);
        changed = true;
      }
    }
    if (changed) list = await fetchMyDuels();
    setDuels(list);
    // Settle XP exactly once per completed duel.
    const me = await arenaUserId();
    for (const d of list) {
      if (d.status === "completed" && me && (d.challengerId === me || d.opponentId === me)) {
        const amount = d.winnerId === me ? d.wagerXp : d.winnerId ? CONSOLATION_XP : Math.round(d.wagerXp / 2);
        awardDuelXp(d.id, amount);
      }
    }
  }, [workouts, awardDuelXp]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setChecked(true);
      return;
    }
    void (async () => {
      const id = await arenaUserId();
      setUid(id);
      setChecked(true);
      if (id) {
        await loadDuels();
        setRoster(await fetchRoster(""));
      }
    })();
  }, [loadDuels]);

  const search = async (q: string) => {
    setQuery(q);
    setRoster(await fetchRoster(q));
  };

  const enterRolls = async () => {
    setBusy(true);
    const ok = await setArenaOpen(true);
    if (ok) updateProfile({ arenaOpen: true });
    else setNotice("Could not reach the Arena rolls. Check your connection and the schema migration.");
    setBusy(false);
    setRoster(await fetchRoster(""));
  };

  const declare = async () => {
    if (!opponent) return;
    setBusy(true);
    const err = await declareDuel(opponent.id, metric, duration, wager);
    setNotice(err ? err : `The gauntlet is thrown at ${opponent.username}.`);
    setOpponent(null);
    await loadDuels();
    setBusy(false);
  };

  const respond = async (duel: Duel, accept: boolean) => {
    setBusy(true);
    const err = await respondToDuel(duel, accept);
    if (err) setNotice(err);
    await loadDuels();
    setBusy(false);
  };

  // ── Degraded states ────────────────────────────────────────────────────────
  if (!isSupabaseConfigured) {
    return (
      <Panel>
        <GroundsHeading />
        <p className="text-xs leading-relaxed text-parchment-400">
          The Dueling Grounds require the cloud — this deployment runs in Forge Offline mode, so
          there are no other lifters to face. Orders and contracts below work fully offline.
        </p>
      </Panel>
    );
  }
  if (checked && !uid) {
    return (
      <Panel>
        <GroundsHeading />
        <p className="text-xs leading-relaxed text-parchment-400">
          Duels are fought between named lifters. Sign in and your name goes on the rolls.
        </p>
        <Link href="/login" className="btn-gold mt-3">Sign in to duel</Link>
      </Panel>
    );
  }
  if (!checked) {
    return (
      <Panel>
        <GroundsHeading />
        <p className="text-xs uppercase tracking-[0.25em] text-parchment-500">Opening the grounds…</p>
      </Panel>
    );
  }
  if (!profile.arenaOpen) {
    return (
      <Panel>
        <GroundsHeading />
        <p className="text-xs leading-relaxed text-parchment-400">
          Your name is not yet on the Arena rolls. Enter, and other lifters can find you and throw
          the gauntlet; leave anytime from this same panel. Only your lifter name, level, and
          experience are shown — never your ledger.
        </p>
        <button className="btn-gold mt-3" onClick={enterRolls} disabled={busy}>
          <Shield size={14} /> Enter the Arena rolls
        </button>
        {notice && <p className="mt-2 text-xs text-blood-bright">{notice}</p>}
      </Panel>
    );
  }

  // ── Active grounds ─────────────────────────────────────────────────────────
  const incoming = duels.filter((d) => d.status === "pending" && d.opponentId === uid);
  const outgoing = duels.filter((d) => d.status === "pending" && d.challengerId === uid);
  const active = duels.filter((d) => d.status === "active");
  const settled = duels.filter((d) => d.status === "completed").slice(0, 5);

  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <GroundsHeading />
        <button
          className="btn-ghost px-2 py-1 text-[10px]"
          onClick={async () => {
            await setArenaOpen(false);
            updateProfile({ arenaOpen: false });
          }}
        >
          Leave the rolls
        </button>
      </div>

      {notice && <p className="mb-3 text-xs text-gold-bright">{notice}</p>}

      {/* Declare */}
      <div className="bevel rounded-sm bg-gunmetal-900 p-3">
        <p className="label">Throw the gauntlet</p>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2.5 text-parchment-500" />
          <input
            className="input pl-8"
            placeholder="Search the rolls by lifter name…"
            value={query}
            onChange={(e) => void search(e.target.value)}
          />
        </div>
        {roster.length === 0 ? (
          <p className="mt-2 text-xs italic text-parchment-500">
            The rolls are quiet — no other lifters match. The halls fill as lifters opt in.
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {roster.map((l) => (
              <button
                key={l.id}
                className={cn(
                  "rounded-sm border px-2 py-1 text-[11px]",
                  opponent?.id === l.id
                    ? "border-gold-dim bg-forge-700 text-parchment-50"
                    : "border-gunmetal-500 text-parchment-300 hover:border-parchment-500",
                )}
                onClick={() => setOpponent(opponent?.id === l.id ? null : l)}
              >
                {l.username} · {l.xp.toLocaleString()} XP
              </button>
            ))}
          </div>
        )}

        {opponent && (
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="label">Trial</label>
              <select className="input" value={metric} onChange={(e) => setMetric(e.target.value as DuelMetric)}>
                {(Object.keys(METRIC_LABELS) as DuelMetric[]).map((m) => (
                  <option key={m} value={m}>{METRIC_LABELS[m]}</option>
                ))}
              </select>
              <p className="mt-1 text-[10px] italic text-parchment-500">{METRIC_LORE[metric]}</p>
            </div>
            <div>
              <label className="label">Days</label>
              <select className="input" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                {[3, 5, 7, 14].map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Wager (XP)</label>
              <select className="input" value={wager} onChange={(e) => setWager(Number(e.target.value))}>
                {[100, 250, 500].map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <button className="btn-gold sm:col-span-4" onClick={declare} disabled={busy}>
              <Swords size={14} /> Declare the duel against {opponent.username}
            </button>
          </div>
        )}
      </div>

      {/* Incoming challenges */}
      {incoming.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="label text-gold-bright">Gauntlets thrown at you</p>
          {incoming.map((d) => (
            <div key={d.id} className="bevel flex flex-wrap items-center justify-between gap-2 rounded-sm bg-gunmetal-900 p-3">
              <div className="text-xs text-parchment-200">
                <strong className="font-serif">{d.names[d.challengerId] ?? "A lifter"}</strong> challenges you —{" "}
                {METRIC_LABELS[d.metric].toLowerCase()}, {d.durationDays} days, {d.wagerXp} XP to the victor.
              </div>
              <div className="flex gap-2">
                <button className="btn-gold px-3 py-1 text-[10px]" onClick={() => respond(d, true)} disabled={busy}>Accept</button>
                <button className="btn-ghost px-3 py-1 text-[10px]" onClick={() => respond(d, false)} disabled={busy}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Outgoing */}
      {outgoing.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="label">Awaiting an answer</p>
          {outgoing.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-gunmetal-600 p-3 text-xs text-parchment-400">
              <span className="flex items-center gap-2">
                <Hourglass size={13} /> {d.names[d.opponentId] ?? "A lifter"} considers your challenge — {METRIC_LABELS[d.metric].toLowerCase()}, {d.durationDays} days.
              </span>
              <button className="btn-ghost px-2 py-1 text-[10px]" onClick={async () => { await cancelDuel(d.id); await loadDuels(); }}>
                Withdraw
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Active duels */}
      {active.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="label text-gold-bright">Live duels</p>
          {active.map((d) => {
            const mineFirst = d.challengerId === uid;
            const myScore = mineFirst ? d.challengerScore : d.opponentScore;
            const theirScore = mineFirst ? d.opponentScore : d.challengerScore;
            const theirName = d.names[mineFirst ? d.opponentId : d.challengerId] ?? "The opponent";
            const top = Math.max(myScore, theirScore, 1);
            return (
              <div key={d.id} className="codex-card codex-card--unlocked">
                <div className="relative flex items-baseline justify-between gap-2">
                  <p className="plate-heading text-base">You vs {theirName}</p>
                  <p className="text-[10px] uppercase tracking-widest text-parchment-500">
                    {METRIC_LABELS[d.metric]} · {duelDaysLeft(d)} day{duelDaysLeft(d) === 1 ? "" : "s"} left · {d.wagerXp} XP
                  </p>
                </div>
                <div className="relative mt-2 space-y-1.5">
                  <ScoreRow label="You" score={myScore} top={top} highlight={myScore >= theirScore} />
                  <ScoreRow label={theirName} score={theirScore} top={top} highlight={theirScore > myScore} />
                </div>
                <p className="relative mt-2 text-[10px] italic text-parchment-500">
                  Scores update from each lifter&apos;s own ledger when they visit the Arena. An unwatched duel is still a duel.
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Settled */}
      {settled.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <p className="label">Settled duels</p>
          {settled.map((d) => {
            const won = d.winnerId === uid;
            const draw = !d.winnerId;
            const other = d.names[d.challengerId === uid ? d.opponentId : d.challengerId] ?? "a lifter";
            return (
              <p key={d.id} className="flex items-center gap-2 text-xs text-parchment-400">
                <Trophy size={12} className={won ? "text-gold-bright" : "text-parchment-600"} />
                {draw ? `Drew against ${other}` : won ? `Defeated ${other}` : `Fell to ${other}`} —{" "}
                {METRIC_LABELS[d.metric].toLowerCase()} · +{draw ? Math.round(d.wagerXp / 2) : won ? d.wagerXp : CONSOLATION_XP} XP
              </p>
            );
          })}
        </div>
      )}

      {incoming.length + outgoing.length + active.length + settled.length === 0 && (
        <p className="mt-4 text-center text-xs italic text-parchment-500">
          No duels yet. Pick a name from the rolls and throw the first gauntlet.
        </p>
      )}
    </Panel>
  );
}

function GroundsHeading() {
  return (
    <div className="mb-3">
      <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dim">
        <Swords size={12} /> The Dueling Grounds
      </p>
      <h2 className="plate-heading text-xl">Name Your Rival</h2>
      <p className="mt-0.5 text-xs text-parchment-400">
        Two lifters, one trial, a fixed number of days. The ledgers keep score; the victor takes the wager.
      </p>
    </div>
  );
}

function ScoreRow({ label, score, top, highlight }: { label: string; score: number; top: number; highlight: boolean }) {
  return (
    <div>
      <div className="flex justify-between text-[11px]">
        <span className={highlight ? "text-gold-bright" : "text-parchment-300"}>{label}</span>
        <span className="tabular-nums text-parchment-300">{score.toLocaleString()}</span>
      </div>
      <ProgressBar fraction={score / top} />
    </div>
  );
}
