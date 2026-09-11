import { ExpressionError, evaluate, parseExpression, variablesIn } from "./expression";
import { expressionsEquivalent } from "./equivalence";

export * from "./expression";
export * from "./equivalence";

/**
 * How a given answer should be judged.
 *
 *  - "numeric"    the value must match, within a tolerance
 *  - "expression" any algebraically equivalent form is accepted
 *  - "choice"     one of a fixed set of options
 *  - "text"       a normalised string match, for short written answers
 */
/**
 * A form the answer must not be left in, even though it is mathematically
 * equal to the right answer.
 *
 * "Rationalise the denominator" is the clearest case: the original expression
 * is algebraically equivalent to the rationalised one, so an equivalence check
 * alone would accept a student who changed nothing. The instruction in these
 * questions is about FORM, and this is how that is enforced.
 */
export interface RejectedForm {
  /** Regular expression source, tested against the raw input. */
  pattern: string;
  /** Shown to the student, explaining what still needs doing. */
  message: string;
}

export type AnswerSpec =
  | {
      type: "numeric";
      value: number;
      /** Absolute tolerance. Defaults to a sensible value for 3sf work. */
      tolerance?: number;
      /** Reject a decimal when the question demands an exact form. */
      requireExact?: boolean;
      /**
       * A canonical exact way of writing this answer, e.g. "sqrt(3)/2".
       * Required when `requireExact` is set, so there is always at least one
       * form that is known to be accepted — shown to the student as a worked
       * example of how to type it.
       */
      exactForm?: string;
      unit?: string;
      reject?: readonly RejectedForm[];
    }
  | {
      type: "expression";
      /** The canonical correct answer. Any equivalent form is accepted. */
      value: string;
      variables?: string[];
      reject?: readonly RejectedForm[];
    }
  | { type: "choice"; value: string; options: readonly string[] }
  | { type: "text"; value: string; accept?: readonly string[] };

export type MarkOutcome = "correct" | "incorrect" | "unparseable" | "not-exact" | "not-simplified";

export interface MarkResult {
  outcome: MarkOutcome;
  correct: boolean;
  /** Shown to the student when their input could not be understood. */
  message?: string;
}

/** Decimal answers that are really just a rounded form of an exact value. */
function looksLikeRoundedDecimal(input: string): boolean {
  const trimmed = input.trim();
  // A bare decimal, with no surd, fraction, pi or e in sight.
  return /^[-+]?\d*\.\d+$/.test(trimmed);
}

/**
 * The largest error a student can make by correctly rounding to three
 * significant figures — which is how A Level answers are normally given, and
 * so the default standard an answer is held to.
 *
 * For a value near 3.14 that is 0.005; for one near 31.4 it is 0.05.
 */
function toleranceForThreeSigFigs(value: number): number {
  const magnitude = Math.abs(value);
  if (magnitude === 0 || !Number.isFinite(magnitude)) return 1e-9;
  const exponent = Math.floor(Math.log10(magnitude));
  return 0.5 * Math.pow(10, exponent - 2);
}

function firstRejectedForm(input: string, rejects?: readonly RejectedForm[]): RejectedForm | undefined {
  return rejects?.find((r) => new RegExp(r.pattern, "i").test(input));
}

function normaliseText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function markAnswer(input: string, spec: AnswerSpec): MarkResult {
  const raw = (input ?? "").trim();
  if (!raw) return { outcome: "unparseable", correct: false, message: "Enter an answer." };

  switch (spec.type) {
    case "choice":
      return raw === spec.value
        ? { outcome: "correct", correct: true }
        : { outcome: "incorrect", correct: false };

    case "text": {
      const candidates = [spec.value, ...(spec.accept ?? [])].map(normaliseText);
      return candidates.includes(normaliseText(raw))
        ? { outcome: "correct", correct: true }
        : { outcome: "incorrect", correct: false };
    }

    case "numeric": {
      let value: number;
      try {
        const node = parseExpression(raw);
        if (variablesIn(node).length > 0) {
          return {
            outcome: "unparseable",
            correct: false,
            message: "This answer should be a number, not an expression in x.",
          };
        }
        value = evaluate(node);
      } catch (error) {
        if (error instanceof ExpressionError) {
          return { outcome: "unparseable", correct: false, message: `I could not read that: ${error.message}.` };
        }
        throw error;
      }

      if (!Number.isFinite(value)) {
        return { outcome: "unparseable", correct: false, message: "That does not evaluate to a number." };
      }

      const tolerance = spec.tolerance ?? toleranceForThreeSigFigs(spec.value);
      const correct = Math.abs(value - spec.value) <= tolerance;
      if (!correct) return { outcome: "incorrect", correct: false };

      const rejected = firstRejectedForm(raw, spec.reject);
      if (rejected) {
        return { outcome: "not-simplified", correct: false, message: rejected.message };
      }

      if (spec.requireExact && looksLikeRoundedDecimal(raw)) {
        return {
          outcome: "not-exact",
          correct: false,
          message: "That is the right value, but the question asks for an exact answer — leave it in surd, fraction or pi form.",
        };
      }

      return { outcome: "correct", correct: true };
    }

    case "expression": {
      try {
        const given = parseExpression(raw);
        const expected = parseExpression(spec.value);
        if (!expressionsEquivalent(given, expected)) {
          return { outcome: "incorrect", correct: false };
        }
        // Equivalent, but possibly still in the form the question asked the
        // student to move away from.
        const rejected = firstRejectedForm(raw, spec.reject);
        if (rejected) {
          return { outcome: "not-simplified", correct: false, message: rejected.message };
        }
        return { outcome: "correct", correct: true };
      } catch (error) {
        if (error instanceof ExpressionError) {
          return { outcome: "unparseable", correct: false, message: `I could not read that: ${error.message}.` };
        }
        throw error;
      }
    }
  }
}
