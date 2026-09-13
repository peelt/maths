import { Maths } from "./Maths";
import type { TeachingNote } from "@/content/notes/types";

/**
 * The inside of a teaching note: the idea, the method, and what to watch for.
 *
 * Shared between the topic page and a practice session. A student who is stuck
 * mid-question needs the same explanation as one browsing the topic, and two
 * copies of this markup would drift the moment either was touched.
 */
export function TeachingNoteBody({ note }: { note: TeachingNote }) {
  return (
    <>
      <Maths className="text-[0.95rem] leading-relaxed [&_p]:m-0">{note.idea}</Maths>

      <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-muted">Method</p>
      <ol className="space-y-2">
        {note.method.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-0.5 h-fit shrink-0 rounded bg-surface px-1.5 py-0.5 font-mono text-xs font-bold tabular-nums">
              {i + 1}
            </span>
            <Maths className="min-w-0 flex-1 text-sm leading-relaxed [&_p]:m-0">{step}</Maths>
          </li>
        ))}
      </ol>

      <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-wrong">
        Watch for
      </p>
      <ul className="space-y-2">
        {note.watchFor.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span aria-hidden className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-wrong" />
            <Maths className="min-w-0 flex-1 text-sm leading-relaxed [&_p]:m-0">{item}</Maths>
          </li>
        ))}
      </ul>
    </>
  );
}
