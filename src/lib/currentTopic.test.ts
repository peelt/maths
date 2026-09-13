import { describe, expect, it } from "vitest";
import { CURRENT_TOPIC_KEY, readCurrentTopic, writeCurrentTopic } from "./currentTopic";
import { getTopic } from "@/content/spec";

const known = (slug: string) => Boolean(getTopic(slug));

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

describe("the current topic", () => {
  it("is unset until the student picks one", () => {
    expect(readCurrentTopic(fakeStorage(), known)).toBeNull();
  });

  it("round-trips a real topic", () => {
    const store = fakeStorage();
    writeCurrentTopic(store, "differentiation");
    expect(readCurrentTopic(store, known)).toBe("differentiation");
  });

  it("can be cleared", () => {
    const store = fakeStorage({ [CURRENT_TOPIC_KEY]: "differentiation" });
    writeCurrentTopic(store, null);
    expect(readCurrentTopic(store, known)).toBeNull();
  });

  it("ignores a topic that does not exist", () => {
    // A renamed topic or an edited localStorage would otherwise send the
    // student to a 404 straight from the front page.
    expect(readCurrentTopic(fakeStorage({ [CURRENT_TOPIC_KEY]: "phlogiston" }), known)).toBeNull();
    expect(readCurrentTopic(fakeStorage({ [CURRENT_TOPIC_KEY]: "" }), known)).toBeNull();
  });

  it("survives storage being absent or throwing", () => {
    const hostile = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    expect(readCurrentTopic(undefined, known)).toBeNull();
    expect(readCurrentTopic(hostile, known)).toBeNull();
    expect(() => writeCurrentTopic(hostile, "differentiation")).not.toThrow();
    expect(() => writeCurrentTopic(undefined, null)).not.toThrow();
  });
});
