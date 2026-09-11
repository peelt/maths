import { describe, expect, it } from "vitest";
import { evaluateString, parseExpression, variablesIn, ExpressionError } from "./expression";
import { stringsEquivalent } from "./equivalence";
import { markAnswer } from "./index";

describe("expression parsing", () => {
  it("handles basic arithmetic and precedence", () => {
    expect(evaluateString("2+3*4")).toBe(14);
    expect(evaluateString("(2+3)*4")).toBe(20);
    expect(evaluateString("10-2-3")).toBe(5); // left associative
    expect(evaluateString("2^3^2")).toBe(512); // right associative
  });

  it("handles unary and signed exponents", () => {
    expect(evaluateString("-5")).toBe(-5);
    expect(evaluateString("2^-1")).toBe(0.5);
    expect(evaluateString("-2^2")).toBe(-4); // negation applies after the power
  });

  it("handles implicit multiplication the way students write it", () => {
    expect(evaluateString("2x", { x: 5 })).toBe(10);
    expect(evaluateString("(2)(3)")).toBe(6);
    expect(evaluateString("2pi")).toBeCloseTo(2 * Math.PI, 12);
    expect(evaluateString("3sin(0)")).toBe(0);
  });

  it("accepts functions with and without brackets", () => {
    expect(evaluateString("sin(0)")).toBe(0);
    expect(evaluateString("cos 0")).toBe(1);
    expect(evaluateString("sqrt 16")).toBe(4);
    expect(evaluateString("ln(e)")).toBeCloseTo(1, 12);
    expect(evaluateString("log(100)")).toBeCloseTo(2, 12);
  });

  it("accepts characters students actually paste", () => {
    expect(evaluateString("√16")).toBe(4);
    expect(evaluateString("2×3")).toBe(6);
    expect(evaluateString("6÷2")).toBe(3);
    expect(evaluateString("−4")).toBe(-4); // unicode minus
    expect(evaluateString("3²")).toBe(9);
  });

  it("supports modulus bars", () => {
    expect(evaluateString("|-7|")).toBe(7);
    expect(evaluateString("|3-8|")).toBe(5);
  });

  it("distinguishes scientific notation from e as a constant", () => {
    expect(evaluateString("1.5e3")).toBe(1500);
    expect(evaluateString("2e")).toBeCloseTo(2 * Math.E, 12);
  });

  it("reports its free variables", () => {
    expect(variablesIn(parseExpression("x^2 + y"))).toEqual(["x", "y"]);
    expect(variablesIn(parseExpression("2pi"))).toEqual([]);
  });

  it("rejects malformed input rather than guessing", () => {
    expect(() => parseExpression("2+")).toThrow(ExpressionError);
    expect(() => parseExpression("(2+3")).toThrow(ExpressionError);
    expect(() => parseExpression("")).toThrow(ExpressionError);
    expect(() => parseExpression("1.2.3")).toThrow(ExpressionError);
  });
});

describe("algebraic equivalence", () => {
  it("accepts a correct answer written in a different form", () => {
    expect(stringsEquivalent("(x+1)^2", "x^2+2x+1")).toBe(true);
    expect(stringsEquivalent("1/2", "0.5")).toBe(true);
    expect(stringsEquivalent("2^-1", "0.5")).toBe(true);
    expect(stringsEquivalent("sqrt(2)/2", "1/sqrt(2)")).toBe(true);
    expect(stringsEquivalent("2sin(x)cos(x)", "sin(2x)")).toBe(true);
    expect(stringsEquivalent("(x^2-1)/(x-1)", "x+1")).toBe(true);
  });

  it("rejects answers that are genuinely different", () => {
    expect(stringsEquivalent("x^2", "x^3")).toBe(false);
    expect(stringsEquivalent("(x+1)^2", "x^2+1")).toBe(false);
    expect(stringsEquivalent("sin(x)", "cos(x)")).toBe(false);
    expect(stringsEquivalent("1/2", "1/3")).toBe(false);
  });

  it("handles sign errors, the most common student slip", () => {
    expect(stringsEquivalent("-2x", "2x")).toBe(false);
    expect(stringsEquivalent("x-1", "1-x")).toBe(false);
  });
});

describe("marking numeric answers", () => {
  it("accepts equivalent numeric forms", () => {
    const spec = { type: "numeric", value: 0.5 } as const;
    for (const input of ["0.5", "1/2", "2^-1", ".5"]) {
      expect(markAnswer(input, spec).correct).toBe(true);
    }
  });

  it("accepts an answer rounded to three significant figures", () => {
    const spec = { type: "numeric", value: 3.14159265 } as const;
    expect(markAnswer("3.14", spec).correct).toBe(true);
    expect(markAnswer("3.1", spec).correct).toBe(false);
  });

  it("rejects a decimal when the question demands an exact answer", () => {
    const spec = { type: "numeric", value: Math.PI / 2, requireExact: true } as const;
    const rounded = markAnswer("1.5708", spec);
    expect(rounded.correct).toBe(false);
    expect(rounded.outcome).toBe("not-exact");
    expect(rounded.message).toMatch(/exact/i);

    expect(markAnswer("pi/2", spec).correct).toBe(true);
  });

  it("explains itself rather than silently marking wrong", () => {
    const spec = { type: "numeric", value: 4 } as const;
    const result = markAnswer("4x", spec);
    expect(result.outcome).toBe("unparseable");
    expect(result.message).toMatch(/number/i);

    expect(markAnswer("", spec).message).toMatch(/enter an answer/i);
    expect(markAnswer("((", spec).outcome).toBe("unparseable");
  });
});

describe("marking expression answers", () => {
  const spec = { type: "expression", value: "3x^2 + 2x" } as const;

  it("accepts any equivalent rearrangement", () => {
    expect(markAnswer("3x^2+2x", spec).correct).toBe(true);
    expect(markAnswer("2x + 3x^2", spec).correct).toBe(true);
    expect(markAnswer("x(3x+2)", spec).correct).toBe(true);
  });

  it("rejects a wrong derivative", () => {
    expect(markAnswer("3x^2+2", spec).correct).toBe(false);
    expect(markAnswer("6x+2", spec).correct).toBe(false);
  });
});

describe("marking choice and text answers", () => {
  it("marks multiple choice", () => {
    const spec = { type: "choice", value: "b", options: ["a", "b", "c"] } as const;
    expect(markAnswer("b", spec).correct).toBe(true);
    expect(markAnswer("a", spec).correct).toBe(false);
  });

  it("marks short text tolerantly of case and punctuation", () => {
    const spec = { type: "text", value: "stratified sampling", accept: ["stratified"] } as const;
    expect(markAnswer("Stratified Sampling", spec).correct).toBe(true);
    expect(markAnswer("stratified.", spec).correct).toBe(true);
    expect(markAnswer("quota", spec).correct).toBe(false);
  });
});
