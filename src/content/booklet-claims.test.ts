import { describe, expect, it } from "vitest";
import { formulae } from "@/content/formulae";
import { allTopics } from "@/content/spec";
import { teachingNotes } from "@/content/notes";
import { generateQuestion, questionTemplates } from "@/lib/questions";

/**
 * Does the site's prose agree with its own formula reference?
 *
 * The single most valuable thing this app says about a formula is whether it
 * is PRINTED in the exam booklet or has to be RECALLED, and it says it in two
 * independent places: `formulae.ts` classifies each formula with a `source`,
 * and the spec notes, teaching notes and mark schemes say it in prose. Prose
 * and classification are written at different times by different hands, so
 * they drift — and a drifted claim is worse than no claim, because a student
 * who trusts it walks into the exam expecting a formula that is not there.
 *
 * Two of these had already drifted when this test was written: the exam note
 * for Trigonometry 5.5 said the Pythagorean identities were in the booklet
 * while the teaching note, the mark scheme and `formulae.ts` all said they
 * were not.
 *
 * So: find every sentence anywhere in the learner-facing content that makes a
 * booklet claim, work out what it is claiming about what, and check it against
 * `formulae.ts`. A claim this file cannot place fails the test rather than
 * passing silently — that is the half that stops new drift, since a claim
 * written tomorrow has to be classified before it can ship.
 */

/** A sentence mentioning any of these is making, or near, a booklet claim. */
const MENTIONS_BOOKLET = /booklet|recall|memoris/i;

/**
 * Within such a sentence, the clause doing the classifying. Wider than
 * MENTIONS_BOOKLET because a sentence that has already said "booklet" often
 * drops it afterwards — "the double angle formulae, which are NOT given".
 */
const CLASSIFIES = /booklet|recall|memoris|given|printed|supplied|provided/i;

/**
 * Contrast markers. "The product and chain rules are NOT in the booklet, even
 * though the quotient rule is" makes two opposite claims in one sentence, so
 * polarity has to be read per clause, not per sentence.
 */
const CLAUSE_BREAK = /\s+(?:even though|although|whereas|while|but)\s+|\s*[;—]\s*/i;

/** Wording that flips a claim to "you have to know this one". */
const SAYS_NOT_GIVEN = /\bnot\b|\bn't\b|\bnever\b|recall|memoris/i;

interface BookletSubject {
  /** What these claims are about, for failure messages. */
  subject: string;
  /** Entries in `formulae.ts` this covers. Empty when the reference has none. */
  formulae: string[];
  /** True when the formula is printed in the exam booklet. */
  inBooklet: boolean;
  /**
   * Matched against `"<where> ||| <clause>"`, so a rule can key on the wording,
   * on where the sentence lives, or on both — which it has to, because plenty
   * of real claims say only "the formula is in the booklet" and mean whichever
   * formula that page is about. Any one matching places the claim.
   */
  match: RegExp[];
}

/**
 * A rule scoped to one location: `at("q quotient-rule", /\bgiven\b/)`. The
 * clause part is required, so that a location rule does not swallow the rest
 * of a sentence — "The formula is given in the booklet — the understanding is
 * not" must place the first half and leave the second half alone.
 */
