/**
 * The mark: the A of "A Level", drawn as a maximum.
 *
 * The legs are straight, the apex is a smooth arc, and the dot sits exactly
 * where the gradient is zero. So the letter is a curve with a stationary
 * point, and the crossbar is the axis it turns above — a real piece of the
 * course rather than decoration. A student who has done differentiation sees
 * it; everyone else just sees an A, which is the only kind of cleverness worth
 * putting in a logo.
 *
 * Four things decided the drawing, and each was settled by looking at renders
 * side by side rather than by argument:
 *
 *  - A FLAT ENOUGH APEX. The first version curved both legs into a single
 *    bowed arch: mathematically fine, but it read as a tent rather than a
 *    letter. Straight legs fixed the letterform, and then a pointed apex made
 *    the dot look like a pin head stuck on the tip. Flattening the top is what
 *    makes the dot read as a turning point instead of an ornament.
 *
 *  - NO RING ROUND THE DOT. A background-coloured ring separated the dot from
 *    the curve, but at 24px it severed the apex and the A came apart.
 *
 *  - COMPUTED, NOT EYEBALLED. The apex is the quadratic's midpoint, which for
 *    a symmetric control point is exactly where dy/dx = 0, and the crossbar
 *    ends where the legs actually cross y = 16 — so the bar meets the strokes
 *    rather than floating near them.
 *
 *  - THEME TOKENS ONLY. The strokes take currentColor and the dot is the plot
 *    series colour, which is deliberately non-semantic: amber means "do this
 *    next" and green and red mean right and wrong, so the logo must borrow
 *    none of them.
 */

/** Straight legs into a rounded apex. Turning point: (14, 7.4). */
const LETTER = "M5 24 L11.2 9.8 Q14 5 16.8 9.8 L23 24";

/** The crossbar, ending exactly where the legs cross this height. */
const CROSSBAR = "M8.49 16H19.51";

/** Where the gradient is zero: the quadratic's midpoint. */
const TURNING_POINT = { x: 14, y: 7.4, r: 1.9 };

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 26"
      className={className}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
        <path d={LETTER} />
        <path d={CROSSBAR} />
      </g>
      <circle
        cx={TURNING_POINT.x}
        cy={TURNING_POINT.y}
        r={TURNING_POINT.r}
        fill="var(--plot-a)"
      />
    </svg>
  );
}

/**
 * The header lockup.
 *
 * The mark stands in for the A, so the words beside it are "Level Maths" —
 * but only on screen. The accessible name is the whole title, because "Level
 * Maths" is not the name of anything and a screen reader user should hear what
 * the site is called rather than a puzzle to solve.
 */
export function Logo({ subtitle = true }: { subtitle?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <LogoMark className="h-[1.5em] w-[1.5em] shrink-0" />
      <span className="min-w-0 truncate">
        <span className="sr-only">A Level Maths</span>
        <span aria-hidden="true" className="font-bold tracking-tight">
          Level Maths
        </span>
        {subtitle ? (
          <span className="ml-2 hidden text-xs font-medium text-muted sm:inline">Edexcel 9MA0</span>
        ) : null}
      </span>
    </span>
  );
}
