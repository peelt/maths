import type { Paper, PaperInfo, SpecPoint, Topic } from "./types";
import { pureTopics } from "./pure";
import { statisticsTopics } from "./statistics";
import { mechanicsTopics } from "./mechanics";

export * from "./types";
export { pureTopics, statisticsTopics, mechanicsTopics };

/** Every topic in the qualification, in specification order. */
export const allTopics: Topic[] = [...pureTopics, ...statisticsTopics, ...mechanicsTopics];

/** Every spec point, flattened, in specification order. */
export const allSpecPoints: SpecPoint[] = allTopics.flatMap((t) => t.points);

export const papers: PaperInfo[] = [
  { id: "pure", label: "Papers 1 & 2: Pure Mathematics", durationMinutes: 120, marks: 100, weight: 66.7 },
  { id: "paper3", label: "Paper 3: Statistics & Mechanics", durationMinutes: 120, marks: 100, weight: 33.3 },
];

export const paperLabels: Record<Paper, string> = {
  pure: "Pure",
  statistics: "Statistics",
  mechanics: "Mechanics",
};

/**
 * Spec point codes repeat across papers — Pure has a 2.1 and Statistics has a
 * 2.1 — so a point is only globally unique when qualified by its paper.
 */
export function qualifiedCode(paper: Paper, code: string): string {
  return `${paper}:${code}`;
}

const topicBySlug = new Map(allTopics.map((t) => [t.slug, t]));
export function getTopic(slug: string): Topic | undefined {
  return topicBySlug.get(slug);
}

const pointIndex = new Map<string, { topic: Topic; point: SpecPoint }>();
for (const topic of allTopics) {
  for (const point of topic.points) {
    pointIndex.set(qualifiedCode(topic.paper, point.code), { topic, point });
  }
}

export function getSpecPoint(paper: Paper, code: string) {
  return pointIndex.get(qualifiedCode(paper, code));
}

/**
 * Is any part of this spec point usually taught in the first year?
 *
 * "spanning" counts, because a point that is part AS content is met early
 * even though it is finished later. Used to seed the "already covered"
 * default; once a student has marked their own topics, their answer wins.
 */
export function taughtEarly(point: SpecPoint): boolean {
  return point.phase === "first" || point.phase === "spanning";
}

export const specStats = {
  topics: allTopics.length,
  points: allSpecPoints.length,
  pure: pureTopics.reduce((n, t) => n + t.points.length, 0),
  statistics: statisticsTopics.reduce((n, t) => n + t.points.length, 0),
  mechanics: mechanicsTopics.reduce((n, t) => n + t.points.length, 0),
};
