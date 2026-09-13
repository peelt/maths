"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProgressStore, type Attempt, type SessionSummary, type Streak } from "@/lib/progress";
import {
  recentSessions,
  summariseByTopic,
  summariseOverall,
  weakestPoints,
  type OverallSummary,
  type TopicSummary,
  type WeakPoint,
} from "@/lib/progress/summarise";
import type { ReviewState } from "@/lib/scheduling";
import { dueCount } from "@/lib/scheduling";
import { Card, Meter, PaperBadge } from "./ui";

/**
 * What you have done so far.
 *
 * Ordered by usefulness rather than by chronology: what to do next comes first,
 * then where you stand, and the log of sessions last. A history page that opens
 * on a wall of past attempts tells you nothing actionable.
 */

interface Data {
  loading: boolean;
  overall: OverallSummary;
  topics: TopicSummary[];
  weak: WeakPoint[];
  sessions: SessionSummary[];
  streak: Streak | null;
  due: number;
}

const EMPTY: Data = {
  loading: true,
  overall: { attempted: 0, correct: 0, accuracy: null, specPointsSeen: 0, totalTimeMs: 0 },
  topics: [],
  weak: [],
  sessions: [],
  streak: null,
  due: 0,
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function formatMinutes(ms: number): string {
  // Under a minute reads as "0 min", which looks like the page is broken
  // rather than like a short session.
  if (ms < 60_000) return `${Math.max(1, Math.round(ms / 1000))} sec`;
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export function ProgressView() {
  const [data, setData] = useState<Data>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const store = await getProgressStore();
      const [attempts, reviews, sessions, streak] = await Promise.all([
        store.getAttempts(500),
        store.getReviewStates(),
        store.getSessions(50),
        store.getStreak(),
      ]);
      if (cancelled) return;

      setData({
        loading: false,
        overall: summariseOverall(attempts as Attempt[]),
        topics: summariseByTopic(attempts as Attempt[], reviews as ReviewState[]),
        weak: weakestPoints(attempts as Attempt[]),
        sessions: recentSessions(sessions),
        streak,
        due: dueCount(reviews as ReviewState[]),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (data.loading) {
    return <p className="py-12 text-center text-muted" aria-live="polite">Loading your progress…</p>;
  }

  if (data.overall.attempted === 0) {
    return (
      <Card className="text-center">
        <p className="font-semibold">Nothing here yet.</p>
        <p className="mt-1 text-sm text-muted">
          Answer a few questions and this page will show what you have covered, what you are strong
          at, and what is worth going back to.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-lg bg-accent-fill px-5 py-2.5 font-semibold text-on-accent hover:bg-accent-fill-hover"
        >
          Start practising
        </Link>
      </Card>
    );
  }

  const { overall, topics, weak, sessions, streak, due } = data;

  return (
    <div className="space-y-10">
      <section>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card>
            <dt className="text-xs text-muted">Questions answered</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums">{overall.attempted}</dd>
          </Card>
          <Card>
            <dt className="text-xs text-muted">Accuracy</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums">
              {overall.accuracy === null ? "—" : `${Math.round(overall.accuracy * 100)}%`}
            </dd>
          </Card>
          <Card>
            <dt className="text-xs text-muted">Spec points covered</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums">
              {overall.specPointsSeen}
              <span className="text-base font-normal text-muted">/89</span>
            </dd>
          </Card>
          <Card>
            <dt className="text-xs text-muted">Time spent</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums">{formatMinutes(overall.totalTimeMs)}</dd>
          </Card>
        </dl>

        {streak && streak.current > 0 ? (
          <p className="mt-3 text-sm text-muted">
            {streak.current} day streak
            {streak.longest > streak.current ? ` · best ${streak.longest}` : ""}
            {due > 0 ? ` · ${due} ready for another look` : ""}
          </p>
        ) : null}
      </section>

      {weak.length > 0 ? (
        <section>
          <h2 className="mb-1 text-xl font-bold">Worth going back to</h2>
          <p className="mb-4 text-sm text-muted">
            Spec points you have got wrong more than once. These are the ones where practice pays.
          </p>
          <ul className="space-y-2">
            {weak.map((point) => (
              <li key={point.specPoint}>
                <Link
                  href={`/practice/${point.topicSlug}`}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/50 hover:bg-surface-2"
                >
                  <span className="shrink-0 rounded bg-surface-2 px-2 py-0.5 font-mono text-sm font-bold">
                    {point.code}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold group-hover:text-accent">{point.title}</span>
                    <span className="block text-sm text-muted">
                      {point.topicName} · {point.correct} of {point.attempted} correct
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-wrong">
                    {Math.round(point.accuracy * 100)}%
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 text-xl font-bold">By topic</h2>
        <ul className="space-y-3">
          {topics.map((summary) => (
            <li key={summary.topic.slug} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <Link href={`/topics/${summary.topic.slug}`} className="font-semibold hover:text-accent">
                  {summary.topic.name}
                </Link>
                <PaperBadge paper={summary.topic.paper} />
              </div>
              <p className="mt-1 text-sm text-muted">
                {summary.correct} of {summary.attempted} correct
                {summary.accuracy !== null ? ` · ${Math.round(summary.accuracy * 100)}%` : ""}
              </p>
              <div className="mt-2">
                <Meter value={summary.mastery} label={`${summary.topic.name} mastery`} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {sessions.length > 0 ? (
        <section>
          <h2 className="mb-4 text-xl font-bold">Recent sessions</h2>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {sessions.map((session) => (
              <li key={session.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="text-sm text-muted">{formatDate(session.startedAt)}</span>
                <span className="text-sm tabular-nums">
                  {session.questionsCorrect}/{session.questionsAttempted} correct
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
