"use client";

import { useEffect, useState } from "react";
import { QuestionRunner } from "./QuestionRunner";
import { buildPracticeSet, templatesForTopic, type GeneratedQuestion } from "@/lib/questions";
import { readPacePreference, writePacePreference } from "@/lib/timing";

/** How many questions make a session. Short enough to actually finish. */
const SET_SIZE = 5;

/**
 * Builds the question set in the browser.
 *
 * Generation is random, so it has to happen after hydration — otherwise the
 * server and client would render different numbers and React would complain.
 */
export function PracticeSession({ topicSlug, topicName }: { topicSlug: string; topicName: string }) {
  const [questions, setQuestions] = useState<GeneratedQuestion[] | null>(null);
  // Whether the exam-pace clock is showing. Read from storage after mount for
  // the same reason as the question set: the server cannot know it.
  const [timed, setTimed] = useState(false);

  useEffect(() => {
    const stored = readPacePreference(typeof window === "undefined" ? undefined : window.localStorage);
    // Same knowing waiver as below: a stored preference is a client-only value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setTimed(true);
  }, []);

  function changeTimed(next: boolean) {
    setTimed(next);
    writePacePreference(typeof window === "undefined" ? undefined : window.localStorage, next);
  }

  useEffect(() => {
    // Building the set has to happen after mount, because it is random: doing
    // it during render would make the server and client disagree and break
    // hydration. This is the documented way to produce client-only values, so
    // the cascading-render rule is knowingly waived for this one line.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestions(buildPracticeSet(templatesForTopic(topicSlug), SET_SIZE));
  }, [topicSlug]);

  if (questions === null) {
    return (
      <div className="py-16 text-center text-muted" aria-live="polite">
        Building your set…
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <p className="font-semibold">No questions could be built for this topic.</p>
        <p className="mt-1 text-sm text-muted">
          Every spec point has questions, so this means something went wrong rather than that the
          topic is unfinished. Try another topic, and the rest of the site is unaffected.
        </p>
      </div>
    );
  }

  return (
    <QuestionRunner
      questions={questions}
      topicName={topicName}
      topicSlug={topicSlug}
      timed={timed}
      onTimedChange={changeTimed}
    />
  );
}
