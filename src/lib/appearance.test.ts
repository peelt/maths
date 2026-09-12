import { describe, expect, it } from "vitest";
import {
  APPEARANCE_SCRIPT,
  THEMES,
  TEXT_SIZES,
  THEME_LABELS,
  TEXT_SIZE_LABELS,
  applyTextSize,
  applyTheme,
  isTextSize,
  isTheme,
} from "@/lib/appearance";

/** A minimal stand-in for the document element. */
function fakeRoot() {
  const attrs = new Map<string, string>();
  return {
    attrs,
    setAttribute: (k: string, v: string) => void attrs.set(k, v),
    removeAttribute: (k: string) => void attrs.delete(k),
  } as unknown as HTMLElement & { attrs: Map<string, string> };
}

describe("appearance preferences", () => {
  it("offers a light, a tinted, a dark and a follow-the-device option", () => {
    expect(THEMES).toEqual(["system", "mist", "warm", "dark"]);
  });

  it("labels every option, so nothing renders as a bare key", () => {
    for (const theme of THEMES) {
      expect(THEME_LABELS[theme]?.name, theme).toBeTruthy();
      expect(THEME_LABELS[theme]?.hint, theme).toBeTruthy();
    }
    for (const size of TEXT_SIZES) expect(TEXT_SIZE_LABELS[size], size).toBeTruthy();
  });

  it("leaves the device in charge for the system option", () => {
    // Resolving "system" to a concrete theme would freeze the page at whatever
    // the device was set to on load, so it must remove the attribute instead.
    const root = fakeRoot();
    applyTheme("dark", root);
    expect(root.attrs.get("data-theme")).toBe("dark");
    applyTheme("system", root);
    expect(root.attrs.has("data-theme")).toBe(false);
  });

  it("writes no attribute for the default text size", () => {
    const root = fakeRoot();
    applyTextSize("larger", root);
    expect(root.attrs.get("data-text-size")).toBe("larger");
    applyTextSize("normal", root);
    expect(root.attrs.has("data-text-size")).toBe(false);
  });

  it("rejects anything that is not a known preference", () => {
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("chartreuse")).toBe(false);
    expect(isTheme(null)).toBe(false);
    expect(isTextSize("large")).toBe(true);
    expect(isTextSize("gigantic")).toBe(false);
  });

  describe("the pre-paint script", () => {
    /** Run the script against a stubbed window, as the browser would. */
    function run(stored: Record<string, string>, throws = false) {
      const attrs = new Map<string, string>();
      const documentElement = {
        setAttribute: (k: string, v: string) => void attrs.set(k, v),
      };
      const localStorage = {
        getItem: (k: string) => {
          if (throws) throw new Error("site data blocked");
          return stored[k] ?? null;
        },
      };
      new Function("document", "localStorage", APPEARANCE_SCRIPT)({ documentElement }, localStorage);
      return attrs;
    }

    it("applies a stored theme and text size", () => {
      const attrs = run({ "appearance.theme": "warm", "appearance.textSize": "larger" });
      expect(attrs.get("data-theme")).toBe("warm");
      expect(attrs.get("data-text-size")).toBe("larger");
    });

    it("sets nothing when the stored value is the default", () => {
      const attrs = run({ "appearance.theme": "system", "appearance.textSize": "normal" });
      expect(attrs.size).toBe(0);
    });

    it("ignores a value that is not a known preference", () => {
      const attrs = run({ "appearance.theme": "'); alert(1); //" });
      expect(attrs.size).toBe(0);
    });

    it("survives localStorage throwing, which private browsing does", () => {
      // If this threw, it would break the page before anything rendered.
      expect(() => run({}, true)).not.toThrow();
    });

    it("stays small enough to inline without cost", () => {
      expect(APPEARANCE_SCRIPT.length).toBeLessThan(600);
    });
  });
});
