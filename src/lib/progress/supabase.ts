import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReviewState } from "@/lib/scheduling";
import { emptyStreak, type Attempt, type ProgressStore, type SessionSummary, type Streak } from "./types";

/**
 * Supabase-backed progress.
 *
 * Rows are owned by the signed-in user and protected by row-level security,
 * so this client never has to filter by user id for safety — the database
 * refuses to return anyone else's rows regardless of what is asked for.
 *
 * Sign-in is anonymous: an account is created silently, with no email and no
 * password, so there is no sign-in step between opening the site and working.
 */
export function createSupabaseStore(client: SupabaseClient, userId: string): ProgressStore {
  return {
    kind: "supabase",

    async getReviewStates() {
      const { data, error } = await client.from("review_states").select("*");
      if (error) throw error;
      return (data ?? []).map(
        (row): ReviewState => ({
          specPoint: row.spec_point,
          intervalDays: row.interval_days,
          difficulty: Number(row.difficulty),
          reps: row.reps,
          lapses: row.lapses,
          due: row.due,
          lastReviewed: row.last_reviewed,
        }),
      );
    },

    async saveReviewState(state) {
      const { error } = await client.from("review_states").upsert(
        {
          user_id: userId,
          spec_point: state.specPoint,
          interval_days: state.intervalDays,
          difficulty: state.difficulty,
          reps: state.reps,
          lapses: state.lapses,
          due: state.due,
          last_reviewed: state.lastReviewed,
        },
        { onConflict: "user_id,spec_point" },
      );
      if (error) throw error;
    },

    async recordAttempt(attempt) {
      const { error } = await client.from("attempts").insert({
        id: attempt.id,
        user_id: userId,
        template_id: attempt.templateId,
        seed: attempt.seed,
        spec_point: attempt.specPoint,
        correct: attempt.correct,
        given: attempt.given,
        time_ms: attempt.timeMs,
        at: attempt.at,
      });
      if (error) throw error;
    },

    async getAttempts(limit = 50) {
      const { data, error } = await client.from("attempts").select("*").order("at", { ascending: false }).limit(limit);
      if (error) throw error;
      return (data ?? []).map(
        (row): Attempt => ({
          id: row.id,
          templateId: row.template_id,
          seed: row.seed,
          specPoint: row.spec_point,
          correct: row.correct,
          given: row.given,
          timeMs: row.time_ms,
          at: row.at,
        }),
      );
    },

    async getStreak() {
      const { data, error } = await client.from("streaks").select("*").maybeSingle();
      if (error) throw error;
      if (!data) return emptyStreak;
      return {
        current: data.current,
        longest: data.longest,
        lastActiveDate: data.last_active_date,
        freezes: data.freezes,
        daysTowardNextFreeze: data.days_toward_next_freeze,
      };
    },

    async saveStreak(streak) {
      const { error } = await client.from("streaks").upsert(
        {
          user_id: userId,
          current: streak.current,
          longest: streak.longest,
          last_active_date: streak.lastActiveDate,
          freezes: streak.freezes,
          days_toward_next_freeze: streak.daysTowardNextFreeze,
        },
        { onConflict: "user_id" },
      );
      if (error) throw error;
    },

    async saveSession(session) {
      const { error } = await client.from("sessions").insert({
        id: session.id,
        user_id: userId,
        started_at: session.startedAt,
        ended_at: session.endedAt,
        questions_attempted: session.questionsAttempted,
        questions_correct: session.questionsCorrect,
      });
      if (error) throw error;
    },

    async getSessions(limit = 30) {
      const { data, error } = await client
        .from("sessions")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map(
        (row): SessionSummary => ({
          id: row.id,
          startedAt: row.started_at,
          endedAt: row.ended_at,
          questionsAttempted: row.questions_attempted,
          questionsCorrect: row.questions_correct,
        }),
      );
    },

    async clear() {
      // RLS confines each delete to the current user's own rows.
      for (const table of ["attempts", "review_states", "sessions", "streaks"]) {
        const { error } = await client.from(table).delete().eq("user_id", userId);
        if (error) throw error;
      }
    },
  };
}
