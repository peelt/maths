import type { QuestionTemplate } from "@/lib/questions/types";
import { signed } from "./format";

/**
 * Further Mechanics templates: the vocabulary of kinematics (where the
 * distinction between vector and scalar quantities earns marks), Newton's
 * first law and the named forces, weight and g, and resolving forces in a
 * plane.
 */
export const mechanicsFurtherQuestions: QuestionTemplate[] = [
  {
    id: "distance-versus-displacement",
    paper: "mechanics",
    specCode: "7.1",
    topicSlug: "kinematics",
    ao: 2,
    marks: 3,
    difficulty: 2,
    generate(rng) {
      const out = rng.int(8, 30);
      const back = rng.int(3, out - 1);
      const displacement = out - back;
      const distance = out + back;
      const askDistance = rng.chance(0.5);
      return {
        prompt: `A runner travels $${out}$ m due north, then turns and travels $${back}$ m due south.\n\nFind the total ${askDistance ? "distance travelled" : "displacement from the starting point"}, in metres.`,
        answer: { type: "numeric", value: askDistance ? distance : displacement, unit: "m" },
        hint: askDistance
          ? "Distance counts every metre covered, whichever way the runner was facing."
          : "Displacement is measured from start to finish, so the two legs partly cancel.",
        solution: askDistance
          ? [
              { mark: "M1", text: `Distance is a scalar: every metre counts, regardless of direction.`, why: "Distance travelled can never decrease and can never be negative. It is a total, not a position." },
              { mark: "M1", text: `$${out}+${back}$` },
              { mark: "A1", text: `Distance $=${distance}$ m` },
            ]
          : [
              { mark: "M1", text: `Displacement is a vector: north is positive, so south is negative.`, why: "Displacement measures where you ended up relative to where you started. The route taken is irrelevant." },
              { mark: "M1", text: `$${out}${signed(-back)}$` },
              { mark: "A1", text: `Displacement $=${displacement}$ m north`, why: `The direction is part of the answer. Note the distance travelled was $${distance}$ m — much larger, because the return leg added to it rather than cancelling.` },
            ],
        trap: askDistance
          ? `Answering $${displacement}$ m by subtracting. That is the displacement; distance travelled never subtracts.`
          : `Answering $${distance}$ m by adding. That is the distance travelled; displacement takes direction into account.`,
      };
    },
  },
  {
    id: "newton-first-law-forces",
    paper: "mechanics",
    specCode: "8.1",
    topicSlug: "forces-and-newtons-laws",
    ao: 2,
    marks: 2,
    difficulty: 1,
    generate(rng) {
      const cases = [
        {
          context: "A book rests on a horizontal table.",
          answer: "The normal reaction from the table, acting vertically upwards.",
          options: [
            "The normal reaction from the table, acting vertically upwards.",
            "The weight of the book, acting vertically upwards.",
            "A frictional force, acting vertically upwards.",
            "The tension in the table, acting vertically upwards.",
          ],
          why: "A surface pushes on whatever rests against it, at right angles to the surface — that is what 'normal' means here. It balances the weight exactly, which is why the book stays still.",
        },
        {
          context: "A lamp hangs at rest from a vertical string attached to the ceiling.",
          answer: "The tension in the string, acting vertically upwards.",
          options: [
            "The tension in the string, acting vertically upwards.",
            "The thrust in the string, acting vertically upwards.",
            "The normal reaction from the string, acting vertically upwards.",
            "The weight of the string, acting vertically upwards.",
          ],
          why: "A string can only pull, never push, and a pull along a string is called tension. A rod could push instead, and that would be a thrust.",
        },
        {
          context: "A box is pushed along a rough horizontal floor at a constant speed.",
          answer: "The forces are balanced, because constant velocity means zero acceleration.",
          options: [
            "The forces are balanced, because constant velocity means zero acceleration.",
            "The pushing force must be larger than friction to keep the box moving.",
            "The forces are unbalanced, because the box is moving.",
            "Friction must be zero, since the box is not slowing down.",
          ],
          why: "Newton's first law: a body moving at constant velocity has no resultant force. Motion does not require a net force — only a CHANGE of motion does.",
        },
      ];
      const c = rng.pick(cases);
      return {
        prompt: `${c.context}\n\nWhich statement is correct?`,
        answer: { type: "choice", value: c.answer, options: c.options },
        hint: "Newton's first law says a body at rest, or moving at constant velocity, has no resultant force acting on it.",
        solution: [
          { mark: "M1", text: c.answer, why: c.why },
          { mark: "A1", text: "Naming the force correctly matters: weight, normal reaction, tension, thrust, friction and resistance are all distinct.", why: "Mark schemes will not accept 'the force of the table'. The names carry meaning about direction and about what can produce them." },
        ],
        trap: "Assuming that anything moving must have a resultant force on it. Constant velocity and being at rest are both states of zero resultant force.",
      };
    },
  },
  {
    id: "weight-and-gravity",
    paper: "mechanics",
    specCode: "8.3",
    topicSlug: "forces-and-newtons-laws",
    ao: 1,
    marks: 3,
    difficulty: 1,
    generate(rng) {
      const mass = rng.int(2, 40);
      const g = 9.8;
      const weight = mass * g;
      const t = rng.int(1, 4);
      const speed = g * t;
      const askWeight = rng.chance(0.5);
      return {
        prompt: askWeight
          ? `A particle has mass $${mass}$ kg. Taking $g=${g}\\ \\mathrm{m\\,s^{-2}}$, find its weight in newtons.`
          : `A stone is released from rest and falls freely. Taking $g=${g}\\ \\mathrm{m\\,s^{-2}}$, find its speed after $${t}$ seconds, in $\\mathrm{m\\,s^{-1}}$.`,
        answer: { type: "numeric", value: askWeight ? weight : speed, unit: askWeight ? "N" : "m s⁻¹" },
        hint: askWeight
          ? "Weight is a force, and force is mass times acceleration. The acceleration here is $g$."
          : "Released from rest means the initial velocity is zero. Use the constant acceleration formulae with $a=g$.",
        solution: askWeight
          ? [
              { mark: "M1", text: `$W=mg=${mass}\\times${g}$`, why: "Mass is a scalar measured in kilograms; weight is the FORCE that gravity exerts on that mass, measured in newtons. They are different quantities with different units." },
              { mark: "A1", text: `$W=${weight.toFixed(1)}$ N` },
              { mark: "A1", text: `The same particle on the Moon would have the same mass but a much smaller weight.`, why: `The spec expects awareness that $g$ depends on location. Using $g=9.8$ is a modelling assumption about being near the Earth's surface — and the number itself is given only to 2 significant figures, which caps the accuracy of any answer built on it.` },
            ]
          : [
              { mark: "M1", text: `$u=0$, $a=${g}$, $t=${t}$, and $v=u+at$`, why: "'Released from rest' is the exam's way of telling you $u=0$. The suvat formulae are given in the booklet." },
              { mark: "M1", text: `$v=0+${g}\\times${t}$` },
              { mark: "A1", text: `$v=${speed.toFixed(1)}\\ \\mathrm{m\\,s^{-1}}$`, why: `Free fall means air resistance is being ignored. For a stone over ${t} seconds that is reasonable; for a feather it would not be.` },
            ],
        trap: askWeight
          ? `Giving the answer as $${mass}$ N. That is the mass in kilograms — weight is $mg$, and the units are newtons.`
          : "Forgetting that the object starts from rest and adding an initial speed that was never given.",
      };
    },
  },
  {
    id: "resolving-forces-in-a-plane",
    paper: "mechanics",
    specCode: "8.5",
    topicSlug: "forces-and-newtons-laws",
    ao: 2,
    marks: 4,
    difficulty: 3,
    generate(rng) {
      const force = rng.int(10, 60);
      const angle = rng.pick([20, 25, 30, 35, 40, 45, 50, 60]);
      const horizontal = force * Math.cos((angle * Math.PI) / 180);
      const mass = rng.int(4, 20);
      const acceleration = horizontal / mass;
      return {
        prompt: `A sledge of mass $${mass}$ kg is pulled along smooth horizontal ground by a rope. The rope is at $${angle}^{\\circ}$ to the horizontal and the tension in it is $${force}$ N.\n\nFind the acceleration of the sledge, in $\\mathrm{m\\,s^{-2}}$, to 3 significant figures.`,
        answer: { type: "numeric", value: acceleration, unit: "m s⁻²" },
        hint: "Only the part of the tension acting along the direction of motion can accelerate the sledge. Resolve horizontally.",
        solution: [
          { mark: "M1", text: `Resolving horizontally: $T\\cos${angle}^{\\circ}=${force}\\cos${angle}^{\\circ}$`, why: `The rope pulls at an angle, so only its horizontal component drives the sledge forward. It is $\\cos$ because $${angle}^{\\circ}$ is measured FROM the horizontal — the side adjacent to the angle.` },
          { mark: "M1", text: `$=${horizontal.toFixed(4)}$ N` },
          { mark: "M1", text: `Newton's second law horizontally: $F=ma \\Rightarrow ${horizontal.toFixed(4)}=${mass}a$` },
          { mark: "A1", text: `$a=${acceleration.toFixed(4)}\\approx${acceleration.toFixed(3)}\\ \\mathrm{m\\,s^{-2}}$`, why: `The vertical component $${force}\\sin${angle}^{\\circ}$ is not wasted — it reduces the normal reaction. On smooth ground that changes nothing, but on rough ground it would reduce friction, which is why a rope angled upwards makes a sledge easier to pull.` },
        ],
        trap: `Using $\\sin${angle}^{\\circ}$, or using the full $${force}$ N. The angle is measured from the horizontal, so the horizontal component takes $\\cos$ — and only that component causes the horizontal acceleration.`,
      };
    },
  },
];
