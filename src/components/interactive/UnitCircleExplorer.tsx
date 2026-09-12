"use client";

import { useState } from "react";
import { Curve, Plot, PlotCircle, PlotPoint, PlotSegment } from "../Plot";
import { InlineMaths } from "../Maths";

/**
 * The unit circle against the sine and cosine graphs — spec points 5.1 and 5.3.
 *
 * This is the definition students are given and almost never see: sine is the
 * HEIGHT of a point going round a circle, cosine is how far ACROSS it is. Once
 * that is visible, several things stop needing to be memorised — why the wave
 * repeats every $2\pi$, why sine is negative below the axis, why sine and
 * cosine are the same curve shifted, and why $\sin^{2}+\cos^{2}=1$ is just
 * Pythagoras on the radius.
 *
 * The angle is driven by one slider so the circle and the wave move together;
 * seeing them out of step is the whole point.
 */

const TAU = Math.PI * 2;

/** Angles worth landing on exactly, so the exact values line up. */
const LANDMARKS = [
  { label: "0", value: 0 },
  { label: "π/6", value: Math.PI / 6 },
  { label: "π/4", value: Math.PI / 4 },
  { label: "π/3", value: Math.PI / 3 },
  { label: "π/2", value: Math.PI / 2 },
  { label: "2π/3", value: (2 * Math.PI) / 3 },
  { label: "π", value: Math.PI },
  { label: "3π/2", value: (3 * Math.PI) / 2 },
];

function quadrant(theta: number): string {
  const t = ((theta % TAU) + TAU) % TAU;
  if (t < Math.PI / 2) return "first — sine and cosine both positive";
  if (t < Math.PI) return "second — sine positive, cosine negative";
  if (t < (3 * Math.PI) / 2) return "third — both negative";
  return "fourth — cosine positive, sine negative";
}

export function UnitCircleExplorer() {
  const [theta, setTheta] = useState(Math.PI / 6);
  const [show, setShow] = useState<"sin" | "cos">("sin");

  const sin = Math.sin(theta);
  const cos = Math.cos(theta);
  const height = show === "sin" ? sin : cos;

  return (
    <div className="rounded-xl border border-border bg-surface-2 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap gap-2">
        {(["sin", "cos"] as const).map((which) => (
          <button
            key={which}
            onClick={() => setShow(which)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              show === which ? "border-accent bg-accent-soft font-semibold text-accent" : "border-border bg-surface hover:bg-surface-2"
            }`}
          >
            <InlineMaths>{which === "sin" ? "y=\\sin\\theta" : "y=\\cos\\theta"}</InlineMaths>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">The circle</p>
          <Plot
            xRange={[-2.1, 2.1]}
            yRange={[-1.4, 1.4]}
            height={400}
            label="A point moving round the unit circle, showing its height and horizontal distance"
          >
            <PlotCircle r={1} />
            {/* The radius to the moving point — the hypotenuse of the triangle. */}
            <PlotSegment from={{ x: 0, y: 0 }} to={{ x: cos, y: sin }} color="var(--text-muted)" />
            {/* Vertical leg: the sine. Horizontal leg: the cosine. */}
            <PlotSegment
              from={{ x: cos, y: 0 }}
              to={{ x: cos, y: sin }}
              color={show === "sin" ? "var(--accent)" : "var(--border)"}
              width={show === "sin" ? 3.5 : 2}
            />
            <PlotSegment
              from={{ x: 0, y: 0 }}
              to={{ x: cos, y: 0 }}
              color={show === "cos" ? "var(--accent)" : "var(--border)"}
              width={show === "cos" ? 3.5 : 2}
            />
            <PlotPoint x={cos} y={sin} />
          </Plot>
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">The graph</p>
          <Plot
            xRange={[0, TAU]}
            yRange={[-1.4, 1.4]}
            height={400}
            label={`The ${show === "sin" ? "sine" : "cosine"} curve, with the current angle marked`}
          >
            <Curve fn={show === "sin" ? Math.sin : Math.cos} />
            {/* The same length, now plotted against the angle. */}
            <PlotSegment
              from={{ x: theta, y: 0 }}
              to={{ x: theta, y: height }}
              color="var(--accent)"
              width={3.5}
            />
            <PlotPoint x={theta} y={height} />
          </Plot>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="angle" className="mb-1 block font-mono text-sm">
          θ = {theta.toFixed(2)} rad ({Math.round((theta * 180) / Math.PI)}°)
        </label>
        <input
          id="angle"
          type="range"
          min={0}
          max={TAU}
          step={0.01}
          value={theta}
          onChange={(event) => setTheta(Number(event.target.value))}
          className="w-full accent-[var(--accent)]"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {LANDMARKS.map((mark) => (
          <button
            key={mark.label}
            onClick={() => setTheta(mark.value)}
            className="rounded border border-border bg-surface px-2 py-1 font-mono text-xs hover:bg-surface-2"
          >
            {mark.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs text-muted">Height of the point</p>
          <p className="font-mono text-lg font-bold tabular-nums">sin θ = {sin.toFixed(3)}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs text-muted">Distance across</p>
          <p className="font-mono text-lg font-bold tabular-nums">cos θ = {cos.toFixed(3)}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs text-muted">Pythagoras on the radius</p>
          <p className="font-mono text-lg font-bold tabular-nums">
            sin²+cos² = {(sin * sin + cos * cos).toFixed(3)}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm text-muted">
        Quadrant: {quadrant(theta)}. The marked length on the circle and the marked length on the
        graph are the same number — the graph is just that length plotted against the angle.
      </p>
    </div>
  );
}
