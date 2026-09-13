import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PaceClock } from "./PaceClock";

/**
 * The over-time state is the one worth testing, and the one hardest to reach
 * by hand: a three-mark question allows 3:36, so an end-to-end test would have
 * to sit there for three and a half minutes to see it. Rendering it directly
 * costs milliseconds.
 */
describe("PaceClock", () => {
  const render = (elapsed: number, allowance: number) =>
    renderToStaticMarkup(<PaceClock elapsed={elapsed} allowance={allowance} />);

  it("shows time used against the allowance", () => {
    const html = render(65, 216);
    expect(html).toContain("1:05");
    expect(html).toContain("3:36");
  });

  it("says nothing about being over while there is time left", () => {
    expect(render(10, 216)).not.toContain("Over");
  });

  it("says so in words when the allowance is gone, and does not take the question away", () => {
    const html = render(240, 216);
    expect(html).toContain("Over — keep going");
    // The phrasing matters: over time is information, not a penalty, and the
    // student must not be told they have failed or run out.
    expect(html).not.toMatch(/failed|out of time|too slow/i);
  });

  it("keeps the bar inside its track when the allowance is blown", () => {
    // A width over 100% would render past the element containing it.
    const widths = [...render(900, 216).matchAll(/width:\s*([\d.]+)%/g)].map((m) => Number(m[1]));
    expect(widths.length).toBeGreaterThan(0);
    for (const width of widths) expect(width).toBeLessThanOrEqual(100);
  });

  it("carries no colour of its own", () => {
    // Green and red mean correct and incorrect; amber means "do this next".
    // A clock running down is neither, so it must borrow none of them.
    const html = render(240, 216);
    expect(html).not.toMatch(/text-(correct|wrong|accent)|bg-(correct|wrong|accent)/);
  });

  it("is announced once rather than read out every second", () => {
    // A live region carrying the ticking clock would make the page unusable
    // with a screen reader, so the numbers are hidden and only the
    // over-allowance message is announced.
    const before = render(10, 216);
    const after = render(240, 216);
    expect(before).toContain('aria-hidden="true"');
    expect(after).toMatch(/aria-live="polite"[^>]*>\s*Over the exam allowance/);
  });
});
