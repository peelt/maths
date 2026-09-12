import { generateQuestion, questionTemplates, type GeneratedQuestion } from "@/lib/questions";
import type { MarkCode } from "@/lib/questions/types";
import { markRuleDrills } from "./rules";
import type { Drill, MarkCodeDrill, MarkRuleDrill } from "./types";

export * from "./types";
export { markRuleDrills };

/**
 * Distractors for a mark-code drill.
 *
 * Ordered so the plausible confusions come first: M1 against A1 is the
 * distinction that actually matters, and dM1 against M1 is the one students
 * most often miss.
 */
const CODE_POOL: readonly MarkCode[] = ["M1", "A1", "B1", "dM1", "A1ft", "M1A1", "E1"];

/** How many options a mark-code drill offers. */
const OPTION_COUNT = 4;

function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Turn one generated question into a drill, hiding the code on a single step.
 *
 * Returns undefined when the question has no marked step to ask about, which
 * a caller should treat as "try another question" rather than as an error.
 */
export function drillFromQuestion(
  question: GeneratedQuestion,
  random: () => number = Math.random,
): MarkCodeDrill | undefined {
  const markedIndices = question.solution
    .map((step, index) => (step.mark ? index : -1))
    .filter((index) => index >= 0);
  if (markedIndices.length === 0) return undefined;

  const targetIndex = markedIndices[Math.floor(random() * markedIndices.length)];
  const answer = question.solution[targetIndex].mark as MarkCode;

  // Distractors are drawn from the codes this very mark scheme uses first, so
  // the choice is between codes that genuinely appear together rather than
  // between one plausible code and three that were never in play.
  const inThisScheme = [
    ...new Set(question.solution.map((s) => s.mark).filter((m): m is MarkCode => Boolean(m) && m !== answer)),
  ];
  const others = CODE_POOL.filter((c) => c !== answer && !inThisScheme.includes(c));
  const distractors = [...inThisScheme, ...others].slice(0, OPTION_COUNT - 1);

  return {
    kind: "code",
    id: `code:${question.templateId}:${question.seed}:${targetIndex}`,
    prompt: question.prompt,
    steps: question.solution.map((step) => ({ text: step.text, mark: step.mark, why: step.why })),
    targetIndex,
    answer,
    options: shuffle([answer, ...distractors], random),
    templateId: question.templateId,
    seed: question.seed,
    specCode: question.specCode,
  };
}

function ruleDrill(index: number, random: () => number): MarkRuleDrill {
  const source = markRuleDrills[index];
  return {
    kind: "rule",
    id: `rule:${index}`,
    prompt: source.prompt,
    answer: source.answer,
    options: shuffle([...source.options], random),
    explanation: source.explanation,
  };
}

/**
 * Build a drill set.
 *
 * Deliberately mixed. The rule drills teach the system and the code drills
 * make you apply it to real working — either alone is weaker: knowing that
 * "M1 survives an arithmetic slip" is no use if you cannot spot which step
 * of your own solution was the method.
 *
 * `random` is injectable so the set is testable; the UI passes Math.random.
 */
export function buildDrillSet(count: number, random: () => number = Math.random): Drill[] {
  const drills: Drill[] = [];
  const ruleOrder = shuffle(markRuleDrills.map((_, i) => i), random);
  let rulesUsed = 0;

  // Roughly one rule drill in three, so the set is mostly applied practice.
  const wantRules = Math.min(ruleOrder.length, Math.max(1, Math.round(count / 3)));

  let guard = 0;
  while (drills.length < count && guard < count * 20) {
    guard++;
    const takeRule = rulesUsed < wantRules && (drills.length % 3 === 1 || drills.length >= count - (wantRules - rulesUsed));
    if (takeRule) {
      drills.push(ruleDrill(ruleOrder[rulesUsed], random));
      rulesUsed++;
      continue;
    }
    const template = questionTemplates[Math.floor(random() * questionTemplates.length)];
    const question = generateQuestion(template, Math.floor(random() * 0xffffffff));
    const drill = drillFromQuestion(question, random);
    // A template whose solution carries no mark codes is simply skipped.
    if (drill && !drills.some((d) => d.id === drill.id)) drills.push(drill);
  }

  return drills;
}
