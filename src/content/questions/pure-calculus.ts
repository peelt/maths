import type { QuestionTemplate } from "@/lib/questions/types";
import { fraction, leading, signed } from "./format";

/**
 * Question templates for Year 1 Pure: exponentials and logarithms,
 * differentiation, integration and vectors.
 */
export const pureCalculusQuestions: QuestionTemplate[] = [
  {
    id: "log-laws-solve",
    paper: "pure",
    specCode: "6.4",
    topicSlug: "exponentials-and-logarithms",
    ao: 1,
    marks: 4,
    difficulty: 3,
    generate(rng) {
      // Chosen so that p(p + d) is an exact power of 2 and the root is tidy.
      const cases = [
        { p: 2, d: 2, t: 3 },
        { p: 2, d: 6, t: 4 },
        { p: 4, d: 4, t: 5 },
        { p: 4, d: 12, t: 6 },
        { p: 1, d: 1, t: 1 },
        { p: 8, d: 8, t: 7 },
      ];
      const { p, d, t } = rng.pick(cases);
      return {
        prompt: `Solve $\\log_{2}x+\\log_{2}(x+${d})=${t}$.`,
        answer: { type: "numeric", value: p },
        hint: "Combine the two logarithms into one using the addition law, then undo the logarithm.",
        solution: [
          { mark: "M1", text: `$\\log_{2}\\big(x(x+${d})\\big)=${t}$`, why: "Adding logs of the same base multiplies the arguments. This law must be recalled — it is not in the booklet." },
          { mark: "M1", text: `$x(x+${d})=2^{${t}}=${Math.pow(2, t)}$`, why: "Undoing the logarithm — this is the definition of a log in action." },
          { mark: "A1", text: `$x^{2}+${d}x-${Math.pow(2, t)}=0 \\Rightarrow (x-${p})(x+${p + d})=0$` },
          { mark: "A1", text: `$x=${p}$, rejecting $x=${-(p + d)}$ because you cannot take the logarithm of a negative number.`, why: "That rejection is a real mark. Always check solutions against the domain of the original logarithms." },
        ],
        trap: `Giving both roots. $x=${-(p + d)}$ makes $\\log_{2}x$ undefined, so it must be rejected and you must SAY why.`,
      };
    },
  },
  {
    id: "exponential-equation",
    paper: "pure",
    specCode: "6.5",
    topicSlug: "exponentials-and-logarithms",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const a = rng.int(2, 6);
      const b = rng.int(10, 400);
      const x = Math.log(b) / Math.log(a);
      return {
        prompt: `Solve $${a}^{x}=${b}$, giving your answer to 3 significant figures.`,
        answer: { type: "numeric", value: x },
        hint: "Take logarithms of both sides. The power law then brings the $x$ down to where you can reach it.",
        solution: [
          { mark: "M1", text: `$\\log(${a}^{x})=\\log ${b} \\Rightarrow x\\log ${a}=\\log ${b}$`, why: "Taking logs of both sides is the standard move whenever the unknown is in an exponent. The power law is what makes it useful." },
          { mark: "M1", text: `$x=\\dfrac{\\log ${b}}{\\log ${a}}$` },
          { mark: "A1", text: `$x=${x.toFixed(3)}$ (3 s.f.)` },
        ],
        trap: `Writing $\\dfrac{\\log ${b}}{\\log ${a}}$ as $\\log\\dfrac{${b}}{${a}}$. Those are completely different — a quotient of logs is not the log of a quotient.`,
      };
    },
  },
  {
    id: "exponential-model",
    paper: "pure",
    specCode: "6.7",
    topicSlug: "exponentials-and-logarithms",
    ao: 3,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const A = rng.int(2, 9) * 100;
      const growing = rng.chance(0.6);
      const k = (growing ? 1 : -1) * rng.pick([0.03, 0.05, 0.08, 0.12]);
      const t = rng.int(5, 20);
      const value = A * Math.exp(k * t);
      const context = growing
        ? { noun: "The number of bacteria in a culture", unit: "bacteria" }
        : { noun: "The mass of a radioactive sample", unit: "grams" };
      return {
        prompt: `${context.noun} is modelled by $N=${A}e^{${k}t}$, where $t$ is measured in hours.\n\nFind $N$ when $t=${t}$, to the nearest whole number.`,
        answer: { type: "numeric", value: Math.round(value), tolerance: 1 },
        hint: `Substitute $t=${t}$ and evaluate. Keep full accuracy in your calculator until the very last step.`,
        solution: [
          { mark: "M1", text: `$N=${A}e^{${k}\\times${t}}=${A}e^{${(k * t).toFixed(3)}}$` },
          { mark: "A1", text: `$N=${value.toFixed(2)}$` },
          { mark: "A1", text: `$N\\approx${Math.round(value)}$ ${context.unit}`, why: `The value of $k$ is ${growing ? "positive, so this is growth" : "negative, so this is decay"} — worth stating, because interpreting the model is where the AO3 marks live.` },
        ],
        trap: "Rounding partway through. Carry the full value in the calculator and round only at the end.",
      };
    },
  },
  {
    id: "differentiate-polynomial",
    paper: "pure",
    specCode: "7.2",
    topicSlug: "differentiation",
    ao: 1,
    marks: 2,
    difficulty: 1,
    generate(rng) {
      const a = rng.nonZeroInt(-4, 5);
      const b = rng.nonZeroInt(-6, 6);
      const c = rng.nonZeroInt(-8, 8);
      const d = rng.nonZeroInt(-9, 9);
      return {
        prompt: `Given that $y=${leading(a, "x^{3}")}${signed(b, "x^{2}")}${signed(c, "x")}${signed(d)}$, find $\\dfrac{dy}{dx}$.`,
        answer: { type: "expression", value: `${3 * a}*x^2 + ${2 * b}*x + ${c}` },
        hint: "Multiply by the power, then reduce the power by one. The constant term differentiates to zero.",
        solution: [
          { mark: "M1", text: `Differentiating term by term: $${leading(3 * a, "x^{2}")}${signed(2 * b, "x")}${signed(c)}$`, why: "Each term follows the same rule: bring the power down as a multiplier, then subtract one from the power." },
          { mark: "A1", text: `$\\dfrac{dy}{dx}=${leading(3 * a, "x^{2}")}${signed(2 * b, "x")}${signed(c)}$`, why: `The constant $${d}$ vanishes, because a constant has no gradient.` },
        ],
      };
    },
  },
  {
    id: "differentiate-negative-powers",
    paper: "pure",
    specCode: "7.2",
    topicSlug: "differentiation",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const a = rng.int(2, 5);
      const b = rng.nonZeroInt(-6, 6);
      return {
        prompt: `Given that $y=${a}x^{3}+\\dfrac{${b}}{x}$, find $\\dfrac{dy}{dx}$.`,
        answer: { type: "expression", value: `${3 * a}*x^2 - (${b})/x^2` },
        hint: "Rewrite the fraction as a negative power before differentiating. That first step is where the marks are won or lost.",
        solution: [
          { mark: "M1", text: `$y=${a}x^{3}${signed(b, "x^{-1}")}$`, why: "You cannot differentiate a fraction directly with the power rule — rewrite it as a power of x first. Almost every lost mark in this topic happens here." },
          { mark: "M1", text: `$\\dfrac{dy}{dx}=${3 * a}x^{2}${signed(-b, "x^{-2}")}$`, why: `Applying the rule to $x^{-1}$: the power $-1$ comes down and the new power is $-2$.` },
          { mark: "A1", text: `$\\dfrac{dy}{dx}=${3 * a}x^{2}-\\dfrac{${b}}{x^{2}}$` },
        ],
        trap: "Getting the sign wrong on the negative power. Differentiating $x^{-1}$ gives $-x^{-2}$ — the minus comes from the power coming down.",
      };
    },
  },
  {
    id: "tangent-gradient",
    paper: "pure",
    specCode: "7.3",
    topicSlug: "differentiation",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const a = rng.nonZeroInt(-3, 4);
      const b = rng.nonZeroInt(-6, 6);
      const c = rng.nonZeroInt(-8, 8);
      const p = rng.nonZeroInt(-4, 4);
      const gradient = 2 * a * p + b;
      return {
        prompt: `A curve has equation $y=${leading(a, "x^{2}")}${signed(b, "x")}${signed(c)}$.\n\nFind the gradient of the tangent to the curve at the point where $x=${p}$.`,
        answer: { type: "numeric", value: gradient },
        hint: "Differentiate first, then substitute. Never substitute before differentiating.",
        solution: [
          { mark: "M1", text: `$\\dfrac{dy}{dx}=${leading(2 * a, "x")}${signed(b)}$` },
          { mark: "M1", text: `At $x=${p}$: $\\dfrac{dy}{dx}=${2 * a}(${p})${signed(b)}$` },
          { mark: "A1", text: `Gradient $=${gradient}$`, why: `If the question had asked for the NORMAL, the answer would be $${fraction(-1, gradient)}$ — the negative reciprocal.` },
        ],
        trap: "Substituting the x value into the original equation instead of into the derivative. That gives you the y coordinate, not the gradient.",
      };
    },
  },
  {
    id: "stationary-point-cubic",
    paper: "pure",
    specCode: "7.3",
    topicSlug: "differentiation",
    ao: 2,
    marks: 4,
    difficulty: 3,
    generate(rng) {
      const t = rng.int(1, 5);
      const c = t * t;
      return {
        prompt: `A curve has equation $y=x^{3}-${3 * c}x$.\n\nFind the $x$-coordinate of the local MAXIMUM point.`,
        answer: { type: "numeric", value: -t },
        hint: "Stationary points are where the gradient is zero. Then use the second derivative to tell maximum from minimum.",
        solution: [
          { mark: "M1", text: `$\\dfrac{dy}{dx}=3x^{2}-${3 * c}=0$`, why: "Stationary means gradient zero — this is always the starting point." },
          { mark: "A1", text: `$x^{2}=${c} \\Rightarrow x=\\pm${t}$`, why: "Two stationary points. The question asks which is which, so you are not finished." },
          { mark: "M1", text: `$\\dfrac{d^{2}y}{dx^{2}}=6x$`, why: "The second derivative test: negative means maximum, positive means minimum." },
          { mark: "A1", text: `At $x=-${t}$: $\\dfrac{d^{2}y}{dx^{2}}=${-6 * t}<0$, so this is the maximum.`, why: `At $x=${t}$ the second derivative is $${6 * t}>0$, which is the minimum. For a positive cubic the maximum is always the LEFT-hand stationary point.` },
        ],
        trap: "Finding both stationary points and then guessing which is the maximum. The second derivative test takes one line and secures the mark.",
      };
    },
  },
  {
    id: "definite-integral",
    paper: "pure",
    specCode: "8.3",
    topicSlug: "integration",
    ao: 1,
    marks: 4,
    difficulty: 2,
    generate(rng) {
      const a = rng.pick([3, 6, 9]);
      const b = rng.pick([2, 4, 6]);
      const u = rng.int(2, 4);
      const value = (a / 3) * u ** 3 + (b / 2) * u ** 2;
      return {
        prompt: `Evaluate $\\displaystyle\\int_{0}^{${u}}\\left(${a}x^{2}+${b}x\\right)\\,dx$.`,
        answer: { type: "numeric", value },
        hint: "Integrate each term by raising the power and dividing by the new power, then substitute the limits.",
        solution: [
          { mark: "M1", text: `$\\displaystyle\\int\\left(${a}x^{2}+${b}x\\right)dx=${a / 3}x^{3}+${b / 2}x^{2}$`, why: "Add one to the power, then divide by the new power. No constant of integration is needed for a definite integral." },
          { mark: "M1", text: `$=\\Big[${a / 3}x^{3}+${b / 2}x^{2}\\Big]_{0}^{${u}}$` },
          { mark: "A1", text: `$=\\left(${a / 3}(${u})^{3}+${b / 2}(${u})^{2}\\right)-(0)$` },
          { mark: "A1", text: `$=${(a / 3) * u ** 3}+${(b / 2) * u ** 2}=${value}$` },
        ],
        trap: "Forgetting to substitute the lower limit. It is zero here, but assuming that in general loses marks.",
      };
    },
  },
  {
    id: "area-under-curve",
    paper: "pure",
    specCode: "8.3",
    topicSlug: "integration",
    ao: 2,
    marks: 4,
    difficulty: 3,
    generate(rng) {
      const k = rng.int(2, 7);
      const area = (k * k * k) / 6;
      return {
        prompt: `The curve $C$ has equation $y=x(${k}-x)$.\n\nFind the exact area of the finite region bounded by $C$ and the $x$-axis.`,
        answer: { type: "numeric", value: area, requireExact: false },
        hint: "Find where the curve crosses the x-axis first — those crossings are your limits.",
        solution: [
          { mark: "B1", text: `$y=0$ when $x=0$ or $x=${k}$, so these are the limits.`, why: "The region is bounded by the curve and the axis, so the limits are the x-intercepts. Finding them is a mark in its own right." },
          { mark: "M1", text: `Area $=\\displaystyle\\int_{0}^{${k}}\\left(${k}x-x^{2}\\right)dx$`, why: "Expand the bracket before integrating — you cannot integrate a product term by term as it stands." },
          { mark: "M1", text: `$=\\Big[\\tfrac{${k}}{2}x^{2}-\\tfrac{1}{3}x^{3}\\Big]_{0}^{${k}}$` },
          { mark: "A1", text: `$=\\tfrac{${k}}{2}(${k * k})-\\tfrac{1}{3}(${k ** 3})=${(k ** 3) / 2}-${(k ** 3) / 3}=${area}$` },
        ],
        trap: "This curve is above the axis between the roots, so the integral is positive. If a region lies BELOW the axis the integral comes out negative and you must take the magnitude.",
      };
    },
  },
  {
    id: "vector-magnitude",
    paper: "pure",
    specCode: "10.2",
    topicSlug: "vectors",
    ao: 1,
    marks: 2,
    difficulty: 1,
    generate(rng) {
      const triples = [
        [3, 4, 5],
        [6, 8, 10],
        [5, 12, 13],
        [8, 15, 17],
        [7, 24, 25],
        [9, 12, 15],
      ];
      const threeD = [
        [2, 3, 6, 7],
        [1, 2, 2, 3],
        [2, 6, 9, 11],
        [4, 4, 7, 9],
        [6, 6, 7, 11],
      ];
      if (rng.chance(0.5)) {
        const [x, y, m] = rng.pick(triples);
        const sx = rng.chance(0.5) ? x : -x;
        const sy = rng.chance(0.5) ? y : -y;
        return {
          prompt: `Find the magnitude of the vector $\\mathbf{a}=${leading(sx, "\\mathbf{i}")}${signed(sy, "\\mathbf{j}")}$.`,
          answer: { type: "numeric", value: m },
          hint: "Magnitude is Pythagoras. Note that squaring removes any minus signs.",
          solution: [
            { mark: "M1", text: `$|\\mathbf{a}|=\\sqrt{(${sx})^{2}+(${sy})^{2}}=\\sqrt{${x * x}+${y * y}}$` },
            { mark: "A1", text: `$=\\sqrt{${m * m}}=${m}$` },
          ],
          trap: "A magnitude is a length and is never negative. If you get a negative answer, you have made a sign error.",
        };
      }
      const [x, y, z, m] = rng.pick(threeD);
      const sz = rng.chance(0.5) ? z : -z;
      return {
        prompt: `Find the magnitude of the vector $\\mathbf{a}=${leading(x, "\\mathbf{i}")}${signed(y, "\\mathbf{j}")}${signed(sz, "\\mathbf{k}")}$.`,
        answer: { type: "numeric", value: m },
        hint: "In three dimensions it is the same idea — square all three components, add, then take the root.",
        solution: [
          { mark: "M1", text: `$|\\mathbf{a}|=\\sqrt{${x}^{2}+${y}^{2}+(${sz})^{2}}=\\sqrt{${x * x}+${y * y}+${z * z}}$`, why: "Three dimensions adds a component but changes no technique." },
          { mark: "A1", text: `$=\\sqrt{${m * m}}=${m}$` },
        ],
      };
    },
  },
];
