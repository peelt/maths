import type { Paper } from "@/content/spec";
import { differentiationNotes } from "./differentiation";
import type { TeachingNote } from "./types";

export * from "./types";

/**
 * Teaching notes, keyed by spec point.
 *
 * Coverage is partial and the UI says so rather than pretending otherwise: a
 * spec point without a note simply shows its summary and exam note, exactly as
 * before.
 */
export const teachingNotes: TeachingNote[] = [...differentiationNotes];

const byKey = new Map(teachingNotes.map((n) => [`${n.paper}:${n.specCode}`, n]));

export function noteFor(paper: Paper, specCode: string): TeachingNote | undefined {
  return byKey.get(`${paper}:${specCode}`);
}

export function specPointsWithNotes(): Set<string> {
  return new Set(byKey.keys());
}
