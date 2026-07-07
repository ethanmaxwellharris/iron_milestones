"use client";

/**
 * The Workout Logger — mobile-first quick entry. Each set row shows a live
 * Epley e1RM; submitting runs the codex engine and holds the unlock ceremony.
 */

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AppNav } from "@/components/nav";
import { SectionTitle } from "@/components/ui";
import { UnlockDialog } from "@/components/unlock-dialog";
import { useIronStore, type LogResult } from "@/lib/store";
import { estimate1Rm, formatWeight, lbToKg } from "@/lib/oneRm";
import { LIFT_NAMES, uid } from "@/lib/utils";

interface SetRow {
  key: string;
  lift: string;
  weight: string;
  reps: string;
  rpe: string;
}

const newRow = (lift = "squat"): SetRow => ({ key: uid(), lift, weight: "", reps: "", rpe: "" });

export default function LogPage() {
  const router = useRouter();
  const { profile, customLifts, logWorkout, addCustomLift } = useIronStore();
  const unit = profile.unit;

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [bodyweight, setBodyweight] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<SetRow[]>([newRow()]);
  const [result, setResult] = useState<LogResult | null>(null);
  const [error, setError] = useState("");

  const liftOptions = useMemo(
    () => [
      ...Object.entries(LIFT_NAMES).map(([slug, name]) => ({ slug, name })),
      ...customLifts,
    ],
    [customLifts],
  );

  const toKg = (v: string): number => {
    const n = parseFloat(v);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return unit === "kg" ? n : Math.round(lbToKg(n) * 10) / 10;
  };

  const patchRow = (key: string, patch: Partial<SetRow>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const handleLiftChange = (key: string, value: string) => {
    if (value === "__custom__") {
      const name = window.prompt("Name the lift (e.g. Front Squat):")?.trim();
      if (!name) return;
      const liftDef = addCustomLift(name);
      patchRow(key, { lift: liftDef.slug });
    } else {
      patchRow(key, { lift: value });
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const sets = rows
      .map((r) => ({
        lift: r.lift,
        kg: toKg(r.weight),
        reps: Math.floor(parseFloat(r.reps) || 0),
        rpe: parseFloat(r.rpe) || undefined,
      }))
      .filter((s) => s.kg > 0 && s.reps > 0);
    if (sets.length === 0) {
      setError("Record at least one set with weight and reps — the codex only honors what is written.");
      return;
    }
    setError("");
    const bw = parseFloat(bodyweight);
    setResult(
      logWorkout({
        performedOn: date,
        bodyweightKg: Number.isFinite(bw) && bw > 0 ? toKg(bodyweight) : null,
        notes: notes.trim() || undefined,
        sets,
      }),
    );
  };

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <SectionTitle sub="Write today's page in the ledger">Log a Session</SectionTitle>

        <form onSubmit={submit} className="space-y-4">
          <div className="panel grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="date">Date</label>
              <input id="date" type="date" className="input" value={date}
                onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="bw">Bodyweight ({unit}, optional)</label>
              <input id="bw" className="input" inputMode="decimal" value={bodyweight}
                onChange={(e) => setBodyweight(e.target.value)} placeholder="—" />
            </div>
          </div>

          <div className="space-y-2">
            {rows.map((r, i) => {
              const kg = toKg(r.weight);
              const reps = Math.floor(parseFloat(r.reps) || 0);
              const e1 = kg > 0 && reps > 0 ? estimate1Rm(kg, reps) : 0;
              return (
                <div key={r.key} className="panel py-3">
                  <div className="grid grid-cols-[1fr_auto] items-start gap-2">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="label">Lift</label>
                        <select className="input" value={r.lift} onChange={(e) => handleLiftChange(r.key, e.target.value)}>
                          {liftOptions.map((o) => (
                            <option key={o.slug} value={o.slug}>{o.name}</option>
                          ))}
                          <option value="__custom__">+ Custom lift…</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Weight ({unit})</label>
                        <input className="input" inputMode="decimal" value={r.weight}
                          onChange={(e) => patchRow(r.key, { weight: e.target.value })} placeholder="0" />
                      </div>
                      <div>
                        <label className="label">Reps</label>
                        <input className="input" inputMode="numeric" value={r.reps}
                          onChange={(e) => patchRow(r.key, { reps: e.target.value })} placeholder="0" />
                      </div>
                      <div>
                        <label className="label">RPE</label>
                        <input className="input" inputMode="decimal" value={r.rpe}
                          onChange={(e) => patchRow(r.key, { rpe: e.target.value })} placeholder="—" />
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove set ${i + 1}`}
                      className="mt-6 rounded-sm border border-gunmetal-500 p-2 text-parchment-500 hover:border-blood hover:text-blood-bright"
                      onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((x) => x.key !== r.key) : rs))}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="mt-1.5 text-right text-[11px] text-parchment-500">
                    {e1 > 0 ? (
                      <>est. 1RM <span className="font-semibold text-gold-bright">{formatWeight(e1, unit)}</span></>
                    ) : (
                      "est. 1RM —"
                    )}
                  </p>
                </div>
              );
            })}
            <button
              type="button"
              className="btn-ghost w-full"
              onClick={() => setRows((rs) => [...rs, newRow(rs[rs.length - 1]?.lift)])}
            >
              <Plus size={14} /> Add set
            </button>
          </div>

          <div className="panel">
            <label className="label" htmlFor="notes">Notes (optional)</label>
            <textarea id="notes" className="input min-h-20" value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Felt strong. The bar whispered of old victories." />
          </div>

          {error && <p className="text-center text-xs text-blood-bright">{error}</p>}

          <button type="submit" className="btn-gold w-full text-base">
            Seal the Entry
          </button>
        </form>

        {result && (
          <UnlockDialog
            result={result}
            onClose={() => {
              setResult(null);
              router.push("/dashboard");
            }}
          />
        )}
      </main>
    </>
  );
}
