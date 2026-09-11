import { describe, expect, it } from "vitest";
import { emptyStreak, type Streak } from "./types";
import { DAYS_PER_FREEZE, recordActivity, streakIsLive, toDateKey } from "./streak";

const day = (iso: string) => new Date(`${iso}T18:00:00`);

/** Work every day from the given start, returning the resulting streak. */
function workConsecutiveDays(days: number, startIso = "2026-09-01"): Streak {
  let streak = emptyStreak;
  const start = new Date(`${startIso}T18:00:00`);
  for (let i = 0; i < days; i++) {
    streak = recordActivity(streak, new Date(start.getTime() + i * 86_400_000));
  }
  return streak;
}

describe("streaks", () => {
  it("starts at one on the first day", () => {
    const streak = recordActivity(emptyStreak, day("2026-09-11"));
    expect(streak.current).toBe(1);
    expect(streak.lastActiveDate).toBe("2026-09-11");
  });

  it("does not double count the same day", () => {
    const first = recordActivity(emptyStreak, day("2026-09-11"));
    const second = recordActivity(first, new Date("2026-09-11T21:30:00"));
    expect(second.current).toBe(1);
  });

  it("increments on consecutive days", () => {
    expect(workConsecutiveDays(5).current).toBe(5);
  });

  it("earns a freeze for every week of consistency", () => {
    const oneWeek = workConsecutiveDays(DAYS_PER_FREEZE);
    expect(oneWeek.freezes).toBe(1);
    expect(oneWeek.current).toBe(DAYS_PER_FREEZE);
  });

  it("spends a freeze to survive a missed day", () => {
    // Seven days of work earns one freeze; then a day is missed.
    const earned = workConsecutiveDays(DAYS_PER_FREEZE, "2026-09-01");
    expect(earned.freezes).toBe(1);
    // Last active 2026-09-07; skip the 8th; work on the 9th.
    const after = recordActivity(earned, day("2026-09-09"));

    expect(after.current).toBe(DAYS_PER_FREEZE + 1);
    expect(after.freezes).toBe(0);
  });

  it("resets when the gap is longer than the freezes can cover", () => {
    const earned = workConsecutiveDays(DAYS_PER_FREEZE, "2026-09-01");
    // One freeze cannot cover three missed days.
    const after = recordActivity(earned, day("2026-09-11"));

    expect(after.current).toBe(1);
    expect(after.longest).toBe(DAYS_PER_FREEZE);
    expect(after.freezes).toBe(1); // unspent, since they could not save it
  });

  it("remembers the longest streak even after a reset", () => {
    const earned = workConsecutiveDays(10, "2026-09-01");
    const broken = recordActivity(earned, day("2026-10-01"));
    expect(broken.current).toBe(1);
    expect(broken.longest).toBe(10);
  });

  it("never banks more than the maximum number of freezes", () => {
    const long = workConsecutiveDays(DAYS_PER_FREEZE * 8, "2026-01-01");
    expect(long.freezes).toBeLessThanOrEqual(3);
  });

  it("knows whether the streak is still live", () => {
    const streak = recordActivity(emptyStreak, day("2026-09-10"));
    expect(streakIsLive(streak, day("2026-09-11"))).toBe(true);
    expect(streakIsLive(streak, day("2026-09-13"))).toBe(false);
  });

  it("formats date keys in local time", () => {
    expect(toDateKey(new Date("2026-09-11T23:30:00"))).toBe("2026-09-11");
  });
});
