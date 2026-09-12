import type { TeachingNote } from "./types";

/** Teaching notes for Pure topics 1–2: Proof, algebra and functions. */
export const algebraNotes: TeachingNote[] = [
  {
    paper: "pure",
    specCode: "1.1",
    idea: "A proof is an argument that leaves no gap. Four methods are examinable, and each has a shape you can learn: deduction works forwards from what is known, exhaustion checks every case, counter-example destroys a claim with one instance, and contradiction assumes the opposite and breaks it.",
    method: [
      "Deduction: start from a definition or known result and argue in steps to the conclusion. Write $n=2k$ for an even number, $2k+1$ for an odd one.",
      "Exhaustion: only when the cases are genuinely finite. List them all and check each.",
      "Counter-example: to DISPROVE a general claim, one example is enough — and it is a complete proof.",
      "Contradiction: assume the statement is false, derive something impossible, conclude the assumption was wrong.",
      "End with a sentence stating what has been shown. It is often a mark.",
    ],
    watchFor: [
      "Testing a few cases and calling it a proof. Examples never prove a general statement, though one counter-example disproves it.",
      "Using the thing you are proving as a step in the proof.",
      "For contradiction, be precise about what the negation actually is. The opposite of 'all are' is 'at least one is not', not 'none are'.",
    ],
  },
  {
    paper: "pure",
    specCode: "2.1",
    idea: "The index laws all follow from what a power means. $x^{3}\\times x^{2}$ is three $x$s times two $x$s, so the indices add — and every other rule is the same argument.",
    method: [
      "Multiplying adds indices; dividing subtracts them; a power of a power multiplies them.",
      "$x^{0}=1$, because dividing anything by itself gives 1.",
      "$x^{-n}=\\dfrac{1}{x^{n}}$: a negative index means reciprocal, not a negative answer.",
      "$x^{1/n}$ is the $n$th root, so $x^{m/n}=\\left(\\sqrt[n]{x}\\right)^{m}$.",
      "Always deal with the root before the power — the numbers stay smaller.",
    ],
    watchFor: [
      "$x^{-2}$ is $\\frac{1}{x^{2}}$, a positive quantity. The minus is in the index, not the value.",
      "$(2x)^{3}$ is $8x^{3}$: the power applies to the 2 as well.",
      "The laws only combine terms with the SAME base. $2^{3}\\times3^{2}$ cannot be simplified this way.",
    ],
  },
  {
    paper: "pure",
    specCode: "2.2",
    idea: "A surd is a root left exact rather than turned into a decimal. Exact answers are required all over this course, so the skill is manipulating them without ever reaching for the calculator.",
    method: [
      "Simplify by pulling out square factors: $\\sqrt{50}=\\sqrt{25\\times2}=5\\sqrt{2}$.",
      "$\\sqrt{a}\\times\\sqrt{b}=\\sqrt{ab}$, and the same for division.",
      "Only add or subtract LIKE surds, exactly as with algebraic terms.",
      "To rationalise a single-term denominator, multiply top and bottom by that surd.",
      "For a two-term denominator, multiply by its conjugate — change the middle sign — so the difference of two squares clears the root.",
    ],
    watchFor: [
      "$\\sqrt{a+b}$ is not $\\sqrt{a}+\\sqrt{b}$. Test it on 9 and 16: 5 against 7.",
      "Leaving a surd in the denominator when the question said to rationalise. The answer is algebraically equal but in the wrong FORM, and form is what was asked for.",
      "Forgetting to multiply the numerator by the same thing.",
    ],
  },
  {
    paper: "pure",
    specCode: "2.3",
    idea: "Every quadratic is the same parabola, moved and stretched. Completing the square makes that explicit: it hands you the turning point directly, and everything else about the graph follows.",
    method: [
      "Factor out the coefficient of $x^{2}$ if it is not 1.",
      "Halve the coefficient of $x$, square it, add and subtract it.",
      "Write as $a(x+p)^{2}+q$. The turning point is at $(-p,\\,q)$.",
      "Factorise or use the quadratic formula for the roots.",
      "The discriminant $b^{2}-4ac$ decides the number of roots: positive two, zero one repeated, negative none.",
    ],
    watchFor: [
      "The sign of the turning point's $x$-coordinate. In $(x-3)^{2}$ the turning point is at $+3$.",
      "Forgetting that factoring out a negative flips the shape: the parabola opens downwards and $q$ is a maximum.",
      "'No real roots' means the discriminant is negative, which is a common way to ask for a range of values of a constant.",
    ],
  },
  {
    paper: "pure",
    specCode: "2.4",
    idea: "Solving simultaneously means finding where two graphs meet. With one linear and one quadratic equation, substitution reduces it to a single quadratic — and the discriminant of that quadratic tells you whether the line cuts, touches, or misses the curve.",
    method: [
      "Make one variable the subject of the LINEAR equation.",
      "Substitute into the other equation.",
      "Solve the resulting quadratic.",
      "Substitute each solution back into the linear equation to get the matching value — pairs matter.",
      "For a tangency question, set the discriminant to zero: one repeated root means the line touches the curve.",
    ],
    watchFor: [
      "Substituting into the equation you rearranged, which collapses to $0=0$.",
      "Giving $x$ values without their matching $y$ values.",
      "Pairing them wrongly. Each $x$ goes with the $y$ that came from it.",
    ],
  },
  {
    paper: "pure",
    specCode: "2.5",
    idea: "A linear inequality behaves like an equation, except that multiplying or dividing by a negative reverses it. A quadratic inequality does not: you have to find the critical values and then decide which regions actually satisfy it.",
    method: [
      "For a quadratic, rearrange so one side is zero.",
      "Find the critical values by factorising or using the formula.",
      "Sketch the parabola and mark those roots.",
      "Read off the region: if you want $<0$, take where the curve is below the axis; for $>0$, above.",
      "For a positive $x^{2}$ coefficient, $>0$ gives two outer regions and $<0$ gives the single interval between the roots.",
    ],
    watchFor: [
      "Reversing the sign when multiplying or dividing by a negative. This applies to linear inequalities and is easily forgotten.",
      "Writing a two-region answer as a single chain like $3<x<-2$, which says nothing. Two separate regions need 'or'.",
      "Never multiply an inequality by something containing $x$ — you do not know its sign.",
    ],
  },
  {
    paper: "pure",
    specCode: "2.6",
    idea: "The factor theorem says that if substituting $x=a$ gives zero, then $(x-a)$ is a factor. It turns factorising a cubic from guesswork into a short search followed by division.",
    method: [
      "Try small values: $\\pm1$, $\\pm2$, and factors of the constant term.",
      "When $f(a)=0$, you have found that $(x-a)$ is a factor.",
      "Divide the polynomial by that factor, by long division or by comparing coefficients.",
      "Factorise the resulting quadratic normally.",
      "The remainder theorem is the same idea: $f(a)$ IS the remainder on dividing by $(x-a)$.",
    ],
    watchFor: [
      "The sign. $f(2)=0$ means $(x-2)$ is a factor, not $(x+2)$.",
      "For a factor like $(2x-1)$, the value to test is $x=\\frac{1}{2}$.",
      "Missing terms in the division. Write $x^{3}+0x^{2}+\\ldots$ so the columns line up.",
    ],
  },
  {
    paper: "pure",
    specCode: "2.7",
    idea: "You rarely need to plot a curve point by point. Sketching is about landmarks: where it crosses the axes, what it does at the extremes, and where it cannot go at all.",
    method: [
      "Find the axis intercepts: set $y=0$, then $x=0$.",
      "Factorise to find the roots, and note repeated roots — the curve touches rather than crosses there.",
      "For large positive and negative $x$, the highest power decides the behaviour.",
      "For a reciprocal graph, find the asymptotes: a vertical one where the denominator is zero, a horizontal one at the value the curve settles towards.",
      "For a modulus graph, sketch the ordinary line and reflect anything below the $x$-axis upwards.",
    ],
    watchFor: [
      "An asymptote is a LINE, so its answer is an equation like $x=3$, not the number 3.",
      "A repeated factor means the curve touches the axis and turns back; a triple factor flattens as it crosses.",
      "A sketch needs the key features labelled, not graph-paper accuracy.",
    ],
  },
  {
    paper: "pure",
    specCode: "2.8",
    idea: "A function is a rule with a domain and a range. Composing runs one function into another, and inverting runs the rule backwards — which is only possible if no two inputs share an output.",
    method: [
      "For $gf(x)$, apply $f$ FIRST. The notation reads right to left.",
      "Domain means allowed inputs; range means resulting outputs.",
      "To invert: write $y=f(x)$, make $x$ the subject, then swap the letters.",
      "The domain of $f^{-1}$ is the range of $f$, and its range is the domain of $f$.",
      "The graph of $f^{-1}$ is the graph of $f$ reflected in $y=x$.",
    ],
    watchFor: [
      "Doing $fg$ when the question asked for $gf$. They are different functions.",
      "Reading $f^{-1}$ as a reciprocal. It means the inverse function.",
      "A function must be one-to-one to have an inverse, which is why questions restrict the domain — $x\\ge0$ on a quadratic, for instance.",
    ],
  },
  {
    paper: "pure",
    specCode: "2.9",
    idea: "Four transformations, and the rule that decides them all: a change OUTSIDE the function does what you expect to $y$, and a change INSIDE does the opposite to $x$.",
    method: [
      "$f(x)+a$ moves the curve up by $a$.",
      "$f(x+a)$ moves it LEFT by $a$ — inside, so the opposite direction.",
      "$af(x)$ stretches vertically by scale factor $a$.",
      "$f(ax)$ stretches horizontally by $\\frac{1}{a}$ — inside, so the reciprocal.",
      "$-f(x)$ reflects in the $x$-axis; $f(-x)$ reflects in the $y$-axis.",
    ],
    watchFor: [
      "Direction of horizontal shifts. $f(x+3)$ moves LEFT, which feels wrong until you ask which $x$ now gives what $f(0)$ used to.",
      "Combining transformations in the wrong order. Work outwards from the innermost bracket.",
      "Under a horizontal stretch the $y$-intercept stays put; under a vertical one it moves. Checking a single known point catches most errors.",
    ],
  },
  {
    paper: "pure",
    specCode: "2.10",
    idea: "Partial fractions run factorising in reverse: a single fraction with a factorised denominator is rewritten as a sum of simpler ones. It exists because those simpler pieces are things you can integrate and expand, and the original is not.",
    method: [
      "Check the fraction is proper — the numerator's degree must be lower than the denominator's. If not, divide first.",
      "Write one term for each factor: $\\dfrac{A}{x+a}+\\dfrac{B}{x+b}$.",
      "A squared factor $(x+a)^{2}$ needs two terms, over $(x+a)$ and over $(x+a)^{2}$.",
      "Multiply through by the full denominator to clear fractions.",
      "Substitute the root of each bracket in turn — each one kills all but a single unknown.",
    ],
    watchFor: [
      "Substituting $x=a$ instead of $x=-a$ for the factor $(x+a)$. You want the value that makes the bracket zero.",
      "Only one term for a repeated factor. It needs both powers.",
      "Forgetting to divide first when the fraction is improper — the answer will not come out.",
    ],
  },
  {
    paper: "pure",
    specCode: "2.11",
    idea: "Modelling means choosing a function to represent a real situation, then being honest about what that choice assumes. The mathematics is usually the easy half; the marks are in the interpretation and the critique.",
    method: [
      "Identify the variables and what each one means, with units.",
      "Choose the shape that matches the behaviour: linear for a constant rate, quadratic for something with a single maximum, exponential for growth proportional to size.",
      "Use the given conditions to pin down the constants.",
      "Answer the question asked, in context and with units.",
      "State the domain over which the model makes sense, and say what it ignores.",
    ],
    watchFor: [
      "Giving a bare number. An AO3 answer needs context and units.",
      "Ignoring the domain. A quadratic area model is meaningless once a length would go negative, and saying so earns marks.",
      "Every model has limitations — being specific about which one bites here is worth more than a general remark that models are approximate.",
    ],
  },
];
