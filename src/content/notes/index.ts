import type { Paper } from "@/content/spec";
import { differentiationNotes } from "./differentiation";
import { integrationNotes } from "./integration";
import { pureRestNotes } from "./pure-rest";
import { algebraNotes } from "./algebra";
import { appliedNotes } from "./applied";
import { trigonometryNotes } from "./trigonometry";
import type { TeachingNote } from "./types";

export * from "./types";

/**
 * Teaching notes, keyed by spec point.
 *
 * Every one of the 89 spec points has a note, and a test asserts it. The UI
 * still renders gracefully without one — a spec point with no note shows its
 * summary and exam note exactly as before — so adding a spec point does not
 * break the page, it just fails the suite until a note is written.
 */
export const teachingNotes: TeachingNote[] = [
  ...algebraNotes,
  ...appliedNotes,
  ...differentiationNotes,
  ...integrationNotes,
  ...pureRestNotes,
  ...trigonometryNotes,
];

const byKey = new Map(teachingNotes.map((n) => [`${n.paper}:${n.specCode}`, n]));

export function noteFor(paper: Paper, specCode: string): TeachingNote | undefined {
  return byKey.get(`${paper}:${specCode}`);
}

export function specPointsWithNotes(): Set<string> {
  return new Set(byKey.keys());
}
