"use client";

/**
 * Onboarding rite: name, bodyweight, experience, and baseline bests for the
 * big three. Baselines are stored as a real (1-rep-set) workout so the codex
 * engine immediately grants every page the lifter has already earned.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useIronStore, type LogResult, type Profile } from "@/lib/store";
import { UnlockDialog } from "@/components/unlock-dialog";
import { lbToKg } from "@/lib/oneRm";

const BIG_THREE = [
  { slug: "squat", label: "Back Squat" },
  { slug: "bench", label: "Bench Press" },
  { slug: "deadlift", label: "Deadlift" },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const completeOnboarding = useIronStore((s) => s.completeOnboarding);
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [name, setName] = useState("");
  const [bodyweight, setBodyweight] = useState("");
  const [experience, setExperience] = useState<Profile["experience"]>("novice");
  const [bests, setBests] = useState<Record<string, string>>({});
  const [result, setResult] = useState<LogResult | null>(null);

  const toKg = (v: string): number | null => {
    const n = parseFloat(v);
    if (!Number.isFinite(n) || n <= 0) return null;
    return unit === "kg" ? n : Math.round(lbToKg(n) * 10) / 10;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseline = BIG_THREE.flatMap(({ slug }) => {
      const kg = toKg(bests[slug] ?? "");
      return kg ? [{ lift: slug, kg, reps: 1 }] : [];
    });
    const res = completeOnboarding(
      { name: name.trim(), bodyweightKg: toKg(bodyweight), experience, unit },
      baseline,
    );
    if (res.newAchievements.length > 0) setResult(res);
    else router.push("/dashboard");
  };

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <p className="text-center text-[11px] uppercase tracking-[0.35em] text-gold-dim">
        The Rite of Entry
      </p>
      <h1 className="plate-heading mt-1 text-center text-3xl">Inscribe Your Name</h1>
      <div className="rule-ornate" />

      <form onSubmit={submit} className="panel space-y-4">
        <div>
          <label className="label" htmlFor="name">Lifter&apos;s name</label>
          <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ethan of the East Rack" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="bw">Bodyweight ({unit})</label>
            <input id="bw" className="input" inputMode="decimal" value={bodyweight}
              onChange={(e) => setBodyweight(e.target.value)} placeholder={unit === "kg" ? "82.5" : "182"} />
          </div>
          <div>
            <label className="label" htmlFor="unit">Units</label>
            <select id="unit" className="input" value={unit} onChange={(e) => setUnit(e.target.value as "kg" | "lb")}>
              <option value="kg">Kilograms</option>
              <option value="lb">Pounds</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="exp">Experience</label>
          <select id="exp" className="input" value={experience}
            onChange={(e) => setExperience(e.target.value as Profile["experience"])}>
            <option value="novice">Novice — under a year</option>
            <option value="intermediate">Intermediate — 1–3 years</option>
            <option value="advanced">Advanced — 3–8 years</option>
            <option value="elite">Elite — the bar fears you</option>
          </select>
        </div>

        <div>
          <p className="label">Current bests — 1RM or best single ({unit}, optional)</p>
          <div className="grid grid-cols-3 gap-3">
            {BIG_THREE.map(({ slug, label }) => (
              <div key={slug}>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-parchment-500" htmlFor={slug}>
                  {label}
                </label>
                <input id={slug} className="input" inputMode="decimal" value={bests[slug] ?? ""}
                  onChange={(e) => setBests({ ...bests, [slug]: e.target.value })}
                  placeholder="—" />
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] italic text-parchment-500">
            These are written into the ledger as your baseline — the codex will honor them instantly.
          </p>
        </div>

        <button type="submit" className="btn-gold w-full">Take the Oath</button>
      </form>

      {result && (
        <UnlockDialog result={result} onClose={() => router.push("/dashboard")} />
      )}
    </main>
  );
}
