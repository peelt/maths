import { describe, expect, it } from "vitest";
import katex from "katex";
import { noteFor, teachingNotes } from "@/content/notes";
import { allTopics, getSpecPoint } from "@/content/spec";
import { toHtml } from "@/components/Maths";

/** Pull out the maths between $ … $ delimiters. */
function extractMaths(text: string): string[] {
  const out: string[] = [];
  const re = /\$([^$]+)\$/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) out.push(match[1]);
  return out;
}

function allText(): { where: string; text: string }[] {
  const out: { where: string; text: string }[] = [];
  for (const note of teachingNotes) {
    const key = `${note.paper}:${note.specCode}`;
    out.push({ where: `${key} idea`, text: note.idea });
    note.method.forEach((m, i) => out.push({ where: `${key} method[${i}]`, text: m }));
    note.watchFor.forEach((w, i) => out.push({ where: `${key} watchFor[${i}]`, text: w }));
  }
  return out;
}

describe("teaching notes", () => {
  it("points every note at a spec point that actually exists", () => {
    for (const note of teachingNotes) {
      const found = getSpecPoint(note.paper, note.specCode);
      expect(found, `${note.paper}:${note.specCode} is not a real spec point`).toBeDefined();
    }
  });

  it("has at most one note per spec point", () => {
    const keys = teachingNotes.map((n) => `${n.paper}:${n.specCode}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("writes valid LaTeX everywhere", () => {
    for (const { where, text } of allText()) {
      for (const segment of extractMaths(text)) {
        expect(() => katex.renderToString(segment, { throwOnError: true }), `${where}: $${segment}$`).not.toThrow();
      }
    }
  });

  it("never leaves an unclosed maths delimiter", () => {
    for (const { where, text } of allText()) {
      const dollars = (text.match(/\$/g) ?? []).length;
      expect(dollars % 2, `${where} has an odd number of $ delimiters`).toBe(0);
    }
  });

  it("says something substantial, not a placeholder", () => {
    for (const note of teachingNotes) {
      const key = `${note.paper}:${note.specCode}`;
      // An idea shorter than this is a restatement of the title, which the
      // spec summary already gives — the note has to earn its place.
      expect(note.idea.length, `${key} idea is too thin`).toBeGreaterThan(80);
      expect(note.method.length, `${key} has too few method steps`).toBeGreaterThanOrEqual(3);
      expect(note.watchFor.length, `${key} has no pitfalls`).toBeGreaterThanOrEqual(2);
      for (const step of note.method) expect(step.trim().length, `${key} empty method step`).toBeGreaterThan(15);
      for (const w of note.watchFor) expect(w.trim().length, `${key} empty pitfall`).toBeGreaterThan(15);
    }
  });

  it("stays short enough to actually be read", () => {
    for (const note of teachingNotes) {
      const key = `${note.paper}:${note.specCode}`;
      const total = note.idea.length + note.method.join(" ").length + note.watchFor.join(" ").length;
      // Roughly 400 words. Past that it stops being a note and becomes a
      // textbook page, which is the thing this is meant not to be.
      expect(total, `${key} is too long to be a note (${total} chars)`).toBeLessThan(2600);
    }
  });

  it("has a note for every spec point", () => {
    // Same reasoning as the question bank's coverage test: a spec point with
    // no note is one a student meets as a single line of specification prose
    // and nothing else. Asserting it means adding a spec point without a note
    // fails here rather than quietly leaving a hole.
    const have = new Set(teachingNotes.map((n) => `${n.paper}:${n.specCode}`));
    const missing: string[] = [];
    for (const topic of allTopics) {
      for (const point of topic.points) {
        if (!have.has(`${topic.paper}:${point.code}`)) {
          missing.push(`${topic.paper}:${point.code} (${point.title})`);
        }
      }
    }
    expect(missing, `spec points with no teaching note: ${missing.join(", ")}`).toEqual([]);
  });

  it("looks a note up by paper and code", () => {
    expect(noteFor("pure", "7.4")).toBeDefined();
    expect(noteFor("pure", "7.4")!.method.length).toBeGreaterThan(0);
    expect(noteFor("statistics", "7.4")).toBeUndefined();
  });
});

describe("teaching notes render cleanly", () => {
  it("leaves no dollar sign on the page", () => {
    // The same check the question bank now has. Source-level LaTeX tests
    // cannot see a delimiter that renders wrongly; this renders the output.
    for (const note of teachingNotes) {
      for (const part of [note.idea, ...note.method, ...note.watchFor]) {
        expect(toHtml(part), `${note.paper}:${note.specCode}`).not.toContain("$");
      }
    }
  });
});
