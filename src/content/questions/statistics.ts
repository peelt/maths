import type { QuestionTemplate } from "@/lib/questions/types";
import { binomialPmf, choose, normalCdf, standardDeviation, sxx } from "./numeric";
import { signed } from "./format";

/**
 * Question templates for Paper 3, Section A: Statistics.
 *
 * Statistics on this paper is unusually rich in written-answer marks —
 * sampling, choosing a model, and stating a conclusion in context are all
 * worth real marks and are all routinely thrown away. Several of these are
 * multiple choice for exactly that reason: the skill being tested is picking
 * the correct STATEMENT, not doing arithmetic.
 */
export const statisticsQuestions: QuestionTemplate[] = [
  {
    id: "sampling-method",
    paper: "statistics",
    specCode: "1.1",
    topicSlug: "statistical-sampling",
    ao: 2,
    marks: 1,
    difficulty: 1,
    generate(rng) {
      const cases = [
        {
          scenario:
            "A head teacher lists all 900 students alphabetically, numbers them 1 to 900, then uses a random number generator to pick 60 of them.",
          answer: "Simple random sampling",
          why: "Every student has an equal chance of selection, and every possible sample of 60 is equally likely. That is the defining property.",
        },
        {
          scenario:
            "A factory manager tests every 20th item coming off a production line.",
          answer: "Systematic sampling",
          why: "A fixed interval through an ordered list. Quick and easy, but it can go badly wrong if the list has a repeating pattern matching the interval.",
        },
        {
          scenario:
            "A school has 600 students in Year 12 and 400 in Year 13. A sample of 50 is taken, made up of 30 from Year 12 and 20 from Year 13.",
          answer: "Stratified sampling",
          why: "The sample mirrors the proportions in the population — 60% and 40% — so each group is properly represented.",
        },
        {
          scenario:
            "A researcher stands outside a supermarket and interviews the first 40 people who walk past.",
          answer: "Opportunity sampling",
          why: "Whoever happens to be available. Quick and cheap, but very likely to be unrepresentative — the people outside a supermarket at that hour are not a cross-section of anything.",
        },
        {
          scenario:
            "An interviewer is told to question 25 men and 25 women, and stops once each quota is filled.",
          answer: "Quota sampling",
          why: "Fixed numbers per category, but the people within each category are not chosen randomly, so bias can still creep in.",
        },
      ];
      const chosen = rng.pick(cases);
      const options = rng.sample(
        ["Simple random sampling", "Systematic sampling", "Stratified sampling", "Opportunity sampling", "Quota sampling"],
        5,
      );
      return {
        prompt: `${chosen.scenario}\n\nWhich sampling method is this?`,
        answer: { type: "choice", value: chosen.answer, options },
        hint: "Ask two questions: is there a fixed interval, and are the proportions of the population being preserved?",
        solution: [{ mark: "B1", text: chosen.answer, why: chosen.why }],
        trap: "All five methods are named in the specification, and you need an advantage AND a disadvantage for each. Answers must be in context — 'it is biased' on its own scores nothing.",
      };
    },
  },
  {
    id: "standard-deviation-summary",
    paper: "statistics",
    specCode: "2.3",
    topicSlug: "data-presentation",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const n = rng.int(6, 9);
      const values = Array.from({ length: n }, () => rng.int(2, 40));
      const sum = values.reduce((a, b) => a + b, 0);
      const sumSquares = values.reduce((a, b) => a + b * b, 0);
      const sd = standardDeviation(values);
      return {
        prompt: `For a set of ${n} values, $\\sum x=${sum}$ and $\\sum x^{2}=${sumSquares}$.\n\nFind the standard deviation, to 3 significant figures.`,
        answer: { type: "numeric", value: sd },
        hint: "Use $S_{xx}=\\sum x^{2}-\\dfrac{(\\sum x)^{2}}{n}$, then divide by $n$ and take the square root.",
        solution: [
          {
            mark: "M1",
            text: `$S_{xx}=${sumSquares}-\\dfrac{${sum}^{2}}{${n}}=${sxx(values).toFixed(3)}$`,
            why: "This form of Sxx is in the formula booklet, and is the one to use when you are handed summary statistics rather than raw data.",
          },
          { mark: "M1", text: `$\\sigma=\\sqrt{\\dfrac{${sxx(values).toFixed(3)}}{${n}}}$`, why: "The specification divides by n, not by n - 1. A spreadsheet's default STDEV uses n - 1 and will give a different answer." },
          { mark: "A1", text: `$\\sigma=${sd.toFixed(3)}$ (3 s.f.)` },
        ],
        trap: "Dividing by n - 1. The exam wants the population standard deviation unless it explicitly says otherwise.",
      };
    },
  },
  {
    id: "coding-standard-deviation",
    paper: "statistics",
    specCode: "2.3",
    topicSlug: "data-presentation",
    ao: 2,
    marks: 3,
    difficulty: 3,
    generate(rng) {
      const a = rng.int(10, 60);
      const b = rng.pick([2, 4, 5, 10]);
      const meanY = rng.int(3, 12);
      const sdY = rng.int(2, 6);
      const askMean = rng.chance(0.5);
      const meanX = b * meanY + a;
      const sdX = b * sdY;
      return {
        prompt: `The coding $y=\\dfrac{x-${a}}{${b}}$ is used on a set of data.\n\nThe mean of $y$ is ${meanY} and the standard deviation of $y$ is ${sdY}.\n\nFind the ${askMean ? "mean" : "standard deviation"} of $x$.`,
        answer: { type: "numeric", value: askMean ? meanX : sdX },
        hint: askMean
          ? "Rearrange the coding to make $x$ the subject, then apply it to the mean."
          : "Adding or subtracting a constant slides the data along without spreading it out. Only the multiplier changes the spread.",
        solution: askMean
          ? [
              { mark: "M1", text: `$x=${b}y${signed(a)}$` },
              { mark: "M1", text: `$\\bar{x}=${b}\\times${meanY}${signed(a)}$` },
              { mark: "A1", text: `$\\bar{x}=${meanX}$`, why: "The mean is affected by BOTH the multiplication and the addition." },
            ]
          : [
              { mark: "B1", text: `Adding ${a} shifts every value equally, so it does not change the spread at all.`, why: "This is the whole idea being tested. Standard deviation measures spread about the mean, and sliding everything along leaves that spread untouched." },
              { mark: "M1", text: `$\\sigma_{x}=${b}\\times\\sigma_{y}=${b}\\times${sdY}$` },
              { mark: "A1", text: `$\\sigma_{x}=${sdX}$` },
            ],
        trap: askMean
          ? "Forgetting to multiply before adding — the order matters when you undo the coding."
          : `Adding the ${a} to the standard deviation. Only the multiplier affects spread.`,
      };
    },
  },
  {
    id: "outlier-boundary",
    paper: "statistics",
    specCode: "2.4",
    topicSlug: "data-presentation",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const q1 = rng.int(10, 40);
      const iqr = rng.int(6, 20);
      const q3 = q1 + iqr;
      const lower = rng.chance(0.5);
      const boundary = lower ? q1 - 1.5 * iqr : q3 + 1.5 * iqr;
      return {
        prompt: `For a set of data, $Q_{1}=${q1}$ and $Q_{3}=${q3}$.\n\nAn outlier is defined as any value more than $1.5\\times\\text{IQR}$ ${lower ? "below $Q_{1}$" : "above $Q_{3}$"}.\n\nFind the ${lower ? "lower" : "upper"} boundary for outliers.`,
        answer: { type: "numeric", value: boundary },
        hint: "Work out the interquartile range first.",
        solution: [
          { mark: "M1", text: `$\\text{IQR}=${q3}-${q1}=${iqr}$` },
          { mark: "M1", text: `$1.5\\times${iqr}=${1.5 * iqr}$` },
          {
            mark: "A1",
            text: lower ? `$${q1}-${1.5 * iqr}=${boundary}$` : `$${q3}+${1.5 * iqr}=${boundary}$`,
            why: "The rule is always given in the question. Never import a remembered rule — a question may well use mean ± 3 standard deviations instead.",
          },
        ],
        trap: "Using a rule you have memorised rather than the one printed in the question.",
      };
    },
  },
  {
    id: "histogram-frequency",
    paper: "statistics",
    specCode: "2.1",
    topicSlug: "data-presentation",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const width = rng.pick([4, 5, 8, 10, 20]);
      const density = rng.pick([0.5, 1.5, 2.5, 3, 4.5]);
      const frequency = width * density;
      const start = rng.int(0, 40);
      return {
        prompt: `In a histogram, the bar covering $${start}\\leqslant x<${start + width}$ has a frequency density of ${density}.\n\nFind the frequency for this class.`,
        answer: { type: "numeric", value: frequency },
        hint: "In a histogram, area represents frequency.",
        solution: [
          { mark: "B1", text: "Area represents frequency, so frequency = class width × frequency density.", why: "This one sentence is the whole of histograms. Everything else follows from it." },
          { mark: "M1", text: `Class width $=${start + width}-${start}=${width}$` },
          { mark: "A1", text: `Frequency $=${width}\\times${density}=${frequency}$` },
        ],
        trap: "Reading the bar height as the frequency. On a histogram with unequal class widths, the height is the DENSITY — that is precisely what the question is testing.",
      };
    },
  },
  {
    id: "conditional-probability",
    paper: "statistics",
    specCode: "3.2",
    topicSlug: "probability",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      // A two-way table, so every probability in the question is exact.
      const both = rng.int(8, 25);
      const onlyB = rng.int(8, 25);
      const onlyA = rng.int(8, 25);
      const neither = rng.int(8, 25);
      const total = both + onlyA + onlyB + neither;
      const bTotal = both + onlyB;
      const answer = both / bTotal;
      return {
        prompt: `In a group of ${total} students, ${both + onlyA} study Maths and ${bTotal} study Physics. ${both} study both.\n\nA student is chosen at random. Given that they study Physics, find the probability that they also study Maths.\n\nGive your answer to 3 significant figures.`,
        answer: { type: "numeric", value: answer },
        hint: "Given that restricts you to a smaller group. How many students are you now choosing from?",
        solution: [
          {
            mark: "M1",
            text: `$\\mathrm{P}(M\\mid P)=\\dfrac{\\mathrm{P}(M\\cap P)}{\\mathrm{P}(P)}$`,
            why: "Given that means the sample space shrinks to only the Physics students. The formula is in the booklet; identifying which event is the condition is the mark.",
          },
          { mark: "M1", text: `$=\\dfrac{${both}/${total}}{${bTotal}/${total}}=\\dfrac{${both}}{${bTotal}}$`, why: "The totals cancel, which is why you can just count within the restricted group." },
          { mark: "A1", text: `$=${answer.toFixed(4)}$` },
        ],
        trap: `Dividing by the whole group of ${total} instead of by the ${bTotal} Physics students.`,
      };
    },
  },
  {
    id: "binomial-probability",
    paper: "statistics",
    specCode: "4.1",
    topicSlug: "statistical-distributions",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const n = rng.int(8, 20);
      const p = rng.pick([0.15, 0.2, 0.25, 0.3, 0.4, 0.5]);
      const k = rng.int(2, Math.min(6, n - 1));
      const value = binomialPmf(n, p, k);
      return {
        prompt: `The random variable $X\\sim\\mathrm{B}(${n},\\,${p})$.\n\nFind $\\mathrm{P}(X=${k})$, giving your answer to 3 significant figures.`,
        answer: { type: "numeric", value },
        hint: "Use the binomial probability formula, or your calculator's binomial PD function.",
        solution: [
          {
            mark: "M1",
            text: `$\\mathrm{P}(X=${k})=\\binom{${n}}{${k}}(${p})^{${k}}(${(1 - p).toFixed(2)})^{${n - k}}$`,
            why: "The formula is in the booklet. In the exam you would normally get this straight from the calculator's binomial PD function — worth finding it on his actual model before the exam.",
          },
          { mark: "M1", text: `$=${choose(n, k)}\\times${Math.pow(p, k).toExponential(3)}\\times${Math.pow(1 - p, n - k).toExponential(3)}$` },
          { mark: "A1", text: `$=${value.toFixed(4)}$` },
        ],
        trap: "Confusing P(X = k) with P(X ≤ k). The calculator has separate PD and CD functions, and choosing the wrong one is a very common slip.",
      };
    },
  },
  {
    id: "binomial-conditions",
    paper: "statistics",
    specCode: "4.3",
    topicSlug: "statistical-distributions",
    ao: 2,
    marks: 1,
    difficulty: 2,
    generate(rng) {
      const cases = [
        {
          scenario:
            "A bag contains 5 red and 5 blue counters. Ten counters are drawn WITHOUT replacement, and X is the number of red counters drawn.",
          answer: "The probability of success is not constant",
          why: "Removing a counter changes the composition of the bag, so the probability changes from draw to draw — and the draws are not independent. Without replacement almost always rules out a binomial model.",
        },
        {
          scenario:
            "A student keeps rolling a fair die until they get a six, and X is the number of rolls needed.",
          answer: "The number of trials is not fixed",
          why: "A binomial model needs a fixed number of trials decided in advance. Here the number of rolls is itself the random quantity.",
        },
        {
          scenario:
            "A doctor records whether each of 50 randomly chosen patients has a particular condition, where 3% of the population has it.",
          answer: "A binomial model is appropriate here",
          why: "Fixed number of trials, two outcomes, constant probability, and independent patients. All four conditions hold.",
        },
      ];
      const chosen = rng.pick(cases);
      const options = rng.sample(
        [
          "The probability of success is not constant",
          "The number of trials is not fixed",
          "A binomial model is appropriate here",
          "There are more than two possible outcomes",
        ],
        4,
      );
      return {
        prompt: `${chosen.scenario}\n\nWhy is a binomial model inappropriate — or is it appropriate?`,
        answer: { type: "choice", value: chosen.answer, options },
        hint: "The four conditions: a fixed number of trials, two outcomes, a constant probability of success, and independent trials.",
        solution: [{ mark: "B1", text: chosen.answer, why: chosen.why }],
        trap: "These are pure reasoning marks and are given away constantly. Learn the four conditions as a checklist and test the scenario against each one.",
      };
    },
  },
  {
    id: "normal-probability",
    paper: "statistics",
    specCode: "4.2",
    topicSlug: "statistical-distributions",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const mu = rng.int(40, 200);
      const sigma = rng.int(4, 20);
      const offset = rng.pick([-2, -1.5, -1, 1, 1.5, 2]);
      const x = Math.round(mu + offset * sigma);
      const below = rng.chance(0.6);
      const p = below ? normalCdf(x, mu, sigma) : 1 - normalCdf(x, mu, sigma);
      return {
        prompt: `The random variable $X\\sim\\mathrm{N}(${mu},\\,${sigma}^{2})$.\n\nFind $\\mathrm{P}(X${below ? "<" : ">"}${x})$, giving your answer to 3 significant figures.`,
        answer: { type: "numeric", value: p },
        hint: "Use the normal CD function on your calculator. Sketching the curve first tells you whether to expect an answer above or below 0.5.",
        solution: [
          {
            mark: "M1",
            text: `Standardising: $z=\\dfrac{${x}-${mu}}{${sigma}}=${((x - mu) / sigma).toFixed(3)}$`,
            why: "Standardising is on the memorise list. In practice the calculator will take the mean and standard deviation directly, but you still need this for inverse problems.",
          },
          {
            mark: "M1",
            text: below
              ? `$\\mathrm{P}(X<${x})=\\Phi(${((x - mu) / sigma).toFixed(3)})$`
              : `$\\mathrm{P}(X>${x})=1-\\Phi(${((x - mu) / sigma).toFixed(3)})$`,
            why: below ? undefined : "The calculator gives you the area to the LEFT, so 'greater than' means subtracting from 1.",
          },
          { mark: "A1", text: `$=${p.toFixed(4)}$` },
        ],
        trap: "A quick sketch catches the commonest error. If the value is above the mean, P(X < value) must be more than 0.5 — if your answer is not, you have the tail the wrong way round.",
      };
    },
  },
  {
    id: "hypothesis-test-conclusion",
    paper: "statistics",
    specCode: "5.2",
    topicSlug: "hypothesis-testing",
    ao: 2,
    marks: 2,
    difficulty: 3,
    generate(rng) {
      const significance = rng.pick([5, 10, 1]);
      const reject = rng.chance(0.5);
      const pValue = reject ? significance / 100 - 0.017 : significance / 100 + 0.043;
      const context = rng.pick([
        { claim: "the proportion of faulty items has decreased", noun: "faulty items" },
        { claim: "the proportion of students passing has increased", noun: "students passing" },
        { claim: "the coin is biased towards heads", noun: "heads" },
      ]);

      const correct = reject
        ? `Reject $H_{0}$. There is sufficient evidence at the ${significance}% level to suggest that ${context.claim}.`
        : `Do not reject $H_{0}$. There is insufficient evidence at the ${significance}% level to suggest that ${context.claim}.`;

      const options = rng.sample(
        [
          correct,
          reject
            ? `Accept $H_{1}$. The proportion of ${context.noun} has definitely changed.`
            : `Accept $H_{0}$. The proportion of ${context.noun} has not changed.`,
          reject
            ? `Reject $H_{0}$. This proves that ${context.claim}.`
            : `Reject $H_{0}$. There is sufficient evidence at the ${significance}% level to suggest that ${context.claim}.`,
          `There is not enough information to reach a conclusion.`,
        ],
        4,
      );

      return {
        prompt: `A hypothesis test is carried out at the ${significance}% significance level. The p-value is ${pValue.toFixed(3)}.\n\nWhich conclusion is correctly stated?`,
        answer: { type: "choice", value: correct, options },
        hint: `Compare the p-value with ${(significance / 100).toFixed(2)}. Then think very carefully about the wording.`,
        solution: [
          {
            mark: "M1",
            text: `$${pValue.toFixed(3)}${reject ? "<" : ">"}${(significance / 100).toFixed(2)}$, so ${reject ? "reject" : "do not reject"} $H_{0}$.`,
            why: "A p-value smaller than the significance level means the result is unlikely enough under the null hypothesis to reject it.",
          },
          {
            mark: "A1",
            text: correct,
            why: "The final mark is almost always for the contextual sentence. Two rules: never write 'accept H0' — write 'insufficient evidence to reject' — and never claim something is 'proved'. A hypothesis test provides evidence, not proof.",
          },
        ],
        trap: "Writing 'accept the null hypothesis'. Examiners penalise it specifically. Failing to reject is not the same as demonstrating the null hypothesis is true.",
      };
    },
  },
];
