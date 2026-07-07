import Link from "next/link";
import { BookOpen, Dumbbell, Landmark, Scale } from "lucide-react";
import { ACHIEVEMENTS } from "@/lib/codex/achievements";

/**
 * Landing plate — server component. The app proper lives under /dashboard.
 */
export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-[90dvh] max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-[11px] uppercase tracking-[0.4em] text-gold-dim">Anno Ferri · Est. MMXXVI</p>
      <h1 className="plate-heading mt-3 text-5xl sm:text-6xl">
        Iron <span className="text-gold-bright">Milestones</span>
      </h1>
      <p className="mt-2 font-serif text-lg italic text-parchment-300">The Codex of Iron</p>
      <div className="rule-ornate w-64" />

      <p className="max-w-xl text-sm leading-relaxed text-parchment-300">
        Log your squat, bench, and deadlift — and walk the same road as the legends. Every kilo you
        add turns a page in a grimoire of <strong className="text-gold-bright">{ACHIEVEMENTS.length} achievements</strong>{" "}
        drawn from the true history of strength: Hepburn&apos;s first 500&nbsp;lb bench, Coan&apos;s 901,
        Goerner&apos;s one-hand pull, Milo&apos;s bull.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/dashboard" className="btn-gold text-base">
          Enter the Forge
        </Link>
        <Link href="/codex" className="btn-ghost text-base">
          Open the Codex
        </Link>
      </div>

      <div className="mt-14 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            icon: Dumbbell,
            title: "Log the Big Three",
            body: "Fast mobile-first logging with automatic Epley 1RM estimates, RPE, and PR detection.",
          },
          {
            icon: BookOpen,
            title: "Unlock Iron History",
            body: "A dense codex of tiered achievements honoring the golden era — each with lore, rarity, and progress tracking.",
          },
          {
            icon: Landmark,
            title: "Stand in the Hall",
            body: "Measure your bests against Park, Arnold, Coan, Kaz and the old gods of the platform.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="panel text-left">
            <Icon className="mb-2 text-gold-bright" size={20} />
            <h2 className="plate-heading text-base">{title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-parchment-400">{body}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-parchment-600">
        <Scale size={12} /> Offline-first · Supabase cloud sync · Free forever
      </p>
    </main>
  );
}
