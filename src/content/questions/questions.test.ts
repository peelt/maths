import { describe, expect, it } from "vitest";
import katex from "katex";
import { generateQuestion, questionTemplates } from "@/lib/questions";
import { markAnswer } from "@/lib/marking";
import { allSpecPoints, getSpecPoint, allTopics } from "@/content/spec";
import { markCodeMeanings, type MarkCode } from "@/lib/questions/types";

/** Enough variants to exercise the full range of generated numbers. */
const VARIANTS = 60;

describe("question bank", () => {
  it("has templates", () => {
    expect(questionTemplates.length).toBeGreaterThan(15);
  });

  it("gives every template a unique id", () => {
    const ids = questionTemplates.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("points every template at a spec point that actually exists", () => {
    for (const template of questionTemplates) {
      const found = getSpecPoint(template.paper, template.specCode);
      expect(found, `${template.id} references ${template.paper}:${template.specCode}`).toBeDefined();
      // The topic slug must agree with the spec point's own topic.
      expect(found?.topic.slug, `${template.id} topic slug`).toBe(template.topicSlug);
    }
  });

  describe.each(questionTemplates.map((t) => [t.id, t] as const))("%s", (id, template) => {
    it("marks its own canonical answer as correct, across many variants", () => {
      // This is the single most important test in the project. If a generated
      // question disagrees with its own mark scheme, a student is told they
      // are wrong when they are right — which destroys trust in everything.
      for (let i = 0; i < VARIANTS; i++) {
        const q = generateQuestion(template, i * 7919 + 13);
        // Where a question demands an exact answer, the canonical form is the
        // exact one — a decimal is correctly refused and is not the answer
        // the mark scheme would accept.
        const canonical =
          q.answer.type === "numeric" ? (q.answer.exactForm ?? String(q.answer.value)) : q.answer.value;

        const result = markAnswer(canonical, q.answer);
        expect(result.correct, `${id} seed ${q.seed}: "${canonical}" was marked ${result.outcome} (${result.message ?? ""})`).toBe(true);
      }
    });

    it("produces a well formed question every time", () => {
      for (let i = 0; i < VARIANTS; i++) {
        const q = generateQuestion(template, i * 104729 + 7);
        expect(q.prompt.trim().length, `${id} prompt`).toBeGreaterThan(10);
        expect(q.solution.length, `${id} solution steps`).toBeGreaterThan(0);
        expect(q.marks).toBeGreaterThan(0);

        for (const step of q.solution) {
          expect(step.text.trim().length).toBeGreaterThan(0);
          if (step.mark) {
            expect(Object.keys(markCodeMeanings)).toContain(step.mark as MarkCode);
          }
        }
      }
    });

    it("never renders a malformed number or sign", () => {
      for (let i = 0; i < VARIANTS; i++) {
        const q = generateQuestion(template, i * 31337 + 5);
        const text = [q.prompt, ...q.solution.map((s) => s.text)].join(" ");
        // "+ -3" or "- -3" is the classic giveaway of a generated question.
        expect(text, `${id} seed ${q.seed}`).not.toMatch(/[+-]\s*-\s*\d/);
        expect(text).not.toMatch(/undefined|NaN|Infinity/);
      }
    });

    it("writes valid LaTeX in prompts and solutions", () => {
      for (let i = 0; i < 12; i++) {
        const q = generateQuestion(template, i * 60013 + 3);
        const text = [q.prompt, ...q.solution.map((s) => s.text), ...q.solution.map((s) => s.why ?? "")].join(" ");
        for (const segment of extractMaths(text)) {
          expect(
            () => katex.renderToString(segment, { throwOnError: true }),
            `${id} seed ${q.seed}: $${segment}$`,
          ).not.toThrow();
        }
      }
    });

    it("is deterministic for a given seed", () => {
      const a = generateQuestion(template, 4242);
      const b = generateQuestion(template, 4242);
      expect(a.prompt).toBe(b.prompt);
      expect(JSON.stringify(a.answer)).toBe(JSON.stringify(b.answer));
    });
  });
});

describe("question bank coverage", () => {
  it("reports honestly which spec points can be practised", () => {
    const covered = new Set(questionTemplates.map((t) => `${t.paper}:${t.specCode}`));
    const total = allSpecPoints.length;
    // Not a pass/fail target — this is a visible record of where the bank is.
    // eslint-disable-next-line no-console
    console.log(`Question coverage: ${covered.size} of ${total} spec points across ${allTopics.length} topics`);
    expect(covered.size).toBeGreaterThan(0);
  });
});

/** Pull out the maths between $ … $ delimiters. */
function extractMaths(text: string): string[] {
  const out: string[] = [];
  const re = /\$([^$]+)\$/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) out.push(match[1]);
  return out;
}

describe("exact answer specs", () => {
  it("always supplies a typable exact form when an exact answer is demanded", () => {
    // Without this, a question could demand an exact answer while offering no
    // form the marker would actually accept.
    for (const template of questionTemplates) {
      for (let i = 0; i < 20; i++) {
        const q = generateQuestion(template, i * 911 + 1);
        if (q.answer.type === "numeric" && q.answer.requireExact) {
          expect(q.answer.exactForm, `${template.id} requires exact but gives no exactForm`).toBeTruthy();
          expect(markAnswer(q.answer.exactForm!, q.answer).correct).toBe(true);
        }
      }
    }
  });
});
