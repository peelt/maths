import { describe, expect, it } from "vitest";
import { toHtml } from "./Maths";

/**
 * These exist because of a bug that was live on the site and invisible to
 * every test: $$ … $$ was not handled at all, so 171 pieces of content
 * rendered with stray dollar signs and with the sentence after the equation
 * typeset as maths. Nothing caught it because the question bank's tests check
 * the LaTeX SOURCE — which was correct — and never the rendered output.
 */
describe("toHtml", () => {
  const PROMPT =
    "A curve has parametric equations\n\n$$x=-3t + 7,\\qquad y=t^{2} + 4$$\n\n" +
    "Find a Cartesian equation of the curve in the form $y=f(x)$.";

  it("leaves no dollar sign on the page", () => {
    // The exact symptom: a literal "$" rendered before every display equation.
    expect(toHtml(PROMPT)).not.toContain("$");
  });

  it("keeps the prose after a display equation as prose", () => {
    const html = toHtml(PROMPT);
    // The sentence must appear once, as text — not a second time as a run of
    // italic maths identifiers with the spaces stripped out.
    expect(html).toContain("Find a Cartesian equation of the curve in the form");
    expect(html).not.toContain("Cartesianequation");
  });

  it("renders the display equation and the inline one", () => {
    const html = toHtml(PROMPT);
    // Two separate KaTeX renders: the parametric pair, and y=f(x).
    expect([...html.matchAll(/class="katex"/g)]).toHaveLength(2);
  });

  it("gives a display equation its own block, which can scroll", () => {
    // An equation too wide for a phone must scroll inside its own box rather
    // than push the whole page sideways — which is how this was found.
    const html = toHtml("$$\\frac{a}{b}$$");
    expect(html).toMatch(/<span style="[^"]*display:block/);
    expect(html).toMatch(/overflow-x:auto/);
  });

  it("does not put a div inside the paragraph", () => {
    // KaTeX's own displayMode emits a div, which is invalid inside a <p> and
    // gets silently hoisted out by the browser.
    expect(toHtml("$$x=1$$")).not.toContain("<div");
  });

  it("handles several display blocks in one string", () => {
    const html = toHtml("First\n\n$$a=1$$\n\nThen\n\n$$b=2$$\n\nDone");
    expect(html).not.toContain("$");
    expect(html).toContain("First");
    expect(html).toContain("Then");
    expect(html).toContain("Done");
  });

  it("does not let an unbalanced delimiter swallow the rest of the sentence", () => {
    // This was the mechanism of the bug: an orphaned $ paired with the next
    // opening $ and typeset everything between them.
    const html = toHtml("Solve $x=1 and then find the value of $y$ exactly.");
    expect(html).toContain("exactly.");
  });

  it("escapes markup in the prose", () => {
    expect(toHtml("a < b & c")).toContain("&lt;");
    expect(toHtml("a < b & c")).toContain("&amp;");
  });

  it("turns blank lines into paragraphs and single newlines into breaks", () => {
    expect(toHtml("one\n\ntwo")).toBe("one</p><p>two");
    expect(toHtml("one\ntwo")).toBe("one<br />two");
  });
});
