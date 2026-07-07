/**
 * One-rep-max estimation formulas.
 * Epley is the app default; Brzycki is provided for reference/settings.
 */

/** Epley: 1RM = w × (1 + reps/30). Exact at 1 rep. */
export function epley(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

/** Brzycki: 1RM = w × 36 / (37 − reps). Reliable up to ~10 reps. */
export function brzycki(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps >= 37) return weightKg * 2; // formula breaks down; cap sensibly
  return (weightKg * 36) / (37 - reps);
}

export function estimate1Rm(weightKg: number, reps: number): number {
  return Math.round(epley(weightKg, reps) * 10) / 10;
}

const KG_PER_LB = 0.45359237;

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

/** Format a weight in the user's unit, e.g. "227.5 kg" / "501 lb". */
export function formatWeight(kg: number, unit: "kg" | "lb" = "kg"): string {
  const value = unit === "kg" ? kg : kgToLb(kg);
  const rounded = Math.round(value * 2) / 2;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)} ${unit}`;
}
