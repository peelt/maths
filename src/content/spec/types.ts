/**
 * Types for the Edexcel A Level Mathematics (9MA0) specification map.
 *
 * Every spec point code here is taken verbatim from the official Pearson
 * specification, Issue 4. The codes are the join key used across the whole
 * app: content, questions and a learner's mastery record all reference a
 * spec point by its code string (e.g. "5.6"), so nothing can drift.
 */

/** Which exam paper a topic is assessed on. Pure is examined on Papers 1 and 2. */
export type Paper = "pure" | "statistics" | "mechanics";

/**
 * When a spec point is usually taught, derived from the specification itself.
 *
 * The board does not divide this course into years — the words "Year 1" and
 * "Year 2" appear nowhere in the specification, and all three papers are sat
 * at the end. The one division it does make is to mark the content shared
 * with AS Mathematics in bold, "to support the co-teaching of this
 * qualification with the AS Mathematics qualification". Schools generally
 * teach that AS content first, so it is the honest basis for this field.
 *
 * "spanning" is not a hedge: the bold runs through parts of a spec point, so
 * binomial expansion is marked AS for positive integer n and A level for
 * rational n. A point with any bold at all is met before the rest of it is.
 *
 * Derived by scripts/derive-phase.py, not assigned by hand.
 */
export type Phase = "first" | "later" | "spanning";

export interface SpecPoint {
  /** Official spec code, e.g. "2.3". Unique within a paper. */
  code: string;
  title: string;
  phase: Phase;
  /** What the specification actually requires, in plain English. */
  summary: string;
  /** Where the marks are, and what examiners reliably ask. */
  examNote?: string;
  /** Free-text search terms, including alternative names a student might use. */
  keywords: string[];
}

export interface Topic {
  /** Topic number within its paper, as printed in the spec. */
  number: number;
  paper: Paper;
  name: string;
  /** URL segment. */
  slug: string;
  /** One sentence on why this topic matters. */
  blurb: string;
  points: SpecPoint[];
}

export interface PaperInfo {
  id: Paper | "paper3";
  label: string;
  durationMinutes: number;
  marks: number;
  /** Percentage of the total A Level. */
  weight: number;
}
