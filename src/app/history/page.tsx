"use client";

/**
 * Workout history: per-lift progress chart + the full ledger of sessions.
 */

import { useMemo, useState } from "react";
import { AppNav } from "@/components/nav";
import { Panel, SectionTitle } from "@/components/ui";
import { LiftProgressChart } from "@/components/charts";
import { useIronStore } from "@/lib/store";
import { estimate1Rm, formatWeight } from "@/lib/oneRm";
import { LIFT_NAMES, liftName } from "@/lib/utils";

export default function HistoryPage() {
  const { workouts, profile, customLifts } = useIronStore();
  const [focus, setFocus] = useState<string>("big3");

  const liftOptions = useMemo(
    () => [
      { slug: "big3", name: "Big Three (overlay)" },
      ...Object.entries(LIFT_NAMES).map(([slug, name]) => ({ slug, name })),
      ...customLifts,
    ],
    [customLifts],
  );

  const chartLifts = focus === "big3" ? ["squat", "bench", "deadlift"] : [focus];
  const sorted = useMemo(
    () => [...workouts].sort((a, b) => b.performedOn.localeCompare(a.performedOn)),
    [workouts],
  );

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <SectionTitle sub={`${workouts.length} sessions in the ledger`}>The Ledger</SectionTitle>

        <Panel className="mb-6">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-parchment-400">
              Progress chart
            </p>
            <select className="input max-w-56" value={focus} onChange={(e) => setFocus(e.target.value)}>
              {liftOptions.map((o) => (
                <option key={o.slug} value={o.slug}>{o.name}</option>
              ))}
            </select>
          </div>
          <LiftProgressChart workouts={workouts} lifts={chartLifts} unit={profile.unit} />
        </Panel>

        <div className="space-y-3">
          {sorted.length === 0 && (
            <p className="py-12 text-center text-sm italic text-parchment-500">
              The ledger is blank. Its first page is waiting in the logger.
            </p>
          )}
          {sorted.map((w) => (
            <article key={w.id} className="panel">
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-serif text-base text-parchment-50">
                  {new Date(`${w.performedOn}T12:00:00`).toLocaleDateString(undefined, {
                    weekday: "short", year: "numeric", month: "short", day: "numeric",
                  })}
                </h2>
                <span className="text-[11px] uppercase tracking-widest text-parchment-500">
                  {w.sets.length} set{w.sets.length === 1 ? "" : "s"}
                  {w.bodyweightKg ? ` · bw ${formatWeight(w.bodyweightKg, profile.unit)}` : ""}
                </span>
              </header>
              {w.notes && <p className="mt-1 text-xs italic text-parchment-400">“{w.notes}”</p>}
              <table className="mt-2 w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-parchment-500">
                    <th className="py-1 font-semibold">Lift</th>
                    <th className="py-1 font-semibold">Weight × Reps</th>
                    <th className="py-1 font-semibold">RPE</th>
                    <th className="py-1 text-right font-semibold">est. 1RM</th>
                  </tr>
                </thead>
                <tbody>
                  {w.sets.map((s, i) => (
                    <tr key={i} className="border-t border-gunmetal-600/60 text-parchment-200">
                      <td className="py-1.5">{liftName(s.lift)}</td>
                      <td className="py-1.5 tabular-nums">
                        {formatWeight(s.kg, profile.unit)} × {s.reps}
                      </td>
                      <td className="py-1.5 tabular-nums">{s.rpe ?? "—"}</td>
                      <td className="py-1.5 text-right tabular-nums text-gold-bright">
                        {formatWeight(estimate1Rm(s.kg, s.reps), profile.unit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
