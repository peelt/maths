"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProgressStore, streakIsLive, type Streak } from "@/lib/progress";
import { isDue, sortByPriority, type ReviewState } from "@/lib/scheduling";
import { allTopics, getSpecPoint } from "@/content/spec";
import { specPointsWithQuestions } from "@/lib/questions";
import { isCovered, readCovered } from "@/lib/covered";
import { sinceLastPractised } from "@/lib/timing";

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
 * Now it opens on whatever the student last practised, which is almost always
 * what class is on. That was first built as a button — "I'm covering this in
 * class" — and the button did not earn its place: it described an input while
 * its only effect was this page's Start link, so its purpose was not obvious
 * to anyone pressing it. Practising a topic already says which topic you are
 * on, so nothing needs declaring, and the answer now follows the account
 * rather than the device the declaration was made on.
 *
 * Scheduling still runs underneath, because it is what makes anything stick,
 * but it offers rather than demands: it appears as a quiet line under the
 * button, never as the headline, and never with a count of what is late.
 */

interface State {
  loading: boolean;
  /** True once the panel is showing the topic they were last working on. */
  resuming: boolean;
  /**
   * One specific topic worth going back to, or null.
   *
   * Named, not counted. "Some earlier topics are ready for another look" told
   * the student nothing they could act on; "Integration, 12 days ago" is a
   * thing to click.
   */
  revisit: { name: string; slug: string; when: string } | null;
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
  const taught = readCovered();
  const ranked = allTopics
    // Opening on something the class has not reached yet is the fastest way
    // to make the site feel like it is not for you. If nothing is marked,
    // isCovered returns true throughout and this changes nothing.
    .filter((topic) => isCovered(taught, topic.slug))
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
    resuming: false,
    revisit: null,
    streak: null,
    nextTopicSlug: defaultTopic().slug,
    nextTopicName: defaultTopic().name,
    reason: "Start at the beginning",
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const store = await getProgressStore();
      const [states, streak, attempts] = await Promise.all([
        store.getReviewStates(),
        store.getStreak(),
        store.getAttempts(1),
      ]);
      if (cancelled) return;

      const covered = practisable();

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

      /*
       * What they last practised beats anything the scheduler infers: it is
       * almost always what class is on, and it needed no asking. Attempts come
       * back newest first from both stores.
       */
      const [latest] = attempts;
      let resuming = false;
      if (latest) {
        const [paper, code] = latest.specPoint.split(":");
        const found = getSpecPoint(paper as "pure" | "statistics" | "mechanics", code);
        if (found) {
          slug = found.topic.slug;
          name = found.topic.name;
          reason = "Carry on with";
          resuming = true;
        }
      }

      /*
       * One topic worth going back to — never the one Start already opens on,
       * or the line would suggest what the button beside it already does.
       */
      const revisit = (() => {
        for (const candidate of prioritised) {
          if (!isDue(candidate)) continue;
          const [paper, code] = candidate.specPoint.split(":");
          const found = getSpecPoint(paper as "pure" | "statistics" | "mechanics", code);
          if (!found || found.topic.slug === slug) continue;
          const last = candidate.lastReviewed ? new Date(candidate.lastReviewed).getTime() : NaN;
          const days = (Date.now() - last) / 86_400_000;
          return {
            name: found.topic.name,
            slug: found.topic.slug,
            when: sinceLastPractised(days),
          };
        }
        return null;
      })();

      setState({
        loading: false,
        resuming,
        revisit,
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

  const { loading, resuming, revisit, streak, nextTopicSlug, nextTopicName, reason } = state;
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
          Pick a topic
        </Link>
      </div>

      {!loading && resuming ? (
        <p className="mt-4 text-sm text-muted">
          This is where you were last. Practise anything else and it will start there instead.
        </p>
      ) : null}

      {/*
        One named topic, not a count. "Some earlier topics are ready for
        another look" gave the student nothing to act on, and a number of them
        would be a backlog — which is the thing that ends the session before it
        starts. A single topic and when they last did it is both concrete and
        finite.
      */}
      {!loading && revisit ? (
        <p className="mt-4 text-sm text-muted">
          You last practised{" "}
          <Link
            href={`/practice/${revisit.slug}`}
            className="font-medium text-accent underline underline-offset-2"
          >
            {revisit.name}
          </Link>{" "}
          {revisit.when}.
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
