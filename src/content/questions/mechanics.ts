import type { QuestionTemplate } from "@/lib/questions/types";
import { G } from "./numeric";
import { signed } from "./format";

/**
 * Question templates for Paper 3, Section B: Mechanics.
 *
 * Mechanics marks are lost in very predictable places — units not converted,
 * a sign chosen and then not stuck to, a missing force on the diagram, and
 * using F = muR when the body is in equilibrium rather than moving. The
 * solutions here name those explicitly rather than just showing the algebra.
 */
export const mechanicsQuestions: QuestionTemplate[] = [
  {
    id: "unit-conversion",
    paper: "mechanics",
    specCode: "6.1",
    topicSlug: "quantities-and-units",
    ao: 1,
    marks: 2,
    difficulty: 1,
    generate(rng) {
      const kmh = rng.pick([18, 36, 54, 72, 90, 108, 126]);
      return {
        prompt: `A car is travelling at ${kmh} km h$^{-1}$.\n\nExpress this speed in m s$^{-1}$.`,
        answer: { type: "numeric", value: kmh / 3.6 },
        hint: "There are 1000 metres in a kilometre and 3600 seconds in an hour.",
        solution: [
          { mark: "M1", text: `$${kmh}\\times\\dfrac{1000}{3600}$`, why: "Multiply by metres per kilometre, divide by seconds per hour. Dividing by 3.6 is the same thing and is quicker." },
          { mark: "A1", text: `$=${kmh / 3.6}\\ \\text{m s}^{-1}$` },
        ],
        trap: "Do this conversion FIRST, before any other working. Mixing units part way through a mechanics question is one of the most expensive mistakes on the paper, because it invalidates everything after it.",
      };
    },
  },
  {
    id: "suvat-displacement",
    paper: "mechanics",
    specCode: "7.3",
    topicSlug: "kinematics",
    ao: 1,
    marks: 3,
    difficulty: 1,
    generate(rng) {
      const u = rng.int(2, 15);
      const a = rng.pick([0.5, 1, 1.5, 2, 2.5, 3]);
      const t = rng.int(3, 12);
      const s = u * t + 0.5 * a * t * t;
      return {
        prompt: `A particle moves in a straight line with constant acceleration ${a} m s$^{-2}$. It has initial velocity ${u} m s$^{-1}$.\n\nFind the distance travelled in the first ${t} seconds.`,
        answer: { type: "numeric", value: s },
        hint: "You know $u$, $a$ and $t$, and you want $s$. Which of the constant acceleration formulae uses exactly those four?",
        solution: [
          { mark: "M1", text: `$s=ut+\\tfrac{1}{2}at^{2}$`, why: "List what you know and what you want, then pick the formula containing exactly those. These are given in the formula booklet." },
          { mark: "M1", text: `$s=${u}\\times${t}+\\tfrac{1}{2}\\times${a}\\times${t}^{2}$` },
          { mark: "A1", text: `$s=${u * t}+${0.5 * a * t * t}=${s}\\ \\text{m}$` },
        ],
        trap: "These formulae only apply when the acceleration is CONSTANT. If acceleration is given as a function of time, you must use calculus instead.",
      };
    },
  },
  {
    id: "vertical-motion-height",
    paper: "mechanics",
    specCode: "7.3",
    topicSlug: "kinematics",
    ao: 2,
    marks: 4,
    difficulty: 2,
    generate(rng) {
      const u = rng.int(8, 30);
      const height = (u * u) / (2 * G);
      return {
        prompt: `A ball is projected vertically upwards from ground level with speed ${u} m s$^{-1}$.\n\nTaking $g=9.8$ m s$^{-2}$ and ignoring air resistance, find the greatest height reached, to 3 significant figures.`,
        answer: { type: "numeric", value: height },
        hint: "What is the velocity of the ball at the instant it is highest?",
        solution: [
          { mark: "B1", text: "At the greatest height the velocity is momentarily zero, so $v=0$.", why: "This is the modelling step and it is a mark on its own. Without it there is nothing to substitute." },
          { mark: "M1", text: `Taking upwards as positive: $v^{2}=u^{2}+2as$ with $u=${u}$, $v=0$, $a=-9.8$` },
          { mark: "M1", text: `$0=${u * u}-19.6s$`, why: "Gravity acts downwards while the ball moves upwards, so with up as positive the acceleration is negative. State your positive direction — examiners look for it." },
          { mark: "A1", text: `$s=\\dfrac{${u * u}}{19.6}=${height.toFixed(3)}\\ \\text{m}$ (3 s.f.)` },
        ],
        trap: "Sign errors. Choose a positive direction, write it down, and apply it to every quantity — including the initial velocity if the object is thrown downwards.",
      };
    },
  },
  {
    id: "velocity-time-graph",
    paper: "mechanics",
    specCode: "7.2",
    topicSlug: "kinematics",
    ao: 2,
    marks: 4,
    difficulty: 2,
    generate(rng) {
      const v = rng.int(10, 30);
      const t1 = rng.int(3, 8);
      const t2 = rng.int(10, 30);
      const t3 = rng.int(4, 10);
      const total = t1 + t2 + t3;
      // Area of a trapezium: half the sum of the parallel sides, times height.
      const distance = 0.5 * (total + t2) * v;
      return {
        prompt: `A train accelerates uniformly from rest to ${v} m s$^{-1}$ in ${t1} s, travels at that constant speed for ${t2} s, then decelerates uniformly to rest in a further ${t3} s.\n\nFind the total distance travelled.`,
        answer: { type: "numeric", value: distance },
        hint: "Sketch the velocity-time graph. The area underneath it is the distance.",
        solution: [
          { mark: "B1", text: "The area under a velocity-time graph is the distance travelled.", why: "Worth stating explicitly. It is also why the constant acceleration formulae work at all — they are just areas of this shape." },
          { mark: "M1", text: `The graph is a trapezium with parallel sides ${total} s (the whole journey) and ${t2} s (the constant-speed section), and height ${v} m s$^{-1}$.` },
          { mark: "M1", text: `Area $=\\tfrac{1}{2}(${total}+${t2})\\times${v}$`, why: "Splitting it into a triangle, rectangle and triangle gives exactly the same answer if you prefer." },
          { mark: "A1", text: `Distance $=${distance}\\ \\text{m}$` },
        ],
        trap: "Using a suvat formula across the whole journey. The acceleration is not constant throughout — it changes at each stage — so the formulae only apply to one stage at a time.",
      };
    },
  },
  {
    id: "calculus-kinematics",
    paper: "mechanics",
    specCode: "7.4",
    topicSlug: "kinematics",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const a = rng.int(2, 6);
      const b = rng.nonZeroInt(-8, 8);
      const c = rng.nonZeroInt(-6, 6);
      const t = rng.int(2, 6);
      const acceleration = 2 * a * t + b;
      return {
        prompt: `A particle moves in a straight line. At time $t$ seconds its velocity is\n\n$v=${a}t^{2}${signed(b, "t")}${signed(c)}$ m s$^{-1}$.\n\nFind the acceleration when $t=${t}$.`,
        answer: { type: "numeric", value: acceleration },
        hint: "Acceleration is the rate of change of velocity.",
        solution: [
          {
            mark: "M1",
            text: `$a=\\dfrac{dv}{dt}=${2 * a}t${signed(b)}$`,
            why: "The velocity depends on time, so the acceleration is NOT constant and the suvat formulae do not apply. Differentiating is the only route.",
          },
          { mark: "M1", text: `At $t=${t}$: $a=${2 * a}\\times${t}${signed(b)}$` },
          { mark: "A1", text: `$a=${acceleration}\\ \\text{m s}^{-2}$` },
        ],
        trap: "Reaching for a suvat formula. The moment velocity is given as a function of t, acceleration is varying and you must use calculus.",
      };
    },
  },
  {
    id: "projectile-time-of-flight",
    paper: "mechanics",
    specCode: "7.5",
    topicSlug: "kinematics",
    ao: 2,
    marks: 4,
    difficulty: 3,
    generate(rng) {
      const u = rng.int(15, 40);
      const angle = rng.pick([30, 45, 60]);
      const rad = (angle * Math.PI) / 180;
      const time = (2 * u * Math.sin(rad)) / G;
      return {
        prompt: `A projectile is launched from ground level with speed ${u} m s$^{-1}$ at ${angle}$^{\\circ}$ above the horizontal.\n\nTaking $g=9.8$ m s$^{-2}$, find the time of flight, to 3 significant figures.`,
        answer: { type: "numeric", value: time },
        hint: "Consider the vertical motion only. The projectile lands when its vertical displacement returns to zero.",
        solution: [
          {
            mark: "B1",
            text: `Vertical component of the initial velocity: $${u}\\sin ${angle}^{\\circ}=${(u * Math.sin(rad)).toFixed(3)}$ m s$^{-1}$`,
            why: "Horizontal and vertical motion are independent and share only the time. Resolving into components is always the first move.",
          },
          { mark: "M1", text: `Vertically, taking up as positive, $s=0$ on landing: $0=${(u * Math.sin(rad)).toFixed(3)}t-\\tfrac{1}{2}(9.8)t^{2}$` },
          { mark: "M1", text: `$t\\big(${(u * Math.sin(rad)).toFixed(3)}-4.9t\\big)=0$`, why: "The root $t = 0$ is the launch instant, so the flight time is the other one." },
          { mark: "A1", text: `$t=${time.toFixed(3)}\\ \\text{s}$ (3 s.f.)` },
        ],
        trap: "Using the full speed rather than its vertical component. Horizontally there is no acceleration; vertically there is gravity. They are separate problems joined only by time.",
      };
    },
  },
  {
    id: "newtons-second-law",
    paper: "mechanics",
    specCode: "8.2",
    topicSlug: "forces-and-newtons-laws",
    ao: 1,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const mass = rng.int(2, 20);
      const resistance = rng.int(4, 30);
      const acceleration = rng.pick([0.5, 1, 1.5, 2, 2.5]);
      const driving = mass * acceleration + resistance;
      return {
        prompt: `A block of mass ${mass} kg is pulled along a horizontal surface by a horizontal force of $F$ N. A constant resistance of ${resistance} N opposes the motion.\n\nThe block accelerates at ${acceleration} m s$^{-2}$. Find $F$.`,
        answer: { type: "numeric", value: driving },
        hint: "Newton's second law applies to the RESULTANT force along the direction of motion.",
        solution: [
          { mark: "M1", text: `Resolving horizontally, in the direction of motion: $F-${resistance}=ma$`, why: "The resultant force is the driving force minus the resistance. Always state which direction you are taking as positive." },
          { mark: "M1", text: `$F-${resistance}=${mass}\\times${acceleration}$` },
          { mark: "A1", text: `$F=${mass * acceleration}+${resistance}=${driving}\\ \\text{N}$` },
        ],
        trap: `Setting $F = ma$ and forgetting the resistance. F = ma applies to the RESULTANT force, not to one of the forces acting.`,
      };
    },
  },
  {
    id: "connected-particles",
    paper: "mechanics",
    specCode: "8.4",
    topicSlug: "forces-and-newtons-laws",
    ao: 3,
    marks: 5,
    difficulty: 3,
    generate(rng) {
      const heavy = rng.int(4, 12);
      const light = rng.int(1, heavy - 1);
      const acceleration = ((heavy - light) * G) / (heavy + light);
      return {
        prompt: `Two particles of mass ${heavy} kg and ${light} kg are connected by a light inextensible string passing over a smooth fixed pulley.\n\nThe system is released from rest. Taking $g=9.8$ m s$^{-2}$, find the acceleration of the system, to 3 significant figures.`,
        answer: { type: "numeric", value: acceleration },
        hint: "Write an equation of motion for each particle separately. They share the same magnitude of acceleration, and the same tension.",
        solution: [
          {
            mark: "M1",
            text: `For the ${heavy} kg mass (moving down): $${heavy}g-T=${heavy}a$`,
            why: "A separate equation for each particle. The pulley is smooth, so the tension is the same throughout the string, and the string is inextensible, so the accelerations have equal magnitude.",
          },
          { mark: "M1", text: `For the ${light} kg mass (moving up): $T-${light}g=${light}a$` },
          { mark: "M1", text: `Adding eliminates $T$: $(${heavy}-${light})g=(${heavy}+${light})a$`, why: "Adding the two equations is the standard trick — the tension is equal and opposite, so it cancels." },
          { mark: "A1", text: `$a=\\dfrac{${heavy - light}\\times9.8}{${heavy + light}}$` },
          { mark: "A1", text: `$a=${acceleration.toFixed(3)}\\ \\text{m s}^{-2}$ (3 s.f.)` },
        ],
        trap: "Treating the two masses as one object of combined mass and forgetting that they move in opposite directions. Write one equation per particle.",
      };
    },
  },
  {
    id: "friction-limiting",
    paper: "mechanics",
    specCode: "8.6",
    topicSlug: "forces-and-newtons-laws",
    ao: 2,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const mass = rng.int(3, 20);
      const mu = rng.pick([0.2, 0.25, 0.3, 0.4, 0.5]);
      const force = mu * mass * G;
      return {
        prompt: `A block of mass ${mass} kg rests on a rough horizontal surface. The coefficient of friction between the block and the surface is ${mu}.\n\nTaking $g=9.8$ m s$^{-2}$, find the least horizontal force needed to move the block, to 3 significant figures.`,
        answer: { type: "numeric", value: force },
        hint: "On the point of moving, friction is at its maximum. What is the normal reaction on a horizontal surface?",
        solution: [
          {
            mark: "B1",
            text: `Resolving vertically: $R=${mass}g=${(mass * G).toFixed(1)}$ N`,
            why: "On a HORIZONTAL surface with no other vertical forces, the normal reaction equals the weight. On a slope it would not — it would be the component perpendicular to the slope.",
          },
          { mark: "M1", text: `On the point of moving, friction is limiting: $F=\\mu R=${mu}\\times${(mass * G).toFixed(1)}$`, why: "The friction model is $F \\leqslant \\mu R$, with equality only when the body is moving or about to move. 'Least force needed to move' is exactly that case." },
          { mark: "A1", text: `$F=${force.toFixed(3)}\\ \\text{N}$ (3 s.f.)` },
        ],
        trap: "Using $F = \\mu R$ in a statics problem where the body is NOT on the point of moving. In equilibrium friction is whatever it needs to be, up to that maximum — the relation is an inequality.",
      };
    },
  },
  {
    id: "moments-rod",
    paper: "mechanics",
    specCode: "9.1",
    topicSlug: "moments",
    ao: 3,
    marks: 4,
    difficulty: 3,
    generate(rng) {
      const length = rng.pick([4, 6, 8]);
      const weight = rng.int(3, 15) * 2;
      const particleWeight = rng.int(1, 5) * length;
      const distance = rng.int(1, length - 1);
      const reactionB = weight / 2 + (particleWeight * distance) / length;
      return {
        prompt: `A uniform rod $AB$ of length ${length} m and weight ${weight} N rests horizontally on supports at $A$ and $B$.\n\nA particle of weight ${particleWeight} N is placed on the rod at a distance ${distance} m from $A$.\n\nFind the magnitude of the reaction at $B$.`,
        answer: { type: "numeric", value: reactionB },
        hint: "Take moments about $A$ — that makes the reaction at $A$ disappear from the equation entirely.",
        solution: [
          {
            mark: "B1",
            text: `The rod is uniform, so its weight acts at the midpoint, ${length / 2} m from $A$.`,
            why: "Uniform is doing real work in the question — it is what tells you where the weight acts.",
          },
          {
            mark: "M1",
            text: `Taking moments about $A$: $R_{B}\\times${length}=${weight}\\times${length / 2}+${particleWeight}\\times${distance}$`,
            why: "Choosing A as the pivot eliminates the unknown reaction at A, because its moment about A is zero. Always take moments about a point where an unknown force acts.",
          },
          { mark: "M1", text: `$R_{B}\\times${length}=${(weight * length) / 2}+${particleWeight * distance}=${(weight * length) / 2 + particleWeight * distance}$` },
          { mark: "A1", text: `$R_{B}=${reactionB}\\ \\text{N}$` },
        ],
        trap: "Using the distance from the wrong end, or forgetting the rod's own weight entirely. Draw the diagram and mark every force with its distance from your pivot before writing anything.",
      };
    },
  },
];
