import type { Topic } from "./types";

/**
 * Paper 3, Section B: Mechanics.
 *
 * Mechanics leans heavily on Pure calculus (topics 7 and 8) and on vectors
 * (topic 10) — the spec cross-references both explicitly.
 */
export const mechanicsTopics: Topic[] = [
  {
    number: 6,
    paper: "mechanics",
    name: "Quantities and units",
    slug: "quantities-and-units",
    blurb:
      "One spec point that quietly decides whether the rest of your mechanics answers are right — almost every lost mark here is a unit conversion.",
    points: [
      {
        code: "6.1",
        title: "Quantities and units in the S.I. system",
        phase: "spanning",
        summary:
          "Understand and use the fundamental S.I. quantities of length, time and mass, and the derived quantities velocity, acceleration, force, weight and moment, converting between units where required.",
        examNote:
          "The conversion the spec names explicitly is kilometres per hour into metres per second. Do it first, before any other working, and mechanics becomes markedly less error-prone.",
        keywords: ["units", "SI", "conversion", "newton", "velocity", "acceleration", "weight", "moment", "km/h", "m/s"],
      },
    ],
  },
  {
    number: 7,
    paper: "mechanics",
    name: "Kinematics",
    slug: "kinematics",
    blurb:
      "Motion described by graphs, by the constant-acceleration formulae, and by calculus — plus projectiles, the flagship mechanics question, taught later.",
    points: [
      {
        code: "7.1",
        title: "The language of kinematics",
        phase: "first",
        summary:
          "Understand and use position, displacement, distance travelled, velocity, speed and acceleration, knowing that distance and speed must be positive.",
        examNote:
          "Displacement and distance differ the moment an object turns round, and so do velocity and speed. Questions exploit this deliberately: an object thrown up and caught again has travelled a distance but has zero displacement.",
        keywords: ["displacement", "distance", "velocity", "speed", "acceleration", "position", "scalar", "vector"],
      },
      {
        code: "7.2",
        title: "Kinematics graphs",
        phase: "first",
        summary:
          "Understand, use and interpret displacement-time and velocity-time graphs for motion in a straight line, interpreting gradient in both and area under the velocity-time graph.",
        examNote:
          "Gradient of a displacement-time graph is velocity; gradient of a velocity-time graph is acceleration; area under a velocity-time graph is displacement. The spec says graphical solutions may be required, so a question can be solved entirely by splitting the area into triangles and rectangles.",
        keywords: ["velocity-time", "displacement-time", "gradient", "area under graph", "graph"],
      },
      {
        code: "7.3",
        title: "Constant acceleration formulae",
        phase: "spanning",
        summary:
          "Understand, use and derive the constant acceleration formulae for motion in a straight line, and extend them to two dimensions using vectors in i, j or column form.",
        examNote:
          "You must be able to derive them, not merely quote them — the derivation comes from the velocity-time graph. Choose a positive direction and state it, because the commonest error in vertical motion is a sign, not a formula. These only apply when acceleration is constant; if it varies, you need calculus instead.",
        keywords: ["suvat", "constant acceleration", "derive", "vectors", "2D", "equations of motion"],
      },
      {
        code: "7.4",
        title: "Calculus in kinematics",
        phase: "spanning",
        summary:
          "Use calculus for motion in a straight line — differentiating displacement to velocity to acceleration and integrating back — and extend to two dimensions by differentiating and integrating vectors with respect to time.",
        examNote:
          "The trigger phrase is acceleration varying with time: the moment acceleration is a function of t, the constant-acceleration formulae are invalid and calculus is the only route. Integrating gives a constant that the initial conditions determine — and in two dimensions that constant is itself a vector.",
        keywords: ["calculus", "differentiate", "integrate", "variable acceleration", "vectors", "time"],
      },
      {
        code: "7.5",
        title: "Projectiles",
        phase: "later",
        summary:
          "Model motion under gravity in a vertical plane using vectors; derive formulae for time of flight, range and greatest height, and the equation of the path of a projectile.",
        examNote:
          "Everything follows from one idea: horizontal and vertical motion are independent and share only the time. Horizontally there is no acceleration, vertically there is gravity. The derivations named in the spec are examinable, and the greatest height is where the vertical velocity is momentarily zero.",
        keywords: ["projectile", "range", "time of flight", "greatest height", "trajectory", "gravity", "components"],
      },
    ],
  },
  {
    number: 8,
    paper: "mechanics",
    name: "Forces and Newton's laws",
    slug: "forces-and-newtons-laws",
    blurb:
      "Six spec points and the heart of mechanics — force diagrams, resolving, connected particles and friction.",
    points: [
      {
        code: "8.1",
        title: "Forces and Newton's first law",
        phase: "first",
        summary:
          "Understand the concept of a force and use Newton's first law, including normal reaction, tension, thrust or compression, and resistance.",
        examNote:
          "Almost every mechanics question starts with a force diagram, and almost every lost mark starts with a missing force on it. Draw the diagram first, every time — weight always acts downwards, normal reaction always perpendicular to the surface.",
        keywords: ["force", "newton's first law", "normal reaction", "tension", "thrust", "resistance", "force diagram", "equilibrium"],
      },
      {
        code: "8.2",
        title: "Newton's second law",
        phase: "spanning",
        summary:
          "Use Newton's second law for motion in a straight line, restricted to forces in two perpendicular directions or simple cases of forces as two-dimensional vectors, extending to situations where forces must be resolved.",
        examNote:
          "Resolve along the direction of motion and perpendicular to it, rather than horizontally and vertically — on an inclined plane that choice is what makes the algebra tractable. Apply F = ma to one direction at a time and state which direction you are taking as positive.",
        keywords: ["newton's second law", "F=ma", "resolve", "inclined plane", "components", "acceleration"],
      },
      {
        code: "8.3",
        title: "Weight and motion under gravity",
        phase: "first",
        summary:
          "Understand and use weight and motion in a straight line under gravity, and gravitational acceleration g and its value to varying degrees of accuracy, aware that g depends on location.",
        examNote:
          "Weight is mass times g, and confusing mass with weight is heavily penalised because they are different quantities in different units. The default value is 9.8, but a question may specify another value — use the one you are given, and carry the accuracy through.",
        keywords: ["weight", "gravity", "g", "mass", "9.8", "vertical motion"],
      },
      {
        code: "8.4",
        title: "Newton's third law, connected particles and equilibrium",
        phase: "spanning",
        summary:
          "Use Newton's third law and the equilibrium of forces on a particle; apply to problems involving smooth pulleys and connected particles, including particles in contact; resolve forces in two dimensions and handle equilibrium under coplanar forces.",
        examNote:
          "For connected particles, write a separate equation for each particle and use the fact that they share the same magnitude of acceleration — that shared value is what lets you eliminate the tension. A smooth pulley means the tension is the same throughout the string. Lift problems with a person standing inside are named explicitly in the spec.",
        keywords: ["newton's third law", "pulley", "connected particles", "tension", "equilibrium", "lift", "coplanar", "in contact"],
      },
      {
        code: "8.5",
        title: "Resultant forces and dynamics in a plane",
        phase: "later",
        summary:
          "Use the addition of forces and resultant forces, and dynamics for motion in a plane, resolving a vector into components or using a vector diagram.",
        examNote:
          "Two routes to a resultant: resolve into perpendicular components and recombine with Pythagoras, or draw a vector triangle and use the sine and cosine rules. Both are acceptable, and the trigonometry route is where Pure topic 5 comes back.",
        keywords: ["resultant", "components", "vector diagram", "resolve", "magnitude", "direction"],
      },
      {
        code: "8.6",
        title: "Friction",
        phase: "later",
        summary:
          "Understand and use the friction model with the coefficient of friction, for motion of a body on a rough surface, including limiting friction and statics.",
        examNote:
          "The single most important distinction: when the body is moving, friction equals the coefficient times the normal reaction; when it is in equilibrium, friction is less than or equal to that value. Using the equality in a statics problem is a standard trap. On a slope the normal reaction is not the weight — it is the component perpendicular to the slope.",
        keywords: ["friction", "coefficient", "rough", "limiting", "statics", "normal reaction", "smooth", "slope"],
      },
    ],
  },
  {
    number: 9,
    paper: "mechanics",
    name: "Moments",
    slug: "moments",
    blurb:
      "One spec point, taught later in the course, and highly formulaic — rods, beams and ladders in equilibrium.",
    points: [
      {
        code: "9.1",
        title: "Moments and the equilibrium of rigid bodies",
        phase: "later",
        summary:
          "Understand and use moments in simple static contexts, and the equilibrium of rigid bodies, with problems involving parallel and non-parallel coplanar forces.",
        examNote:
          "A moment is force times perpendicular distance, and the perpendicular is what people get wrong with non-parallel forces. Choosing to take moments about a point where an unknown force acts eliminates that unknown immediately — for ladder problems, which the spec names, take moments about the base.",
        keywords: ["moments", "equilibrium", "rigid body", "ladder", "beam", "pivot", "perpendicular distance", "uniform rod"],
      },
    ],
  },
];
