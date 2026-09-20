import { describe, expect, it } from "vitest";
import { allSpecPoints, allTopics, getSpecPoint, qualifiedCode, specStats, taughtEarly } from "./index";
import { toHtml } from "@/components/Maths";

describe("9MA0 specification map", () => {
  it("covers every topic in the qualification", () => {
    // 10 Pure topics + 5 Statistics + 4 Mechanics.
    expect(specStats.topics).toBe(19);
  });

  it("has the expected number of spec points per paper", () => {
    expect(specStats.pure).toBe(62);
    expect(specStats.statistics).toBe(14);
    expect(specStats.mechanics).toBe(13);
    expect(specStats.points).toBe(89);
  });

  it("gives every spec point a globally unique qualified code", () => {
    const codes = allTopics.flatMap((t) => t.points.map((p) => qualifiedCode(t.paper, p.code)));
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("gives every topic a unique slug", () => {
    const slugs = allTopics.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("numbers spec point codes consistently with their topic", () => {
    for (const topic of allTopics) {
      for (const point of topic.points) {
        expect(point.code.split(".")[0]).toBe(String(topic.number));
      }
    }
  });

  it("resolves a known spec point by paper and code", () => {
    // Pure and Statistics both have a 2.1 — the paper is what disambiguates.
    expect(getSpecPoint("pure", "2.1")?.point.title).toBe("Laws of indices");
    expect(getSpecPoint("statistics", "2.1")?.point.title).toBe("Diagrams for single-variable data");
  });

  it("gives every spec point searchable content", () => {
    for (const point of allSpecPoints) {
      expect(point.title.length).toBeGreaterThan(0);
      expect(point.summary.length).toBeGreaterThan(40);
      expect(point.keywords.length).toBeGreaterThan(0);
    }
  });

  it("gives every spec point a teaching phase derived from the specification", () => {
    for (const point of allSpecPoints) {
      expect(["first", "later", "spanning"]).toContain(point.phase);
    }
  });

  it("keeps all three phases populated", () => {
    // A derivation that collapsed to one value would pass the check above
    // while telling a student nothing. The specification's bold marking
    // genuinely splits three ways, so the data must too.
    for (const phase of ["first", "later", "spanning"] as const) {
      expect(allSpecPoints.some((p) => p.phase === phase)).toBe(true);
    }
  });

  it("treats spanning points as met early", () => {
    // A point that is part AS content is seen before it is finished, so it
    // must seed as covered -- otherwise the first-year default hides work
    // the student has already started.
    const spanning = allSpecPoints.find((p) => p.phase === "spanning");
    expect(spanning && taughtEarly(spanning)).toBe(true);
    const later = allSpecPoints.find((p) => p.phase === "later");
    expect(later && taughtEarly(later)).toBe(false);
  });
});

describe("specification text renders cleanly", () => {
  it("leaves no dollar sign on the page", () => {
    // Same invariant as the question bank and the teaching notes: check the
    // rendered output, not just the LaTeX source.
    for (const topic of allTopics) {
      for (const point of topic.points) {
        for (const part of [point.title, point.summary, point.examNote ?? ""]) {
          expect(toHtml(part), qualifiedCode(topic.paper, point.code)).not.toContain("$");
        }
      }
    }
  });
});
