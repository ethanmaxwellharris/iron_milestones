"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Dumbbell, History, Landmark, LayoutDashboard, Settings, Trophy } from "lucide-react";
import { useIronStore } from "@/lib/store";
import { RankBadge } from "@/components/xp";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", mobileLabel: "Home", icon: LayoutDashboard },
  { href: "/log", label: "Log Lift", mobileLabel: "Log", icon: Dumbbell },
  { href: "/arena", label: "Arena", mobileLabel: "Arena", icon: Trophy },
  { href: "/codex", label: "Codex", mobileLabel: "Codex", icon: BookOpen },
  { href: "/hall", label: "Hall of Iron", mobileLabel: "Hall", icon: Landmark },
  { href: "/history", label: "History", mobileLabel: "History", icon: History },
  { href: "/settings", label: "Settings", mobileLabel: "Settings", icon: Settings },
] as const;

export function AppNav() {
  const pathname = usePathname();
  const xp = useIronStore((s) => s.xp);
  const hydrated = useIronStore((s) => s.hydrated);

  return (
    <>
      {/* Top chrome */}
      <header className="bevel sticky top-0 z-50 border-x-0 border-t-0 bg-gradient-to-b from-gunmetal-700 to-gunmetal-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5">
          <Link href="/dashboard" className="group flex items-center gap-2.5">
            <BarbellMark />
            <span className="plate-heading text-lg leading-none sm:text-xl">
              Iron <span className="text-gold-bright">Milestones</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition-colors",
                  pathname.startsWith(href)
                    ? "bevel bg-forge-700 text-parchment-50"
                    : "text-parchment-400 hover:bg-gunmetal-700 hover:text-parchment-100",
                )}
              >
                <Icon size={13} />
                {label}
              </Link>
            ))}
          </nav>

          <div className="shrink-0">{hydrated && <RankBadge xp={xp} compact />}</div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="bevel fixed inset-x-0 bottom-0 z-50 flex justify-around border-x-0 border-b-0 bg-gradient-to-b from-gunmetal-700 to-gunmetal-900 pb-[env(safe-area-inset-bottom)] md:hidden">
        {LINKS.map(({ href, label, mobileLabel, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[8px] font-semibold uppercase tracking-wider sm:text-[9px]",
              pathname.startsWith(href) ? "text-gold-bright" : "text-parchment-400",
            )}
          >
            <Icon size={17} />
            {mobileLabel}
          </Link>
        ))}
      </nav>
    </>
  );
}

function BarbellMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden className="text-gold-bright">
      <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="16" cy="16" r="11.5" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1.5 2.5" />
      <line x1="6" y1="16" x2="26" y2="16" stroke="currentColor" strokeWidth="2" />
      <rect x="8" y="11" width="3" height="10" fill="currentColor" />
      <rect x="21" y="11" width="3" height="10" fill="currentColor" />
    </svg>
  );
}
