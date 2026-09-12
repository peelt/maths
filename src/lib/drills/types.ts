import type { MarkCode } from "@/lib/questions/types";

/**
 * Mark scheme drills.
 *
 * The exam guide explains what M1, A1, B1 and dM1 mean. Reading that is not
 * the same as being able to look at your own working and see which marks it
 * would actually earn — and roughly half of this qualification's marks are for
 * method and reasoning rather than for the final answer, so a student who only
 * checks whether their answer matched is blind to most of what they lost.
 *
 * Two kinds of drill:
 *
 *  - "code"  Identify which mark a step of a real worked solution earns. The
 *            content is generated from the question bank, where every solution
 *            step is already tagged, so this scales across the whole course
 *            rather than needing separate authoring.
 *  - "rule"  The rules themselves — dependency, follow-through, and what a
 *            slip in the last line does and does not cost. These are authored,
 *            because they are about the marking system rather than about any
 *            particular question.
 */

export interface MarkCodeDrill {
  kind: "code";
  id: string;
  /** The question the worked solution belongs to. */
  prompt: string;
  /** Every step, in order. The step at `targetIndex` has its code hidden. */
  steps: { text: string; mark?: MarkCode; why?: string }[];
  targetIndex: number;
  answer: MarkCode;
  options: MarkCode[];
  /** Where this came from, so a drill is traceable to a real question. */
  templateId: string;
  seed: number;
  specCode: string;
}

export interface MarkRuleDrill {
  kind: "rule";
  id: string;
  prompt: string;
  answer: string;
  options: string[];
  /** Why that is the answer — the part worth remembering. */
  explanation: string;
}

export type Drill = MarkCodeDrill | MarkRuleDrill;
