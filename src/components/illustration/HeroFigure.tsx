/**
 * The homepage figure.
 *
 * It tells the story of the course in one picture: a function, the gradient at
 * a point, and the area underneath — which is most of two Pure papers. That is
 * the test an illustration has to pass here. "Striking" and "noisy" are easy
 * to confuse, and the palette work this sits on top of was largely about
 * removing things that competed for attention, so this earns its size by
 * meaning something rather than by being loud.
 *
 * Three deliberate restraints:
 *
 *  - It uses the PLOT tokens, never the action accent. The primary button is
 *    the only amber thing on the page and it must stay that way.
 *  - It is positioned absolutely by its caller, so it contributes NO vertical
 *    height. A hero that pushes the one primary action below the fold would
 *    break the thing the design is built around.
 *  - It is aria-hidden. The heading beside it already says what the site is.
 */

const W = 820;
const H = 260;

/** Maths x in [-1, 1] to viewBox x. */
const mx = (x: number) => ((x + 1) / 2) * W;
/** Maths y in [-1, 1] to viewBox y. */
const my = (y: number) => H - 24 - ((y + 1) / 2) * (H - 56);

function sample(fn: (x: number) => number, from = -1, to = 1, steps = 120): string {
  const out: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = from + ((to - from) * i) / steps;
    const y = fn(x);
    if (!Number.isFinite(y)) continue;
    out.push(`${out.length ? "L" : "M"}${mx(x).toFixed(1)},${my(Math.max(-1.1, Math.min(1.1, y))).toFixed(1)}`);
  }
  return out.join("");
}

/** The curve the whole figure is built around. */
const f = (x: number) => 0.55 * Math.sin(x * 2.5) + 0.28 * x + 0.1;
/** Its exact derivative, so the tangent is the real gradient and not a guess. */
const df = (x: number) => 0.55 * 2.5 * Math.cos(x * 2.5) + 0.28;

const TANGENT_AT = -0.12;

export function HeroFigure({
  className = "",
  faded = true,
}: {
  className?: string;
  /**
   * Fade the left edge into the surface, for when the figure sits BEHIND the
   * heading. Off when it stands alone as a band, where there is nothing to
   * clear and a fade would just hide half the picture.
   */
  faded?: boolean;
}) {
  const areaFrom = 0.16;
  const areaTo = 0.82;

  const y0 = f(TANGENT_AT);
  const m = df(TANGENT_AT);
  const reach = 0.42;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      preserveAspectRatio="xMaxYMid slice"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Fades the figure out towards the text, so nothing competes with it. */}
        {/*
          * Opaque well past the text column before it begins to clear. The
          * first version faded out by 42% and gridlines showed through the
          * lead paragraph — unreadable text is a worse outcome than a smaller
          * picture, particularly here.
          */}
        <linearGradient id="hero-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--surface)" stopOpacity="1" />
          <stop offset="34%" stopColor="var(--surface)" stopOpacity="1" />
          <stop offset="72%" stopColor="var(--surface)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hero-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--plot-a)" stopOpacity="0.34" />
          <stop offset="100%" stopColor="var(--plot-a)" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {/* Structure, kept faint so the curves read first. */}
      <g stroke="var(--border)" strokeWidth={1} opacity={0.55}>
        {[-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75].map((x) => (
          <line key={x} x1={mx(x)} y1={my(1.05)} x2={mx(x)} y2={my(-1.05)} />
        ))}
        {[-0.6, 0, 0.6].map((y) => (
          <line key={y} x1={mx(-1)} y1={my(y)} x2={mx(1)} y2={my(y)} />
        ))}
      </g>
      <line x1={mx(-1)} y1={my(0)} x2={mx(1)} y2={my(0)} stroke="var(--text-muted)" strokeWidth={1.4} opacity={0.7} />

      {/* The integral: strips resolving into a smooth area. */}
      {Array.from({ length: 9 }, (_, i) => {
        const step = (areaTo - areaFrom) / 9;
        const x = areaFrom + i * step;
        const top = f(x);
        return (
          <rect
            key={i}
            x={mx(x)}
            y={my(top)}
            width={mx(areaFrom + step) - mx(areaFrom) - 1.5}
            height={Math.max(0, my(0) - my(top))}
            fill="var(--plot-a)"
            opacity={0.13}
          />
        );
      })}
      <path d={`${sample(f, areaFrom, areaTo)}L${mx(areaTo)},${my(0)}L${mx(areaFrom)},${my(0)}Z`} fill="url(#hero-area)" />

      {/* A faint family of related curves, for depth. */}
      {[0.45, 0.7].map((scale, i) => (
        <path
          key={scale}
          d={sample((x) => f(x) * scale)}
          fill="none"
          stroke="var(--plot-a)"
          strokeWidth={1.6}
          opacity={0.18 + i * 0.06}
        />
      ))}

      {/* The unit circle, where sine and cosine come from. */}
      <circle
        cx={mx(-0.62)}
        cy={my(0.28)}
        r={(mx(-0.32) - mx(-0.62)) * 1.25}
        fill="none"
        stroke="var(--plot-b)"
        strokeWidth={1.6}
        opacity={0.42}
      />

      {/* The gradient at a point: a real tangent, from the real derivative. */}
      <path
        d={`M${mx(TANGENT_AT - reach)},${my(y0 - m * reach)}L${mx(TANGENT_AT + reach)},${my(y0 + m * reach)}`}
        stroke="var(--plot-b)"
        strokeWidth={2.4}
        strokeLinecap="round"
        opacity={0.9}
      />

      {/* The curve itself, on top of everything. */}
      <path
        d={sample(f)}
        fill="none"
        stroke="var(--plot-a)"
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={mx(TANGENT_AT)} cy={my(y0)} r={6} fill="var(--plot-b)" stroke="var(--surface)" strokeWidth={2.4} />

      {/* The fade sits last so it lifts the left edge clear for the heading. */}
      {faded ? <rect x={0} y={0} width={W} height={H} fill="url(#hero-fade)" /> : null}
    </svg>
  );
}
