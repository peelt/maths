import type { QuestionTemplate } from "@/lib/questions/types";
import { factor, leading, signed } from "./format";

/**
 * Question templates for vectors: i, j, k form in three dimensions, vector
 * arithmetic and parallel vectors, distance between position vectors, and
 * vectors applied to forces.
 *
 * The distances here come from Pythagorean quadruples, so every answer is a
 * whole number and a wrong one is obviously wrong.
 */

/** (a, b, c, d) with a² + b² + c² = d². */
const QUADRUPLES: ReadonlyArray<readonly [number, number, number, number]> = [
  [1, 2, 2, 3],
  [2, 3, 6, 7],
  [1, 4, 8, 9],
  [4, 4, 7, 9],
  [2, 6, 9, 11],
  [6, 6, 7, 11],
  [3, 4, 12, 13],
  [2, 5, 14, 15],
];

export const pureVectorsQuestions: QuestionTemplate[] = [
  {
    id: "vector-combination-component",
    paper: "pure",
    specCode: "10.1",
    topicSlug: "vectors",
    ao: 1,
    marks: 3,
    difficulty: 1,
    generate(rng) {
      const a = [rng.nonZeroInt(-6, 7), rng.nonZeroInt(-6, 7), rng.nonZeroInt(-6, 7)];
      const b = [rng.nonZeroInt(-5, 6), rng.nonZeroInt(-5, 6), rng.nonZeroInt(-5, 6)];
      const p = rng.int(2, 4);
      const q = rng.int(2, 4);
      const kComponent = p * a[2] - q * b[2];
      const vec = (v: number[]) => `${leading(v[0], "\\mathbf{i}")}${signed(v[1], "\\mathbf{j}")}${signed(v[2], "\\mathbf{k}")}`;
      return {
        prompt: `Given that\n\n$$\\mathbf{a}=${vec(a)},\\qquad \\mathbf{b}=${vec(b)}$$\n\nfind the $\\mathbf{k}$ component of $${p}\\mathbf{a}-${q}\\mathbf{b}$.`,
        answer: { type: "numeric", value: kComponent },
        hint: "Each direction is independent, so you only need to work with the $\\mathbf{k}$ terms.",
        solution: [
          { mark: "M1", text: `The $\\mathbf{k}$ components are $${a[2]}$ and $${b[2]}$.`, why: "Vectors add component by component, so the $\\mathbf{i}$, $\\mathbf{j}$ and $\\mathbf{k}$ directions never mix. That is what makes three dimensions no harder than one." },
          {
            mark: "M1",
            // Parenthesise the raw components and compose the final sign with
            // signed(): a negative b-component would otherwise render as
            // "\times-2" and "6--4".
            text: `$${p}\\times(${a[2]})-${q}\\times(${b[2]})=${p * a[2]}${signed(-q * b[2])}$`,
          },
          { mark: "A1", text: `$${kComponent}\\mathbf{k}$`, why: `A scalar multiplies EVERY component, so the $${q}$ applies to the $\\mathbf{k}$ term of $\\mathbf{b}$ as well.` },
        ],
        trap: `Forgetting that the subtraction applies to the whole of $${q}\\mathbf{b}$, including the sign of its $\\mathbf{k}$ component.`,
      };
    },
  },
  {
    id: "parallel-vectors",
    paper: "pure",
    specCode: "10.3",
    topicSlug: "vectors",
    ao: 2,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const i = rng.nonZeroInt(-5, 6);
      const j = rng.nonZeroInt(-5, 6);
      const k = rng.int(2, 5);
      const target = j * k;
      return {
        prompt: `The vector $${leading(i * k, "\\mathbf{i}")}${signed(target, "\\mathbf{j}")}$ is parallel to $${leading(i, "\\mathbf{i}")}${signed(j, "\\mathbf{j}")}$.\n\nGiven that the first vector is $\\lambda$ times the second, find the value of $\\lambda$.`,
        answer: { type: "numeric", value: k },
        hint: "Parallel vectors are scalar multiples of each other. Compare one pair of components.",
        solution: [
          { mark: "M1", text: `Parallel means $${leading(i * k, "\\mathbf{i}")}${signed(target, "\\mathbf{j}")}=\\lambda\\left(${leading(i, "\\mathbf{i}")}${signed(j, "\\mathbf{j}")}\\right)$`, why: "This is the definition of parallel for vectors: same direction, possibly different length, so one is a scalar multiple of the other." },
          { mark: "M1", text: `Comparing $\\mathbf{i}$ components: $${i * k}=${i}\\lambda$` },
          { mark: "A1", text: `$\\lambda=${k}$`, why: `Checking against the $\\mathbf{j}$ components: $${j}\\times${factor(k)}=${target}$, which agrees. If the two comparisons disagreed, the vectors would not be parallel at all.` },
        ],
        trap: "Comparing only one component and not checking the other. Agreement in both is what makes them genuinely parallel.",
      };
    },
  },
  {
    id: "distance-between-position-vectors",
    paper: "pure",
    specCode: "10.4",
    topicSlug: "vectors",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const [dx, dy, dz, d] = rng.pick(QUADRUPLES);
      const ax = rng.nonZeroInt(-5, 6);
      const ay = rng.nonZeroInt(-5, 6);
      const az = rng.nonZeroInt(-5, 6);
      const sx = rng.chance(0.5) ? 1 : -1;
      const sy = rng.chance(0.5) ? 1 : -1;
      const sz = rng.chance(0.5) ? 1 : -1;
      const b = [ax + sx * dx, ay + sy * dy, az + sz * dz];
      const vec = (v: number[]) => `${leading(v[0], "\\mathbf{i}")}${signed(v[1], "\\mathbf{j}")}${signed(v[2], "\\mathbf{k}")}`;
      return {
        prompt: `The points $A$ and $B$ have position vectors\n\n$$\\overrightarrow{OA}=${vec([ax, ay, az])},\\qquad \\overrightarrow{OB}=${vec(b)}$$\n\nFind the exact distance $AB$.`,
        answer: { type: "numeric", value: d },
        hint: "Find the vector from $A$ to $B$ first, then take its magnitude.",
        solution: [
          { mark: "M1", text: `$\\overrightarrow{AB}=\\overrightarrow{OB}-\\overrightarrow{OA}=${vec([sx * dx, sy * dy, sz * dz])}$`, why: "It is second position vector minus first. Getting this the wrong way round reverses the vector — harmless for a distance, but fatal for a direction." },
          { mark: "M1", text: `$|\\overrightarrow{AB}|=\\sqrt{(${sx * dx})^{2}+(${sy * dy})^{2}+(${sz * dz})^{2}}=\\sqrt{${dx * dx}+${dy * dy}+${dz * dz}}$`, why: "Pythagoras extended to three dimensions. Squaring removes every minus sign, which is why the direction of the subtraction does not matter here." },
          { mark: "A1", text: `$AB=\\sqrt{${d * d}}=${d}$` },
        ],
        trap: "Adding the position vectors instead of subtracting. That gives the diagonal of a parallelogram, not the distance between the two points.",
      };
    },
  },
  {
    id: "resultant-force-vector",
    paper: "pure",
    specCode: "10.5",
    topicSlug: "vectors",
    ao: 3,
    marks: 4,
    difficulty: 3,
    generate(rng) {
      const [px, py, hyp] = rng.pick([
        [3, 4, 5],
        [6, 8, 10],
        [5, 12, 13],
        [9, 12, 15],
        [8, 15, 17],
      ] as const);
      const f1x = rng.nonZeroInt(-6, 7);
      const f1y = rng.nonZeroInt(-6, 7);
      const f2x = px - f1x;
      const f2y = py - f1y;
      const vec = (x: number, y: number) => `${leading(x, "\\mathbf{i}")}${signed(y, "\\mathbf{j}")}`;
      return {
        prompt: `Two forces act on a particle:\n\n$$\\mathbf{F}_{1}=\\left(${vec(f1x, f1y)}\\right)\\text{ N},\\qquad \\mathbf{F}_{2}=\\left(${vec(f2x, f2y)}\\right)\\text{ N}$$\n\nFind the exact magnitude of the resultant force.`,
        answer: { type: "numeric", value: hyp, unit: "N" },
        hint: "Add the forces as vectors first — component by component — and only then find the magnitude.",
        solution: [
          { mark: "M1", text: `$\\mathbf{R}=\\mathbf{F}_{1}+\\mathbf{F}_{2}=${vec(px, py)}$ N`, why: "Forces combine by vector addition, not by adding their sizes. Two forces of 3 N and 4 N can produce anything from 1 N to 7 N depending on direction." },
          { mark: "M1", text: `$|\\mathbf{R}|=\\sqrt{${px}^{2}+${py}^{2}}=\\sqrt{${px * px}+${py * py}}$` },
          { mark: "A1", text: `$=\\sqrt{${hyp * hyp}}$` },
          { mark: "A1", text: `$|\\mathbf{R}|=${hyp}$ N`, why: "The magnitude is a single positive number with units — a force of this size, in the direction of $\\mathbf{R}$, would have exactly the same effect as the two original forces together." },
        ],
        trap: "Finding each magnitude and adding them. That only gives the right answer when the two forces point the same way.",
      };
    },
  },
];
