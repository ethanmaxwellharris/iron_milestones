"use client";

/**
 * Post-workout ceremony: shows XP gained, PRs, and each achievement page
 * "torn" from the grimoire, with a page-turn animation per card.
 */

import { useMemo } from "react";
import type { LogResult } from "@/lib/store";
import { AchievementMedallion } from "@/components/achievement";
import { RARITY_LABELS } from "@/lib/codex/achievements";
import { cn } from "@/lib/utils";

export function UnlockDialog({ result, onClose }: { result: LogResult; onClose: () => void }) {
  const hasUnlocks = result.newAchievements.length > 0;
  const shareText = useMemo(
    () =>
      hasUnlocks
        ? `⚒️ Unlocked in the Codex of Iron: ${result.newAchievements
            .map((a) => `"${a.name}"`)
            .join(", ")} — Iron Milestones`
        : "",
    [hasUnlocks, result.newAchievements],
  );

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="panel max-h-[85vh] w-full max-w-lg overflow-y-auto animate-page-turn"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="plate-heading text-center text-2xl">
          {hasUnlocks ? "The Codex Turns a Page" : "Session Recorded"}
        </h2>
        <p className="mt-1 text-center text-xs uppercase tracking-[0.25em] text-gold-bright">
          +{result.xpGained} XP
          {result.newPrs > 0 && ` · ${result.newPrs} new PR${result.newPrs > 1 ? "s" : ""}`}
        </p>
        <div className="rule-ornate" />

        {hasUnlocks ? (
          <ul className="space-y-3">
            {result.newAchievements.map((a, i) => (
              <li
                key={a.id}
                className="codex-card codex-card--unlocked flex items-center gap-3 animate-unlock-in"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <AchievementMedallion category={a.category} rarity={a.rarity} unlocked />
                <div className="min-w-0">
                  <p className="plate-heading text-base leading-tight">{a.name}</p>
                  <p className={cn("text-[10px] uppercase tracking-widest", `rarity-${a.rarity}`)}>
                    {RARITY_LABELS[a.rarity]} · +{a.xp} XP
                  </p>
                  <p className="mt-1 text-xs italic text-parchment-300">{a.lore}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-sm text-parchment-300">
            The iron was moved and the ledger remembers. Every session is a page in the making.
          </p>
        )}

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {hasUnlocks && typeof navigator !== "undefined" && (
            <button
              className="btn-ghost"
              onClick={() => {
                if (navigator.share) void navigator.share({ text: shareText }).catch(() => {});
                else void navigator.clipboard?.writeText(shareText);
              }}
            >
              Share the feat
            </button>
          )}
          <button className="btn-gold" onClick={onClose} autoFocus>
            Continue Forging
          </button>
        </div>
      </div>
    </div>
  );
}
