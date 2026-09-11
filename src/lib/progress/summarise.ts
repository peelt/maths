import { getSpecPoint, type Paper, type Topic } from "@/content/spec";
import { mastery, type ReviewState } from "@/lib/scheduling";
import type { Attempt, SessionSummary } from "./types";

/**
 * Turning raw attempts into the few things worth showing.
 *
 * Kept out of the component and unit tested, because "how am I doing" is only
 * useful if the numbers are right — a progress page that flatters or misleads
 * is worse than none.
 */

export interface TopicSummary {
  topic: Topic;
  attempted: number;
  correct: number;
  /** 0-1, or null when nothing has been attempted. */
  accuracy: number | null;
  /** Mean mastery across this topic's spec points that have been seen. */
  mastery: number;
}

export interface WeakPoint {
  specPoint: string;
  paper: Paper;
  code: string;
  title: string;
  topicSlug: string;
  topicName: string;
  attempted: number;
  correct: number;
  accuracy: number;
}

export interface OverallSummary {
  attempted: number;
  correct: number;
  accuracy: number | null;
  /** Spec points with at least one attempt. */
  specPointsSeen: number;
  totalTimeMs: number;
}

function splitSpecPoint(specPoint: string): { paper: Paper; code: string } | null {
  const [paper, code] = specPoint.split(":");
  if (!paper || !code) return null;
  return { paper: paper as Paper, code };
}

export function summariseOverall(attempts: Attempt[]): OverallSummary {
  const correct = attempts.filter((a) => a.correct).length;
  return {
    attempted: attempts.length,
    correct,
    accuracy: attempts.length ? correct / attempts.length : null,
    specPointsSeen: new Set(attempts.map((a) => a.specPoint)).size,
    totalTimeMs: attempts.reduce((total, a) => total + a.timeMs, 0),
  };
}

export function summariseByTopic(attempts: Attempt[], reviews: ReviewState[]): TopicSummary[] {
  const byTopic = new Map<string, TopicSummary>();

  const ensure = (topic: Topic): TopicSummary => {
    const existing = byTopic.get(topic.slug);
    if (existing) return existing;
    const created: TopicSummary = { topic, attempted: 0, correct: 0, accuracy: null, mastery: 0 };
    byTopic.set(topic.slug, created);
    return created;
  };

  for (const attempt of attempts) {
    const parts = splitSpecPoint(attempt.specPoint);
    if (!parts) continue;
    const found = getSpecPoint(parts.paper, parts.code);
    if (!found) continue;
    const summary = ensure(found.topic);
    summary.attempted += 1;
    if (attempt.correct) summary.correct += 1;
  }

  // Mastery is averaged only over spec points actually seen, so a topic is not
  // dragged towards zero by points that have never been attempted.
  const masteryByTopic = new Map<string, number[]>();
  for (const review of reviews) {
    const parts = splitSpecPoint(review.specPoint);
    if (!parts) continue;
    const found = getSpecPoint(parts.paper, parts.code);
    if (!found) continue;
    ensure(found.topic);
    const list = masteryByTopic.get(found.topic.slug) ?? [];
    list.push(mastery(review));
    masteryByTopic.set(found.topic.slug, list);
  }

  for (const [slug, values] of masteryByTopic) {
    const summary = byTopic.get(slug);
    if (!summary || values.length === 0) continue;
    summary.mastery = values.reduce((a, b) => a + b, 0) / values.length;
  }

  for (const summary of byTopic.values()) {
    summary.accuracy = summary.attempted ? summary.correct / summary.attempted : null;
  }

  return [...byTopic.values()].sort((a, b) => b.attempted - a.attempted);
}

/**
 * Spec points worth going back to.
 *
 * Requires a minimum number of attempts, because one wrong answer out of one is
 * noise, not a weakness — and sending someone to "revise" on that basis wastes
 * the trip.
 */
export function weakestPoints(attempts: Attempt[], minimumAttempts = 2, limit = 5): WeakPoint[] {
  const tally = new Map<string, { attempted: number; correct: number }>();

  for (const attempt of attempts) {
    const entry = tally.get(attempt.specPoint) ?? { attempted: 0, correct: 0 };
    entry.attempted += 1;
    if (attempt.correct) entry.correct += 1;
    tally.set(attempt.specPoint, entry);
  }

  const out: WeakPoint[] = [];
  for (const [specPoint, entry] of tally) {
    if (entry.attempted < minimumAttempts) continue;
    const accuracy = entry.correct / entry.attempted;
    if (accuracy >= 1) continue;

    const parts = splitSpecPoint(specPoint);
    if (!parts) continue;
    const found = getSpecPoint(parts.paper, parts.code);
    if (!found) continue;

    out.push({
      specPoint,
      paper: parts.paper,
      code: parts.code,
      title: found.point.title,
      topicSlug: found.topic.slug,
      topicName: found.topic.name,
      attempted: entry.attempted,
      correct: entry.correct,
      accuracy,
    });
  }

  return out.sort((a, b) => a.accuracy - b.accuracy).slice(0, limit);
}

/** Newest first. */
export function recentSessions(sessions: SessionSummary[], limit = 10): SessionSummary[] {
  return [...sessions]
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, limit);
}
