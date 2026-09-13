import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Contrast tests for the design tokens.
 *
 * These parse globals.css rather than duplicating the palette, so the
 * stylesheet stays the single source of truth and no test can drift away from
 * what actually ships.
 *
 * The thresholds encode the design brief's evidence, not generic WCAG
 * compliance — in two places they are deliberately stricter or different:
 *
 *  - Canvas versus card has a MINIMUM. WCAG says nothing about it, but the
 *    strongest ADHD-specific finding is that a distinct figure against its
 *    ground reduces errors, and an all-white setting performed worst.
 *
 *  - Body text has a MAXIMUM as well as a minimum. Maximising contrast is the
 *    usual instinct and it is wrong here: near-black on near-white raises
 *    visual stress, so the target is a band around AAA rather than "as high
 *    as possible".
 */

const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

/** Pull one theme's custom properties out of the stylesheet. */
function tokens(selector: string): Record<string, string> {
  // Match the block for this selector, then read every --name: value pair.
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const block = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, "m").exec(css);
  if (!block) throw new Error(`No CSS block found for ${selector}`);
  const out: Record<string, string> = {};
  for (const [, name, value] of block[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    out[name.trim()] = value.trim();
  }
  return out;
}

function luminance(hex: string): number {
  const clean = hex.replace("#", "").trim();
  if (!/^[0-9a-f]{6}$/i.test(clean)) throw new Error(`Not a 6-digit hex colour: "${hex}"`);
  const channels = [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16) / 255);
  const linear = channels.map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Hue angle in degrees, for judging whether two colours read as different. */
function hue(hex: string): number {
  const clean = hex.replace("#", "").trim();
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return 0;
  let h: number;
  if (max === r) h = ((g - b) / delta) % 6;
  else if (max === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  return ((h * 60) % 360 + 360) % 360;
}

/** How saturated a colour is in 0-255 terms: the spread across its channels. */
function chroma(hex: string): number {
  const clean = hex.replace("#", "").trim();
  const channels = [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16));
  return Math.max(...channels) - Math.min(...channels);
}

/** The shorter way round the colour wheel between two hues. */
function hueGap(a: string, b: string): number {
  const d = Math.abs(hue(a) - hue(b));
  return Math.min(d, 360 - d);
}

const THEMES = ["mist", "warm", "dark"] as const;

/** Every token a theme must define. A missing one would fall back silently. */
const REQUIRED = [
  "--bg",
  "--surface",
  "--surface-2",
  "--border",
  "--border-soft",
  "--text",
  "--text-muted",
  "--accent",
  "--accent-fill",
  "--accent-fill-hover",
  "--on-accent",
  "--accent-soft",
  "--accent-border",
  "--correct",
  "--correct-soft",
  "--correct-border",
  "--wrong",
  "--wrong-soft",
  "--wrong-border",
  "--note",
  "--note-soft",
  "--note-border",
  "--plot-a",
  "--plot-b",
  "--plot-c",
];

describe.each(THEMES)("theme: %s", (theme) => {
  const t = tokens(`[data-theme="${theme}"]`);
  const ratio = (a: string, b: string) => contrast(t[a], t[b]);

  it("defines every token", () => {
    const missing = REQUIRED.filter((name) => !t[name]);
    expect(missing, `missing tokens: ${missing.join(", ")}`).toEqual([]);
  });

  it("makes the card visibly distinct from the canvas", () => {
    // The single most supported ADHD-specific finding in the brief. An
    // all-white figure-on-ground is the condition that performed worst.
    expect(ratio("--bg", "--surface")).toBeGreaterThanOrEqual(1.25);
  });

  it("keeps a third layer distinguishable for insets and inputs", () => {
    expect(ratio("--surface", "--surface-2")).toBeGreaterThanOrEqual(1.15);
  });

  it("puts body text past AAA without reaching black on white", () => {
    const onCard = ratio("--text", "--surface");
    expect(onCard).toBeGreaterThanOrEqual(7);
    // The upper bound is the point: maximum contrast is not the goal.
    expect(onCard).toBeLessThanOrEqual(9.5);
  });

  it("keeps body text readable on the canvas too", () => {
    // Text sits directly on the canvas in headings and footers.
    expect(ratio("--text", "--bg")).toBeGreaterThanOrEqual(5);
  });

  it("passes AA for muted text", () => {
    expect(ratio("--text-muted", "--surface")).toBeGreaterThanOrEqual(4.5);
  });

  it("passes AA for muted text on the canvas as well as the card", () => {
    // Muted text sits directly on the canvas in the header, the footer and
    // under headings. The original mist canvas left it at 4.19:1 — below AA —
    // and no test looked, because only the card was being checked.
    expect(ratio("--text-muted", "--bg")).toBeGreaterThanOrEqual(4.5);
  });

  it("gives borders enough contrast to read as a boundary", () => {
    // WCAG 1.4.11 wants 3:1 for meaningful non-text UI; card edges are what
    // separate one task from the next here, so they are meaningful.
    expect(ratio("--border", "--surface")).toBeGreaterThanOrEqual(2.4);
  });

  it("passes AA for the accent as text and as a filled button", () => {
    expect(ratio("--accent", "--surface")).toBeGreaterThanOrEqual(4.5);
    expect(ratio("--on-accent", "--accent-fill")).toBeGreaterThanOrEqual(4.5);
    expect(ratio("--on-accent", "--accent-fill-hover")).toBeGreaterThanOrEqual(4.5);
  });

  it("passes AA for feedback text on its own panel", () => {
    expect(ratio("--correct", "--correct-soft")).toBeGreaterThanOrEqual(4.5);
    expect(ratio("--wrong", "--wrong-soft")).toBeGreaterThanOrEqual(4.5);
    expect(ratio("--note", "--note-soft")).toBeGreaterThanOrEqual(4.5);
  });

  it("passes AA for feedback text on the card, not only on its panel", () => {
    // Feedback colours are used for inline text as well as inside panels.
    expect(ratio("--correct", "--surface")).toBeGreaterThanOrEqual(4.5);
    expect(ratio("--wrong", "--surface")).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps the accent clear of the feedback colours in hue", () => {
    // One directional accent means amber must never read as a status.
    //
    // Contrast ratio is the wrong instrument for this: it measures lightness
    // only, so it called amber and the dark theme's soft red "too close" when
    // they are 39 degrees apart in hue and obviously different on screen.
    // Hue distance is what actually matters here, and lightness separation is
    // covered for legibility by the AA checks above.
    expect(hueGap(t["--accent-fill"], t["--correct"])).toBeGreaterThanOrEqual(30);
    expect(hueGap(t["--accent-fill"], t["--wrong"])).toBeGreaterThanOrEqual(30);
  });

  it("keeps plot series distinguishable from each other", () => {
    // Distinguishable by lightness as well as hue, so the plots survive
    // colour-vision differences rather than relying on hue alone.
    expect(contrast(t["--plot-a"], t["--plot-b"])).toBeGreaterThanOrEqual(1.4);
    expect(hueGap(t["--plot-a"], t["--plot-b"])).toBeGreaterThanOrEqual(60);
    expect(ratio("--plot-a", "--surface")).toBeGreaterThanOrEqual(3);
    expect(ratio("--plot-b", "--surface")).toBeGreaterThanOrEqual(3);
  });
});

