import source from "./another-way-in.json";
import { allTopics } from "@/content/spec";

/**
 * "Another way in" — a companion layer on each topic page.
 *
 * A second explanation for a student who has read the teaching note and is
 * still stuck: an intuition, a small self-check, and one video by someone who
 * teaches it differently. It is deliberately OUTSIDE the numbered spec points,
 * because none of it is examinable content in its own right — it exists to get
 * someone unstuck and back to the spec breakdown.
 *
 * The JSON beside this file is the supplied source, kept verbatim so its
 * provenance fields (evidence level, review date, editorial notes) survive for
 * whoever maintains it next. This module is the boundary: it validates the
 * shape, converts the maths delimiters, and hands components only the fields a
 * learner should see. Editorial metadata never crosses it.
 */

/** One "here is where I am stuck" entry, opened to reveal an explanation. */
export interface CompanionTip {
  /** Stable id from the source, used for keys and aria relationships. */
  id: string;
  /** The difficulty in the student's own voice — the visible label. */
  stuckOn: string;
  title: string;
  /** Prose with $ … $ maths, for <Maths>. */
  body: string;
}

/** An informal self-check. Never marked, never recorded. */
export interface CompanionCheck {
  question: string;
  answer: string;
}

export interface CompanionVideo {
  videoId: string;
  title: string;
  channel: string;
  durationSeconds: number;
  watchUrl: string;
  embedUrl: string;
  /** Where to start, when the useful part is not the beginning. */
  startSeconds: number | null;
  /** An absolute position in the video, not a length. */
  endSeconds: number | null;
  /** Why this video is worth the time. */
  benefit: string;
  /** What it does NOT cover — shown, never hidden. */
  scopeNote: string;
  chapters: { label: string; startSeconds: number }[];
}

export interface CompanionTopic {
  slug: string;
  intro: string;
  tips: CompanionTip[];
  check: CompanionCheck;
  video: CompanionVideo;
}

/**
 * The source is authored with LaTeX between \( … \) and \[ … \], which is the
 * convention of the document it came from. Everything else in this repository
 * uses $ … $ and $$ … $$, and <Maths> only understands those, so the content is
 * converted once here rather than teaching the renderer a second dialect or
 * leaving one content file that behaves differently from the rest.
 *
 * This is a delimiter swap and nothing else — the LaTeX between the delimiters
 * is untouched, and a test renders every converted string and compares the
 * output against the same string rendered from the original source.
 */
export function toDollarMaths(source: string): string {
  return source.replace(/\\\[([\s\S]+?)\\\]/g, "$$$$$1$$$$").replace(/\\\(([\s\S]+?)\\\)/g, "$$$1$$");
}

/** Hosts a player URL is allowed to point at. Anything else is a bad record. */
const ALLOWED_EMBED_HOST = "www.youtube-nocookie.com";
const ALLOWED_WATCH_HOST = "www.youtube.com";
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

function checkVideoUrls(slug: string, videoId: string, watchUrl: string, embedUrl: string): void {
  if (!VIDEO_ID.test(videoId)) {
    throw new Error(`another-way-in: ${slug} has an implausible video id "${videoId}"`);
  }
  const watch = new URL(watchUrl);
  const embed = new URL(embedUrl);
  if (watch.protocol !== "https:" || watch.host !== ALLOWED_WATCH_HOST) {
    throw new Error(`another-way-in: ${slug} watch URL is not on ${ALLOWED_WATCH_HOST}: ${watchUrl}`);
  }
  if (embed.protocol !== "https:" || embed.host !== ALLOWED_EMBED_HOST) {
    throw new Error(`another-way-in: ${slug} embed URL is not on ${ALLOWED_EMBED_HOST}: ${embedUrl}`);
  }
  // The id in each URL must be the id we validated, so a mismatched record
  // cannot quietly send a student to a different video from the one described.
  if (watch.searchParams.get("v") !== videoId) {
    throw new Error(`another-way-in: ${slug} watch URL does not carry video id ${videoId}`);
  }
  if (embed.pathname !== `/embed/${videoId}`) {
    throw new Error(`another-way-in: ${slug} embed URL does not carry video id ${videoId}`);
  }
}

/**
 * Optional fields, read defensively.
 *
 * Only some records carry `suggested_end_seconds` or `verified_chapters`, so
 * reading them off the JSON's inferred union does not typecheck — and should
 * not: this is external data, and the right thing at a boundary is to ask what
 * is actually there rather than to assert what ought to be.
 */
function optionalSeconds(record: object, key: string): number | null {
  const value = (record as Record<string, unknown>)[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function optionalChapters(record: object): { label: string; startSeconds: number }[] {
  const value = (record as Record<string, unknown>).verified_chapters;
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return [];
    const { label, start_seconds: start } = entry as { label?: unknown; start_seconds?: unknown };
    if (typeof label !== "string" || typeof start !== "number") return [];
    return [{ label, startSeconds: start }];
  });
}

function build(): Map<string, CompanionTopic> {
  const out = new Map<string, CompanionTopic>();

  for (const topic of source.topics) {
    if (out.has(topic.slug)) {
      throw new Error(`another-way-in: two records for "${topic.slug}"`);
    }
    const video = topic.videos.find((v) => v.role === "primary") ?? topic.videos[0];
    if (!video) throw new Error(`another-way-in: ${topic.slug} has no video`);
    checkVideoUrls(topic.slug, video.video_id, video.watch_url, video.embed_url);

    out.set(topic.slug, {
      slug: topic.slug,
      intro: toDollarMaths(topic.intro_markdown),
      tips: topic.tips.map((tip) => ({
        id: tip.id,
        stuckOn: tip.stuck_on,
        title: tip.title,
        body: toDollarMaths(tip.body_markdown),
      })),
      check: {
        question: toDollarMaths(topic.quick_check.question_markdown),
        answer: toDollarMaths(topic.quick_check.answer_markdown),
      },
      video: {
        videoId: video.video_id,
        title: video.video_title,
        channel: video.channel,
        durationSeconds: video.duration_seconds,
        watchUrl: video.watch_url,
        embedUrl: video.embed_url,
        startSeconds: video.start_seconds ?? null,
        endSeconds: optionalSeconds(video, "suggested_end_seconds"),
        benefit: video.teaching_benefit,
        scopeNote: video.scope_note,
        chapters: optionalChapters(video),
      },
    });
  }

  // A topic with no companion record renders the page without the section, and
  // that is the right behaviour at runtime. It is the wrong thing to discover
  // in production, so an incomplete set fails the build instead.
  const missing = allTopics.map((t) => t.slug).filter((slug) => !out.has(slug));
  if (missing.length > 0) {
    throw new Error(`another-way-in: no companion content for ${missing.join(", ")}`);
  }
  const unknown = [...out.keys()].filter((slug) => !allTopics.some((t) => t.slug === slug));
  if (unknown.length > 0) {
    throw new Error(`another-way-in: companion content for unknown topics ${unknown.join(", ")}`);
  }

  return out;
}

const bySlug = build();

/** The section's standing invitation, shown under the title. */
export const COMPANION_PROMPT = "Stuck? Try a different way of seeing this topic.";
export const COMPANION_TITLE = source.section_label;

export function companionFor(slug: string): CompanionTopic | undefined {
  return bySlug.get(slug);
}

export const allCompanionTopics: CompanionTopic[] = [...bySlug.values()];

/** "16:50" — how long the whole video is, not how much of it to watch. */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}
