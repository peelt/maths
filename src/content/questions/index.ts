import type { QuestionTemplate } from "@/lib/questions/types";
import { pureAlgebraQuestions } from "./pure-algebra";
import { pureCalculusQuestions } from "./pure-calculus";
import { pureNumericalQuestions } from "./pure-numerical";
import { pureSequencesQuestions } from "./pure-sequences";
import { pureTrigonometryQuestions } from "./pure-trigonometry";
import { pureDifferentiationQuestions } from "./pure-differentiation";
import { pureIntegrationQuestions } from "./pure-integration";
import { statisticsQuestions } from "./statistics";
import { mechanicsQuestions } from "./mechanics";

/**
 * The question bank.
 *
 * Coverage is deliberately uneven: the Year 1 Pure spec points that are
 * taught first, and that everything later depends on, are covered first.
 * `coverageBySpecPoint` makes the gaps visible in the UI rather than hiding
 * them, so it is always honest about what can and cannot be practised yet.
 */
export const questionTemplates: QuestionTemplate[] = [
  ...pureAlgebraQuestions,
  ...pureCalculusQuestions,
  ...pureNumericalQuestions,
  ...pureSequencesQuestions,
  ...pureTrigonometryQuestions,
  ...pureDifferentiationQuestions,
  ...pureIntegrationQuestions,
  ...statisticsQuestions,
  ...mechanicsQuestions,
];

export {
  pureAlgebraQuestions,
  pureCalculusQuestions,
  pureNumericalQuestions,
  pureSequencesQuestions,
  pureTrigonometryQuestions,
  pureDifferentiationQuestions,
  pureIntegrationQuestions,
  statisticsQuestions,
  mechanicsQuestions,
};
