import type { MarkRuleDrill } from "./types";

/**
 * Drills on the marking rules themselves.
 *
 * Every one of these is a rule that changes what a student should DO in the
 * exam — show the method even when the answer is wrong, never abandon a
 * question after one slip, carry a wrong value forward rather than stopping.
 * Knowing them is worth marks directly.
 */
export const markRuleDrills: readonly Omit<MarkRuleDrill, "kind" | "id">[] = [
  {
    prompt:
      "You use a completely correct method, but make an arithmetic slip in the last line and give the wrong final answer. The question is worth M1 A1.\n\nWhat do you earn?",
    answer: "The M1, but not the A1.",
    options: [
      "The M1, but not the A1.",
      "Nothing, because the final answer is wrong.",
      "Both, because the method was right.",
      "The A1, but not the M1.",
    ],
    explanation:
      "A method mark is for the method, and it survives an arithmetic slip. This is the single most valuable thing to know about mark schemes: it means showing your working is worth marks even when you know the answer has gone wrong — so never scribble out a wrong attempt without leaving the method visible.",
  },
  {
    prompt:
      "A mark scheme shows M1 then dM1. You did not earn the first M1.\n\nCan you still earn the dM1?",
    answer: "No — a dependent mark requires the mark it depends on.",
    options: [
      "No — a dependent mark requires the mark it depends on.",
      "Yes, if the second step is correct in itself.",
      "Yes, but only half of it.",
      "Only if the final answer is right.",
    ],
    explanation:
      "The 'd' means dependent. If the first method mark was not earned, the dependent one is unavailable no matter how good the later working is. In practice this is why a question that starts badly can be worth going back to fix rather than pressing on.",
  },
  {
    prompt:
      "You get a value wrong early in a long question, then use that wrong value correctly for the rest. The later mark is shown as A1ft.\n\nWhat happens?",
    answer: "You earn the A1ft, because it follows through from your own value.",
    options: [
      "You earn the A1ft, because it follows through from your own value.",
      "You lose it, because the value was wrong.",
      "You earn it only if you notice and say the value looks wrong.",
      "You earn half of it.",
    ],
    explanation:
      "'ft' means follow-through: the marker checks whether your answer is right FOR THE VALUE YOU HAD. This is why you should never abandon a question after one mistake — most of the later marks are usually still available.",
  },
  {
    prompt: "A step in a mark scheme is labelled B1.\n\nWhat does that tell you?",
    answer: "It is awarded on its own merit, independently of any other mark.",
    options: [
      "It is awarded on its own merit, independently of any other mark.",
      "It depends on the method mark before it.",
      "It is worth twice as much as an A1.",
      "It is only awarded if the whole question is correct.",
    ],
    explanation:
      "B marks are independent — typically for stating a correct value, writing down a condition, or quoting a formula. They are often the easiest marks in a question and the easiest to forget to write down. Stating a range, or that $|r|<1$, is frequently a whole B1.",
  },
  {
    prompt:
      "A question says 'Show that the area is $12$'. You reach $12$ but skip the middle two lines of working.\n\nWhat is the risk?",
    answer: "You lose the method marks, because in a 'show that' the working IS the answer.",
    options: [
      "You lose the method marks, because in a 'show that' the working IS the answer.",
      "Nothing, since you reached the right value.",
      "You lose only the final accuracy mark.",
      "You lose nothing, but the marker may ask for more detail.",
    ],
    explanation:
      "In a 'show that' question you are given the answer, so the answer earns nothing — every mark is for the route. These questions are also a gift in a later part: even if you cannot prove it, you can use the given result for the rest of the question.",
  },
  {
    prompt:
      "A question asks for an answer 'to 3 significant figures' and you give the exact value $\\frac{2}{3}$.\n\nWhat happens?",
    answer: "You usually lose the accuracy mark, because the question specified the form.",
    options: [
      "You usually lose the accuracy mark, because the question specified the form.",
      "Nothing — an exact answer is always better.",
      "You lose the method mark instead.",
      "You lose all the marks for the question.",
    ],
    explanation:
      "The instruction about form is part of the question. The reverse is also true and costs more marks: if a question says 'exact', a decimal will not do, because exact means a surd, a fraction, or something in terms of $\\pi$ or $e$.",
  },
  {
    prompt:
      "You round an intermediate value to 3 significant figures, then use it to work out the final answer.\n\nWhat is the danger?",
    answer: "The rounding error grows, and the final answer can be wrong in its third figure.",
    options: [
      "The rounding error grows, and the final answer can be wrong in its third figure.",
      "There is no danger if each step is rounded consistently.",
      "You lose the method mark for the rounded step.",
      "The answer will always be too small.",
    ],
    explanation:
      "Keep full accuracy in the calculator and round only at the very end. Mark schemes allow a narrow tolerance on the final answer, and premature rounding is one of the most common ways to fall just outside it having done everything else right.",
  },
  {
    prompt:
      "A 6-mark question asks you to 'solve' an equation and you find both roots, but one is impossible in context (a negative length).\n\nWhat should you write?",
    answer: "Both roots, then reject the impossible one and say why.",
    options: [
      "Both roots, then reject the impossible one and say why.",
      "Only the valid root, since the other is wrong.",
      "Both roots, leaving the marker to choose.",
      "Only the valid root, with the other crossed out.",
    ],
    explanation:
      "The rejection is itself a mark, and it needs a reason — 'a length cannot be negative', or 'you cannot take the logarithm of a negative number'. Giving both roots without rejecting one usually loses the final accuracy mark.",
  },
];
