import type { QuestionTemplate } from "@/lib/questions/types";
import { fraction, leading, signed } from "./format";

/**
 * Question templates for the early Pure content: proof, algebra, coordinate geometry,
 * sequences and trigonometry.
 *
 * Every template generates its numbers from a seed and computes its own
 * answer, so a variant can never disagree with its mark scheme.
 */
export const pureAlgebraQuestions: QuestionTemplate[] = [
  {
    id: "proof-counterexample",
    paper: "pure",
    specCode: "1.1",
    topicSlug: "proof",
    ao: 2,
    marks: 1,
    difficulty: 1,
    generate(rng) {
      const claims = [
        {
          claim: "If $n$ is a prime number, then $n$ is odd.",
          answer: "2",
          options: ["2", "9", "15", "27"],
          why: "2 is prime but even, so the statement fails immediately.",
        },
        {
          claim: "If $n^2$ is even, then $n$ is odd.",
          answer: "4",
          options: ["4", "3", "9", "25"],
          why: "$4^2 = 16$ is even, but 4 is not odd.",
        },
        {
          claim: "For all real $x$, $x^2 > x$.",
          answer: "0.5",
          options: ["0.5", "2", "3", "10"],
          why: "$0.5^2 = 0.25$, which is smaller than 0.5. Any value strictly between 0 and 1 works.",
        },
        {
          claim: "If $a > b$ then $a^2 > b^2$.",
          answer: "a = 1, b = -3",
          options: ["a = 1, b = -3", "a = 4, b = 2", "a = 5, b = 1", "a = 3, b = 0"],
          why: "$1 > -3$, but $1^2 = 1$ is smaller than $(-3)^2 = 9$. Negatives break this claim.",
        },
      ];
      const chosen = rng.pick(claims);
      const options = rng.sample(chosen.options, chosen.options.length);
      return {
        prompt: `Disprove the following statement by counter-example.\n\n${chosen.claim}\n\nWhich of these is a valid counter-example?`,
        answer: { type: "choice", value: chosen.answer, options },
        hint: "You only need ONE case where the statement fails. Try the awkward values first — 0, 1, 2, negatives and fractions.",
        trap: "A counter-example is a single case, not an argument. Students often try to explain why the statement is wrong instead of just producing the case that breaks it.",
        solution: [
          { mark: "B1", text: chosen.why, why: "One correct counter-example is the whole answer — no further reasoning is needed or wanted." },
        ],
      };
    },
  },
  {
    id: "indices-simplify",
    paper: "pure",
    specCode: "2.1",
    topicSlug: "algebra-and-functions",
    ao: 1,
    marks: 2,
    difficulty: 1,
    generate(rng) {
      const a = rng.int(2, 4);
      const m = rng.int(2, 4);
      const n = rng.int(2, 3);
      const p = rng.int(1, m * n - 2);
      const k = Math.pow(a, n);
      const q = m * n - p;
      return {
        prompt: `Simplify $\\dfrac{(${a}x^{${m}})^{${n}}}{x^{${p}}}$, giving your answer in the form $kx^{q}$.`,
        answer: {
          type: "expression",
          value: `${k}*x^${q}`,
          reject: [{ pattern: "\\/", message: "Your answer still contains a division — simplify it to a single term $kx^q$." }],
        },
        hint: "Deal with the bracket first: the power outside applies to BOTH the number and the x.",
        solution: [
          { mark: "M1", text: `$(${a}x^{${m}})^{${n}} = ${a}^{${n}}x^{${m}\\times${n}} = ${k}x^{${m * n}}$`, why: "The index outside the bracket multiplies the index inside, and applies to the coefficient too." },
          { mark: "A1", text: `$\\dfrac{${k}x^{${m * n}}}{x^{${p}}} = ${k}x^{${m * n} - ${p}} = ${k}x^{${q}}$`, why: "Dividing powers of the same base subtracts the indices." },
        ],
        trap: `Forgetting that the outside power applies to the ${a} as well as the x — a very common two-mark loss.`,
      };
    },
  },
  {
    id: "indices-fractional",
    paper: "pure",
    specCode: "2.1",
    topicSlug: "algebra-and-functions",
    ao: 1,
    marks: 2,
    difficulty: 2,
    generate(rng) {
      const base = rng.int(2, 5);
      const n = rng.pick([2, 3]);
      const m = rng.pick([1, 2, 3, 4].filter((v) => v !== n));
      const c = Math.pow(base, n);
      const value = Math.pow(base, m);
      return {
        prompt: `Find the exact value of $${c}^{\\frac{${m}}{${n}}}$.`,
        answer: { type: "numeric", value },
        hint: `The bottom of the fraction is a root, the top is a power. What number to the power ${n} gives ${c}?`,
        solution: [
          { mark: "M1", text: `$${c}^{\\frac{1}{${n}}} = ${base}$`, why: `The denominator ${n} means take the ${n === 2 ? "square" : "cube"} root first — always root before power, because the numbers stay small.` },
          { mark: "A1", text: `$${base}^{${m}} = ${value}$` },
        ],
        trap: "Doing the power first gives a huge number and usually a lost mark. Root first, every time.",
      };
    },
  },
  {
    id: "surds-simplify",
    paper: "pure",
    specCode: "2.2",
    topicSlug: "algebra-and-functions",
    ao: 1,
    marks: 2,
    difficulty: 1,
    generate(rng) {
      const k = rng.int(2, 6);
      const r = rng.pick([2, 3, 5, 6, 7, 10, 11]);
      const n = k * k * r;
      return {
        prompt: `Write $\\sqrt{${n}}$ in the form $a\\sqrt{b}$, where $a$ and $b$ are integers and $b$ is as small as possible.`,
        answer: {
          type: "expression",
          value: `${k}*sqrt(${r})`,
          reject: [{ pattern: `sqrt\\s*\\(?\\s*${n}\\b`, message: "That is the number you started with — find the largest square factor and take it outside the root." }],
        },
        hint: `Look for the largest square number that divides ${n}.`,
        solution: [
          { mark: "M1", text: `$${n} = ${k * k} \\times ${r}$`, why: `${k * k} is a square number, which is what lets it come out of the root.` },
          { mark: "A1", text: `$\\sqrt{${n}} = \\sqrt{${k * k}}\\times\\sqrt{${r}} = ${k}\\sqrt{${r}}$` },
        ],
      };
    },
  },
  {
    id: "surds-rationalise",
    paper: "pure",
    specCode: "2.2",
    topicSlug: "algebra-and-functions",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      // Chosen so that q^2 - r = ±1, which keeps the answer in integers.
      const pairs = [
        { q: 2, r: 3 },
        { q: 1, r: 2 },
        { q: 2, r: 5 },
        { q: 3, r: 10 },
        { q: 4, r: 15 },
        { q: 4, r: 17 },
      ];
      const { q, r } = rng.pick(pairs);
      const d = q * q - r; // ±1
      const p = rng.int(2, 7);
      const a = (p * q) / d;
      const b = -p / d;
      return {
        prompt: `Rationalise the denominator of $\\dfrac{${p}}{${q}+\\sqrt{${r}}}$, giving your answer in the form $a+b\\sqrt{${r}}$.`,
        answer: {
          type: "expression",
          value: `${a} + (${b})*sqrt(${r})`,
          // A surd appearing after a division sign means the denominator has
          // not been rationalised — which is the entire task.
          reject: [{ pattern: "\\/[^/]*sqrt", message: "There is still a surd in the denominator — multiply the top and bottom by the conjugate." }],
        },
        hint: `Multiply the top and the bottom by the conjugate, $${q}-\\sqrt{${r}}$.`,
        solution: [
          { mark: "M1", text: `$\\dfrac{${p}}{${q}+\\sqrt{${r}}}\\times\\dfrac{${q}-\\sqrt{${r}}}{${q}-\\sqrt{${r}}}$`, why: "The conjugate is the same expression with the sign in the middle flipped. It is chosen because it produces a difference of two squares, which has no surd in it." },
          { mark: "M1", text: `Denominator: $(${q})^2-(\\sqrt{${r}})^2 = ${q * q}-${r} = ${d}$`, why: "This is the whole point of the conjugate — the surd terms cancel." },
          { mark: "A1", text: `$= ${a}${signed(b, `\\sqrt{${r}}`)}$` },
        ],
        trap: "Multiplying only the denominator by the conjugate changes the value of the expression. It must be done to both.",
      };
    },
  },
  {
    id: "quadratic-discriminant-equal-roots",
    paper: "pure",
    specCode: "2.3",
    topicSlug: "algebra-and-functions",
    ao: 2,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const t = rng.int(2, 8);
      const c = t * t;
      return {
        prompt: `The equation $x^{2}+kx+${c}=0$ has two equal roots. Given that $k>0$, find the value of $k$.`,
        answer: { type: "numeric", value: 2 * t },
        hint: "Equal roots is a statement about the discriminant. What must $b^2-4ac$ be?",
        solution: [
          { mark: "B1", text: "Two equal roots $\\Rightarrow b^{2}-4ac=0$", why: "This is the translation step, and it is worth a mark on its own. Equal (or repeated) roots always means the discriminant is zero." },
          { mark: "M1", text: `$k^{2}-4(1)(${c})=0 \\Rightarrow k^{2}=${4 * c}$` },
          { mark: "A1", text: `$k=${2 * t}$ (taking the positive root, as given)`, why: `$k=-${2 * t}$ also satisfies the equation, so the condition $k>0$ is doing real work — it is not decoration.` },
        ],
        trap: "Giving both roots when the question restricts to $k>0$, or forgetting the discriminant is zero and setting it greater than zero instead.",
      };
    },
  },
  {
    id: "quadratic-complete-square",
    paper: "pure",
    specCode: "2.3",
    topicSlug: "algebra-and-functions",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const p = rng.nonZeroInt(-6, 6);
      const q = rng.nonZeroInt(-12, 12);
      const b = 2 * p;
      const c = p * p + q;
      return {
        prompt: `Express $x^{2}${signed(b, "x")}${signed(c)}$ in the form $(x+p)^{2}+q$.\n\nWrite down the value of $q$.`,
        answer: { type: "numeric", value: q },
        hint: "Halve the coefficient of $x$ to get $p$. Then $(x+p)^2$ overshoots the constant by $p^2$.",
        solution: [
          { mark: "M1", text: `$p = \\tfrac{1}{2}\\times(${b}) = ${p}$`, why: "Always half the x-coefficient — that is what makes the bracket expand back correctly." },
          { mark: "M1", text: `$(x${signed(p)})^{2} = x^{2}${signed(b, "x")}${signed(p * p)}$, which is ${p * p} too ${p * p > c ? "large" : "small"} in the constant.` },
          { mark: "A1", text: `$q = ${c} - ${p * p} = ${q}$`, why: `So $x^{2}${signed(b, "x")}${signed(c)} \\equiv (x${signed(p)})^{2}${signed(q)}$, and the minimum point is at $(${-p},\\,${q})$.` },
        ],
        trap: "Sign errors when $p$ is negative. Check by expanding your bracket back out — it takes five seconds and catches almost every mistake.",
      };
    },
  },
  {
    id: "quadratic-in-disguise",
    paper: "pure",
    specCode: "2.3",
    topicSlug: "algebra-and-functions",
    ao: 3,
    marks: 4,
    difficulty: 3,
    generate(rng) {
      const [a, b] = rng.sample([1, 2, 3, 4, 5, 6], 2).sort((x, y) => x - y);
      const sum = a + b;
      const product = a * b;
      const larger = Math.max(a, b) ** 2;
      return {
        prompt: `Solve $x-${sum}\\sqrt{x}+${product}=0$.\n\nGive the larger value of $x$.`,
        answer: { type: "numeric", value: larger },
        hint: "Let $u=\\sqrt{x}$. What does the equation become, and what is $x$ in terms of $u$?",
        solution: [
          { mark: "M1", text: `Let $u=\\sqrt{x}$, so $x=u^{2}$ and the equation becomes $u^{2}-${sum}u+${product}=0$.`, why: "This is the 'quadratic in a function of the unknown' the specification warns about — spotting the substitution is the whole question." },
          { mark: "M1", text: `$(u-${a})(u-${b})=0 \\Rightarrow u=${a}$ or $u=${b}$` },
          { mark: "A1", text: `$\\sqrt{x}=${a}\\Rightarrow x=${a * a}$, and $\\sqrt{x}=${b}\\Rightarrow x=${b * b}$` },
          { mark: "A1", text: `Larger value: $x=${larger}$`, why: "Both are valid here because both values of $u$ are positive. If a value of $u$ had come out negative it would have to be rejected, since $\\sqrt{x}$ cannot be negative." },
        ],
        trap: "Stopping at $u$ and forgetting to square back to get $x$.",
      };
    },
  },
  {
    id: "simultaneous-line-curve",
    paper: "pure",
    specCode: "2.4",
    topicSlug: "algebra-and-functions",
    ao: 1,
    marks: 4,
    difficulty: 2,
    generate(rng) {
      const [r1, r2] = rng.sample([-4, -3, -2, -1, 1, 2, 3, 4, 5], 2).sort((a, b) => a - b);
      const m = r1 + r2;
      const c = -r1 * r2;
      return {
        prompt: `The line with equation $y=${leading(m, "x")}${signed(c)}$ meets the curve with equation $y=x^{2}$ at two points.\n\nFind the larger of the two $x$-coordinates.`,
        answer: { type: "numeric", value: r2 },
        hint: "Set the two expressions for $y$ equal to each other and rearrange to a quadratic equal to zero.",
        solution: [
          { mark: "M1", text: `$x^{2}=${leading(m, "x")}${signed(c)}$`, why: "At an intersection the two curves share the same y value, so the expressions can be equated." },
          { mark: "M1", text: `$x^{2}${signed(-m, "x")}${signed(-c)}=0$`, why: "Always collect to one side equal to zero before factorising." },
          { mark: "A1", text: `$(x${signed(-r1)})(x${signed(-r2)})=0 \\Rightarrow x=${r1}$ or $x=${r2}$` },
          { mark: "A1", text: `Larger $x$-coordinate: $x=${r2}$` },
        ],
      };
    },
  },
  {
    id: "quadratic-inequality",
    paper: "pure",
    specCode: "2.5",
    topicSlug: "algebra-and-functions",
    ao: 2,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const [r1, r2] = rng.sample([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], 2).sort((a, b) => a - b);
      const b = -(r1 + r2);
      const c = r1 * r2;
      return {
        prompt: `Solve the inequality $x^{2}${signed(b, "x")}${signed(c)}<0$.\n\nGive the larger of the two critical values.`,
        answer: { type: "numeric", value: r2 },
        hint: "Find where the expression equals zero first. Then think about where the parabola dips below the axis.",
        solution: [
          { mark: "M1", text: `$x^{2}${signed(b, "x")}${signed(c)}=0 \\Rightarrow (x${signed(-r1)})(x${signed(-r2)})=0$` },
          { mark: "A1", text: `Critical values $x=${r1}$ and $x=${r2}$` },
          { mark: "A1", text: `The parabola opens upwards, so it is below the axis BETWEEN the roots: $${r1}<x<${r2}$.`, why: "Sketch it. A positive $x^2$ coefficient means a valley, so 'less than zero' is the inside region and 'greater than zero' is the two outside pieces." },
        ],
        trap: "Writing $x<{-}$ or $x>{-}$ as two separate outside regions when the inequality is < 0. The direction of the parabola decides it, not the inequality sign alone.",
      };
    },
  },
  {
    id: "factor-theorem",
    paper: "pure",
    specCode: "2.6",
    topicSlug: "algebra-and-functions",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const r = rng.pick([-3, -2, -1, 1, 2, 3, 4]);
      const a = rng.nonZeroInt(-4, 4);
      const b = rng.nonZeroInt(-6, 6);
      const c = -(r ** 3 + a * r * r + b * r);
      return {
        prompt: `$\\mathrm{f}(x)=x^{3}${signed(a, "x^{2}")}${signed(b, "x")}+c$\n\nGiven that $(x${signed(-r)})$ is a factor of $\\mathrm{f}(x)$, find the value of $c$.`,
        answer: { type: "numeric", value: c },
        hint: `If $(x${signed(-r)})$ is a factor, what is $\\mathrm{f}(${r})$?`,
        solution: [
          { mark: "M1", text: `$(x${signed(-r)})$ is a factor $\\Rightarrow \\mathrm{f}(${r})=0$`, why: "This is the factor theorem, and stating it is the method mark. The root is the value that makes the bracket zero — note the sign change." },
          { mark: "M1", text: `$(${r})^{3}${signed(a)}(${r})^{2}${signed(b)}(${r})+c=0$` },
          { mark: "A1", text: `$${r ** 3 + a * r * r + b * r}+c=0 \\Rightarrow c=${c}$` },
        ],
        trap: `Substituting $x=${-r}$ instead of $x=${r}$. The factor $(x${signed(-r)})$ is zero when $x=${r}$.`,
      };
    },
  },
  {
    id: "graph-transformation",
    paper: "pure",
    specCode: "2.9",
    topicSlug: "algebra-and-functions",
    ao: 2,
    marks: 2,
    difficulty: 2,
    generate(rng) {
      const a = rng.int(2, 5);
      const kinds = [
        {
          expr: `\\mathrm{f}(x+${a})`,
          answer: `Translation ${a} units in the negative $x$ direction`,
          distractors: [`Translation ${a} units in the positive $x$ direction`, `Translation ${a} units in the positive $y$ direction`, `Stretch, scale factor ${a}, parallel to the $x$-axis`],
          // A template literal, not a plain string: written with quotes, the
          // ${a} stayed literal and rendered as "+" followed by a stray "{a}$".
          why: `Changes inside the bracket act on $x$ and do the opposite of what they look like, so $+${a}$ shifts LEFT.`,
        },
        {
          expr: `\\mathrm{f}(x)+${a}`,
          answer: `Translation ${a} units in the positive $y$ direction`,
          distractors: [`Translation ${a} units in the negative $y$ direction`, `Translation ${a} units in the positive $x$ direction`, `Stretch, scale factor ${a}, parallel to the $y$-axis`],
          why: "Changes outside the bracket act on y and behave exactly as they look.",
        },
        {
          expr: `${a}\\mathrm{f}(x)`,
          answer: `Stretch, scale factor ${a}, parallel to the $y$-axis`,
          distractors: [`Stretch, scale factor ${a}, parallel to the $x$-axis`, `Stretch, scale factor $\\frac{1}{${a}}$, parallel to the $y$-axis`, `Translation ${a} units in the positive $y$ direction`],
          why: "Multiplying the whole function multiplies every y value, stretching vertically.",
        },
        {
          expr: `\\mathrm{f}(${a}x)`,
          answer: `Stretch, scale factor $\\frac{1}{${a}}$, parallel to the $x$-axis`,
          distractors: [`Stretch, scale factor ${a}, parallel to the $x$-axis`, `Stretch, scale factor ${a}, parallel to the $y$-axis`, `Translation ${a} units in the negative $x$ direction`],
          why: `Inside the bracket again, so it is counter-intuitive: multiplying x by ${a} SQUASHES the graph by a factor of ${a}.`,
        },
      ];
      const kind = rng.pick(kinds);
      const options = rng.sample([kind.answer, ...kind.distractors], 4);
      return {
        prompt: `The curve $y=\\mathrm{f}(x)$ is transformed to give the curve $y=${kind.expr}$.\n\nDescribe the transformation.`,
        answer: { type: "choice", value: kind.answer, options },
        hint: "Inside the bracket affects $x$ and does the opposite of what it looks like. Outside the bracket affects $y$ and behaves normally.",
        solution: [{ mark: "B1", text: kind.answer, why: kind.why }],
        trap: "Inside-the-bracket transformations are backwards. This single fact accounts for most lost marks in the topic.",
      };
    },
  },
  {
    id: "perpendicular-line-intercept",
    paper: "pure",
    specCode: "3.1",
    topicSlug: "coordinate-geometry",
    ao: 1,
    marks: 4,
    difficulty: 2,
    generate(rng) {
      const m = rng.int(2, 5);
      const c = rng.nonZeroInt(-6, 6);
      const px = m * rng.nonZeroInt(-3, 3);
      const py = rng.nonZeroInt(-8, 8);
      const intercept = py + px / m;
      return {
        prompt: `The line $l_{1}$ has equation $y=${leading(m, "x")}${signed(c)}$.\n\nThe line $l_{2}$ is perpendicular to $l_{1}$ and passes through the point $P(${px},\\,${py})$.\n\nFind the $y$-intercept of $l_{2}$.`,
        answer: { type: "numeric", value: intercept },
        hint: "Perpendicular gradients multiply to $-1$. Find the new gradient first, then use the point.",
        solution: [
          { mark: "B1", text: `Gradient of $l_{1}$ is $${m}$, so gradient of $l_{2}$ is $${fraction(-1, m)}$`, why: "The negative reciprocal — flip it and change the sign. This formula is NOT in the booklet." },
          { mark: "M1", text: `$y-(${py})=${fraction(-1, m)}(x-(${px}))$`, why: "Using $y-y_1=m(x-x_1)$ with the given point." },
          { mark: "M1", text: `At the $y$-intercept, $x=0$.` },
          { mark: "A1", text: `$y=${py}${signed(px / m)}=${intercept}$` },
        ],
        trap: "Using $-m$ instead of $-1/m$. Reciprocal AND sign change — both, every time.",
      };
    },
  },
  {
    id: "circle-radius",
    paper: "pure",
    specCode: "3.2",
    topicSlug: "coordinate-geometry",
    ao: 1,
    marks: 4,
    difficulty: 2,
    generate(rng) {
      const a = rng.nonZeroInt(-5, 5);
      const b = rng.nonZeroInt(-5, 5);
      const r = rng.int(2, 7);
      const k = a * a + b * b - r * r;
      return {
        prompt: `A circle has equation $x^{2}+y^{2}${signed(-2 * a, "x")}${signed(-2 * b, "y")}${signed(k)}=0$.\n\nFind the radius of the circle.`,
        answer: { type: "numeric", value: r },
        hint: "Complete the square in $x$ and in $y$ separately to get it into the form $(x-a)^2+(y-b)^2=r^2$.",
        solution: [
          { mark: "M1", text: `$x^{2}${signed(-2 * a, "x")} = (x${signed(-a)})^{2}${signed(-a * a)}$`, why: "Complete the square in x: halve the x coefficient." },
          { mark: "M1", text: `$y^{2}${signed(-2 * b, "y")} = (y${signed(-b)})^{2}${signed(-b * b)}$` },
          { mark: "A1", text: `$(x${signed(-a)})^{2}+(y${signed(-b)})^{2}=${r * r}$`, why: `So the centre is $(${a},\\,${b})$ and the radius squared is ${r * r}.` },
          { mark: "A1", text: `Radius $=\\sqrt{${r * r}}=${r}$` },
        ],
        trap: `Giving ${r * r} as the radius. The right-hand side is $r^{2}$, not $r$ — take the square root.`,
      };
    },
  },
  {
    id: "binomial-coefficient",
    paper: "pure",
    specCode: "4.1",
    topicSlug: "sequences-and-series",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const n = rng.int(4, 7);
      const a = rng.int(1, 3);
      const b = rng.int(2, 3);
      const k = rng.int(2, 3);
      const choose = (N: number, K: number) => {
        let out = 1;
        for (let i = 0; i < K; i++) out = (out * (N - i)) / (i + 1);
        return Math.round(out);
      };
      const coefficient = choose(n, k) * Math.pow(a, n - k) * Math.pow(b, k);
      return {
        prompt: `Find the coefficient of $x^{${k}}$ in the binomial expansion of $(${a}+${b}x)^{${n}}$.`,
        answer: { type: "numeric", value: coefficient },
        hint: `The term in $x^{${k}}$ is $\\binom{${n}}{${k}}\\times${a}^{${n - k}}\\times(${b}x)^{${k}}$.`,
        solution: [
          { mark: "M1", text: `Term $=\\binom{${n}}{${k}}(${a})^{${n - k}}(${b}x)^{${k}}$`, why: "The powers of the two parts must add to $n$ — that is the structure of every binomial term." },
          { mark: "M1", text: `$=${choose(n, k)}\\times${Math.pow(a, n - k)}\\times${Math.pow(b, k)}x^{${k}}$`, why: `Note that the $${b}$ is raised to the power ${k} as well as the $x$.` },
          { mark: "A1", text: `Coefficient $=${coefficient}$` },
        ],
        trap: `Forgetting to raise the ${b} to the power ${k}. The bracket $(${b}x)^{${k}}$ means BOTH parts are raised.`,
      };
    },
  },
  {
    id: "cosine-rule",
    paper: "pure",
    specCode: "5.1",
    topicSlug: "trigonometry",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const b = rng.int(4, 12);
      const c = rng.int(4, 12);
      // A = 60 degrees, so cos A = 1/2 and the arithmetic stays exact.
      const aSquared = b * b + c * c - b * c;
      const a = Math.sqrt(aSquared);
      return {
        prompt: `In triangle $ABC$, $AB=${c}\\,\\text{cm}$, $AC=${b}\\,\\text{cm}$ and angle $BAC=60^{\\circ}$.\n\nFind the length of $BC$, giving your answer to 3 significant figures.`,
        answer: { type: "numeric", value: a },
        hint: "Two sides and the angle between them — that is the cosine rule.",
        solution: [
          { mark: "M1", text: `$a^{2}=b^{2}+c^{2}-2bc\\cos A = ${b}^{2}+${c}^{2}-2(${b})(${c})\\cos 60^{\\circ}$`, why: "The cosine rule is used when you know two sides and the included angle. The side you are finding must be OPPOSITE the angle you are given." },
          { mark: "M1", text: `$\\cos 60^{\\circ}=\\tfrac{1}{2}$, so $a^{2}=${b * b}+${c * c}-${b * c}=${aSquared}$`, why: "An exact value worth knowing — it keeps the working clean." },
          { mark: "A1", text: `$a=\\sqrt{${aSquared}}=${a.toFixed(3)}\\,\\text{cm}$ (3 s.f.)` },
        ],
        trap: "Making sure the angle is between the two known sides. If it is not, you need the sine rule instead.",
      };
    },
  },
  {
    id: "trig-equation-interval",
    paper: "pure",
    specCode: "5.7",
    topicSlug: "trigonometry",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const cases = [
        { fn: "\\sin", display: "0.5", value: 0.5, first: 30, second: 150 },
        { fn: "\\sin", display: "\\frac{\\sqrt{3}}{2}", value: Math.sqrt(3) / 2, first: 60, second: 120 },
        { fn: "\\sin", display: "\\frac{\\sqrt{2}}{2}", value: Math.SQRT1_2, first: 45, second: 135 },
        { fn: "\\cos", display: "0.5", value: 0.5, first: 60, second: 300 },
        { fn: "\\cos", display: "\\frac{\\sqrt{3}}{2}", value: Math.sqrt(3) / 2, first: 30, second: 330 },
      ];
      const c = rng.pick(cases);
      return {
        prompt: `Solve $${c.fn} x^{\\circ}=${c.display}$ for $0\\leqslant x<360$.\n\nGive the LARGER of the two solutions.`,
        answer: { type: "numeric", value: c.second },
        hint: `Your calculator gives you one solution. Sketch the ${c.fn === "\\sin" ? "sine" : "cosine"} curve to find the other one in the interval.`,
        solution: [
          { mark: "M1", text: `Principal value: $x=${c.first}$`, why: "This is what the calculator returns — but it is only ever one of the solutions." },
          {
            mark: "M1",
            text:
              c.fn === "\\sin"
                ? `For sine, the second solution in $0$ to $360$ is $180-${c.first}=${c.second}$.`
                : `For cosine, the second solution in $0$ to $360$ is $360-${c.first}=${c.second}$.`,
            why: c.fn === "\\sin" ? "The sine curve is symmetric about $x=90$." : "The cosine curve is symmetric about $x=180$.",
          },
          { mark: "A1", text: `Larger solution: $x=${c.second}$` },
        ],
        trap: "Giving only the calculator value. Missing solutions is the single biggest mark-loser in trigonometry.",
      };
    },
  },
  {
    id: "exact-trig-value",
    paper: "pure",
    specCode: "5.3",
    topicSlug: "trigonometry",
    ao: 1,
    marks: 1,
    difficulty: 1,
    generate(rng) {
      const values = [
        { label: "\\sin 30^{\\circ}", value: 0.5, exact: "\\tfrac{1}{2}", typed: "1/2" },
        { label: "\\cos 60^{\\circ}", value: 0.5, exact: "\\tfrac{1}{2}", typed: "1/2" },
        { label: "\\sin 60^{\\circ}", value: Math.sqrt(3) / 2, exact: "\\tfrac{\\sqrt{3}}{2}", typed: "sqrt(3)/2" },
        { label: "\\cos 30^{\\circ}", value: Math.sqrt(3) / 2, exact: "\\tfrac{\\sqrt{3}}{2}", typed: "sqrt(3)/2" },
        { label: "\\tan 45^{\\circ}", value: 1, exact: "1", typed: "1" },
        { label: "\\tan 60^{\\circ}", value: Math.sqrt(3), exact: "\\sqrt{3}", typed: "sqrt(3)" },
        { label: "\\sin 45^{\\circ}", value: Math.SQRT1_2, exact: "\\tfrac{\\sqrt{2}}{2}", typed: "sqrt(2)/2" },
      ];
      const v = rng.pick(values);
      const needsExact = v.value !== 0.5 && v.value !== 1;
      return {
        prompt: `Write down the exact value of $${v.label}$.`,
        answer: { type: "numeric", value: v.value, requireExact: needsExact, exactForm: v.typed },
        hint: "These come from the two standard triangles — the half equilateral and the half square. They are not in the formula booklet.",
        solution: [{ mark: "B1", text: `$${v.label}=${v.exact}$`, why: "Exact values must be recalled. A rounded decimal scores zero when the question says exact." }],
        trap: "Typing the calculator decimal. 'Exact' means surds and fractions.",
      };
    },
  },
];
