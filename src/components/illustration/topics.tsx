import type { ReactNode } from "react";
import { BOX, FRAME, area, curve, line, px, py } from "./geometry";

/**
 * One illustration per topic.
 *
 * Each is a visual signature of what the topic actually is — a tangent for
 * differentiation, a shaded area for integration, a pivoted beam for moments —
 * rather than decoration. That distinction matters here: on a site built for a
 * student with ADHD, a picture that carries no information is just another
 * thing competing for attention.
 *
 * Colour discipline follows the palette rules. These use the PLOT tokens, not
 * the action accent: nineteen amber illustrations would be nineteen things
 * claiming to be the next thing to do. Structure is drawn in the border
 * colour, so the figures recede until looked at.
 */

const STROKE = 1.9;

/** Axes, drawn for the illustrations that are graphs. */
function Axes({ y = 0 }: { y?: number }) {
  return (
    <g stroke="var(--border)" strokeWidth={1} fill="none">
      <path d={`M${FRAME.left - 2},${py(y)}L${FRAME.right + 2},${py(y)}`} />
      <path d={`M${px(-1)},${FRAME.top - 1}L${px(-1)},${FRAME.bottom + 2}`} />
    </g>
  );
}

function Primary({ d, dashed = false }: { d: string; dashed?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke="var(--plot-a)"
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dashed ? "3 2.5" : undefined}
    />
  );
}

function Secondary({ d, dashed = false }: { d: string; dashed?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke="var(--plot-b)"
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dashed ? "3 2.5" : undefined}
    />
  );
}

function Dot({ x, y, secondary = false }: { x: number; y: number; secondary?: boolean }) {
  return <circle cx={px(x)} cy={py(y)} r={2.4} fill={secondary ? "var(--plot-b)" : "var(--plot-a)"} />;
}

/** An arrowhead at the end of a vector, pointing along (dx, dy) in maths units. */
function Arrow({ x, y, dx, dy, secondary = false }: { x: number; y: number; dx: number; dy: number; secondary?: boolean }) {
  const tipX = px(x);
  const tipY = py(y);
  // Convert the maths direction into screen direction (y is flipped).
  const angle = Math.atan2(-dy, dx);
  const size = 4.2;
  const spread = 0.42;
  const a = [tipX - size * Math.cos(angle - spread), tipY - size * Math.sin(angle - spread)];
  const b = [tipX - size * Math.cos(angle + spread), tipY - size * Math.sin(angle + spread)];
  return (
    <path
      d={`M${tipX},${tipY}L${a[0].toFixed(2)},${a[1].toFixed(2)}L${b[0].toFixed(2)},${b[1].toFixed(2)}Z`}
      fill={secondary ? "var(--plot-b)" : "var(--plot-a)"}
    />
  );
}

/* ── Pure ────────────────────────────────────────────────────────────────── */

/** A chain of deduction ending in the QED square. */
const proof = (
  <g>
    <Dot x={-0.75} y={0} />
    <Secondary d={line(-0.55, 0, -0.15, 0)} />
    <Arrow x={-0.15} y={0} dx={1} dy={0} secondary />
    <Dot x={0.05} y={0} />
    <Secondary d={line(0.25, 0, 0.6, 0)} />
    <Arrow x={0.6} y={0} dx={1} dy={0} secondary />
    <rect x={px(0.78) - 3.4} y={py(0) - 3.4} width={6.8} height={6.8} fill="var(--plot-a)" />
  </g>
);

/** A quadratic and its two roots. */
const algebra = (
  <g>
    <Axes />
    <Primary d={curve((x) => 3.1 * x * x - 0.85)} />
    <Dot x={-Math.sqrt(0.85 / 3.1)} y={0} secondary />
    <Dot x={Math.sqrt(0.85 / 3.1)} y={0} secondary />
  </g>
);

