import { describe, expect, it } from "vitest";
import { buildDrillSet, drillFromQuestion, markRuleDrills } from "@/lib/drills";
import { generateQuestion, questionTemplates } from "@/lib/questions";
import { markCodeMeanings, type MarkCode } from "@/lib/questions/types";

/** A deterministic generator, so a failure can be reproduced. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

describe("mark scheme drills", () => {
  it("builds a drill from any question that has marked steps", () => {
    for (const template of questionTemplates) {
      const question = generateQuestion(template, 12345);
      const drill = drillFromQuestion(question, seeded(7));
      expect(drill, `${template.id} produced no drill`).toBeDefined();
      expect(drill!.options).toContain(drill!.answer);
      expect(drill!.steps[drill!.targetIndex].mark).toBe(drill!.answer);
    }
  });

  it("never offers the same option twice", () => {
    for (let i = 0; i < 60; i++) {
      const set = buildDrillSet(6, seeded(i * 31 + 1));
      for (const drill of set) {
        expect(new Set(drill.options).size, `${drill.id} has a repeated option`).toBe(drill.options.length);
      }
    }
  });

  it("always includes the correct answer among the options", () => {
    for (let i = 0; i < 60; i++) {
      for (const drill of buildDrillSet(6, seeded(i * 977 + 3))) {
        expect(drill.options, `${drill.id}`).toContain(drill.answer);
      }
    }
  });

  it("only ever asks about real mark codes", () => {
    const valid = Object.keys(markCodeMeanings);
    for (let i = 0; i < 40; i++) {
      for (const drill of buildDrillSet(6, seeded(i * 13 + 5))) {
        if (drill.kind !== "code") continue;
        expect(valid).toContain(drill.answer as MarkCode);
        for (const option of drill.options) expect(valid).toContain(option);
      }
    }
  });

  it("builds a full set of the requested size", () => {
    for (const size of [1, 3, 5, 8, 12]) {
      for (let i = 0; i < 12; i++) {
        expect(buildDrillSet(size, seeded(i * 101 + size)).length, `size ${size}`).toBe(size);
      }
    }
  });

  it("mixes rule drills in without repeating one within a set", () => {
    let sawRule = false;
    for (let i = 0; i < 40; i++) {
      const set = buildDrillSet(6, seeded(i * 7 + 2));
      const ruleIds = set.filter((d) => d.kind === "rule").map((d) => d.id);
      expect(new Set(ruleIds).size, "a rule drill repeated within one set").toBe(ruleIds.length);
      if (ruleIds.length > 0) sawRule = true;
    }
    expect(sawRule, "no rule drill ever appeared").toBe(true);
  });

  it("gives every authored rule drill a correct answer that is one of its options", () => {
    for (const rule of markRuleDrills) {
      expect(rule.options).toContain(rule.answer);
      expect(new Set(rule.options).size).toBe(rule.options.length);
      // The explanation is the part worth remembering, so it must be real.
      expect(rule.explanation.length).toBeGreaterThan(80);
    }
  });

  it("hides exactly one code and leaves the rest of the solution intact", () => {
    const question = generateQuestion(questionTemplates[0], 999);
    const drill = drillFromQuestion(question, seeded(4))!;
    expect(drill.steps.length).toBe(question.solution.length);
    drill.steps.forEach((step, i) => {
      expect(step.text).toBe(question.solution[i].text);
    });
  });
});
