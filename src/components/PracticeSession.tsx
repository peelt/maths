"use client";

import { useEffect, useState } from "react";
import { QuestionRunner } from "./QuestionRunner";
import { buildPracticeSet, templatesForTopic, type GeneratedQuestion } from "@/lib/questions";

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
        <p className="font-semibold">No questions for this topic yet.</p>
        <p className="mt-1 text-sm text-muted">
          The question bank is being built out starting with Year 1 Pure.
        </p>
      </div>
    );
  }

  return <QuestionRunner questions={questions} topicName={topicName} topicSlug={topicSlug} />;
}
