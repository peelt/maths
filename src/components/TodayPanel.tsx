"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProgressStore, streakIsLive, type Streak } from "@/lib/progress";
import { dueCount, sortByPriority, type ReviewState } from "@/lib/scheduling";
import { allTopics, getSpecPoint, getTopic } from "@/content/spec";
import { specPointsWithQuestions } from "@/lib/questions";
import { readCurrentTopic } from "@/lib/currentTopic";

/**
 * The one thing to do next.
 *
 * The whole panel exists to remove a decision. Opening a revision site and
 * being shown nineteen topics is a choice, and on a bad day a choice is where
 * the session ends. So this resolves to a single primary button.
 *
 * WHAT FILLS THAT BUTTON CHANGED. It used to be whatever the review scheduler
 * judged most overdue, under the heading "Due for review" — which was the
 * wrong thing to put first. A revision site that opens by telling a student
 * what they owe accumulates debt in their head, and for the reader this one is
 * built for, a pile of overdue work is what ends the session before it starts.
 *
 * Now the student names the topic they are covering in class and that leads.
 * Scheduling still runs underneath, because it is what makes anything stick,
 * but it offers rather than demands: it appears as a quiet line under the
 * button, never as the headline, and never with a count of what is late.
 */

interface State {
  loading: boolean;
  /** The topic the student said they are covering. Null until they say. */
  chosen: string | null;
  due: number;
  streak: Streak | null;
  nextTopicSlug: string;
  nextTopicName: string;
  reason: string;
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
    chosen: null,
    due: 0,
    streak: null,
    nextTopicSlug: defaultTopic().slug,
    nextTopicName: defaultTopic().name,
    reason: "Start at the beginning",
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
      let reason = states.length === 0 ? "A good place to start" : "Where you left off";

      // The scheduler's pick, used only when the student has not named a topic.
      if (top) {
        const [paper, code] = top.specPoint.split(":");
        const found = getSpecPoint(paper as "pure" | "statistics" | "mechanics", code);
        if (found) {
          slug = found.topic.slug;
          name = found.topic.name;
          reason = "Worth another look";
        }
      }

      // What the student said they are covering beats anything inferred. They
      // know what is on the whiteboard this week and the scheduler does not.
      const chosen = readCurrentTopic(
        typeof window === "undefined" ? undefined : window.localStorage,
        (candidate) => Boolean(getTopic(candidate)),
      );
      const chosenTopic = chosen ? getTopic(chosen) : undefined;
      if (chosenTopic) {
        slug = chosenTopic.slug;
        name = chosenTopic.name;
        reason = "Your topic right now";
      }

      setState({
        loading: false,
        chosen,
        due,
        streak,
        nextTopicSlug: slug,
        nextTopicName: name,
        reason,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const { loading, chosen, due, streak, nextTopicSlug, nextTopicName, reason } = state;
  const live = streak ? streakIsLive(streak) : false;

  return (
    <section className="rounded-xl border border-border bg-surface p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{reason}</p>
      <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{nextTopicName}</h2>
      <p className="mt-2 text-muted">
        {loading
          ? "Checking where you left off…"
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
          {chosen ? "Change topic" : "Pick a topic"}
        </Link>
      </div>

      {!loading && !chosen ? (
        <p className="mt-4 text-sm text-muted">
          Doing something particular in class? Open the topic and say so — this panel will open on
          it from then on.
        </p>
      ) : null}

      {/*
        The offer, deliberately without a number. A count of what is waiting is
        a backlog, and a backlog is the thing that ends the session before it
        starts; "there is some" is all the student needs to decide.
      */}
      {!loading && due > 0 ? (
        <p className="mt-4 text-sm text-muted">
          Some earlier topics are ready for another look whenever you fancy it —{" "}
          <Link href="/progress" className="text-accent underline underline-offset-2">
            see what you have covered
          </Link>
          .
        </p>
      ) : null}

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