/** A circle with a tangent touching it. */
const coordinate = (
  <g>
    <Axes />
    <circle cx={px(-0.1)} cy={py(0.1)} r={(px(0.5) - px(-0.1)) * 1} fill="none" stroke="var(--plot-a)" strokeWidth={STROKE} />
    {/* Tangent at the right of the circle: vertical, so perpendicular to the radius. */}
    <Secondary d={line(0.5, -0.75, 0.5, 0.95)} />
    <Dot x={0.5} y={0.1} secondary />
  </g>
);

/** Terms of a convergent geometric series. */
const sequences = (
  <g>
    <Axes y={-1} />
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const height = Math.pow(0.62, i);
      const x = -0.82 + i * 0.33;
      return (
        <rect
          key={i}
          x={px(x) - 3}
          y={py(-1 + height * 1.85)}
          width={6}
          height={py(-1) - py(-1 + height * 1.85)}
          fill="var(--plot-a)"
          opacity={0.85}
        />
      );
    })}
  </g>
);

/** One period of a sine wave. */
const trigonometry = (
  <g>
    <Axes />
    <Primary d={curve((x) => Math.sin(x * Math.PI * 1.05) * 0.82)} />
  </g>
);

/** e^x and ln x, mirror images in the line y = x. */
const exponentials = (
  <g>
    <Axes />
    <path d={line(-1, -1, 1, 1)} stroke="var(--border)" strokeWidth={1} strokeDasharray="2.5 2.5" fill="none" />
    <Primary d={curve((x) => Math.exp(x * 1.7) * 0.34 - 1.05, -1, 0.72)} />
    <Secondary d={curve((x) => Math.log((x + 1.05) / 0.34) / 1.7, -0.72, 1)} />
  </g>
);

/** A curve with the tangent at a point. */
const differentiation = (
  <g>
    <Axes />
    <Primary d={curve((x) => 1.9 * x * x * x - 1.45 * x)} />
    {/* At x = 0.55 the gradient of the cubic is 3(1.9)(0.55)^2 - 1.45. */}
    <Secondary d={(() => {
      const x0 = 0.55;
      const y0 = 1.9 * x0 ** 3 - 1.45 * x0;
      const m = 3 * 1.9 * x0 ** 2 - 1.45;
      return line(x0 - 0.5, y0 - m * 0.5, x0 + 0.4, y0 + m * 0.4);
    })()} />
    <Dot x={0.55} y={1.9 * 0.55 ** 3 - 1.45 * 0.55} secondary />
  </g>
);

/** A curve with the area beneath it shaded. */
const integration = (
  <g>
    <Axes />
    <path d={area((x) => 0.55 + 0.5 * Math.cos(x * 2), -0.62, 0.62)} fill="var(--plot-a)" opacity={0.22} />
    <Primary d={curve((x) => 0.55 + 0.5 * Math.cos(x * 2))} />
    <path d={line(-0.62, 0, -0.62, 0.55 + 0.5 * Math.cos(-1.24))} stroke="var(--plot-a)" strokeWidth={1.2} fill="none" />
    <path d={line(0.62, 0, 0.62, 0.55 + 0.5 * Math.cos(1.24))} stroke="var(--plot-a)" strokeWidth={1.2} fill="none" />
  </g>
);

/** A root, approached by a staircase of iterations. */
const numerical = (
  <g>
    <Axes />
    <Primary d={curve((x) => 2.4 * (x - 0.2) * (x - 0.2) - 0.9)} />
    {(() => {
      const f = (x: number) => 2.4 * (x - 0.2) ** 2 - 0.9;
      const steps = [-0.85, -0.55, -0.4];
      return (
        <g>
          {steps.map((x, i) => (
            <path
              key={i}
              d={`${line(x, 0, x, f(x))}`}
              stroke="var(--plot-b)"
              strokeWidth={1.3}
              strokeDasharray="2 2"
              fill="none"
            />
          ))}
          <Dot x={0.2 - Math.sqrt(0.9 / 2.4)} y={0} secondary />
        </g>
      );
    })()}
  </g>
);

