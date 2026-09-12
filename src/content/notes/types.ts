import type { Paper } from "@/content/spec";

/**
 * A teaching note for a spec point.
 *
 * This fills the gap between "one-line spec summary" and "here is a question".
 * It is deliberately NOT a worked example: the question bank already generates
 * 107 of those, each annotated with where the marks are. Duplicating one here
 * would add nothing and would drift out of step with the bank.
 *
 * What is missing without this is the general recipe — the thing you want to
 * read BEFORE attempting a question, rather than the specific instance you get
 * afterwards.
 *
 * Kept short on purpose. This was built for a student with ADHD, and a wall of
 * prose is the reliable way to make a page go unread: one idea, a numbered
 * method you could follow under exam pressure, and the handful of things that
 * actually go wrong.
 */
export interface TeachingNote {
  paper: Paper;
  /** Spec point code, e.g. "7.4". The join key, as everywhere else. */
  specCode: string;
  /** What this actually is, in a sentence or two. No worked numbers. */
  idea: string;
  /** The general procedure, as steps you could follow in the exam. */
  method: string[];
  /** The handful of things that genuinely go wrong. */
  watchFor: string[];
}
