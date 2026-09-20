"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { Paper } from "@/content/spec";
import { getServerSnapshot, getSnapshot, isCovered, subscribe } from "@/lib/covered";
import { PaperBadge } from "@/components/ui";
import { TopicIllustration } from "@/components/illustration/topics";

/** One card's worth, computed on the server and passed down. */
export interface PractiseCard {
  slug: string;
  name: string;
  paper: Paper;
  questionTypes: number;
  specPoints: number;
}

/**
 * The topics offered for practice right now.
 *
 * This is the list the "which topics have you covered?" answer is FOR. The
 * specification index stays complete whatever is ticked, because that page is
 * the map of the course; this one is a set of suggestions, and suggesting work
 * the class has not reached yet is the fastest way to make the site feel like
 * it is not for you.
 *
 * With nothing marked the store returns null and every topic shows, so the
 * site never hides content it has not been told about.
 */
export function PractiseNow({ cards }: { cards: PractiseCard[] }) {
  const covered = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const shown = cards.filter((c) => isCovered(covered, c.slug));
  const hidden = cards.length - shown.length;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {shown.map((topic) => (
          <Link
            key={topic.slug}
            href={`/practice/${topic.slug}`}
            className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/50 hover:bg-surface-2"
          >
            <div className="flex items-start gap-3">
              <TopicIllustration
                slug={topic.slug}
                className="mt-0.5 h-9 w-13 shrink-0 opacity-80 transition-opacity group-hover:opacity-100"
              />
              <div className="min-w-0 flex-1">
                {/* Wraps rather than overflowing: the illustration plus a
                    two-part paper badge does not fit one row at 360px. */}
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <span className="font-semibold group-hover:text-accent">{topic.name}</span>
                  <PaperBadge paper={topic.paper} />
                </div>
                <p className="mt-1.5 text-sm text-muted">
                  {topic.questionTypes} question type{topic.questionTypes === 1 ? "" : "s"} ·{" "}
                  {topic.specPoints} spec point{topic.specPoints === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/*
        * Say what is missing and why. Silently showing a shorter list looks
        * like content has gone, and the whole point of this being a setting is
        * that it can be wrong and changed.
        */}
      {hidden > 0 ? (
        <p className="mt-3 text-sm text-muted">
          {hidden} topic{hidden === 1 ? "" : "s"} hidden because you haven&rsquo;t marked{" "}
          {hidden === 1 ? "it" : "them"} as covered.{" "}
          <Link href="/topics" className="font-medium text-accent underline underline-offset-4">
            Change what you&rsquo;ve covered
          </Link>
          .
        </p>
      ) : null}
    </>
  );
}
