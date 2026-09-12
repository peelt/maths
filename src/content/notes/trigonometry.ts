import type { TeachingNote } from "./types";

/** Teaching notes for Pure topic 5: Trigonometry. */
export const trigonometryNotes: TeachingNote[] = [
  {
    paper: "pure",
    specCode: "5.1",
    idea: "Sine and cosine are defined by a point moving round the unit circle — the cosine is how far across, the sine how far up. That definition is what lets angles exceed $90^{\\circ}$ and go negative, which the right-angled triangle picture cannot do.",
    method: [
      "For a right-angled triangle, use SOHCAHTOA.",
      "For any other triangle with an angle opposite a known side, use the sine rule $\\dfrac{a}{\\sin A}=\\dfrac{b}{\\sin B}$.",
      "With two sides and the angle between them, or all three sides, use the cosine rule $a^{2}=b^{2}+c^{2}-2bc\\cos A$.",
      "Area is $\\dfrac{1}{2}ab\\sin C$ — the angle must be the one BETWEEN the two sides.",
      "In radians, arc length is $r\\theta$ and sector area is $\\frac{1}{2}r^{2}\\theta$. Both are only true in radians.",
    ],
    watchFor: [
      "The ambiguous case of the sine rule: $\\sin^{-1}$ on a calculator returns the acute angle, but an obtuse one may also fit. If the triangle's shape allows it, consider $180^{\\circ}-\\theta$ too.",
      "Using the degree formulas for arc length or sector area. They are radian-only; in degrees you need the fraction-of-a-circle version.",
      "Rounding an intermediate angle and then using it. Keep full accuracy until the end.",
    ],
  },
  {
    paper: "pure",
    specCode: "5.2",
    idea: "For small angles measured in radians, $\\sin\\theta\\approx\\theta$, $\\tan\\theta\\approx\\theta$ and $\\cos\\theta\\approx1-\\frac{\\theta^{2}}{2}$. These come from the first terms of the series for each function, and they turn awkward trigonometric limits into simple algebra.",
    method: [
      "Check the angle is in radians. The approximations are false in degrees.",
      "Replace each trigonometric function by its approximation, using the WHOLE angle as $\\theta$.",
      "If the angle is $ax$, then $\\sin(ax)\\approx ax$ and $\\cos(ax)\\approx1-\\dfrac{(ax)^{2}}{2}=1-\\dfrac{a^{2}x^{2}}{2}$.",
      "Simplify. In a well-set question the powers of $x$ cancel completely, leaving a number.",
    ],
    watchFor: [
      "Squaring only part of the angle: $(3x)^{2}$ is $9x^{2}$, not $3x^{2}$. This is where the marks go.",
      "Using $\\cos\\theta\\approx1$. It is true but too crude — it usually makes the whole expression collapse to zero, and the $\\frac{\\theta^{2}}{2}$ term is the one that matters.",
      "These are approximations for SMALL angles only. The question will say so.",
    ],
  },
  {
    paper: "pure",
    specCode: "5.3",
    idea: "The graphs are the definitions made visible: sine and cosine wave between $-1$ and $1$ with period $2\\pi$, and tangent shoots off to infinity wherever cosine is zero. The exact values come from two special triangles and are worth knowing rather than deriving each time.",
    method: [
      "Sketch by landmarks: where it crosses zero, where it peaks, where it is undefined.",
      "Sine starts at 0 going up; cosine starts at 1; they are the same wave shifted by $\\frac{\\pi}{2}$.",
      "Tangent has vertical asymptotes at $\\frac{\\pi}{2}$ plus multiples of $\\pi$, and period $\\pi$ rather than $2\\pi$.",
      "Exact values come from the half-square ($45^{\\circ}$) and half-equilateral ($30^{\\circ}$, $60^{\\circ}$) triangles.",
      "Use the quadrant diagram to fix signs: all positive in the first, then sine, tangent, cosine.",
    ],
    watchFor: [
      "Transformations of these graphs affect the period: $y=\\sin(2x)$ has period $\\pi$, not $2\\pi$.",
      "Tangent's period is $\\pi$. Solutions to a tangent equation repeat every $\\pi$, not every $2\\pi$ — which changes how many fit in a given range.",
      "Mixing degrees and radians within one question.",
    ],
  },
  {
    paper: "pure",
    specCode: "5.4",
    idea: "The reciprocal functions are one over the ones you know: $\\sec=\\frac{1}{\\cos}$, $\\operatorname{cosec}=\\frac{1}{\\sin}$, $\\cot=\\frac{1}{\\tan}$. The inverse functions go the other way, turning a ratio back into an angle, and each needs a restricted domain to be a function at all.",
    method: [
      "To evaluate a reciprocal function, work out the ordinary one first and then invert it.",
      "Pair them correctly: se-c goes with c-osine, cose-c with s-ine. The third letter names the partner.",
      "A reciprocal function has an asymptote wherever the ordinary one is zero.",
      "For inverses, remember the restricted ranges: $\\arcsin$ and $\\arctan$ give answers between $-\\frac{\\pi}{2}$ and $\\frac{\\pi}{2}$; $\\arccos$ gives between $0$ and $\\pi$.",
    ],
    watchFor: [
      "Pairing sec with sine. It is the commonest slip in this topic and it makes every subsequent line wrong.",
      "Reading $\\sin^{-1}x$ as $\\frac{1}{\\sin x}$. The $-1$ means inverse FUNCTION; the reciprocal is $\\operatorname{cosec}x$.",
      "A calculator returns only the principal value. Other solutions in range must be found from the graph or the quadrant diagram.",
    ],
  },
  {
    paper: "pure",
    specCode: "5.5",
    idea: "Two identities do most of the work. $\\sin^{2}\\theta+\\cos^{2}\\theta=1$ is Pythagoras on the unit circle, and dividing it through by $\\cos^{2}\\theta$ or $\\sin^{2}\\theta$ produces the other two versions free.",
    method: [
      "Know $\\sin^{2}\\theta+\\cos^{2}\\theta=1$ — it is not in the booklet.",
      "Divide by $\\cos^{2}\\theta$ to get $\\tan^{2}\\theta+1=\\sec^{2}\\theta$.",
      "Divide by $\\sin^{2}\\theta$ to get $1+\\cot^{2}\\theta=\\operatorname{cosec}^{2}\\theta$.",
      "Also know $\\tan\\theta=\\dfrac{\\sin\\theta}{\\cos\\theta}$, which is how you convert between them.",
      "Given one ratio, find another by substituting into the identity, then use the quadrant to decide the sign.",
    ],
    watchFor: [
      "Taking a square root and forgetting the $\\pm$. Write both, then let the given quadrant choose.",
      "Deriving the second and third identities from scratch each time. One division from the first gets you there in a line.",
      "$\\sin^{2}\\theta$ means $(\\sin\\theta)^{2}$, not $\\sin(\\theta^{2})$.",
    ],
  },
  {
    paper: "pure",
    specCode: "5.6",
    idea: "The compound angle formulae handle $\\sin(A+B)$ and friends, and they are given in the booklet. Setting $A=B$ turns them into the double angle formulae, which are NOT given — so those are one line of derivation away rather than something to memorise blindly.",
    method: [
      "Look up the compound formula you need: $\\sin(A\\pm B)$, $\\cos(A\\pm B)$, $\\tan(A\\pm B)$.",
      "For double angles, put $A=B=\\theta$: $\\sin 2\\theta=2\\sin\\theta\\cos\\theta$ and $\\cos 2\\theta=\\cos^{2}\\theta-\\sin^{2}\\theta$.",
      "Use $\\sin^{2}+\\cos^{2}=1$ to rewrite $\\cos 2\\theta$ as $2\\cos^{2}\\theta-1$ or $1-2\\sin^{2}\\theta$. Choose whichever form matches what else is in the question.",
      "For R form: write $a\\sin\\theta+b\\cos\\theta=R\\sin(\\theta+\\alpha)$, expand, and compare coefficients.",
      "Then $R=\\sqrt{a^{2}+b^{2}}$ and $\\tan\\alpha=\\dfrac{b}{a}$. The maximum of the whole expression is $R$ and the minimum is $-R$.",
    ],
    watchFor: [
      "$\\cos 2\\theta$ has three forms, and picking the wrong one turns a one-line simplification into a mess. If the question involves $\\sin$, choose $1-2\\sin^{2}\\theta$.",
      "$\\sin 2\\theta$ is not $2\\sin\\theta$. Check at $\\theta=\\frac{\\pi}{2}$: the left side is 0 and the right is 2.",
      "In R form, squaring and adding eliminates $\\alpha$ because $\\cos^{2}\\alpha+\\sin^{2}\\alpha=1$. That is why the method works.",
    ],
  },
  {
    paper: "pure",
    specCode: "5.7",
    idea: "A trigonometric equation has infinitely many solutions, and the question restricts you to a range. The calculator gives one; the graph or the quadrant diagram gives the rest.",
    method: [
      "Rearrange to get a single trigonometric function equal to a number.",
      "Take the inverse to get the principal value.",
      "Use symmetry for the second solution in a cycle: for sine, $180^{\\circ}-\\theta$; for cosine, $360^{\\circ}-\\theta$; for tangent, add $180^{\\circ}$.",
      "Add or subtract full periods to find every solution inside the required range.",
      "If the argument is $2x$ or $x+30^{\\circ}$, change the range to match the argument FIRST, solve, then convert back.",
    ],
    watchFor: [
      "Giving only the calculator's answer. Most of the marks are for the other solutions.",
      "Dividing through by $\\sin x$ or $\\cos x$. That destroys solutions where it is zero — factorise instead.",
      "Not widening the range for a multiple angle. If $0\\le x\\le360^{\\circ}$ then $0\\le 2x\\le720^{\\circ}$, which contains twice as many solutions.",
    ],
  },
  {
    paper: "pure",
    specCode: "5.8",
    idea: "Proving an identity means starting with one side and transforming it into the other. It is not an equation to be solved, and doing the same thing to both sides assumes the very thing you are trying to prove.",
    method: [
      "Start with the more complicated side — there is more to work with.",
      "Convert everything into sines and cosines if you cannot see a route.",
      "Look for a substitution that makes something cancel. That is almost always the intended step.",
      "Work in a single column, ending at the other side, and write $\\equiv$ throughout.",
      "Finish by stating that the two sides are equal, or write QED. Mark schemes want a conclusion.",
    ],
    watchFor: [
      "Operating on both sides at once. That is circular reasoning and mark schemes penalise it.",
      "Starting from the answer and working backwards to the question. A proof runs one way.",
      "Choosing the wrong form of $\\cos 2\\theta$. If the other side contains sines, pick the form with sines in it.",
    ],
  },
  {
    paper: "pure",
    specCode: "5.9",
    idea: "Anything that repeats — tides, daylight, a wheel, a pendulum — can be modelled by a sine or cosine wave. The four numbers in $y=a+b\\sin(ct+d)$ each mean something physical, and reading them off is most of the skill.",
    method: [
      "$a$ is the midline: the average value the quantity oscillates about.",
      "$b$ is the amplitude: half the distance from lowest to highest.",
      "$c$ sets the period, which is $\\dfrac{2\\pi}{c}$ in radians.",
      "$d$ shifts the wave horizontally, which fixes where it starts.",
      "To find when a particular value occurs, set the expression equal to it and solve as a trigonometric equation — remembering to find every solution in range.",
    ],
    watchFor: [
      "Working in degrees when the model contains $\\pi$. A $2\\pi$ anywhere means radians.",
      "Maximum is $a+b$ and minimum is $a-b$, not $b$ and $-b$.",
      "A model using $-\\cos$ starts at its minimum, which is often the physically sensible choice — a big wheel where you board at the bottom, for instance.",
    ],
  },
];
