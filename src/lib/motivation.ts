/**
 * Daily quotes and weekly challenges — deterministic by date so every user
 * (and every reload) sees the same page of the codex on the same day.
 */

export interface IronQuote {
  text: string;
  by: string;
}

export const QUOTES: IronQuote[] = [
  { text: "There is no reason to be alive if you can't do deadlift!", by: "Jón Páll Sigmarsson" },
  { text: "The last three or four reps is what makes the muscle grow.", by: "Arnold Schwarzenegger" },
  { text: "Strength does not come from winning. Your struggles develop your strengths.", by: "Arnold Schwarzenegger" },
  { text: "There is no such thing as overtraining, only under-eating and under-sleeping.", by: "attributed to the Golden Era" },
  { text: "A man's true strength is measured by what he does after he thinks he is finished.", by: "Iron proverb" },
  { text: "The mind is everything: what you believe, the body achieves.", by: "attributed to Reg Park's school" },
  { text: "Everything is heavy if you hold it long enough. So hold it.", by: "Iron proverb" },
  { text: "I don't train to be better than anyone else. I train to be better than I was.", by: "attributed to Ed Coan" },
  { text: "The squat is the great decider. It asks a question the whole body must answer.", by: "after Tom Platz" },
  { text: "Lift heavy things and put them down politely. Repeat until legendary.", by: "The Codex of Iron" },
  { text: "Life is too short to be small.", by: "attributed to Henry Rollins, after the old-timers" },
  { text: "The bar doesn't care how you feel. Curiously, lifting it changes how you feel.", by: "The Codex of Iron" },
  { text: "Milo did not lift the bull. He lifted the calf, every day, and the bull happened.", by: "after Milo of Croton" },
  { text: "Strength is the foundation. You cannot fire a cannon from a canoe.", by: "old coaching maxim" },
  { text: "Add a rep. Add a kilo. Add a week. Arithmetic is undefeated.", by: "after Doug Hepburn" },
  { text: "Records are rent. They are paid weekly, in chalk.", by: "The Codex of Iron" },
  { text: "Train like the champions of old: heavy, often, and with terrible singing.", by: "The Codex of Iron" },
  { text: "What hurts today makes history tomorrow.", by: "Iron proverb" },
  { text: "The iron never lies to you. It is the great reference point.", by: "after Henry Rollins" },
  { text: "Somewhere, a version of you is finishing the set. Go be that one.", by: "The Codex of Iron" },
];

export interface WeeklyChallenge {
  title: string;
  description: string;
}

export const CHALLENGES: WeeklyChallenge[] = [
  { title: "The Hepburn Week", description: "Add exactly one rep or 2.5 kg to one main lift this week. No more. Arithmetic wins wars." },
  { title: "Milo's Walk", description: "Train at least three days this week — the calf gets heavier whether you show up or not." },
  { title: "The Breathing Squat", description: "Finish one squat session with a single 15+ rep set at a weight you respect." },
  { title: "Sigmarsson's Session", description: "Pull a deadlift top set this week and smile through the whole thing. Mandatory." },
  { title: "The Strict Oath", description: "Press strictly overhead this week — no leg drive, no lean-back. The old judges are watching." },
  { title: "Reeves's Errand", description: "Add a rowing movement to every session this week. Build the back that builds the rest." },
  { title: "Coan's Quiet", description: "Hit every planned set this week at RPE 8 or less. Precision over heroics." },
  { title: "The Keeper's Ledger", description: "Log every set, every note, every kilo this week. The codex only honors what is written." },
  { title: "Park's Foundation", description: "Give the big three one heavy top set each this week — 5×5 on whatever remains." },
  { title: "The Long Furnace", description: "Choose one lift and do 50 total reps at 60–70% across the week." },
  { title: "Sandow's Mirror", description: "Finish each session with 10 minutes of weak-point work. The Grecian ideal was built on details." },
  { title: "Anderson's Backyard", description: "One session this week: minimal equipment, maximal effort. Barrels optional." },
];

function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  return Math.floor((d.getTime() - start) / 86400000);
}

export function dailyQuote(date = new Date()): IronQuote {
  return QUOTES[(dayOfYear(date) + date.getUTCFullYear()) % QUOTES.length];
}

export function weeklyChallenge(date = new Date()): WeeklyChallenge {
  const week = Math.floor(date.getTime() / (7 * 24 * 3600 * 1000));
  return CHALLENGES[week % CHALLENGES.length];
}
