"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Maths } from "./Maths";
import { markAnswer, type MarkResult } from "@/lib/marking";
import { markCodeMeanings, type GeneratedQuestion } from "@/lib/questions";
import { getProgressStore, recordActivity } from "@/lib/progress";
import { createReviewState, review, type Grade } from "@/lib/scheduling";
import { PaceClock } from "./PaceClock";
import { allowanceSeconds, paceSummary } from "@/lib/timing";
import { noteFor } from "@/content/notes";
import { TeachingNoteBody } from "./TeachingNoteBody";

/**
 * A practice session.
 *
 * Sessions are a fixed, visible length. An open-ended queue has no finish
 * line, and a task with no finish line is the one that gets abandoned — so
 * there is always a "3 of 5" in view and a definite end.
 *
 * Feedback is immediate and the grade for scheduling is inferred rather than
 * asked for. Being asked "how well did you know that?" after every question
 * is a decision per question, and decisions are the expensive part.
 */

interface Props {
  questions: GeneratedQuestion[];
  topicName: string;
  topicSlug: string;
  /** Show the exam-pace clock. Off by default; see PaceToggle for why. */
  timed: boolean;
  onTimedChange: (timed: boolean) => void;
}

type Phase = "answering" | "feedback" | "done";

/** Infer a scheduling grade from what actually happened. */
function inferGrade(correct: boolean, assisted: boolean, seconds: number): Grade {
  if (!correct) return "again";
  if (assisted) return "hard";
  return seconds <= 45 ? "easy" : "good";
}

/**
 * Turning exam pace on and off.
 *
 * Off by default, and switchable at any point in a set rather than chosen up
 * front. A question asked before the first piece of maths is one more decision
 * between opening the site and doing any work, and decisions are the expensive
 * part. The choice is remembered, so it is asked once at most.
 */
