/**
 * Numerical helpers for generating statistics and mechanics questions.
 *
 * These compute the answers the questions are marked against, so they are
 * unit tested directly rather than trusted.
 */

/** Binomial coefficient, computed multiplicatively to avoid huge factorials. */
export function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let result = 1;
  for (let i = 0; i < k; i++) result = (result * (n - i)) / (i + 1);
  return Math.round(result);
}

/** P(X = k) for X ~ B(n, p). */
export function binomialPmf(n: number, p: number, k: number): number {
  return choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

/** P(X <= k) for X ~ B(n, p). */
export function binomialCdf(n: number, p: number, k: number): number {
  let total = 0;
  for (let i = 0; i <= k; i++) total += binomialPmf(n, p, i);
  return total;
}

/**
 * The error function, via the Abramowitz and Stegun 7.1.26 approximation.
 * Accurate to about 1.5e-7, which is far tighter than any answer a student
 * gives to three significant figures.
 */
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const z = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * z);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-z * z);
  return sign * y;
}

/** P(X < value) for X ~ N(mean, sd^2). */
export function normalCdf(value: number, mean = 0, sd = 1): number {
  return 0.5 * (1 + erf((value - mean) / (sd * Math.SQRT2)));
}

/** The mean of a list. */
export function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Population standard deviation, as the specification defines it —
 * sigma = sqrt(Sxx / n), not the n - 1 divisor spreadsheets use by default.
 */
export function standardDeviation(values: number[]): number {
  const m = mean(values);
  const sxx = values.reduce((total, v) => total + (v - m) ** 2, 0);
  return Math.sqrt(sxx / values.length);
}

/** Sxx, as used in the exam formula booklet. */
export function sxx(values: number[]): number {
  const sum = values.reduce((a, b) => a + b, 0);
  const sumSquares = values.reduce((a, b) => a + b * b, 0);
  return sumSquares - (sum * sum) / values.length;
}

/** Acceleration due to gravity, at the specification's default accuracy. */
export const G = 9.8;
