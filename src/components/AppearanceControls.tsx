"use client";

import { useEffect, useState } from "react";
import {
  TEXT_SIZES,
  TEXT_SIZE_KEY,
  TEXT_SIZE_LABELS,
  THEMES,
  THEME_KEY,
  THEME_LABELS,
  applyTextSize,
  applyTheme,
  isTextSize,
  isTheme,
  type TextSize,
  type Theme,
} from "@/lib/appearance";

/**
 * The appearance panel.
 *
 * Plain buttons showing every option at once, rather than a dropdown or a
 * cycling toggle. Both alternatives hide the current state and make you hunt
 * for it, and a cycling button means pressing it three times to get back where
 * you started — which is exactly the kind of small friction this design is
 * meant to remove.
 *
 * Open state uses <details>, so it works before hydration and closes on
 * Escape without any of that being written here.
 */
export function AppearanceControls() {
  const [theme, setTheme] = useState<Theme>("system");
  const [textSize, setTextSize] = useState<TextSize>("normal");

  // Read on mount, not during render: the stored value only exists in the
  // browser, and the pre-paint script has already applied it to the document.
  // This is only catching the React state up with what is on screen.
  useEffect(() => {
    let storedTheme: unknown = null;
    let storedSize: unknown = null;
    try {
      storedTheme = localStorage.getItem(THEME_KEY);
      storedSize = localStorage.getItem(TEXT_SIZE_KEY);
    } catch {
      // Private browsing and blocked site data both throw. The defaults stand.
    }
    /*
     * Reading localStorage during render would be impure and would disagree
     * with the server output, so this catches React state up with what the
     * pre-paint script already applied to the document. The cascading-render
     * rule is knowingly waived: it runs once on mount and feeds no other
     * effect.
     */
    /* eslint-disable react-hooks/set-state-in-effect */
    if (isTheme(storedTheme)) setTheme(storedTheme);
    if (isTextSize(storedSize)) setTextSize(storedSize);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function chooseTheme(next: Theme) {
    setTheme(next);
    applyTheme(next, document.documentElement);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // The choice still applies for this session; it just will not persist.
    }
  }

  function chooseTextSize(next: TextSize) {
    setTextSize(next);
    applyTextSize(next, document.documentElement);
    try {
      localStorage.setItem(TEXT_SIZE_KEY, next);
    } catch {
      // As above.
    }
  }

  return (
    <details className="group relative">
      <summary
        className="inline-flex cursor-pointer list-none items-center gap-1.5 whitespace-nowrap rounded-md border border-border px-2 py-1.5 text-xs text-muted transition-colors marker:content-none hover:bg-surface-2 hover:text-text sm:px-2.5 sm:text-sm"
        aria-label="Display settings"
      >
        <span aria-hidden>◐</span>
        <span className="hidden sm:inline">Display</span>
      </summary>

      {/*
       * hidden/group-open keeps the panel out of the layout while collapsed —
       * an absolutely positioned child of a closed <details> is still laid
       * out, which put a 264px box past the right edge of a 360px screen.
       * The width is capped so it can never exceed a narrow viewport.
       */}
      <div className="absolute right-0 z-50 mt-2 hidden w-[min(16rem,calc(100vw-2rem))] rounded-xl border border-border bg-surface p-4 shadow-lg group-open:block">
        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Colours
          </legend>
          <div className="grid gap-1.5">
            {THEMES.map((option) => {
              const chosen = theme === option;
              return (
                <button
                  key={option}
                  onClick={() => chooseTheme(option)}
                  aria-pressed={chosen}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    chosen
                      ? "border-accent-border bg-accent-soft font-semibold text-accent"
                      : "border-border-soft hover:bg-surface-2"
                  }`}
                >
                  {THEME_LABELS[option].name}
                  <span className="mt-0.5 block text-xs font-normal text-muted">
                    {THEME_LABELS[option].hint}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Text size
          </legend>
          <div className="flex gap-1.5">
            {TEXT_SIZES.map((option) => {
              const chosen = textSize === option;
              return (
                <button
                  key={option}
                  onClick={() => chooseTextSize(option)}
                  aria-pressed={chosen}
                  className={`flex-1 rounded-lg border px-2 py-2 text-sm transition-colors ${
                    chosen
                      ? "border-accent-border bg-accent-soft font-semibold text-accent"
                      : "border-border-soft hover:bg-surface-2"
                  }`}
                >
                  {TEXT_SIZE_LABELS[option]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <p className="mt-3 text-xs leading-relaxed text-muted">
          Saved on this device only. Nothing here is sent anywhere.
        </p>
      </div>
    </details>
  );
}
