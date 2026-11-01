import { describe, expect, it } from "vitest";
import { computeDuelScore, publicLifterName, sanitizeRosterQuery } from "./duels";
import type { Workout } from "./store";

function session(performedOn: string, sets: Workout["sets"]): Workout {
  return { id: "00000000-0000-4000-8000-000000000001", performedOn, sets };
}

describe("publicLifterName", () => {
  it("prefers the chosen name and shows the handle when it differs", () => {
    expect(publicLifterName("Ethan", "ethan")).toBe("Ethan");
    expect(publicLifterName("Ethan", "ethan-1")).toBe("Ethan (@ethan-1)");
    expect(publicLifterName("  ", "ethan-2")).toBe("ethan-2");
    expect(publicLifterName(null, null)).toBe("A lifter");
  });
});

describe("sanitizeRosterQuery", () => {
  it("drops characters that break a PostgREST or() filter", () => {
    expect(sanitizeRosterQuery(' jo,hn%_(x)" ')).toBe("johnx");
  });
});

describe("computeDuelScore", () => {
  const startsAt = new Date("2026-06-02T12:00:00").toISOString();
  const endsAt = new Date("2026-06-04T12:00:00").toISOString();
  const workouts = [
    session("2026-06-01", [{ lift: "squat", kg: 100, reps: 5 }]),
    session("2026-06-02", [
      { lift: "squat", kg: 100, reps: 5 },
      { lift: "bench", kg: 60, reps: 3 },
    ]),
    session("2026-06-03", [{ lift: "deadlift", kg: 140, reps: 2 }]),
    session("2026-06-03", [{ lift: "row", kg: 70, reps: 8 }]),
    session("2026-06-04", [{ lift: "squat", kg: 200, reps: 1 }]),
  ];

  it("scores only workouts inside the half-open window", () => {
    expect(computeDuelScore(workouts, "volume", startsAt, endsAt)).toBe(100 * 5 + 60 * 3 + 140 * 2 + 70 * 8);
    expect(computeDuelScore(workouts, "sets", startsAt, endsAt)).toBe(4);
    expect(computeDuelScore(workouts, "trained-days", startsAt, endsAt)).toBe(2);
  });
});
