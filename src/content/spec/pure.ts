import type { Topic } from "./types";

/**
 * Paper 1 and Paper 2: Pure Mathematics.
 *
 * Both Pure papers draw on this same content — there is no split of topics
 * between Paper 1 and Paper 2, so any topic can appear on either.
 */
export const pureTopics: Topic[] = [
  {
    number: 1,
    paper: "pure",
    name: "Proof",
    slug: "proof",
    blurb:
      "Only one spec point, but proof appears across the whole paper and is pure AO2 — reasoning and communication rather than carrying out a technique, worth roughly a quarter of the marks in the qualification.",
    points: [
      {
        code: "1.1",
        title: "Methods of proof",
        phase: "spanning",
        summary:
          "Build an argument from given assumptions through logical steps to a conclusion, using proof by deduction, proof by exhaustion, disproof by counter-example, and proof by contradiction.",
        examNote:
          "Proof by contradiction is taught later and the two classic results — that the square root of 2 is irrational, and that there are infinitely many primes — are explicitly named in the spec, so learn both properly. Disproof by counter-example is the cheapest mark in the paper: you need one example, not an argument. Marks are lost on presentation more than on ideas, so state what you assume, and end by saying what you have shown.",
        keywords: ["proof", "contradiction", "exhaustion", "deduction", "counter-example", "counterexample", "irrational", "primes"],
      },
    ],
  },
  {
    number: 2,
    paper: "pure",
    name: "Algebra and functions",
    slug: "algebra-and-functions",
    blurb:
      "The largest topic in the spec at eleven points, and the machinery behind almost everything else. Weakness here shows up everywhere.",
    points: [
      {
        code: "2.1",
        title: "Laws of indices",
        phase: "first",
        summary:
          "Use the laws of indices for all rational exponents, including negative and fractional powers, and the equivalence between fractional powers and roots.",
        examNote:
          "Rarely a question on its own — it is the hidden first step in differentiation, integration and surd work. If you cannot rewrite 1/sqrt(x) as x^(-1/2) instantly, you will lose marks in calculus questions, not in algebra ones.",
        keywords: ["indices", "powers", "exponents", "fractional", "negative", "roots"],
      },
      {
        code: "2.2",
        title: "Surds",
        phase: "first",
        summary:
          "Manipulate surds and rationalise the denominator, including simplifying algebraic surds.",
        examNote:
          "Almost always appears as an exact-answer requirement elsewhere. When a question says leave your answer in surd form, it is telling you a calculator decimal scores zero.",
        keywords: ["surds", "rationalise", "rationalize", "denominator", "exact", "root"],
      },
      {
        code: "2.3",
        title: "Quadratic functions and their graphs",
        phase: "first",
        summary:
          "Work with quadratics and their graphs; the discriminant and the conditions for real, repeated and no real roots; completing the square; solving by factorisation, formula, calculator or completing the square — including quadratics in a function of the unknown.",
        examNote:
          "The phrase quadratic in a function of the unknown is the one to watch: a question can hide a quadratic in sin x, e^x or ln x. The discriminant is the standard route into show that or find the range of k questions, which are AO2 and worth more than the algebra suggests.",
        keywords: ["quadratic", "discriminant", "completing the square", "roots", "parabola", "factorise", "b squared minus 4ac"],
      },
      {
        code: "2.4",
        title: "Simultaneous equations",
        phase: "spanning",
        summary:
          "Solve simultaneous equations in two variables by elimination and substitution, including one linear and one quadratic equation.",
        examNote:
          "The linear-and-quadratic case is the one that matters, and it is the algebraic engine behind line-meets-curve questions in coordinate geometry. Expect to be asked how many points of intersection there are — that is the discriminant again.",
        keywords: ["simultaneous", "substitution", "elimination", "intersection"],
      },
      {
        code: "2.5",
        title: "Inequalities",
        phase: "first",
        summary:
          "Solve linear and quadratic inequalities in one variable and interpret them graphically, including inequalities with brackets and fractions; express solutions using 'and'/'or' or set notation; represent linear and quadratic inequalities graphically.",
        examNote:
          "Two reliable mark-losers. First, a quadratic inequality needs a sketch or a sign argument — dividing through by a variable is wrong and examiners look for it. Second, the shading convention for graphical inequalities is examined: dotted line for strict, solid for inclusive.",
        keywords: ["inequalities", "set notation", "shading", "critical values", "regions"],
      },
      {
        code: "2.6",
        title: "Polynomials and the factor theorem",
        phase: "spanning",
        summary:
          "Expand, collect, factorise and divide polynomials algebraically; use the factor theorem; simplify rational expressions by factorising, cancelling and algebraic division.",
        examNote:
          "Division is limited to linear divisors of the form (ax + b), so you will never face anything worse. The factor theorem question is formulaic — substitute, show it equals zero, then divide — and is one of the most reliable sources of method marks in the paper.",
        keywords: ["polynomial", "factor theorem", "algebraic division", "cubic", "remainder", "rational expressions"],
      },
      {
        code: "2.7",
        title: "Graphs of functions",
        phase: "spanning",
        summary:
          "Sketch curves from simple equations including cubics and quartics, the modulus of a linear function, and reciprocal graphs y = a/x and y = a/x^2 with their asymptotes; interpret algebraic solutions graphically; understand proportional relationships and their graphs.",
        examNote:
          "Sketch means shape, intercepts and asymptotes — not a plotted table of values, and not a calculator screenshot. Modulus graphs come later and the classic trap is forgetting the second case when solving |ax + b| = cx + d; always check your solutions back in the original equation.",
        keywords: ["sketch", "cubic", "quartic", "modulus", "asymptote", "reciprocal", "proportion", "intercepts"],
      },
      {
        code: "2.8",
        title: "Composite and inverse functions",
        phase: "spanning",
        summary:
          "Understand functions as mappings, with domain and range; form composite functions; find inverse functions and their graphs.",
        examNote:
          "fg means do g first — get this the wrong way round and the whole question goes. Domain and range marks are given away constantly: the range of f is the domain of f inverse, and the graph of the inverse is the reflection of the graph of f in the line y = x.",
        keywords: ["composite", "inverse", "domain", "range", "mapping", "one-one", "functions"],
      },
      {
        code: "2.9",
        title: "Transformations of graphs",
        phase: "spanning",
        summary:
          "Understand the effect of the transformations y = af(x), y = f(x) + a, y = f(x + a), y = f(ax) and combinations of these, and sketch the resulting graphs; sketch y = f(-x) from the graph of y = f(x).",
        examNote:
          "The inside-the-bracket transformations behave counter-intuitively: f(x + a) shifts left, and f(ax) stretches by a factor of 1/a. Combinations come later and order matters. This is a strong candidate for interactive practice — it is far easier to see than to memorise.",
        keywords: ["transformations", "translation", "stretch", "reflection", "shift", "graph transformations"],
      },
      {
        code: "2.10",
        title: "Partial fractions",
        phase: "later",
        summary:
          "Decompose rational functions into partial fractions, with denominators no more complicated than squared linear terms, no more than three terms, and numerators constant or linear.",
        examNote:
          "Almost never asked for its own sake. It is a setup step for integration, for binomial expansion of a rational function, or for a differential equation — so if partial fractions appear in part (a), look at what part (b) wants before choosing your method.",
        keywords: ["partial fractions", "decompose", "rational function", "cover up"],
      },
      {
        code: "2.11",
        title: "Functions in modelling",
        phase: "spanning",
        summary:
          "Use functions in modelling, including considering the limitations and refinements of models.",
        examNote:
          "Pure AO3. The marks are for interpretation in context, not algebra: what does this constant mean, is this prediction reasonable, why might the model fail for large t. Write in sentences and refer to the real quantity, not to x and y.",
        keywords: ["modelling", "model", "limitations", "refinement", "context"],
      },
    ],
  },
  {
    number: 3,
    paper: "pure",
    name: "Coordinate geometry",
    slug: "coordinate-geometry",
    blurb:
      "Lines, circles and parametric curves in the (x, y) plane — highly visual, and among the most predictable question styles in the paper.",
    points: [
      {
        code: "3.1",
        title: "Straight lines",
        phase: "first",
        summary:
          "Use the equation of a straight line in the forms y - y1 = m(x - x1) and ax + by + c = 0; find lines through two points or parallel/perpendicular to a given line; use straight-line models in context.",
        examNote:
          "Perpendicular gradients multiply to -1, and this is one of the formulae you must memorise because it is not in the booklet. Watch for questions demanding the ax + by + c = 0 form with integer coefficients — the final accuracy mark depends on it.",
        keywords: ["straight line", "gradient", "perpendicular", "parallel", "equation of a line", "midpoint"],
      },
      {
        code: "3.2",
        title: "Circles",
        phase: "spanning",
        summary:
          "Use the equation of a circle (x - a)^2 + (y - b)^2 = r^2 and the expanded form; complete the square to find centre and radius; use the angle in a semicircle, the perpendicular from the centre bisecting a chord, and the tangent-radius property.",
        examNote:
          "The three named circle properties are effectively a menu of what will be asked. Tangent questions almost always reduce to: find the radius gradient, take the negative reciprocal, use the point. Finding a circumcircle of a triangle is explicitly in the spec and catches people out.",
        keywords: ["circle", "centre", "radius", "tangent", "chord", "circumcircle", "completing the square"],
      },
      {
        code: "3.3",
        title: "Parametric equations",
        phase: "later",
        summary:
          "Understand and use parametric equations of curves and convert between Cartesian and parametric forms.",
        examNote:
          "Converting usually means eliminating the parameter, and trig identities are the standard tool when the parameter sits inside sin and cos. The spec warns specifically about the domain of the parameter — a restricted t means you are describing only part of a curve, and there are marks for saying so.",
        keywords: ["parametric", "parameter", "cartesian", "eliminate", "conversion"],
      },
      {
        code: "3.4",
        title: "Parametric equations in modelling",
        phase: "spanning",
        summary:
          "Use parametric equations in modelling in a variety of contexts.",
        examNote:
          "Overlaps directly with kinematics on Paper 3 — the spec cross-references it. Motion problems where x and y are both given in terms of time are the standard context.",
        keywords: ["parametric", "modelling", "motion", "trajectory"],
      },
    ],
  },
  {
    number: 4,
    paper: "pure",
    name: "Sequences and series",
    slug: "sequences-and-series",
    blurb:
      "Binomial expansion, arithmetic and geometric progressions, and recurrence relations. Formula-heavy, and two of the proofs are explicitly examinable.",
    points: [
      {
        code: "4.1",
        title: "Binomial expansion",
        phase: "spanning",
        summary:
          "Expand (a + bx)^n for positive integer n using n! and nCr notation and Pascal's triangle; extend to any rational n, including using it for approximations, and know that the expansion is valid for |bx/a| < 1.",
        examNote:
          "The rational-n case comes later and the validity condition is a guaranteed mark that students routinely skip — state it. Approximation questions want you to substitute a specific small value and compare; do not round early.",
        keywords: ["binomial", "expansion", "pascal", "ncr", "factorial", "validity", "approximation"],
      },
      {
        code: "4.2",
        title: "Sequences and recurrence relations",
        phase: "later",
        summary:
          "Work with sequences given by a formula for the nth term and by recurrence relations of the form x(n+1) = f(x n); identify increasing, decreasing and periodic sequences.",
        examNote:
          "Periodic sequences are the ones people miss: if the terms cycle with order k, a sum of many terms collapses to a short repeated block. Check the first four or five terms before assuming anything.",
        keywords: ["sequence", "recurrence", "periodic", "increasing", "decreasing", "nth term", "iteration"],
      },
      {
        code: "4.3",
        title: "Sigma notation",
        phase: "later",
        summary: "Understand and use sigma notation for sums of series, including knowing that summing 1 over n terms gives n.",
        examNote:
          "Read the limits carefully — a sum from r = 3 to 20 is not the same as one from r = 1 to 20, and the usual fix is to compute the full sum and subtract the missing start.",
        keywords: ["sigma", "sum", "series", "notation"],
      },
      {
        code: "4.4",
        title: "Arithmetic sequences and series",
        phase: "later",
        summary:
          "Work with arithmetic sequences and series, including the formulae for the nth term and the sum to n terms, and the sum of the first n natural numbers.",
        examNote:
          "The spec states the proof of the sum formula should be known — the reverse-and-add argument. That is an AO2 mark you can bank by learning four lines of working.",
        keywords: ["arithmetic", "progression", "common difference", "sum", "AP", "proof"],
      },
      {
        code: "4.5",
        title: "Geometric sequences and series",
        phase: "later",
        summary:
          "Work with geometric sequences and series, including the nth term, the sum of a finite series, and the sum to infinity of a convergent series with |r| < 1.",
        examNote:
          "The proof of the sum formula is also explicitly required. Sum to infinity demands you check and state |r| < 1. When you are given a sum and asked for n, the route out is logarithms — this is the standard crossover with topic 6.",
        keywords: ["geometric", "common ratio", "sum to infinity", "convergent", "GP", "proof", "logarithms"],
      },
      {
        code: "4.6",
        title: "Sequences and series in modelling",
        phase: "spanning",
        summary:
          "Use sequences and series in modelling, recognising when a situation is arithmetic — a fixed amount added each period — and when it is geometric, with a fixed percentage change.",
        examNote:
          "Savings schemes are the classic context: a fixed amount added each period is arithmetic, a fixed percentage is geometric. Deciding which is the actual skill being tested.",
        keywords: ["modelling", "savings", "interest", "growth", "context"],
      },
    ],
  },
  {
    number: 5,
    paper: "pure",
    name: "Trigonometry",
    slug: "trigonometry",
    blurb:
      "Nine spec points, the largest body of identities in the course, and a reliable source of both routine marks and genuinely hard proof questions.",
    points: [
      {
        code: "5.1",
        title: "Definitions, sine and cosine rules, radians",
        phase: "spanning",
        summary:
          "Use the definitions of sine, cosine and tangent for all arguments via the unit circle; the sine and cosine rules and the area of a triangle; work in radians, including arc length and sector area.",
        examNote:
          "The ambiguous case of the sine rule is named in the spec — when you find an angle from the sine rule, check whether the obtuse partner also works. Radians come later, and arc length and sector area are trivially easy marks provided you have not left the calculator in degrees.",
        keywords: ["sine rule", "cosine rule", "area of triangle", "radians", "arc length", "sector", "ambiguous case", "unit circle"],
      },
      {
        code: "5.2",
        title: "Small angle approximations",
        phase: "spanning",
        summary:
          "Use the standard small angle approximations for sine, cosine and tangent, with the angle in radians.",
        examNote:
          "Short, self-contained and frequently worth easy marks. The approximations are only valid in radians — the spec says so explicitly, and stating that is sometimes itself a mark.",
        keywords: ["small angle", "approximation", "radians", "series"],
      },
      {
        code: "5.3",
        title: "Trigonometric graphs and exact values",
        phase: "spanning",
        summary:
          "Understand the sine, cosine and tangent functions, their graphs, symmetries and periodicity; know the exact values of sine, cosine and tangent for the standard angles and their multiples.",
        examNote:
          "Exact values are not in the formula booklet. They underpin every show that your answer is exactly... question, and the fastest way to hold them is the unit circle rather than a memorised table.",
        keywords: ["graphs", "periodic", "symmetry", "exact values", "unit circle", "period", "amplitude"],
      },
      {
        code: "5.4",
        title: "Reciprocal and inverse trigonometric functions",
        phase: "later",
        summary:
          "Understand secant, cosecant and cotangent, and arcsin, arccos and arctan, their relationships to sine, cosine and tangent, and their graphs, domains and ranges.",
        examNote:
          "The inverse functions only exist because the domain is restricted — and the restricted domain and range are examinable in their own right, not just background. Sketching them with the correct asymptotes is a common request.",
        keywords: ["sec", "cosec", "cot", "arcsin", "arccos", "arctan", "inverse", "reciprocal", "domain", "range"],
      },
      {
        code: "5.5",
        title: "Trigonometric identities",
        phase: "spanning",
        summary:
          "Use the identities tan x = sin x / cos x and sin^2 x + cos^2 x = 1, and the derived identities for sec^2 and cosec^2, to solve equations and prove further identities.",
        examNote:
          "The Pythagorean identities are not printed in the formula booklet. Know sin^2 x + cos^2 x = 1, then divide through by cos^2 x to get 1 + tan^2 x = sec^2 x, or by sin^2 x to get 1 + cot^2 x = cosec^2 x. Deriving the other two in a line is safer than trusting memory, and the skill worth practising is spotting which form turns the equation or the proof in front of you into something solvable.",
        keywords: ["identities", "pythagorean", "sec squared", "cosec squared", "tan", "prove"],
      },
      {
        code: "5.6",
        title: "Double angle, compound angle and R form",
        phase: "later",
        summary:
          "Use the compound angle formulae for sin, cos and tan, the double angle formulae and their geometrical proofs, including application to half angles; express a cos x + b sin x in the equivalent form R cos(x ± α) or R sin(x ± α).",
        examNote:
          "The R form is the standard route to maximum and minimum values and to solving a cos x + b sin x = c — and it is worth a lot of marks across the paper. Once in R form the maximum is R and the minimum is -R, immediately. The spec explicitly excludes the half-angle t-formulae, so do not learn them.",
        keywords: ["double angle", "compound angle", "R form", "harmonic", "addition formulae", "maximum", "minimum"],
      },
      {
        code: "5.7",
        title: "Solving trigonometric equations",
        phase: "spanning",
        summary:
          "Solve trigonometric equations in a given interval, including quadratics in sin, cos and tan, and equations involving multiples of the unknown angle.",
        examNote:
          "The single biggest mark-loser in the topic is missing solutions. When the unknown is multiplied — say sin 3x — widen the interval by the same factor before solving, find every solution in the widened interval, then divide back. Always check whether the question is in degrees or radians; it will say.",
        keywords: ["solve", "equations", "interval", "general solution", "multiple angle", "quadratic in sin"],
      },
      {
        code: "5.8",
        title: "Proving trigonometric identities",
        phase: "later",
        summary: "Construct proofs involving trigonometric functions and identities.",
        examNote:
          "Work on one side only and transform it into the other — never treat it as an equation and operate on both sides, which examiners penalise. Converting everything to sine and cosine is the reliable fallback when you cannot see the trick.",
        keywords: ["prove", "identity", "proof", "show that"],
      },
      {
        code: "5.9",
        title: "Trigonometry in context",
        phase: "later",
        summary:
          "Use trigonometric functions to solve problems in context, including problems involving vectors, kinematics and forces.",
        examNote:
          "The modelling contexts named in the spec are wave motion, the height of a point on a vertical circular wheel, and hours of sunlight through the year — all of which reduce to interpreting amplitude, period and vertical shift in real terms.",
        keywords: ["context", "modelling", "wave", "tides", "daylight", "circular motion"],
      },
    ],
  },
  {
    number: 6,
    paper: "pure",
    name: "Exponentials and logarithms",
    slug: "exponentials-and-logarithms",
    blurb:
      "Taught early, self-contained, and the gateway to exponential modelling — one of the most heavily examined AO3 contexts in the whole qualification.",
    points: [
      {
        code: "6.1",
        title: "Exponential functions and their graphs",
        phase: "first",
        summary:
          "Know and use the function a^x and its graph for positive a, understanding the difference in shape for a < 1 and a > 1; know and use e^x and its graph, including y = e^(ax+b) + c.",
        examNote:
          "The horizontal asymptote is the detail people forget when sketching — for y = e^(ax+b) + c it sits at y = c, not at y = 0. Marks for sketches are for asymptote, intercept and shape.",
        keywords: ["exponential", "e", "graph", "asymptote", "growth", "decay"],
      },
      {
        code: "6.2",
        title: "The gradient of e^kx",
        phase: "first",
        summary:
          "Know that the gradient of e^kx is k e^kx, and hence understand why the exponential model is suitable in many applications.",
        examNote:
          "The conceptual point is the examinable one: when a rate of change is proportional to the amount present, the model must be exponential. That sentence is worth writing out in modelling questions.",
        keywords: ["gradient", "rate of change", "proportional", "exponential model"],
      },
      {
        code: "6.3",
        title: "Logarithms as inverse functions",
        phase: "first",
        summary:
          "Know and use log base a as the inverse of a^x, and ln x as the inverse of e^x, with their graphs; solve equations of the form e^(ax+b) = p and ln(ax + b) = q.",
        examNote:
          "Because log and exponential are inverses, taking logs of both sides is the standard unlock for any equation with the unknown in the power. Domain matters: you cannot take the log of a negative number, and checking that can rule out a spurious solution.",
        keywords: ["logarithm", "ln", "natural log", "inverse", "solve"],
      },
      {
        code: "6.4",
        title: "Laws of logarithms",
        phase: "first",
        summary:
          "Use the laws of logarithms for products, quotients and powers, including the special cases of reciprocals and roots.",
        examNote:
          "These are on the memorise list — they are not in the formula booklet. The power law is the one that does the real work, because it brings an unknown exponent down to ground level where you can solve for it.",
        keywords: ["log laws", "product", "quotient", "power", "change of base"],
      },
      {
        code: "6.5",
        title: "Solving equations of the form a^x = b",
        phase: "first",
        summary: "Solve equations of the form a^x = b, using the change of base formula where helpful.",
        examNote:
          "Mechanical once you take logs of both sides. The only real difficulty appears when the power is itself an expression, such as 2^(3x-1) = 3 — keep the bracket intact when you bring it down.",
        keywords: ["solve", "exponential equation", "change of base", "logs"],
      },
      {
        code: "6.6",
        title: "Logarithmic graphs and estimating parameters",
        phase: "first",
        summary:
          "Use logarithmic graphs to estimate parameters in relationships of the form y = ax^n and y = kb^x, given data for x and y.",
        examNote:
          "Know which pair of axes linearises which model: log y against log x gives a straight line for a power law, and log y against x gives one for an exponential law. Then the gradient and intercept carry the parameters. This links directly to Paper 3 statistics, where the same trick appears in regression.",
        keywords: ["log graph", "linearise", "power law", "gradient", "intercept", "regression"],
      },
      {
        code: "6.7",
        title: "Exponential growth and decay in modelling",
        phase: "first",
        summary:
          "Understand and use exponential growth and decay in modelling — including compound interest, radioactive decay, drug concentration and population growth — and consider the limitations and refinements of such models.",
        examNote:
          "Heavy AO3. Learn the vocabulary the spec names: initial means t = 0, and long-term behaviour means what happens as t grows without bound. Criticising the model is worth marks — unlimited exponential population growth is unrealistic because resources are finite.",
        keywords: ["growth", "decay", "half life", "compound interest", "population", "modelling", "limitations", "initial"],
      },
    ],
  },
  {
    number: 7,
    paper: "pure",
    name: "Differentiation",
    slug: "differentiation",
    blurb:
      "From first principles to implicit and parametric differentiation. Calculus is the spine of both Pure papers and feeds directly into mechanics.",
    points: [
      {
        code: "7.1",
        title: "The derivative, first principles and second derivatives",
        phase: "spanning",
        summary:
          "Understand the derivative as the gradient of the tangent and as a rate of change; differentiate from first principles for small positive integer powers of x and for sin x and cos x; sketch the gradient function; use the second derivative for maxima, minima, convex and concave sections, and points of inflection.",
        examNote:
          "Differentiation from first principles is explicitly required and is asked with the limit notation — reproduce the full argument, including the limit as h tends to zero, or the method marks do not come. The subtle case the spec flags is when both the first and second derivatives are zero: that point may still be a maximum, a minimum or an inflection, so you must test further.",
        keywords: ["first principles", "limit", "gradient function", "second derivative", "inflection", "convex", "concave", "stationary"],
      },
      {
        code: "7.2",
        title: "Standard derivatives",
        phase: "spanning",
        summary:
          "Differentiate x^n for rational n, and e^kx, a^kx, sin kx, cos kx, tan kx and ln x, with related sums, differences and constant multiples.",
        examNote:
          "Nearly always preceded by a rewriting step — surds and fractions must become powers of x before you differentiate. That first line is where the marks are actually lost.",
        keywords: ["differentiate", "derivative", "power rule", "standard results", "trig", "exponential"],
      },
      {
        code: "7.3",
        title: "Tangents, normals and stationary points",
        phase: "spanning",
        summary:
          "Apply differentiation to find gradients, tangents and normals, maxima, minima and stationary points and points of inflection, and identify where functions are increasing or decreasing.",
        examNote:
          "The normal has gradient -1 divided by the tangent gradient — the single most common slip in the topic. Optimisation questions set in a practical context are standard, and they usually require you to form the expression yourself before differentiating; that formation step carries AO3 marks.",
        keywords: ["tangent", "normal", "stationary points", "maximum", "minimum", "optimisation", "increasing", "decreasing"],
      },
      {
        code: "7.4",
        title: "Product, quotient and chain rules",
        phase: "later",
        summary:
          "Differentiate using the product, quotient and chain rules, including connected rates of change and inverse functions; differentiate cosec x, cot x and sec x.",
        examNote:
          "Connected rates of change is where the chain rule earns its keep — the spec gives the volume-and-radius example explicitly. Set out which quantity you are differentiating with respect to what, because examiners award method marks for the chain you construct, even if the arithmetic then fails.",
        keywords: ["product rule", "quotient rule", "chain rule", "connected rates", "related rates", "cosec", "cot", "sec"],
      },
      {
        code: "7.5",
        title: "Implicit and parametric differentiation",
        phase: "later",
        summary:
          "Differentiate simple functions and relations defined implicitly or parametrically, for the first derivative only, including finding tangents and normals to such curves.",
        examNote:
          "Implicit differentiation of a y term produces a dy/dx factor by the chain rule — miss it and everything after is wrong. Only the first derivative is required, so you will never be asked for an implicit second derivative.",
        keywords: ["implicit", "parametric", "dy/dx", "chain rule", "tangent", "normal"],
      },
      {
        code: "7.6",
        title: "Constructing differential equations",
        phase: "later",
        summary:
          "Construct simple differential equations in pure mathematics and in context, including kinematics, population growth and price-demand relationships.",
        examNote:
          "The skill is translating English into a derivative. Proportional to means equals k times, inversely proportional means k over, and decreasing means a negative sign — and forgetting that minus sign is the classic error.",
        keywords: ["differential equation", "proportional", "rate", "modelling", "construct"],
      },
    ],
  },
  {
    number: 8,
    paper: "pure",
    name: "Integration",
    slug: "integration",
    blurb:
      "Eight spec points from the Fundamental Theorem to differential equations — the largest calculus topic, and the one with the most technique to choose between.",
    points: [
      {
        code: "8.1",
        title: "The Fundamental Theorem of Calculus",
        phase: "first",
        summary:
          "Know and use the Fundamental Theorem of Calculus — integration as the reverse of differentiation, with a constant of integration required for indefinite integrals.",
        examNote:
          "The constant of integration is free marks and is dropped constantly. When a question gives you a point on the curve, it is telling you to find that constant.",
        keywords: ["fundamental theorem", "antiderivative", "constant of integration", "indefinite"],
      },
      {
        code: "8.2",
        title: "Standard integrals",
        phase: "spanning",
        summary:
          "Integrate x^n excluding n = -1, and e^kx, 1/x, sin kx and cos kx, with related sums, differences and constant multiples; use trigonometric identities to integrate expressions such as sin^2 x and tan^2 x.",
        examNote:
          "You cannot integrate sin^2 x directly — you must first convert it using the double angle identity. Recognising that a trig integral needs an identity before it can be done is the examinable judgement, and it links this topic straight back to 5.6.",
        keywords: ["integrate", "standard integrals", "trig identities", "double angle", "reverse chain rule"],
      },
      {
        code: "8.3",
        title: "Definite integrals and areas",
        phase: "spanning",
        summary:
          "Evaluate definite integrals; use a definite integral to find the area under a curve and the area between two curves, including curves defined parametrically.",
        examNote:
          "Area below the x-axis produces a negative integral. If a region straddles the axis you must split it and take absolute values, or the answer is wrong even though the integration is perfect. For the area between two curves, subtract upper minus lower and find the intersections first.",
        keywords: ["definite integral", "area under curve", "area between curves", "limits", "negative area"],
      },
      {
        code: "8.4",
        title: "Integration as the limit of a sum",
        phase: "later",
        summary: "Understand and use integration as the limit of a sum.",
        examNote:
          "Conceptual and usually short, but it is the idea that justifies why an integral measures an area at all, and it connects directly to the trapezium rule in topic 9.",
        keywords: ["limit of a sum", "riemann", "rectangles", "definition"],
      },
      {
        code: "8.5",
        title: "Integration by substitution and by parts",
        phase: "later",
        summary:
          "Carry out simple cases of integration by substitution and by parts, understanding these as the inverse processes of the chain and product rules; recognise integrals of the form f'(x)/f(x) giving a logarithm.",
        examNote:
          "Choosing the method is the real skill. Integration by parts can need more than one application, but reduction formulae are explicitly excluded. The spec specifically requires the integral of ln x, which is the standard by-parts trick of writing it as 1 times ln x. With a definite integral by substitution, change the limits too.",
        keywords: ["substitution", "by parts", "integration by parts", "ln x", "reverse chain rule", "limits"],
      },
      {
        code: "8.6",
        title: "Integration using partial fractions",
        phase: "later",
        summary: "Integrate using partial fractions that are linear in the denominator.",
        examNote:
          "This is why partial fractions exist in the spec at all. Each linear piece integrates to a logarithm, and the answer is usually tidied into a single log using the log laws — which is often the final accuracy mark.",
        keywords: ["partial fractions", "integrate", "logarithms", "linear denominator"],
      },
      {
        code: "8.7",
        title: "Differential equations with separable variables",
        phase: "later",
        summary:
          "Find the analytical solution of simple first order differential equations with separable variables, including finding particular solutions.",
        examNote:
          "Separate first, integrate both sides, then apply the initial condition — and put the constant in immediately rather than bolting it on later, because where it sits affects the final form. Sketching members of the family of solution curves is named in the spec.",
        keywords: ["differential equation", "separation of variables", "particular solution", "general solution", "initial condition"],
      },
      {
        code: "8.8",
        title: "Interpreting solutions of differential equations",
        phase: "later",
        summary:
          "Interpret the solution of a differential equation in context, including identifying its limitations, with links to kinematics.",
        examNote:
          "AO3 again. The standard question asks what happens for large values of the variable, and whether the model stays sensible — a population that grows without limit, or a temperature that falls below absolute zero, is a model breaking down.",
        keywords: ["interpret", "limitations", "long term", "context", "modelling"],
      },
    ],
  },
  {
    number: 9,
    paper: "pure",
    name: "Numerical methods",
    slug: "numerical-methods",
    blurb:
      "Taught later and entirely self-contained — the most learnable topic in the paper, and the one where knowing how each method fails is worth as much as using it.",
    points: [
      {
        code: "9.1",
        title: "Locating roots by change of sign",
        phase: "later",
        summary:
          "Locate roots of f(x) = 0 by considering sign changes in an interval where f is sufficiently well behaved, and understand how change of sign methods can fail.",
        examNote:
          "The layout is fixed and worth learning exactly: evaluate at both ends, state both values, say there is a sign change, and say that f is continuous — that last clause is a mark on its own. The two named failure modes are an even number of roots in the interval, and an asymptote masquerading as a root.",
        keywords: ["change of sign", "root", "interval", "continuous", "failure"],
      },
      {
        code: "9.2",
        title: "Iterative methods, cobweb and staircase diagrams",
        phase: "later",
        summary:
          "Solve equations approximately using simple iterative methods of the form x(n+1) = f(x n), and draw the associated cobweb and staircase diagrams to show convergence geometrically.",
        examNote:
          "The diagrams are explicitly examinable and must be drawn on the given axes with y = x and y = f(x). Converging towards the root in steps is a staircase; spiralling in is a cobweb. Quote iterates to the number of decimal places asked for and do not round mid-calculation.",
        keywords: ["iteration", "cobweb", "staircase", "convergence", "fixed point", "recurrence"],
      },
      {
        code: "9.3",
        title: "The Newton-Raphson method",
        phase: "later",
        summary:
          "Solve equations using the Newton-Raphson method and other recurrence relations, and understand how such methods can fail.",
        examNote:
          "You must understand it geometrically as following the tangent to where it crosses the axis. The named failure is a starting point where the gradient is near zero, which throws the next iterate far away. The formula is given in the booklet — the understanding is not.",
        keywords: ["newton raphson", "tangent", "iteration", "failure", "gradient"],
      },
      {
        code: "9.4",
        title: "The trapezium rule",
        phase: "later",
        summary:
          "Use numerical integration, including the trapezium rule, to estimate the area under a curve, and determine limits between which the true value must lie.",
        examNote:
          "Counting strips is the classic error: n strips means n + 1 ordinates. Whether the estimate is an over- or under-estimate follows from the curvature — concave up gives an over-estimate — and the spec expects you to justify it from a sketch.",
        keywords: ["trapezium rule", "ordinates", "strips", "overestimate", "underestimate", "numerical integration"],
      },
      {
        code: "9.5",
        title: "Numerical methods in context",
        phase: "later",
        summary: "Use numerical methods to solve problems in context.",
        examNote:
          "The framing is usually that an equation cannot be solved analytically, so an approximate method is the only option — saying that explicitly is often worth a mark.",
        keywords: ["context", "problem solving", "approximation", "modelling"],
      },
    ],
  },
  {
    number: 10,
    paper: "pure",
    name: "Vectors",
    slug: "vectors",
    blurb:
      "Two and three dimensional vectors. Short, geometric, and shared directly with mechanics on Paper 3.",
    points: [
      {
        code: "10.1",
        title: "Vectors in two and three dimensions",
        phase: "spanning",
        summary:
          "Use vectors in two and three dimensions, in column form and in i, j and k unit vector form.",
        examNote:
          "Three dimensions is the later extension and adds almost no new technique — the same methods, one more component. Being fluent moving between column and i, j, k notation matters because questions switch between them freely.",
        keywords: ["vectors", "column vector", "i j k", "unit vector", "three dimensions", "3D"],
      },
      {
        code: "10.2",
        title: "Magnitude and direction",
        phase: "first",
        summary:
          "Calculate the magnitude and direction of a vector and convert between component form and magnitude-direction form; find a unit vector in a given direction.",
        examNote:
          "A unit vector is the vector divided by its own magnitude — asked for directly and also embedded in forces questions on Paper 3. Direction angles need care about which axis you are measuring from; say which.",
        keywords: ["magnitude", "direction", "modulus", "unit vector", "bearing", "components"],
      },
      {
        code: "10.3",
        title: "Vector arithmetic and its geometry",
        phase: "first",
        summary:
          "Add vectors diagrammatically and algebraically, multiply by scalars, and understand the geometrical interpretation, including the triangle and parallelogram laws and parallel vectors.",
        examNote:
          "Parallel means one vector is a scalar multiple of the other — that single fact answers a large share of vector questions, including show that these points are collinear.",
        keywords: ["addition", "scalar multiple", "parallel", "triangle law", "parallelogram", "collinear", "resultant"],
      },
      {
        code: "10.4",
        title: "Position vectors and distance",
        phase: "first",
        summary:
          "Use position vectors, and calculate the distance between two points represented by position vectors, in two and three dimensions.",
        examNote:
          "The vector from A to B is the position vector of B minus that of A — get the order backwards and the direction reverses. Distance is then just Pythagoras extended to three dimensions.",
        keywords: ["position vector", "distance", "pythagoras", "displacement", "coordinates"],
      },
      {
        code: "10.5",
        title: "Vectors in problem solving",
        phase: "spanning",
        summary:
          "Use vectors to solve problems in pure mathematics and in context, including forces.",
        examNote:
          "Geometry problems such as finding the fourth vertex of a parallelogram are the pure context. The applied contexts — velocity, displacement, kinematics and forces — are examined on Paper 3, so the work you do here pays twice.",
        keywords: ["problem solving", "parallelogram", "geometry", "forces", "kinematics", "context"],
      },
    ],
  },
];
