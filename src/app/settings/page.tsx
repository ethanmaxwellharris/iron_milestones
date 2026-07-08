"use client";

/**
 * Settings: profile, units, data export (JSON + CSV), cloud account, and the
 * dangerous lever. Export runs entirely client-side.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/nav";
import { Panel, SectionTitle } from "@/components/ui";
import { useIronStore, type Profile } from "@/lib/store";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { kgToLb, lbToKg } from "@/lib/oneRm";
import { liftName } from "@/lib/utils";

function download(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SettingsPage() {
  const state = useIronStore();
  const [email, setEmail] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Profile>(state.profile);
  // Bodyweight is edited as text in the display unit; stored canonically in kg.
  const [bwText, setBwText] = useState("");

  useEffect(() => {
    setForm(state.profile);
    setBwText(
      state.profile.bodyweightKg
        ? String(
            Math.round(
              (state.profile.unit === "kg"
                ? state.profile.bodyweightKg
                : kgToLb(state.profile.bodyweightKg)) * 10,
            ) / 10,
          )
        : "",
    );
  }, [state.profile]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    void getSupabase()!
      .auth.getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    state.updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportJson = () =>
    download(
      `iron-milestones-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(
        { profile: state.profile, xp: state.xp, workouts: state.workouts, unlocked: state.unlocked },
        null,
        2,
      ),
      "application/json",
    );

  const exportCsv = () => {
    const rows = [["date", "lift", "weight_kg", "reps", "rpe", "notes"]];
    for (const w of state.workouts)
      for (const s of w.sets)
        rows.push([w.performedOn, liftName(s.lift), String(s.kg), String(s.reps), String(s.rpe ?? ""), w.notes ?? ""]);
    download(
      `iron-milestones-sets-${new Date().toISOString().slice(0, 10)}.csv`,
      rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n"),
      "text/csv",
    );
  };

  const resetAll = () => {
    if (window.confirm("Burn the ledger? All local workouts, XP, and unlocks will be erased. This cannot be undone."))
      state.resetAll();
  };

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-lg space-y-6 px-4 py-6">
        <SectionTitle sub="The lifter's papers">Settings</SectionTitle>

        <form onSubmit={save} className="panel space-y-4">
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input id="name" className="input" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="bw">Bodyweight ({form.unit})</label>
              <input id="bw" className="input" inputMode="decimal"
                value={bwText}
                placeholder={form.unit === "kg" ? "82.5" : "182"}
                onChange={(e) => {
                  setBwText(e.target.value);
                  const n = parseFloat(e.target.value);
                  const kg = form.unit === "kg" ? n : lbToKg(n);
                  setForm({
                    ...form,
                    bodyweightKg: Number.isFinite(kg) && kg > 0 ? Math.round(kg * 10) / 10 : null,
                  });
                }} />
            </div>
            <div>
              <label className="label" htmlFor="unit">Display unit</label>
              <select id="unit" className="input" value={form.unit}
                onChange={(e) => {
                  const unit = e.target.value as "kg" | "lb";
                  setForm({ ...form, unit });
                  // Re-express the bodyweight field in the new unit.
                  setBwText(
                    form.bodyweightKg
                      ? String(Math.round((unit === "kg" ? form.bodyweightKg : kgToLb(form.bodyweightKg)) * 10) / 10)
                      : "",
                  );
                }}>
                <option value="kg">Kilograms</option>
                <option value="lb">Pounds</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">
            {saved ? "✦ Saved" : "Save papers"}
          </button>
        </form>

        <Panel>
          <p className="label">Cloud account</p>
          {isSupabaseConfigured ? (
            email ? (
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-parchment-200">{email}</span>
                <button
                  className="btn-ghost"
                  onClick={async () => {
                    await getSupabase()!.auth.signOut();
                    setEmail(null);
                  }}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-parchment-400">Not signed in — data lives in this browser.</span>
                <Link href="/login" className="btn-primary">Sign in</Link>
              </div>
            )
          ) : (
            <p className="text-xs leading-relaxed text-parchment-400">
              Running in <strong className="text-gold-bright">Forge Offline</strong> mode — no Supabase
              configured. Data persists in this browser. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (see README) to enable accounts and sync.
            </p>
          )}
        </Panel>

        <Panel className="space-y-2">
          <p className="label">Export the ledger</p>
          <div className="flex gap-2">
            <button className="btn-ghost flex-1" onClick={exportJson}>JSON (full)</button>
            <button className="btn-ghost flex-1" onClick={exportCsv}>CSV (sets)</button>
          </div>
        </Panel>

        <Panel>
          <p className="label text-blood-bright">The dangerous lever</p>
          <button className="btn-danger w-full" onClick={resetAll}>
            Burn the ledger (reset all local data)
          </button>
        </Panel>
      </main>
    </>
  );
}
