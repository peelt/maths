import type { TeachingNote } from "./types";

/** Teaching notes for Pure topic 7: Differentiation. */
export const differentiationNotes: TeachingNote[] = [
  {
    paper: "pure",
    specCode: "7.1",
    idea: "The derivative is the gradient of the curve at a single point. You find it by taking the gradient of a chord between two points and sliding the second point towards the first until the gap vanishes — that limit is $f'(x)$.",
    method: [
      "Write the definition: $f'(x)=\\lim_{h\\to 0}\\dfrac{f(x+h)-f(x)}{h}$.",
      "Work out $f(x+h)$ in full, expanding every bracket.",
      "Subtract $f(x)$. Everything without an $h$ must cancel — if it does not, the expansion is wrong.",
      "Divide by $h$. Every surviving term had a factor of $h$, so this leaves no fraction.",
      "Now let $h\\to 0$: any term still containing $h$ disappears.",
      "For the second derivative, differentiate the result again. $\\dfrac{d^{2}y}{dx^{2}}$ tells you how the gradient is changing, which is what decides maximum against minimum.",
    ],
    watchFor: [
      "Expanding $(x+h)^{2}$ as $x^{2}+h^{2}$. It is $x^{2}+2xh+h^{2}$, and the middle term is the one that survives.",
      "Setting $h=0$ before dividing. That is dividing by zero — the cancelling has to come first.",
      "A question saying 'from first principles' is refusing you the power rule. Quoting the definition is worth a mark on its own.",
    ],
  },
  {
    paper: "pure",
    specCode: "7.2",
    idea: "For a power of $x$, differentiating means multiply by the power and then knock one off it. Every standard derivative you need beyond that ($e^{kx}$, $\\ln x$, $\\sin$, $\\cos$) is worth knowing cold, because they appear inside almost every harder question.",
    method: [
      "Rewrite every term as a power of $x$ first: $\\sqrt{x}$ is $x^{1/2}$, and $\\dfrac{1}{x^{3}}$ is $x^{-3}$.",
      "Apply $\\dfrac{d}{dx}\\left(x^{n}\\right)=nx^{\\,n-1}$ term by term.",
      "A constant differentiates to zero — it has no gradient.",
      "A constant multiplier is carried straight through: $\\dfrac{d}{dx}(5x^{3})=15x^{2}$.",
      "The ones to know: $e^{kx}\\to ke^{kx}$, $\\ln x\\to\\dfrac{1}{x}$, $\\sin x\\to\\cos x$, $\\cos x\\to-\\sin x$.",
    ],
    watchFor: [
      "Negative and fractional powers. Subtracting one from $-3$ gives $-4$, not $-2$.",
      "Trigonometric derivatives only work in RADIANS. In degrees they are wrong by a factor.",
      "Rewriting as powers before you start. Trying to differentiate $\\dfrac{1}{x^{3}}$ as it stands is where the sign errors come from.",
    ],
  },
  {
    paper: "pure",
    specCode: "7.3",
    idea: "The derivative is a gradient, so it answers three different questions: what is the gradient here (tangent), what is perpendicular to it (normal), and where is the gradient zero (stationary points).",
    method: [
      "Differentiate to get $\\dfrac{dy}{dx}$.",
      "For a tangent at $x=a$: substitute to get the gradient $m$, find $y$ at that point, then use $y-y_{1}=m(x-x_{1})$.",
      "For a normal: the gradient is $-\\dfrac{1}{m}$, because perpendicular gradients multiply to $-1$.",
      "For stationary points: set $\\dfrac{dy}{dx}=0$ and solve. Substitute back into the ORIGINAL equation to get the $y$ values.",
      "To classify: find $\\dfrac{d^{2}y}{dx^{2}}$. Positive means a minimum, negative a maximum, and zero means the test has failed and you must check the sign of the gradient either side instead.",
    ],
    watchFor: [
      "Substituting into the derivative to find $y$. The derivative gives gradients; the original equation gives the point.",
      "A normal gradient of $-m$ instead of $-\\frac{1}{m}$. Perpendicular means negative RECIPROCAL.",
      "Treating $\\frac{d^{2}y}{dx^{2}}=0$ as a point of inflection. It might be, but it might also be a maximum or minimum — the test is simply inconclusive.",
    ],
  },
  {
    paper: "pure",
    specCode: "7.4",
    idea: "Three rules for three shapes: a function inside a function (chain), two functions multiplied (product), one divided by another (quotient). Recognising which shape you are looking at is most of the work.",
    method: [
      "Ask what the expression IS. Is the whole thing raised to a power, or wrapped in $e$, $\\ln$ or a trig function? Chain rule. Is it two things multiplied? Product rule. A fraction? Quotient rule.",
      "Chain: let $u$ be the inside. Then $\\dfrac{dy}{dx}=\\dfrac{dy}{du}\\times\\dfrac{du}{dx}$ — differentiate the outside leaving the inside alone, then multiply by the derivative of the inside.",
      "Product: with $y=uv$, $\\dfrac{dy}{dx}=u\\dfrac{dv}{dx}+v\\dfrac{du}{dx}$. Write down $u$, $v$ and both derivatives before substituting anything.",
      "Quotient: with $y=\\dfrac{u}{v}$, $\\dfrac{dy}{dx}=\\dfrac{v\\frac{du}{dx}-u\\frac{dv}{dx}}{v^{2}}$. This one is GIVEN in the booklet — copy it rather than recalling it.",
      "Factorise the answer even when not asked. The next part of the question almost always wants the stationary points, and a factorised derivative hands them to you.",
    ],
    watchFor: [
      "The product and chain rules are NOT in the formula booklet, even though the quotient rule is. That is the opposite of what most people assume.",
      "Forgetting the derivative of the inside in a chain rule. It makes the answer wrong by a constant factor every time, and it is the most common Year 2 slip.",
      "The order of subtraction in the quotient rule. It is $v\\frac{du}{dx}$ first — unlike the product rule, it is not symmetric.",
      "A quotient can often be rewritten as a product with a negative power, which is usually less error-prone.",
    ],
  },
  {
    paper: "pure",
    specCode: "7.5",
    idea: "Both techniques handle curves that are not written as $y=f(x)$. Implicit differentiation differentiates an equation as it stands, treating $y$ as a function of $x$. Parametric differentiation goes through a third variable and divides one rate by the other.",
    method: [
      "Implicit: differentiate every term with respect to $x$. Any term in $y$ picks up a factor of $\\dfrac{dy}{dx}$, by the chain rule.",
      "A term with both $x$ and $y$ in it, such as $xy$, needs the product rule — and then the $y$ half needs the chain rule too.",
      "Collect every $\\dfrac{dy}{dx}$ on one side, factorise it out, and divide. The answer will usually contain both $x$ and $y$, which is expected.",
      "Parametric: differentiate $x$ and $y$ separately with respect to the parameter, then $\\dfrac{dy}{dx}=\\dfrac{dy/dt}{dx/dt}$.",
      "Leave a parametric answer in terms of the parameter unless the question asks otherwise. Converting back wastes time and risks marks.",
    ],
    watchFor: [
      "Differentiating $y^{2}$ to $2y$. Without the $\\frac{dy}{dx}$ you have differentiated with respect to $y$, not $x$.",
      "Dividing the parametric fractions the wrong way round. $\\frac{dy}{dt}$ goes on top, because it is $dy$ you want above $dx$.",
      "Forgetting that a constant on the right-hand side differentiates to zero — which is what makes the whole method work.",
    ],
  },
  {
    paper: "pure",
    specCode: "7.6",
    idea: "A differential equation is a sentence about a rate of change, written in symbols. Almost every one of these questions is a translation exercise: turn the English into $\\dfrac{dQ}{dt}=\\ldots$",
    method: [
      "Identify the quantity that is changing and what it is changing with respect to. That gives you the left-hand side, $\\dfrac{dQ}{dt}$.",
      "Find the phrase 'proportional to' and write what follows it, multiplied by a constant $k$.",
      "'Inversely proportional to' puts that quantity underneath: $\\dfrac{k}{Q}$.",
      "Decide the sign. If the quantity is decreasing and $k$ is positive, the right-hand side needs an explicit minus.",
      "State that $k>0$. It is what makes the sign meaningful rather than arbitrary, and it is often a mark.",
    ],
    watchFor: [
      "Proportional to the quantity itself, or to time? 'Grows in proportion to its size' is $kP$; 'grows steadily' is just $k$.",
      "Losing the minus sign on something that is decreasing. Cooling, leaking and decaying all need it.",
      "A rate 'proportional to the difference between $\\theta$ and the room temperature' is $k(\\theta-\\theta_{0})$, not $k\\theta$ — which is why a cooling object stops cooling once it reaches room temperature.",
    ],
  },
];
