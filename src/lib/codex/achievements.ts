/**
 * ═══════════════════════════════════════════════════════════════════════════
 * THE CODEX OF IRON — Achievements data
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Single source of truth for every achievement in the app. The Supabase
 * `achievements` table is a mirror of this file (see scripts/seed-achievements.mjs).
 *
 * HOW TO EXPAND THE CODEX
 * ───────────────────────
 * 1. Add a new entry to `defs` below. Give it a stable, never-reused `id`.
 * 2. Compose `requirements` from the helpers (lift/total/bw/reps/…) — all
 *    requirements are ANDed. New requirement types go in types.ts + engine.ts.
 * 3. `tier` defaults from rarity (common→novice … legendary→legend) but can
 *    be overridden per entry.
 * 4. Re-run `npm run seed:achievements` if you mirror to Supabase.
 *
 * Historic notes: feats are drawn from the recorded/reported history of
 * strength — where numbers are disputed or era-assisted (wraps, suits,
 * pre-federation scales), the lore says so or rounds conservatively.
 * All thresholds are in kilograms.
 */

import type { Achievement, Category, LiftSlug, Rarity, Requirement, Tier } from "./types";
import { RARITY_XP } from "@/lib/xp";

// ── Requirement helpers ──────────────────────────────────────────────────────
const lift = (l: LiftSlug, kg: number): Requirement => ({ type: "lift", lift: l, kg });
const total = (kg: number): Requirement => ({ type: "total", kg });
const bw = (l: LiftSlug, multiple: number): Requirement => ({ type: "bw-multiple", lift: l, multiple });
const totalBw = (multiple: number): Requirement => ({ type: "total-bw-multiple", multiple });
const reps = (l: LiftSlug, kg: number, n: number): Requirement => ({ type: "reps", lift: l, kg, reps: n });
const workouts = (count: number): Requirement => ({ type: "workouts", count });
const streak = (weeks: number): Requirement => ({ type: "streak", weeks });
const prs = (count: number): Requirement => ({ type: "prs", count });

const TIER_FOR_RARITY: Record<Rarity, Tier> = {
  common: "novice",
  uncommon: "apprentice",
  rare: "journeyman",
  epic: "master",
  legendary: "legend",
};

type Def = Omit<Achievement, "xp" | "tier"> & { tier?: Tier };

