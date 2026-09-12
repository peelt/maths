/**
 * Coordinate helpers for the topic illustrations.
 *
 * The curves are sampled from the actual functions rather than eyeballed as
 * Bézier approximations. It costs nothing at build time — these are server
 * components — and it means the picture of a parabola really is a parabola. An
 * illustration that is subtly wrong about its own subject is worse than none
 * on a site a student is using to learn.
 */

/** The shared drawing box for every topic illustration. */
export const BOX = { width: 64, height: 44 } as const;

/** Where the axes sit, in viewBox units. */
export const FRAME = { left: 8, right: 58, top: 6, bottom: 38 } as const;

/** Maths x in [-1, 1] to viewBox x. */
export function px(x: number): number {
  return FRAME.left + ((x + 1) / 2) * (FRAME.right - FRAME.left);
}

/** Maths y in [-1, 1] to viewBox y. SVG y grows downwards. */
export function py(y: number): number {
  return FRAME.bottom - ((y + 1) / 2) * (FRAME.bottom - FRAME.top);
}

/**
 * Sample y = f(x) into an SVG path.
 *
 * Values outside the box are clamped rather than dropped, so a curve leaves
 * the frame cleanly instead of ending in mid-air.
 */
export function curve(fn: (x: number) => number, from = -1, to = 1, samples = 48): string {
  const points: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const x = from + ((to - from) * i) / samples;
    const y = fn(x);
    if (!Number.isFinite(y)) continue;
    const clamped = Math.max(-1.05, Math.min(1.05, y));
    points.push(`${points.length === 0 ? "M" : "L"}${px(x).toFixed(2)},${py(clamped).toFixed(2)}`);
  }
  return points.join("");
}

/** The same samples, closed down to the axis — for a shaded area. */
export function area(fn: (x: number) => number, from: number, to: number, samples = 36): string {
  const top = curve(fn, from, to, samples);
  if (!top) return "";
  return `${top}L${px(to).toFixed(2)},${py(0).toFixed(2)}L${px(from).toFixed(2)},${py(0).toFixed(2)}Z`;
}

/** A straight line between two maths points. */
export function line(x1: number, y1: number, x2: number, y2: number): string {
  return `M${px(x1).toFixed(2)},${py(y1).toFixed(2)}L${px(x2).toFixed(2)},${py(y2).toFixed(2)}`;
}
