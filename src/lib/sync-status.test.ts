import { afterEach, describe, expect, it, vi } from "vitest";
import { clearSyncError, reportSyncError, subscribeSyncStatus, syncErrorText } from "./sync-status";

describe("syncErrorText", () => {
  it("reads Error and Supabase-style error objects", () => {
    expect(syncErrorText(new Error("nope"))).toBe("nope");
    expect(syncErrorText({ message: "permission denied for column xp" })).toBe(
      "permission denied for column xp",
    );
    expect(syncErrorText(null)).toBe("Unknown cloud sync error");
    expect(syncErrorText({ message: "  " })).toBe("Unknown cloud sync error");
  });
});

describe("reportSyncError", () => {
  afterEach(() => {
    clearSyncError();
  });

  it("publishes the message to subscribers", () => {
    const seen: Array<string | null> = [];
    const unsubscribe = subscribeSyncStatus((message) => seen.push(message));
    vi.spyOn(console, "warn").mockImplementation(() => {});
    reportSyncError(new Error("the ledger refused"));
    expect(seen.at(-1)).toBe("the ledger refused");
    clearSyncError();
    expect(seen.at(-1)).toBeNull();
    unsubscribe();
  });
});