function PaceToggle({ timed, onChange }: { timed: boolean; onChange: (timed: boolean) => void }) {
  return (
    <button
      type="button"
      aria-pressed={timed}
      onClick={() => onChange(!timed)}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        timed
          ? "border-border bg-surface-2 text-text"
          : "border-border-soft text-muted hover:bg-surface-2"
      }`}
    >
      {timed ? "Exam pace on" : "Exam pace off"}
    </button>
  );
}

export function QuestionRunner({ questions, topicName, topicSlug, timed, onTimedChange }: Props) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("answering");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<MarkResult | null>(null);
  const [usedHint, setUsedHint] = useState(false);
  /**
   * Whether this answer had help, for scheduling only.
   *
   * Separate from usedHint, which reveals the hint text. Opening the method
   * should tell the scheduler the answer was assisted WITHOUT also handing
   * over the hint the student did not ask for.
   */
  const [assisted, setAssisted] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  /**
   * The teaching note for this question's spec point, opened in place.
   *
   * Being stuck used to mean leaving the session for the topic page, and
   * coming back built a brand new set — so "read the explainer and carry on"
   * cost you your place. The explanation comes to the question instead.
   */
  const [showNote, setShowNote] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [streakMessage, setStreakMessage] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [insidePace, setInsidePace] = useState(0);

  // Timestamps are set on mount rather than during render: reading the clock
  // while rendering is impure, and a re-render would silently reset them.
  const startedAt = useRef(0);
  const questionStartedAt = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const question = questions[index];
  const note = question ? noteFor(question.paper, question.specCode) : undefined;
  const total = questions.length;
  const isLast = index === total - 1;

  useEffect(() => {
    questionStartedAt.current = Date.now();
    inputRef.current?.focus();
  }, [index]);

  useEffect(() => {
    // Only while a question is open: the clock has to stop when feedback is on
    // screen, or reading the mark scheme would look like time spent thinking.
    if (!timed || phase !== "answering") return;
    const tick = () => setElapsed((Date.now() - questionStartedAt.current) / 1000);
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [timed, phase, index]);

  const finishSession = useCallback(
    async (finalCorrect: number) => {
      const store = await getProgressStore();
      const now = new Date();
      await store.saveSession({
        id: crypto.randomUUID(),
        startedAt: new Date(startedAt.current).toISOString(),
        endedAt: now.toISOString(),
        questionsAttempted: total,
        questionsCorrect: finalCorrect,
      });

      const streak = await store.getStreak();
      const updated = recordActivity(streak, now);
      await store.saveStreak(updated);

      if (updated.current > streak.current) {
        setStreakMessage(
          updated.current === 1
            ? "Streak started."
            : `${updated.current} day streak.${updated.freezes > 0 ? ` ${updated.freezes} freeze${updated.freezes === 1 ? "" : "s"} banked.` : ""}`,
        );
      }
    },
    [total],
  );

  const submit = useCallback(async () => {
    if (phase !== "answering" || !question) return;

    const marked = markAnswer(input, question.answer);
    // An unreadable answer is not a wrong answer — let them fix the typo.
    if (marked.outcome === "unparseable") {
      setResult(marked);
      return;
    }

    setResult(marked);
    setPhase("feedback");
    if (marked.correct) setCorrectCount((n) => n + 1);
    if (!marked.correct) setShowSolution(true);

    const seconds = (Date.now() - questionStartedAt.current) / 1000;
    const specPoint = `${question.paper}:${question.specCode}`;
    if (timed && seconds <= allowanceSeconds(question.marks)) setInsidePace((n) => n + 1);

    try {
      const store = await getProgressStore();
      await store.recordAttempt({
        id: crypto.randomUUID(),
        templateId: question.templateId,
        seed: question.seed,
        specPoint,
        correct: marked.correct,
        given: input,
        timeMs: Date.now() - questionStartedAt.current,
        at: new Date().toISOString(),
      });

      const states = await store.getReviewStates();
      const existing = states.find((s) => s.specPoint === specPoint) ?? createReviewState(specPoint);
      await store.saveReviewState(review(existing, inferGrade(marked.correct, assisted, seconds)));
    } catch {
      // Never let a storage failure interrupt a session in progress.
    }
  }, [assisted, input, phase, question, timed]);

  const next = useCallback(() => {
    if (isLast) {
      setPhase("done");
      void finishSession(correctCount);
      return;
    }
    setIndex((i) => i + 1);
    setInput("");
    setResult(null);
    setUsedHint(false);
    setAssisted(false);
    setShowSolution(false);
    setShowNote(false);
    setPhase("answering");
  }, [correctCount, finishSession, isLast]);

  // Enter submits, then Enter moves on — the whole set is keyboard-only.
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (phase === "answering") void submit();
    else if (phase === "feedback") next();
  };

  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  if (phase === "done") {
    return (
      <div className="rise mx-auto max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
          {topicName} · session complete
        </p>
        <p className="mt-4 text-5xl font-bold tabular-nums">
          {correctCount}
          <span className="text-muted">/{total}</span>
        </p>
        <p className="mt-2 text-muted">
          {accuracy >= 80
            ? "Strong. That is exam standard."
            : accuracy >= 50
              ? "Solid work — the ones you missed are now scheduled to come back."
              : "Hard set. Everything you missed is queued to return, which is exactly how it should work."}
        </p>
        {timed ? <p className="mt-3 text-sm text-muted">{paceSummary(insidePace, total)}</p> : null}

        {streakMessage ? (
          <p className="mt-4 inline-block rounded-full border border-correct-border bg-correct-soft px-4 py-1.5 text-sm font-semibold text-correct">
            {streakMessage}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/practice/${topicSlug}`}
            className="rounded-lg bg-accent-fill px-5 py-3 font-semibold text-on-accent hover:bg-accent-fill-hover"
          >
            Another set
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-border bg-surface px-5 py-3 font-semibold hover:bg-surface-2"
          >
            Stop here
          </Link>
        </div>
        <p className="mt-6 text-xs text-muted">
          Stopping now is a perfectly good outcome. Short and regular beats long and rare.
        </p>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div>
      <div className="mb-6">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
          <span className="font-medium text-muted">
            Question {index + 1} of {total}
          </span>
          <span className="text-muted">
            {question.marks} mark{question.marks === 1 ? "" : "s"} · AO{question.ao} · spec {question.specCode}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={total}>
          <div className="h-full rounded-full bg-accent-fill transition-[width] duration-300" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>

        {timed ? <PaceClock elapsed={elapsed} allowance={allowanceSeconds(question.marks)} /> : null}

        <div className="mt-2 flex justify-end">
          <PaceToggle timed={timed} onChange={onTimedChange} />
        </div>
      </div>

      <article className="rounded-xl border border-border bg-surface p-5 sm:p-7">
        <Maths className="text-lg leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0">{question.prompt}</Maths>

        <div className="mt-6">
          {question.answer.type === "choice" ? (
            <fieldset disabled={phase !== "answering"}>
              <legend className="sr-only">Select your answer</legend>
              <div className="grid gap-2">
                {question.answer.options.map((option) => {
                  const selected = input === option;
                  const isAnswer = phase === "feedback" && option === question.answer.value;
                  const wrongPick = phase === "feedback" && selected && !result?.correct;
                  return (
                    <button
                      key={option}
                      onClick={() => {
                        setInput(option);
                      }}
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
                      <Maths className="[&_p]:m-0">{option}</Maths>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : (
            <div>
              <label htmlFor="answer" className="mb-1.5 block text-sm font-medium">
                Your answer
              </label>
              <input
                id="answer"
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onKeyDown}
                disabled={phase !== "answering"}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder="e.g. 3/4, sqrt(5), 2x^2 - 1"
                className="w-full rounded-lg border border-border bg-bg px-4 py-3 font-mono text-base outline-none disabled:opacity-70"
              />
              <p className="mt-1.5 text-xs text-muted">
                Type it however you would write it — <code>1/2</code>, <code>0.5</code> and{" "}
                <code>2^-1</code> are all marked the same.
                {question.answer.type === "numeric" && question.answer.requireExact
                  ? " This one needs an exact answer, so no decimals."
                  : ""}
              </p>
            </div>
          )}
        </div>

        {result && !result.correct && result.message ? (
          <p className="mt-4 rounded-lg border border-note-border bg-note-soft px-4 py-3 text-sm text-note">
            {result.message}
          </p>
        ) : null}

        {phase === "answering" ? (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => void submit()}
              disabled={!input.trim()}
              className="rounded-lg bg-accent-fill px-5 py-2.5 font-semibold text-on-accent transition-colors hover:bg-accent-fill-hover disabled:opacity-40"
            >
              Check
            </button>
            {question.hint && !usedHint ? (
              <button
                onClick={() => {
                  setUsedHint(true);
                  setAssisted(true);
                }}
                className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted hover:bg-surface-2"
              >
                Nudge me
              </button>
            ) : null}
            {note && !showNote ? (
              <button
                onClick={() => {
                  setShowNote(true);
                  // Opening the method BEFORE answering is the same signal as
                  // taking a hint: the question comes back sooner. Opening it
                  // after the answer is marked is just reading, and counts for
                  // nothing. It does NOT reveal the hint — that is a separate
                  // piece of help the student has not asked for.
                  setAssisted(true);
                }}
                className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted hover:bg-surface-2"
              >
                Explain this
              </button>
            ) : null}
          </div>
        ) : null}

        {usedHint && question.hint ? (
          <div className="mt-4 rounded-lg border border-border bg-surface-2 px-4 py-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Hint</p>
            <Maths className="text-sm [&_p]:m-0">{question.hint}</Maths>
          </div>
        ) : null}

        {showNote && note ? (
          <div className="rise mt-4 rounded-lg border border-border bg-surface-2 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                How spec {question.specCode} works
              </p>
              <button
                onClick={() => setShowNote(false)}
                className="text-xs font-medium text-muted underline underline-offset-2 hover:text-text"
              >
                Hide
              </button>
            </div>
            <TeachingNoteBody note={note} />
            {/*
              For when the note is not enough. It leaves the session, which
              costs the current set, so it is the quiet option rather than the
              obvious one — and it lands on this exact spec point rather than
              the top of the topic.
            */}
            <p className="mt-5 border-t border-border pt-3 text-xs text-muted">
              <Link
                href={`/topics/${topicSlug}#${question.specCode}`}
                className="text-accent underline underline-offset-2"
              >
                Open the full topic
              </Link>{" "}
              — this leaves the session and starts a new set next time.
            </p>
          </div>
        ) : null}

        {phase === "feedback" && result ? (
          <div className="rise mt-6">
            <div
              className={`rounded-lg border px-4 py-3 font-semibold ${
                result.correct
                  ? "border-correct-border bg-correct-soft text-correct"
                  : "border-wrong-border bg-wrong-soft text-wrong"
              }`}
            >
              {result.correct ? "Correct." : "Not quite."}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              {!showSolution ? (
                <button
                  onClick={() => setShowSolution(true)}
                  className="text-sm font-medium text-accent underline underline-offset-4"
                >
                  Show the worked solution
                </button>
              ) : null}
              {note && !showNote ? (
                // No scheduling penalty here: the answer is already marked, so
                // this is reading rather than help.
                <button
                  onClick={() => setShowNote(true)}
                  className="text-sm font-medium text-accent underline underline-offset-4"
                >
                  Explain the method
                </button>
              ) : null}
            </div>

            {!showSolution ? null : (
              <div className="mt-4 rounded-lg border border-border bg-surface-2 p-4">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">
                  Where the marks are
                </h3>
                <ol className="space-y-3">
                  {question.solution.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        className="mt-0.5 h-fit shrink-0 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-xs font-bold"
                        title={step.mark ? markCodeMeanings[step.mark] : undefined}
                      >
                        {step.mark ?? "—"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <Maths className="[&_p]:m-0">{step.text}</Maths>
                        {step.why ? (
                          <Maths className="mt-1 text-sm text-muted [&_p]:m-0">{step.why}</Maths>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>

                {question.trap ? (
                  <div className="mt-4 border-t border-border pt-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-wrong">
                      Where people lose the mark
                    </p>
                    <Maths className="text-sm [&_p]:m-0">{question.trap}</Maths>
                  </div>
                ) : null}
              </div>
            )}

            <button
              onClick={next}
              autoFocus
              className="mt-5 rounded-lg bg-accent-fill px-5 py-2.5 font-semibold text-on-accent hover:bg-accent-fill-hover"
            >
              {isLast ? "Finish" : "Next question"}
              <kbd className="ml-2 hidden rounded border border-on-accent/30 px-1 text-[10px] sm:inline">↵</kbd>
            </button>
          </div>
        ) : null}
      </article>

      <p className="mt-4 text-center text-xs text-muted">
        Press <kbd className="rounded border border-border bg-surface-2 px-1">f</kbd> any time for the
        formula reference.
      </p>
    </div>
  );
}
