import type { QuestionTemplate } from "@/lib/questions/types";
import { leading, signed } from "./format";

/**
 * Question templates for Year 2 Pure differentiation: first principles, second
 * derivatives, the product, quotient and chain rules, implicit and parametric
 * differentiation, and setting up differential equations.
 *
 * Booklet note carried through the mark schemes: the QUOTIENT rule is given,
 * but the PRODUCT and CHAIN rules are not. That is the opposite of what most
 * students assume, and it decides which three lines have to be memorised.
 */
export const pureDifferentiationQuestions: QuestionTemplate[] = [
  {
    id: "differentiate-first-principles",
    paper: "pure",
    specCode: "7.1",
    topicSlug: "differentiation",
    ao: 2,
    marks: 4,
    difficulty: 3,
    generate(rng) {
      const a = rng.int(2, 6);
      const b = rng.nonZeroInt(-7, 7);
      return {
        prompt: `Given that $f(x)=${leading(a, "x^{2}")}${signed(b, "x")}$, use differentiation from first principles to find $f'(x)$.`,
        answer: { type: "expression", value: `${2 * a}*x + ${b}`, variables: ["x"] },
        hint: "Start from the definition with $f(x+h)$, expand carefully, and look for everything that cancels.",
        solution: [
          { mark: "M1", text: `$f'(x)=\\lim_{h\\to 0}\\dfrac{f(x+h)-f(x)}{h}$`, why: "Quoting the definition is a mark in itself. A question saying 'from first principles' is refusing to let you use the power rule, so the definition must appear." },
          { mark: "M1", text: `$f(x+h)=${a}(x+h)^{2}${signed(b, "(x+h)")}=${leading(a, "x^{2}")}+${2 * a}xh+${a}h^{2}${signed(b, "x")}${signed(b, "h")}$`, why: `Expanding $(x+h)^{2}$ as $x^{2}+2xh+h^{2}$ is where most marks are lost — writing $x^{2}+h^{2}$ loses everything that follows.` },
          { mark: "M1", text: `$\\dfrac{f(x+h)-f(x)}{h}=\\dfrac{${2 * a}xh+${a}h^{2}${signed(b, "h")}}{h}=${2 * a}x+${a}h${signed(b)}$`, why: `The $${leading(a, "x^{2}")}$ and $${leading(b, "x")}$ terms cancel, so every surviving term has a factor of $h$ to divide out. That cancellation is the engine of the whole method.` },
          { mark: "A1", text: `As $h\\to 0$, $f'(x)=${2 * a}x${signed(b)}$`, why: "Only now can $h$ be set to zero. Setting it to zero any earlier would divide by zero." },
        ],
        trap: "Cancelling the $h$ before subtracting $f(x)$. Do the subtraction first, or nothing cancels and you are left dividing by zero.",
      };
    },
  },
  {
    id: "second-derivative",
    paper: "pure",
    specCode: "7.1",
    topicSlug: "differentiation",
    ao: 1,
    marks: 3,
    difficulty: 1,
    generate(rng) {
      const a = rng.nonZeroInt(-4, 5);
      const b = rng.nonZeroInt(-5, 6);
      const c = rng.nonZeroInt(-7, 8);
      return {
        prompt: `Given that $y=${leading(a, "x^{4}")}${signed(b, "x^{3}")}${signed(c, "x")}$, find $\\dfrac{d^{2}y}{dx^{2}}$.`,
        answer: { type: "expression", value: `${12 * a}*x^2 + ${6 * b}*x`, variables: ["x"] },
        hint: "Differentiate once, then differentiate the result. There is no shortcut worth learning here.",
        solution: [
          { mark: "M1", text: `$\\dfrac{dy}{dx}=${leading(4 * a, "x^{3}")}${signed(3 * b, "x^{2}")}${signed(c)}$` },
          { mark: "M1", text: `Differentiating again: $${leading(12 * a, "x^{2}")}${signed(6 * b, "x")}$` },
          { mark: "A1", text: `$\\dfrac{d^{2}y}{dx^{2}}=${leading(12 * a, "x^{2}")}${signed(6 * b, "x")}$`, why: `The $${leading(c, "x")}$ term became the constant $${c}$ after one differentiation, and then vanished at the second. The second derivative tells you how the gradient itself is changing, which is what settles whether a stationary point is a maximum or a minimum.` },
        ],
        trap: "Stopping after one differentiation. The notation $\\dfrac{d^{2}y}{dx^{2}}$ means differentiate twice.",
      };
    },
  },
  {
    id: "chain-rule",
    paper: "pure",
    specCode: "7.4",
    topicSlug: "differentiation",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const a = rng.nonZeroInt(-4, 5);
      const b = rng.nonZeroInt(-7, 8);
      const n = rng.int(3, 6);
      return {
        prompt: `Given that $y=\\left(${leading(a, "x")}${signed(b)}\\right)^{${n}}$, find $\\dfrac{dy}{dx}$.`,
        answer: { type: "expression", value: `${a * n}*(${a}*x + ${b})^${n - 1}`, variables: ["x"] },
        hint: "Differentiate the outside, leaving the inside alone, then multiply by the derivative of the inside.",
        solution: [
          { mark: "M1", text: `Let $u=${leading(a, "x")}${signed(b)}$, so $y=u^{${n}}$ and $\\dfrac{du}{dx}=${a}$.`, why: "Naming the inner function makes the structure explicit. The chain rule is NOT in the booklet, so the method must be shown clearly." },
          { mark: "M1", text: `$\\dfrac{dy}{dx}=\\dfrac{dy}{du}\\times\\dfrac{du}{dx}=${n}u^{${n - 1}}\\times${a}$` },
          { mark: "A1", text: `$\\dfrac{dy}{dx}=${a * n}\\left(${leading(a, "x")}${signed(b)}\\right)^{${n - 1}}$` },
        ],
        trap: `Forgetting the factor of $${a}$ from the inside. Without it the answer is wrong by a constant multiple every time — and it is the single most common slip in Year 2 differentiation.`,
      };
    },
  },
  {
    id: "product-rule",
    paper: "pure",
    specCode: "7.4",
    topicSlug: "differentiation",
    ao: 1,
    marks: 4,
    difficulty: 2,
    generate(rng) {
      const n = rng.int(2, 4);
      const k = rng.nonZeroInt(-3, 3);
      return {
        prompt: `Given that $y=x^{${n}}e^{${leading(k, "x")}}$, find $\\dfrac{dy}{dx}$.`,
        answer: { type: "expression", value: `${n}*x^${n - 1}*e^(${k}*x) + ${k}*x^${n}*e^(${k}*x)`, variables: ["x"] },
        hint: "This is a product of two functions of $x$, so neither the chain rule nor the power rule alone will do it.",
        solution: [
          { mark: "B1", text: `$u=x^{${n}}$, $\\dfrac{du}{dx}=${n}x^{${n - 1}}$; $v=e^{${leading(k, "x")}}$, $\\dfrac{dv}{dx}=${leading(k, `e^{${leading(k, "x")}}`)}$`, why: `Differentiating $e^{kx}$ brings the $k$ down — itself a chain rule, and the reason the ${k < 0 ? "negative " : ""}coefficient must be carried.` },
          { mark: "M1", text: `$\\dfrac{dy}{dx}=u\\dfrac{dv}{dx}+v\\dfrac{du}{dx}$`, why: "The product rule is NOT in the formula booklet. It has to be recalled." },
          { mark: "M1", text: `$=${leading(k, `x^{${n}}e^{${leading(k, "x")}}`)}+${n}x^{${n - 1}}e^{${leading(k, "x")}}$` },
          { mark: "A1", text: `$\\dfrac{dy}{dx}=x^{${n - 1}}e^{${leading(k, "x")}}\\left(${leading(k, "x")}${signed(n)}\\right)$`, why: "Factorising is worth doing even when not asked: a later part almost always wants the stationary points, and a factorised derivative hands them to you." },
        ],
        trap: "Differentiating each factor and multiplying the results. The derivative of a product is not the product of the derivatives.",
      };
    },
  },
  {
    id: "quotient-rule",
    paper: "pure",
    specCode: "7.4",
    topicSlug: "differentiation",
    ao: 1,
    marks: 4,
    difficulty: 2,
    generate(rng) {
      let a = rng.nonZeroInt(-5, 6);
      let b = rng.nonZeroInt(-8, 9);
      let c = rng.nonZeroInt(-4, 5);
      let d = rng.nonZeroInt(-7, 8);
      // When ad - bc = 0 the two linear factors are proportional, so y is a
      // constant and dy/dx is 0. That is a real answer but a worthless
      // question, so draw again. Deterministic for a given seed either way.
      while (a * d - b * c === 0) {
        a = rng.nonZeroInt(-5, 6);
        b = rng.nonZeroInt(-8, 9);
        c = rng.nonZeroInt(-4, 5);
        d = rng.nonZeroInt(-7, 8);
      }
      const numerator = a * d - b * c;
      return {
        prompt: `Given that $y=\\dfrac{${leading(a, "x")}${signed(b)}}{${leading(c, "x")}${signed(d)}}$, find $\\dfrac{dy}{dx}$.`,
        answer: { type: "expression", value: `(${numerator})/((${c})*x + (${d}))^2`, variables: ["x"] },
        hint: "The quotient rule is in the booklet. Identify $u$, $v$ and their derivatives before substituting.",
        solution: [
          { mark: "B1", text: `$u=${leading(a, "x")}${signed(b)}$, $\\dfrac{du}{dx}=${a}$; $v=${leading(c, "x")}${signed(d)}$, $\\dfrac{dv}{dx}=${c}$` },
          { mark: "M1", text: `$\\dfrac{dy}{dx}=\\dfrac{v\\frac{du}{dx}-u\\frac{dv}{dx}}{v^{2}}$`, why: "This one IS given in the booklet, so there is no excuse for the order of the subtraction going wrong — copy it." },
          {
            mark: "M1",
            // The second product is SUBTRACTED, so its sign is built with
            // signed(-c) rather than a hard-coded minus — otherwise a negative
            // c renders as "--2", which is the giveaway of a generated question.
            text: `$=\\dfrac{${leading(a, `\\left(${leading(c, "x")}${signed(d)}\\right)`)}${signed(-c, `\\left(${leading(a, "x")}${signed(b)}\\right)`)}}{\\left(${leading(c, "x")}${signed(d)}\\right)^{2}}$`,
          },
          { mark: "A1", text: `$\\dfrac{dy}{dx}=\\dfrac{${numerator}}{\\left(${leading(c, "x")}${signed(d)}\\right)^{2}}$`, why: `The $x$ terms in the numerator cancel, which always happens for a ratio of two linear functions. A numerator still containing $x$ means an arithmetic slip.` },
        ],
        trap: "Getting the subtraction the wrong way round. It is $v\\frac{du}{dx}$ first — unlike the product rule, the quotient rule is not symmetric, so the order matters.",
      };
    },
  },
  {
    id: "parametric-differentiation",
    paper: "pure",
    specCode: "7.5",
    topicSlug: "differentiation",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const a = rng.int(2, 6);
      const b = rng.int(2, 6);
      return {
        prompt: `A curve has parametric equations $x=${a}t^{2}$, $y=${b}t^{3}$.\n\nFind $\\dfrac{dy}{dx}$ in terms of $t$.`,
        answer: { type: "expression", value: `(${3 * b}*t)/(${2 * a})`, variables: ["t"] },
        hint: "Differentiate each equation with respect to $t$, then divide one by the other the right way round.",
        solution: [
          { mark: "M1", text: `$\\dfrac{dx}{dt}=${2 * a}t$ and $\\dfrac{dy}{dt}=${3 * b}t^{2}$` },
          { mark: "M1", text: `$\\dfrac{dy}{dx}=\\dfrac{dy/dt}{dx/dt}=\\dfrac{${3 * b}t^{2}}{${2 * a}t}$`, why: "The $dt$ terms behave as though they cancel. That is not a proof, but it is the right way to remember which fraction goes on top." },
          { mark: "A1", text: `$\\dfrac{dy}{dx}=\\dfrac{${3 * b}t}{${2 * a}}$`, why: "Cancelling one factor of $t$. The answer is left in terms of $t$, which is what the question asked for — converting back to $x$ and $y$ wastes time and risks marks." },
        ],
        trap: "Dividing the wrong way round. $\\dfrac{dy}{dt}$ goes on top, because it is $dy$ that you want on top of $dx$.",
      };
    },
  },
  {
    id: "implicit-differentiation",
    paper: "pure",
    specCode: "7.5",
    topicSlug: "differentiation",
    ao: 2,
    marks: 4,
    difficulty: 3,
    generate(rng) {
      const a = rng.nonZeroInt(-4, 5);
      const c = rng.int(4, 30);
      return {
        prompt: `A curve has equation $x^{2}+y^{2}${signed(a, "xy")}=${c}$.\n\nFind $\\dfrac{dy}{dx}$ in terms of $x$ and $y$.`,
        answer: { type: "expression", value: `-(2*x + (${a})*y)/(2*y + (${a})*x)`, variables: ["x", "y"] },
        hint: "Differentiate every term with respect to $x$, remembering that $y$ is itself a function of $x$. The $xy$ term needs the product rule.",
        solution: [
          { mark: "M1", text: `$\\dfrac{d}{dx}(y^{2})=2y\\dfrac{dy}{dx}$`, why: "This is the chain rule: $y$ depends on $x$, so differentiating anything in $y$ leaves a $\\frac{dy}{dx}$ behind. Missing this is what implicit differentiation is testing." },
          { mark: "M1", text: `$\\dfrac{d}{dx}\\left(${leading(a, "xy")}\\right)=${leading(a, "\\left(y+x\\dfrac{dy}{dx}\\right)")}$`, why: "A product of $x$ and $y$ needs the product rule, and the $y$ half then needs the chain rule." },
          { mark: "M1", text: `$2x+2y\\dfrac{dy}{dx}${signed(a, "y")}${signed(a, "x\\dfrac{dy}{dx}")}=0 \\Rightarrow \\dfrac{dy}{dx}\\left(2y${signed(a, "x")}\\right)=-\\left(2x${signed(a, "y")}\\right)$`, why: "Collecting every $\\frac{dy}{dx}$ on one side and factorising is the standard finish — the right-hand side differentiates to zero because $" + c + "$ is constant." },
          { mark: "A1", text: `$\\dfrac{dy}{dx}=-\\dfrac{2x${signed(a, "y")}}{2y${signed(a, "x")}}$` },
        ],
        trap: "Differentiating $y^{2}$ to $2y$. Without the $\\frac{dy}{dx}$ factor you have differentiated with respect to $y$, not $x$.",
      };
    },
  },
  {
    id: "construct-differential-equation",
    paper: "pure",
    specCode: "7.6",
    topicSlug: "differentiation",
    ao: 3,
    marks: 2,
    difficulty: 2,
    generate(rng) {
      const cases = [
        {
          context:
            "The temperature $\\theta$ of a cooling drink falls at a rate proportional to the difference between its temperature and the room temperature $\\theta_{0}$.",
          answer: "\\frac{d\\theta}{dt}=-k(\\theta-\\theta_{0})",
          options: [
            "\\frac{d\\theta}{dt}=-k(\\theta-\\theta_{0})",
            "\\frac{d\\theta}{dt}=k(\\theta-\\theta_{0})",
            "\\frac{d\\theta}{dt}=-k\\theta",
            "\\frac{d\\theta}{dt}=-k\\theta_{0}",
          ],
          why: "The drink is cooling, so $\\theta$ is decreasing and the rate must be negative while $\\theta>\\theta_{0}$. It is the DIFFERENCE that drives the cooling, not the temperature itself — which is why the drink stops cooling once it reaches room temperature.",
        },
        {
          context:
            "The volume $V$ of water in a leaking tank decreases at a rate proportional to the square root of the volume.",
          answer: "\\frac{dV}{dt}=-k\\sqrt{V}",
          options: ["\\frac{dV}{dt}=-k\\sqrt{V}", "\\frac{dV}{dt}=k\\sqrt{V}", "\\frac{dV}{dt}=-kV^{2}", "\\frac{dV}{dt}=-\\frac{k}{\\sqrt{V}}"],
          why: "'Decreases' fixes the minus sign, and 'proportional to the square root' means $k\\sqrt{V}$ rather than any other power.",
        },
        {
          context:
            "A population $P$ grows at a rate proportional to the population present at that moment.",
          answer: "\\frac{dP}{dt}=kP",
          options: ["\\frac{dP}{dt}=kP", "\\frac{dP}{dt}=-kP", "\\frac{dP}{dt}=kt", "\\frac{dP}{dt}=k"],
          why: "Proportional to the population itself, not to time. This is what produces exponential growth when solved.",
        },
        {
          context:
            "The radius $r$ of a spreading circular oil slick increases at a rate inversely proportional to its radius.",
          answer: "\\frac{dr}{dt}=\\frac{k}{r}",
          options: ["\\frac{dr}{dt}=\\frac{k}{r}", "\\frac{dr}{dt}=kr", "\\frac{dr}{dt}=-\\frac{k}{r}", "\\frac{dr}{dt}=\\frac{r}{k}"],
          why: "'Inversely proportional' puts the variable underneath. 'Increases' keeps the sign positive.",
        },
      ];
      const c = rng.pick(cases);
      return {
        prompt: `${c.context}\n\nWhich differential equation models this, where $k$ is a positive constant?`,
        answer: { type: "choice", value: c.answer, options: c.options },
        hint: "Two decisions: what the rate is proportional TO, and whether the quantity is going up or down.",
        solution: [
          { mark: "M1", text: `$${c.answer}$`, why: c.why },
          { mark: "A1", text: "The constant $k$ is positive, so any decrease is carried by an explicit minus sign.", why: "Stating that $k>0$ matters: it is what makes the sign of the whole right-hand side meaningful rather than arbitrary." },
        ],
        trap: "Losing the minus sign on a decreasing quantity. If $k$ is positive and the quantity falls, the minus must be written explicitly.",
      };
    },
  },
];
