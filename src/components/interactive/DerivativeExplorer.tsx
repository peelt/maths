"use client";

import { useState } from "react";
import { Curve, Plot, PlotPoint, StraightLine } from "../Plot";
import { InlineMaths } from "../Maths";

/**
 * The derivative as the gradient of the tangent — spec points 7.1 and 7.3.
 *
 * The idea that a derivative IS a gradient, varying from point to point, is
 * the one that makes the rest of calculus make sense, and it is much easier to
 * see than to state. Moving the point moves the tangent and updates the
 * number, so the connection between the three is direct.
 *
 * Stationary points are called out as they happen, because "gradient zero" is
 * an abstraction until you watch the tangent go flat.
 */

const CURVES = [
  {
    label: "y = x² ",
    latex: "y=x^2",
    derivativeLatex: "\\frac{dy}{dx}=2x",
    f: (x: number) => x * x,
    df: (x: number) => 2 * x,
  },
  {
    label: "y = x³ − 3x",
    latex: "y=x^3-3x",
    derivativeLatex: "\\frac{dy}{dx}=3x^2-3",
    f: (x: number) => x ** 3 - 3 * x,
    df: (x: number) => 3 * x * x - 3,
  },
  {
    label: "y = sin x",
    latex: "y=\\sin x",
    derivativeLatex: "\\frac{dy}{dx}=\\cos x",
    f: (x: number) => Math.sin(x),
    df: (x: number) => Math.cos(x),
  },
];

export function DerivativeExplorer() {
  const [curveIndex, setCurveIndex] = useState(1);
  const [x, setX] = useState(0.5);

  const curve = CURVES[curveIndex];
  const y = curve.f(x);
  const gradient = curve.df(x);
  const stationary = Math.abs(gradient) < 0.06;

  return (
    <div className="rounded-xl border border-border bg-surface-2 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap gap-2">
        {CURVES.map((c, i) => (
          <button
            key={c.label}
            onClick={() => setCurveIndex(i)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              curveIndex === i
                ? "border-accent bg-accent-soft font-semibold text-accent"
                : "border-border bg-surface text-muted hover:text-text"
            }`}
          >
            <InlineMaths>{c.latex}</InlineMaths>
          </button>
        ))}
      </div>

      <Plot xRange={[-4, 4]} yRange={[-5, 5]} label={`Tangent to ${curve.label} at x = ${x.toFixed(2)}`}>
        <Curve fn={curve.f} width={3} />
        <StraightLine through={{ x, y }} gradient={gradient} color={stationary ? "var(--correct)" : "var(--warn)"} />
        <PlotPoint x={x} y={y} color={stationary ? "var(--correct)" : "var(--warn)"} />
      </Plot>

      <div className="mt-4">
        <label className="flex items-center gap-3 text-sm">
          <span className="w-20 shrink-0 font-mono font-semibold tabular-nums">x = {x.toFixed(2)}</span>
          <input
            type="range"
            min={-4}
            max={4}
            step={0.05}
            value={x}
            onChange={(event) => setX(Number(event.target.value))}
            className="h-1.5 flex-1 cursor-pointer accent-[var(--accent)]"
            aria-label="Position of the point on the curve"
          />
        </label>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface p-3">
            <dt className="text-xs text-muted">The curve</dt>
            <dd className="mt-0.5 font-semibold">
              <InlineMaths>{curve.latex}</InlineMaths>
            </dd>
          </div>
          <div className="rounded-lg border border-border bg-surface p-3">
            <dt className="text-xs text-muted">Its derivative</dt>
            <dd className="mt-0.5 font-semibold">
              <InlineMaths>{curve.derivativeLatex}</InlineMaths>
            </dd>
          </div>
          <div className="col-span-2 rounded-lg border border-border bg-surface p-3 sm:col-span-1">
            <dt className="text-xs text-muted">Gradient here</dt>
            <dd className="mt-0.5 font-mono text-lg font-bold tabular-nums">{gradient.toFixed(2)}</dd>
          </div>
        </dl>

        <p className="mt-3 text-sm text-muted">
          {stationary
            ? "The tangent is flat — this is a stationary point, where the gradient is zero. Solving dy/dx = 0 is how you find these without looking."
            : gradient > 0
              ? "The tangent slopes upwards, so the gradient is positive and the function is increasing here."
              : "The tangent slopes downwards, so the gradient is negative and the function is decreasing here."}
        </p>
      </div>
    </div>
  );
}
