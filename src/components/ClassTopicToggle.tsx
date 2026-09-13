"use client";

import { useEffect, useState } from "react";
import { getTopic } from "@/content/spec";
import { readCurrentTopic, writeCurrentTopic } from "@/lib/currentTopic";

/**
 * "This is what I'm doing in class."
 *
 * Setting this makes the topic the one the dashboard opens on, so choosing
 * what to practise happens once — when the class moves on — rather than every
 * time the site is opened.
 */
export function ClassTopicToggle({ slug }: { slug: string }) {
  const [current, setCurrent] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readCurrentTopic(
      typeof window === "undefined" ? undefined : window.localStorage,
      (s) => Boolean(getTopic(s)),
    );
    // A stored preference is a client-only value, so the cascading-render rule
    // is knowingly waived here exactly as it is for the practice set.
    /* eslint-disable react-hooks/set-state-in-effect */
    setCurrent(stored);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const isCurrent = current === slug;

  function toggle() {
    const next = isCurrent ? null : slug;
    setCurrent(next);
    writeCurrentTopic(typeof window === "undefined" ? undefined : window.localStorage, next);
  }

  // Rendering nothing until the preference is read avoids a flash of the wrong
  // label, which on this control would say the opposite of the truth.
  if (!ready) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isCurrent}
      className={`inline-flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
        isCurrent
          ? "border-border bg-surface-2 text-text"
          : "border-border-soft text-muted hover:bg-surface-2 hover:text-text"
      }`}
    >
      {isCurrent ? "✓ Covering this in class" : "I'm covering this in class"}
    </button>
  );
}
