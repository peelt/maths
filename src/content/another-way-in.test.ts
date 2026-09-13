import { describe, expect, it } from "vitest";
import katex from "katex";
import source from "./another-way-in.json";
import {
  allCompanionTopics,
  companionFor,
  formatDuration,
  toDollarMaths,
  type CompanionTopic,
} from "./another-way-in";
import { allTopics } from "@/content/spec";
import { toHtml } from "@/components/Maths";

/** Every string a student can read in the companion panel. */
function learnerText(topic: CompanionTopic): { where: string; text: string }[] {
  const out = [{ where: `${topic.slug} intro`, text: topic.intro }];
  for (const tip of topic.tips) {
    out.push({ where: `${tip.id} stuckOn`, text: tip.stuckOn });
    out.push({ where: `${tip.id} title`, text: tip.title });
    out.push({ where: `${tip.id} body`, text: tip.body });
  }
  out.push({ where: `${topic.slug} question`, text: topic.check.question });
  out.push({ where: `${topic.slug} answer`, text: topic.check.answer });
  out.push({ where: `${topic.slug} benefit`, text: topic.video.benefit });
  out.push({ where: `${topic.slug} scopeNote`, text: topic.video.scopeNote });
  return out;
}

describe("another way in: coverage", () => {
  it("gives every topic exactly one companion record", () => {
    for (const topic of allTopics) {
      expect(companionFor(topic.slug), `${topic.slug} has no companion content`).toBeDefined();
    }
    expect(allCompanionTopics).toHaveLength(allTopics.length);
  });

  it("gives every record three tips, a check and a video", () => {
    for (const topic of allCompanionTopics) {
      expect(topic.tips, `${topic.slug} tips`).toHaveLength(3);
      expect(new Set(topic.tips.map((t) => t.id)).size, `${topic.slug} tip ids`).toBe(3);
      expect(new Set(topic.tips.map((t) => t.stuckOn)).size, `${topic.slug} tip labels`).toBe(3);
      expect(topic.check.question.trim().length).toBeGreaterThan(20);
      expect(topic.check.answer.trim().length).toBeGreaterThan(10);
      expect(topic.video.videoId).toMatch(/^[A-Za-z0-9_-]{11}$/);
      expect(topic.video.durationSeconds).toBeGreaterThan(0);
    }
  });

  it("never gives a topic another topic's content", () => {
    // Tip ids are slug-prefixed in the source, so a record wired to the wrong
    // key shows up here rather than as content that merely reads oddly.
    for (const topic of allCompanionTopics) {
      for (const tip of topic.tips) {
        expect(tip.id, `${tip.id} does not belong to ${topic.slug}`).toMatch(
          new RegExp(`^${topic.slug}-tip-\\d+$`),
        );
      }
    }
    const ids = allCompanionTopics.map((t) => t.video.videoId);
    expect(new Set(ids).size, "two topics share a video").toBe(ids.length);
  });
});

describe("another way in: copy fidelity", () => {
  /**
   * The conversion from \( … \) to $ … $ must change the delimiters and
   * nothing else. Comparing the strings would only prove the regex ran; this
   * renders BOTH forms and compares the finished HTML, so a conversion that
   * silently altered the mathematics would fail even though the source text
   * still looked right.
   */
  function renderOriginal(text: string): string {
    let out = "";
    let index = 0;
    const pattern = /\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      out += escape(text.slice(index, match.index));
      const latex = match[1] ?? match[2];
      out += katex.renderToString(match[1] !== undefined ? `\\displaystyle ${latex}` : latex, {
        displayMode: false,
        throwOnError: false,
        errorColor: "var(--wrong)",
        strict: false,
        trust: false,
      });
      index = match.index + match[0].length;
    }
    return out + escape(text.slice(index));
  }

  function escape(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /**
   * Normalise the wrappers the two paths add differently, so the comparison is
   * about the mathematics rather than about paragraph markup: `toHtml` turns a
   * blank line into `</p><p>` where the reference path leaves it as-is.
   */
  function bare(html: string): string {
    return html
      .replace(/<span style="display:block[^"]*">|<\/span>$/g, "")
      .replace(/<\/p><p>/g, "\n\n")
      .replace(/<br \/>/g, "\n");
  }

  it("renders the converted maths exactly as the supplied source would", () => {
    for (const topic of source.topics) {
      const converted = companionFor(topic.slug)!;
      const pairs: [string, string, string][] = [
        [`${topic.slug} intro`, topic.intro_markdown, converted.intro],
        [`${topic.slug} question`, topic.quick_check.question_markdown, converted.check.question],
        [`${topic.slug} answer`, topic.quick_check.answer_markdown, converted.check.answer],
        ...topic.tips.map(
          (tip, i) => [tip.id, tip.body_markdown, converted.tips[i].body] as [string, string, string],
        ),
      ];
      for (const [where, original, dollars] of pairs) {
        expect(bare(toHtml(dollars)), `${where} rendered differently after conversion`).toBe(
          bare(renderOriginal(original)),
        );
      }
    }
  });

  it("leaves no delimiter of either dialect on the page", () => {
    for (const topic of allCompanionTopics) {
      for (const { where, text } of learnerText(topic)) {
        const html = toHtml(text);
        expect(html, `${where} leaks a $`).not.toContain("$");
        expect(html, `${where} leaks a \\(`).not.toContain("\\(");
        expect(html, `${where} leaks a \\[`).not.toContain("\\[");
      }
    }
  });

  it("writes valid LaTeX everywhere", () => {
    for (const topic of allCompanionTopics) {
      for (const { where, text } of learnerText(topic)) {
        for (const segment of text.match(/\$([^$]+)\$/g) ?? []) {
          const latex = segment.slice(1, -1);
          expect(
            () => katex.renderToString(latex, { throwOnError: true }),
            `${where}: $${latex}$`,
          ).not.toThrow();
        }
      }
    }
  });

  it("keeps the scope note on every video", () => {
    // The caveats are the point: several of these are Australian, American,
    // GCSE or Physics lessons, and dropping the note would present them as
    // complete Edexcel coverage.
    for (const topic of allCompanionTopics) {
      expect(topic.video.scopeNote.trim().length, `${topic.slug} scope note`).toBeGreaterThan(20);
      expect(topic.video.benefit.trim().length, `${topic.slug} benefit`).toBeGreaterThan(20);
    }
  });
});

