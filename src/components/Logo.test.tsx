import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Logo, LogoMark } from "./Logo";

/**
 * The claim the mark makes is mathematical, so the geometry is worth
 * asserting: if the dot drifts off the turning point or the crossbar stops
 * meeting the legs, the drawing still looks like a logo but stops being true.
 */
describe("LogoMark", () => {
  const html = renderToStaticMarkup(<LogoMark />);

  /** Pull the numbers back out of the rendered path data. */
  const path = /d="M5 24 L([\d.]+) ([\d.]+) Q([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) L23 24"/.exec(html);
  const bar = /d="M([\d.]+) 16H([\d.]+)"/.exec(html);
  const dot = /<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/.exec(html);

  it("draws the letter, the crossbar and the point", () => {
    expect(path, "letter path").not.toBeNull();
    expect(bar, "crossbar path").not.toBeNull();
    expect(dot, "turning point").not.toBeNull();
  });

  it("puts the dot exactly on the turning point", () => {
    // For a quadratic with a symmetric control point the gradient is zero at
    // the midpoint, which is 0.25*start + 0.5*control + 0.25*end.
    const [, , y0, cx, cy, , y2] = path!.map(Number);
    const apexY = 0.25 * y0 + 0.5 * cy + 0.25 * y2;
    const [, dotX, dotY] = dot!.map(Number);
    expect(dotY).toBeCloseTo(apexY, 2);
    expect(dotX).toBeCloseTo(cx, 2);
  });

  it("is symmetric about the middle of the box", () => {
    // An A that leans is just a mistake.
    const [, x0, , cx, , x2] = path!.map(Number);
    expect(cx).toBeCloseTo(14, 2);
    expect(x0 + x2).toBeCloseTo(28, 2);
    const [, barFrom, barTo] = bar!.map(Number);
    expect(barFrom + barTo).toBeCloseTo(28, 2);
  });

  it("ends the crossbar on the legs, not near them", () => {
    // The left leg runs from (5, 24) to the top of the straight section. The
    // bar has to meet it at y = 16, or the A comes apart at small sizes.
    const [, xTop, yTop] = path!.map(Number);
    const s = (24 - 16) / (24 - yTop);
    const expected = 5 + (xTop - 5) * s;
    const [, barFrom] = bar!.map(Number);
    expect(barFrom).toBeCloseTo(expected, 2);
  });

  it("keeps the apex flat enough for the dot to read as a turning point", () => {
    // A pointed apex made the dot look like a pin head stuck on the tip. The
    // straight legs must stop well before the top so there is an arc to sit on.
    const [, , yTop, , cy] = path!.map(Number);
    expect(yTop - cy).toBeGreaterThanOrEqual(3.5);
  });

  it("carries no colour of its own", () => {
    // Strokes inherit, and the dot uses the plot series colour, which is
    // deliberately not semantic. Amber means "do this next"; green and red
    // mean right and wrong. The logo must borrow none of them.
    expect(html).toContain("currentColor");
    expect(html).toContain("var(--plot-a)");
    expect(html).not.toMatch(/#[0-9a-f]{3,8}/i);
    expect(html).not.toMatch(/var\(--(accent|correct|wrong)/);
  });

  it("is decorative, so it is not announced", () => {
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('role="presentation"');
  });

  it("scales rather than fixing a pixel size", () => {
    // It sits next to text at several sizes, so it is sized in em by its
    // caller and must not carry width/height of its own.
    expect(html).toContain('viewBox="0 0 28 26"');
    expect(html).not.toMatch(/<svg[^>]*\swidth=/);
  });
});

describe("Logo", () => {
  it("is called what the site is called, whatever the mark shows", () => {
    // The mark stands in for the A on screen. A screen reader must still hear
    // the real name rather than "Level Maths", which is not the name of
    // anything.
    const html = renderToStaticMarkup(<Logo />);
    expect(html).toContain("A Level Maths");
    // And the visible half must not be read out as well, or it says it twice.
    expect(html).toMatch(/aria-hidden="true"[^>]*>Level Maths/);
  });

  it("can drop the exam code where there is no room", () => {
    expect(renderToStaticMarkup(<Logo subtitle={false} />)).not.toContain("9MA0");
    expect(renderToStaticMarkup(<Logo />)).toContain("9MA0");
  });
});

describe("the browser tab icon", () => {
  // A favicon is a separate document and cannot reach the app's CSS custom
  // properties, so the mark has to be drawn twice. Duplication that a build
  // cannot check is duplication that drifts, so check it here.
  const icon = readFileSync(new URL("../app/icon.svg", import.meta.url), "utf8");
  const mark = renderToStaticMarkup(<LogoMark />);

  it("draws exactly the same glyph as the header mark", () => {
    for (const d of [...mark.matchAll(/ d="([^"]+)"/g)].map((m) => m[1])) {
      expect(icon, `path missing from icon.svg: ${d}`).toContain(d);
    }
    const dot = /<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/.exec(mark)!;
    expect(icon).toContain(`cx="${dot[1]}" cy="${dot[2]}" r="${dot[3]}"`);
  });

  it("carries its own colours, because it cannot inherit any", () => {
    expect(icon).not.toContain("currentColor");
    expect(icon).not.toContain("var(--");
    // And it must survive a dark browser chrome, where charcoal ink would all
    // but disappear.
    expect(icon).toContain("prefers-color-scheme: dark");
  });

  it("is cropped to the glyph rather than reusing the header's padding", () => {
    // At 16px the header's breathing room would shrink the letter to nothing.
    expect(icon).toMatch(/viewBox="2 2\.5 24 24"/);
  });
});
