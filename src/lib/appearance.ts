/**
 * Appearance preferences.
 *
 * Offering light, tinted and dark modes plus adjustable text is the strongest
 * single recommendation in neurodiversity design guidance, because sensory
 * preference varies widely between people — what is restful for one reader is
 * glaring or muddy for another. So this is a choice, not a default we picked.
 *
 * The preference lives in localStorage rather than on the server: it must
 * apply before the first paint, and it is a per-device comfort setting rather
 * than part of the account.
 */

export const THEMES = ["system", "mist", "warm", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export const TEXT_SIZES = ["normal", "large", "larger"] as const;
export type TextSize = (typeof TEXT_SIZES)[number];

export const THEME_KEY = "appearance.theme";
export const TEXT_SIZE_KEY = "appearance.textSize";

export const THEME_LABELS: Record<Theme, { name: string; hint: string }> = {
  system: { name: "System", hint: "Follow the device setting" },
  mist: { name: "Mist", hint: "Light, cool tint" },
  warm: { name: "Warm", hint: "Light, cream tint" },
  dark: { name: "Dark", hint: "Low light" },
};

export const TEXT_SIZE_LABELS: Record<TextSize, string> = {
  normal: "Normal",
  large: "Large",
  larger: "Larger",
};

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}

export function isTextSize(value: unknown): value is TextSize {
  return typeof value === "string" && (TEXT_SIZES as readonly string[]).includes(value);
}

/**
 * Apply a preference to the document.
 *
 * "system" removes the attribute entirely rather than resolving it to a
 * concrete theme, so the CSS `prefers-color-scheme` query stays in charge and
 * the page follows the device live — including when the device switches at
 * dusk while the tab is open.
 */
export function applyTheme(theme: Theme, root: HTMLElement): void {
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

export function applyTextSize(size: TextSize, root: HTMLElement): void {
  if (size === "normal") root.removeAttribute("data-text-size");
  else root.setAttribute("data-text-size", size);
}

/**
 * Script that runs before the first paint.
 *
 * Without this the page renders in the default theme and then swaps, which is
 * a flash of the wrong colours on every single navigation — precisely the kind
 * of unnecessary visual event this design is trying to remove. It is inlined
 * into the document head, so it must stay small and must never throw: private
 * browsing and blocked site data both make localStorage throw on access.
 */
export const APPEARANCE_SCRIPT = `
(function(){try{
var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});
if(t&&t!=="system"&&${JSON.stringify(THEMES)}.indexOf(t)>-1)document.documentElement.setAttribute("data-theme",t);
var s=localStorage.getItem(${JSON.stringify(TEXT_SIZE_KEY)});
if(s&&s!=="normal"&&${JSON.stringify(TEXT_SIZES)}.indexOf(s)>-1)document.documentElement.setAttribute("data-text-size",s);
}catch(e){}})();
`.trim();