/** Two vectors tip to tail, with the resultant. */
const vectors = (
  <g>
    <Primary d={line(-0.85, -0.7, -0.1, 0.35)} />
    <Arrow x={-0.1} y={0.35} dx={0.75} dy={1.05} />
    <Primary d={line(-0.1, 0.35, 0.8, 0.1)} />
    <Arrow x={0.8} y={0.1} dx={0.9} dy={-0.25} />
    <Secondary d={line(-0.85, -0.7, 0.8, 0.1)} dashed />
    <Arrow x={0.8} y={0.1} dx={1.65} dy={0.8} secondary />
  </g>
);

/* ── Statistics ──────────────────────────────────────────────────────────── */

/** A population, with a sample picked out of it. */
const sampling = (
  <g>
    {Array.from({ length: 28 }, (_, i) => {
      // A fixed lattice with a deterministic jitter, so it looks scattered but
      // renders identically every time.
      const col = i % 7;
      const row = Math.floor(i / 7);
      const jitter = ((i * 37) % 11) / 11 - 0.5;
      const x = -0.82 + col * 0.28 + jitter * 0.1;
      const y = 0.62 - row * 0.42 + jitter * 0.09;
      const inSample = i === 3 || i === 9 || i === 16 || i === 22 || i === 12;
      return (
        <circle
          key={i}
          cx={px(x)}
          cy={py(y)}
          r={inSample ? 2.6 : 1.5}
          fill={inSample ? "var(--plot-b)" : "var(--plot-a)"}
          opacity={inSample ? 1 : 0.35}
        />
      );
    })}
  </g>
);

/** A histogram. */
const dataPresentation = (
  <g>
    <Axes y={-1} />
    {[0.3, 0.62, 0.95, 0.78, 0.45, 0.2].map((h, i) => (
      <rect
        key={i}
        x={px(-0.86 + i * 0.31) - 4}
        y={py(-1 + h * 1.8)}
        width={8}
        height={py(-1) - py(-1 + h * 1.8)}
        fill="var(--plot-a)"
        opacity={0.85}
      />
    ))}
  </g>
);

/** Two overlapping events. */
const probability = (
  <g fill="none" stroke="var(--plot-a)" strokeWidth={STROKE}>
    <circle cx={px(-0.3)} cy={py(0)} r={11} />
    <circle cx={px(0.3)} cy={py(0)} r={11} stroke="var(--plot-b)" />
  </g>
);

/** A normal curve. */
const distributions = (
  <g>
    <Axes y={-1} />
    <Primary d={curve((x) => 2 * Math.exp(-(x * x) / 0.18) - 1)} />
  </g>
);

/** A normal curve with the critical region in the tail. */
const hypothesis = (
  <g>
    <Axes y={-1} />
    <path
      d={area((x) => 2 * Math.exp(-(x * x) / 0.18) - 1 + 1, 0.52, 1)}
      transform={`translate(0,${py(0) - py(-1)})`}
      fill="var(--plot-b)"
      opacity={0.45}
    />
    <Primary d={curve((x) => 2 * Math.exp(-(x * x) / 0.18) - 1)} />
    <path d={line(0.52, -1, 0.52, 2 * Math.exp(-(0.52 * 0.52) / 0.18) - 1)} stroke="var(--plot-b)" strokeWidth={1.4} strokeDasharray="2 2" fill="none" />
  </g>
);

/* ── Mechanics ───────────────────────────────────────────────────────────── */

/** A measured length: the S.I. idea that a quantity needs a unit. */
const quantities = (
  <g>
    <Primary d={line(-0.8, 0, 0.8, 0)} />
    <Arrow x={-0.8} y={0} dx={-1} dy={0} />
    <Arrow x={0.8} y={0} dx={1} dy={0} />
    {[-0.8, -0.4, 0, 0.4, 0.8].map((x) => (
      <path key={x} d={line(x, -0.28, x, 0.28)} stroke="var(--border)" strokeWidth={1.2} fill="none" />
    ))}
  </g>
);

