"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

/**
 * A small SVG plotting primitive.
 *
 * Built rather than pulled in, because the interactives here need precise
 * control over what is drawn and why — a tangent that follows a dragged point,
 * a curve shown against its untransformed self — and because a chart library
 * would add far more weight than these few components justify.
 *
 * Colours come from the theme tokens, so every plot works in light and dark
 * without a second definition.
 */

interface Scale {
  x: (value: number) => number;
  y: (value: number) => number;
  xRange: [number, number];
  yRange: [number, number];
  width: number;
  height: number;
}

const ScaleContext = createContext<Scale | null>(null);

function useScale(): Scale {
  const scale = useContext(ScaleContext);
  if (!scale) throw new Error("Plot children must be rendered inside <Plot>");
  return scale;
}

interface PlotProps {
  children: ReactNode;
  xRange?: [number, number];
  yRange?: [number, number];
  height?: number;
  /** Accessible description of what the plot shows. */
  label: string;
}

const WIDTH = 600;

export function Plot({ children, xRange = [-5, 5], yRange = [-5, 5], height = 340, label }: PlotProps) {
  const scale = useMemo<Scale>(() => {
    const [x0, x1] = xRange;
    const [y0, y1] = yRange;
    return {
      xRange,
      yRange,
      width: WIDTH,
      height,
      x: (value) => ((value - x0) / (x1 - x0)) * WIDTH,
      // SVG y grows downward, so the axis is inverted here once for everything.
      y: (value) => height - ((value - y0) / (y1 - y0)) * height,
    };
  }, [xRange, yRange, height]);

  return (
    <ScaleContext.Provider value={scale}>
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="w-full touch-none select-none rounded-lg border border-border bg-surface"
        role="img"
        aria-label={label}
        preserveAspectRatio="xMidYMid meet"
      >
        <Grid />
        <Axes />
        {children}
      </svg>
    </ScaleContext.Provider>
  );
}

function Grid() {
  const { x, y, xRange, yRange, width, height } = useScale();
  const lines: ReactNode[] = [];

  for (let v = Math.ceil(xRange[0]); v <= xRange[1]; v++) {
    if (v === 0) continue;
    lines.push(
      <line key={`x${v}`} x1={x(v)} y1={0} x2={x(v)} y2={height} stroke="var(--border)" strokeWidth={1} opacity={0.55} />,
    );
  }
  for (let v = Math.ceil(yRange[0]); v <= yRange[1]; v++) {
    if (v === 0) continue;
    lines.push(
      <line key={`y${v}`} x1={0} y1={y(v)} x2={width} y2={y(v)} stroke="var(--border)" strokeWidth={1} opacity={0.55} />,
    );
  }
  return <g>{lines}</g>;
}

function Axes() {
  const { x, y, width, height, xRange, yRange } = useScale();
  const showX = yRange[0] <= 0 && yRange[1] >= 0;
  const showY = xRange[0] <= 0 && xRange[1] >= 0;

  return (
    <g>
      {showX ? <line x1={0} y1={y(0)} x2={width} y2={y(0)} stroke="var(--text-muted)" strokeWidth={1.5} /> : null}
      {showY ? <line x1={x(0)} y1={0} x2={x(0)} y2={height} stroke="var(--text-muted)" strokeWidth={1.5} /> : null}
    </g>
  );
}

interface CurveProps {
  /** The function to draw. Return NaN where it is undefined. */
  fn: (x: number) => number;
  color?: string;
  width?: number;
  dashed?: boolean;
  opacity?: number;
}

/**
 * Draws y = f(x).
 *
 * The path is broken wherever the function is undefined or jumps a long way
 * between samples, so an asymptote renders as a genuine break rather than as a
 * near-vertical line joining the two branches — which would be a lie about the
 * shape of the curve, and exactly the misconception these plots should avoid.
 */
export function Curve({ fn, color = "var(--accent)", width = 2.5, dashed = false, opacity = 1 }: CurveProps) {
  const { x, y, xRange, yRange, width: pixelWidth } = useScale();

  const path = useMemo(() => {
    const samples = pixelWidth;
    const step = (xRange[1] - xRange[0]) / samples;
    const yHeight = yRange[1] - yRange[0];
    let d = "";
    let penDown = false;
    let previous: number | null = null;

    for (let i = 0; i <= samples; i++) {
      const xv = xRange[0] + i * step;
      const yv = fn(xv);

      const defined = Number.isFinite(yv);
      // A jump of more than the whole visible height between adjacent samples
      // means a discontinuity, not a steep section.
      const jumped = previous !== null && Math.abs(yv - previous) > yHeight * 1.5;

      if (!defined || jumped) {
        penDown = false;
        previous = defined ? yv : null;
        continue;
      }

      // Keep drawing a little beyond the visible area so curves meet the edge.
      const clamped = Math.max(yRange[0] - yHeight, Math.min(yRange[1] + yHeight, yv));
      d += `${penDown ? "L" : "M"}${x(xv).toFixed(2)},${y(clamped).toFixed(2)}`;
      penDown = true;
      previous = yv;
    }
    return d;
  }, [fn, x, y, xRange, yRange, pixelWidth]);

  return (
    <path
      d={path}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dashed ? "6 5" : undefined}
      opacity={opacity}
      // Clip visually by letting the SVG bounds do the work.
      clipPath="none"
    />
  );
}

export function PlotPoint({ x: px, y: py, color = "var(--accent)", label }: { x: number; y: number; color?: string; label?: string }) {
  const { x, y } = useScale();
  return (
    <g>
      <circle cx={x(px)} cy={y(py)} r={6} fill={color} stroke="var(--surface)" strokeWidth={2} />
      {label ? (
        <text x={x(px) + 10} y={y(py) - 10} fill="var(--text)" fontSize={13} fontWeight={600}>
          {label}
        </text>
      ) : null}
    </g>
  );
}

/** A straight line through a point with a given gradient — used for tangents. */
export function StraightLine({
  through,
  gradient,
  color = "var(--warn)",
  dashed = false,
}: {
  through: { x: number; y: number };
  gradient: number;
  color?: string;
  dashed?: boolean;
}) {
  const { x, y, xRange } = useScale();
  const at = (xv: number) => through.y + gradient * (xv - through.x);
  return (
    <line
      x1={x(xRange[0])}
      y1={y(at(xRange[0]))}
      x2={x(xRange[1])}
      y2={y(at(xRange[1]))}
      stroke={color}
      strokeWidth={2}
      strokeDasharray={dashed ? "6 5" : undefined}
    />
  );
}
