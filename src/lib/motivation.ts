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
  { text: "Everybody wanna be a bodybuilder, but don't nobody wanna lift no heavy-ass weights.", by: "Ronnie Coleman" },
  { text: "Light weight, baby!", by: "Ronnie Coleman, lying" },
  { text: "The worst thing I can be is the same as everybody else.", by: "Arnold Schwarzenegger" },
  { text: "A champion is someone who gets up when he can't.", by: "Jack Dempsey" },
  { text: "Strength does not come from physical capacity. It comes from an indomitable will.", by: "attributed to Gandhi" },
  { text: "I fear not the man who has practiced ten thousand kicks once, but the man who has practiced one kick ten thousand times.", by: "Bruce Lee" },
  { text: "Whether you think you can or you think you can't — you're right.", by: "Henry Ford" },
  { text: "If you're not prepared to train to failure, you're not prepared to grow.", by: "after Dorian Yates" },
  { text: "The pain you feel today is the strength you feel tomorrow.", by: "Iron proverb" },
  { text: "You do not rise to the occasion. You sink to the level of your training.", by: "Archilochus, paraphrased" },
  { text: "Nobody drowned in sweat.", by: "old gym wall" },
  { text: "The bar is loaded with exactly what you put on it. So is the day.", by: "The Codex of Iron" },
  { text: "Squat like the rack owes you money.", by: "The Codex of Iron" },
  { text: "Consistency is the mother of mastery.", by: "coaching maxim" },
  { text: "You don't find willpower under the bar. You forge it there.", by: "The Codex of Iron" },
  { text: "A PR is just a promise you finally kept.", by: "The Codex of Iron" },
  { text: "Rest between sets, not between decades.", by: "The Codex of Iron" },
  { text: "Chalk is the only makeup the iron respects.", by: "The Codex of Iron" },
  { text: "The gym is honest work in a dishonest hour.", by: "Iron proverb" },
  { text: "No citizen has a right to be an amateur in the matter of physical training.", by: "Socrates, per Xenophon" },
  { text: "It is a shame for a man to grow old without seeing the beauty and strength of which his body is capable.", by: "Socrates, per Xenophon" },
  { text: "Strong people are harder to kill than weak people, and more useful in general.", by: "Mark Rippetoe" },
  { text: "There's no such thing as bad weather for a deadlift. It's indoors.", by: "The Codex of Iron" },
  { text: "The weight doesn't care about your feelings. Lift it anyway; the feelings improve.", by: "The Codex of Iron" },
  { text: "Every rep is a vote for the person you intend to become.", by: "after James Clear" },
  { text: "Fatigue makes cowards of us all.", by: "Vince Lombardi" },
  { text: "The five-hundred-pound bench was impossible until 1953. Impossibility has a shelf life.", by: "The Codex of Iron" },
  { text: "Goerner pulled 330 kilos with one hand. You may use both. No excuses remain.", by: "The Codex of Iron" },
  { text: "Anderson squatted in a dirt hole with concrete barrels. Your gym has air conditioning.", by: "The Codex of Iron" },
  { text: "Abandon every hope of shortcuts, ye who enter here. Keep the barbell.", by: "The Codex of Iron, after Dante" },
  { text: "What is heavy? Heavy is what you have not trained for yet.", by: "The Codex of Iron" },
  { text: "The strong do what they trained to do; the weak scroll what they wish they'd done.", by: "The Codex of Iron, after Thucydides" },
  { text: "First they ignore your squat, then they laugh at your squat, then they ask for your program.", by: "The Codex of Iron" },
  { text: "An early morning walk under a loaded bar is a blessing for the whole day.", by: "The Codex of Iron, after Thoreau" },
  { text: "Nothing great was ever achieved between sets of less than five.", by: "The Codex of Iron, after Emerson" },
  { text: "The ledger forgets nothing. Neither should you — write the session down.", by: "The Codex of Iron" },
  { text: "Do not pray for a lighter bar. Pray for a stronger back.", by: "after Theodore Roosevelt" },
  { text: "Hard choices, easy life. Easy choices, hard life.", by: "Jerzy Gregorek" },
  { text: "The purpose of training is to tighten up the slack, toughen the body, and polish the spirit.", by: "Morihei Ueshiba" },
  { text: "Iron rusts from disuse; water loses its purity from stagnation. So it is with the vigor of the body.", by: "after Leonardo da Vinci" },
  { text: "Take care of your body. It's the only place you have to live.", by: "Jim Rohn" },
  { text: "Well-being is realized by small steps, but is truly no small thing.", by: "Zeno of Citium" },
  { text: "We suffer more often in imagination than under the bar.", by: "The Codex of Iron, after Seneca" },
  { text: "You have power over your mind, not the plates. Realize this, and you will lift anyway.", by: "The Codex of Iron, after Marcus Aurelius" },
  { text: "The obstacle is the way. Today the obstacle weighs two hundred kilos.", by: "The Codex of Iron, after Marcus Aurelius" },
  { text: "Waste no more time arguing about what a strong man should be. Be one.", by: "Marcus Aurelius, near enough" },
  { text: "Difficulties strengthen the mind, as labor does the body.", by: "Seneca" },
  { text: "No man has the right to be an amateur in the matter of his own strength.", by: "The Codex of Iron, after Socrates" },
  { text: "A year from now you may wish you had started today.", by: "Karen Lamb" },
  { text: "Motivation gets you to the gym. Habit gets you to the bar. Stubbornness gets you under it.", by: "The Codex of Iron" },
  { text: "Count your reps out loud. The iron enjoys arithmetic.", by: "The Codex of Iron" },
  { text: "Half a squat is a full confession.", by: "The Codex of Iron" },
  { text: "The last rep is the only one the codex remembers differently.", by: "The Codex of Iron" },
  { text: "Great backs are built one honest row at a time.", by: "The Codex of Iron" },
  { text: "Old lifters never die. They just re-rack at a heavier weight.", by: "Iron proverb" },
  { text: "Your grandchildren will not ask what you scrolled. They may ask what you could lift.", by: "The Codex of Iron" },
  { text: "Sleep is a set. Dinner is a set. Log those too, in spirit.", by: "The Codex of Iron" },
  { text: "The plates on the bar are the only weights you control today. Start there.", by: "The Codex of Iron" },
  { text: "Iron sharpens iron, and one lifter sharpens another.", by: "Proverbs 27:17, gym translation" },
  { text: "Where the chalk dust settles, there your heart is also.", by: "The Codex of Iron" },
  { text: "Begin. The rest of the workout has a way of following.", by: "The Codex of Iron" },
  { text: "Every legend in this codex started with an empty bar and a full imagination.", by: "The Codex of Iron" },
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
