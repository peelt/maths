import type { Paper } from "@/content/spec";
import { createRng, randomSeed } from "./rng";
import type { GeneratedQuestion, QuestionTemplate } from "./types";
import { questionTemplates } from "@/content/questions";

export * from "./types";
export * from "./rng";

/** Build a concrete question from a template and a seed. */
export function generateQuestion(template: QuestionTemplate, seed = randomSeed()): GeneratedQuestion {
  const variant = template.generate(createRng(seed));
  return {
    ...variant,
    templateId: template.id,
    seed,
    paper: template.paper,
    specCode: template.specCode,
    topicSlug: template.topicSlug,
    ao: template.ao,
    marks: template.marks,
    difficulty: template.difficulty,
  };
}

const byId = new Map(questionTemplates.map((t) => [t.id, t]));

export function getTemplate(id: string): QuestionTemplate | undefined {
  return byId.get(id);
}

/** Reproduce a past question exactly, from the ids stored with the attempt. */
export function regenerate(templateId: string, seed: number): GeneratedQuestion | undefined {
  const template = byId.get(templateId);
  return template ? generateQuestion(template, seed) : undefined;
}

export function templatesForSpecPoint(paper: Paper, specCode: string): QuestionTemplate[] {
  return questionTemplates.filter((t) => t.paper === paper && t.specCode === specCode);
}

export function templatesForTopic(topicSlug: string): QuestionTemplate[] {
  return questionTemplates.filter((t) => t.topicSlug === topicSlug);
}

export function specPointsWithQuestions(): Set<string> {
  return new Set(questionTemplates.map((t) => `${t.paper}:${t.specCode}`));
}

/**
 * Build a practice set.
 *
 * Sets are deliberately short and fixed-length. An open-ended queue of
 * questions has no end in sight, which is exactly the shape of task that gets
 * abandoned; a set of five with a visible counter has a finish line.
 */
export function buildPracticeSet(templates: QuestionTemplate[], count: number): GeneratedQuestion[] {
  if (templates.length === 0) return [];
  const chosen: QuestionTemplate[] = [];
  const pool = [...templates];

  // Prefer not to repeat a template until every one has been used once.
  while (chosen.length < count) {
    if (pool.length === 0) pool.push(...templates);
    const index = Math.floor(Math.random() * pool.length);
    chosen.push(pool.splice(index, 1)[0]);
  }

  // Easier questions first, so a session opens with a win rather than a wall.
  chosen.sort((a, b) => a.difficulty - b.difficulty);
  return chosen.map((t) => generateQuestion(t));
}

export { questionTemplates };
