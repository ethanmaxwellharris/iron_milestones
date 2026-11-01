/**
 * Last cloud-sync failure, for the banner in the root layout.
 * The store stays the source of truth; this only surfaces what used to be
 * a console warning.
 */

type Listener = (message: string | null) => void;

let message: string | null = null;
const listeners = new Set<Listener>();

export function syncErrorText(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const text = (error as { message: unknown }).message;
    if (typeof text === "string" && text.trim()) return text;
  }
  return "Unknown cloud sync error";
}

function publish(next: string | null) {
  message = next;
  listeners.forEach((listener) => listener(message));
}

export function reportSyncError(error: unknown): void {
  console.warn("[iron] cloud sync failed:", error);
  publish(syncErrorText(error));
}

export function clearSyncError(): void {
  publish(null);
}

export function subscribeSyncStatus(listener: Listener): () => void {
  listeners.add(listener);
  listener(message);
  return () => listeners.delete(listener);
}
