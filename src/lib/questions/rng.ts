/**
 * Seeded pseudo-random number generation.
 *
 * Questions are generated from a seed rather than stored as fixed text, so
 * every attempt at a topic produces fresh numbers. Because the seed is stored
 * with the attempt, any past question can be reproduced exactly — which is
 * what makes "show me that one again" and reviewing a wrong answer possible.
 */
export interface Rng {
  /** Float in [0, 1). */
  next(): number;
  /** Integer in [min, max], inclusive. */
  int(min: number, max: number): number;
  /** Integer in [min, max] excluding zero — the usual need for coefficients. */
  nonZeroInt(min: number, max: number): number;
  /** Uniformly pick one element. */
  pick<T>(items: readonly T[]): T;
  /** Pick n distinct elements. */
  sample<T>(items: readonly T[], n: number): T[];
  /** True with the given probability. */
  chance(probability: number): boolean;
}

/** mulberry32 — small, fast and well distributed enough for question numbers. */
export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min: number, max: number): number => min + Math.floor(next() * (max - min + 1));

  return {
    next,
    int,
    nonZeroInt(min, max) {
      // Guard against an impossible range rather than looping forever.
      if (min === 0 && max === 0) throw new Error("nonZeroInt needs a range containing a non-zero value");
      let value = int(min, max);
      while (value === 0) value = int(min, max);
      return value;
    },
    pick<T>(items: readonly T[]): T {
      if (items.length === 0) throw new Error("Cannot pick from an empty list");
      return items[int(0, items.length - 1)];
    },
    sample<T>(items: readonly T[], n: number): T[] {
      const pool = [...items];
      const out: T[] = [];
      for (let i = 0; i < n && pool.length > 0; i++) {
        out.push(pool.splice(int(0, pool.length - 1), 1)[0]);
      }
      return out;
    },
    chance(probability) {
      return next() < probability;
    },
  };
}

/** A stable seed derived from a string, so a given id always starts the same. */
export function seedFromString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** A fresh random seed, for a new practice attempt. */
export function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}
