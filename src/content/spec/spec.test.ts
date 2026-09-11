import { describe, expect, it } from "vitest";
import { allSpecPoints, allTopics, getSpecPoint, inYear, qualifiedCode, specStats } from "./index";

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

  it("assigns every spec point to at least one teaching year", () => {
    for (const point of allSpecPoints) {
      expect(inYear(point, 1) || inYear(point, 2)).toBe(true);
    }
  });
});
