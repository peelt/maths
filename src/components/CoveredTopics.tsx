"use client";

import { useSyncExternalStore } from "react";
import { allTopics, paperLabels, taughtEarly, type Paper } from "@/content/spec";
import { getServerSnapshot, getSnapshot, subscribe, toggle, writeCovered } from "@/lib/covered";

const ORDER: Paper[] = ["pure", "statistics", "mechanics"];

/**
 * The suggested starting position, before the student says otherwise.
 *
 * A topic counts when MOST of its spec points are met early, not merely one.
 * "Any point" ticks 17 of 19 topics, because almost every topic is opened at
 * some point in the first year — a suggestion that suggests nothing. Majority
 * gives 13, and puts the right things outside it: numerical methods and
 * moments carry no AS content at all, while exponentials, vectors and
 * sampling are wholly AS.
 */
function seed(): Set<string> {
  return new Set(
    allTopics
      .filter((t) => t.points.filter(taughtEarly).length > t.points.length / 2)
      .map((t) => t.slug),
  );
}

/**
 * "Which of these have you done?"
 *
 * The specification cannot answer this: it sets no teaching order, and what a
 * school has covered by March depends on that school. So the site asks once,
 * remembers, and lets the answer be changed whenever it goes stale.
 *
 * Closed by default. Nineteen checkboxes is exactly the kind of wall this site
 * exists to avoid, so it stays folded away until someone wants it, and the
 * site works perfectly well for anyone who never opens it.
 */
export function CoveredTopics() {
  // The store handles the server/client split: React renders the server
  // snapshot during hydration and swaps to the stored one straight after,
  // with no mismatch and no setState in an effect.
  const covered = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const marked = covered ?? seed();
  const started = covered !== null;

  return (
    <details className="mt-4 rounded-lg border border-border bg-surface">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold">
        Which topics have you covered?
        <span className="ml-2 font-normal text-muted">
          {started ? `${marked.size} of ${allTopics.length} marked` : "not set yet"}
        </span>
      </summary>

      <div className="border-t border-border px-4 py-3">
        <p className="text-sm leading-relaxed text-muted">
          The exam board doesn&rsquo;t split this course into years, and it can&rsquo;t know what your
          school has taught. Tick what you&rsquo;ve done and the site will stop putting the rest in
          front of you. Change it whenever you like — nothing is hidden permanently, and everything
          is examined at the end either way.
        </p>

        {started ? null : (
          <p className="mt-2 text-sm text-muted">
            Ticked below is a guess: the content this specification shares with AS Maths, which is
            usually taught first.
          </p>
        )}

        {ORDER.map((paper) => (
          <fieldset key={paper} className="mt-4">
            <legend className="text-xs font-semibold uppercase tracking-wider text-muted">
              {paperLabels[paper]}
            </legend>
            <div className="mt-2 grid gap-1 sm:grid-cols-2">
              {allTopics
                .filter((t) => t.paper === paper)
                .map((topic) => (
                  <label key={topic.slug} className="flex items-center gap-2 py-1 text-sm">
                    <input
                      type="checkbox"
                      checked={marked.has(topic.slug)}
                      onChange={() => writeCovered(toggle(marked, topic.slug))}
                      className="size-4 shrink-0 accent-accent"
                    />
                    <span>{topic.name}</span>
                  </label>
                ))}
            </div>
          </fieldset>
        ))}

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <button
            type="button"
            onClick={() => writeCovered(new Set(allTopics.map((t) => t.slug)))}
            className="font-medium text-accent underline underline-offset-4"
          >
            Tick everything
          </button>
          <button
            type="button"
            onClick={() => writeCovered(seed())}
            className="font-medium text-accent underline underline-offset-4"
          >
            Back to the usual first-year set
          </button>
        </div>
      </div>
    </details>
  );
}
