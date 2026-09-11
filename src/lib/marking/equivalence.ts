import { ExpressionError, evaluate, parseExpression, variablesIn, type Node } from "./expression";

/**
 * Algebraic equivalence by numerical sampling.
 *
 * Full symbolic simplification is a large problem and overkill here. Instead
 * two expressions are evaluated at many random points: if they agree
 * everywhere they are sampled, they are equivalent for marking purposes. This
 * is the same approach used by established online assessment systems, and it
 * correctly accepts answers a student has written in a different but equally
 * valid form — (x+1)^2 against x^2+2x+1, or 2sin(x)cos(x) against sin(2x).
 */

export interface EquivalenceOptions {
  /** Sample points per variable. More points means fewer false accepts. */
  samples?: number;
  /** Relative tolerance for comparing two evaluated values. */
  tolerance?: number;
  /** Sampling interval for free variables. */
  domain?: { min: number; max: number };
}

const DEFAULTS: Required<EquivalenceOptions> = {
  samples: 24,
  tolerance: 1e-9,
  // Deliberately not symmetric about zero and not landing on integers, so a
  // sample is unlikely to sit exactly on a removable singularity or on a point
  // where two genuinely different expressions happen to coincide.
  domain: { min: -3.7, max: 4.3 },
};

/** Deterministic generator, so a marking result never changes between runs. */
function makeRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function closeEnough(a: number, b: number, tolerance: number): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  const diff = Math.abs(a - b);
  if (diff <= tolerance) return true;
  const scale = Math.max(Math.abs(a), Math.abs(b));
  return diff <= tolerance * scale;
}

export function expressionsEquivalent(
  a: Node,
  b: Node,
  options: EquivalenceOptions = {},
): boolean {
  const { samples, tolerance, domain } = { ...DEFAULTS, ...options };
  const variables = [...new Set([...variablesIn(a), ...variablesIn(b)])];

  // No variables: a straight numerical comparison.
  if (variables.length === 0) {
    try {
      return closeEnough(evaluate(a), evaluate(b), tolerance);
    } catch {
      return false;
    }
  }

  const random = makeRandom(0x9e3779b9);
  let compared = 0;
  const wanted = Math.max(8, Math.min(samples, 40));

  for (let attempt = 0; attempt < wanted * 12 && compared < wanted; attempt++) {
    const scope: Record<string, number> = {};
    for (const v of variables) {
      scope[v] = domain.min + random() * (domain.max - domain.min);
    }

    let va: number;
    let vb: number;
    try {
      va = evaluate(a, scope);
      vb = evaluate(b, scope);
    } catch {
      continue; // Unknown variable or similar — skip this point.
    }

    // Skip points where either side is undefined (a pole, a log of a negative,
    // a root of a negative). Those tell us nothing about equivalence.
    if (!Number.isFinite(va) || !Number.isFinite(vb)) continue;

    if (!closeEnough(va, vb, tolerance)) return false;
    compared++;
  }

  // If almost every sample was undefined we cannot honestly claim equivalence.
  return compared >= Math.min(6, wanted);
}

export function stringsEquivalent(a: string, b: string, options?: EquivalenceOptions): boolean {
  try {
    return expressionsEquivalent(parseExpression(a), parseExpression(b), options);
  } catch (error) {
    if (error instanceof ExpressionError) return false;
    throw error;
  }
}
