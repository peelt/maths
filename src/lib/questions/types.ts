import type { AnswerSpec } from "@/lib/marking";
import type { Paper } from "@/content/spec";
import type { Rng } from "./rng";

/**
 * Mark scheme codes, as used in real Edexcel mark schemes.
 *
 * Showing these against each step of a worked solution is the point: roughly
 * half the marks in this qualification are for reasoning and problem solving
 * rather than for executing a technique, and students consistently lose them
 * by not showing method. Labelling where each mark comes from makes that
 * visible instead of implicit.
 */
export type MarkCode = "M1" | "A1" | "B1" | "M1A1" | "A1ft" | "E1" | "dM1";

export const markCodeMeanings: Record<MarkCode, string> = {
  M1: "Method mark — awarded for a correct method, even if the arithmetic then goes wrong.",
  A1: "Accuracy mark — awarded for a correct answer, and only if the method mark was earned.",
  B1: "Independent mark — awarded for a correct statement or value on its own merit.",
  M1A1: "A method mark and an accuracy mark together.",
  A1ft: "Follow-through — a correct answer based on your own earlier (possibly wrong) value.",
  E1: "Explanation mark — awarded for a written justification.",
  dM1: "Dependent method mark — only available if the previous method mark was earned.",
};

export interface SolutionStep {
  /** Which mark this step earns, if any. */
  mark?: MarkCode;
  /** The working, with LaTeX between $ … $. */
  text: string;
  /** Why this step is done — the bit a textbook usually leaves out. */
  why?: string;
}

export interface QuestionVariant {
  /** The question as posed, with LaTeX between $ … $. */
  prompt: string;
  answer: AnswerSpec;
  solution: SolutionStep[];
  /** A nudge that does not give the answer away. */
  hint?: string;
  /** The specific slip this question is designed to expose. */
  trap?: string;
}

export interface QuestionTemplate {
  id: string;
  paper: Paper;
  /** Spec point code this question assesses, e.g. "2.3". */
  specCode: string;
  topicSlug: string;
  /** Which assessment objective this question mainly targets. */
  ao: 1 | 2 | 3;
  marks: number;
  /** 1 routine, 2 typical exam standard, 3 stretch. */
  difficulty: 1 | 2 | 3;
  /** Builds a fresh variant from a seed. Must be pure. */
  generate(rng: Rng): QuestionVariant;
}

/** A generated question, with the seed that produced it. */
export interface GeneratedQuestion extends QuestionVariant {
  templateId: string;
  seed: number;
  paper: Paper;
  specCode: string;
  topicSlug: string;
  ao: 1 | 2 | 3;
  marks: number;
  difficulty: 1 | 2 | 3;
}
