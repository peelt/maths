import { describe, expect, it } from "vitest";
import { summariseByTopic, summariseOverall, weakestPoints, recentSessions } from "./summarise";
import { createReviewState, review } from "@/lib/scheduling";
import type { Attempt, SessionSummary } from "./types";

function attempt(specPoint: string, correct: boolean, timeMs = 30_000): Attempt {
  return {
    id: `${specPoint}-${Math.random()}`,
    templateId: "t",
    seed: 1,
    specPoint,
    correct,
    given: "",
    timeMs,
    at: new Date().toISOString(),
  };
}

describe("progress summaries", () => {
  it("reports nothing rather than zero when there is no history", () => {
    const overall = summariseOverall([]);
    expect(overall.attempted).toBe(0);
    // null, not 0 — 0% accuracy would be a lie about someone who has not started.
    expect(overall.accuracy).toBeNull();
  });

  it("counts attempts, accuracy and time", () => {
    const overall = summariseOverall([
      attempt("pure:2.3", true, 10_000),
      attempt("pure:2.3", false, 20_000),
      attempt("pure:7.2", true, 30_000),
    ]);
    expect(overall.attempted).toBe(3);
    expect(overall.correct).toBe(2);
    expect(overall.accuracy).toBeCloseTo(2 / 3, 10);
    expect(overall.specPointsSeen).toBe(2);
    expect(overall.totalTimeMs).toBe(60_000);
  });

  it("groups attempts under the right topic", () => {
    const summaries = summariseByTopic(
      [attempt("pure:2.3", true), attempt("pure:2.1", false), attempt("mechanics:9.1", true)],
      [],
    );
    const algebra = summaries.find((s) => s.topic.slug === "algebra-and-functions");
    expect(algebra?.attempted).toBe(2);
    expect(algebra?.correct).toBe(1);
    expect(algebra?.accuracy).toBeCloseTo(0.5, 10);
    expect(summaries.find((s) => s.topic.slug === "moments")?.attempted).toBe(1);
  });

  it("averages mastery only over spec points actually seen", () => {
    // One well-known point in a topic of eleven should not read as 1/11 mastered.
    let state = createReviewState("pure:2.1");
    for (let i = 0; i < 4; i++) state = review(state, "good", new Date(state.due));

    const summaries = summariseByTopic([attempt("pure:2.1", true)], [state]);
    const algebra = summaries.find((s) => s.topic.slug === "algebra-and-functions");
    expect(algebra?.mastery).toBeGreaterThan(0.4);
  });

  it("ignores a single wrong answer when finding weak points", () => {
    // One miss out of one is noise. Sending someone to revise on that basis
    // wastes the trip.
    expect(weakestPoints([attempt("pure:5.6", false)])).toHaveLength(0);
  });

  it("finds genuinely weak spec points, worst first", () => {
    const weak = weakestPoints([
      attempt("pure:5.6", false),
      attempt("pure:5.6", false),
      attempt("pure:5.6", false),
      attempt("pure:2.3", true),
      attempt("pure:2.3", false),
      attempt("pure:8.3", true),
      attempt("pure:8.3", true),
    ]);

    expect(weak.map((w) => w.code)).toEqual(["5.6", "2.3"]);
    expect(weak[0].accuracy).toBe(0);
    expect(weak[0].title).toBe("Double angle, compound angle and R form");
    // A spec point answered correctly every time is not a weakness.
    expect(weak.some((w) => w.code === "8.3")).toBe(false);
  });

  it("orders sessions newest first", () => {
    const make = (id: string, startedAt: string): SessionSummary => ({
      id,
      startedAt,
      endedAt: startedAt,
      questionsAttempted: 5,
      questionsCorrect: 3,
    });
    const ordered = recentSessions([
      make("old", "2026-09-01T10:00:00Z"),
      make("new", "2026-09-11T10:00:00Z"),
      make("mid", "2026-09-05T10:00:00Z"),
    ]);
    expect(ordered.map((s) => s.id)).toEqual(["new", "mid", "old"]);
  });
});
