import katex from "katex";

/**
 * Renders prose containing inline maths between $ … $ delimiters.
 *
 * Rendering happens on the server, so equations arrive as finished markup and
 * do not reflow after hydration — worth doing, because text that jumps around
 * as the page settles is exactly the kind of distraction this site is trying
 * to avoid.
 *
 * The input is always repository-authored content (spec summaries, question
 * prompts, worked solutions), never anything a student has typed. Student
 * input is echoed as plain text elsewhere and must never be routed here.
 */

interface Props {
  children: string;
  className?: string;
  /** Render as a block, for standalone equations. */
  display?: boolean;
}

function renderSegment(latex: string, display: boolean): string {
  try {
    return katex.renderToString(latex, {
      displayMode: display,
      throwOnError: false,
      // Shown in place of a broken equation rather than crashing the page.
      errorColor: "var(--wrong)",
      strict: false,
      trust: false,
    });
  } catch {
    return escapeHtml(latex);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Split on $ … $, rendering maths and escaping everything else. */
function toHtml(source: string): string {
  let out = "";
  let index = 0;
  const pattern = /\$([^$]+)\$/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    out += escapeHtml(source.slice(index, match.index));
    out += renderSegment(match[1], false);
    index = match.index + match[0].length;
  }
  out += escapeHtml(source.slice(index));

  // Blank lines become paragraph breaks; single newlines become line breaks.
  return out.replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br />");
}

export function Maths({ children, className, display = false }: Props) {
  if (display) {
    return (
      <div
        className={className}
        // Content is authored in this repository, never user input.
        dangerouslySetInnerHTML={{ __html: renderSegment(children, true) }}
      />
    );
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: `<p>${toHtml(children)}</p>` }}
    />
  );
}

/** Inline variant for a short fragment inside a sentence. */
export function InlineMaths({ children, className }: { children: string; className?: string }) {
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: renderSegment(children, false) }}
    />
  );
}
