"use client";

/**
 * The Hall of Iron — your bests measured against the recorded (and
 * era-reported) feats of the legends, one engraved plaque per name.
 */

import { useMemo } from "react";
import { AppNav } from "@/components/nav";
import { ProgressBar, SectionTitle } from "@/components/ui";
import { LEGENDS } from "@/lib/legends";
import { useIronStore, selectStats } from "@/lib/store";
import { formatWeight } from "@/lib/oneRm";
import { liftName } from "@/lib/utils";

export default function HallPage() {
  const { workouts, profile } = useIronStore();
  const stats = useMemo(() => selectStats({ workouts, profile }), [workouts, profile]);

  const ranked = useMemo(() => {
    return LEGENDS.map((legend) => {
      const comparisons = (Object.entries(legend.lifts) as ["squat" | "bench" | "deadlift", number][])
        .map(([l, kg]) => ({
          lift: l,
          legendKg: kg,
          yours: stats.e1rms[l] ?? 0,
          fraction: Math.min(1, (stats.e1rms[l] ?? 0) / kg),
        }));
      const overall =
        comparisons.reduce((sum, c) => sum + c.fraction, 0) / Math.max(1, comparisons.length);
      return { legend, comparisons, overall };
    }).sort((a, b) => b.overall - a.overall);
  }, [stats]);

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <SectionTitle sub="Your estimated 1RMs against the recorded feats of the old gods">
          The Hall of Iron
        </SectionTitle>

        <div className="space-y-4">
          {ranked.map(({ legend, comparisons, overall }) => (
            <article key={legend.name} className="codex-card">
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h2 className="plate-heading text-lg">{legend.name}</h2>
                  <p className="text-[11px] uppercase tracking-widest text-parchment-500">
                    {legend.era}
                    {legend.bodyweightKg ? ` · ~${legend.bodyweightKg} kg bodyweight` : ""}
                  </p>
                </div>
                <span className="font-serif text-xl text-gold-bright">{Math.floor(overall * 100)}%</span>
              </header>
              <p className="mt-1.5 text-xs italic leading-relaxed text-parchment-400">{legend.note}</p>
              <div className="mt-3 space-y-2">
                {comparisons.map((c) => (
                  <div key={c.lift}>
                    <div className="flex justify-between text-[11px] text-parchment-400">
                      <span>{liftName(c.lift)}</span>
                      <span className="tabular-nums">
                        <span className={c.fraction >= 1 ? "text-gold-bright" : "text-parchment-200"}>
                          {c.yours ? formatWeight(c.yours, profile.unit) : "—"}
                        </span>
                        {" / "}
                        {formatWeight(c.legendKg, profile.unit)}
                      </span>
                    </div>
                    <ProgressBar fraction={c.fraction} className="mt-1" />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <p className="mt-6 text-center text-[11px] italic text-parchment-500">
          Several old-time figures are era-reported or exhibition claims — the Hall records them as
          history told them, and history told them loudly.
        </p>
      </main>
    </>
  );
}
