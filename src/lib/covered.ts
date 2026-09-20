/**
 * Which topics the student has actually been taught.
 *
 * The specification does not divide this course into years, and no derivation
 * from it can say what a particular school has covered by now — that depends
 * on their scheme of work. So the site asks, and remembers the answer.
 *
 * The AS/A-level split in `SpecPoint.phase` seeds the starting suggestion,
 * which is right often enough to be useful on a first visit. From the moment
 * the student marks anything, their answer wins: this is the one fact about
 * the course that they know and the specification does not.
 *
 * It lives in localStorage rather than the database because it is a per-device
 * convenience, and because being wrong about it costs nothing — unlike
 * progress, nothing is lost if it is cleared. Every access is wrapped: a
 * private window or blocked site data throws on read rather than coming back
 * empty.
 *
 * Exposed as an external store so components can read it with
 * `useSyncExternalStore`, which is the supported way to render browser-only
 * state without either a hydration mismatch or a setState-in-effect.
 */

export const COVERED_KEY = "course.coveredTopics";

/** Topic slugs the student says they have been taught. */
export type Covered = ReadonlySet<string>;

const listeners = new Set<() => void>();

/**
 * The last parsed value, kept so `getSnapshot` is referentially stable.
 *
 * `useSyncExternalStore` re-renders whenever the snapshot changes identity, so
 * parsing afresh on every call would loop forever. The raw string is the cache
 * key: if the stored text has not changed, hand back the same Set.
 */
let cache: { raw: string | null; value: Covered | null } = { raw: null, value: null };

function raw(): string | null {
  try {
    return window.localStorage.getItem(COVERED_KEY);
  } catch {
    return null;
  }
}

function parse(text: string | null): Covered | null {
  if (text === null) return null;
  try {
    const parsed: unknown = JSON.parse(text);
    if (!Array.isArray(parsed)) return null;
    return new Set(parsed.filter((s): s is string => typeof s === "string"));
  } catch {
    return null;
  }
}

export function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // Another tab writing the same key should update this one too.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function getSnapshot(): Covered | null {
  const text = raw();
  if (text !== cache.raw) cache = { raw: text, value: parse(text) };
  return cache.value;
}

/** Nothing is marked on the server; the client re-reads immediately after. */
export function getServerSnapshot(): Covered | null {
  return null;
}

/** A plain read, for callers outside the React tree. */
export function readCovered(): Covered | null {
  return parse(raw());
}

export function writeCovered(covered: Covered): void {
  try {
    window.localStorage.setItem(COVERED_KEY, JSON.stringify([...covered]));
  } catch {
    // Site data blocked: the site still works, the choice just does not
    // survive the visit. Better than refusing to render.
  }
  for (const fn of listeners) fn();
}

/** Toggle one topic, returning a new set rather than mutating the old one. */
export function toggle(covered: Covered, slug: string): Set<string> {
  const next = new Set(covered);
  if (next.has(slug)) next.delete(slug);
  else next.add(slug);
  return next;
}

/**
 * Has this topic been covered?
 *
 * With nothing marked, `null` means "we don't know" and everything counts as
 * available — the site never hides content it has not been told about.
 */
export function isCovered(covered: Covered | null, slug: string): boolean {
  return covered === null || covered.has(slug);
}
