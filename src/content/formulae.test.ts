import { describe, expect, it } from "vitest";
import katex from "katex";
import { formulae, formulaStats } from "./formulae";

describe("formula reference", () => {
  it("has both a memorise list and a booklet list", () => {
    expect(formulaStats.memorise).toBeGreaterThan(20);
    expect(formulaStats.booklet).toBeGreaterThan(15);
    expect(formulaStats.total).toBe(formulaStats.memorise + formulaStats.booklet);
  });

  it("gives every formula a unique id", () => {
    const ids = formulae.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("renders every formula without a KaTeX error", () => {
    // A formula that fails to parse renders as red error text on the page, so
    // this is the difference between a usable reference and a broken one.
    for (const f of formulae) {
      expect(() => katex.renderToString(f.latex, { throwOnError: true, displayMode: true })).not.toThrow();
    }
  });

  it("covers all three content areas on the memorise list", () => {
    const areas = new Set(formulae.filter((f) => f.source === "memorise").map((f) => f.area));
    expect(areas).toEqual(new Set(["pure", "statistics", "mechanics"]));
  });

  it("records the surprising given-versus-recalled pairings", () => {
    // These specific splits are verified against the spec appendix and the
    // exam booklet, and are the reason this feature exists.
    const bySource = (id: string) => formulae.find((f) => f.id === id)?.source;
    expect(bySource("compound-angle")).toBe("booklet");
    expect(bySource("double-angle-sin")).toBe("memorise");
    expect(bySource("quotient-rule")).toBe("booklet");
    expect(bySource("product-rule")).toBe("memorise");
    expect(bySource("chain-rule")).toBe("memorise");
    expect(bySource("suvat")).toBe("booklet");
    expect(bySource("variable-acceleration")).toBe("memorise");
  });
});
