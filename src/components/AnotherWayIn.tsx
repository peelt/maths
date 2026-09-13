import { Maths } from "@/components/Maths";
import { CompanionVideo } from "@/components/CompanionVideo";
import { COMPANION_PROMPT, COMPANION_TITLE, type CompanionTopic } from "@/content/another-way-in";

/**
 * The "Another way in" panel on a topic page.
 *
 * Everything here is a plain <details>, the same disclosure the teaching notes
 * use: it works before hydration, it is keyboard accessible and announces its
 * own expanded state without any of that being written by hand, and it costs
 * no JavaScript. Only the video card is a client component, because loading a
 * player on request is the one thing on the page that genuinely needs state.
 *
 * Collapsed by default and deliberately outside the numbered spec list. A
 * student who is getting on fine should be able to ignore it completely; a
 * student who is stuck should be able to find it without reading past it.
 */
export function AnotherWayIn({ topic, topicName }: { topic: CompanionTopic; topicName: string }) {
  return (
    <details className="group mb-10 rounded-xl border border-border bg-surface-2">
      <summary className="cursor-pointer list-none px-5 py-4 marker:content-none">
        <span className="font-semibold text-accent">
          {COMPANION_TITLE}
          <span className="group-open:hidden"> ▸</span>
          <span className="hidden group-open:inline"> ▾</span>
        </span>
        <span className="mt-0.5 block text-sm text-muted">{COMPANION_PROMPT}</span>
      </summary>

      <div className="border-t border-border px-5 py-5">
        <Maths className="text-[0.97rem] leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0">
          {topic.intro}
        </Maths>

        <div className="mt-5 space-y-2">
          {topic.tips.map((tip) => (
            /*
             * The visible label is the student's difficulty, not the title of
             * the answer. Someone scanning for their own problem recognises
             * "I forget the extra factor in the chain rule" in a way they
             * never recognise "Think of the chain rule as two connected
             * gears" — and the point of this panel is being findable when
             * stuck. The title is worth reading once you are already in.
             */
            <details key={tip.id} id={tip.id} className="group/tip rounded-lg border border-border bg-surface">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium marker:content-none">
                <span className="text-accent">
                  <span className="group-open/tip:hidden">▸ </span>
                  <span className="hidden group-open/tip:inline">▾ </span>
                </span>
                {tip.stuckOn}
              </summary>
              <div className="border-t border-border px-4 py-3">
                <p className="mb-2 text-sm font-bold">{tip.title}</p>
                <Maths className="text-sm leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0">{tip.body}</Maths>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-5 rounded-lg border-l-2 border-note-border bg-note-soft py-3 pl-4 pr-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-note">Try it</p>
          <Maths className="text-sm leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0">
            {topic.check.question}
          </Maths>
          {/*
           * Nothing to submit and nothing recorded. This is a prompt to think
           * for ten seconds before reading on, so it must not look like a
           * question that is marking you — answering it changes no progress,
           * no mastery and no review date.
           */}
          <details className="group/check mt-3">
            <summary className="cursor-pointer list-none text-sm font-medium text-accent underline underline-offset-4 marker:content-none">
              <span className="group-open/check:hidden">Reveal explanation</span>
              <span className="hidden group-open/check:inline">Hide explanation</span>
            </summary>
            <Maths className="mt-2 text-sm leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0">
              {topic.check.answer}
            </Maths>
          </details>
        </div>

        <CompanionVideo video={topic.video} topicName={topicName} />
      </div>
    </details>
  );
}