function at(where: string, clause: RegExp): RegExp {
  const escaped = where.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped}[^|]*\\|\\|\\| .*(?:${clause.source})`, "i");
}

const SUBJECTS: BookletSubject[] = [
  // ---------------------------------------------------------------- pure
  {
    subject: "perpendicular gradients",
    formulae: ["perpendicular-gradients"],
    inBooklet: false,
    match: [/perpendicular gradients/i, at("q perpendicular-line-intercept", /this formula/)],
  },
  {
    subject: "exact trigonometric values",
    formulae: [],
    inBooklet: false,
    match: [/exact values/i, at("q exact-trig-value", /they are not|must be recalled/)],
  },
  {
    subject: "the Pythagorean identities",
    formulae: ["pythagorean-identity", "sec-identity", "cosec-identity"],
    inBooklet: false,
    match: [
      /pythagorean identit/i,
      at("note pure:5.5", /it is not in the booklet/),
      at("q pythagorean-identity", /this identity/),
      at("q proving-trig-identity-step", /this identity/),
    ],
  },
  {
    subject: "the laws of logarithms",
    formulae: ["log-laws", "log-definition"],
    inBooklet: false,
    match: [at("spec pure:6.4", /these are|they are/), at("q log-laws-solve", /this law/)],
  },
  {
    subject: "the Newton-Raphson formula",
    formulae: ["newton-raphson"],
    inBooklet: true,
    match: [
      /newton-raphson/i,
      at("spec pure:9.3", /the formula/),
      at("note pure:9.3", /the formula/),
      at("q newton-raphson-iteration", /the formula/),
      at("q numerical-methods-in-context", /the formula/),
    ],
  },
  {
    subject: "the arithmetic series sum",
    formulae: ["ap-sum"],
    inBooklet: true,
    match: [at("note pure:4.4", /\bsum\b/), at("q arithmetic-series-sum", /the sum formula|this formula/)],
  },
  {
    subject: "the nth term of an arithmetic or geometric progression",
    formulae: ["ap-nth-term", "gp-nth-term"],
    inBooklet: false,
    match: [/nth term/i, at("q geometric-nth-term", /this formula/)],
  },
  {
    subject: "the geometric series sum",
    formulae: ["gp-sum"],
    inBooklet: true,
    match: [
      /sum to infinity/i,
      at("note pure:4.5", /the sum formulae/),
      at("q geometric-sum-to-infinity", /this formula/),
    ],
  },
  {
    subject: "the binomial series for rational n",
    formulae: ["binomial-rational"],
    inBooklet: true,
    match: [/infinite series from the booklet/i],
  },
  {
    subject: "the compound angle formulae",
    formulae: ["compound-angle", "compound-angle-tan"],
    inBooklet: true,
    match: [/compound angle/i],
  },
  {
    subject: "the double angle formulae",
    formulae: ["double-angle-sin", "double-angle-cos", "double-angle-tan"],
    inBooklet: false,
    match: [/double angle/i],
  },
  {
    subject: "the small angle approximations",
    formulae: ["small-angle"],
    inBooklet: true,
    match: [/approximations are in the booklet/i],
  },
  {
    subject: "the derivative of a general exponential",
    formulae: [],
    inBooklet: false,
    match: [/the specification names this result explicitly/i],
  },
  {
    subject: "the derivatives of tan, sec, cot and cosec",
    formulae: ["diff-reciprocal-trig"],
    inBooklet: true,
    match: [/alongside the derivatives of/i],
  },
  {
    subject: "the quotient rule",
    formulae: ["quotient-rule"],
    inBooklet: true,
    match: [/quotient rule/i, at("note pure:7.4", /this one is given/), at("q quotient-rule", /this one is given/)],
  },
  {
    subject: "the product and chain rules",
    formulae: ["product-rule", "chain-rule"],
    inBooklet: false,
    match: [/product rule|chain rule/i, at("q product-rule", /it has to be recalled/)],
  },
  {
    subject: "integration by parts",
    formulae: ["integration-by-parts"],
    inBooklet: true,
    match: [/\bparts formula\b/i, at("note pure:8.5", /this IS in the booklet/)],
  },
  // ------------------------------------------------------------- applied
  {
    subject: "the conditional probability formula",
    formulae: ["prob-conditional"],
    inBooklet: true,
    match: [
      /which event is the condition/i,
      at("spec statistics:3.2", /the formula/),
      at("q conditional-probability", /the formula/),
    ],
  },
  {
    subject: "the binomial distribution",
    formulae: ["binomial-distribution"],
    inBooklet: true,
    match: [at("q binomial-probability", /the formula/)],
  },
  {
    subject: "Sxx",
    formulae: ["sxx"],
    inBooklet: true,
    match: [/\bSxx\b/i],
  },
  {
    subject: "standardising a normal variable",
    formulae: ["standardising"],
    inBooklet: false,
    match: [/standardising/i],
  },
  {
    subject: "the constant acceleration (suvat) formulae",
    formulae: ["suvat"],
    inBooklet: true,
    match: [/\bsuvat\b/i, at("q suvat-displacement", /these are given/), at("note mechanics:7.3", /the formulae are/)],
  },
];

/**
 * Sentences that mention the booklet or memorising without classifying any
 * formula. Each is listed deliberately, and the test fails if one of them
 * disappears — an exemption nobody can point at is an exemption nobody is
 * checking.
 */
const NOT_A_CLAIM: { text: RegExp; because: string }[] = [
  {
    text: /far easier to see than to memorise/,
    because: "about learning graph transformations, not about any formula's classification",
  },
  {
    text: /the fastest way to hold them is the unit circle rather than a memorised table/,
    because: "a study-method remark; the classification itself is made in the preceding sentence",
  },
  {
    text: /far less to memorise here than it first appears/,
    because: "about integration being the reverse of differentiation, not about the booklet",
  },
  {
    text: /the bracket structure in the booklet formula/,
    because: "explains how the trapezium rule is laid out, having already said it is given",
  },
  {
    text: /a rule you have memorised rather than the one printed in the question/,
    because: "about the outlier rule a question supplies, which is not a booklet formula at all",
  },
];

/** How many variants of each question template to read. */
const GENERATED_VARIANTS = 60;

/** Every learner-facing string, tagged with where it came from. */
function learnerFacingText(): { where: string; text: string }[] {
  const out: { where: string; text: string }[] = [];
  for (const topic of allTopics) {
    out.push({ where: `blurb ${topic.slug}`, text: topic.blurb });
    for (const point of topic.points) {
      out.push({ where: `spec ${topic.paper}:${point.code} summary`, text: point.summary });
      if (point.examNote) out.push({ where: `spec ${topic.paper}:${point.code} examNote`, text: point.examNote });
    }
  }
  for (const note of teachingNotes) {
    const key = `note ${note.paper}:${note.specCode}`;
    out.push({ where: `${key} idea`, text: note.idea });
    note.method.forEach((m) => out.push({ where: `${key} method`, text: m }));
    note.watchFor.forEach((w) => out.push({ where: `${key} watchFor`, text: w }));
  }
  // Question text is generated, so it has to be produced to be read. Many
  // seeds, because a booklet claim can sit inside a branch a generator only
  // takes occasionally: four of the claims below appear in fewer than one
  // variant in ten, and were invisible at a lower count.
  for (const template of questionTemplates) {
    for (let i = 0; i < GENERATED_VARIANTS; i++) {
      const q = generateQuestion(template, i * 7919 + 13);
      const key = `q ${template.id}`;
      out.push({ where: `${key} prompt`, text: q.prompt });
      if (q.hint) out.push({ where: `${key} hint`, text: q.hint });
      if (q.trap) out.push({ where: `${key} trap`, text: q.trap });
      for (const step of q.solution) {
        out.push({ where: `${key} step`, text: step.text });
        if (step.why) out.push({ where: `${key} why`, text: step.why });
      }
    }
  }
  return out;
}

interface Claim {
  where: string;
  sentence: string;
  clause: string;
  subject: BookletSubject;
}

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+(?=[A-Z$\\(])/);
}

/** Every booklet claim in the content, and every sentence that made none. */
function collect(): { claims: Claim[]; unplaced: { where: string; sentence: string }[] } {
  const claims: Claim[] = [];
  const unplaced: { where: string; sentence: string }[] = [];
  const seenSentence = new Set<string>();

  for (const { where, text } of learnerFacingText()) {
    for (const sentence of splitSentences(text)) {
      if (!MENTIONS_BOOKLET.test(sentence)) continue;
      const key = `${where}|${sentence}`;
      if (seenSentence.has(key)) continue;
      seenSentence.add(key);

      let placed = false;
      for (const clause of sentence.split(CLAUSE_BREAK)) {
        // A clause is only making a claim if it talks about the booklet. The
        // other half of "Know sin²θ+cos²θ=1 — it is not in the booklet" states
        // the identity; only the half after the dash classifies it.
        if (!clause?.trim() || !CLASSIFIES.test(clause)) continue;
        const probe = `${where} ||| ${clause}`;
        const matched = SUBJECTS.filter((s) => s.match.some((re) => re.test(probe)));
        if (matched.length === 0) continue;
        placed = true;
        expect(
          matched.map((m) => m.subject),
          `"${clause.trim()}" (${where}) matches more than one subject, so the rules are ambiguous`,
        ).toHaveLength(1);
        claims.push({ where, sentence, clause: clause.trim(), subject: matched[0] });
      }
      if (!placed) unplaced.push({ where, sentence: sentence.trim() });
    }
  }
  return { claims, unplaced };
}

const { claims, unplaced } = collect();

describe("booklet claims agree with the formula reference", () => {
  it("classifies every booklet claim in the content", () => {
    const stray = unplaced.filter((u) => !NOT_A_CLAIM.some((e) => e.text.test(u.sentence)));
    expect(
      stray.map((s) => `${s.where}: ${s.sentence}`),
      "these sentences mention the booklet but no rule in booklet-claims.test.ts says what they are claiming " +
        "about which formula. Add a BookletSubject (or, if it is not a classification claim at all, a NOT_A_CLAIM entry)",
    ).toEqual([]);
  });

  it("keeps every exemption pointing at something real", () => {
    for (const exemption of NOT_A_CLAIM) {
      expect(
        unplaced.some((u) => exemption.text.test(u.sentence)),
        `no sentence matches the exemption for "${exemption.because}" — the content changed, so drop the entry`,
      ).toBe(true);
    }
  });

  it("finds claims at all", () => {
    // Guards against the collector silently matching nothing — every assertion
    // below passes vacuously on an empty list.
    expect(claims.length).toBeGreaterThan(40);
  });

  it("agrees with formulae.ts about what is printed in the booklet", () => {
    const byId = new Map(formulae.map((f) => [f.id, f]));
    const wrong: string[] = [];
    for (const subject of SUBJECTS) {
      for (const id of subject.formulae) {
        const formula = byId.get(id);
        if (!formula) {
          wrong.push(`"${subject.subject}" cites ${id}, which is not in formulae.ts`);
          continue;
        }
        const classifiedAsBooklet = formula.source === "booklet";
        if (classifiedAsBooklet !== subject.inBooklet) {
          wrong.push(
            `"${subject.subject}" is written as ${subject.inBooklet ? "given" : "not given"} in the booklet, ` +
              `but formulae.ts classifies ${id} as "${formula.source}"`,
          );
        }
      }
    }
    expect(wrong).toEqual([]);
  });

  it("never says a formula is given where the content elsewhere says it is not", () => {
    const wrong: string[] = [];
    for (const claim of claims) {
      const saysNotGiven = SAYS_NOT_GIVEN.test(claim.clause);
      if (saysNotGiven === claim.subject.inBooklet) {
        wrong.push(
          `${claim.where} says ${claim.subject.subject} is ` +
            `${saysNotGiven ? "NOT in" : "in"} the booklet, which is the wrong way round: "${claim.clause}"`,
        );
      }
    }
    expect(wrong).toEqual([]);
  });

  it("leaves no rule unused", () => {
    const used = new Set(claims.map((c) => c.subject.subject));
    const dead = SUBJECTS.filter((s) => !used.has(s.subject)).map((s) => s.subject);
    expect(dead, "these rules match nothing in the content any more, so delete them").toEqual([]);
  });
});
