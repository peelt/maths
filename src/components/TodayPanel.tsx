"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProgressStore, streakIsLive, type Streak } from "@/lib/progress";
import { dueCount, sortByPriority, type ReviewState } from "@/lib/scheduling";
import { allTopics, getSpecPoint } from "@/content/spec";
import { specPointsWithQuestions } from "@/lib/questions";

/**
 * The one thing to do next.
 *
 * The whole panel exists to remove a decision. Opening a revision site and
 * being shown nineteen topics is a choice, and on a bad day a choice is where
 * the session ends. So this resolves to a single primary button: either what
 * is due for review, or a sensible place to start.
 */

interface State {
  loading: boolean;
  due: number;
  streak: Streak | null;
  nextTopicSlug: string;
  nextTopicName: string;
  reason: string;
  reviewed: number;
}

const practisable = () => specPointsWithQuestions();

/**
 * Where to send someone with no history yet.
 *
 * The best-covered topic, not simply the first one in the specification —
 * spec order would open on Proof, which has a single spec point and would
 * make a thin and unrepresentative first session.
 */
function defaultTopic() {
  const covered = practisable();
  const ranked = allTopics
    .map((topic) => ({
      topic,
      score: topic.points.filter((p) => covered.has(`${topic.paper}:${p.code}`)).length,
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.topic ?? allTopics[0];
}

export function TodayPanel() {
  const [state, setState] = useState<State>({
    loading: true,
    due: 0,
    streak: null,
    nextTopicSlug: defaultTopic().slug,
    nextTopicName: defaultTopic().name,
    reason: "Start at the beginning",
    reviewed: 0,
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const store = await getProgressStore();
      const [states, streak] = await Promise.all([store.getReviewStates(), store.getStreak()]);
      if (cancelled) return;

      const covered = practisable();
      const due = dueCount(states);

      // Prefer the most urgent spec point that can actually be practised.
      const prioritised = sortByPriority(states).filter((s: ReviewState) => covered.has(s.specPoint));
      const top = prioritised[0];

      let slug = defaultTopic().slug;
      let name = defaultTopic().name;
      let reason = states.length === 0 ? "A good place to start" : "Next up";

      if (top) {
        const [paper, code] = top.specPoint.split(":");
        const found = getSpecPoint(paper as "pure" | "statistics" | "mechanics", code);
        if (found) {
          slug = found.topic.slug;
          name = found.topic.name;
          reason = due > 0 ? "Due for review" : "Weakest area";
        }
      }

      setState({
        loading: false,
        due,
        streak,
        nextTopicSlug: slug,
        nextTopicName: name,
        reason,
        reviewed: states.length,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const { loading, due, streak, nextTopicSlug, nextTopicName, reason, reviewed } = state;
  const live = streak ? streakIsLive(streak) : false;

  return (
    <section className="rounded-xl border border-border bg-surface p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{reason}</p>
      <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{nextTopicName}</h2>
      <p className="mt-2 text-muted">
        {loading
          ? "Checking where you left off…"
          : due > 0
            ? `${due} spec point${due === 1 ? "" : "s"} ready for review. Five questions, about eight minutes.`
            : reviewed > 0
              ? "Nothing overdue. Five questions to keep it sharp — about eight minutes."
              : "Five questions, about eight minutes. Marked as you go, with the full mark scheme after each one."}
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href={`/practice/${nextTopicSlug}`}
          className="inline-flex items-center justify-center rounded-lg bg-accent-fill px-6 py-3.5 text-lg font-semibold text-on-accent transition-colors hover:bg-accent-fill-hover"
        >
          Start
        </Link>
        <Link
          href="/topics"
          className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-3.5 font-semibold hover:bg-surface-2"
        >
          Pick something else
        </Link>
      </div>

      {streak && streak.current > 0 ? (
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-sm">
          <span className={live ? "font-semibold" : "text-muted"}>
            {streak.current} day streak
            {!live ? " — pick it back up today" : ""}
          </span>
          {streak.freezes > 0 ? (
            <span className="text-muted">
              {streak.freezes} freeze{streak.freezes === 1 ? "" : "s"} banked — a missed day will not
              break it
            </span>
          ) : null}
          {streak.longest > streak.current ? (
            <span className="text-muted">Best: {streak.longest}</span>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