const defs: Def[] = [
  // ═══ THE SQUAT — "The King's Descent" ═════════════════════════════════════
  {
    id: "squat-60", name: "Roots of Oak", category: "squat", rarity: "common",
    lore: "Every oak that ever split a boulder began as a sapling under sixty kilos of sky. The descent has begun.",
    iconDescription: "Woodcut engraving of a young oak tree growing through a barbell plate, fine crosshatched roots, antique gold border.",
    requirements: [lift("squat", 60)],
  },
  {
    id: "squat-80", name: "The Gathering Storm", category: "squat", rarity: "common",
    lore: "Eighty kilos across the back. The bar has stopped being furniture and started being weather.",
    iconDescription: "Engraved storm cloud pressing down on a squatting figure drawn in Vitruvian proportion lines, rain as hatched lines.",
    requirements: [lift("squat", 80)],
  },
  {
    id: "squat-100", name: "Two Plate Pilgrim", category: "squat", rarity: "common",
    lore: "One hundred kilograms — the first true toll gate on the pilgrim road every strong person has walked.",
    iconDescription: "Woodcut pilgrim with a staff, two barbell plates strapped to his back like a rucksack, winding road behind.",
    requirements: [lift("squat", 100)],
  },
  {
    id: "squat-120", name: "The Steady Descent", category: "squat", rarity: "uncommon",
    lore: "Depth is honesty. One hundred twenty kilos, below parallel, tells no lies.",
    iconDescription: "Cross-section diagram of a squat at depth, Renaissance anatomical style, femur angle marked with compass arcs.",
    requirements: [lift("squat", 120)],
  },
  {
    id: "squat-140", name: "Three Plate Trial", category: "squat", rarity: "uncommon",
    lore: "Three plates a side. In every gym on earth this is the moment the regulars quietly start counting your reps.",
    iconDescription: "Three engraved plates stacked like ancient coins, each stamped with a laurel wreath, scanline texture over parchment.",
    requirements: [lift("squat", 140)],
  },
  {
    id: "squat-160", name: "Hackenschmidt's Approval", category: "squat", rarity: "uncommon",
    lifter: "George Hackenschmidt", era: "1900s · The Russian Lion",
    lore: "George Hackenschmidt — wrestler, philosopher, namesake of the hack squat — held that strong legs were the proof of a serious man. One hundred sixty kilos earns his nod.",
    iconDescription: "Engraved portrait of a mustachioed strongman in a singlet, arms crossed, framed in an encyclopedia plate with cyrillic flourishes.",
    requirements: [lift("squat", 160)],
  },
  {
    id: "squat-180", name: "Four Plate Furnace", category: "squat", rarity: "rare",
    lore: "Four plates is where squatting stops being exercise and becomes smithing. You are both the hammer and the steel.",
    iconDescription: "A blacksmith's furnace with four plates glowing inside like coals, sparks as stippled dots, deep red accents.",
    requirements: [lift("squat", 180)],
  },
  {
    id: "squat-200", name: "The Double Century Descent", category: "squat", rarity: "rare",
    lore: "Two hundred kilograms. In the old federations this number alone bought you a seat at the table.",
    iconDescription: "Roman numeral CC carved into a stone lintel above a squat rack drawn as a temple doorway.",
    requirements: [lift("squat", 200)],
  },
  {
    id: "squat-220", name: "Five Plate Cathedral", category: "squat", rarity: "rare",
    lore: "Five plates a side and the walk-out alone is a sermon. Few kneel this deep beneath this much and rise.",
    iconDescription: "Gothic cathedral whose rose window is a barbell plate, squatting figure as the doorway arch, engraved stone texture.",
    requirements: [lift("squat", 220)],
  },
  {
    id: "squat-240", name: "Anderson's Backyard Barrels", category: "squat", rarity: "epic",
    lifter: "Paul Anderson", era: "1950s · Toccoa, Georgia",
    lore: "Paul Anderson squatted in a Georgia backyard with barrels of concrete and a hole dug in the dirt, then won Olympic gold in 1956. Legend credits him with squats no scale of his era could argue with.",
    iconDescription: "Woodcut of a huge farm boy squatting a wooden barrel-loaded axle over a dirt hole, chickens watching, southern pines behind.",
    requirements: [lift("squat", 240)],
  },
  {
    id: "squat-260", name: "Platz Country", category: "squat", rarity: "epic",
    lifter: "Tom Platz", era: "1980s · The Golden Eagle",
    lore: "Past two hundred sixty kilos you enter Platz Country — the territory of the man whose legs made the squat an art form. Population: almost nobody.",
    iconDescription: "Engraved quadriceps in anatomical cross-section merging into a mountain range, a road sign reading 'PLATZ COUNTRY' in serif capitals.",
    requirements: [lift("squat", 260)],
  },
  {
    id: "squat-300", name: "Seven Plate Summit", category: "squat", rarity: "legendary",
    lifter: "Fred Hatfield", era: "1987 · Dr. Squat",
    lore: "Fred 'Dr. Squat' Hatfield squatted 460 kg at age 45 with a PhD on the wall. Three hundred kilos puts you in the antechamber of his library.",
    iconDescription: "A mountain summit made of seven stacked plates, a tiny figure planting a barbell like a flag, engraved sunburst behind.",
    requirements: [lift("squat", 300)],
  },

  // ═══ THE BENCH PRESS — "The Horizontal Throne" ════════════════════════════
  {
    id: "bench-60", name: "Bar Meets Iron", category: "bench", rarity: "common",
    lore: "Sixty kilos pressed from the chest. The bench has accepted your application.",
    iconDescription: "Simple engraved bench press seen from above, Vitruvian circle around the lifter's reach, single plate per side.",
    requirements: [lift("bench", 60)],
  },
  {
    id: "bench-80", name: "The Honest Eighty", category: "bench", rarity: "common",
    lore: "No leg drive tricks, no half reps — eighty full kilos, touched and pressed. Honesty is the first plate.",
    iconDescription: "A set of apothecary scales balancing a plate against a feather quill, woodcut style, parchment background.",
    requirements: [lift("bench", 80)],
  },
  {
    id: "bench-100", name: "Century Press", category: "bench", rarity: "uncommon",
    lore: "One hundred kilograms off the chest — the number every gym conversation eventually circles back to. You may now answer it truthfully.",
    iconDescription: "The number 100 as engraved Roman architecture, columns as barbell sleeves, pediment as a bench.",
    requirements: [lift("bench", 100)],
  },
  {
    id: "bench-120", name: "The Gatekeeper", category: "bench", rarity: "uncommon",
    lore: "One-twenty is the gate between the crowded courtyard and the quiet hall. Most pilgrims turn back here.",
    iconDescription: "Iron gate in a stone wall, its bars made of barbells, a keyhole shaped like a plate, crosshatched shadows.",
    requirements: [lift("bench", 120)],
  },
  {
    id: "bench-140", name: "Three Plate Communion", category: "bench", rarity: "rare",
    lore: "Three plates a side on the bench. The spotters lean in now — not to help, but to watch.",
    iconDescription: "Three plates rendered as stained-glass roundels above a bench drawn as an altar, engraved light rays.",
    requirements: [lift("bench", 140)],
  },
  {
    id: "bench-160", name: "Hepburn's Apprentice", category: "bench", rarity: "rare",
    lifter: "Doug Hepburn", era: "1950s · Vancouver",
    lore: "Doug Hepburn built the world's first 500 lb bench one grinding single at a time. At one-sixty you have earned a stool in his Vancouver gym.",
    iconDescription: "Engraved harbor-front gym window, a broad-backed figure benching inside, seagulls and ship masts in the glass reflection.",
    requirements: [lift("bench", 160)],
  },
  {
    id: "bench-180", name: "Four Plate Reckoning", category: "bench", rarity: "rare",
    lore: "Four plates a side, wrists stacked, bar bending just slightly — the reckoning between you and every rep you ever cut short.",
    iconDescription: "A bending barbell drawn as a drawn longbow, four plates as arrowheads, engraved tension lines.",
    requirements: [lift("bench", 180)],
  },
  {
    id: "bench-200", name: "The 200 Club", category: "bench", rarity: "epic",
    lore: "Two hundred kilograms. There is no card, no clubhouse, no handshake — just a number that other strong people say slowly.",
    iconDescription: "A private club door with a brass plaque reading 'CC', a plate as the door knocker, engraved oak grain.",
    requirements: [lift("bench", 200)],
  },
  {
    id: "bench-227", name: "The Half-Grand", category: "bench", rarity: "epic",
    era: "1953 → forever",
    lore: "Five hundred pounds — 227 kg — was once thought beyond human shoulders. Doug Hepburn proved otherwise in 1953; Reg Park made bodybuilders believe in 1957.",
    iconDescription: "An engraved banknote for 'FIVE HUNDRED', its portrait a bencher mid-press, ornate guilloche borders like old currency.",
    requirements: [lift("bench", 227)],
  },
  {
    id: "bench-250", name: "Kazmaier's Threshold", category: "bench", rarity: "legendary",
    lifter: "Bill Kazmaier", era: "1981 · The Kaz",
    lore: "Bill Kazmaier benched 300 kg raw when raw meant a t-shirt and bad intentions. At 250 you can see his silhouette in the chalk haze ahead.",
    iconDescription: "Massive engraved silhouette in chalk dust, bar bending across the chest, 'KAZ' stamped like a foundry mark.",
    requirements: [lift("bench", 250)],
  },
  {
    id: "bench-272", name: "Pat Casey's Gate", category: "bench", rarity: "legendary",
    lifter: "Pat Casey", era: "1967 · First to 600",
    lore: "In 1967 Pat Casey became the first human to bench 600 lb. The gate he opened has admitted only a handful of raw lifters since.",
    iconDescription: "A colossal iron gate marked '600' swinging open onto engraved sunrays, a bench as the threshold stone.",
    requirements: [lift("bench", 272)],
  },

  // ═══ THE DEADLIFT — "The Grave Robber's Art" ══════════════════════════════
  {
    id: "deadlift-80", name: "Breaking Ground", category: "deadlift", rarity: "common",
    lore: "The first pull that fights back. Eighty kilos leaves the floor and something in you signs a contract.",
    iconDescription: "A shovel and a barbell crossed like heraldic arms over broken engraved earth.",
    requirements: [lift("deadlift", 80)],
  },
  {
    id: "deadlift-100", name: "The First Quintal", category: "deadlift", rarity: "common",
    lore: "One hundred kilograms off the floor — the old traders called it a quintal, and moving one bought you a day's wage.",
    iconDescription: "Woodcut dockworker hoisting a grain sack stamped '100', harbor scales in the background.",
    requirements: [lift("deadlift", 100)],
  },
  {
    id: "deadlift-140", name: "Three Plate Pull", category: "deadlift", rarity: "common",
    lore: "Three plates a side, straight bar, no straps required by law but forgiven by history.",
    iconDescription: "Three plates as tree rings on a sawn oak stump, a bar grown through the middle.",
    requirements: [lift("deadlift", 140)],
  },
  {
    id: "deadlift-180", name: "Four Plate Harvest", category: "deadlift", rarity: "uncommon",
    lore: "Four plates is the first harvest — the pull where grip, back, and will must all come to market together.",
    iconDescription: "Engraved wheat sheaf bound by a barbell collar, sickle resting on four stacked plates.",
    requirements: [lift("deadlift", 180)],
  },
  {
    id: "deadlift-220", name: "Five Plate Reaping", category: "deadlift", rarity: "uncommon",
    lore: "Two hundred twenty kilograms. The bar bows slightly in the middle, as is proper when greeting royalty.",
    iconDescription: "A hooded reaper figure whose scythe is a bent barbell with five plates, engraved in respectful, not grim, style.",
    requirements: [lift("deadlift", 220)],
  },
  {
    id: "deadlift-260", name: "Six Plate Requiem", category: "deadlift", rarity: "rare",
    lore: "Six plates a side is a requiem for every excuse you ever kept. They are all buried under the bar now.",
    iconDescription: "Engraved organ pipes made of barbells, sheet music whose notes are small plates.",
    requirements: [lift("deadlift", 260)],
  },
  {
    id: "deadlift-300", name: "Sigmarsson's Cry", category: "deadlift", rarity: "rare",
    lifter: "Jón Páll Sigmarsson", era: "1980s · Iceland",
    lore: "\"There is no reason to be alive if you can't do deadlift!\" roared Jón Páll Sigmarsson, four-time World's Strongest Man. Three hundred kilos is where the Viking starts listening.",
    iconDescription: "Engraved Viking with braided beard mid-pull, aurora borealis as hatched ribbons behind, runic border.",
    requirements: [lift("deadlift", 300)],
  },
  {
    id: "deadlift-330", name: "Goerner's One-Hand Shadow", category: "deadlift", rarity: "epic",
    lifter: "Hermann Goerner", era: "1920 · Leipzig",
    lore: "In 1920 Hermann Goerner deadlifted 330 kg — with one hand. Doing it with two, a century later, earns you the right to stand in his shadow.",
    iconDescription: "Encyclopedia plate of a mustached strongman pulling a colossal bar one-handed, the free hand behind his back, Leipzig skyline engraved behind.",
    requirements: [lift("deadlift", 330)],
  },
  {
    id: "deadlift-360", name: "Eight Wheels Rolling", category: "deadlift", rarity: "epic",
    lore: "Eight plates a side. The floor flexes, the room goes quiet, and physics files a formal complaint.",
    iconDescription: "A locomotive whose eight wheels are barbell plates, steam as engraved spirals, 'IRON EXPRESS' on the boiler.",
    requirements: [lift("deadlift", 360)],
  },
  {
    id: "deadlift-409", name: "Coan's 901", category: "deadlift", rarity: "legendary",
    lifter: "Ed Coan", era: "1991 · 901 lb at 220",
    lore: "Ed Coan pulled 901 lb weighing barely 100 kg himself — pound for pound, perhaps the greatest single feat in powerlifting history.",
    iconDescription: "A modest-sized engraved figure pulling a bar that bends like a horseshoe, '901' in a rays-of-glory cartouche above.",
    requirements: [lift("deadlift", 409)],
  },
  {
    id: "deadlift-455", name: "The Thousand-Pound Pull", category: "deadlift", rarity: "legendary",
    lifter: "Andy Bolton", era: "2006 · First past 1,000 lb",
    lore: "Andy Bolton was the first human to deadlift 1,000 lb. Four hundred fifty-five kilos: the four-digit door, opened once, never closed since.",
    iconDescription: "A vault door with '1000' on the dial, its handle a barbell, engraved steel texture with rivets.",
    requirements: [lift("deadlift", 455)],
  },
  {
    id: "deadlift-500", name: "The Half-Tonne", category: "deadlift", rarity: "legendary",
    lifter: "Eddie Hall & Hafþór Björnsson", era: "2016 / 2020",
    lore: "Eddie Hall pulled 500 kg in 2016 and paid for it in blood; Hafþór Björnsson answered with 501 in 2020. This is the current edge of the human ledger.",
    iconDescription: "Two engraved titans back to back holding one immense bar, a split banner reading 500 | 501, lightning crack between them.",
    requirements: [lift("deadlift", 500)],
  },

  // ═══ THE OVERHEAD PRESS — "The Skyward Court" ═════════════════════════════
  {
    id: "press-40", name: "Skyward Beginnings", category: "press", rarity: "common",
    lore: "Forty kilos pressed strictly overhead. The oldest lift in the book has opened its first page for you.",
    iconDescription: "Small engraved figure pressing a bar toward a woodcut sun with a face, clouds as crosshatching.",
    requirements: [lift("ohp", 40)],
  },
  {
    id: "press-55", name: "The Strict Oath", category: "press", rarity: "common",
    lore: "No knee bend, no lean-back theatrics. Fifty-five kilos, pressed like the old federations demanded, before they gave up refereeing it.",
    iconDescription: "A hand on an anatomy book swearing an oath, barbell as the horizon line, judge's bell in the corner.",
    requirements: [lift("ohp", 55)],
  },
  {
    id: "press-70", name: "Two Plates Aloft", category: "press", rarity: "uncommon",
    lore: "Seventy kilos locked out overhead — a plate a side and change, held where the ceiling can inspect it.",
    iconDescription: "Atlas figure holding not a globe but two plates aloft, engraved star map behind.",
    requirements: [lift("ohp", 70)],
  },
  {
    id: "press-85", name: "Grimek's Posture", category: "press", rarity: "rare",
    lifter: "John Grimek", era: "1940s · York, PA",
    lore: "John Grimek — Olympic lifter, Mr. America, never beaten in a physique contest — pressed heavy and posed like marble. Eighty-five strict kilos honors the York standard.",
    iconDescription: "Engraved figure in a classical double-biceps pose atop a York barbell plate pedestal, museum plaque below.",
    requirements: [lift("ohp", 85)],
  },
  {
    id: "press-100", name: "The Century Overhead", category: "press", rarity: "rare",
    lore: "One hundred kilograms pressed from collarbone to lockout. The rarest of the round numbers — most lifters die wondering.",
    iconDescription: "The number 100 held overhead by a tiny engraved figure, the zeroes as plates, serif numerals like a stone inscription.",
    requirements: [lift("ohp", 100)],
  },
  {
    id: "press-115", name: "Davis's Standard", category: "press", rarity: "epic",
    lifter: "John Davis", era: "1951 · First 400 lb clean & jerk",
    lore: "John Davis went unbeaten in world competition for fifteen years and was first to put 400 lb overhead. One hundred fifteen strict kilos is a telegram to his era.",
    iconDescription: "Engraved podium scene, a lifter at lockout under stadium floodlights drawn as engraved starbursts, 1950s singlet.",
    requirements: [lift("ohp", 115)],
  },
  {
    id: "press-130", name: "Sandwina's Center Ring", category: "press", rarity: "epic",
    lifter: "Katie Sandwina", era: "1900s · The Circus Queen",
    lore: "Katie Sandwina lifted her 75-kilo husband overhead nightly in the center ring and once out-lifted Eugen Sandow himself. One-thirty overhead earns her curtsy.",
    iconDescription: "Circus poster woodcut: a woman in a star-spangled leotard pressing a man in a suit overhead with one arm, bunting borders.",
    requirements: [lift("ohp", 130)],
  },
  {
    id: "press-150", name: "Saxon's Impossible Angle", category: "press", rarity: "legendary",
    lifter: "Arthur Saxon", era: "1905 · The Iron Master",
    lore: "Arthur Saxon bent-pressed 168 kg with one arm in 1905 — a record no one has honestly broken. One hundred fifty kilos with two arms is the polite modern tribute.",
    iconDescription: "Engraved strongman leaning at an impossible angle under a one-arm bell, geometric overlay showing the bent-press angles like a Vitruvian diagram.",
    requirements: [lift("ohp", 150)],
  },

  // ═══ THE BARBELL ROW — "Assistance Arsenal" ═══════════════════════════════
  {
    id: "row-60", name: "The Oarsman", category: "assistance", rarity: "common",
    lore: "Sixty kilos rowed to the ribs. Every great pull is built stroke by stroke, like a galley crossing.",
    iconDescription: "Woodcut galley ship whose oars are barbells, waves as engraved scrollwork.",
    requirements: [lift("row", 60)],
  },
  {
    id: "row-80", name: "Deck Hand's Due", category: "assistance", rarity: "common",
    lore: "Eighty kilos, strict off the floor or from the hang — the wage of a thousand honest strokes.",
    iconDescription: "A rope-wrapped barbell coiled like ship's rigging, anchor stamped with '80'.",
    requirements: [lift("row", 80)],
  },
  {
    id: "row-100", name: "The Iron Wake", category: "assistance", rarity: "uncommon",
    lore: "A hundred-kilo row leaves a wake: lats like rudders, a deadlift that suddenly feels lighter.",
    iconDescription: "Back musculature drawn as an anatomical engraving merging into a ship's wake pattern.",
    requirements: [lift("row", 100)],
  },
  {
    id: "row-140", name: "Yates's Shadow Row", category: "assistance", rarity: "rare",
    lifter: "Dorian Yates", era: "1990s · Temple Gym, Birmingham",
    lore: "In a Birmingham basement, Dorian Yates rowed his way to six Olympias with underhand pulls that bordered on violence. One-forty earns a nod from the shadow.",
    iconDescription: "A dim engraved basement gym, one shaft of light on a figure rowing, dust motes as stipple.",
    requirements: [lift("row", 140)],
  },
  {
    id: "row-180", name: "The Longshoreman", category: "assistance", rarity: "epic",
    lore: "One hundred eighty kilos rowed with intent. Dockworkers of the old ports moved this daily — but never for sets across.",
    iconDescription: "Woodcut longshoreman hauling a cargo net full of plates up a pier, cranes engraved behind.",
    requirements: [lift("row", 180)],
  },

  // ═══ THE TOTAL — "Total Dominance" ════════════════════════════════════════
  {
    id: "total-300", name: "The Quarter-Tonne and Change", category: "total", rarity: "common",
    lore: "Squat, bench, and deadlift summing to 300 kg. The three rivers have met, and the current has direction.",
    iconDescription: "Three engraved rivers converging into one, each riverbed lined with plates, compass rose in the corner.",
    requirements: [total(300)],
  },
  {
    id: "total-400", name: "The 400 Assembly", category: "total", rarity: "uncommon",
    lore: "Four hundred kilos across the big three. The assembly is called to order; you are now a matter of record.",
    iconDescription: "Three barbells arranged as a triangle seal around the number 400, wax-stamp style engraving.",
    requirements: [total(400)],
  },
  {
    id: "total-500", name: "Half-Tonne Union", category: "total", rarity: "uncommon",
    lore: "Half a tonne, split three ways between the squat, the bench, and the pull. The union is ratified in chalk.",
    iconDescription: "Two engraved hands shaking through a barbell ring, '500' stamped above like a treaty seal.",
    requirements: [total(500)],
  },
  {
    id: "total-600", name: "Cyr's Cornerstone", category: "total", rarity: "rare",
    lifter: "Louis Cyr", era: "1880s · Québec",
    lore: "Louis Cyr once back-lifted a platform holding eighteen men. A 600-kilo total lays the cornerstone of the kind of strength his century whispered about.",
    iconDescription: "Woodcut of a barrel-chested Victorian strongman beneath a wooden platform crowded with top-hatted men, fleur-de-lis border.",
    requirements: [total(600)],
  },
  {
    id: "total-725", name: "Todd's Sixteen Hundred", category: "total", rarity: "rare",
    lifter: "Terry Todd", era: "1965 · Scholar of Strength",
    lore: "Terry Todd was the first man to total 1,600 lb in competition — then spent a lifetime archiving iron history at the Stark Center. Match his number and you enter his bibliography.",
    iconDescription: "An open leather ledger whose pages show a lifter mid-squat, reading spectacles resting on a plate, engraved library shelves behind.",
    requirements: [total(725)],
  },
  {
    id: "total-800", name: "The Eight Hundred Brotherhood", category: "total", rarity: "epic",
    lore: "An 800-kilo total. In any gym in the world, on any day of the week, this is strength that requires no translation.",
    iconDescription: "Eight engraved torches held aloft in a circle around a loaded bar, brotherhood crest style.",
    requirements: [total(800)],
  },
  {
    id: "total-900", name: "Kazmaier's Company", category: "total", rarity: "epic",
    lifter: "Bill Kazmaier", era: "1981",
    lore: "Kaz totaled over 1,100 kg when the bar was rusty and the wraps were cloth. At 900 you may carry his chalk bucket — an honor, to be clear.",
    iconDescription: "A chalk bucket engraved with 'KAZ', a colossal shadow falling across it, gym window light in hatched beams.",
    requirements: [total(900)],
  },
  {
    id: "total-1000", name: "The Grand Tonne", category: "total", rarity: "legendary",
    lore: "One thousand kilograms across three lifts. A metric tonne of ambition, delivered in full, signed for by your spine.",
    iconDescription: "A freight scale reading 1000, three barbells stacked on its platform, engraved Victorian machinery flourishes.",
    requirements: [total(1000)],
  },
  {
    id: "total-1100", name: "Coan's Communion", category: "total", rarity: "legendary",
    lifter: "Ed Coan", era: "1991 · 71 world records",
    lore: "Ed Coan set 71 world records and totaled over 1,100 kg at 100 kg bodyweight. To total eleven hundred is to take communion in his church, whatever you weigh.",
    iconDescription: "A small engraved chapel whose steeple is a barbell standing on end, stained-glass windows showing S, B, and D silhouettes.",
    requirements: [total(1100)],
  },

  // ═══ POUND FOR POUND — "The Relative Court" ═══════════════════════════════
  {
    id: "p4p-bench-1", name: "Your Own Weight, Pressed", category: "pound-for-pound", rarity: "uncommon",
    lore: "Bench press your own bodyweight and you have, in the oldest accounting of the iron game, broken even.",
    iconDescription: "A balance scale with a lifter on one pan and a loaded barbell on the other, needle at dead center.",
    requirements: [bw("bench", 1)],
  },
  {
    id: "p4p-bench-15", name: "The Anvil Ratio", category: "pound-for-pound", rarity: "rare",
    lore: "One and a half bodyweights off the chest. The anvil now weighs less than the hammer.",
    iconDescription: "An anvil balanced atop a smaller anvil, engraved ratio markings 3:2 like a draftsman's note.",
    requirements: [bw("bench", 1.5)],
  },
  {
    id: "p4p-bench-2", name: "Eder's Wings", category: "pound-for-pound", rarity: "epic",
    lifter: "Marvin Eder", era: "1953 · 510 lb at 198",
    lore: "Marvin Eder benched 510 lb at 198 bodyweight in the early fifties — dip-belted legend, pound-for-pound pressing that still hasn't aged. Double bodyweight puts you on his flight path.",
    iconDescription: "Engraved pectorals rendered as spread eagle wings over a bench, 510 stamped on a feather.",
    requirements: [bw("bench", 2)],
  },
  {
    id: "p4p-bench-25", name: "The Impossible Press", category: "pound-for-pound", rarity: "legendary",
    lore: "Two and a half times your own body, pressed to lockout. Physiology textbooks decline to comment.",
    iconDescription: "A figure pressing a bar loaded with two and a half copies of himself, drawn as nested Vitruvian outlines.",
    requirements: [bw("bench", 2.5)],
  },
  {
    id: "p4p-squat-15", name: "Carrying Yourself and Half", category: "pound-for-pound", rarity: "uncommon",
    lore: "A squat at one and a half bodyweights: you, plus half of you, riding your own spine to depth and back.",
    iconDescription: "A figure squatting with a smaller half-figure sitting on the bar, engraved with gentle humor.",
    requirements: [bw("squat", 1.5)],
  },
  {
    id: "p4p-squat-2", name: "The Two-Fold Descent", category: "pound-for-pound", rarity: "rare",
    lore: "Double bodyweight, below parallel. The classical benchmark of a lower body that keeps its promises.",
    iconDescription: "Two identical engraved figures stacked totem-style on a squatter's back, compass-drawn depth arc.",
    requirements: [bw("squat", 2)],
  },
  {
    id: "p4p-squat-25", name: "Karwoski's Grind", category: "pound-for-pound", rarity: "epic",
    lifter: "Kirk Karwoski", era: "1995 · Captain Kirk",
    lore: "Kirk Karwoski squatted 1,003 lb at 125 kg — walked it out, buried it, racked it, went home. Two and a half bodyweights buys you a seat at his silent table.",
    iconDescription: "A stocky engraved figure under a monstrously bent bar, jaw set, '1003' on a plate rim, no crowd — an empty engraved gym.",
    requirements: [bw("squat", 2.5)],
  },
  {
    id: "p4p-squat-3", name: "The Three-Bodied Squat", category: "pound-for-pound", rarity: "legendary",
    lore: "Three of you, on your back, to depth. The relative court adjourns — there is nothing left to argue.",
    iconDescription: "Three nested Vitruvian figures compressed onto a squat bar, geometric golden-ratio overlay.",
    requirements: [bw("squat", 3)],
  },
  {
    id: "p4p-dead-2", name: "Twice-Born Pull", category: "pound-for-pound", rarity: "uncommon",
    lore: "A double-bodyweight deadlift: the floor gives up two of you at once.",
    iconDescription: "A figure pulling his own mirrored reflection out of engraved ground, plates as ripples.",
    requirements: [bw("deadlift", 2)],
  },
  {
    id: "p4p-dead-25", name: "The Crowbar Ratio", category: "pound-for-pound", rarity: "rare",
    lore: "Two and a half bodyweights off the floor. You are now, mechanically speaking, a crowbar with opinions.",
    iconDescription: "A human spine drawn as an engraved crowbar prying a boulder marked 2.5×, anatomical labels in Latin.",
    requirements: [bw("deadlift", 2.5)],
  },
  {
    id: "p4p-dead-3", name: "Columbu's Paradox", category: "pound-for-pound", rarity: "epic",
    lifter: "Franco Columbu", era: "1970s · The Sardinian",
    lore: "Franco Columbu stood five-foot-five and deadlifted 755 lb — then blew up hot water bottles until they burst, for fun. Triple bodyweight is his paradox: the smaller the man, the longer the shadow.",
    iconDescription: "A compact mustached figure engraved mid-pull, a vastly longer shadow stretching behind him across gym floorboards.",
    requirements: [bw("deadlift", 3)],
  },
  {
    id: "p4p-dead-35", name: "Peoples' Farmhouse Physics", category: "pound-for-pound", rarity: "epic",
    lifter: "Bob Peoples", era: "1949 · Tennessee",
    lore: "Bob Peoples pulled 725 lb at 181 bodyweight in 1949, training in a cellar with equipment he welded himself. Three and a half bodyweights honors the farmhouse.",
    iconDescription: "Woodcut Tennessee farmhouse at dusk, cellar light glowing, a homemade barbell of tractor wheels by the door.",
    requirements: [bw("deadlift", 3.5)],
  },
  {
    id: "p4p-dead-4", name: "Gant's Flight Path", category: "pound-for-pound", rarity: "legendary",
    lifter: "Lamar Gant", era: "1985 · First to 5× bodyweight",
    lore: "Lamar Gant — scoliosis, wingspan like a condor — was the first human to deadlift five times his own bodyweight. Four times yours puts you on his flight path.",
    iconDescription: "A slight engraved figure with exaggerated wingspan pulling a bar, flight-path dotted arcs above like an aviation chart.",
    requirements: [bw("deadlift", 4)],
  },
  {
    id: "p4p-dead-5", name: "The Gant Singularity", category: "pound-for-pound", rarity: "legendary",
    lifter: "Lamar Gant", era: "1985 · 688 lb at 132",
    lore: "Five times bodyweight off the floor. Only Gant has lived here. If you unlock this, the codex would like to verify your video.",
    iconDescription: "An engraved black hole bending gym equipment toward it, a single small figure at the event horizon holding a bar, '5×' as the singularity.",
    requirements: [bw("deadlift", 5)],
  },
  {
    id: "p4p-total-5", name: "Five of You", category: "pound-for-pound", rarity: "rare",
    lore: "A total of five bodyweights across the big three. Wherever you go, five of you go with you.",
    iconDescription: "Five identical engraved figures marching in a row, each carrying one piece of a disassembled barbell.",
    requirements: [totalBw(5)],
  },
  {
    id: "p4p-total-7", name: "Seven-Fold Forged", category: "pound-for-pound", rarity: "epic",
    lore: "Seven bodyweights, totaled. Folded and hammered seven times, like the old swordsmiths claimed and you can prove.",
    iconDescription: "A katana being forged from seven glowing plates, hammer mid-strike, engraved sparks.",
    requirements: [totalBw(7)],
  },
  {
    id: "p4p-total-9", name: "The Nine Bodies Problem", category: "pound-for-pound", rarity: "legendary",
    lore: "Nine times your bodyweight across three lifts. Physicists call it a many-body problem; the platform calls it Tuesday for perhaps a hundred humans alive.",
    iconDescription: "Nine orbiting Vitruvian figures around a barbell sun, drawn as an engraved astronomical chart.",
    requirements: [totalBw(9)],
  },
  {
    id: "p4p-total-11", name: "The Coan Coefficient", category: "pound-for-pound", rarity: "legendary",
    lifter: "Ed Coan",
    lore: "Coan's best total ran past eleven times his bodyweight. This number is named in his honor and, realistically, held in his trust.",
    iconDescription: "A mathematical proof engraved on a chalkboard ending in '≥ 11×', a small figure signing it with a piece of chalk shaped like a barbell.",
    requirements: [totalBw(11)],
  },

  // ═══ REPETITION FEATS — "The Long Furnace" ════════════════════════════════
  {
    id: "reps-squat-100x10", name: "Ten Deep Breaths", category: "repetition", rarity: "uncommon",
    lore: "One hundred kilos, ten times, one set. Somewhere around rep seven the squat becomes a negotiation; you won.",
    iconDescription: "Ten engraved lung diagrams in a row, each smaller and more furious than the last, barbell as the baseline.",
    requirements: [reps("squat", 100, 10)],
  },
  {
    id: "reps-squat-140x10", name: "The Breathing Squat", category: "repetition", rarity: "rare",
    lore: "Three plates for ten. The old-timers built entire physiques on one set of these and a quart of milk.",
    iconDescription: "Engraved milk bottle beside a squat rack, steam rising off a lifter's back like a draft horse in winter.",
    requirements: [reps("squat", 140, 10)],
  },
  {
    id: "reps-squat-140x20", name: "Rader's Milk Ritual", category: "repetition", rarity: "epic",
    lifter: "Peary Rader", era: "1930s · Iron Man founder",
    lore: "Peary Rader gained 75 lb of bodyweight on twenty-rep squats and faith, then founded Iron Man to spread the gospel. Twenty reps at one-forty is the full ritual.",
    iconDescription: "A woodcut altar with a squat bar across it, twenty tally marks carved into the rack post, a milk bottle as the chalice.",
    requirements: [reps("squat", 140, 20)],
  },
  {
    id: "reps-squat-227x23", name: "The Platz Communion", category: "repetition", rarity: "legendary",
    lifter: "Tom Platz", era: "1992 · 500 lb × 23",
    lore: "In 1992, Tom Platz took 500 lb and squatted it twenty-three times to settle a bet with science. Science has not fully recovered. Neither will you.",
    iconDescription: "Engraved legs like cathedral columns under a bar, '×23' burning above like a comet, audience as stippled awe.",
    requirements: [reps("squat", 227, 23)],
  },
  {
    id: "reps-bench-100x10", name: "Century Repeater", category: "repetition", rarity: "uncommon",
    lore: "One hundred kilos for ten. The bar touches, the bar leaves, ten times, like a metronome with a grudge.",
    iconDescription: "An engraved metronome whose pendulum is a barbell, ten tick marks in its arc.",
    requirements: [reps("bench", 100, 10)],
  },
  {
    id: "reps-bench-140x10", name: "The Piston", category: "repetition", rarity: "rare",
    lore: "Three plates for ten strokes, smooth as machinery. Somewhere, a steam engine feels replaced.",
    iconDescription: "Cutaway engraving of a steam piston whose rod is a barbell, pressure gauge reading ×10.",
    requirements: [reps("bench", 140, 10)],
  },
  {
    id: "reps-dead-140x15", name: "The Long Harvest", category: "repetition", rarity: "rare",
    lore: "Fifteen pulls at one-forty without setting the bar down for good. The field is cleared; your hands have the receipts.",
    iconDescription: "Fifteen sheaves of engraved wheat in a row, a chalked hand print on the last one.",
    requirements: [reps("deadlift", 140, 15)],
  },
  {
    id: "reps-dead-180x10", name: "Ten Heavy Suns", category: "repetition", rarity: "epic",
    lore: "Four plates for ten. Each rep rises like a sun and sets like one — and you made a day of it.",
    iconDescription: "Ten engraved suns arcing over a deadlift bar horizon, the tenth setting blood-red.",
    requirements: [reps("deadlift", 180, 10)],
  },
  {
    id: "reps-ohp-60x10", name: "Skyline Repeats", category: "repetition", rarity: "uncommon",
    lore: "Sixty kilos overhead, ten times. You have built a skyline out of lockouts.",
    iconDescription: "A city skyline where every tower is a locked-out press silhouette, engraved cloud bank behind.",
    requirements: [reps("ohp", 60, 10)],
  },

  // ═══ DEDICATION — "The Keeper's Ledger" ═══════════════════════════════════
  {
    id: "ded-workout-1", name: "The First Forging", category: "dedication", rarity: "common",
    lore: "One workout, logged. Every codex, even this one, begins with a single entry in an unsteady hand.",
    iconDescription: "A quill dipping into an inkwell shaped like a barbell collar, first line written on parchment.",
    requirements: [workouts(1)],
  },
  {
    id: "ded-workout-5", name: "Kindling the Furnace", category: "dedication", rarity: "common",
    lore: "Five sessions. The fire is small but it no longer goes out on its own.",
    iconDescription: "Five engraved kindling sticks arranged under a plate like a cauldron, first flames as fine hatching.",
    requirements: [workouts(5)],
  },
  {
    id: "ded-workout-10", name: "Ten Trips to the Temple", category: "dedication", rarity: "common",
    lore: "Ten workouts. The gym has stopped being a place you visit and started being a place you return to.",
    iconDescription: "A worn footpath engraved between a small house and a temple with barbell columns, ten footprints.",
    requirements: [workouts(10)],
  },
  {
    id: "ded-workout-25", name: "A Quarter Hundred", category: "dedication", rarity: "uncommon",
    lore: "Twenty-five sessions in the ledger. Habits are made of exactly this.",
    iconDescription: "An engraved ledger page with 25 ruled entries, a wax seal of a barbell at the bottom.",
    requirements: [workouts(25)],
  },
  {
    id: "ded-workout-50", name: "Fifty Doors Opened", category: "dedication", rarity: "uncommon",
    lore: "Fifty times you chose the door with the chalk dust behind it. It opens easier now.",
    iconDescription: "A heavy gym door ajar with light pouring out, 50 keyholes down its edge, engraved oak.",
    requirements: [workouts(50)],
  },
  {
    id: "ded-workout-100", name: "Centurion of the Iron", category: "dedication", rarity: "rare",
    lore: "One hundred workouts. In Rome they gave you a century to command; here you command the rack, which argues less.",
    iconDescription: "Roman centurion helmet resting on a barbell, C stamped on the cheek guard, laurel border.",
    requirements: [workouts(100)],
  },
  {
    id: "ded-workout-200", name: "The Two Hundred March", category: "dedication", rarity: "epic",
    lore: "Two hundred sessions. Programs came and went; you remained. That was the program.",
    iconDescription: "A long engraved column of marching figures each carrying a plate, road milestone reading CC.",
    requirements: [workouts(200)],
  },
  {
    id: "ded-workout-365", name: "A Year of Iron, Counted", category: "dedication", rarity: "epic",
    lore: "Three hundred sixty-five workouts — a full year's worth of days, not necessarily consecutive, entirely undeniable.",
    iconDescription: "An engraved calendar wheel with 365 teeth, each tooth a tiny barbell, sun and moon at the axle.",
    requirements: [workouts(365)],
  },
  {
    id: "ded-workout-500", name: "Five Hundred Bells Rung", category: "dedication", rarity: "legendary",
    lore: "Five hundred sessions. Somewhere in a quiet tower of the iron cathedral, a bell has been rung for each.",
    iconDescription: "A cathedral bell tower where the bells are kettlebells, 500 engraved on the great bell, rope pulled by a chalked hand.",
    requirements: [workouts(500)],
  },
  {
    id: "ded-workout-1000", name: "Milo's Devotion", category: "dedication", rarity: "legendary",
    lifter: "Milo of Croton", era: "6th century BC",
    lore: "Milo carried the calf every day until it was a bull, and the world learned progressive overload. A thousand workouts is the modern translation of that walk.",
    iconDescription: "Greek vase-style engraving of a man carrying a bull across his shoulders, olive branch border, 1000 in Greek numerals.",
    requirements: [workouts(1000)],
  },
  {
    id: "ded-streak-2", name: "Two Weeks Unbroken", category: "dedication", rarity: "common",
    lore: "Two consecutive weeks of training. The chain has its first links.",
    iconDescription: "Two chain links engraved as barbell collars joined together.",
    requirements: [streak(2)],
  },
  {
    id: "ded-streak-4", name: "The Month of Discipline", category: "dedication", rarity: "uncommon",
    lore: "Four straight weeks. Motivation got you the first; discipline signed for the other three.",
    iconDescription: "Four moon phases engraved above a barbell horizon, each moon a plate.",
    requirements: [streak(4)],
  },
  {
    id: "ded-streak-8", name: "Eight-Week Oath", category: "dedication", rarity: "uncommon",
    lore: "Eight consecutive weeks under the bar. Most programs are written for this long because most oaths break here. Yours didn't.",
    iconDescription: "A parchment oath with eight wax seals in a column, each seal a plate stamped with a numeral.",
    requirements: [streak(8)],
  },
  {
    id: "ded-streak-12", name: "The Season of Steel", category: "dedication", rarity: "rare",
    lore: "Twelve weeks — a full season — without a broken week. Crops have been raised on less consistency.",
    iconDescription: "Engraved four-panel seasons illustration where every season shows the same figure lifting, only the trees change.",
    requirements: [streak(12)],
  },
  {
    id: "ded-streak-26", name: "Half-Year Hymn", category: "dedication", rarity: "epic",
    lore: "Twenty-six weeks unbroken. The iron has learned your name and hums it when you walk in.",
    iconDescription: "An engraved hymnal open to a page where the musical notes are dumbbells, 26 verses numbered.",
    requirements: [streak(26)],
  },
  {
    id: "ded-streak-52", name: "The Unbroken Year", category: "dedication", rarity: "legendary",
    lore: "Fifty-two weeks. Not one week surrendered — not to holidays, not to weather, not to the thousand good reasons. A full lap of the sun, under load.",
    iconDescription: "An ouroboros made of a barbell bending into a circle, 52 links engraved along its length, solar rays behind.",
    requirements: [streak(52)],
  },
  {
    id: "ded-pr-1", name: "First Blood on the Bar", category: "dedication", rarity: "common",
    lore: "Your first personal record. The old you held this ground; the new you took it.",
    iconDescription: "A flag planted on a small hill made of a single plate, drop of red at the flag tip.",
    requirements: [prs(1)],
  },
  {
    id: "ded-pr-10", name: "Ten Notches", category: "dedication", rarity: "uncommon",
    lore: "Ten personal records carved into the ledger. The bar keeps count even when you don't.",
    iconDescription: "A barbell sleeve with ten notches carved like a gunslinger's grip, engraved close-up.",
    requirements: [prs(10)],
  },
  {
    id: "ded-pr-25", name: "The Record Keeper", category: "dedication", rarity: "rare",
    lore: "Twenty-five PRs. At this point you are less an athlete with records and more a record with an athlete attached.",
    iconDescription: "A hooded archivist shelving plates like books in an engraved library, each spine dated.",
    requirements: [prs(25)],
  },
  {
    id: "ded-pr-50", name: "Fifty Flags Planted", category: "dedication", rarity: "epic",
    lore: "Fifty personal bests. The map of your limits is now mostly flags.",
    iconDescription: "An engraved mountain range with fifty tiny flags along the ridgeline, each flag a plate on a pole.",
    requirements: [prs(50)],
  },
  {
    id: "ded-pr-100", name: "The Cartographer of Limits", category: "dedication", rarity: "legendary",
    lore: "One hundred personal records. You no longer find your limits — you draw them, then redraw them.",
    iconDescription: "An old cartographer's map where the coastlines are barbell curves, a compass rose of plates, 'HIC SUNT PONDERA' in the margin.",
    requirements: [prs(100)],
  },

  // ═══ THE GOLDEN ERA — "Plates of the Ancients" ════════════════════════════
  {
    id: "gold-park-powerfest", name: "Reg Park's 1970 Power Fest", category: "golden-era", rarity: "epic",
    lifter: "Reg Park", era: "1950s–70s · 3× Mr. Universe",
    lore: "Reg Park — Hercules on screen, blacksmith at heart — preached five-hundred-pound strength as the foundation of a legendary physique, and Arnold listened. Match this triple and the Power Fest is yours.",
    iconDescription: "Encyclopedia plate of a leonine 1950s bodybuilder in a Hercules pose atop three pedestals labeled S, B, D, film-reel border.",
    requirements: [lift("squat", 200), lift("bench", 200), lift("deadlift", 227)],
  },
  {
    id: "gold-park-500", name: "First Bodybuilder to Five Hundred", category: "golden-era", rarity: "legendary",
    lifter: "Reg Park", era: "1957",
    lore: "In 1957 Reg Park became the first bodybuilder to bench 500 lb, settling forever the argument that beauty and brutality can share a barbell.",
    iconDescription: "A classical marble statue bench-pressing on a museum plinth, '500' chiseled into the base, engraved gallery light.",
    requirements: [lift("bench", 227), total(700)],
  },
  {
    id: "gold-hepburn-miracle", name: "Hepburn's Vancouver Miracle", category: "golden-era", rarity: "epic",
    lifter: "Doug Hepburn", era: "1953 · World Champion",
    lore: "Born with a club foot, told to sit out, Doug Hepburn made himself the strongest man on earth and the first to officially bench 500 lb. The miracle was mostly singles, patience, and spite.",
    iconDescription: "Engraved figure rising from a wooden chair toward a loaded bench, crutch left behind, Vancouver harbor through the window.",
    requirements: [lift("bench", 227), lift("ohp", 100)],
  },
  {
    id: "gold-hepburn-method", name: "The Hepburn Progression", category: "golden-era", rarity: "rare",
    lifter: "Doug Hepburn",
    lore: "Hepburn's method: add a single rep a week, forever, and let arithmetic make you a monster. Twenty-five PRs and a serious bench prove you've read the manuscript.",
    iconDescription: "A staircase of plates ascending into clouds, each step numbered +1, engraved instructional-diagram style.",
    requirements: [prs(25), lift("bench", 180)],
  },
  {
    id: "gold-arnold-oak", name: "The Austrian Oak's Ascent", category: "golden-era", rarity: "legendary",
    lifter: "Arnold Schwarzenegger", era: "1960s–70s · 7× Mr. Olympia",
    lore: "Before the Olympias, Arnold was a powerlifter — a 322-kilo deadlift and a 240-plus squat built the trunk of the Austrian Oak. Climb his early numbers and the crown branches are visible.",
    iconDescription: "A great oak whose trunk is a flexing back double-biceps silhouette, roots gripping barbell plates, alpine peaks engraved behind.",
    requirements: [lift("squat", 240), lift("bench", 200), lift("deadlift", 320)],
  },
  {
    id: "gold-pumping-iron", name: "Pumping Iron Pilgrimage", category: "golden-era", rarity: "rare",
    era: "1975 · Gold's Gym, Venice",
    lore: "The summer of 1975 at Gold's Venice: chalk in the air, a camera crew in the corner, and the pump elevated to philosophy. Thirty logged sessions and a three-plate bench earn your day pass.",
    iconDescription: "Woodcut of the original Gold's Gym facade, bicycles outside, sun as an engraved plate rising over the Pacific.",
    requirements: [workouts(30), lift("bench", 140)],
  },
  {
    id: "gold-sandow-ideal", name: "Sandow's Grecian Ideal", category: "golden-era", rarity: "uncommon",
    lifter: "Eugen Sandow", era: "1890s · Father of Bodybuilding",
    lore: "Eugen Sandow measured his body against the statues of Greece and charged admission to the result. A 400 total and a month of discipline is how the ideal begins.",
    iconDescription: "Victorian cabinet-card engraving of a mustached strongman posing in a leopard skin beside a Greek column, calipers in the margin.",
    requirements: [total(400), streak(4)],
  },
  {
    id: "gold-grimek-line", name: "Grimek's Unbeaten Line", category: "golden-era", rarity: "rare",
    lifter: "John Grimek", era: "1940s · Retired undefeated",
    lore: "John Grimek entered his last physique contest in 1949 and retired having never lost — an Olympic lifter who out-muscled the bodybuilders and out-lifted the posers.",
    iconDescription: "An unbroken engraved laurel line running across a stage, barbell at one end, trophy at the other.",
    requirements: [lift("ohp", 85), lift("squat", 180)],
  },
  {
    id: "gold-reeves-finish", name: "Reeves's Fingertip Finish", category: "golden-era", rarity: "rare",
    lifter: "Steve Reeves", era: "1950 · Mr. Universe",
    lore: "Steve Reeves deadlifted off plate rims with his fingertips and looked like the reason sculpture was invented. Strength worn this lightly still had four hundred pounds under it.",
    iconDescription: "An elegant engraved hand gripping a plate rim by the fingertips, classical profile watermark, cypress trees behind.",
    requirements: [lift("deadlift", 180), lift("row", 100)],
  },
  {
    id: "gold-cyr-platform", name: "Cyr's Eighteen Passengers", category: "golden-era", rarity: "epic",
    lifter: "Louis Cyr", era: "1895 · Montréal",
    lore: "Louis Cyr back-lifted a platform carrying eighteen men — over 4,000 lb by the newspapers' count. Your barbell total of 600, plus 75 faithful sessions, buys a seat on the platform.",
    iconDescription: "Woodcut of eighteen top-hatted Victorian gentlemen seated on a wooden platform across one man's back, newspaper masthead border.",
    requirements: [total(600), workouts(75)],
  },
  {
    id: "gold-saxon-show", name: "Saxon's Traveling Show", category: "golden-era", rarity: "epic",
    lifter: "Arthur Saxon", era: "1900s",
    lore: "The Saxon Trio toured Europe challenging any man to match Arthur's bent press for money. None ever collected. This entry is the codex's standing wager.",
    iconDescription: "A circus wagon engraved with strongman posters, a bent-press silhouette painted on its side, coins nailed to the challenge board.",
    requirements: [lift("ohp", 115), lift("deadlift", 220)],
  },
  {
    id: "gold-goerner-ledger", name: "Goerner's Leipzig Ledger", category: "golden-era", rarity: "epic",
    lifter: "Hermann Goerner", era: "1920s · Leipzig",
    lore: "Hermann Goerner juggled kettlebells, wrestled elephants for the circus, and left a ledger of grip feats no one has fully balanced since.",
    iconDescription: "An engraved circus elephant standing beside a strongman comparing forearms, ledger book open at their feet.",
    requirements: [lift("deadlift", 300), prs(10)],
  },
  {
    id: "gold-anderson-bells", name: "Anderson's Church Bells", category: "golden-era", rarity: "legendary",
    lifter: "Paul Anderson", era: "1956 · Olympic Champion",
    lore: "Paul Anderson preached in churches and squatted like judgment day. The strongest man of his century, built in a backyard with concrete and scripture.",
    iconDescription: "A country church whose bell is a giant barbell plate swinging in the tower, engraved Georgia pines, dirt road.",
    requirements: [lift("squat", 260), lift("ohp", 130)],
  },
  {
    id: "gold-kono-crown", name: "Kono's Traveling Crown", category: "golden-era", rarity: "epic",
    lifter: "Tommy Kono", era: "1952–1960 · Two Olympic golds",
    lore: "Tommy Kono learned to lift in a wartime internment camp, then won Olympic gold in two different weight classes and set world records in four. Consistency was his only nationality.",
    iconDescription: "An engraved suitcase covered in travel stamps that are all barbell plates, two gold medals as luggage tags.",
    requirements: [total(700), streak(12)],
  },
  {
    id: "gold-eder-afternoon", name: "Eder's Impossible Afternoon", category: "golden-era", rarity: "epic",
    lifter: "Marvin Eder", era: "1950s",
    lore: "Marvin Eder dipped with 435 lb hanging from his waist and pressed men overhead between sets. His afternoons remain, pound for pound, unrepeated.",
    iconDescription: "Engraved figure performing a dip with plates chained to a belt, afternoon sun through skylights as hatched beams.",
    requirements: [bw("bench", 2), lift("ohp", 100)],
  },
  {
    id: "gold-casey-600", name: "Pat Casey's Six Hundred", category: "golden-era", rarity: "legendary",
    lifter: "Pat Casey", era: "1967",
    lore: "Pat Casey — the first 600 lb bench, the first 800 squat — trained in obscurity and left numbers that outlived every headline that ignored him.",
    iconDescription: "A dusty engraved garage gym with two stone tablets leaning on the wall reading 600 and 800.",
    requirements: [lift("bench", 272), lift("squat", 260)],
  },
  {
    id: "gold-williams-bench", name: "Jim Williams's Iron Yard", category: "golden-era", rarity: "legendary",
    lifter: "Jim Williams", era: "1972 · 675 lb bench",
    lore: "Jim Williams benched 675 lb in 1972 in a plain t-shirt, much of his training done behind prison walls. The bar did not ask where he learned.",
    iconDescription: "High engraved walls with a single shaft of light on a bench press, 675 chalked on stone, sparrows on the razor wire.",
    requirements: [lift("bench", 250), workouts(200)],
  },
  {
    id: "gold-todd-scholar", name: "The Scholar-Strongman", category: "golden-era", rarity: "epic",
    lifter: "Terry Todd", era: "1965 → Stark Center",
    lore: "Terry Todd totaled 1,600 lb before anyone else, then built the world's great archive of physical culture. Lift heavy, keep records — this app is his footnote.",
    iconDescription: "An engraved scholar's desk: barbell as paperweight, spectacles on a manuscript titled 'IRON', library ladder to shelves of plates.",
    requirements: [total(725), workouts(100)],
  },
  {
    id: "gold-coan-church", name: "Coan's Quiet Church", category: "golden-era", rarity: "legendary",
    lifter: "Ed Coan", era: "1980s–90s",
    lore: "Ed Coan never yelled, never missed openers, and set 71 world records with the demeanor of a man returning library books. This is the highest room in the codex with a door.",
    iconDescription: "A small engraved figure calmly chalking up in an empty church of racks, 71 candles burning along the walls.",
    requirements: [total(1000), totalBw(9)],
  },
  {
    id: "gold-kaz-curtain", name: "Kazmaier's Iron Curtain", category: "golden-era", rarity: "legendary",
    lifter: "Bill Kazmaier", era: "1980–82 · World's Strongest Man",
    lore: "They stopped inviting Kaz to World's Strongest Man because he kept winning it. The iron curtain he drew across the early eighties has his name woven through it.",
    iconDescription: "A theater curtain woven from barbell chains being drawn by a colossal engraved figure, WSM laurels above the proscenium.",
    requirements: [lift("bench", 250), total(900)],
  },
  {
    id: "gold-sigmarsson-alive", name: "A Reason to Be Alive", category: "golden-era", rarity: "epic",
    lifter: "Jón Páll Sigmarsson", era: "1984–1990 · 4× WSM",
    lore: "Jón Páll lifted with joy that made granite look shy — and died at 32, mid-deadlift, still training. The codex marks his creed: pull heavy, laugh loudly, stay consistent.",
    iconDescription: "A laughing engraved Viking mid-deadlift, hair flying, geysers and glaciers behind, rune border reading his famous quote.",
    requirements: [lift("deadlift", 300), streak(8)],
  },
  {
    id: "gold-karwoski-wheels", name: "Captain Kirk's Ten Wheels", category: "golden-era", rarity: "legendary",
    lifter: "Kirk Karwoski", era: "1995",
    lore: "Kirk Karwoski's 1,003 lb squat was walked out without a monolift, buried without a spotter's touch, and never bragged about once. Ten wheels; zero words.",
    iconDescription: "Ten plates on each side of an engraved bar seen from behind a squatter's shoulders, empty judging table, one red light nobody needed.",
    requirements: [lift("squat", 300), bw("squat", 2.5)],
  },
  {
    id: "gold-jan-todd", name: "Jan Todd's Trailblaze", category: "golden-era", rarity: "epic",
    lifter: "Jan Todd", era: "1977 · Strongest woman in the world",
    lore: "Jan Todd squatted past 400 lb when the record books had no page for women — so she wrote the page, then co-founded the archive that keeps everyone else's.",
    iconDescription: "An engraved figure squatting through a paper record book, torn pages becoming birds, quill and plate in the margins.",
    requirements: [lift("squat", 200), workouts(50)],
  },
  {
    id: "gold-bev-francis", name: "Bev Francis's Barrier", category: "golden-era", rarity: "epic",
    lifter: "Bev Francis", era: "1981 · First woman to bench 300 lb",
    lore: "Bev Francis benched 300 lb before the sport decided what to think about it, then went and redefined women's bodybuilding for good measure.",
    iconDescription: "An engraved brick wall mid-shatter with a barbell punched through it, southern cross stars above the rubble.",
    requirements: [lift("bench", 150), workouts(75)],
  },
  {
    id: "gold-sandwina-ring", name: "Sandwina's Standing Ovation", category: "golden-era", rarity: "epic",
    lifter: "Katie Sandwina", era: "1911 · Ringling Bros.",
    lore: "Katie Sandwina bent iron bars, caught cannonballs, and raised a family on tour. The circus billed her as Hercules's superior; Hercules declined to comment.",
    iconDescription: "Grand circus-ring engraving, a woman bowing while holding a barbell overhead one-handed, roses landing as stippled petals.",
    requirements: [lift("ohp", 100), streak(8)],
  },
  {
    id: "gold-davis-anniversary", name: "John Davis's Long Reign", category: "golden-era", rarity: "epic",
    lifter: "John Davis", era: "1938–1953",
    lore: "Fifteen years without losing a world or Olympic title. John Davis's reign is the longest quiet in the history of loud sports.",
    iconDescription: "Fifteen engraved calendar pages fluttering around a lifter at lockout, each page stamped with a small gold medal.",
    requirements: [lift("ohp", 130), total(600)],
  },
  {
    id: "gold-alekseyev-records", name: "Alekseyev's Eighty Records", category: "golden-era", rarity: "legendary",
    lifter: "Vasily Alekseyev", era: "1970–1977",
    lore: "Vasily Alekseyev broke eighty world records, many by the smallest legal margin — saving the rest, he said, for the next payday. Genius is also an accounting method.",
    iconDescription: "An engraved abacus whose beads are barbell plates, 80 tally strokes on the frame, fur hat resting on top.",
    requirements: [lift("ohp", 150), prs(50)],
  },
  {
    id: "gold-suleymanoglu", name: "The Pocket Hercules", category: "golden-era", rarity: "legendary",
    lifter: "Naim Süleymanoğlu", era: "1988–1996 · 3× Olympic gold",
    lore: "Naim Süleymanoğlu stood 1.47 m and lifted triple bodyweight overhead. The codex keeps this page small on purpose; it is still the heaviest one.",
    iconDescription: "A tiny engraved figure beneath an immense bar, drawn inside an ornate miniature frame like a pocket-watch portrait.",
    requirements: [bw("ohp", 1), totalBw(7)],
  },
  {
    id: "gold-ronnie-ray", name: "Ronnie Ray's Dallas Standard", category: "golden-era", rarity: "epic",
    lifter: "Ronnie Ray", era: "1970s · Texas",
    lore: "In the Texas bench circuits of the seventies, Ronnie Ray's name was the standard traded across gym floors: two hundred kilos, done properly, done often.",
    iconDescription: "A Texas star engraved above a bench press, longhorn skull with plates for eyes, mesquite border.",
    requirements: [lift("bench", 200), prs(10)],
  },
  {
    id: "gold-columbu-bottles", name: "Franco's Burst Bottles", category: "golden-era", rarity: "rare",
    lifter: "Franco Columbu", era: "1970s",
    lore: "Franco Columbu blew up hot-water bottles until they exploded, deadlifted cars for cameras, and won the Olympia twice. Sardinia builds them dense.",
    iconDescription: "An engraved figure inflating a bursting rubber bottle, deadlift bar at his feet, Mediterranean coastline behind.",
    requirements: [bw("deadlift", 2.5), lift("bench", 140)],
  },

  // ═══ MYTHIC — "The Final Pages" ═══════════════════════════════════════════
  {
    id: "myth-hercules", name: "Hercules Reborn", category: "mythic", rarity: "legendary",
    lore: "A 1,200-kilo total. The labors are finished; the lion wears you now. This page was left blank by the ancients on purpose.",
    iconDescription: "A lion-skin-cloaked figure resting on a club made of barbell sleeves, twelve engraved medallions of the labors as plates around the border.",
    requirements: [total(1200)],
  },
  {
    id: "myth-atlas", name: "Atlas Unbound", category: "mythic", rarity: "legendary",
    lore: "Twelve bodyweights totaled across three lifts. Atlas shrugged; you did not.",
    iconDescription: "A figure holding a celestial sphere made of nested barbell plates, constellation lines connecting them, engraved star charts.",
    requirements: [totalBw(12)],
  },
  {
    id: "myth-vulcan", name: "Vulcan's Own Hammer", category: "mythic", rarity: "legendary",
    lore: "A 300-kilo bench press. The forge god checks his inventory and finds one hammer missing.",
    iconDescription: "A colossal engraved smith's hammer whose head is a stack of plates, resting on an anvil cracked down the middle.",
    requirements: [lift("bench", 300)],
  },
  {
    id: "myth-colossus", name: "The Colossus of the Forge", category: "mythic", rarity: "legendary",
    lore: "Squat 300, bench 220, pull 360. Ships now navigate by you.",
    iconDescription: "A colossus statue straddling a harbor entrance, each leg a squat pillar, holding a bench bar as a torch, deadlift chains as mooring lines.",
    requirements: [lift("squat", 300), lift("bench", 220), lift("deadlift", 360)],
  },
  {
    id: "myth-milo-bull", name: "Milo's Full-Grown Bull", category: "mythic", rarity: "legendary",
    lore: "Seven hundred fifty workouts and an unbroken year. The calf is a bull, the bull is on your shoulders, and the walk continues because the walk was always the point.",
    iconDescription: "Greek frieze engraving of a man carrying an enormous bull up an endless spiral hill that loops back on itself.",
    requirements: [workouts(750), streak(52)],
  },
  {
    id: "myth-zeus-ledger", name: "Zeus's Ledger", category: "mythic", rarity: "legendary",
    lore: "One hundred records and an eleven-hundred total. Olympus keeps its books in your handwriting now.",
    iconDescription: "A lightning bolt used as a quill signing an immense open ledger, mountain-top altar of plates, engraved storm clouds.",
    requirements: [prs(100), total(1100)],
  },
  {
    id: "myth-final-page", name: "The Iron Grimoire, Final Page", category: "mythic", rarity: "legendary",
    lore: "Total 1,000, five hundred sessions, a year unbroken. The grimoire closes, then opens again to page one — as all true books of strength do.",
    iconDescription: "An ancient iron-bound book closing, its clasp a barbell collar, light escaping the pages, ouroboros embossed on the cover.",
    requirements: [total(1000), workouts(500), streak(52)],
  },
];

// ── Public exports ───────────────────────────────────────────────────────────

export const ACHIEVEMENTS: Achievement[] = defs.map((d) => ({
  tier: d.tier ?? TIER_FOR_RARITY[d.rarity],
  xp: RARITY_XP[d.rarity],
  ...d,
} as Achievement));

export const ACHIEVEMENTS_BY_ID: Map<string, Achievement> = new Map(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);

export const CATEGORY_LABELS: Record<Category, string> = {
  squat: "The King's Descent",
  bench: "The Horizontal Throne",
  deadlift: "The Grave Robber's Art",
  press: "The Skyward Court",
  assistance: "Assistance Arsenal",
  total: "Total Dominance",
  "pound-for-pound": "The Relative Court",
  repetition: "The Long Furnace",
  dedication: "The Keeper's Ledger",
  "golden-era": "Plates of the Ancients",
  mythic: "The Final Pages",
};

export const TIER_LABELS: Record<Tier, string> = {
  novice: "Novice",
  apprentice: "Apprentice",
  journeyman: "Journeyman",
  master: "Master",
  legend: "Legend",
};

export const RARITY_LABELS: Record<Rarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};
