import type { ReviewState } from "@/lib/scheduling";

/** One answered question. */
export interface Attempt {
  id: string;
  templateId: string;
  /** The seed, so the exact question can be regenerated for review. */
  seed: number;
  /** Qualified spec point, e.g. "pure:5.6". */
  specPoint: string;
  correct: boolean;
  /** What the student actually typed, for reviewing their own reasoning. */
  given: string;
  /** Milliseconds spent on the question. */
  timeMs: number;
  /** ISO timestamp. */
  at: string;
}

/**
 * Streak state.
 *
 * Deliberately forgiving. A streak that is destroyed by one missed day
 * punishes exactly the situation it should absorb — an off day — and the
 * usual result is that the student stops altogether rather than restarting
 * from zero. Freezes are earned by consistency and spent automatically.
 */
export interface Streak {
  current: number;
  longest: number;
  /** ISO date (YYYY-MM-DD) of the last day with any activity. */
  lastActiveDate: string | null;
  /** Unspent freezes, which cover a missed day automatically. */
  freezes: number;
  /** Days counted toward earning the next freeze. */
  daysTowardNextFreeze: number;
}

export interface SessionSummary {
  id: string;
  startedAt: string;
  endedAt: string;
  questionsAttempted: number;
  questionsCorrect: number;
}

/**
 * Everything the app needs to persist.
 *
 * Two implementations exist — browser storage and Supabase — and the app picks
 * at runtime. Keeping this interface small is what makes the site fully usable
 * before any backend exists.
 */
export interface ProgressStore {
  readonly kind: "local" | "supabase";
  getReviewStates(): Promise<ReviewState[]>;
  saveReviewState(state: ReviewState): Promise<void>;
  recordAttempt(attempt: Attempt): Promise<void>;
  getAttempts(limit?: number): Promise<Attempt[]>;
  getStreak(): Promise<Streak>;
  saveStreak(streak: Streak): Promise<void>;
  saveSession(session: SessionSummary): Promise<void>;
  getSessions(limit?: number): Promise<SessionSummary[]>;
  /** Wipe everything for this user. */
  clear(): Promise<void>;
}

export const emptyStreak: Streak = {
  current: 0,
  longest: 0,
  lastActiveDate: null,
  freezes: 0,
  daysTowardNextFreeze: 0,
};