describe.each(THEMES)("brand colours: %s", (theme) => {
  const t = tokens(`[data-theme="${theme}"]`);

  it("defines both brand colours", () => {
    // The logo is drawn from tokens rather than its own hex, so a theme that
    // forgets them renders the mark in whatever it inherits — or nothing.
    expect(t["--brand-ink"], "--brand-ink").toBeTruthy();
    expect(t["--brand-accent"], "--brand-accent").toBeTruthy();
  });

  it("keeps the logo readable on the canvas it sits on", () => {
    // The header sits on the canvas. WCAG exempts logotypes from contrast
    // rules, but a logo nobody can see is still a broken logo: the supplied
    // artwork's navy is 1.19:1 against the dark theme, which is what forced
    // these to be per-theme in the first place.
    expect(contrast(t["--brand-ink"], t["--bg"]), "ink on canvas").toBeGreaterThanOrEqual(4.5);
    expect(contrast(t["--brand-accent"], t["--bg"]), "accent on canvas").toBeGreaterThanOrEqual(3);
  });

  it("keeps the two halves of the wordmark distinguishable", () => {
    // "A Level" and "Maths" are different colours; if they converge in any
    // theme the split reads as a rendering fault rather than a design.
    expect(hueGap(t["--brand-ink"], t["--brand-accent"])).toBeGreaterThanOrEqual(30);
  });
});

describe("the default light theme", () => {
  const t = tokens('[data-theme="mist"]');

  it("keeps the canvas near-neutral rather than strongly tinted", () => {
    // The layer separation in point 1 has to come from lightness, not tint.
    // Buying it with saturation instead produced a canvas that was reported
    // as too strong to read text against. "warm" is where a real tint lives.
    expect(chroma(t["--bg"])).toBeLessThanOrEqual(12);
    expect(chroma(t["--surface-2"])).toBeLessThanOrEqual(16);
  });

  it("keeps the canvas light", () => {
    // Stated as contrast against black so the bound is in the same units as
    // everything else here: a canvas this light leaves room for muted text.
    expect(contrast(t["--bg"], "#000000")).toBeGreaterThanOrEqual(15);
  });
});

describe("the palette as a whole", () => {
  it("carries no meaning on a blue versus yellow distinction", () => {
    // ADHD is associated with impaired blue-yellow discrimination, so the
    // three paper badges must no longer be indigo / teal / amber. They are now
    // one neutral style, and the paper is named in words.
    expect(css).not.toMatch(/--pure\s*:/);
    expect(css).not.toMatch(/--statistics\s*:/);
    expect(css).not.toMatch(/--mechanics\s*:/);
  });

  it("offers a light, a tinted and a dark theme", () => {
    for (const theme of THEMES) {
      expect(css).toContain(`[data-theme="${theme}"]`);
    }
  });

  it("still honours the system preference when no choice has been made", () => {
    expect(css).toMatch(/@media \(prefers-color-scheme: dark\)/);
  });

  it("scales every size from the root, so text and spacing grow together", () => {
    expect(css).toMatch(/\[data-text-size="large"\]/);
    expect(css).toMatch(/\[data-text-size="larger"\]/);
    expect(css).toMatch(/body\s*\{[^}]*font-size:\s*1rem/);
  });

  it("keeps the reduced-motion escape hatch", () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });
});
