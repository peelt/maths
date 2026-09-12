"use client";

import { useState } from "react";
import { Curve, Plot } from "../Plot";
import { InlineMaths } from "../Maths";

/**
 * R form: two waves adding to one — spec point 5.6.
 *
 * The claim that $a\sin\theta+b\cos\theta$ IS a single sine wave, merely
 * shifted and stretched, is one students take on trust because the algebra
 * arrives before the picture. Drawing all three curves together makes it
 * obvious: the sum lands exactly on top of $R\sin(\theta+\alpha)$, which is
 * why reading its maximum off as $R$ is legitimate rather than a trick.
 */

const TAU = Math.PI * 2;

export function RFormExplorer() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);

  const R = Math.sqrt(a * a + b * b);
  const alpha = Math.atan2(b, a);
  const alphaDegrees = (alpha * 180) / Math.PI;

  const sum = (t: number) => a * Math.sin(t) + b * Math.cos(t);
  const combined = (t: number) => R * Math.sin(t + alpha);

  return (
    <div className="rounded-xl border border-border bg-surface-2 p-4 sm:p-5">
      <p className="mb-3 text-sm">
        <InlineMaths>{`${a}\\sin\\theta + ${b}\\cos\\theta`}</InlineMaths> drawn against{" "}
        <InlineMaths>{`${R.toFixed(2)}\\sin(\\theta + ${alphaDegrees.toFixed(1)}^{\\circ})`}</InlineMaths>
      </p>

      <Plot
        xRange={[0, TAU]}
        yRange={[-12, 12]}
        height={320}
        label="Two sine waves added together, shown against a single equivalent wave"
      >
        {/* The two components, faint. */}
        <Curve fn={(t) => a * Math.sin(t)} color="var(--text-muted)" width={1.5} opacity={0.5} />
        <Curve fn={(t) => b * Math.cos(t)} color="var(--text-muted)" width={1.5} opacity={0.5} />
        {/* The sum, and the single wave it is identical to — drawn dashed on
            top, so any disagreement would be immediately visible. */}
        <Curve fn={sum} color="var(--plot-a)" width={3} />
        <Curve fn={combined} color="var(--plot-b)" width={2} dashed />
      </Plot>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="a-value" className="mb-1 block font-mono text-sm">
            a = {a}
          </label>
          <input
            id="a-value"
            type="range"
            min={-8}
            max={8}
            step={1}
            value={a}
            onChange={(event) => setA(Number(event.target.value))}
            className="w-full accent-[var(--accent-fill)]"
          />
        </div>
        <div>
          <label htmlFor="b-value" className="mb-1 block font-mono text-sm">
            b = {b}
          </label>
          <input
            id="b-value"
            type="range"
            min={-8}
            max={8}
            step={1}
            value={b}
            onChange={(event) => setB(Number(event.target.value))}
            className="w-full accent-[var(--accent-fill)]"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs text-muted">R = √(a² + b²)</p>
          <p className="font-mono text-lg font-bold tabular-nums">{R.toFixed(3)}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs text-muted">Maximum of the sum</p>
          <p className="font-mono text-lg font-bold tabular-nums">{R.toFixed(3)}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs text-muted">a + b, for comparison</p>
          <p className="font-mono text-lg font-bold tabular-nums">{a + b}</p>
        </div>
      </div>

      <p className="mt-3 text-sm text-muted">
        The dashed wave sits exactly on the solid one, which is what the identity claims. The
        maximum is <strong>R</strong>, not <strong>a + b</strong> — the two component waves peak at
        different angles, so they never both reach their maximum at once.
      </p>
    </div>
  );
}
