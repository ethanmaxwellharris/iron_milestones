"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { AppNav } from "@/components/nav";
import { Panel, SectionTitle, Stat } from "@/components/ui";
import { RankBadge, XpBar } from "@/components/xp";
import { AchievementCard } from "@/components/achievement";
import { LiftProgressChart } from "@/components/charts";
import { useIronStore, selectStats } from "@/lib/store";
import { evaluateCodex } from "@/lib/codex/engine";
import { dailyQuote, weeklyChallenge } from "@/lib/motivation";
import { formatWeight } from "@/lib/oneRm";
import { liftName } from "@/lib/utils";
import { Flame, Quote, Swords } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { hydrated, onboarded, profile, workouts, unlocked, xp } = useIronStore();

  useEffect(() => {
    if (hydrated && !onboarded) router.replace("/onboarding");
  }, [hydrated, onboarded, router]);

  const stats = useMemo(() => selectStats({ workouts, profile }), [workouts, profile]);
  const codex = useMemo(() => evaluateCodex(stats), [stats]);

  const unlockedCount = Object.keys(unlocked).length;
  const recentUnlocks = useMemo(
    () =>
      codex
        .filter((p) => unlocked[p.achievement.id])
        .sort((a, b) => (unlocked[b.achievement.id] ?? "").localeCompare(unlocked[a.achievement.id] ?? ""))
        .slice(0, 2),
    [codex, unlocked],
  );
  const nextUp = useMemo(
    () =>
      codex
        .filter((p) => !p.unlocked && p.fraction > 0)
        .sort((a, b) => b.fraction - a.fraction)
        .slice(0, 2),
    [codex],
  );

  const quote = dailyQuote();
  const challenge = weeklyChallenge();

  if (!hydrated || !onboarded) {
    return (
      <main className="flex min-h-dvh items-center justify-center text-sm uppercase tracking-[0.3em] text-parchment-500">
        Consulting the codex…
      </main>
    );
  }

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold-dim">
              {profile.name ? `Welcome back, ${profile.name}` : "Welcome back, lifter"}
            </p>
            <RankBadge xp={xp} />
          </div>
          <Link href="/log" className="btn-gold">
            + Log a Session
          </Link>
        </div>
        <XpBar xp={xp} />

        {/* PR plates */}
        <section>
          <SectionTitle sub="Estimated one-rep maxima · Epley">The Big Three</SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["squat", "bench", "deadlift"] as const).map((l) => (
              <Stat
                key={l}
                label={liftName(l)}
                value={stats.e1rms[l] ? formatWeight(stats.e1rms[l], profile.unit) : "—"}
                hint={
                  stats.e1rms[l] && stats.bodyweightKg
                    ? `${(stats.e1rms[l] / stats.bodyweightKg).toFixed(2)}× bodyweight`
                    : undefined
                }
                accent
              />
            ))}
            <Stat
              label="S/B/D Total"
              value={
                formatWeight(
                  (stats.e1rms.squat ?? 0) + (stats.e1rms.bench ?? 0) + (stats.e1rms.deadlift ?? 0),
                  profile.unit,
                )
              }
              hint={`${stats.prCount} lifetime PRs`}
            />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chart */}
          <Panel className="lg:col-span-2">
            <SectionTitle sub="Cumulative best e1RM by session" className="mb-2">
              The Ascent
            </SectionTitle>
            <LiftProgressChart workouts={workouts} />
          </Panel>

          {/* Streak + challenge + quote */}
          <div className="space-y-4">
            <Panel className="flex items-center gap-3">
              <Flame className="text-blood-bright" size={28} />
              <div>
                <p className="font-serif text-2xl text-parchment-50">{stats.streakWeeks} week{stats.streakWeeks === 1 ? "" : "s"}</p>
                <p className="text-[11px] uppercase tracking-widest text-parchment-400">
                  training streak · {stats.workoutCount} sessions logged
                </p>
              </div>
            </Panel>
            <Panel>
              <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dim">
                <Swords size={12} /> Weekly Challenge
              </p>
              <p className="plate-heading text-base">{challenge.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-parchment-300">{challenge.description}</p>
            </Panel>
            <div className="panel-parchment">
              <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-blood">
                <Quote size={12} /> Words of the Day
              </p>
              <p className="font-serif text-sm italic leading-relaxed">“{quote.text}”</p>
              <p className="mt-1 text-right text-[11px] font-semibold uppercase tracking-wider">— {quote.by}</p>
            </div>
          </div>
        </div>

        {/* Codex teaser */}
        <section>
          <SectionTitle sub={`${unlockedCount} of ${codex.length} pages unlocked`}>
            From the Codex
          </SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            {recentUnlocks.map((p) => (
              <AchievementCard key={p.achievement.id} progress={p} unlockedAt={unlocked[p.achievement.id]} />
            ))}
            {nextUp.map((p) => (
              <AchievementCard key={p.achievement.id} progress={p} />
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/codex" className="btn-ghost">Open the full Codex →</Link>
          </div>
        </section>
      </main>
    </>
  );
}
