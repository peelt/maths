"use client";

import { useState } from "react";
import type { CompanionVideo as Video } from "@/content/another-way-in";
import { formatDuration } from "@/content/another-way-in";

/**
 * One suggested video, which loads nothing until it is asked to.
 *
 * No iframe, no thumbnail, no player script on render — a thumbnail is a
 * request to a third party just as much as the player is, so the card is built
 * entirely from text this repository already has. YouTube hears nothing about
 * a student until they press Load video.
 *
 * The watch link stays put afterwards, because it is the fallback that works
 * when the embed does not: an owner can disable embedded playback, and a valid
 * URL is no promise that the player will run on this site.
 */
export function CompanionVideo({ video, topicName }: { video: Video; topicName: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="mt-5 rounded-lg border border-border bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">Watch someone else explain it</p>

      <p className="mt-2 font-semibold leading-snug">{video.title}</p>
      <p className="text-sm text-muted">
        {video.channel} · {formatDuration(video.durationSeconds)} long
      </p>

      <p className="mt-3 text-sm leading-relaxed">{video.benefit}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{video.scopeNote}</p>

      {loaded ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <iframe
            src={playerUrl(video)}
            title={`${video.title} — ${video.channel} (${topicName})`}
            className="block aspect-video w-full"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        {loaded ? null : (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm font-semibold hover:bg-surface"
          >
            Load video
          </button>
        )}
        <a
          href={video.watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-accent underline underline-offset-4"
        >
          Watch on YouTube
        </a>
      </div>

      {loaded ? (
        <p className="mt-3 text-xs text-muted">
          Playing from YouTube. If it does not play here, the link above always works.
        </p>
      ) : (
        <p className="mt-3 text-xs text-muted">
          Nothing is loaded from YouTube until you press Load video.
        </p>
      )}
    </div>
  );
}

/**
 * The player URL, built from the record rather than accepted from it.
 *
 * `start` and `end` are both absolute positions in the video. `end` in
 * particular is a position and not a length, which is the easy way to cut a
 * clip short by minutes; the source records it as a position and it is passed
 * through as one.
 */
function playerUrl(video: Video): string {
  const url = new URL(video.embedUrl);
  if (video.startSeconds !== null) url.searchParams.set("start", String(video.startSeconds));
  if (video.endSeconds !== null) url.searchParams.set("end", String(video.endSeconds));
  // Explicitly off rather than merely not on: a video that starts talking by
  // itself is the opposite of what a stuck student needs.
  url.searchParams.set("autoplay", "0");
  url.searchParams.set("rel", "0");
  return url.toString();
}
