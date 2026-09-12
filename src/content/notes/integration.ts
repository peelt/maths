import type { TeachingNote } from "./types";

/** Teaching notes for Pure topic 8: Integration. */
export const integrationNotes: TeachingNote[] = [
  {
    paper: "pure",
    specCode: "8.1",
    idea: "Integration undoes differentiation. Because every constant differentiates to zero, undoing it cannot tell you which constant was there — so an indefinite integral is a whole family of curves, and $+c$ is the name of that ignorance.",
    method: [
      "Raise the power by one and divide by the new power: $\\displaystyle\\int x^{n}\\,dx=\\frac{x^{\\,n+1}}{n+1}+c$.",
      "Write $+c$ every single time. It is a mark.",
      "If the question gives you a point on the curve, substitute it in to find $c$.",
      "Check by differentiating your answer — you should get back exactly what you were given.",
    ],
    watchFor: [
      "Leaving the answer as $+c$ when a point was provided. The point is there precisely so that $c$ can be found, and the last marks are for finding it.",
      "The rule fails for $n=-1$, because dividing by $n+1$ would be dividing by zero. That case integrates to $\\ln|x|$ instead.",
      "Forgetting $+c$ on an indefinite integral while correctly omitting it on a definite one — the constants cancel when you subtract.",
    ],
  },
  {
    paper: "pure",
    specCode: "8.2",
    idea: "The standard integrals are the table of derivatives read backwards. If you know what differentiates to give something, you know its integral — which is why there is far less to memorise here than it first appears.",
    method: [
      "Rewrite every term as a power of $x$ before integrating: $\\sqrt{x}$ is $x^{1/2}$, $\\dfrac{1}{x^{2}}$ is $x^{-2}$.",
      "$\\displaystyle\\int e^{kx}dx=\\frac{1}{k}e^{kx}+c$ — dividing by $k$ because differentiating would have multiplied by it.",
      "$\\displaystyle\\int\\frac{1}{x}dx=\\ln|x|+c$. The modulus bars matter: $\\frac{1}{x}$ exists for negative $x$ but $\\ln x$ does not.",
      "$\\displaystyle\\int\\sin x\\,dx=-\\cos x+c$ and $\\displaystyle\\int\\cos x\\,dx=\\sin x+c$. The minus sign lives with the sine.",
      "For a linear inside, such as $f(ax+b)$, integrate as normal and then divide by $a$.",
    ],
    watchFor: [
      "Forgetting to divide by the coefficient of $x$. $\\int e^{3x}dx$ is $\\frac{1}{3}e^{3x}$, not $e^{3x}$.",
      "Getting the sine and cosine signs the wrong way round. Differentiating cosine gives the minus; integrating sine inherits it.",
      "Dropping the modulus in $\\ln|x|$ — mark schemes expect it.",
    ],
  },
  {
    paper: "pure",
    specCode: "8.3",
    idea: "A definite integral is the signed area between a curve and the $x$-axis. Signed is the key word: area below the axis counts as negative, so an integral and an area are not always the same number.",
    method: [
      "Integrate, then evaluate at the top limit and subtract the value at the bottom limit.",
      "Use square brackets with the limits written on them — it is where the method mark lives.",
      "No $+c$ is needed: it would appear twice and cancel in the subtraction.",
      "If the question asks for AREA and the curve crosses the axis inside the interval, find the crossing point, integrate each piece separately, and add the magnitudes.",
      "For the area between two curves, find where they meet, then integrate (upper curve − lower curve) between those points.",
    ],
    watchFor: [
      "Reporting a negative answer as an area. A region below the axis has negative integral but positive area.",
      "Integrating straight across a crossing point. The parts cancel and you get an answer that is too small, sometimes zero.",
      "Subtracting the limits the wrong way round, which flips the sign of everything.",
    ],
  },
  {
    paper: "pure",
    specCode: "8.4",
    idea: "Before integration had rules it had a definition: chop the region into thin rectangles, add their areas, and let the width shrink to nothing. The integral sign is a stretched S for 'sum', and $dx$ is what the width $\\delta x$ becomes in the limit.",
    method: [
      "Each strip has height $f(x)$ and width $\\delta x$, so its area is $f(x)\\,\\delta x$.",
      "Add them: $\\displaystyle\\sum f(x)\\,\\delta x$ — an approximation, because the tops of the rectangles are flat and the curve is not.",
      "Let $\\delta x\\to 0$, which is the same as letting the number of strips tend to infinity.",
      "In the limit, $\\displaystyle\\lim_{\\delta x\\to 0}\\sum_{x=a}^{b}f(x)\\,\\delta x=\\int_{a}^{b}f(x)\\,dx$.",
    ],
    watchFor: [
      "Writing $n\\to 0$ instead of $\\delta x\\to 0$. More strips means thinner strips, so it is the WIDTH that goes to zero and the number that goes to infinity.",
      "Dropping the $\\delta x$ from the sum. That adds up heights rather than areas, which is not a quantity at all.",
      "This is a 'show that' or 'explain' topic rather than a calculation. The marks are for the notation and the limit.",
    ],
  },
  {
    paper: "pure",
    specCode: "8.5",
    idea: "Two techniques for integrals that are not standard forms. Substitution reverses the chain rule — it works when part of the integrand is the derivative of another part. Parts reverses the product rule, and is for a product of two unrelated functions.",
    method: [
      "Substitution: choose $u$ to be the awkward inner expression. Differentiate to get $du=\\ldots dx$, and check that what remains in the integrand matches.",
      "Convert the limits to values of $u$ as well. Then you never have to substitute back.",
      "Integrate in $u$, and evaluate with the $u$ limits.",
      "Parts: $\\displaystyle\\int u\\frac{dv}{dx}dx=uv-\\int v\\frac{du}{dx}dx$ — this IS in the booklet.",
      "Choose $u$ to be the part that gets SIMPLER when differentiated, usually a power of $x$ or a logarithm. The remaining integral must be easier than the one you started with, or the choice was wrong.",
    ],
    watchFor: [
      "Changing the integrand to $u$ but leaving the limits as values of $x$. Once the variable changes, the limits must too.",
      "Choosing $u=e^{kx}$ in parts. Differentiating it never simplifies anything and the new integral is no better.",
      "For $\\int\\ln x\\,dx$, take $u=\\ln x$ and $\\frac{dv}{dx}=1$. It looks like there is nothing to split, and that is the trick.",
    ],
  },
  {
    paper: "pure",
    specCode: "8.6",
    idea: "A fraction with a factorised denominator is not a standard integral, but each piece of its partial fraction decomposition is. Splitting first turns one hard integral into two easy logarithms.",
    method: [
      "Split into partial fractions: $\\dfrac{\\text{something}}{(x+a)(x+b)}\\equiv\\dfrac{A}{x+a}+\\dfrac{B}{x+b}$.",
      "Multiply through by the whole denominator to clear the fractions.",
      "Substitute the value of $x$ that makes one bracket zero — it kills one unknown and hands you the other immediately.",
      "Integrate each piece: $\\displaystyle\\int\\frac{A}{x+a}dx=A\\ln|x+a|$.",
      "Combine into a single logarithm before substituting limits — it makes the arithmetic much shorter.",
    ],
    watchFor: [
      "Trying to integrate the fraction whole, as a log of the denominator. That is not a standard form and it is simply wrong.",
      "A repeated factor $(x+a)^{2}$ needs THREE terms: $\\dfrac{A}{x+a}+\\dfrac{B}{(x+a)^{2}}$ plus whatever else is in the denominator.",
      "If the numerator's degree is as high as the denominator's, divide first — partial fractions only work on a proper fraction.",
    ],
  },
  {
    paper: "pure",
    specCode: "8.7",
    idea: "A separable differential equation is one where you can get all the $y$ terms on one side and all the $x$ terms on the other. Once separated, you integrate each side with respect to its own variable.",
    method: [
      "Rearrange to the form $g(y)\\,dy=f(x)\\,dx$.",
      "Integrate both sides: $\\displaystyle\\int g(y)\\,dy=\\int f(x)\\,dx$.",
      "One constant is enough — a constant on each side would just combine into one.",
      "Use the initial condition straight away to find $c$, before rearranging. It keeps the algebra simple.",
      "Only then make $y$ the subject, if the question asks for it.",
    ],
    watchFor: [
      "Integrating one side and not the other. Both sides must be integrated, each with respect to its own variable.",
      "Rearranging into the final form before finding $c$. It usually makes the constant much harder to extract.",
      "When the answer needs $y$ alone and $\\ln y$ appears, remember $e^{A+c}=e^{A}\\times e^{c}$, so the constant becomes a MULTIPLIER, not an addition.",
    ],
  },
  {
    paper: "pure",
    specCode: "8.8",
    idea: "Solving the equation is only half of one of these questions. The other half is saying what the solution means: what happens in the long run, whether a limit exists, and where the model stops being believable.",
    method: [
      "Look at the exponential term as the variable grows. A negative exponent decays to zero; a positive one grows without limit.",
      "Whatever is left behind when the decaying term vanishes is the long-term value.",
      "State it in context, with units — 'the temperature approaches $20^{\\circ}$C' rather than 'it tends to 20'.",
      "Say whether the limit is ever reached. An exponential approaches its limit without attaining it.",
      "Comment on the model's limitations if asked: what has been ignored, and where would it break down?",
    ],
    watchFor: [
      "Answering that the temperature tends to zero. Only the exponential TERM decays; a constant added to it stays.",
      "Giving a bare number with no context or units. These are AO3 marks and they are for the interpretation.",
      "Claiming the limit is reached. 'Approaches but never reaches' is the mathematically correct statement, and noting that reality differs is a fair criticism of the model.",
    ],
  },
];
