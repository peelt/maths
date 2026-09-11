import type { ReviewState } from "@/lib/scheduling";
import { emptyStreak, type Attempt, type ProgressStore, type SessionSummary, type Streak } from "./types";

const PREFIX = "9ma0:";
const KEYS = {
  reviews: `${PREFIX}reviews`,
  attempts: `${PREFIX}attempts`,
  streak: `${PREFIX}streak`,
  sessions: `${PREFIX}sessions`,
} as const;

/** Keep storage bounded — old attempts are not worth the quota. */
const MAX_ATTEMPTS = 500;
const MAX_SESSIONS = 200;

/**
 * Browser-storage progress.
 *
 * Every access is wrapped, because localStorage throws rather than returning
 * empty in a private window or when site data is blocked. Losing progress is
 * bad; a page that will not load at all is worse.
 */
function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or storage blocked. The session still works; it just
    // will not be remembered, which is better than crashing mid-question.
  }
}

export function createLocalStore(): ProgressStore {
  return {
    kind: "local",

    async getReviewStates() {
      return read<ReviewState[]>(KEYS.reviews, []);
    },

    async saveReviewState(state) {
      const all = read<ReviewState[]>(KEYS.reviews, []);
      const index = all.findIndex((s) => s.specPoint === state.specPoint);
      if (index >= 0) all[index] = state;
      else all.push(state);
      write(KEYS.reviews, all);
    },

    async recordAttempt(attempt) {
      const all = read<Attempt[]>(KEYS.attempts, []);
      all.unshift(attempt);
      write(KEYS.attempts, all.slice(0, MAX_ATTEMPTS));
    },

    async getAttempts(limit = 50) {
      return read<Attempt[]>(KEYS.attempts, []).slice(0, limit);
    },

    async getStreak() {
      return read<Streak>(KEYS.streak, emptyStreak);
    },

    async saveStreak(streak) {
      write(KEYS.streak, streak);
    },

    async saveSession(session) {
      const all = read<SessionSummary[]>(KEYS.sessions, []);
      all.unshift(session);
      write(KEYS.sessions, all.slice(0, MAX_SESSIONS));
    },

    async getSessions(limit = 30) {
      return read<SessionSummary[]>(KEYS.sessions, []).slice(0, limit);
    },

    async clear() {
      if (typeof window === "undefined") return;
      try {
        for (const key of Object.values(KEYS)) window.localStorage.removeItem(key);
      } catch {
        // Nothing sensible to do if storage is unavailable.
      }
    },
  };
}
