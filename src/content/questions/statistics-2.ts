import type { QuestionTemplate } from "@/lib/questions/types";
import { signed } from "./format";

/**
 * Further Statistics templates: regression and the danger of extrapolation,
 * mutually exclusive and independent events, critiquing a probability model,
 * and hypothesis testing — both the vocabulary and a test for the mean of a
 * normal distribution.
 */
export const statisticsFurtherQuestions: QuestionTemplate[] = [
  {
    id: "regression-extrapolation",
    paper: "statistics",
    specCode: "2.2",
    topicSlug: "data-presentation",
    ao: 3,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const a = rng.int(3, 12);
      const b = rng.int(2, 9);
      const lo = rng.int(5, 12);
      const hi = lo + rng.int(8, 20);
      const outside = hi + rng.int(6, 20);
      const predicted = a + b * outside;
      return {
        prompt: `For a sample of ${rng.int(20, 60)} plants, the regression line of height $h$ cm on water $w$ ml is\n\n$$h=${a}${signed(b, "w")}$$\n\nThe values of $w$ in the sample ranged from $${lo}$ to $${hi}$ ml.\n\nUsing the line to predict the height when $w=${outside}$ gives $${predicted}$ cm. Why is this prediction unreliable?`,
        answer: {
          type: "choice",
          value: `$w=${outside}$ is outside the range of the data, so this is extrapolation.`,
          options: [
            `$w=${outside}$ is outside the range of the data, so this is extrapolation.`,
            `The correlation is too weak for any prediction to be made.`,
            `The regression line should have been height on water, not water on height.`,
            `The sample size is too small for a regression line to be calculated.`,
          ],
        },
        hint: `Compare $w=${outside}$ with the range of $w$ that the line was actually built from.`,
        solution: [
          { mark: "M1", text: `The data covered $${lo}\\le w\\le${hi}$, but the prediction uses $w=${outside}$.`, why: "A regression line is only evidence about the region the data came from. Outside it, nothing has been observed, so the line is an assumption rather than a summary." },
          { mark: "A1", text: "Predicting outside the range of the data is extrapolation, and is unreliable.", why: `Here it is also biologically implausible: the line says more water always means a taller plant, with no limit. In reality growth levels off and then drowning sets in, so the straight line cannot keep holding.` },
        ],
        trap: "Calling any prediction from a regression line unreliable. Prediction WITHIN the range of the data — interpolation — is exactly what the line is for.",
      };
    },
  },
  {
    id: "independent-events",
    paper: "statistics",
    specCode: "3.1",
    topicSlug: "probability",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const pNum = rng.int(1, 4);
      const pDen = rng.int(pNum + 1, 8);
      const qNum = rng.int(1, 4);
      const qDen = rng.int(qNum + 1, 8);
      const p = pNum / pDen;
      const q = qNum / qDen;
      const value = p + q - p * q;
      return {
        prompt: `Two independent events $A$ and $B$ satisfy\n\n$$P(A)=\\frac{${pNum}}{${pDen}},\\qquad P(B)=\\frac{${qNum}}{${qDen}}$$\n\nFind $P(A\\cup B)$, to 3 significant figures.`,
        answer: { type: "numeric", value },
        hint: "Use the addition rule. Independence is what lets you work out the probability of both happening.",
        solution: [
          { mark: "M1", text: `Independence gives $P(A\\cap B)=P(A)\\times P(B)=\\dfrac{${pNum}}{${pDen}}\\times\\dfrac{${qNum}}{${qDen}}=${(p * q).toFixed(4)}$`, why: "Multiplying probabilities is only valid because the events are independent. For events that affect each other this step would need conditional probability instead." },
          { mark: "M1", text: `$P(A\\cup B)=P(A)+P(B)-P(A\\cap B)=${p.toFixed(4)}+${q.toFixed(4)}-${(p * q).toFixed(4)}$`, why: "Subtracting the overlap stops the outcomes in both events being counted twice." },
          { mark: "A1", text: `$P(A\\cup B)=${value.toFixed(4)}\\approx${value.toFixed(3)}$ (3 s.f.)` },
        ],
        trap: "Treating independent events as mutually exclusive and just adding. Mutually exclusive means they cannot both happen, so $P(A\\cap B)=0$ — which is the opposite of independence, where both happening is perfectly possible.",
      };
    },
  },
  {
    id: "critique-probability-model",
    paper: "statistics",
    specCode: "3.3",
    topicSlug: "probability",
    ao: 3,
    marks: 2,
    difficulty: 2,
    generate(rng) {
      const cases = [
        {
          context: "A student models the number of heads in 10 tosses of a bent coin as $B(10,0.5)$.",
          answer: "The coin is bent, so heads and tails are not equally likely and $p$ is unlikely to be $0.5$.",
          options: [
            "The coin is bent, so heads and tails are not equally likely and $p$ is unlikely to be $0.5$.",
            "The tosses are not independent of one another.",
            "The number of tosses is too small for a binomial model.",
            "The number of heads is not a discrete quantity.",
          ],
          why: "The binomial needs a fixed number of independent trials each with the same probability $p$. The tosses are still independent and $n$ is still fixed; it is the VALUE of $p$ that the bend undermines.",
        },
        {
          context:
            "A model assumes the number of people arriving at a shop in a minute is the same throughout the day.",
          answer: "Arrival rates vary with the time of day, so the assumption of a constant rate is unrealistic.",
          options: [
            "Arrival rates vary with the time of day, so the assumption of a constant rate is unrealistic.",
            "The number of arrivals cannot be counted accurately.",
            "A minute is too long an interval to model.",
            "The number of arrivals should be modelled by a continuous distribution.",
          ],
          why: "Lunchtime and the evening rush are busier than mid-morning. A refinement would be to model separate periods with their own rates.",
        },
        {
          context:
            "A student models the heights of a class of 30 students by picking names from a hat, assuming each student is equally likely to be picked, and draws 5 names WITHOUT replacement.",
          answer: "After each draw the number of names left changes, so the draws are not independent.",
          options: [
            "After each draw the number of names left changes, so the draws are not independent.",
            "Heights are continuous, so no probability model applies.",
            "Thirty students is too small a population to sample from.",
            "Each student is not equally likely to be picked.",
          ],
          why: "Without replacement, the probability changes at every draw. Each student IS equally likely on the first draw — it is the independence between draws that fails.",
        },
      ];
      const c = rng.pick(cases);
      return {
        prompt: `${c.context}\n\nWhich is the most serious criticism of this model?`,
        answer: { type: "choice", value: c.answer, options: c.options },
        hint: "Check each condition the model needs in turn, and find the one the situation actually breaks.",
        solution: [
          { mark: "M1", text: c.answer, why: c.why },
          { mark: "A1", text: "A criticism must name the specific assumption that fails and say why the situation breaks it.", why: "Marks here are for precision. 'The model is unrealistic' earns nothing; naming the assumption and the reason earns both." },
        ],
        trap: "Criticising an assumption the situation does not actually violate. Work through the conditions one at a time rather than objecting in general terms.",
      };
    },
  },
  {
    id: "hypothesis-testing-language",
    paper: "statistics",
    specCode: "5.1",
    topicSlug: "hypothesis-testing",
    ao: 2,
    marks: 2,
    difficulty: 2,
    generate(rng) {
      const claimed = rng.pick([0.2, 0.25, 0.3, 0.4, 0.5]);
      const n = rng.int(20, 50);
      const suspectsHigher = rng.chance(0.5);
      const symbol = suspectsHigher ? ">" : "<";
      return {
        prompt: `A manufacturer claims that a proportion $p=${claimed}$ of its seeds germinate. A gardener suspects the true proportion is ${suspectsHigher ? "higher" : "lower"} and plants $${n}$ seeds.\n\nWrite down the hypotheses for a suitable test.`,
        answer: {
          type: "choice",
          value: `$H_{0}: p=${claimed}$, $H_{1}: p${symbol}${claimed}$`,
          options: [
            `$H_{0}: p=${claimed}$, $H_{1}: p${symbol}${claimed}$`,
            `$H_{0}: p${symbol}${claimed}$, $H_{1}: p=${claimed}$`,
            `$H_{0}: p=${claimed}$, $H_{1}: p\\neq${claimed}$`,
            `$H_{0}: p${symbol}${claimed}$, $H_{1}: p\\neq${claimed}$`,
          ],
        },
        hint: "The null hypothesis always states the value being tested. The alternative carries the suspicion.",
        solution: [
          { mark: "B1", text: `$H_{0}: p=${claimed}$`, why: "The null hypothesis is always an equality — it is the claim being put on trial, and it must be specific enough to calculate with." },
          { mark: "B1", text: `$H_{1}: p${symbol}${claimed}$`, why: `The gardener suspects the proportion is ${suspectsHigher ? "higher" : "lower"}, which is a direction. That makes this a ONE-tail test, so the whole significance level sits in ${suspectsHigher ? "the upper" : "the lower"} tail.` },
        ],
        trap: `Using $p\\neq${claimed}$. That is a two-tail test, which splits the significance level between both tails and answers a different question from the one asked.`,
      };
    },
  },
  {
    id: "hypothesis-test-normal-mean",
    paper: "statistics",
    specCode: "5.3",
    topicSlug: "hypothesis-testing",
    ao: 2,
    marks: 4,
    difficulty: 3,
    generate(rng) {
      const mu = rng.int(40, 120);
      const sigma = rng.int(3, 12);
      const n = rng.pick([4, 9, 16, 25]);
      const shift = rng.int(1, 4);
      const xbar = mu + shift;
      // z = (x̄ − μ) / (σ / √n)
      const z = (xbar - mu) / (sigma / Math.sqrt(n));
      return {
        prompt: `The mass of a component is modelled by $X\\sim N(\\mu,\\,${sigma}^{2})$. A machine is set to $\\mu=${mu}$ g, but a supervisor suspects the mean has increased.\n\nA random sample of $${n}$ components has mean mass $${xbar}$ g.\n\nCalculate the value of the test statistic $z$, to 3 significant figures.`,
        answer: { type: "numeric", value: z },
        hint: "The test is about the mean of a SAMPLE, so the relevant standard deviation is not $\\sigma$ itself.",
        solution: [
          { mark: "M1", text: `$\\bar{X}\\sim N\\left(\\mu,\\,\\dfrac{${sigma}^{2}}{${n}}\\right)$, so the standard deviation of $\\bar{X}$ is $\\dfrac{${sigma}}{\\sqrt{${n}}}=${(sigma / Math.sqrt(n)).toFixed(4)}$`, why: `This is the step the whole topic turns on. Averaging ${n} values makes the result less variable than a single value — by a factor of $\\sqrt{${n}}$, not ${n}.` },
          { mark: "M1", text: `$z=\\dfrac{\\bar{x}-\\mu}{\\sigma/\\sqrt{n}}=\\dfrac{${xbar}-${mu}}{${(sigma / Math.sqrt(n)).toFixed(4)}}$` },
          { mark: "A1", text: `$z=${z.toFixed(4)}\\approx${z.toFixed(3)}$ (3 s.f.)` },
          { mark: "A1", text: `Compare with the critical value: for a one-tail test at $5\\%$, reject $H_{0}$ if $z>1.645$. Here $z=${z.toFixed(3)}$, so ${z > 1.645 ? "there is evidence that the mean has increased" : "there is insufficient evidence that the mean has increased"}.`, why: "The conclusion must be in context and must not overclaim. A test never proves $H_{0}$ true — it either finds evidence against it or it does not." },
        ],
        trap: `Dividing by $${sigma}$ instead of $\\dfrac{${sigma}}{\\sqrt{${n}}}$. That tests whether a SINGLE component is unusual, which is a different and much weaker question.`,
      };
    },
  },
];
