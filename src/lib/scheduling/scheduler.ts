/**
 * Spaced repetition scheduling.
 *
 * This is an SM-2 derived scheduler extended with an explicit difficulty term,
 * rather than a full FSRS implementation. FSRS depends on a large table of
 * fitted weights, and a half-remembered version of those weights would give
 * confidently wrong intervals; a small scheduler whose behaviour is fully
 * specified and tested is more honest and, with no review history to train on,
 * performs comparably.
 *
 * Everything is deterministic: the same state and grade always produce the
 * same next interval, which is what makes the behaviour testable.
 */

export type Grade = "again" | "hard" | "good" | "easy";

export interface ReviewState {
  /** Spec point this record is about, qualified by paper, e.g. "pure:5.6". */
  specPoint: string;
  /** Current interval in days. */
  intervalDays: number;
  /** 1 (easy for this student) to 10 (hard). Starts at 5. */
  difficulty: number;
  /** Total successful reviews. */
  reps: number;
  /** Times this has been forgotten after previously being known. */
  lapses: number;
  /** ISO date-time this becomes due. */
  due: string;
  /** ISO date-time of the last review, or null if never reviewed. */
  lastReviewed: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** First interval in days for each grade, for a spec point never seen before. */
const FIRST_INTERVAL: Record<Grade, number> = {
  again: 0,
  hard: 1,
  good: 3,
  easy: 6,
};

/** How each grade moves difficulty. Positive means harder. */
const DIFFICULTY_DELTA: Record<Grade, number> = {
  again: 1.2,
  hard: 0.4,
  good: 0,
  easy: -0.6,
};

/** Never schedule further out than this — a whole A Level course is two years. */
const MAX_INTERVAL_DAYS = 180;

export function createReviewState(specPoint: string, now = new Date()): ReviewState {
  return {
    specPoint,
    intervalDays: 0,
    difficulty: 5,
    reps: 0,
    lapses: 0,
    due: now.toISOString(),
    lastReviewed: null,
  };
}

function clampDifficulty(value: number): number {
  return Math.min(10, Math.max(1, Number(value.toFixed(2))));
}

/**
 * Growth factor applied to the current interval on a successful review.
 *
 * An easier-feeling spec point grows faster. The difficulty term means a topic
 * a student repeatedly struggles with keeps coming back often, even once they
 * start getting it right.
 */
function growthFactor(grade: Grade, difficulty: number): number {
  const ease = 1 + (5 - difficulty) * 0.12; // ~1.48 at difficulty 1, ~0.4 at 10
  switch (grade) {
    case "hard":
      return Math.max(1.1, 1.2 * ease);
    case "good":
      return Math.max(1.3, 2.4 * ease);
    case "easy":
      return Math.max(1.6, 3.6 * ease);
    case "again":
      return 0; // unused — handled separately
  }
}

export function review(state: ReviewState, grade: Grade, now = new Date()): ReviewState {
  const difficulty = clampDifficulty(state.difficulty + DIFFICULTY_DELTA[grade]);
  const seenBefore = state.reps > 0;

  let intervalDays: number;
  let reps = state.reps;
  let lapses = state.lapses;

  if (grade === "again") {
    // Forgotten. Come back in the same session, and count it as a lapse only
    // if it was previously known — a first-time miss is not a lapse.
    intervalDays = 0;
    if (seenBefore) lapses += 1;
    reps = 0;
  } else if (!seenBefore) {
    intervalDays = FIRST_INTERVAL[grade];
    reps = 1;
  } else {
    const base = Math.max(state.intervalDays, 1);
    intervalDays = Math.min(MAX_INTERVAL_DAYS, Math.round(base * growthFactor(grade, difficulty)));
    reps += 1;
  }

  return {
    ...state,
    intervalDays,
    difficulty,
    reps,
    lapses,
    due: new Date(now.getTime() + intervalDays * DAY_MS).toISOString(),
    lastReviewed: now.toISOString(),
  };
}

export function isDue(state: ReviewState, now = new Date()): boolean {
  return new Date(state.due).getTime() <= now.getTime();
}

/**
 * A 0-1 estimate of how well a spec point is known, for progress display.
 *
 * Based on the current interval: something you can still recall after a month
 * is genuinely learnt, whereas something on a one-day interval is not yet.
 */
export function mastery(state: ReviewState): number {
  if (state.reps === 0) return 0;
  const target = 30; // days; at a month's interval we call it mastered
  return Math.min(1, Number((Math.log1p(state.intervalDays) / Math.log1p(target)).toFixed(3)));
}

/** Due items first, then the least well known. */
export function sortByPriority(states: ReviewState[], now = new Date()): ReviewState[] {
  return [...states].sort((a, b) => {
    const aDue = isDue(a, now);
    const bDue = isDue(b, now);
    if (aDue !== bDue) return aDue ? -1 : 1;
    if (aDue && bDue) return new Date(a.due).getTime() - new Date(b.due).getTime();
    return mastery(a) - mastery(b);
  });
}

export function dueCount(states: ReviewState[], now = new Date()): number {
  return states.filter((s) => isDue(s, now)).length;
}
