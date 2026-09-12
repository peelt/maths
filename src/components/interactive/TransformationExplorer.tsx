"use client";

import { useState } from "react";
import { Curve, Plot } from "../Plot";
import { InlineMaths } from "../Maths";

/**
 * Graph transformations — spec point 2.9.
 *
 * This is the topic where a picture genuinely beats an explanation. The
 * inside-the-bracket transformations behave counter-intuitively: f(x + a)
 * moves LEFT, and f(ax) squashes rather than stretches. Being told that is
 * forgettable; watching the curve move while the number changes is not.
 *
 * The original curve stays on screen, dashed, so the comparison is always
 * visible rather than remembered.
 */

type Kind = "outside-add" | "inside-add" | "outside-multiply" | "inside-multiply";

const BASE = (x: number) => x * x * x - 3 * x;

const KINDS: Record<
  Kind,
  {
    label: string;
    latex: string;
    describe: (a: number) => string;
    apply: (a: number) => (x: number) => number;
  }
> = {
  "outside-add": {
    label: "f(x) + a",
    latex: "\\mathrm{f}(x)+a",
    describe: (a) =>
      a === 0
        ? "No change."
        : `Translation of ${Math.abs(a)} ${a > 0 ? "up" : "down"} — outside the bracket, so it behaves exactly as it looks.`,
    apply: (a) => (x) => BASE(x) + a,
  },
  "inside-add": {
    label: "f(x + a)",
    latex: "\\mathrm{f}(x+a)",
    describe: (a) =>
      a === 0
        ? "No change."
        : `Translation of ${Math.abs(a)} to the ${a > 0 ? "LEFT" : "RIGHT"} — inside the bracket, so it does the opposite of what it looks like.`,
    apply: (a) => (x) => BASE(x + a),
  },
  "outside-multiply": {
    label: "a f(x)",
    latex: "a\\,\\mathrm{f}(x)",
    describe: (a) =>
      a === 1
        ? "No change."
        : `Vertical stretch, scale factor ${a}${a < 0 ? ", and the negative reflects it in the x-axis" : ""}.`,
    apply: (a) => (x) => a * BASE(x),
  },
  "inside-multiply": {
    label: "f(ax)",
    latex: "\\mathrm{f}(ax)",
    describe: (a) =>
      a === 1
        ? "No change."
        : `Horizontal stretch, scale factor 1/${a} — so multiplying x by ${a} squashes the graph by a factor of ${a}.`,
    apply: (a) => (x) => BASE(a * x),
  },
};

export function TransformationExplorer() {
  const [kind, setKind] = useState<Kind>("inside-add");
  const [a, setA] = useState(1);

  const config = KINDS[kind];
  const isMultiply = kind.endsWith("multiply");
  // A multiplier of zero collapses the curve to a flat line and teaches nothing.
  const value = isMultiply && a === 0 ? 1 : a;

  return (
    <div className="rounded-xl border border-border bg-surface-2 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(KINDS) as Kind[]).map((key) => (
          <button
            key={key}
            onClick={() => {
              setKind(key);
              setA(key.endsWith("multiply") ? 2 : 1);
            }}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              kind === key
                ? "border-accent bg-accent-soft font-semibold text-accent"
                : "border-border bg-surface text-muted hover:text-text"
            }`}
          >
            <InlineMaths>{KINDS[key].latex}</InlineMaths>
          </button>
        ))}
      </div>

      <Plot xRange={[-5, 5]} yRange={[-6, 6]} label={`Graph showing ${config.label} against the original curve`}>
        <Curve fn={BASE} color="var(--text-muted)" width={2} dashed opacity={0.6} />
        <Curve fn={config.apply(value)} color="var(--plot-a)" width={3} />
      </Plot>

      <div className="mt-4">
        <label className="flex items-center gap-3 text-sm">
          <span className="w-20 shrink-0 font-mono font-semibold tabular-nums">a = {value}</span>
          <input
            type="range"
            min={isMultiply ? -3 : -4}
            max={isMultiply ? 3 : 4}
            step={isMultiply ? 0.5 : 1}
            value={a}
            onChange={(event) => setA(Number(event.target.value))}
            className="h-1.5 flex-1 cursor-pointer accent-[var(--accent-fill)]"
            aria-label={`Value of a in ${config.label}`}
          />
        </label>
        <p className="mt-3 text-sm text-muted">{config.describe(value)}</p>
        <p className="mt-2 text-xs text-muted">
          The dashed curve is the original <InlineMaths>{String.raw`y=\mathrm{f}(x)`}</InlineMaths>, here{" "}
          <InlineMaths>{String.raw`y=x^3-3x`}</InlineMaths>.
        </p>
      </div>
    </div>
  );
}
