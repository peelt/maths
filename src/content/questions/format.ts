/**
 * Small helpers for writing question text.
 *
 * Generated questions have to read like a printed exam paper. "x^2 + -3x" is
 * a giveaway that a question was machine made, and it undermines trust in the
 * whole thing, so signs and unit coefficients are tidied here once rather than
 * in every template.
 */

/** A signed term for the middle of an expression: 3 becomes "+ 3", -3 "- 3". */
export function signed(value: number, term = ""): string {
  if (value === 0) return "";
  const sign = value < 0 ? "-" : "+";
  const size = Math.abs(value);
  const coefficient = size === 1 && term ? "" : String(size);
  return ` ${sign} ${coefficient}${term}`;
}

/** A leading term, where a positive sign is not written: -3 becomes "-3x". */
export function leading(value: number, term = ""): string {
  if (value === 0) return "0";
  const size = Math.abs(value);
  const coefficient = size === 1 && term ? "" : String(size);
  return `${value < 0 ? "-" : ""}${coefficient}${term}`;
}

/** x, x^2, x^3 … with the exponent omitted when it is 1. */
export function power(variable: string, exponent: number): string {
  if (exponent === 0) return "";
  if (exponent === 1) return variable;
  return `${variable}^{${exponent}}`;
}

/** A polynomial from its coefficients, highest power first. */
export function polynomial(coefficients: number[], variable = "x"): string {
  const degree = coefficients.length - 1;
  let out = "";
  for (let i = 0; i < coefficients.length; i++) {
    const c = coefficients[i];
    if (c === 0) continue;
    const term = power(variable, degree - i);
    out += out === "" ? leading(c, term) : signed(c, term);
  }
  return out === "" ? "0" : out;
}

/** Greatest common divisor, for keeping fractions in lowest terms. */
export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

/** A fraction in lowest terms, rendered as LaTeX. */
export function fraction(numerator: number, denominator: number): string {
  const divisor = gcd(numerator, denominator);
  let n = numerator / divisor;
  let d = denominator / divisor;
  if (d < 0) {
    n = -n;
    d = -d;
  }
  if (d === 1) return String(n);
  // Keep the sign outside the fraction: -\frac{1}{4} rather than \frac{-1}{4},
  // which is how it would be written by hand and in the mark scheme.
  return n < 0 ? `-\\frac{${-n}}{${d}}` : `\\frac{${n}}{${d}}`;
}

/**
 * A factor written after a multiplication sign, bracketed when it is negative.
 *
 * "3 \times -0.5" is how a machine writes it and "3 \times (-0.5)" is how a
 * person does. The difference is small but it is exactly the kind of tell that
 * makes generated questions feel untrustworthy.
 */
export function factor(value: number | string): string {
  const text = String(value);
  return text.startsWith("-") ? `(${text})` : text;
}

/**
 * A number in scientific notation, as LaTeX.
 *
 * JavaScript's toExponential gives "1.024e-2", which rendered as maths reads
 * as 1.024 times the constant e, minus 2 — a different number, and a confusing
 * one to meet inside a mark scheme. This writes it the way it is written by
 * hand: 1.024 \times 10^{-2}.
 */
export function scientific(value: number, digits = 3): string {
  if (!Number.isFinite(value)) return String(value);
  if (value === 0) return "0";
  const [mantissa, exponent] = value.toExponential(digits).split("e");
  const power = Number(exponent);
  if (power === 0) return mantissa;
  return `${mantissa}\\times 10^{${power}}`;
}
