import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TopicIllustration, hasIllustration, illustratedSlugs } from "./topics";
import { allTopics } from "@/content/spec";

const source = readFileSync(new URL("./topics.tsx", import.meta.url), "utf8");

describe("topic illustrations", () => {
  it("covers every topic", () => {
    const missing = allTopics.filter((t) => !hasIllustration(t.slug)).map((t) => t.slug);
    expect(missing, `topics with no illustration: ${missing.join(", ")}`).toEqual([]);
  });

  it("has no illustration pointing at a topic that does not exist", () => {
    const slugs = new Set(allTopics.map((t) => t.slug));
    const orphans = illustratedSlugs.filter((s) => !slugs.has(s));
    expect(orphans, `illustrations with no topic: ${orphans.join(", ")}`).toEqual([]);
  });

  it("never uses the action accent", () => {
    // The palette rule is that amber means "do this next" and nothing else.
    // Nineteen amber illustrations would be nineteen things claiming to be the
    // next action, which is exactly the competing-highlights problem the
    // design brief warns about.
    expect(source).not.toMatch(/var\(--accent/);
    expect(source).not.toMatch(/var\(--correct|var\(--wrong/);
  });

  it("uses only theme tokens, never a hard-coded colour", () => {
    // A literal hex would survive into dark mode unchanged.
    const hexes = source.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
    expect(hexes, `hard-coded colours: ${hexes.join(", ")}`).toEqual([]);
  });

  describe.each(allTopics.map((t) => [t.slug] as const))("%s", (slug) => {
    const svg = renderToStaticMarkup(<TopicIllustration slug={slug} />);

    it("renders an svg with a viewBox so it scales", () => {
      expect(svg).toContain("<svg");
      expect(svg).toContain('viewBox="0 0 64 44"');
    });

    it("is hidden from screen readers, since the topic name is already text", () => {
      expect(svg).toContain('aria-hidden="true"');
    });

    it("draws something", () => {
      // A figure that renders no marks would be an empty box on the page.
      const marks = (svg.match(/<(path|circle|rect|ellipse)/g) ?? []).length;
      expect(marks, `${slug} drew ${marks} marks`).toBeGreaterThanOrEqual(2);
    });

    it("emits no NaN or undefined coordinates", () => {
      // A bad coordinate silently drops the shape rather than erroring.
      expect(svg).not.toMatch(/NaN|undefined|Infinity/);
    });

    it("stays inside its box", () => {
      // Numbers well outside the viewBox mean a shape is clipped or invisible.
      const numbers = (svg.match(/-?\d+\.?\d*/g) ?? []).map(Number).filter(Number.isFinite);
      const wild = numbers.filter((n) => n < -30 || n > 130);
      expect(wild, `${slug} has out-of-range coordinates: ${wild.join(", ")}`).toEqual([]);
    });
  });

  it("renders nothing for an unknown slug rather than an empty frame", () => {
    expect(renderToStaticMarkup(<TopicIllustration slug="not-a-topic" />)).toBe("");
  });
});
