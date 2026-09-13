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

/**
 * A standalone equation, as its own centred block.
 *
 * Not KaTeX's displayMode, which emits a <div>: these blocks sit inside a <p>,
 * and a div inside a p is invalid HTML that browsers silently hoist out of it.
 * \displaystyle gives the same sizing — full-height fractions, limits above
 * and below — from an inline render, so the markup stays valid.
 *
 * overflow-x here rather than on the paragraph: an equation too wide for a
 * phone scrolls within its own block instead of pushing the whole page
 * sideways. Styles are inline because this is generated HTML, not JSX, so it
 * cannot depend on a class surviving the stylesheet build.
 */
function renderDisplay(latex: string): string {
  const rendered = renderSegment(`\\displaystyle ${latex}`, false);
  return `<span style="display:block;overflow-x:auto;text-align:center;margin:0.7em 0">${rendered}</span>`;
}

/**
 * Split on $$ … $$ and $ … $, rendering maths and escaping everything else.
 *
 * The $$ case is not optional sugar. Without it the single-$ pattern matched
 * the INNER dollars of a $$ … $$ block: it left the outer pair behind as
 * literal "$" characters on the page, and the orphaned closing $ then paired
 * with the opening $ of the next inline equation, typesetting the whole
 * sentence between them as maths — one unbreakable line of italic letters with
 * the spaces stripped, running off the side of a phone. 171 places in the
 * content use $$, and every one of them rendered that way.
 */
export function toHtml(source: string): string {
  let out = "";
  let index = 0;
  // $$ first, so the alternation cannot match a $$ block's inner dollars.
  // Both bodies are lazy, and the inline body excludes $ so an unbalanced
  // delimiter cannot swallow the prose after it.
  const pattern = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    out += escapeHtml(source.slice(index, match.index));
    out += match[1] !== undefined ? renderDisplay(match[1]) : renderSegment(match[2], false);
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