/** A velocity-time graph, with the area that is the displacement. */
const kinematics = (
  <g>
    <Axes y={-1} />
    {(() => {
      // Accelerate, hold a constant velocity, decelerate. The shaded trapezium
      // under the graph is the displacement, which is the point of the figure.
      const pts: Array<[number, number]> = [
        [-0.85, -1],
        [-0.3, 0.55],
        [0.35, 0.55],
        [0.85, -1],
      ];
      const trace = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${px(x).toFixed(2)},${py(y).toFixed(2)}`).join("");
      return (
        <g>
          <path d={`${trace}Z`} fill="var(--plot-a)" opacity={0.2} />
          <Primary d={trace} />
        </g>
      );
    })()}
  </g>
);

/** A block with the forces on it. */
const forces = (
  <g>
    <path d={line(-0.95, -0.55, 0.95, -0.55)} stroke="var(--border)" strokeWidth={1.4} fill="none" />
    <rect x={px(-0.22)} y={py(0.12)} width={px(0.22) - px(-0.22)} height={py(-0.55) - py(0.12)} fill="var(--plot-a)" opacity={0.3} stroke="var(--plot-a)" strokeWidth={1.4} />
    {/* Weight down, normal reaction up, applied force to the right. */}
    <Secondary d={line(0, -0.55, 0, -0.98)} />
    <Arrow x={0} y={-0.98} dx={0} dy={-1} secondary />
    <Primary d={line(0, 0.12, 0, 0.72)} />
    <Arrow x={0} y={0.72} dx={0} dy={1} />
    <Primary d={line(0.22, -0.22, 0.78, -0.22)} />
    <Arrow x={0.78} y={-0.22} dx={1} dy={0} />
  </g>
);

/** A beam on a pivot, loaded either side. */
const moments = (
  <g>
    <Primary d={line(-0.9, 0.1, 0.9, 0.1)} />
    {/* The pivot, deliberately off centre — the loads are not equal. */}
    <path
      d={`M${px(-0.15)},${py(0.05)}L${px(-0.3)},${py(-0.6)}L${px(0)},${py(-0.6)}Z`}
      fill="var(--plot-a)"
    />
    <Secondary d={line(-0.72, 0.1, -0.72, -0.42)} />
    <Arrow x={-0.72} y={-0.42} dx={0} dy={-1} secondary />
    <Secondary d={line(0.62, 0.1, 0.62, -0.28)} />
    <Arrow x={0.62} y={-0.28} dx={0} dy={-1} secondary />
  </g>
);

/** Slug to figure. A topic with no entry simply renders nothing. */
const FIGURES: Record<string, ReactNode> = {
  proof,
  "algebra-and-functions": algebra,
  "coordinate-geometry": coordinate,
  "sequences-and-series": sequences,
  trigonometry,
  "exponentials-and-logarithms": exponentials,
  differentiation,
  integration,
  "numerical-methods": numerical,
  vectors,
  "statistical-sampling": sampling,
  "data-presentation": dataPresentation,
  probability,
  "statistical-distributions": distributions,
  "hypothesis-testing": hypothesis,
  "quantities-and-units": quantities,
  kinematics,
  "forces-and-newtons-laws": forces,
  moments,
};

export function hasIllustration(slug: string): boolean {
  return slug in FIGURES;
}

export const illustratedSlugs = Object.keys(FIGURES);

/**
 * A topic's illustration.
 *
 * Marked aria-hidden: every one of these sits beside the topic name in text,
 * so to a screen reader it is duplication, and describing "a curve with a
 * tangent" adds nothing a blind student can use.
 */
export function TopicIllustration({ slug, className = "" }: { slug: string; className?: string }) {
  const figure = FIGURES[slug];
  if (!figure) return null;
  return (
    <svg
      viewBox={`0 0 ${BOX.width} ${BOX.height}`}
      className={className}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      {figure}
    </svg>
  );
}
