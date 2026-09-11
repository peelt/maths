import type { ComponentType } from "react";
import { TransformationExplorer } from "./TransformationExplorer";
import { DerivativeExplorer } from "./DerivativeExplorer";

/**
 * Interactives, keyed by the spec point they illuminate.
 *
 * Deliberately sparse. An interactive earns its place only where seeing the
 * thing move teaches something a sentence cannot — a slider on a topic that
 * reads perfectly well as text is just another thing on the screen.
 */
export interface Interactive {
  title: string;
  /** What to actually do with it. */
  prompt: string;
  Component: ComponentType;
}

export const interactives: Record<string, Interactive> = {
  "pure:2.9": {
    title: "Move the graph",
    prompt:
      "Switch between the four transformations and drag the slider. Watch which ones behave as they look, and which do the opposite.",
    Component: TransformationExplorer,
  },
  "pure:7.1": {
    title: "The derivative is a gradient",
    prompt:
      "Slide the point along the curve. The tangent follows it, and the number underneath is the derivative at that exact point.",
    Component: DerivativeExplorer,
  },
  "pure:7.3": {
    title: "Find the stationary points by eye",
    prompt:
      "Move the point until the tangent goes flat. That is what solving dy/dx = 0 finds for you.",
    Component: DerivativeExplorer,
  },
};

export function interactiveFor(paper: string, code: string): Interactive | undefined {
  return interactives[`${paper}:${code}`];
}

export { TransformationExplorer, DerivativeExplorer };
