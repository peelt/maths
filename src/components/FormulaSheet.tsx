"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import { formulae, type Formula, type FormulaSource } from "@/content/formulae";

/**
 * The formula reference, reachable from anywhere with the "f" key.
 *
 * Two reasons this is a global overlay rather than a page. First, stopping to
 * navigate away mid-question is exactly the kind of interruption that ends a
 * study session. Second, the memorise/given split is the genuinely useful part
 * and it wants to be glanceable, not filed away.
 */

function renderLatex(latex: string): string {
  try {
    return katex.renderToString(latex, { throwOnError: false, displayMode: false, strict: false });
  } catch {
    return latex;
  }
}

function FormulaRow({ formula }: { formula: Formula }) {
  const html = useMemo(() => renderLatex(formula.latex), [formula.latex]);
  return (
    <li className="border-b border-border py-3 last:border-b-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-sm font-semibold">{formula.name}</span>
        <span className="text-xs text-muted">{formula.group}</span>
      </div>
      <div className="mt-1.5 overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />
      {formula.note ? <p className="mt-1.5 text-xs leading-relaxed text-muted">{formula.note}</p> : null}
    </li>
  );
}

export function FormulaSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<FormulaSource>("memorise");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return formulae.filter((f) => {
      if (f.source !== source) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.group.toLowerCase().includes(q) ||
        f.keywords.some((k) => k.includes(q))
      );
    });
  }, [query, source]);

  if (!open) return null;

  const counts = {
    memorise: formulae.filter((f) => f.source === "memorise").length,
    booklet: formulae.filter((f) => f.source === "booklet").length,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 p-4 sm:p-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl rise"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Formula reference"
      >
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Formula reference</h2>
            <button
              onClick={onClose}
              className="rounded-md px-2 py-1 text-sm text-muted hover:bg-surface-2"
              aria-label="Close formula reference"
            >
              Esc
            </button>
          </div>

          <div className="mt-3 flex gap-2" role="tablist">
            <button
              role="tab"
              aria-selected={source === "memorise"}
              onClick={() => setSource("memorise")}
              className={`flex-1 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                source === "memorise"
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border text-muted hover:bg-surface-2"
              }`}
            >
              <span className="block font-semibold">Must memorise</span>
              <span className="block text-xs opacity-80">{counts.memorise} not in the booklet</span>
            </button>
            <button
              role="tab"
              aria-selected={source === "booklet"}
              onClick={() => setSource("booklet")}
              className={`flex-1 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                source === "booklet"
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border text-muted hover:bg-surface-2"
              }`}
            >
              <span className="block font-semibold">Given in the exam</span>
              <span className="block text-xs opacity-80">{counts.booklet} in the booklet</span>
            </button>
          </div>

          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search — try 'double angle', 'friction', 'log'"
            className="mt-3 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none placeholder:text-muted"
            aria-label="Search formulae"
          />
        </div>

        <div className="overflow-y-auto p-4">
          {results.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">No formulae match “{query}”.</p>
          ) : (
            <ul>
              {results.map((formula) => (
                <FormulaRow key={formula.id} formula={formula} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
