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
 * Where a spec point falls in a typical two-year teaching order.
 * "both" means the point is introduced in Year 1 and extended in Year 2 —
 * common in this spec, where e.g. binomial expansion starts with positive
 * integer n and later extends to rational n.
 */
export type Year = 1 | 2 | "both";

export interface SpecPoint {
  /** Official spec code, e.g. "2.3". Unique within a paper. */
  code: string;
  title: string;
  year: Year;
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
