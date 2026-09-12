import type { QuestionTemplate } from "@/lib/questions/types";
import { signed } from "./format";

/**
 * Question templates for Pure topic 9: Numerical methods.
 *
 * Entirely Year 2 and entirely self-contained, which makes it the most
 * learnable topic on the paper. Knowing HOW each method fails is worth as many
 * marks as using it, so the solutions spell out the named failure modes.
 */
export const pureNumericalQuestions: QuestionTemplate[] = [
  {
    id: "change-of-sign",
    paper: "pure",
    specCode: "9.1",
    topicSlug: "numerical-methods",
    ao: 2,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const a = rng.nonZeroInt(-4, 4);
      const b = rng.int(2, 20);
      const p = rng.int(1, 3);
      const f = (x: number) => x ** 3 + a * x - b;
      const value = f(p);
      return {
        prompt: `$\\mathrm{f}(x)=x^{3}${signed(a, "x")}${signed(-b)}$\n\nFind $\\mathrm{f}(${p})$.`,
        answer: { type: "numeric", value },
        hint: "Substitute directly. The point of the question is the sign of the result.",
        solution: [
          { mark: "M1", text: `$\\mathrm{f}(${p})=(${p})^{3}${signed(a)}(${p})${signed(-b)}$` },
          { mark: "A1", text: `$\\mathrm{f}(${p})=${value}$` },
          {
            mark: "E1",
            text: `This value is ${value < 0 ? "negative" : "positive"}. To show a root lies in an interval you must evaluate at BOTH ends, state both values, say there is a change of sign, AND say that $\\mathrm{f}$ is continuous on the interval.`,
            why: "The continuity statement is a mark on its own, and it is the one students leave out. Without it the argument is not valid — a sign change across an asymptote is not a root.",
          },
        ],
        trap: "The two named failure modes: an even number of roots in the interval means no sign change at all, and a discontinuity can produce a sign change where there is no root.",
      };
    },
  },
  {
    id: "newton-raphson-iteration",
    paper: "pure",
    specCode: "9.3",
    topicSlug: "numerical-methods",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const c = rng.int(5, 60);
      const x0 = rng.int(2, 5);
      const f = (x: number) => x ** 3 - c;
      const df = (x: number) => 3 * x * x;
      const x1 = x0 - f(x0) / df(x0);
      return {
        prompt: `$\\mathrm{f}(x)=x^{3}-${c}$\n\nThe Newton-Raphson method is used with $x_{0}=${x0}$.\n\nFind $x_{1}$, giving your answer to 4 decimal places.`,
        answer: { type: "numeric", value: x1, tolerance: 5e-4 },
        hint: "The formula is in the booklet. You need $\\mathrm{f}(x_{0})$ and $\\mathrm{f}'(x_{0})$.",
        solution: [
          { mark: "M1", text: `$\\mathrm{f}'(x)=3x^{2}$, so $\\mathrm{f}(${x0})=${f(x0)}$ and $\\mathrm{f}'(${x0})=${df(x0)}$` },
          {
            mark: "M1",
            text: `$x_{1}=x_{0}-\\dfrac{\\mathrm{f}(x_{0})}{\\mathrm{f}'(x_{0})}=${x0}-\\dfrac{${f(x0)}}{${df(x0)}}$`,
            why: "Geometrically this follows the tangent at $x_0$ down to where it crosses the $x$-axis — which is why a near-zero gradient throws the next estimate a long way off.",
          },
          { mark: "A1", text: `$x_{1}=${x1.toFixed(4)}$ (4 d.p.)` },
        ],
        trap: "Rounding partway through. Keep the full value in the calculator and round only at the end, or later iterations drift.",
      };
    },
  },
  {
    id: "iteration-recurrence",
    paper: "pure",
    specCode: "9.2",
    topicSlug: "numerical-methods",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const a = rng.int(2, 9);
      const b = rng.int(1, 9);
      const x0 = rng.int(1, 3);
      const step = (x: number) => Math.cbrt(a * x + b);
      const x1 = step(x0);
      const x2 = step(x1);
      return {
        prompt: `The recurrence relation $x_{n+1}=\\sqrt[3]{${a}x_{n}+${b}}$ is used with $x_{0}=${x0}$.\n\nFind $x_{2}$, giving your answer to 4 decimal places.`,
        answer: { type: "numeric", value: x2, tolerance: 5e-4 },
        hint: "Apply the formula twice, feeding each answer back in. Do not round between steps.",
        solution: [
          { mark: "M1", text: `$x_{1}=\\sqrt[3]{${a}\\times${x0}+${b}}=\\sqrt[3]{${a * x0 + b}}=${x1.toFixed(6)}$` },
          { mark: "M1", text: `$x_{2}=\\sqrt[3]{${a}\\times${x1.toFixed(6)}+${b}}$` },
          {
            mark: "A1",
            text: `$x_{2}=${x2.toFixed(4)}$ (4 d.p.)`,
            why: "Use the ANS key so the full value carries forward. Retyping a rounded value is the standard way this goes wrong.",
          },
        ],
        trap: "Convergence can be shown geometrically with a staircase or cobweb diagram on the axes given — that is explicitly examinable, not optional decoration.",
      };
    },
  },
  {
    id: "trapezium-rule",
    paper: "pure",
    specCode: "9.4",
    topicSlug: "numerical-methods",
    ao: 1,
    marks: 4,
    difficulty: 3,
    generate(rng) {
      const strips = rng.pick([2, 4]);
      const upper = rng.pick([1, 2, 4]);
      const k = rng.int(1, 6);
      const f = (x: number) => Math.sqrt(x * x + k);
      const h = upper / strips;
      const ordinates = Array.from({ length: strips + 1 }, (_, i) => f(i * h));
      const estimate =
        0.5 *
        h *
        (ordinates[0] + ordinates[strips] + 2 * ordinates.slice(1, strips).reduce((a, b) => a + b, 0));
      return {
        prompt: `Use the trapezium rule with ${strips} strips to estimate\n\n$\\displaystyle\\int_{0}^{${upper}}\\sqrt{x^{2}+${k}}\\,dx$\n\ngiving your answer to 3 significant figures.`,
        answer: { type: "numeric", value: estimate },
        hint: `${strips} strips means ${strips + 1} ordinates. Find the strip width first.`,
        solution: [
          {
            mark: "B1",
            text: `$h=\\dfrac{${upper}-0}{${strips}}=${h}$, giving ${strips + 1} ordinates at $x=${ordinates.map((_, i) => (i * h).toString()).join(",\\ ")}$`,
            why: `${strips} strips means ${strips + 1} ordinates — miscounting here is the single most common error in this topic.`,
          },
          { mark: "M1", text: `Ordinates: $${ordinates.map((y) => y.toFixed(4)).join(",\\ ")}$` },
          {
            mark: "M1",
            text: `$\\approx\\tfrac{1}{2}(${h})\\big[(${ordinates[0].toFixed(4)}+${ordinates[strips].toFixed(4)})+2(${ordinates.slice(1, strips).map((y) => y.toFixed(4)).join("+")})\\big]$`,
            why: "The first and last ordinates are counted once; every ordinate in between is doubled. That is what the bracket structure in the booklet formula means.",
          },
          { mark: "A1", text: `$\\approx${estimate.toFixed(4)}$` },
        ],
        trap: "Whether the estimate is too big or too small follows from the curvature: a curve that bends upwards sits below its chords, so the trapezium rule OVER-estimates. Expect to be asked to justify it from a sketch.",
      };
    },
  },
  {
    id: "numerical-methods-in-context",
    paper: "pure",
    specCode: "9.5",
    topicSlug: "numerical-methods",
    ao: 3,
    marks: 4,
    difficulty: 3,
    generate(rng) {
      const start = rng.int(2, 9) * 100;
      const rate = rng.pick([0.04, 0.06, 0.08, 0.1]);
      const target = start * rng.int(2, 4);
      // N = start·e^(rate·t) reaches target when t = ln(target/start)/rate.
      const exact = Math.log(target / start) / rate;
      const x0 = Math.round(exact) + rng.pick([-2, -1, 1, 2]);
      // One Newton-Raphson step on f(t) = start·e^(rate·t) − target.
      const f = start * Math.exp(rate * x0) - target;
      const fPrime = start * rate * Math.exp(rate * x0);
      const x1 = x0 - f / fPrime;
      return {
        prompt: `A colony of bacteria is modelled by $N=${start}e^{${rate}t}$, where $t$ is measured in hours.\n\nThe time $T$ at which the colony reaches $${target}$ satisfies $f(T)=0$, where $f(t)=${start}e^{${rate}t}-${target}$.\n\nUsing $t_{0}=${x0}$, apply the Newton-Raphson method once to find $t_{1}$, to 3 significant figures.`,
        answer: { type: "numeric", value: x1 },
        hint: "Differentiate $f$, then substitute into the Newton-Raphson formula. The formula is in the booklet.",
        solution: [
          { mark: "M1", text: `$f'(t)=${start}\\times${rate}e^{${rate}t}=${(start * rate).toFixed(2)}e^{${rate}t}$`, why: "Differentiating $e^{kt}$ brings the $k$ down. Getting $f'$ wrong is the usual reason a Newton-Raphson answer is wrong, because the formula itself is given." },
          { mark: "M1", text: `$f(${x0})=${start}e^{${(rate * x0).toFixed(4)}}-${target}=${f.toFixed(4)}$ and $f'(${x0})=${fPrime.toFixed(4)}$` },
          { mark: "M1", text: `$t_{1}=t_{0}-\\dfrac{f(t_{0})}{f'(t_{0})}=${x0}-\\dfrac{${f.toFixed(4)}}{${fPrime.toFixed(4)}}$` },
          { mark: "A1", text: `$t_{1}=${x1.toFixed(4)}\\approx${x1.toFixed(3)}$ hours (3 s.f.)`, why: `This model can be solved exactly — $T=\\dfrac{\\ln(${target}/${start})}{${rate}}=${exact.toFixed(3)}$ — which makes it a good check on the method. In context the answer would be rounded sensibly: the model is a smooth curve through what is really a whole number of bacteria, so quoting many decimal places would claim more precision than the model has.` },
        ],
        trap: "Rounding $f(t_{0})$ and $f'(t_{0})$ before dividing. Newton-Raphson converges fast, so an early rounding can swamp the improvement the step was meant to make.",
      };
    },
  },
];