describe("another way in: what reaches a learner", () => {
  it("keeps editorial metadata out of the learner-facing content", () => {
    // The source carries a publication status, evidence levels, review labels
    // and editor notes. They are useful to whoever maintains the pack and
    // meaningless — or alarming — to a student.
    // Specific metadata strings, not generic words: "evidence" is ordinary
    // English and appears legitimately in the hypothesis-testing content.
    const leaks = [
      source.publication_status,
      source.title,
      source.schema_version,
      source.review_date,
      source.math_format,
      "evidence_level",
      "embedding_status",
      "not playback-tested",
      "transcript-excerpt-reviewed",
      "Editor notes",
      "editorial_notes",
    ];
    const rendered = allCompanionTopics
      .flatMap((t) => learnerText(t).map((f) => f.text))
      .join("\n")
      .toLowerCase();
    for (const leak of leaks) {
      expect(rendered, `"${leak}" reached the learner-facing content`).not.toContain(leak.toLowerCase());
    }
  });

  it("only ever points a player at YouTube's privacy-enhanced host", () => {
    for (const topic of allCompanionTopics) {
      const embed = new URL(topic.video.embedUrl);
      const watch = new URL(topic.video.watchUrl);
      expect(embed.protocol).toBe("https:");
      expect(embed.host, `${topic.slug} embed host`).toBe("www.youtube-nocookie.com");
      expect(embed.pathname).toBe(`/embed/${topic.video.videoId}`);
      expect(watch.protocol).toBe("https:");
      expect(watch.host, `${topic.slug} watch host`).toBe("www.youtube.com");
      expect(watch.searchParams.get("v")).toBe(topic.video.videoId);
    }
  });

  it("treats a suggested end as a position in the video, not a length", () => {
    // The one record with an end marks a chapter running from 11:41 to 14:10.
    // Read as a duration it would cut the clip off after 14 seconds, so the
    // invariant worth holding is that an end always sits after its start.
    for (const topic of allCompanionTopics) {
      const { startSeconds, endSeconds, durationSeconds } = topic.video;
      if (endSeconds === null) continue;
      expect(endSeconds, `${topic.slug} end before start`).toBeGreaterThan(startSeconds ?? 0);
      expect(endSeconds, `${topic.slug} end past the video`).toBeLessThanOrEqual(durationSeconds);
    }
  });

  it("keeps every start inside the video", () => {
    for (const topic of allCompanionTopics) {
      if (topic.video.startSeconds === null) continue;
      expect(topic.video.startSeconds).toBeGreaterThanOrEqual(0);
      expect(topic.video.startSeconds, `${topic.slug} starts past the end`).toBeLessThan(
        topic.video.durationSeconds,
      );
    }
  });
});

describe("toDollarMaths", () => {
  it("swaps inline delimiters", () => {
    expect(toDollarMaths("the value \\(x^2\\) here")).toBe("the value $x^2$ here");
  });

  it("swaps display delimiters", () => {
    expect(toDollarMaths("\\[\\int_0^2 x\\,dx\\]")).toBe("$$\\int_0^2 x\\,dx$$");
  });

  it("handles several on one line", () => {
    expect(toDollarMaths("\\(a\\) and \\(b\\)")).toBe("$a$ and $b$");
  });

  it("leaves prose with no maths alone", () => {
    expect(toDollarMaths("no maths at all")).toBe("no maths at all");
  });

  it("does not touch LaTeX commands that merely start with a backslash", () => {
    expect(toDollarMaths("\\(\\left(x\\right)\\)")).toBe("$\\left(x\\right)$");
  });
});

describe("formatDuration", () => {
  it("reads as minutes and seconds", () => {
    expect(formatDuration(477)).toBe("7:57");
    expect(formatDuration(1010)).toBe("16:50");
    expect(formatDuration(60)).toBe("1:00");
    expect(formatDuration(9)).toBe("0:09");
  });
});
