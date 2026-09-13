/**
 * The supplied logo: a parabola on a pair of axes, then "A Level Maths" with
 * "Maths" in the brand teal.
 *
 * Redrawn as SVG rather than dropped in as the original raster, for three
 * reasons that all show up in this particular app:
 *
 *  - The artwork is on white. The dark theme would show it as a white slab,
 *    and its navy is 1.19:1 against that background — effectively invisible.
 *    As SVG the ink is a token and swaps with the theme.
 *  - It is also the browser tab icon, at 16px. A raster scaled to that is mush.
 *  - The site offers three text sizes, and a wordmark set in live text grows
 *    with them. A picture of words does not.
 *
 * The curve is a real parabola, not an approximation: a quadratic Bezier IS a
 * parabola, and for level endpoints the vertex lands at t = 0.5, so the
 * control point below is solved for rather than nudged into place. The turning
 * point sits just above the x-axis, as in the original.
 */

/** Both arms level at this height. SVG y grows downward, so the curve opens up. */
const ARM_Y = 16;

/**
 * The parabola. Control point y = 2 * vertexY - armY, which puts the vertex
 * exactly on (50, 66) — nine units clear of the axis.
 */
const PARABOLA = "M20 16 Q50 116 80 16";

/** The axes. Lines stop where the arrowheads start, so the joint has no bulge. */
const Y_AXIS = "M50 86V20";
const Y_HEAD = "M50 6 L56.5 21 L43.5 21 Z";
const X_AXIS = "M8 75H82";
const X_HEAD = "M96 75 L81 81.5 L81 68.5 Z";

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="4 4 93 86"
      className={className}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={PARABOLA}
        fill="none"
        stroke="var(--brand-accent)"
        strokeWidth={5.5}
        strokeLinecap="round"
      />
      <g fill="var(--brand-ink)" stroke="var(--brand-ink)" strokeWidth={5.5} strokeLinecap="round">
        <path d={Y_AXIS} />
        <path d={X_AXIS} />
      </g>
      <g fill="var(--brand-ink)">
        <path d={Y_HEAD} />
        <path d={X_HEAD} />
      </g>
    </svg>
  );
}

/** Exported for the tests, which check the drawing is a true parabola. */
export const MARK_GEOMETRY = { ARM_Y, PARABOLA, Y_AXIS, X_AXIS };

/**
 * The header lockup.
 *
 * The wordmark is live text in the site's own face rather than outlined
 * letterforms, so it inherits the reader's text-size choice and stays crisp at
 * any zoom. The two-colour split is the logo's, and it is decorative: the
 * link's accessible name is the whole title, read once.
 */
export function Logo({ subtitle = true }: { subtitle?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <LogoMark className="h-[1.7em] w-[1.7em] shrink-0" />
      <span className="min-w-0 truncate">
        <span className="sr-only">A Level Maths</span>
        <span aria-hidden="true" className="font-bold tracking-tight text-[var(--brand-ink)]">
          A Level <span className="text-[var(--brand-accent)]">Maths</span>
        </span>
        {subtitle ? (
          <span className="ml-2 hidden text-xs font-medium text-muted sm:inline">Edexcel 9MA0</span>
        ) : null}
      </span>
    </span>
  );
}
