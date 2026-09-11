import { describe, expect, it } from "vitest";
import { createReviewState, dueCount, isDue, mastery, review, sortByPriority } from "./scheduler";

const NOW = new Date("2026-09-11T09:00:00.000Z");
const daysBetween = (from: Date, iso: string) =>
  Math.round((new Date(iso).getTime() - from.getTime()) / 86_400_000);

describe("spaced repetition scheduler", () => {
  it("starts a new spec point due immediately", () => {
    const state = createReviewState("pure:5.6", NOW);
    expect(isDue(state, NOW)).toBe(true);
    expect(mastery(state)).toBe(0);
  });

  it("schedules the first review further out the better it went", () => {
    const fresh = createReviewState("pure:5.6", NOW);
    expect(daysBetween(NOW, review(fresh, "hard", NOW).due)).toBe(1);
    expect(daysBetween(NOW, review(fresh, "good", NOW).due)).toBe(3);
    expect(daysBetween(NOW, review(fresh, "easy", NOW).due)).toBe(6);
  });

  it("brings a forgotten spec point straight back", () => {
    const fresh = createReviewState("pure:5.6", NOW);
    const known = review(review(fresh, "good", NOW), "good", NOW);
    const forgotten = review(known, "again", NOW);

    expect(isDue(forgotten, NOW)).toBe(true);
    expect(forgotten.lapses).toBe(1);
    expect(forgotten.reps).toBe(0);
    // Forgetting makes it harder, so it will come back more often afterwards.
    expect(forgotten.difficulty).toBeGreaterThan(known.difficulty);
  });

  it("does not count a first-time miss as a lapse", () => {
    // Getting something wrong the first time you ever see it is not
    // forgetting, and should not be held against the student.
    const fresh = createReviewState("pure:8.5", NOW);
    expect(review(fresh, "again", NOW).lapses).toBe(0);
  });

  it("lengthens intervals as a spec point is repeatedly recalled", () => {
    let state = createReviewState("pure:2.3", NOW);
    const intervals: number[] = [];
    let now = NOW;
    for (let i = 0; i < 5; i++) {
      state = review(state, "good", now);
      intervals.push(state.intervalDays);
      now = new Date(state.due);
    }
    for (let i = 1; i < intervals.length; i++) {
      expect(intervals[i]).toBeGreaterThan(intervals[i - 1]);
    }
  });

  it("keeps a difficult spec point coming back more often than an easy one", () => {
    let hardOne = createReviewState("pure:9.3", NOW);
    let easyOne = createReviewState("pure:2.1", NOW);
    let now = NOW;

    // Same number of successful reviews, but one has been struggled with.
    hardOne = review(hardOne, "hard", now);
    easyOne = review(easyOne, "easy", now);
    for (let i = 0; i < 3; i++) {
      hardOne = review(hardOne, "hard", now);
      easyOne = review(easyOne, "easy", now);
      now = new Date(now.getTime() + 86_400_000);
    }

    expect(hardOne.intervalDays).toBeLessThan(easyOne.intervalDays);
    expect(hardOne.difficulty).toBeGreaterThan(easyOne.difficulty);
  });

  it("never schedules beyond the cap", () => {
    let state = createReviewState("pure:2.1", NOW);
    let now = NOW;
    for (let i = 0; i < 30; i++) {
      state = review(state, "easy", now);
      now = new Date(state.due);
    }
    expect(state.intervalDays).toBeLessThanOrEqual(180);
  });

  it("reports mastery as intervals grow", () => {
    let state = createReviewState("pure:2.1", NOW);
    let now = NOW;
    const first = mastery(review(state, "good", now));
    for (let i = 0; i < 6; i++) {
      state = review(state, "good", now);
      now = new Date(state.due);
    }
    expect(mastery(state)).toBeGreaterThan(first);
    expect(mastery(state)).toBeLessThanOrEqual(1);
  });

  it("puts due items first and the least known next", () => {
    const due = { ...createReviewState("pure:1.1", NOW), due: "2026-09-10T09:00:00.000Z" };
    const wellKnown = { ...createReviewState("pure:2.1", NOW), reps: 5, intervalDays: 40, due: "2026-10-20T09:00:00.000Z" };
    const shaky = { ...createReviewState("pure:5.6", NOW), reps: 2, intervalDays: 2, due: "2026-09-13T09:00:00.000Z" };

    const order = sortByPriority([wellKnown, shaky, due], NOW).map((s) => s.specPoint);
    expect(order).toEqual(["pure:1.1", "pure:5.6", "pure:2.1"]);
    expect(dueCount([wellKnown, shaky, due], NOW)).toBe(1);
  });
});
