"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Maths } from "./Maths";
import { buildDrillSet, type Drill } from "@/lib/drills";
import { markCodeMeanings } from "@/lib/questions/types";
import { getProgressStore, recordActivity } from "@/lib/progress";

/**
 * Mark scheme drills.
 *
 * Deliberately NOT recorded against any spec point. Knowing that a step earns
 * M1 says nothing about whether you can integrate, so feeding these into the
 * spaced repetition schedule would corrupt it — the mastery figures would stop
 * meaning what the progress page claims they mean. The session is saved, so
 * the work still counts towards the streak.
 */

const SET_SIZE = 6;

type Phase = "answering" | "feedback" | "done";

export function MarkSchemeDrill() {
  const [drills, setDrills] = useState<Drill[] | null>(null);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("answering");
  const [choice, setChoice] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streakMessage, setStreakMessage] = useState<string | null>(null);
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
    // Built after mount because the set is random: doing it during render
    // would make the server and client disagree and break hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrills(buildDrillSet(SET_SIZE));
  }, []);

  const finish = useCallback(async (finalCorrect: number) => {
    try {
      const store = await getProgressStore();
      const now = new Date();
      await store.saveSession({
        id: crypto.randomUUID(),
        startedAt: new Date(startedAt.current).toISOString(),
        endedAt: now.toISOString(),
        questionsAttempted: SET_SIZE,
        questionsCorrect: finalCorrect,
      });
      const streak = await store.getStreak();
      const updated = recordActivity(streak, now);
      await store.saveStreak(updated);
      if (updated.current > streak.current) {
        setStreakMessage(updated.current === 1 ? "Streak started." : `${updated.current} day streak.`);
      }
    } catch {
      // A storage failure must never interrupt a session in progress.
    }
  }, []);

  if (drills === null) {
    return (
      <div className="py-16 text-center text-muted" aria-live="polite">
        Building your drill…
      </div>
    );
  }

  const drill = drills[index];
  const total = drills.length;
  const isLast = index === total - 1;
  const isCorrect = choice === drill?.answer;

  const submit = () => {
    if (phase !== "answering" || choice === null) return;
    setPhase("feedback");
    if (choice === drill.answer) setCorrectCount((n) => n + 1);
  };

  const next = () => {
    if (isLast) {
      setPhase("done");
      // submit() has already counted this answer, so this is the final total.
      void finish(correctCount);
      return;
    }
    setIndex((i) => i + 1);
    setChoice(null);
    setPhase("answering");
  };

  if (phase === "done") {
    return (
      <div className="rise mx-auto max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
          Mark scheme drill · complete
        </p>
        <p className="mt-4 text-5xl font-bold tabular-nums">
          {correctCount}
          <span className="text-muted">/{total}</span>
        </p>
        <p className="mt-2 text-muted">
          {correctCount === total
            ? "Every one. You can read a mark scheme properly, which is worth real marks."
            : correctCount >= total / 2
              ? "Getting there. The distinction that matters most is method against accuracy."
              : "Worth doing again — these rules are worth marks in every single paper."}
        </p>
        {streakMessage ? (
          <p className="mt-4 inline-block rounded-full border border-accent/30 bg-accent-soft px-4 py-1.5 text-sm font-semibold text-accent">
            {streakMessage}
          </p>
        ) : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => {
              setDrills(buildDrillSet(SET_SIZE));
              setIndex(0);
              setChoice(null);
              setCorrectCount(0);
              setPhase("answering");
            }}
            className="rounded-lg bg-accent px-5 py-3 font-semibold text-on-accent hover:bg-accent-hover"
          >
            Another set
          </button>
          <Link
            href="/exam"
            className="rounded-lg border border-border bg-surface px-5 py-3 font-semibold hover:bg-surface-2"
          >
            Back to the exam guide
          </Link>
        </div>
      </div>
    );
  }

  if (!drill) return null;

  return (
    <div>
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-muted">
            {index + 1} of {total}
          </span>
          <span className="text-muted">
            {drill.kind === "rule" ? "Marking rules" : `Spec ${drill.specCode}`}
          </span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={total}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <article className="rounded-xl border border-border bg-surface p-5 sm:p-7">
        {drill.kind === "code" ? (
          <>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">The question</p>
            <Maths className="leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0">{drill.prompt}</Maths>

            <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-muted">
              The mark scheme
            </p>
            <ol className="space-y-3">
              {drill.steps.map((step, i) => {
                const isTarget = i === drill.targetIndex;
                const revealed = phase === "feedback";
                return (
                  <li
                    key={i}
                    className={`flex gap-3 rounded-lg ${isTarget ? "border border-accent/40 bg-accent-soft p-3" : ""}`}
                  >
                    <span
                      className={`mt-0.5 h-fit shrink-0 rounded border px-1.5 py-0.5 font-mono text-xs font-bold ${
                        isTarget
                          ? revealed
                            ? "border-correct-border bg-correct-soft text-correct"
                            : "border-accent bg-surface text-accent"
                          : "border-border bg-surface"
                      }`}
                    >
                      {isTarget ? (revealed ? drill.answer : "?") : (step.mark ?? "—")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Maths className="[&_p]:m-0">{step.text}</Maths>
                    </div>
                  </li>
                );
              })}
            </ol>

            <p className="mt-6 font-semibold">Which mark does the highlighted step earn?</p>
          </>
        ) : (
          <Maths className="text-lg leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0">{drill.prompt}</Maths>
        )}

        <fieldset className="mt-4" disabled={phase !== "answering"}>
          <legend className="sr-only">Select your answer</legend>
          <div className="grid gap-2">
            {drill.options.map((option) => {
              const selected = choice === option;
              const isAnswer = phase === "feedback" && option === drill.answer;
              const wrongPick = phase === "feedback" && selected && option !== drill.answer;
              return (
                <button
                  key={option}
                  onClick={() => setChoice(option)}
                  className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                    isAnswer
                      ? "border-correct-border bg-correct-soft"
                      : wrongPick
                        ? "border-wrong-border bg-wrong-soft"
                        : selected
                          ? "border-accent bg-accent-soft"
                          : "border-border hover:bg-surface-2"
                  }`}
                >
                  {drill.kind === "code" ? (
                    <span className="font-mono font-bold">{option}</span>
                  ) : (
                    <Maths className="[&_p]:m-0">{option}</Maths>
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>

        {phase === "answering" ? (
          <button
            onClick={submit}
            disabled={choice === null}
            className="mt-6 rounded-lg bg-accent px-5 py-2.5 font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-40"
          >
            Check
          </button>
        ) : null}

        {phase === "feedback" ? (
          <div className="rise mt-6">
            <div
              className={`rounded-lg border px-4 py-3 font-semibold ${
                isCorrect
                  ? "border-correct-border bg-correct-soft text-correct"
                  : "border-wrong-border bg-wrong-soft text-wrong"
              }`}
            >
              {isCorrect ? "Correct." : "Not quite."}
            </div>

            <div className="mt-4 rounded-lg border border-border bg-surface-2 p-4">
              {drill.kind === "code" ? (
                <>
                  <p className="font-mono text-sm font-bold">{drill.answer}</p>
                  <p className="mt-1 text-sm">{markCodeMeanings[drill.answer]}</p>
                  {drill.steps[drill.targetIndex].why ? (
                    <Maths className="mt-3 border-t border-border pt-3 text-sm text-muted [&_p]:m-0">
                      {drill.steps[drill.targetIndex].why!}
                    </Maths>
                  ) : null}
                </>
              ) : (
                <Maths className="text-sm [&_p]:m-0">{drill.explanation}</Maths>
              )}
            </div>

            <button
              onClick={next}
              autoFocus
              className="mt-5 rounded-lg bg-accent px-5 py-2.5 font-semibold text-on-accent hover:bg-accent-hover"
            >
              {isLast ? "Finish" : "Next"}
            </button>
          </div>
        ) : null}
      </article>
    </div>
  );
}
