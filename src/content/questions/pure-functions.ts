import type { QuestionTemplate } from "@/lib/questions/types";
import { factor, leading, signed } from "./format";

/**
 * Question templates for functions and parametric curves: reciprocal graphs
 * and asymptotes, composite and inverse functions, partial fractions, and
 * converting between parametric and Cartesian form.
 */
export const pureFunctionsQuestions: QuestionTemplate[] = [
  {
    id: "reciprocal-graph-asymptote",
    paper: "pure",
    specCode: "2.7",
    topicSlug: "algebra-and-functions",
    ao: 2,
    marks: 2,
    difficulty: 2,
    generate(rng) {
      const a = rng.nonZeroInt(-8, 9);
      const b = rng.nonZeroInt(-5, 6);
      const c = rng.nonZeroInt(-6, 7);
      return {
        prompt: `The curve $C$ has equation\n\n$$y=\\frac{${a}}{x${signed(-b)}}${signed(c)}$$\n\nWrite down the equation of the vertical asymptote of $C$.`,
        answer: { type: "text", value: `x=${b}`, accept: [`x = ${b}`, `${b}`, `x=${b}`] },
        hint: "A vertical asymptote sits where the curve has no value at all. Which value of $x$ would make the denominator zero?",
        solution: [
          { mark: "M1", text: `The denominator is zero when $x${signed(-b)}=0$.`, why: "A fraction has no value when its denominator is zero, so the curve cannot cross that line — it can only approach it." },
          { mark: "A1", text: `$x=${b}$`, why: `The answer is a full EQUATION of a line, not just a number. Writing "${b}" alone loses the mark in most mark schemes. The horizontal asymptote, for comparison, is $y=${c}$, because the fraction shrinks to nothing as $x$ grows.` },
        ],
        trap: `Answering $x=${-b}$ by reading the sign straight off the equation. The denominator is $x${signed(-b)}$, which is zero at $x=${b}$ — the sign flips.`,
      };
    },
  },
  {
    id: "composite-function",
    paper: "pure",
    specCode: "2.8",
    topicSlug: "algebra-and-functions",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const a = rng.nonZeroInt(-4, 5);
      const b = rng.nonZeroInt(-6, 7);
      const c = rng.nonZeroInt(-3, 4);
      const x = rng.nonZeroInt(-4, 5);
      const inner = a * x + b;
      const value = inner * inner + c;
      return {
        prompt: `The functions $f$ and $g$ are defined by\n\n$$f(x)=${leading(a, "x")}${signed(b)},\\qquad g(x)=x^{2}${signed(c)}$$\n\nFind the value of $gf(${x})$.`,
        answer: { type: "numeric", value },
        hint: "In $gf(x)$ the function nearest the $x$ acts first. Work from the inside out.",
        solution: [
          { mark: "M1", text: `$f(${x})=${a}\\times${factor(x)}${signed(b)}=${inner}$`, why: "In $gf$, $f$ is applied FIRST. The notation reads right to left, which is the opposite of how it looks." },
          { mark: "M1", text: `$g(${inner})=(${inner})^{2}${signed(c)}$` },
          { mark: "A1", text: `$gf(${x})=${inner * inner}${signed(c)}=${value}$` },
        ],
        trap: `Applying $g$ first and getting $fg(${x})$ instead. The order matters: $gf$ and $fg$ are different functions and only rarely agree.`,
      };
    },
  },
  {
    id: "inverse-function",
    paper: "pure",
    specCode: "2.8",
    topicSlug: "algebra-and-functions",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const a = rng.nonZeroInt(-5, 6);
      const b = rng.nonZeroInt(-8, 9);
      return {
        prompt: `The function $f$ is defined by $f(x)=${leading(a, "x")}${signed(b)}$, for $x\\in\\mathbb{R}$.\n\nFind $f^{-1}(x)$.`,
        answer: { type: "expression", value: `(x - (${b}))/(${a})`, variables: ["x"] },
        hint: "Write $y=f(x)$, make $x$ the subject, then swap the letters.",
        solution: [
          { mark: "M1", text: `Let $y=${leading(a, "x")}${signed(b)}$, so $${leading(a, "x")}=y${signed(-b)}$`, why: "Undoing the function one operation at a time, in reverse order to how it was built." },
          { mark: "M1", text: `$x=\\dfrac{y${signed(-b)}}{${a}}$` },
          { mark: "A1", text: `$f^{-1}(x)=\\dfrac{x${signed(-b)}}{${a}}$`, why: "Swapping to $x$ at the end is not cosmetic: an inverse is a function of its own input, and mark schemes expect the answer in terms of $x$." },
        ],
        trap: `Writing $f^{-1}(x)=\\dfrac{1}{${leading(a, "x")}${signed(b)}}$. The index $-1$ here means inverse FUNCTION, not reciprocal.`,
      };
    },
  },
  {
    id: "partial-fractions",
    paper: "pure",
    specCode: "2.10",
    topicSlug: "algebra-and-functions",
    ao: 1,
    marks: 4,
    difficulty: 3,
    generate(rng) {
      const a = rng.int(1, 5);
      const b = a + rng.int(1, 4);
      // Chosen so A and B come out as whole numbers.
      const A = rng.nonZeroInt(-5, 6);
      const B = rng.nonZeroInt(-5, 6);
      const m = A + B;
      const n = A * b + B * a;
      return {
        prompt: `Express\n\n$$\\frac{${leading(m, "x")}${signed(n)}}{(x+${a})(x+${b})}$$\n\nin partial fractions.\n\nGiven that it can be written as $\\dfrac{A}{x+${a}}+\\dfrac{B}{x+${b}}$, find the value of $A$.`,
        answer: { type: "numeric", value: A },
        hint: "Multiply through by the whole denominator, then choose a value of $x$ that makes one of the unknowns disappear.",
        solution: [
          { mark: "M1", text: `$${leading(m, "x")}${signed(n)}\\equiv A(x+${b})+B(x+${a})$`, why: "Multiplying both sides by $(x+" + a + ")(x+" + b + ")$. The $\\equiv$ matters: this is true for every $x$, which is what licenses the next step." },
          { mark: "M1", text: `Substitute $x=${-a}$, chosen to make the $B$ term vanish.`, why: "Substituting the root of one bracket is far faster than comparing coefficients, and it isolates one unknown completely." },
          { mark: "A1", text: `$${m}\\times(${-a})${signed(n)}=A(${-a}+${b}) \\Rightarrow ${m * -a + n}=${b - a}A$` },
          { mark: "A1", text: `$A=${A}$`, why: `For the record, substituting $x=${-b}$ in the same way gives $B=${B}$.` },
        ],
        trap: `Substituting $x=${a}$ instead of $x=${-a}$. You want the value that makes the bracket $(x+${a})$ zero, which is its root.`,
      };
    },
  },
  {
    id: "modelling-with-functions",
    paper: "pure",
    specCode: "2.11",
    topicSlug: "algebra-and-functions",
    ao: 3,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const length = rng.int(20, 40);
      // A rectangle of fixed perimeter, area maximised at the square.
      const half = length / 2;
      const best = half / 2;
      const area = best * best;
      return {
        prompt: `A rectangular pen is made with $${length}$ m of fencing, using all of it. The width is $x$ metres.\n\nGiven that the area $A$ is modelled by $A=x\\left(${half}-x\\right)$, find the greatest possible area.`,
        answer: { type: "numeric", value: area, unit: "m²" },
        hint: "This is a quadratic in $x$ with a negative $x^{2}$ term, so it has a maximum. Complete the square, or use the symmetry of the parabola.",
        solution: [
          { mark: "M1", text: `$A=${half}x-x^{2}=-\\left(x-${best}\\right)^{2}+${area}$`, why: "Completing the square puts the maximum in plain sight: a square is never negative, so the largest $A$ happens when the bracket is zero." },
          { mark: "A1", text: `The maximum is $A=${area}$ m², at $x=${best}$ m.` },
          { mark: "A1", text: `The pen is then $${best}$ m by $${half - best}$ m — a square.`, why: "Worth noticing: for a fixed perimeter the square always gives the greatest area. A model that produced anything else would be worth re-checking." },
        ],
        trap: `Assuming $x$ can be any value. The model only makes sense for $0<x<${half}$; outside that the width or the length would be negative, which is a limitation worth stating in an AO3 answer.`,
      };
    },
  },
  {
    id: "parametric-to-cartesian",
    paper: "pure",
    specCode: "3.3",
    topicSlug: "coordinate-geometry",
    ao: 2,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const a = rng.nonZeroInt(-4, 5);
      const b = rng.nonZeroInt(-6, 7);
      const c = rng.nonZeroInt(-3, 4);
      // x = at + b  =>  t = (x − b)/a,  y = t² + c
      return {
        prompt: `A curve has parametric equations\n\n$$x=${leading(a, "t")}${signed(b)},\\qquad y=t^{2}${signed(c)}$$\n\nFind a Cartesian equation of the curve in the form $y=f(x)$.`,
        answer: { type: "expression", value: `((x - (${b}))/(${a}))^2 + (${c})`, variables: ["x"] },
        hint: "Make $t$ the subject of the easier equation, then substitute it into the other.",
        solution: [
          { mark: "M1", text: `From the first equation, $t=\\dfrac{x${signed(-b)}}{${a}}$`, why: "Eliminating the parameter is the whole task. Rearrange whichever equation is easier — here the linear one." },
          { mark: "M1", text: `$y=\\left(\\dfrac{x${signed(-b)}}{${a}}\\right)^{2}${signed(c)}$` },
          { mark: "A1", text: `$y=\\dfrac{\\left(x${signed(-b)}\\right)^{2}}{${a * a}}${signed(c)}$`, why: `Squaring the fraction squares the bottom too: the denominator is $${a}^{2}=${a * a}$, not $${a}$.` },
        ],
        trap: "Substituting into the equation you rearranged. Rearrange one, substitute into the OTHER — otherwise you get an identity that says nothing.",
      };
    },
  },
  {
    id: "parametric-modelling",
    paper: "pure",
    specCode: "3.4",
    topicSlug: "coordinate-geometry",
    ao: 3,
    marks: 4,
    difficulty: 3,
    generate(rng) {
      const speed = rng.int(10, 25);
      const height = rng.int(20, 60);
      const t = rng.int(1, 3);
      const x = speed * t;
      const y = height - 5 * t * t;
      return {
        prompt: `A ball is thrown horizontally from a cliff. After $t$ seconds its position is modelled by\n\n$$x=${speed}t,\\qquad y=${height}-5t^{2}$$\n\nwhere $x$ and $y$ are measured in metres. Find the height of the ball after $${t}$ seconds.`,
        answer: { type: "numeric", value: y, unit: "m" },
        hint: "The height is $y$. Only the second equation is needed.",
        solution: [
          { mark: "M1", text: `$y=${height}-5\\times${factor(t)}^{2}$` },
          { mark: "M1", text: `$=${height}-5\\times${factor(t * t)}=${height}-${5 * t * t}$` },
          { mark: "A1", text: `$y=${y}$ m` },
          { mark: "A1", text: `The horizontal distance travelled is $x=${speed}\\times${factor(t)}=${x}$ m.`, why: `The two motions are independent — that is exactly why a parametric model suits this problem. The horizontal position grows steadily while the vertical position falls ever faster, and the shared parameter $t$ is what ties them together.` },
        ],
        trap: "Using the $x$ equation for height. In this model $x$ is horizontal distance and $y$ is height; reading the wrong one gives a plausible but wrong number.",
      };
    },
  },
];
