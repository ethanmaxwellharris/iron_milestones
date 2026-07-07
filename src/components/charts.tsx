"use client";

/**
 * Retro-styled progress charts (Recharts). One line per big-three lift by
 * default; single-lift mode for the history page.
 */

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";
import type { Workout } from "@/lib/store";
import { estimate1Rm } from "@/lib/oneRm";
import { liftName } from "@/lib/utils";

const LINE_COLORS: Record<string, string> = {
  squat: "#8fb0c9",
  bench: "#b04343",
  deadlift: "#e0bc4a",
  ohp: "#567243",
  row: "#a68a58",
};

/** Best e1RM per lift per workout date, cumulative-max so lines never dip. */
function buildSeries(workouts: Workout[], lifts: string[]) {
  const sorted = [...workouts].sort((a, b) => a.performedOn.localeCompare(b.performedOn));
  const best: Record<string, number> = {};
  return sorted
    .map((w) => {
      let touched = false;
      for (const s of w.sets) {
        if (!lifts.includes(s.lift)) continue;
        const e1 = estimate1Rm(s.kg, s.reps);
        if (e1 > (best[s.lift] ?? 0)) best[s.lift] = e1;
        touched = true;
      }
      return touched ? { date: w.performedOn, ...best } : null;
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);
}

export function LiftProgressChart({
  workouts,
  lifts = ["squat", "bench", "deadlift"],
  height = 260,
}: {
  workouts: Workout[];
  lifts?: string[];
  height?: number;
}) {
  const data = useMemo(() => buildSeries(workouts, lifts), [workouts, lifts]);

  if (data.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center text-center text-xs italic text-parchment-500">
        Log at least two sessions with these lifts and the engravers will begin the chart.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -14 }}>
        <CartesianGrid stroke="#32383f" strokeDasharray="2 4" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#a68a58", fontSize: 10, fontFamily: "Verdana" }}
          tickFormatter={(d: string) => d.slice(5)}
          stroke="#454d56"
        />
        <YAxis
          tick={{ fill: "#a68a58", fontSize: 10, fontFamily: "Verdana" }}
          stroke="#454d56"
          unit=""
          width={54}
          tickFormatter={(v: number) => `${v}kg`}
        />
        <Tooltip
          contentStyle={{
            background: "#1d2125",
            border: "1px solid #8a6d1d",
            borderRadius: 2,
            fontSize: 12,
            fontFamily: "Verdana",
          }}
          labelStyle={{ color: "#eee3c6" }}
          formatter={(value: number, name: string) => [`${value} kg (e1RM)`, liftName(name)]}
        />
        {lifts.map((l) => (
          <Line
            key={l}
            type="stepAfter"
            dataKey={l}
            stroke={LINE_COLORS[l] ?? "#828d98"}
            strokeWidth={2}
            dot={{ r: 2.5, strokeWidth: 0, fill: LINE_COLORS[l] ?? "#828d98" }}
            connectNulls
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
