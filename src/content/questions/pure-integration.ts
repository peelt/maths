import type { QuestionTemplate } from "@/lib/questions/types";
import { fraction, leading, signed } from "./format";

/**
 * Question templates for integration: the Fundamental Theorem and the constant
 * of integration, standard integrals, integration as a limit of a sum,
 * substitution and parts, partial fractions, and separable differential
 * equations.
 *
 * Booklet note: integration by parts IS given. The integrals of the standard
 * functions are NOT, beyond what can be read backwards from the table of
 * derivatives — so the recall burden sits on recognising the standard forms,
 * which is what several of these drill.
 */
export const pureIntegrationQuestions: QuestionTemplate[] = [
  {
    id: "find-curve-from-gradient",
    paper: "pure",
    specCode: "8.1",
    topicSlug: "integration",
    ao: 2,
    marks: 4,
    difficulty: 2,
    generate(rng) {
      const a = rng.nonZeroInt(-3, 4);
      const b = rng.nonZeroInt(-5, 5);
      const p = rng.nonZeroInt(-3, 3);
      const q = rng.nonZeroInt(-10, 10);
      const c = q - a * p * p * p - b * p * p;
      return {
        prompt: `A curve passes through the point $(${p},\\,${q})$ and satisfies\n\n$$\\frac{dy}{dx}=${leading(3 * a, "x^{2}")}${signed(2 * b, "x")}$$\n\nFind $y$ in terms of $x$.`,
        answer: { type: "expression", value: `${a}*x^3 + ${b}*x^2 + ${c}`, variables: ["x"] },
        hint: "Integrating gives you a family of curves. The point is what picks out the one you want.",
        solution: [
          { mark: "M1", text: `$y=\\displaystyle\\int\\left(${leading(3 * a, "x^{2}")}${signed(2 * b, "x")}\\right)dx=${leading(a, "x^{3}")}${signed(b, "x^{2}")}+c$`, why: "Integration reverses differentiation: raise the power by one and divide by the new power. The $+c$ is not optional — without it this is a different question." },
          { mark: "M1", text: `Substituting $x=${p}$, $y=${q}$: $${q}=${a}(${p})^{3}${signed(b, `(${p})^{2}`)}+c$`, why: "This is what the point is for. Every curve with this gradient function differs only by $c$, and the point selects one." },
          { mark: "A1", text: `$c=${c}$` },
          { mark: "A1", text: `$y=${leading(a, "x^{3}")}${signed(b, "x^{2}")}${signed(c)}$` },
        ],
        trap: "Leaving the answer as $+c$. The question gives a point precisely so that $c$ can be found, and the final two marks are for finding it.",
      };
    },
  },
  {
    id: "standard-integrals",
    paper: "pure",
    specCode: "8.2",
    topicSlug: "integration",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const a = rng.nonZeroInt(-6, 8);
      const k = rng.pick([2, 3, 4, -2, -3]);
      const b = rng.nonZeroInt(-5, 7);
      return {
        prompt: `Find $\\displaystyle\\int\\left(${leading(a, `e^{${leading(k, "x")}}`)}${signed(b, "\\frac{1}{x}")}\\right)dx$.\n\nYou may omit the constant of integration here.`,
        answer: { type: "expression", value: `(${a}/${k})*e^(${k}*x) + ${b}*ln(x)`, variables: ["x"] },
        hint: "Each of these is a standard form. Read the table of derivatives backwards: what differentiates to give each term?",
        solution: [
          { mark: "M1", text: `$\\displaystyle\\int e^{${leading(k, "x")}}\\,dx=${fraction(1, k)}e^{${leading(k, "x")}}$`, why: `Differentiating $e^{${leading(k, "x")}}$ multiplies by $${k}$, so integrating must divide by $${k}$. Dividing by the coefficient of $x$ is the step that gets dropped.` },
          { mark: "M1", text: `$\\displaystyle\\int\\frac{1}{x}\\,dx=\\ln|x|$`, why: "The modulus matters: $\\frac{1}{x}$ is defined for negative $x$ too, but $\\ln x$ is not. Mark schemes expect the bars." },
          { mark: "A1", text: `$\\displaystyle\\int\\left(${leading(a, `e^{${leading(k, "x")}}`)}${signed(b, "\\frac{1}{x}")}\\right)dx=${fraction(a, k)}e^{${leading(k, "x")}}${signed(b, "\\ln|x|")}+c$`, why: "In a real exam the $+c$ is a mark. It is only omitted here because there is nothing to type it into." },
        ],
        trap: `Writing $\\int e^{${leading(k, "x")}}dx=e^{${leading(k, "x")}}$. Check by differentiating your answer — you should get back exactly what you started with.`,
      };
    },
  },
  {
    id: "integration-as-limit-of-sum",
    paper: "pure",
    specCode: "8.4",
    topicSlug: "integration",
    ao: 2,
    marks: 2,
    difficulty: 3,
    generate(rng) {
      const a = rng.int(0, 2);
      const b = a + rng.int(2, 5);
      return {
        prompt: `The region under the curve $y=f(x)$ between $x=${a}$ and $x=${b}$ is divided into $n$ strips, each of width $\\delta x$, and approximated by rectangles.\n\nWhich expression gives the exact area?`,
        answer: {
          type: "choice",
          value: `\\lim_{\\delta x\\to 0}\\sum_{x=${a}}^{${b}} f(x)\\,\\delta x`,
          options: [
            `\\lim_{\\delta x\\to 0}\\sum_{x=${a}}^{${b}} f(x)\\,\\delta x`,
            `\\sum_{x=${a}}^{${b}} f(x)\\,\\delta x`,
            `\\lim_{\\delta x\\to 0}\\sum_{x=${a}}^{${b}} f(x)`,
            `\\lim_{n\\to 0}\\sum_{x=${a}}^{${b}} f(x)\\,\\delta x`,
          ],
        },
        hint: "The rectangles only give the exact area in a limit. Ask yourself which quantity has to shrink, and what each rectangle's area is.",
        solution: [
          { mark: "M1", text: `Each rectangle has area $f(x)\\,\\delta x$, so the total is $\\displaystyle\\sum_{x=${a}}^{${b}} f(x)\\,\\delta x$.`, why: "Height times width. Dropping the $\\delta x$ adds up heights rather than areas, which is dimensionally meaningless." },
          { mark: "A1", text: `The area is $\\displaystyle\\lim_{\\delta x\\to 0}\\sum_{x=${a}}^{${b}} f(x)\\,\\delta x=\\int_{${a}}^{${b}} f(x)\\,dx$`, why: "This is where the integral sign comes from: $\\int$ is a stretched S for 'sum', and $dx$ is what $\\delta x$ becomes in the limit. It is $\\delta x\\to0$, not $n\\to0$ — the number of strips goes to infinity." },
        ],
        trap: "Choosing $n\\to 0$. More strips means thinner strips: $n\\to\\infty$ and $\\delta x\\to 0$ describe the same limit.",
      };
    },
  },
  {
    id: "integration-by-parts",
    paper: "pure",
    specCode: "8.5",
    topicSlug: "integration",
    ao: 1,
    marks: 5,
    difficulty: 3,
    generate(rng) {
      const k = rng.pick([1, 2, 3, -1, -2]);
      // ∫₀¹ x e^{kx} dx = (e^k (k − 1) + 1) / k²
      const value = (Math.exp(k) * (k - 1) + 1) / (k * k);
      return {
        prompt: `Find the exact value of $\\displaystyle\\int_{0}^{1} x\\,e^{${leading(k, "x")}}\\,dx$, giving your answer to 3 significant figures.`,
        answer: { type: "numeric", value },
        hint: "Integration by parts. Choose $u$ to be the part that gets simpler when differentiated.",
        solution: [
          { mark: "M1", text: `$u=x$, $\\dfrac{du}{dx}=1$; $\\dfrac{dv}{dx}=e^{${leading(k, "x")}}$, $v=${fraction(1, k)}e^{${leading(k, "x")}}$`, why: "Take $u=x$ because differentiating it gives 1 and the second integral becomes easy. Choosing the other way round makes the problem worse, not better." },
          { mark: "M1", text: `$\\displaystyle\\int u\\frac{dv}{dx}dx=uv-\\int v\\frac{du}{dx}dx=\\left[${fraction(1, k)}xe^{${leading(k, "x")}}\\right]_{0}^{1}-\\int_{0}^{1}${fraction(1, k)}e^{${leading(k, "x")}}dx$`, why: "The parts formula IS in the booklet, so quote it rather than reconstructing it." },
          { mark: "M1", text: `$=${fraction(1, k)}e^{${k}}-\\left[${fraction(1, k * k)}e^{${leading(k, "x")}}\\right]_{0}^{1}$` },
          { mark: "M1", text: `$=${fraction(1, k)}e^{${k}}-${fraction(1, k * k)}e^{${k}}+${fraction(1, k * k)}$` },
          { mark: "A1", text: `$=${value.toFixed(4)}\\approx${value.toFixed(3)}$ (3 s.f.)`, why: "The limits go in only at the very end, and both terms need them — forgetting the lower limit on the second bracket is the usual slip." },
        ],
        trap: "Choosing $u=e^{kx}$. Differentiating it never simplifies anything, and the integral you are left with is harder than the one you started with.",
      };
    },
  },
  {
    id: "integration-by-substitution",
    paper: "pure",
    specCode: "8.5",
    topicSlug: "integration",
    ao: 1,
    marks: 4,
    difficulty: 2,
    generate(rng) {
      const a = rng.int(1, 5);
      const n = rng.int(2, 4);
      const b = rng.int(1, 3);
      const top = Math.pow(b * b + a, n + 1);
      const bottom = Math.pow(a, n + 1);
      const value = (top - bottom) / (n + 1);
      return {
        prompt: `Using the substitution $u=x^{2}+${a}$, find the exact value of\n\n$$\\int_{0}^{${b}} 2x\\left(x^{2}+${a}\\right)^{${n}}dx$$`,
        answer: { type: "numeric", value },
        hint: "Differentiate the substitution to convert $dx$, and remember to convert the limits too.",
        solution: [
          { mark: "M1", text: `$u=x^{2}+${a} \\Rightarrow \\dfrac{du}{dx}=2x \\Rightarrow du=2x\\,dx$`, why: `The $2x$ already sitting in the integrand is exactly what $du$ needs. That is the signal that this substitution is the right one.` },
          { mark: "M1", text: `Limits: $x=0\\Rightarrow u=${a}$, and $x=${b}\\Rightarrow u=${b * b + a}$`, why: "Changing the limits now means never having to substitute back. Leaving them as 0 and " + b + " while integrating in $u$ is a guaranteed lost mark." },
          { mark: "M1", text: `$\\displaystyle\\int_{${a}}^{${b * b + a}} u^{${n}}\\,du=\\left[\\frac{u^{${n + 1}}}{${n + 1}}\\right]_{${a}}^{${b * b + a}}$` },
          { mark: "A1", text: `$=\\dfrac{${top}-${bottom}}{${n + 1}}=${value}$` },
        ],
        trap: `Converting the integrand but not the limits. Once the variable is $u$, the limits must be values of $u$.`,
      };
    },
  },
  {
    id: "integration-partial-fractions",
    paper: "pure",
    specCode: "8.6",
    topicSlug: "integration",
    ao: 2,
    marks: 5,
    difficulty: 3,
    generate(rng) {
      const a = rng.int(1, 3);
      const b = a + rng.int(1, 4);
      const c = rng.int(2, 9) * (b - a);
      const p = rng.int(0, 2);
      const q = p + rng.int(1, 4);
      const scale = c / (b - a);
      const value = scale * (Math.log((q + a) / (q + b)) - Math.log((p + a) / (p + b)));
      return {
        prompt: `Find the value of\n\n$$\\int_{${p}}^{${q}} \\frac{${c}}{(x+${a})(x+${b})}\\,dx$$\n\ngiving your answer to 3 significant figures.`,
        answer: { type: "numeric", value },
        hint: "Split the fraction into two simpler ones first. Each piece then integrates to a logarithm.",
        solution: [
          { mark: "M1", text: `$\\dfrac{${c}}{(x+${a})(x+${b})}\\equiv\\dfrac{A}{x+${a}}+\\dfrac{B}{x+${b}}$, so $${c}=A(x+${b})+B(x+${a})$`, why: "Multiplying through by the whole denominator clears the fractions and leaves an identity — true for every $x$, which is what lets you substitute convenient values." },
          { mark: "M1", text: `$x=-${a}$ gives $A=${scale}$; $x=-${b}$ gives $B=${-scale}$`, why: `Substituting the values that make one bracket vanish is much faster than comparing coefficients. Note $A$ and $B$ are equal and opposite here, which always happens for a constant numerator.` },
          { mark: "M1", text: `$\\displaystyle\\int\\left(\\frac{${scale}}{x+${a}}-\\frac{${scale}}{x+${b}}\\right)dx=${scale}\\ln|x+${a}|-${scale}\\ln|x+${b}|$`, why: "Each term is of the form $\\frac{1}{x+k}$, which integrates to $\\ln|x+k|$ — a standard form worth recognising instantly." },
          { mark: "M1", text: `$=\\left[${scale}\\ln\\left|\\dfrac{x+${a}}{x+${b}}\\right|\\right]_{${p}}^{${q}}$`, why: "Combining into a single logarithm before substituting the limits makes the arithmetic far shorter." },
          { mark: "A1", text: `$=${value.toFixed(4)}\\approx${value.toFixed(3)}$ (3 s.f.)` },
        ],
        trap: "Integrating $\\frac{1}{(x+a)(x+b)}$ as a single logarithm of the denominator. That is not a standard form — the fraction has to be split first.",
      };
    },
  },
  {
    id: "separable-differential-equation",
    paper: "pure",
    specCode: "8.7",
    topicSlug: "integration",
    ao: 2,
    marks: 5,
    difficulty: 3,
    generate(rng) {
      // Pythagorean triples keep the square root exact.
      const [x1, y0, hyp] = rng.pick([
        [3, 4, 5],
        [4, 3, 5],
        [5, 12, 13],
        [12, 5, 13],
        [8, 15, 17],
        [15, 8, 17],
      ] as const);
      return {
        prompt: `Solve the differential equation\n\n$$\\frac{dy}{dx}=\\frac{x}{y}$$\n\ngiven that $y=${y0}$ when $x=0$, and hence find the value of $y$ when $x=${x1}$. Take $y>0$.`,
        answer: { type: "numeric", value: hyp },
        hint: "Separate the variables so that everything in $y$ is on one side and everything in $x$ on the other, then integrate both sides.",
        solution: [
          { mark: "M1", text: `$y\\,dy=x\\,dx$`, why: "Separating the variables. This is legitimate because both sides are then integrated with respect to their own variable." },
          { mark: "M1", text: `$\\displaystyle\\int y\\,dy=\\int x\\,dx \\Rightarrow \\frac{y^{2}}{2}=\\frac{x^{2}}{2}+c$`, why: "One constant is enough — a constant on each side would just combine into one." },
          { mark: "M1", text: `$y=${y0}$ when $x=0$: $\\dfrac{${y0 * y0}}{2}=0+c$, so $c=${(y0 * y0) / 2}$`, why: "Finding the constant immediately, before rearranging, keeps the algebra simple." },
          { mark: "M1", text: `$y^{2}=x^{2}+${y0 * y0}$, so at $x=${x1}$: $y^{2}=${x1 * x1}+${y0 * y0}=${hyp * hyp}$` },
          { mark: "A1", text: `$y=${hyp}$`, why: `The negative root is rejected because the question states $y>0$. The solution curve is a hyperbola, and the condition picks the upper branch.` },
        ],
        trap: "Integrating the right-hand side while leaving $y$ on the left untouched. Both sides must be integrated, each with respect to its own variable.",
      };
    },
  },
  {
    id: "interpret-differential-equation-solution",
    paper: "pure",
    specCode: "8.8",
    topicSlug: "integration",
    ao: 3,
    marks: 2,
    difficulty: 2,
    generate(rng) {
      const room = rng.int(15, 22);
      const start = room + rng.int(40, 60);
      const k = rng.pick([0.02, 0.05, 0.1]);
      return {
        prompt: `A cup of coffee cools according to $\\theta=${room}+${start - room}e^{-${k}t}$, where $\\theta$ is the temperature in $^{\\circ}\\mathrm{C}$ after $t$ minutes.\n\nWhat does the model predict for the temperature in the long run?`,
        answer: {
          type: "choice",
          value: `It approaches $${room}\\,^{\\circ}\\mathrm{C}$ but never quite reaches it.`,
          options: [
            `It approaches $${room}\\,^{\\circ}\\mathrm{C}$ but never quite reaches it.`,
            `It reaches $${room}\\,^{\\circ}\\mathrm{C}$ after a finite time and then stops.`,
            `It approaches $0\\,^{\\circ}\\mathrm{C}$ but never quite reaches it.`,
            `It keeps falling without limit.`,
          ],
        },
        hint: `Consider what happens to $e^{-${k}t}$ as $t$ becomes large, and what is left behind.`,
        solution: [
          { mark: "M1", text: `As $t\\to\\infty$, $e^{-${k}t}\\to 0$, so $\\theta\\to${room}$.`, why: `A negative exponent means decay towards zero. The $${start - room}$ is the initial EXCESS over room temperature, and it is that excess which decays — not the temperature itself.` },
          { mark: "A1", text: `The coffee approaches the room temperature of $${room}\\,^{\\circ}\\mathrm{C}$ without ever reaching it.`, why: "An exponential never actually attains its limit. In practice the coffee does reach room temperature, which is a genuine limitation of the model worth saying in an AO3 answer." },
        ],
        trap: `Answering $0\\,^{\\circ}\\mathrm{C}$. Only the exponential term decays to zero; the constant $${room}$ stays, and it is there precisely because the coffee cannot get colder than the room.`,
      };
    },
  },
];
