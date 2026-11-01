import { describe, expect, it } from "vitest";
import { formatUuidV4, isUuid, uid } from "./utils";

describe("formatUuidV4", () => {
  it("sets the version and variant bits", () => {
    expect(formatUuidV4(new Uint8Array(16))).toBe("00000000-0000-4000-8000-000000000000");
    expect(formatUuidV4(new Uint8Array(16).fill(0xff))).toBe("ffffffff-ffff-4fff-bfff-ffffffffffff");
  });

  it("does not mutate the caller's buffer", () => {
    const bytes = new Uint8Array(16);
    formatUuidV4(bytes);
    expect(bytes[6]).toBe(0);
    expect(bytes[8]).toBe(0);
  });
});

describe("uid", () => {
  it("returns a uuid", () => {
    expect(isUuid(uid())).toBe(true);
  });

  it("falls back to a uuid v4 when randomUUID is missing", () => {
    const original = crypto.randomUUID;
    Object.defineProperty(crypto, "randomUUID", { configurable: true, value: undefined });
    try {
      const id = uid();
      expect(isUuid(id)).toBe(true);
      expect(id[14]).toBe("4");
      expect("89ab".includes(id[19])).toBe(true);
    } finally {
      Object.defineProperty(crypto, "randomUUID", { configurable: true, value: original });
    }
  });
});
