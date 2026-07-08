"use client";

import { useMemo, useState } from "react";
import { AppNav } from "@/components/nav";
import { Panel, SectionTitle, Stat } from "@/components/ui";
import { OrderCard } from "@/components/orders";
import { useIronStore, selectStats, type Workout } from "@/lib/store";
import { activeOrders, getGeneratedOrders } from "@/lib/orders";
import { formatWeight } from "@/lib/oneRm";
import { cn } from "@/lib/utils";
import { Flame, Medal, Shield, Swords, Trophy } from "lucide-react";

type BoardTab = "daily" | "weekly" | "contract";

const MOCK_RIVALS = [
  { name: "Mara Voss", rank: "Candlelit Journeyman", bias: 1.18, streak: 9, note: "volume specialist" },
  { name: "Tobin Vale", rank: "Chalk Squire", bias: 1.09, streak: 6, note: "late-night grinder" },
  { name: "You", rank: "Current Campaign", bias: 1, streak: 0, note: "live ledger" },
  { name: "Inez Hart", rank: "Bronze Novice", bias: 0.94, streak: 4, note: "bench hunter" },
  { name: "Oren Pike", rank: "Anvil Adept", bias: 0.87, streak: 3, note: "deadlift days" },
];

export default function ArenaPage() {
  const [tab, setTab] = useState<BoardTab>("daily");
  const { profile, workouts, xp, orderStates } = useIronStore();
  const stats = useMemo(() => selectStats({ workouts, profile }), [workouts, profile]);
  const totalKg = (stats.e1rms.squat ?? 0) + (stats.e1rms.bench ?? 0) + (stats.e1rms.deadlift ?? 0);
  const campaign = useMemo(() => campaignStats(workouts), [workouts]);
  const orders = useMemo(
    () => activeOrders(getGeneratedOrders(profile, workouts), orderStates, workouts),
    [orderStates, profile, workouts],
  );

  const visibleOrders = orders.filter((order) => order.order.definition.kind === tab);
  const completedCount = orders.filter((order) => order.state?.status === "completed").length;
  const claimedCount = orders.filter((order) => order.state && order.state.status !== "completed").length;
  const arenaScore = campaign.weekly.score + Math.round(xp * 0.035);

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-6 pb-24 md:pb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold-dim">Ancillary training board</p>
            <h1 className="plate-heading text-3xl sm:text-4xl">Forge Orders</h1>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-parchment-400">
              Useful training guidance dressed in ironwork: claim small orders when motivation is thin, or seal a harder contract when the week has teeth.
            </p>
          </div>
          <div className="panel flex items-center gap-3 py-3">
            <Flame className="text-blood-bright" size={24} />
            <div>
              <p className="font-serif text-xl text-parchment-50">{claimedCount} active</p>
              <p className="text-[10px] uppercase tracking-widest text-parchment-500">{completedCount} sealed</p>
            </div>
          </div>
        </div>

        <section className="grid gap-3 sm:grid-cols-3">
          <Stat label="Weekly Work" value={arenaScore.toLocaleString()} hint="optional arena score" accent />
          <Stat label="This Week" value={`${campaign.weekly.trainedDays} days`} hint={`${campaign.weekly.setCount} sets logged`} />
          <Stat label="S/B/D Total" value={formatWeight(totalKg, profile.unit)} hint={`${stats.streakWeeks} week streak`} />
        </section>

        <Panel>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="label">Orders Board</p>
              <h2 className="plate-heading text-xl">Claim the Work You Want</h2>
              <p className="text-xs text-parchment-400">Orders guide the session. Contracts test a longer promise.</p>
            </div>
            <div className="bevel grid grid-cols-3 overflow-hidden rounded-sm bg-gunmetal-900">
              {([
                ["daily", "Daily"],
                ["weekly", "Weekly"],
                ["contract", "Contracts"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={cn(
                    "px-3 py-2 text-[10px] font-semibold uppercase tracking-widest transition-colors",
                    tab === key ? "bg-forge-700 text-gold-bright" : "text-parchment-400 hover:bg-gunmetal-700",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {visibleOrders.map((order) => (
              <OrderCard key={`${order.order.periodKey}-${order.order.definition.id}`} progress={order} />
            ))}
          </div>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.45fr]">
          <div className="panel-parchment">
            <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-blood">
              <Medal size={12} /> Charter
            </p>
            <p className="font-serif text-sm leading-relaxed">
              Forge Orders are not a replacement for the program. They are small handles for days when the will is slippery: log, move, practice, write, return.
            </p>
          </div>

          <Panel>
            <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dim">
              <Shield size={12} /> Optional Competition
            </p>
            <h2 className="plate-heading text-lg">Arena Ledger — Sparring Ghosts</h2>
            <p className="mt-1 text-xs leading-relaxed text-parchment-400">
              Competition remains here for lifters who want a little pressure. The rivals below are{" "}
              <strong className="text-parchment-200">simulated sparring partners</strong> paced off your
              own weekly score — real head-to-head leaderboards may come later. Ignore this entirely
              and the orders still work.
            </p>
            <div className="mt-4 space-y-2">
              {leaderboard(arenaScore, stats.streakWeeks).map((rival, index) => (
                <div
                  key={rival.name}
                  className={cn(
                    "grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-sm border border-gunmetal-600 bg-gunmetal-900/50 p-3",
                    rival.name === "You" && "border-gold-dim bg-forge-900/70 shadow-bevel",
                  )}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-gold-dark bg-gunmetal-800 font-serif text-sm text-gold-bright">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="plate-heading truncate text-sm">{rival.name}</p>
                    <p className="text-[10px] uppercase tracking-wider text-parchment-500">
                      {rival.rank} · {rival.note}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-lg text-parchment-50">{rival.score.toLocaleString()}</p>
                    <p className="text-[10px] uppercase tracking-widest text-parchment-500">{rival.streak} wk</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <span className="text-[10px] uppercase tracking-widest text-parchment-500">
                Duels against real lifters — future campaign
              </span>
              <button type="button" className="btn-ghost cursor-not-allowed text-[10px] opacity-50" disabled>
                <Swords size={13} /> Draft Duel
              </button>
            </div>
          </Panel>
        </div>
      </main>
    </>
  );
}

function campaignStats(workouts: Workout[]) {
  const now = new Date();
  const weekly = summarize(workouts, (date) => daysBetween(date, now) < 7);
  return { weekly };
}

function summarize(workouts: Workout[], predicate: (date: Date) => boolean) {
  const scoped = workouts.filter((w) => predicate(new Date(`${w.performedOn}T12:00:00`)));
  const volume = scoped.reduce(
    (sum, workout) => sum + workout.sets.reduce((setSum, set) => setSum + set.kg * set.reps, 0),
    0,
  );
  const setCount = scoped.reduce((sum, workout) => sum + workout.sets.length, 0);
  const trainedDays = new Set(scoped.map((w) => w.performedOn)).size;
  const score = Math.round(scoped.length * 180 + setCount * 18 + volume / 45 + trainedDays * 120);
  return { workouts: scoped.length, volume, setCount, trainedDays, score };
}

function leaderboard(activeScore: number, streakWeeks: number) {
  return MOCK_RIVALS.map((rival, index) => ({
    ...rival,
    score: rival.name === "You" ? activeScore : Math.max(120, Math.round(activeScore * rival.bias + (6 - index) * 47)),
    streak: rival.name === "You" ? streakWeeks : rival.streak,
  })).sort((a, b) => b.score - a.score);
}

function daysBetween(a: Date, b: Date) {
  return Math.max(0, (b.getTime() - a.getTime()) / 86_400_000);
}
