/**
 * Exam pace.
 *
 * The brief asked for short timed practice, and the useful version of that is
 * not an arbitrary countdown — it is the pace the real paper demands, made
 * visible. Every 9MA0 paper is 100 marks in two hours, so the exam's own rate
 * is 1.2 minutes a mark on all three papers. That is the number worth
 * learning, so it is the number used here.
 *
 * There is no fudge factor on top of it. I tried to add one — a floor, on the
 * grounds that a one-mark question is not really 72 seconds of work — and it
 * was both wrong (a floor cannot shorten anything) and unjustifiable: any
 * adjustment would be a number I invented, and the whole value of this is that
 * the student is measuring themselves against the actual paper.
 *
 * What is softened is the consequence. Running out does NOT end the question:
 * the clock stops, says so, and the question stays answerable. A timer that
 * marks you wrong for thinking turns practice into a punishment, which is
 * exactly how a student with ADHD ends up avoiding it. Being over time is
 * information, not a penalty.
 */

/** The rate the real paper sets: 100 marks in 120 minutes. */
export const SECONDS_PER_MARK = 72;

/** Used only when a question arrives without a usable mark count. */
const FALLBACK_SECONDS = SECONDS_PER_MARK;

/** How long exam pace allows for a question worth this many marks. */
export function allowanceSeconds(marks: number): number {
  if (!Number.isFinite(marks) || marks <= 0) return FALLBACK_SECONDS;
  return Math.round(marks * SECONDS_PER_MARK);
}

/** m:ss, counting seconds up from zero. Negative input clamps to 0:00. */
export function formatClock(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(whole / 60);
  return `${minutes}:${String(whole % 60).padStart(2, "0")}`;
}

/**
 * How much of the allowance is gone, 0 to 1. Used for the bar, which is why
 * it clamps rather than running past the end of its track.
 */
export function elapsedFraction(elapsed: number, allowance: number): number {
  if (allowance <= 0) return 1;
  return Math.min(1, Math.max(0, elapsed / allowance));
}

/**
 * What to say about a timed set once it is finished.
 *
 * Phrased around what the student now knows rather than around a score. Being
 * slow on a set is a fact about which questions need more practice, and saying
 * so plainly is more useful than either congratulation or a telling-off.
 */
export function paceSummary(inside: number, total: number): string {
  if (total <= 0) return "";
  if (inside === total) return "Every one inside exam pace. That is the whole point of timing it.";
  if (inside === 0) {
    return "All of those took longer than the exam allows — which is worth knowing now rather than in May. Speed comes from knowing the method cold, so these are the ones to come back to.";
  }
  return `Inside exam pace on ${inside} of ${total}. The slower ones are the ones to practise again — in the exam that time has to come from somewhere.`;
}

/**
 * Where the exam-pace preference lives.
 *
 * Per-device, like the appearance settings, and for the same reason: it is a
 * comfort setting rather than part of the account, and it has to be readable
 * without waiting for a network round trip.
 */
export const PACE_KEY = "practice.examPace";

/** Read the stored preference. Off unless explicitly turned on. */
export function readPacePreference(storage: Pick<Storage, "getItem"> | undefined): boolean {
  try {
    return storage?.getItem(PACE_KEY) === "on";
  } catch {
    // Private browsing and blocked site data both throw here. An unreadable
    // preference is not a reason to fail to render a practice set.
    return false;
  }
}

export function writePacePreference(
  storage: Pick<Storage, "setItem"> | undefined,
  timed: boolean,
): void {
  try {
    storage?.setItem(PACE_KEY, timed ? "on" : "off");
  } catch {
    // Same again: the session continues, the choice just does not persist.
  }
}
