import type { QuestionTemplate } from "@/lib/questions/types";
import { factor, leading, signed } from "./format";

/**
 * Question templates for exponentials and logarithms: the shape of e^(ax+b)+c,
 * why the gradient of e^kx makes exponentials the natural model for growth,
 * logarithms as inverses, and using log graphs to recover parameters from data.
 */
export const pureExponentialsQuestions: QuestionTemplate[] = [
  {
    id: "exponential-graph-crossing",
    paper: "pure",
    specCode: "6.1",
    topicSlug: "exponentials-and-logarithms",
    ao: 2,
    marks: 4,
    difficulty: 3,
    generate(rng) {
      const a = rng.int(1, 3);
      const b = rng.nonZeroInt(-3, 3);
      const c = -rng.int(2, 20);
      // e^(ax+b) + c = 0  =>  x = (ln(−c) − b)/a
      const x = (Math.log(-c) - b) / a;
      return {
        prompt: `The curve $C$ has equation $y=e^{${leading(a, "x")}${signed(b)}}${signed(c)}$.\n\nFind the exact $x$-coordinate of the point where $C$ crosses the $x$-axis, then give it to 3 significant figures.`,
        answer: { type: "numeric", value: x },
        hint: "The curve crosses the $x$-axis where $y=0$. Isolate the exponential, then take logarithms.",
        solution: [
          { mark: "M1", text: `$e^{${leading(a, "x")}${signed(b)}}${signed(c)}=0 \\Rightarrow e^{${leading(a, "x")}${signed(b)}}=${-c}$`, why: `Setting $y=0$ is what "crosses the $x$-axis" means. Note this only has a solution because $${c}$ is negative — the graph of $e^{kx}$ alone never reaches zero, and the translation down is what drags it across the axis.` },
          { mark: "M1", text: `$${leading(a, "x")}${signed(b)}=\\ln ${-c}$`, why: "Taking natural logarithms undoes the exponential exactly, because $\\ln$ is its inverse." },
          { mark: "M1", text: `$x=\\dfrac{\\ln ${-c}${signed(-b)}}{${a}}$` },
          { mark: "A1", text: `$x=${x.toFixed(4)}\\approx${x.toFixed(3)}$ (3 s.f.)` },
        ],
        trap: `Writing $\\ln\\left(e^{${leading(a, "x")}${signed(b)}}${signed(c)}\\right)=${leading(a, "x")}${signed(b)}${signed(c)}$. The logarithm of a sum is not the sum of the logarithms — the exponential has to be alone before you can take logs.`,
      };
    },
  },
  {
    id: "gradient-of-exponential",
    paper: "pure",
    specCode: "6.2",
    topicSlug: "exponentials-and-logarithms",
    ao: 2,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const A = rng.int(2, 9);
      const k = rng.pick([0.5, 2, 3, -2, -0.5]);
      const p = rng.int(1, 4);
      const gradient = A * k * Math.exp(k * p);
      return {
        prompt: `A curve has equation $y=${A}e^{${leading(k, "x")}}$.\n\nFind the gradient of the curve at $x=${p}$, to 3 significant figures.`,
        answer: { type: "numeric", value: gradient },
        hint: "Differentiating $e^{kx}$ brings the $k$ down and leaves the exponential unchanged.",
        solution: [
          { mark: "M1", text: `$\\dfrac{dy}{dx}=${A}\\times${factor(k)}e^{${leading(k, "x")}}=${A * k}e^{${leading(k, "x")}}$`, why: "The gradient of $e^{kx}$ is $ke^{kx}$ — the function reappears, multiplied by $k$. No other family of functions does this." },
          { mark: "M1", text: `At $x=${p}$: $\\dfrac{dy}{dx}=${A * k}e^{${k * p}}$` },
          { mark: "A1", text: `$=${gradient.toFixed(4)}\\approx${gradient.toFixed(3)}$ (3 s.f.)`, why: `This is why exponentials model growth and decay so well: the rate of change at any moment is proportional to the amount present at that moment. Here the gradient is always exactly $${k}$ times the $y$-value.` },
        ],
        trap: "Differentiating $e^{kx}$ to $kxe^{kx-1}$ by applying the power rule. The power rule is for $x^{n}$, where the variable is in the base — here it is in the exponent, which is a different situation entirely.",
      };
    },
  },
  {
    id: "solve-natural-log-equation",
    paper: "pure",
    specCode: "6.3",
    topicSlug: "exponentials-and-logarithms",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const a = rng.nonZeroInt(-5, 6);
      const b = rng.nonZeroInt(-6, 7);
      const q = rng.int(1, 3);
      const x = (Math.exp(q) - b) / a;
      return {
        prompt: `Solve $\\ln\\left(${leading(a, "x")}${signed(b)}\\right)=${q}$, giving your answer to 3 significant figures.`,
        answer: { type: "numeric", value: x },
        hint: "Undo the logarithm by making each side the exponent of $e$.",
        solution: [
          { mark: "M1", text: `$${leading(a, "x")}${signed(b)}=e^{${q}}$`, why: "Applying $e$ to both sides. Because $e^{x}$ and $\\ln x$ are inverses, $e^{\\ln u}=u$ — the logarithm simply disappears." },
          { mark: "M1", text: `$${leading(a, "x")}=e^{${q}}${signed(-b)} = ${(Math.exp(q) - b).toFixed(4)}$` },
          { mark: "A1", text: `$x=${x.toFixed(4)}\\approx${x.toFixed(3)}$ (3 s.f.)`, why: `Worth a check: $${leading(a, "x")}${signed(b)}$ must come out positive, since a logarithm of a negative number does not exist. Here it is $e^{${q}}=${Math.exp(q).toFixed(3)}$, which is positive, so the solution is valid.` },
        ],
        trap: `Writing $\\ln\\left(${leading(a, "x")}${signed(b)}\\right)=\\ln\\left(${leading(a, "x")}\\right)${signed(b)}$. There is no law that splits the log of a sum.`,
      };
    },
  },
  {
    id: "log-graph-parameters",
    paper: "pure",
    specCode: "6.6",
    topicSlug: "exponentials-and-logarithms",
    ao: 3,
    marks: 4,
    difficulty: 3,
    generate(rng) {
      const n = rng.int(2, 5);
      const logA = rng.int(1, 3);
      const a = Math.pow(10, logA);
      return {
        prompt: `Two quantities are believed to satisfy $y=ax^{n}$.\n\nWhen $\\log_{10}y$ is plotted against $\\log_{10}x$, the points lie on a straight line with gradient $${n}$ and vertical intercept $${logA}$.\n\nFind the value of $a$.`,
        answer: { type: "numeric", value: a },
        hint: "Take logarithms of both sides of the model and compare what you get with $y=mx+c$.",
        solution: [
          { mark: "M1", text: `$\\log_{10}y=\\log_{10}\\left(ax^{${n}}\\right)=\\log_{10}a+${n}\\log_{10}x$`, why: "The multiplication law turns the product into a sum, and the power law brings the index down as a multiplier. That is what straightens the graph." },
          { mark: "M1", text: `Comparing with $Y=mX+c$ where $Y=\\log_{10}y$ and $X=\\log_{10}x$: the gradient is $n$ and the intercept is $\\log_{10}a$.`, why: "This is the whole technique: a log-log plot converts $y=ax^{n}$ into a straight line whose gradient and intercept hand you the two parameters." },
          { mark: "M1", text: `$\\log_{10}a=${logA}$` },
          { mark: "A1", text: `$a=10^{${logA}}=${a}$`, why: `The intercept is $\\log_{10}a$, not $a$ itself — so it must be undone with a power of 10. Reading $a=${logA}$ straight off the graph is the classic error.` },
        ],
        trap: `Giving $a=${logA}$. The intercept is the LOGARITHM of $a$; raising 10 to that power is the step that recovers $a$.`,
      };
    },
  },
];
