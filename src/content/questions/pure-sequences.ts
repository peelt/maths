import type { QuestionTemplate } from "@/lib/questions/types";
import { leading, signed } from "./format";

/**
 * Question templates for Year 2 Pure: sequences and series.
 *
 * A note on what is and is not in the formula booklet, because it drives how
 * these mark schemes are written: the arithmetic and geometric SUM formulae
 * are given, but the nth term formulae are NOT. Students routinely assume the
 * opposite and lose marks reconstructing a sum formula they were handed while
 * misremembering an nth term they had to know.
 */
export const pureSequencesQuestions: QuestionTemplate[] = [
  {
    id: "recurrence-relation-terms",
    paper: "pure",
    specCode: "4.2",
    topicSlug: "sequences-and-series",
    ao: 1,
    marks: 3,
    difficulty: 1,
    generate(rng) {
      const a = rng.int(2, 3);
      const b = rng.nonZeroInt(-5, 5);
      const u1 = rng.int(1, 6);
      const u2 = a * u1 + b;
      const u3 = a * u2 + b;
      const u4 = a * u3 + b;
      return {
        prompt: `A sequence is defined by $u_{n+1}=${leading(a, "u_{n}")}${signed(b)}$, with $u_{1}=${u1}$.\n\nFind the value of $u_{4}$.`,
        answer: { type: "numeric", value: u4 },
        hint: "Work up one term at a time. There is no shortcut formula here — a recurrence relation has to be iterated.",
        solution: [
          { mark: "M1", text: `$u_{2}=${a}\\times${u1}${signed(b)}=${u2}$`, why: "Substituting $n=1$. The subscript is the instruction: $u_{n+1}$ is built from the term before it." },
          { mark: "A1", text: `$u_{3}=${a}\\times${u2}${signed(b)}=${u3}$` },
          { mark: "A1", text: `$u_{4}=${a}\\times${u3}${signed(b)}=${u4}$` },
        ],
        trap: "Treating this like an nth term formula and substituting $n=4$ directly. A recurrence relation defines each term from the previous one, so you must climb the ladder.",
      };
    },
  },
  {
    id: "sigma-notation-evaluate",
    paper: "pure",
    specCode: "4.3",
    topicSlug: "sequences-and-series",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const a = rng.nonZeroInt(-5, 6);
      const b = rng.nonZeroInt(-8, 9);
      const n = rng.int(8, 25);
      const triangular = (n * (n + 1)) / 2;
      const total = a * triangular + b * n;
      return {
        prompt: `Evaluate $\\displaystyle\\sum_{r=1}^{${n}}\\big(${leading(a, "r")}${signed(b)}\\big)$.`,
        answer: { type: "numeric", value: total },
        hint: "Split the sum into two pieces. The second is the same constant added to itself over and over.",
        solution: [
          { mark: "M1", text: `$\\displaystyle\\sum_{r=1}^{${n}}\\big(${leading(a, "r")}${signed(b)}\\big)=${a}\\sum_{r=1}^{${n}}r${signed(b, `\\times ${n}`)}$`, why: "The sum of a sum splits, and a constant multiplier comes outside. The constant term is added once for each of the $" + n + "$ values of $r$." },
          { mark: "M1", text: `$\\displaystyle\\sum_{r=1}^{${n}}r=\\frac{${n}\\times${n + 1}}{2}=${triangular}$`, why: "This is an arithmetic series with first term 1 and last term $" + n + "$, so the sum is the number of terms times the average of the ends." },
          { mark: "A1", text: `$${a}\\times${triangular}${signed(b * n)}=${total}$` },
        ],
        trap: `Forgetting that the constant is added ${n} times, not once.`,
      };
    },
  },
  {
    id: "arithmetic-series-sum",
    paper: "pure",
    specCode: "4.4",
    topicSlug: "sequences-and-series",
    ao: 1,
    marks: 3,
    difficulty: 1,
    generate(rng) {
      const a = rng.int(2, 20);
      const d = rng.nonZeroInt(-6, 8);
      const n = rng.int(10, 30);
      const sum = (n / 2) * (2 * a + (n - 1) * d);
      const last = a + (n - 1) * d;
      return {
        prompt: `An arithmetic sequence has first term $${a}$ and common difference $${d}$.\n\nFind the sum of the first $${n}$ terms.`,
        answer: { type: "numeric", value: sum },
        hint: "The sum formula is in the booklet. Identify $a$, $d$ and $n$ before you substitute anything.",
        solution: [
          { mark: "M1", text: `$S_{n}=\\dfrac{n}{2}\\big(2a+(n-1)d\\big)$ with $a=${a}$, $d=${d}$, $n=${n}$`, why: "This formula is GIVEN in the booklet — quoting it costs nothing, so there is no reason to guess it." },
          { mark: "M1", text: `$S_{${n}}=\\dfrac{${n}}{2}\\big(${2 * a}${signed((n - 1) * d)}\\big)=\\dfrac{${n}}{2}\\times${2 * a + (n - 1) * d}$` },
          { mark: "A1", text: `$S_{${n}}=${sum}$`, why: `As a check, the last term is $${last}$, and $\\dfrac{${n}}{2}(${a}+${last})$ gives the same total.` },
        ],
        trap: `Using $n$ where $(n-1)$ belongs. There are ${n} terms but only ${n - 1} gaps between them.`,
      };
    },
  },
  {
    id: "arithmetic-series-find-n",
    paper: "pure",
    specCode: "4.4",
    topicSlug: "sequences-and-series",
    ao: 2,
    marks: 4,
    difficulty: 3,
    generate(rng) {
      // Built backwards from a known n, so the quadratic always factorises.
      const a = rng.int(1, 9);
      const d = rng.int(2, 6);
      const n = rng.int(8, 20);
      const sum = (n / 2) * (2 * a + (n - 1) * d);
      return {
        prompt: `An arithmetic series has first term $${a}$ and common difference $${d}$. The sum of the first $n$ terms is $${sum}$.\n\nFind the value of $n$.`,
        answer: { type: "numeric", value: n },
        hint: "Substitute into the sum formula and rearrange. You will get a quadratic in $n$.",
        solution: [
          { mark: "M1", text: `$\\dfrac{n}{2}\\big(${2 * a}+(n-1)\\times${d}\\big)=${sum}$`, why: "Substituting the known values into the given sum formula, leaving $n$ as the unknown." },
          { mark: "M1", text: `$n\\big(${2 * a - d}${signed(d, "n")}\\big)=${2 * sum} \\Rightarrow ${leading(d, "n^{2}")}${signed(2 * a - d, "n")}-${2 * sum}=0$`, why: "Multiplying by 2 clears the fraction. Always do this before expanding — it keeps the numbers whole." },
          { mark: "dM1", text: `Solving the quadratic gives $n=${n}$ or a negative value.` },
          { mark: "A1", text: `$n=${n}$`, why: "The negative root is rejected: $n$ counts terms, so it must be a positive whole number. Saying so is worth a mark." },
        ],
        trap: "Giving both roots. A number of terms cannot be negative or fractional, and the rejection must be stated.",
      };
    },
  },
  {
    id: "geometric-sum-to-infinity",
    paper: "pure",
    specCode: "4.5",
    topicSlug: "sequences-and-series",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      // Each case is chosen so a/(1-r) comes out exactly.
      const cases = [
        { r: "\\frac{1}{2}", value: 0.5, unit: 2 },
        { r: "\\frac{1}{3}", value: 1 / 3, unit: 2 },
        { r: "\\frac{2}{3}", value: 2 / 3, unit: 1 },
        { r: "\\frac{1}{4}", value: 0.25, unit: 4 },
        { r: "\\frac{3}{4}", value: 0.75, unit: 1 },
        { r: "-\\frac{1}{2}", value: -0.5, unit: 6 },
        { r: "-\\frac{1}{3}", value: -1 / 3, unit: 12 },
      ];
      const chosen = rng.pick(cases);
      const a = chosen.unit * rng.int(2, 9);
      const sum = a / (1 - chosen.value);
      return {
        prompt: `A geometric series has first term $${a}$ and common ratio $${chosen.r}$.\n\nFind the sum to infinity.`,
        answer: { type: "numeric", value: sum },
        hint: "Check the ratio makes a sum to infinity possible at all, then use the formula from the booklet.",
        solution: [
          { mark: "B1", text: `$|r|=${Math.abs(chosen.value).toFixed(4).replace(/0+$/, "").replace(/\.$/, "")}<1$, so the series converges.`, why: "Stating the condition is worth a mark on its own, and it is the step most often skipped." },
          { mark: "M1", text: `$S_{\\infty}=\\dfrac{a}{1-r}=\\dfrac{${a}}{1-\\left(${chosen.r}\\right)}$`, why: "This formula is given in the booklet." },
          { mark: "A1", text: `$S_{\\infty}=${sum}$` },
        ],
        trap: "Subtracting a negative ratio wrongly. When $r$ is negative, $1-r$ is bigger than 1, so the sum is smaller than the first term over 1.",
      };
    },
  },
  {
    id: "geometric-nth-term",
    paper: "pure",
    specCode: "4.5",
    topicSlug: "sequences-and-series",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const a = rng.int(2, 12);
      const r = rng.pick([2, 3, -2]);
      const n = rng.int(4, 8);
      const term = a * Math.pow(r, n - 1);
      return {
        prompt: `A geometric sequence has first term $${a}$ and common ratio $${r}$.\n\nFind the ${n}th term.`,
        answer: { type: "numeric", value: term },
        hint: "The nth term of a geometric sequence is the first term multiplied by the ratio one fewer times than you expect.",
        solution: [
          { mark: "M1", text: `$u_{n}=ar^{\\,n-1}$, so $u_{${n}}=${a}\\times(${r})^{${n - 1}}$`, why: "This formula is NOT in the booklet — it has to be recalled. The power is $n-1$ because the first term has been multiplied by $r$ zero times." },
          { mark: "M1", text: `$(${r})^{${n - 1}}=${Math.pow(r, n - 1)}$` },
          { mark: "A1", text: `$u_{${n}}=${term}$` },
        ],
        trap: `Using $r^{${n}}$ instead of $r^{${n - 1}}$. Test it on the first term: $u_{1}$ must come back as $${a}$, which only works with the $n-1$ power.`,
      };
    },
  },
  {
    id: "series-in-modelling",
    paper: "pure",
    specCode: "4.6",
    topicSlug: "sequences-and-series",
    ao: 3,
    marks: 4,
    difficulty: 3,
    generate(rng) {
      const geometric = rng.chance(0.5);
      const years = rng.int(5, 12);
      if (geometric) {
        const start = rng.int(18, 32) * 1000;
        const percent = rng.pick([2, 3, 4, 5]);
        const r = 1 + percent / 100;
        const total = (start * (Math.pow(r, years) - 1)) / (r - 1);
        return {
          prompt: `A graduate's starting salary is $\\pounds${start}$. Each year the salary rises by $${percent}\\%$ of the previous year's salary.\n\nFind the total earned over the first $${years}$ years, to the nearest pound.`,
          answer: { type: "numeric", value: Math.round(total), tolerance: 1 },
          hint: "A fixed percentage rise means each year is a constant multiple of the last. That makes this geometric, not arithmetic.",
          solution: [
            { mark: "B1", text: `Geometric with $a=${start}$, $r=${r}$, $n=${years}$.`, why: `A rise of $${percent}\\%$ multiplies by $${r}$ — it does not add a fixed amount, which is what makes this geometric.` },
            { mark: "M1", text: `$S_{n}=\\dfrac{a(r^{n}-1)}{r-1}=\\dfrac{${start}\\big(${r}^{${years}}-1\\big)}{${r}-1}$` },
            { mark: "M1", text: `$${r}^{${years}}=${Math.pow(r, years).toFixed(6)}$` },
            { mark: "A1", text: `Total $=\\pounds${Math.round(total)}$`, why: "Rounding only at the very end. Rounding the power first would shift the answer by pounds." },
          ],
          trap: `Treating a ${percent}\\% rise as adding a fixed amount each year. That would be arithmetic and gives a different, smaller total.`,
        };
      }
      const start = rng.int(150, 400);
      const rise = rng.int(10, 45);
      const total = (years / 2) * (2 * start + (years - 1) * rise);
      const finalMonth = start + (years - 1) * rise;
      return {
        prompt: `A saver puts $\\pounds${start}$ into an account in the first month. Each month after that she puts in $\\pounds${rise}$ more than the month before.\n\nFind the total saved after $${years}$ months.`,
        answer: { type: "numeric", value: total },
        hint: "A fixed extra amount each month means a constant difference, so this is an arithmetic series.",
        solution: [
          { mark: "B1", text: `Arithmetic with $a=${start}$, $d=${rise}$, $n=${years}$.`, why: "A fixed extra amount is a common difference. A fixed percentage would have made it geometric." },
          { mark: "M1", text: `$S_{${years}}=\\dfrac{${years}}{2}\\big(2\\times${start}+${years - 1}\\times${rise}\\big)$` },
          { mark: "M1", text: `$=\\dfrac{${years}}{2}\\times${2 * start + (years - 1) * rise}$` },
          { mark: "A1", text: `Total $=\\pounds${total}$`, why: `The final month's deposit is $\\pounds${finalMonth}$, which is a useful sanity check on the size of the total.` },
        ],
        trap: `Adding $\\pounds${rise}$ in the first month too. The first month is $\\pounds${start}$ exactly; the rise starts from month two, which is why the formula uses $(n-1)$.`,
      };
    },
  },
];
