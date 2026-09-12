import type { QuestionTemplate } from "@/lib/questions/types";
import { pureAlgebraQuestions } from "./pure-algebra";
import { pureCalculusQuestions } from "./pure-calculus";
import { pureNumericalQuestions } from "./pure-numerical";
import { pureSequencesQuestions } from "./pure-sequences";
import { pureTrigonometryQuestions } from "./pure-trigonometry";
import { pureDifferentiationQuestions } from "./pure-differentiation";
import { pureIntegrationQuestions } from "./pure-integration";
import { pureFunctionsQuestions } from "./pure-functions";
import { pureExponentialsQuestions } from "./pure-exponentials";
import { pureVectorsQuestions } from "./pure-vectors";
import { statisticsQuestions } from "./statistics";
import { statisticsFurtherQuestions } from "./statistics-2";
import { mechanicsQuestions } from "./mechanics";
import { mechanicsFurtherQuestions } from "./mechanics-2";

/**
 * The question bank.
 *
 * Every one of the 89 spec points has at least one template, which matters
 * more than it sounds: the scheduler can only ever surface a spec point that
 * has questions, so an uncovered point is not merely thin, it is invisible to
 * spaced repetition entirely. A test asserts this, so a spec point added
 * without questions fails the build rather than silently disappearing.
 *
 * Depth is still uneven — some points have one template and some have several
 * — and `coverageBySpecPoint` keeps that visible in the UI.
 */
export const questionTemplates: QuestionTemplate[] = [
  ...pureAlgebraQuestions,
  ...pureCalculusQuestions,
  ...pureNumericalQuestions,
  ...pureSequencesQuestions,
  ...pureTrigonometryQuestions,
  ...pureDifferentiationQuestions,
  ...pureIntegrationQuestions,
  ...pureFunctionsQuestions,
  ...pureExponentialsQuestions,
  ...pureVectorsQuestions,
  ...statisticsQuestions,
  ...statisticsFurtherQuestions,
  ...mechanicsQuestions,
  ...mechanicsFurtherQuestions,
];

export {
  pureAlgebraQuestions,
  pureCalculusQuestions,
  pureNumericalQuestions,
  pureSequencesQuestions,
  pureTrigonometryQuestions,
  pureDifferentiationQuestions,
  pureIntegrationQuestions,
  pureFunctionsQuestions,
  pureExponentialsQuestions,
  pureVectorsQuestions,
  statisticsQuestions,
  statisticsFurtherQuestions,
  mechanicsQuestions,
  mechanicsFurtherQuestions,
};
