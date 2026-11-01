"use client";

import { useEffect, useState } from "react";
import { clearSyncError, subscribeSyncStatus } from "@/lib/sync-status";

export function SyncBanner() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => subscribeSyncStatus(setMessage), []);

  if (!message) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-3 bottom-16 z-[60] mx-auto flex max-w-lg items-start gap-3 rounded-sm border border-blood-bright/50 bg-gunmetal-900 px-3 py-2 shadow-lg md:bottom-4"
    >
      <p className="flex-1 text-xs leading-relaxed text-parchment-100">
        The cloud ledger refused that change. It is still saved on this device.
        <span className="mt-1 block text-[11px] text-parchment-400">{message}</span>
      </p>
      <button type="button" className="btn-ghost shrink-0 px-2 py-1 text-[10px]" onClick={clearSyncError}>
        Dismiss
      </button>
    </div>
  );
}
