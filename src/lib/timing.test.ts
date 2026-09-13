import { describe, expect, it } from "vitest";
import {
  PACE_KEY,
  SECONDS_PER_MARK,
  allowanceSeconds,
  elapsedFraction,
  formatClock,
  paceSummary,
  readPacePreference,
  writePacePreference,
} from "./timing";

describe("allowanceSeconds", () => {
  it("uses the rate the real paper sets", () => {
    // 100 marks in 120 minutes, on all three papers.
    expect(SECONDS_PER_MARK).toBe(72);
    expect(allowanceSeconds(5)).toBe(360);
    expect(allowanceSeconds(10)).toBe(720);
  });

  it("applies the same rate all the way down, with no invented fudge", () => {
    // An earlier version had a floor for cheap questions. Any adjustment here
    // is a number I would be making up, and the point of this feature is that
    // the student is measured against the real paper.
    expect(allowanceSeconds(1)).toBe(72);
    expect(allowanceSeconds(2)).toBe(144);
  });

  it("survives a missing or nonsensical mark count", () => {
    // Better one mark's worth of clock than NaN on screen.
    expect(allowanceSeconds(0)).toBe(72);
    expect(allowanceSeconds(-3)).toBe(72);
    expect(allowanceSeconds(Number.NaN)).toBe(72);
  });

  it("never returns a fractional second", () => {
    for (const marks of [1, 2, 3, 4, 5, 6, 7, 8]) {
      expect(Number.isInteger(allowanceSeconds(marks))).toBe(true);
    }
  });
});

describe("formatClock", () => {
  it("pads the seconds so the width does not jump", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(9)).toBe("0:09");
    expect(formatClock(59)).toBe("0:59");
    expect(formatClock(60)).toBe("1:00");
    expect(formatClock(605)).toBe("10:05");
  });

  it("truncates rather than rounding up", () => {
    // Showing 0:01 before a second has passed would be a lie.
    expect(formatClock(0.9)).toBe("0:00");
    expect(formatClock(59.9)).toBe("0:59");
  });

  it("clamps a negative clock to zero", () => {
    expect(formatClock(-5)).toBe("0:00");
  });
});

describe("elapsedFraction", () => {
  it("reports progress through the allowance", () => {
    expect(elapsedFraction(0, 100)).toBe(0);
    expect(elapsedFraction(50, 100)).toBe(0.5);
  });

  it("stays inside its track when the allowance is blown", () => {
    // The bar must not render past the end of the element containing it.
    expect(elapsedFraction(400, 100)).toBe(1);
  });

  it("does not divide by zero", () => {
    expect(elapsedFraction(3, 0)).toBe(1);
  });
});

describe("paceSummary", () => {
  it("says something specific for a clean set", () => {
    expect(paceSummary(5, 5)).toContain("Every one inside exam pace");
  });

  it("names the count when it is mixed", () => {
    expect(paceSummary(3, 5)).toContain("3 of 5");
  });

  it("treats a slow set as information, not a telling-off", () => {
    const text = paceSummary(0, 5);
    expect(text).toContain("worth knowing now");
    // No scolding, and no praise it has not earned.
    expect(text).not.toMatch(/\b(bad|poor|failed|too slow)\b/i);
  });

  it("says nothing at all about an empty set", () => {
    expect(paceSummary(0, 0)).toBe("");
  });
});

describe("the exam-pace preference", () => {
  /** A localStorage stand-in, so these run without a DOM. */
  function fakeStorage(initial: Record<string, string> = {}) {
    const data = new Map(Object.entries(initial));
    return {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      read: () => Object.fromEntries(data),
    };
  }

  it("is off until it is turned on", () => {
    expect(readPacePreference(fakeStorage())).toBe(false);
    expect(readPacePreference(fakeStorage({ [PACE_KEY]: "off" }))).toBe(false);
  });

  it("round-trips in both directions", () => {
    const store = fakeStorage();
    writePacePreference(store, true);
    expect(readPacePreference(store)).toBe(true);
    writePacePreference(store, false);
    expect(readPacePreference(store)).toBe(false);
  });

  it("treats anything it does not recognise as off", () => {
    // Never read a stray value as a feature being on.
    expect(readPacePreference(fakeStorage({ [PACE_KEY]: "true" }))).toBe(false);
    expect(readPacePreference(fakeStorage({ [PACE_KEY]: "" }))).toBe(false);
  });

  it("survives storage being absent or throwing", () => {
    // Server render has no localStorage; private browsing throws on access.
    expect(readPacePreference(undefined)).toBe(false);
    const hostile = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(readPacePreference(hostile)).toBe(false);
    expect(() => writePacePreference(hostile, true)).not.toThrow();
    expect(() => writePacePreference(undefined, true)).not.toThrow();
  });
});
