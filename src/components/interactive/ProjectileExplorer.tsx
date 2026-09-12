"use client";

import { useState } from "react";
import { Plot, PlotPath, PlotPoint, PlotSegment } from "../Plot";
import { InlineMaths } from "../Maths";

/**
 * Projectile motion — mechanics spec point 7.5.
 *
 * The examinable idea is that the horizontal and vertical motions are
 * completely independent: constant velocity across, constant acceleration
 * down, sharing only the clock. Showing both component velocities as arrows on
 * the moving particle makes that visible — the horizontal arrow never changes
 * length, whatever the vertical one is doing.
 *
 * It also settles the standard misconception that speed is zero at the top. It
 * is not: only the vertical component vanishes there.
 */

const G = 9.8;

export function ProjectileExplorer() {
  const [speed, setSpeed] = useState(20);
  const [angle, setAngle] = useState(45);
  const [t, setT] = useState(0.8);

  const radians = (angle * Math.PI) / 180;
  const ux = speed * Math.cos(radians);
  const uy = speed * Math.sin(radians);

  const flightTime = (2 * uy) / G;
  const range = ux * flightTime;
  const maxHeight = (uy * uy) / (2 * G);

  const clampedT = Math.min(t, flightTime);
  const x = ux * clampedT;
  const y = uy * clampedT - 0.5 * G * clampedT * clampedT;
  const vy = uy - G * clampedT;

  const path = Array.from({ length: 121 }, (_, i) => {
    const time = (flightTime * i) / 120;
    return { x: ux * time, y: uy * time - 0.5 * G * time * time };
  });

  // The plot's axes are scaled very differently — a 40 m range against a 10 m
  // height — so an arrow drawn with the same DATA length in each direction
  // would render at quite different pixel lengths. That would make the two
  // components look incomparable, which is the one thing this must get right.
  // So convert a fixed pixel-per-(m/s) into data units separately per axis.
  const xMin = -range * 0.06;
  const xMax = range * 1.08;
  const yMin = -maxHeight * 0.18;
  const yMax = maxHeight * 1.35;
  const PLOT_WIDTH = 600;
  const PLOT_HEIGHT = 300;
  const PIXELS_PER_UNIT_SPEED = 2.6;
  const arrowX = PIXELS_PER_UNIT_SPEED / (PLOT_WIDTH / (xMax - xMin));
  const arrowY = PIXELS_PER_UNIT_SPEED / (PLOT_HEIGHT / (yMax - yMin));

  return (
    <div className="rounded-xl border border-border bg-surface-2 p-4 sm:p-5">
      <Plot
        xRange={[xMin, xMax]}
        yRange={[yMin, yMax]}
        height={PLOT_HEIGHT}
        label="The path of a projectile, with its horizontal and vertical velocity components shown"
      >
        <PlotPath points={path} color="var(--text-muted)" width={2} dashed />
        {/* Horizontal component — constant length for the whole flight. */}
        <PlotSegment from={{ x, y }} to={{ x: x + ux * arrowX, y }} color="var(--plot-a)" width={3.5} />
        {/* Vertical component — shrinks, vanishes at the top, then grows downward. */}
        <PlotSegment from={{ x, y }} to={{ x, y: y + vy * arrowY }} color="var(--plot-b)" width={3.5} />
        <PlotPoint x={x} y={y} />
      </Plot>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="speed" className="mb-1 block font-mono text-sm">
            u = {speed} m s⁻¹
          </label>
          <input
            id="speed"
            type="range"
            min={5}
            max={40}
            step={1}
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
            className="w-full accent-[var(--accent-fill)]"
          />
        </div>
        <div>
          <label htmlFor="angle" className="mb-1 block font-mono text-sm">
            angle = {angle}°
          </label>
          <input
            id="angle"
            type="range"
            min={5}
            max={85}
            step={1}
            value={angle}
            onChange={(event) => setAngle(Number(event.target.value))}
            className="w-full accent-[var(--accent-fill)]"
          />
        </div>
        <div>
          <label htmlFor="time" className="mb-1 block font-mono text-sm">
            t = {clampedT.toFixed(2)} s
          </label>
          <input
            id="time"
            type="range"
            min={0}
            max={Math.max(flightTime, 0.1)}
            step={0.01}
            value={clampedT}
            onChange={(event) => setT(Number(event.target.value))}
            className="w-full accent-[var(--accent-fill)]"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs text-muted">Horizontal velocity</p>
          <p className="font-mono text-base font-bold tabular-nums">{ux.toFixed(2)}</p>
          <p className="text-xs text-muted">never changes</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs text-muted">Vertical velocity</p>
          <p className="font-mono text-base font-bold tabular-nums">{vy.toFixed(2)}</p>
          <p className="text-xs text-muted">{Math.abs(vy) < 0.4 ? "≈ 0 — at the top" : vy > 0 ? "rising" : "falling"}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs text-muted">Max height</p>
          <p className="font-mono text-base font-bold tabular-nums">{maxHeight.toFixed(2)} m</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs text-muted">Range</p>
          <p className="font-mono text-base font-bold tabular-nums">{range.toFixed(2)} m</p>
        </div>
      </div>

      <p className="mt-3 text-sm text-muted">
        The blue arrow is the horizontal velocity and never changes length — there is no horizontal
        force in this model. The orange arrow is the vertical velocity: it shrinks to nothing at the
        top and then grows downward. At the highest point the particle is still moving at{" "}
        <InlineMaths>{`${ux.toFixed(1)}\\ \\mathrm{m\\,s^{-1}}`}</InlineMaths> horizontally, which is
        why its speed there is not zero. Air resistance is ignored throughout.
      </p>
    </div>
  );
}
