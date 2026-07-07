/**
 * The Hall of Iron — reference bests of the legends, for side-by-side
 * comparison with the user's own numbers. Values in kg; several are
 * era-reported or exhibition claims and are flagged in `note`.
 */

export interface Legend {
  name: string;
  era: string;
  bodyweightKg?: number;
  lifts: Partial<Record<"squat" | "bench" | "deadlift", number>>;
  note: string;
}

export const LEGENDS: Legend[] = [
  {
    name: "Eddie Hall", era: "2016 · WSM", bodyweightKg: 180,
    lifts: { deadlift: 500 },
    note: "First human to deadlift half a tonne (with straps and suit, and a nosebleed to prove it).",
  },
  {
    name: "Andy Bolton", era: "2006", bodyweightKg: 160,
    lifts: { squat: 550, deadlift: 457.5 },
    note: "First past 1,000 lb on the deadlift; equipped-era squat monster.",
  },
  {
    name: "Ed Coan", era: "1980s–90s", bodyweightKg: 100,
    lifts: { squat: 436, bench: 265, deadlift: 409 },
    note: "71 world records; widely held the greatest pound-for-pound powerlifter ever.",
  },
  {
    name: "Bill Kazmaier", era: "1981", bodyweightKg: 150,
    lifts: { squat: 420, bench: 300, deadlift: 402 },
    note: "Raw 300 kg bench in 1981; three-time World's Strongest Man.",
  },
  {
    name: "Kirk Karwoski", era: "1995", bodyweightKg: 125,
    lifts: { squat: 455 },
    note: "1,003 lb squat, walked out, buried, racked. Equipped era; attitude timeless.",
  },
  {
    name: "Fred Hatfield", era: "1987", bodyweightKg: 115,
    lifts: { squat: 460 },
    note: "'Dr. Squat' — 1,014 lb at age 45, with a PhD and a smile.",
  },
  {
    name: "Paul Anderson", era: "1955–56", bodyweightKg: 160,
    lifts: { squat: 544, bench: 260 },
    note: "Olympic champion; backyard squat feats are era-reported claims, and still terrifying.",
  },
  {
    name: "Doug Hepburn", era: "1953", bodyweightKg: 140,
    lifts: { squat: 345, bench: 260, deadlift: 320 },
    note: "First official 500 lb bench; world weightlifting champion out of Vancouver.",
  },
  {
    name: "Reg Park", era: "1957", bodyweightKg: 114,
    lifts: { squat: 272, bench: 227, deadlift: 300 },
    note: "First bodybuilder to bench 500 lb; three-time Mr. Universe; Arnold's blueprint.",
  },
  {
    name: "Arnold Schwarzenegger", era: "1966–70", bodyweightKg: 107,
    lifts: { squat: 247, bench: 200, deadlift: 322 },
    note: "Powerlifter before Olympian — the Oak's trunk was built on the big three.",
  },
  {
    name: "Franco Columbu", era: "1970s", bodyweightKg: 84,
    lifts: { squat: 297, bench: 238, deadlift: 342 },
    note: "Five-foot-five, deadlifted 755 lb. Pound for pound, the Golden Era's strongest.",
  },
  {
    name: "Tom Platz", era: "1992", bodyweightKg: 104,
    lifts: { squat: 288 },
    note: "Max around 635 lb — but did 500 lb for 23 reps, which is somehow worse.",
  },
  {
    name: "Hermann Goerner", era: "1920", bodyweightKg: 120,
    lifts: { deadlift: 360 },
    note: "Two hands 793 lb; one hand 727 lb. Grip records from Leipzig, still unpaid debts.",
  },
  {
    name: "Bob Peoples", era: "1949", bodyweightKg: 82,
    lifts: { deadlift: 329 },
    note: "725 lb at 181 bodyweight, from a Tennessee cellar with homemade gear.",
  },
  {
    name: "Lamar Gant", era: "1985", bodyweightKg: 60,
    lifts: { deadlift: 312 },
    note: "First to deadlift five times bodyweight. Scoliosis; wingspan; will.",
  },
  {
    name: "Jón Páll Sigmarsson", era: "1984–90", bodyweightKg: 130,
    lifts: { deadlift: 380 },
    note: "Four-time World's Strongest Man. 'There is no reason to be alive if you can't do deadlift!'",
  },
];
