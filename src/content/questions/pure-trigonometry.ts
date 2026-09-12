import type { QuestionTemplate } from "@/lib/questions/types";
import { fraction, leading, signed } from "./format";

/**
 * Question templates for Year 2 Pure: trigonometry beyond the sine and cosine
 * rules — small angle approximations, reciprocal functions, identities, the
 * compound and double angle formulae, and R form.
 *
 * The booklet asymmetry matters here and is called out in the mark schemes:
 * the COMPOUND angle formulae are given, but the DOUBLE angle formulae are
 * not, even though the second follows from the first in one line. Students
 * who know this can derive what they need; students who do not, guess.
 */

/** Pythagorean triples, so every ratio in these questions is exact. */
const TRIPLES: ReadonlyArray<readonly [number, number, number]> = [
  [3, 4, 5],
  [4, 3, 5],
  [5, 12, 13],
  [12, 5, 13],
  [8, 15, 17],
  [15, 8, 17],
  [7, 24, 25],
  [24, 7, 25],
];

export const pureTrigonometryQuestions: QuestionTemplate[] = [
  {
    id: "small-angle-approximation",
    paper: "pure",
    specCode: "5.2",
    topicSlug: "trigonometry",
    ao: 2,
    marks: 4,
    difficulty: 3,
    generate(rng) {
      const a = rng.int(2, 6);
      const b = rng.int(2, 6);
      const value = (a * a) / (2 * b);
      return {
        prompt: `When $x$ is small, find an approximation for\n\n$$\\frac{1-\\cos ${a}x}{x\\sin ${b}x}$$\n\ngiving your answer as an exact fraction.`,
        answer: { type: "numeric", value, exactForm: fraction(a * a, 2 * b).replace(/\\frac\{(\d+)\}\{(\d+)\}/, "$1/$2"), requireExact: true },
        hint: "Replace each trigonometric function by its small angle approximation, then cancel. Both approximations are in the booklet.",
        solution: [
          { mark: "M1", text: `$\\cos ${a}x\\approx 1-\\dfrac{(${a}x)^{2}}{2}$, so $1-\\cos ${a}x\\approx\\dfrac{${a * a}x^{2}}{2}$`, why: `The approximation is $\\cos\\theta\\approx1-\\frac{\\theta^{2}}{2}$ with $\\theta=${a}x$. Squaring the whole of $${a}x$ is the step people get wrong — it gives $${a * a}x^{2}$, not $${a}x^{2}$.` },
          { mark: "M1", text: `$\\sin ${b}x\\approx ${b}x$, so the denominator is $\\approx ${b}x^{2}$` },
          { mark: "M1", text: `$\\dfrac{${a * a}x^{2}/2}{${b}x^{2}}=\\dfrac{${a * a}}{${2 * b}}=${fraction(a * a, 2 * b)}$`, why: "The $x^{2}$ cancels top and bottom. That it cancels completely is the point — the limit is a number, not a function of $x$." },
          { mark: "A1", text: `$\\approx ${fraction(a * a, 2 * b)}$` },
        ],
        trap: `Writing $\\cos ${a}x\\approx1-\\dfrac{${a}x^{2}}{2}$. The angle is $${a}x$, so it is $(${a}x)^{2}=${a * a}x^{2}$ that goes on top.`,
      };
    },
  },
  {
    id: "reciprocal-trig-exact-value",
    paper: "pure",
    specCode: "5.4",
    topicSlug: "trigonometry",
    ao: 1,
    marks: 2,
    difficulty: 2,
    generate(rng) {
      const cases = [
        { fn: "\\sec", angle: "\\frac{\\pi}{3}", base: "\\cos", baseValue: "\\frac{1}{2}", value: 2, exact: "2" },
        { fn: "\\sec", angle: "\\frac{\\pi}{4}", base: "\\cos", baseValue: "\\frac{\\sqrt{2}}{2}", value: Math.SQRT2, exact: "sqrt(2)" },
        { fn: "\\sec", angle: "\\frac{\\pi}{6}", base: "\\cos", baseValue: "\\frac{\\sqrt{3}}{2}", value: 2 / Math.sqrt(3), exact: "2/sqrt(3)" },
        { fn: "\\operatorname{cosec}", angle: "\\frac{\\pi}{6}", base: "\\sin", baseValue: "\\frac{1}{2}", value: 2, exact: "2" },
        { fn: "\\operatorname{cosec}", angle: "\\frac{\\pi}{4}", base: "\\sin", baseValue: "\\frac{\\sqrt{2}}{2}", value: Math.SQRT2, exact: "sqrt(2)" },
        { fn: "\\operatorname{cosec}", angle: "\\frac{\\pi}{3}", base: "\\sin", baseValue: "\\frac{\\sqrt{3}}{2}", value: 2 / Math.sqrt(3), exact: "2/sqrt(3)" },
        { fn: "\\cot", angle: "\\frac{\\pi}{4}", base: "\\tan", baseValue: "1", value: 1, exact: "1" },
        { fn: "\\cot", angle: "\\frac{\\pi}{3}", base: "\\tan", baseValue: "\\sqrt{3}", value: 1 / Math.sqrt(3), exact: "1/sqrt(3)" },
        { fn: "\\cot", angle: "\\frac{\\pi}{6}", base: "\\tan", baseValue: "\\frac{1}{\\sqrt{3}}", value: Math.sqrt(3), exact: "sqrt(3)" },
      ];
      const c = rng.pick(cases);
      return {
        prompt: `Find the exact value of $${c.fn}\\left(${c.angle}\\right)$.`,
        answer: { type: "numeric", value: c.value, requireExact: true, exactForm: c.exact },
        hint: "Each reciprocal function is one over the function you already know. Work out that one first.",
        solution: [
          { mark: "M1", text: `$${c.fn}\\theta=\\dfrac{1}{${c.base}\\theta}$, and $${c.base}\\left(${c.angle}\\right)=${c.baseValue}$`, why: "Which function each one is the reciprocal of is the whole difficulty: cosec goes with sin, sec goes with cos — not the pairing the names suggest." },
          { mark: "A1", text: `$${c.fn}\\left(${c.angle}\\right)=${c.exact.replace("sqrt(2)", "\\sqrt{2}").replace("sqrt(3)", "\\sqrt{3}")}$` },
        ],
        trap: "Pairing sec with sin and cosec with cos. The reliable check is the third letter of the reciprocal's name: se$\\mathbf{c}$ pairs with $\\mathbf{c}$os, cose$\\mathbf{c}$ pairs with... sin — the odd one out, which is exactly why it is worth learning deliberately.",
      };
    },
  },
  {
    id: "pythagorean-identity",
    paper: "pure",
    specCode: "5.5",
    topicSlug: "trigonometry",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const [opp, adj, hyp] = rng.pick(TRIPLES);
      const obtuse = rng.chance(0.5);
      const cosValue = (obtuse ? -adj : adj) / hyp;
      return {
        prompt: `Given that $\\sin\\theta=${fraction(opp, hyp)}$ and that $\\theta$ is ${obtuse ? "obtuse" : "acute"}, find the exact value of $\\cos\\theta$.`,
        answer: { type: "numeric", value: cosValue },
        hint: "Use the identity connecting sine and cosine, then let the quadrant decide the sign.",
        solution: [
          { mark: "M1", text: `$\\cos^{2}\\theta=1-\\sin^{2}\\theta=1-${fraction(opp * opp, hyp * hyp)}=${fraction(adj * adj, hyp * hyp)}$`, why: "This identity must be recalled — it is not in the booklet." },
          { mark: "M1", text: `$\\cos\\theta=\\pm${fraction(adj, hyp)}$`, why: "Taking a square root always gives two possibilities. Writing $\\pm$ here, and choosing afterwards, is what earns the method mark." },
          { mark: "A1", text: `$\\theta$ is ${obtuse ? "obtuse, so it lies in the second quadrant where cosine is negative" : "acute, so it lies in the first quadrant where everything is positive"}: $\\cos\\theta=${fraction(obtuse ? -adj : adj, hyp)}$` },
        ],
        trap: obtuse
          ? "Giving the positive root. An obtuse angle is between 90° and 180°, and cosine is negative throughout that range."
          : "Writing $\\pm$ in the final answer. The question tells you the angle is acute, which settles the sign.",
      };
    },
  },
  {
    id: "double-angle-exact",
    paper: "pure",
    specCode: "5.6",
    topicSlug: "trigonometry",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const [opp, adj, hyp] = rng.pick(TRIPLES);
      // cos 2θ = 2cos²θ − 1, kept exact by using a Pythagorean triple.
      const value = (2 * adj * adj - hyp * hyp) / (hyp * hyp);
      return {
        prompt: `Given that $\\cos\\theta=${fraction(adj, hyp)}$, find the exact value of $\\cos 2\\theta$.`,
        answer: { type: "numeric", value },
        hint: "There is a form of the double angle formula for cosine that uses only cosine. Pick that one and no further work is needed.",
        solution: [
          { mark: "M1", text: `$\\cos 2\\theta=2\\cos^{2}\\theta-1$`, why: "The double angle formulae are NOT in the booklet. They follow from the compound angle formulae, which are: putting $A=B=\\theta$ into $\\cos(A+B)$ gives this in one line." },
          { mark: "M1", text: `$=2\\times${fraction(adj * adj, hyp * hyp)}-1=${fraction(2 * adj * adj, hyp * hyp)}-${fraction(hyp * hyp, hyp * hyp)}$` },
          { mark: "A1", text: `$\\cos 2\\theta=${fraction(2 * adj * adj - hyp * hyp, hyp * hyp)}$`, why: `The value of $\\sin\\theta$ was never needed, and the sign of $\\theta$'s quadrant does not matter either — squaring removes it.` },
        ],
        trap: "Writing $\\cos 2\\theta=2\\cos\\theta$. Doubling the angle is not doubling the value — check it at $\\theta=0$, where the left side is 1 and the right side is 2.",
      };
    },
  },
  {
    id: "r-form-maximum",
    paper: "pure",
    specCode: "5.6",
    topicSlug: "trigonometry",
    ao: 2,
    marks: 4,
    difficulty: 3,
    generate(rng) {
      // Pythagorean triples again, so R is a whole number.
      const [a, b, r] = rng.pick(TRIPLES);
      const alpha = (Math.atan(b / a) * 180) / Math.PI;
      return {
        prompt: `The expression $${leading(a, "\\sin\\theta")}${signed(b, "\\cos\\theta")}$ can be written in the form $R\\sin(\\theta+\\alpha)$, where $R>0$ and $0<\\alpha<90^{\\circ}$.\n\nFind the maximum value of $${leading(a, "\\sin\\theta")}${signed(b, "\\cos\\theta")}$.`,
        answer: { type: "numeric", value: r },
        hint: "Find $R$ first. Once the expression is a single sine wave, its maximum is obvious.",
        solution: [
          { mark: "M1", text: `Expanding, $R\\sin(\\theta+\\alpha)=R\\cos\\alpha\\sin\\theta+R\\sin\\alpha\\cos\\theta$, so $R\\cos\\alpha=${a}$ and $R\\sin\\alpha=${b}$.`, why: "The compound angle formula IS in the booklet, so this expansion is free. Comparing coefficients is the standard route into R form." },
          { mark: "M1", text: `$R^{2}=${a}^{2}+${b}^{2}=${a * a}+${b * b}=${r * r}$`, why: "Squaring and adding kills $\\alpha$, because $\\cos^{2}\\alpha+\\sin^{2}\\alpha=1$." },
          { mark: "A1", text: `$R=${r}$, so $${leading(a, "\\sin\\theta")}${signed(b, "\\cos\\theta")}=${r}\\sin(\\theta+${alpha.toFixed(1)}^{\\circ})$` },
          { mark: "A1", text: `The maximum value is $${r}$, since the largest value of $\\sin$ is 1.`, why: "This is the whole reason R form exists: it turns an awkward sum into one wave whose maximum and minimum can be read off." },
        ],
        trap: `Answering $${a + b}$ by maximising each term separately. $\\sin\\theta$ and $\\cos\\theta$ cannot both be 1 at the same $\\theta$.`,
      };
    },
  },
  {
    id: "proving-trig-identity-step",
    paper: "pure",
    specCode: "5.8",
    topicSlug: "trigonometry",
    ao: 2,
    marks: 2,
    difficulty: 3,
    generate(rng) {
      const cases = [
        {
          identity: "\\frac{1-\\cos 2\\theta}{\\sin 2\\theta}\\equiv\\tan\\theta",
          ask: "1-\\cos 2\\theta",
          answer: "2\\sin^2\\theta",
          options: ["2\\sin^2\\theta", "1-2\\sin^2\\theta", "2\\cos^2\\theta", "\\sin^2\\theta-\\cos^2\\theta"],
          why: "Of the three forms of $\\cos 2\\theta$, only $1-2\\sin^{2}\\theta$ makes the 1 cancel. Then $\\frac{2\\sin^{2}\\theta}{2\\sin\\theta\\cos\\theta}=\\tan\\theta$.",
        },
        {
          identity: "\\frac{1+\\cos 2\\theta}{\\sin 2\\theta}\\equiv\\cot\\theta",
          ask: "1+\\cos 2\\theta",
          answer: "2\\cos^2\\theta",
          options: ["2\\cos^2\\theta", "2\\sin^2\\theta", "1+2\\cos^2\\theta", "2-2\\sin^2\\theta"],
          why: "Using $\\cos 2\\theta=2\\cos^{2}\\theta-1$ makes the 1 cancel, leaving $\\frac{2\\cos^{2}\\theta}{2\\sin\\theta\\cos\\theta}=\\cot\\theta$.",
        },
        {
          identity: "\\sec^2\\theta-\\tan^2\\theta\\equiv 1",
          ask: "\\sec^2\\theta",
          answer: "1+\\tan^2\\theta",
          options: ["1+\\tan^2\\theta", "1-\\tan^2\\theta", "\\tan^2\\theta-1", "1+\\cot^2\\theta"],
          why: "Dividing $\\sin^{2}\\theta+\\cos^{2}\\theta=1$ through by $\\cos^{2}\\theta$ gives $\\tan^{2}\\theta+1=\\sec^{2}\\theta$. This identity has to be recalled.",
        },
        {
          identity: "\\frac{\\sin 2\\theta}{1+\\cos 2\\theta}\\equiv\\tan\\theta",
          ask: "\\sin 2\\theta",
          answer: "2\\sin\\theta\\cos\\theta",
          options: ["2\\sin\\theta\\cos\\theta", "\\sin\\theta\\cos\\theta", "2\\sin\\theta", "\\sin^2\\theta-\\cos^2\\theta"],
          why: "With the denominator becoming $2\\cos^{2}\\theta$, one $\\cos\\theta$ and the 2 cancel, leaving $\\tan\\theta$.",
        },
      ];
      const c = rng.pick(cases);
      return {
        prompt: `A student is proving the identity\n\n$$${c.identity}$$\n\nWorking from the left-hand side, which replacement for $${c.ask}$ leads to the proof?`,
        answer: { type: "choice", value: c.answer, options: c.options },
        hint: "Choose the form that makes something cancel. That is always the guiding principle in an identity proof.",
        solution: [
          { mark: "M1", text: `Replace $${c.ask}$ by $${c.answer}$.`, why: c.why },
          { mark: "A1", text: "The left-hand side then simplifies directly to the right-hand side.", why: "Work on ONE side only and reduce it to the other. Doing the same thing to both sides assumes what you are trying to prove, and mark schemes penalise it." },
        ],
        trap: "Starting from the answer and working towards the question. A proof must begin with one side and arrive at the other.",
      };
    },
  },
  {
    id: "trigonometry-in-context",
    paper: "pure",
    specCode: "5.9",
    topicSlug: "trigonometry",
    ao: 3,
    marks: 4,
    difficulty: 2,
    generate(rng) {
      const centre = rng.int(6, 15);
      const radius = rng.int(3, centre - 1);
      const period = rng.pick([20, 24, 30, 40]);
      const t = rng.int(3, period - 3);
      const height = centre - radius * Math.cos((2 * Math.PI * t) / period);
      return {
        prompt: `A capsule on a big wheel has height $h$ metres above the ground after $t$ minutes, where\n\n$$h=${centre}-${radius}\\cos\\left(\\frac{2\\pi t}{${period}}\\right)$$\n\nFind the height of the capsule after $${t}$ minutes, to 3 significant figures.`,
        answer: { type: "numeric", value: height, unit: "m" },
        hint: "The angle is in radians. Check your calculator is in radian mode before you evaluate anything.",
        solution: [
          { mark: "M1", text: `$\\dfrac{2\\pi\\times${t}}{${period}}=${((2 * Math.PI * t) / period).toFixed(4)}$ radians` },
          { mark: "M1", text: `$\\cos(${((2 * Math.PI * t) / period).toFixed(4)})=${Math.cos((2 * Math.PI * t) / period).toFixed(4)}$` },
          { mark: "M1", text: `$h=${centre}-${radius}\\times${Math.cos((2 * Math.PI * t) / period).toFixed(4)}$` },
          { mark: "A1", text: `$h=${height.toFixed(3)}$ m (3 s.f.)`, why: `The model is sensible: the height swings between $${centre - radius}$ m and $${centre + radius}$ m, and the minus sign in front of the cosine means the capsule starts at the bottom, which is where you would board it.` },
        ],
        trap: "Working in degrees. The $2\\pi$ is the giveaway that this is radians — in degree mode the answer comes out near the starting height every time.",
      };
    },
  },
];
