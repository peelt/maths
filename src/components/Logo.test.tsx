import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Logo, LogoMark } from "./Logo";

/** Evaluate a quadratic Bezier component at t. */
const at = (t: number, p0: number, p1: number, p2: number) =>
  (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2;

describe("LogoMark", () => {
  const html = renderToStaticMarkup(<LogoMark />);

  const curve = /d="M([\d.]+) ([\d.]+) Q([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"/.exec(html);
  const xAxis = /d="M([\d.]+) ([\d.]+)H([\d.]+)"/.exec(html);
  const yAxis = /d="M([\d.]+) ([\d.]+)V([\d.]+)"/.exec(html);

  it("draws a curve and both axes", () => {
    expect(curve, "parabola").not.toBeNull();
    expect(xAxis, "x-axis").not.toBeNull();
    expect(yAxis, "y-axis").not.toBeNull();
  });

  it("is a real parabola, not something that merely looks like one", () => {
    // A quadratic Bezier IS a parabola, so this is free — but only if the
    // endpoints are level. Tilt them and the curve is still a parabola, just
    // not one whose axis of symmetry is vertical, and the mark starts to lean.
    const [, , y0, , , , y2] = curve!.map(Number);
    expect(y0).toBeCloseTo(y2, 6);
  });

  it("puts the turning point where the curve is actually lowest", () => {
    const [, x0, y0, cx, cy, x2, y2] = curve!.map(Number);
    // For level endpoints the vertex is at t = 0.5. Confirm by sampling rather
    // than by asserting the arithmetic that produced it.
    let lowest = { t: 0, y: -Infinity };
    for (let t = 0; t <= 1; t += 0.001) {
      const y = at(t, y0, cy, y2);
      if (y > lowest.y) lowest = { t, y };
    }
    expect(lowest.t).toBeCloseTo(0.5, 2);
    expect(at(0.5, x0, cx, x2)).toBeCloseTo(50, 6);
  });

  it("keeps the vertex clear of the x-axis", () => {
    // In the supplied artwork the curve turns above the axis rather than
    // sitting on it. Touching would read as a different drawing.
    const [, , y0, , cy, , y2] = curve!.map(Number);
    const vertexY = at(0.5, y0, cy, y2);
    const [, , axisY] = xAxis!.map(Number);
    expect(vertexY).toBeLessThan(axisY); // SVG y grows downward
    expect(axisY - vertexY).toBeGreaterThanOrEqual(5);
  });

  it("is symmetric about the y-axis", () => {
    // A graph whose curve is off-centre from its own axis is just a mistake.
    const [, x0, , cx, , x2] = curve!.map(Number);
    const [, axisX] = yAxis!.map(Number);
    expect(cx).toBeCloseTo(axisX, 6);
    expect((x0 + x2) / 2).toBeCloseTo(axisX, 6);
  });

  it("crosses the axes rather than stopping at them", () => {
    // The vertical runs below the horizontal and the horizontal starts left of
    // the vertical, which is what makes it read as a pair of axes.
    const [, axisXFrom, axisY, axisXTo] = xAxis!.map(Number);
    // "M50 86V20" starts at the BOTTOM and draws upward, so the first
    // coordinate is the low end. Naming these the wrong way round is how this
    // assertion failed the first time it ran.
    const [, vertX, vertBottom, vertTop] = yAxis!.map(Number);
    expect(axisXFrom).toBeLessThan(vertX);
    expect(axisXTo).toBeGreaterThan(vertX);
    expect(vertBottom).toBeGreaterThan(axisY);
    expect(vertTop).toBeLessThan(axisY);
  });

  it("takes its colours from the theme, not from the file", () => {
    // The artwork is on white. Hard-coding its navy would make the mark
    // invisible in the dark theme, where it is 1.19:1 against the background.
    expect(html).toContain("var(--brand-ink)");
    expect(html).toContain("var(--brand-accent)");
    expect(html).not.toMatch(/#[0-9a-f]{3,8}/i);
  });

  it("is decorative, so it is not announced", () => {
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('role="presentation"');
  });

  it("scales rather than fixing a pixel size", () => {
    expect(html).toMatch(/viewBox="[\d. ]+"/);
    expect(html).not.toMatch(/<svg[^>]*\swidth=/);
  });
});

describe("Logo", () => {
  const html = renderToStaticMarkup(<Logo />);

  it("says the site's name once", () => {
    expect(html).toContain("A Level Maths");
    // The visible wordmark is split across two colours, so it is two elements.
    // Both must be hidden, or a screen reader reads the name twice.
    expect(html).toMatch(/aria-hidden="true"/);
    expect(html).toContain("sr-only");
  });

  it("colours Maths differently from A Level, as the artwork does", () => {
    expect(html).toMatch(/brand-accent[^<]*>Maths|Maths/);
    expect(html).toContain("var(--brand-ink)");
    expect(html).toContain("var(--brand-accent)");
  });

  it("can drop the exam code where there is no room", () => {
    expect(renderToStaticMarkup(<Logo subtitle={false} />)).not.toContain("9MA0");
    expect(html).toContain("9MA0");
  });
});

describe("the browser tab icon", () => {
  // A favicon is a separate document and cannot reach the app's CSS custom
  // properties, so the mark has to be drawn twice. Duplication a build cannot
  // check is duplication that drifts.
  const icon = readFileSync(new URL("../app/icon.svg", import.meta.url), "utf8");
  const mark = renderToStaticMarkup(<LogoMark />);

  it("draws exactly the same paths as the header mark", () => {
    const paths = [...mark.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);
    expect(paths.length).toBeGreaterThanOrEqual(5);
    for (const d of paths) {
      expect(icon, `path missing from icon.svg: ${d}`).toContain(d);
    }
  });

  it("is allowed to be heavier, because 16px needs it", () => {
    // The one permitted difference: at the header's 5.5 weight the axes thin
    // to hairlines in a tab. The shape is identical; only the ink is thicker.
    const headerWeight = Number(/stroke-width="?\{?([\d.]+)/.exec(mark)![1]);
    const iconWeight = Number(/stroke-width="([\d.]+)"/.exec(icon)![1]);
    expect(iconWeight).toBeGreaterThan(headerWeight);
  });

  it("carries its own colours, because it cannot inherit any", () => {
    expect(icon).not.toContain("var(--");
    expect(icon).toContain("prefers-color-scheme: dark");
  });
});
