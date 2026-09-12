"use client";

import { useState } from "react";
import { Curve, Plot, PlotRect } from "../Plot";
import { InlineMaths } from "../Maths";

/**
 * Integration as the limit of a sum — spec points 8.3 and 8.4.
 *
 * Spec point 8.4 asks students to understand the integral as a limit of a sum
 * of rectangles, and it is the most abstract thing in the Pure content: there
 * is nothing to calculate, only something to see. Dragging the number of
 * strips upwards and watching the total close on the exact value is the entire
 * idea, and it takes about four seconds.
 *
 * The error is shown alongside, because "gets closer" is a claim worth
 * watching a number confirm.
 */

const CURVES = [
  {
    label: "y = x²",
    latex: "y=x^{2}",
    f: (x: number) => x * x,
    a: 0,
    b: 3,
    exact: 9,
    exactLatex: "\\int_{0}^{3}x^{2}\\,dx=\\left[\\frac{x^{3}}{3}\\right]_{0}^{3}=9",
  },
  {
    label: "y = x³ − 2x + 4",
    latex: "y=x^{3}-2x+4",
    f: (x: number) => x ** 3 - 2 * x + 4,
    a: 0,
    b: 2,
    exact: 8,
    exactLatex: "\\int_{0}^{2}\\left(x^{3}-2x+4\\right)dx=8",
  },
  {
    label: "y = sin x",
    latex: "y=\\sin x",
    f: (x: number) => Math.sin(x),
    a: 0,
    b: Math.PI,
    exact: 2,
    exactLatex: "\\int_{0}^{\\pi}\\sin x\\,dx=\\left[-\\cos x\\right]_{0}^{\\pi}=2",
  },
];

/** Left-hand rectangles, which is how the sum is usually first written down. */
function riemann(f: (x: number) => number, a: number, b: number, n: number): number {
  const h = (b - a) / n;
  let total = 0;
  for (let i = 0; i < n; i++) total += f(a + i * h) * h;
  return total;
}

export function AreaExplorer() {
  const [curveIndex, setCurveIndex] = useState(0);
  const [n, setN] = useState(4);

  const curve = CURVES[curveIndex];
  const h = (curve.b - curve.a) / n;
  const estimate = riemann(curve.f, curve.a, curve.b, n);
  const error = estimate - curve.exact;

  const rects = Array.from({ length: n }, (_, i) => {
    const x0 = curve.a + i * h;
    return { x0, x1: x0 + h, y: curve.f(x0) };
  });

  // Scale the axis to the curve itself rather than to the rectangles, so the
  // view does not jump around as the number of strips changes.
  const yMax = (() => {
    let peak = 1;
    for (let i = 0; i <= 100; i++) {
      const value = curve.f(curve.a + ((curve.b - curve.a) * i) / 100);
      if (Number.isFinite(value)) peak = Math.max(peak, value);
    }
    return peak * 1.25;
  })();

  return (
    <div className="rounded-xl border border-border bg-surface-2 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap gap-2">
        {CURVES.map((c, i) => (
          <button
            key={c.label}
            onClick={() => {
              setCurveIndex(i);
            }}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              curveIndex === i
                ? "border-accent bg-accent-soft font-semibold text-accent"
                : "border-border bg-surface hover:bg-surface-2"
            }`}
          >
            <InlineMaths>{c.latex}</InlineMaths>
          </button>
        ))}
      </div>

      <Plot
        xRange={[curve.a - 0.4, curve.b + 0.4]}
        yRange={[-0.4, yMax]}
        height={320}
        label={`The area under ${curve.label} approximated by ${n} rectangles`}
      >
        {rects.map((r, i) => (
          <PlotRect key={i} x0={r.x0} x1={r.x1} y0={0} y1={r.y} />
        ))}
        <Curve fn={curve.f} />
      </Plot>

      <div className="mt-4">
        <label htmlFor="strips" className="mb-1 block font-mono text-sm">
          n = {n} strip{n === 1 ? "" : "s"} · width δx = {h.toFixed(3)}
        </label>
        <input
          id="strips"
          type="range"
          min={1}
          max={80}
          step={1}
          value={n}
          onChange={(event) => setN(Number(event.target.value))}
          className="w-full accent-[var(--accent-fill)]"
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs text-muted">Sum of the rectangles</p>
          <p className="font-mono text-lg font-bold tabular-nums">{estimate.toFixed(4)}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs text-muted">The exact integral</p>
          <p className="font-mono text-lg font-bold tabular-nums">{curve.exact}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs text-muted">Error</p>
          <p className="font-mono text-lg font-bold tabular-nums">{error.toFixed(4)}</p>
        </div>
      </div>

      <p className="mt-3 text-sm text-muted">
        Each rectangle has area <InlineMaths>{"f(x)\\,\\delta x"}</InlineMaths>, so the total is{" "}
        <InlineMaths>{"\\sum f(x)\\,\\delta x"}</InlineMaths>. As the strips get thinner the error
        shrinks towards zero, and that limit is written{" "}
        <InlineMaths>{`\\int_{${curve.a === 0 ? "0" : curve.a}}^{${curve.b === Math.PI ? "\\pi" : curve.b}}f(x)\\,dx`}</InlineMaths>.
        Here <InlineMaths>{curve.exactLatex}</InlineMaths>.
      </p>
    </div>
  );
}
