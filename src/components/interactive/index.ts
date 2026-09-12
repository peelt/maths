import type { ComponentType } from "react";
import { TransformationExplorer } from "./TransformationExplorer";
import { DerivativeExplorer } from "./DerivativeExplorer";
import { UnitCircleExplorer } from "./UnitCircleExplorer";
import { AreaExplorer } from "./AreaExplorer";
import { RFormExplorer } from "./RFormExplorer";
import { ProjectileExplorer } from "./ProjectileExplorer";

/**
 * Interactives, keyed by the spec point they illuminate.
 *
 * Deliberately sparse. An interactive earns its place only where seeing the
 * thing move teaches something a sentence cannot — a slider on a topic that
 * reads perfectly well as text is just another thing on the screen. Each one
 * here targets a specific misconception, named in its own file.
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
  "pure:5.1": {
    title: "Where sine and cosine come from",
    prompt:
      "Drag the angle. Sine is the height of the point, cosine is how far across it is — and the graph beside it is that same length plotted against the angle.",
    Component: UnitCircleExplorer,
  },
  "pure:5.3": {
    title: "The circle behind the graph",
    prompt:
      "Use the landmark buttons for the exact-value angles. The quadrant tells you the signs, so there is nothing to memorise beyond two triangles.",
    Component: UnitCircleExplorer,
  },
  "pure:5.6": {
    title: "Two waves make one",
    prompt:
      "Change a and b. The dashed wave is R sin(θ + α), and it lands exactly on the sum — which is why the maximum is R and not a + b.",
    Component: RFormExplorer,
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
  "pure:8.3": {
    title: "Area under a curve, by rectangles",
    prompt:
      "Drag the number of strips upwards and watch the error column shrink. The exact area is what the sum is heading towards.",
    Component: AreaExplorer,
  },
  "pure:8.4": {
    title: "Why an integral is a limit of a sum",
    prompt:
      "Each rectangle has area f(x)δx. Increase n and the strips get thinner — the limit of that sum is what the integral sign means.",
    Component: AreaExplorer,
  },
  "mechanics:7.5": {
    title: "Horizontal and vertical are independent",
    prompt:
      "Change the angle and slide through the flight. The blue arrow never changes length; the orange one vanishes at the top — which is why the speed there is not zero.",
    Component: ProjectileExplorer,
  },
};

export function interactiveFor(paper: string, code: string): Interactive | undefined {
  return interactives[`${paper}:${code}`];
}

export {
  TransformationExplorer,
  DerivativeExplorer,
  UnitCircleExplorer,
  AreaExplorer,
  RFormExplorer,
  ProjectileExplorer,
};
