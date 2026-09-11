import { describe, expect, it } from "vitest";
import { binomialCdf, binomialPmf, choose, normalCdf, sxx, standardDeviation } from "./numeric";

describe("numeric helpers", () => {
  it("computes binomial coefficients", () => {
    expect(choose(5, 2)).toBe(10);
    expect(choose(10, 3)).toBe(120);
    expect(choose(6, 0)).toBe(1);
    expect(choose(6, 7)).toBe(0);
  });

  it("computes binomial probabilities", () => {
    // X ~ B(10, 0.5), P(X = 5) = 252/1024.
    expect(binomialPmf(10, 0.5, 5)).toBeCloseTo(0.24609375, 8);
    // The whole distribution must sum to 1.
    expect(binomialCdf(10, 0.5, 10)).toBeCloseTo(1, 10);
  });

  it("computes normal probabilities", () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 6);
    // The standard textbook values, to the accuracy a student would quote.
    expect(normalCdf(1)).toBeCloseTo(0.8413, 4);
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 4);
    expect(normalCdf(-1.96)).toBeCloseTo(0.025, 4);
    expect(normalCdf(112, 100, 15)).toBeCloseTo(0.7881, 4);
  });

  it("computes Sxx and standard deviation the way the spec defines them", () => {
    const values = [2, 4, 4, 4, 5, 5, 7, 9];
    // Mean 5, so Sxx = 4 + 1 + 1 + 1 + 0 + 0 + 4 + 16 = 32.
    expect(sxx(values)).toBeCloseTo(32, 10);
    // Population sd divides by n, giving sqrt(4) = 2.
    expect(standardDeviation(values)).toBeCloseTo(2, 10);
  });
});
