"use client";

import { elapsedFraction, formatClock } from "@/lib/timing";

/**
 * The clock for a single question under exam pace.
 *
 * Deliberately quiet. It does not change colour, flash, or count down towards
 * zero: a countdown makes the last seconds the loudest thing on screen, which
 * is the opposite of what helps here. It counts up against a stated allowance,
 * so the question stays the thing being looked at.
 *
 * When the allowance is gone it says so in words and stops. Nothing is taken
 * away, because being slow on a question is information rather than a failure.
 */
export function PaceClock({ elapsed, allowance }: { elapsed: number; allowance: number }) {
  const over = elapsed >= allowance;

  return (
    <div className="mt-2 flex items-center gap-3">
      <div
        className="h-1 flex-1 overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-label="Time used on this question"
        aria-valuenow={Math.round(elapsedFraction(elapsed, allowance) * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-border transition-[width] duration-300"
          style={{ width: `${elapsedFraction(elapsed, allowance) * 100}%` }}
        />
      </div>
      {/*
        Announced only when the allowance runs out, not on every tick: a clock
        read aloud every second would make the page unusable with a screen
        reader.
      */}
      <p className="shrink-0 text-xs tabular-nums text-muted" aria-hidden="true">
        {formatClock(elapsed)}{" "}
        <span className="text-muted/70">/ {formatClock(allowance)}</span>
      </p>
      <p aria-live="polite" className="sr-only">
        {over ? "Over the exam allowance for this question. Keep going." : ""}
      </p>
      {over ? (
        <p className="shrink-0 text-xs font-semibold text-muted">Over — keep going</p>
      ) : null}
    </div>
  );
}
