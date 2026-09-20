import Link from "next/link";
import { TodayPanel } from "@/components/TodayPanel";
import { allTopics, specStats } from "@/content/spec";
import { formulaStats } from "@/content/formulae";
import { questionTemplates, specPointsWithQuestions } from "@/lib/questions";
import { HeroFigure } from "@/components/illustration/HeroFigure";
import { PractiseNow, type PractiseCard } from "@/components/PractiseNow";

export default function HomePage() {
  const covered = specPointsWithQuestions();
  // Computed here so the content stays on the server; PractiseNow only
  // decides which of these to show, from what the student has marked.
  const cards: PractiseCard[] = allTopics
    .filter((t) => t.points.some((p) => covered.has(`${t.paper}:${p.code}`)))
    .map((t) => ({
      slug: t.slug,
      name: t.name,
      paper: t.paper,
      questionTypes: questionTemplates.filter((q) => q.topicSlug === t.slug).length,
      specPoints: t.points.length,
    }));

  /*
   * On a phone the hero comes SECOND, so the one primary action is the first
   * thing on screen. Measured: with the hero on top, "Start" landed at 738px
   * on a 640px-tall phone — below the fold, which defeats the whole point of
   * resolving the page to a single button. From sm upwards there is room for
   * both and the hero leads.
   *
   * Reordering visual against DOM order is normally an accessibility problem,
   * but the hero holds no focusable elements, so tab order is unaffected.
   */
  return (
    <div className="flex flex-col gap-10">
      {/*
       * The figure is positioned absolutely, so it adds no height of its own.
       * The text sets the height of the band; the picture fills what is left.
       */}
      <section className="relative isolate order-2 overflow-hidden rounded-2xl border border-border bg-surface sm:order-1">
        <HeroFigure className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[74%] sm:block" />
        <div className="relative max-w-lg px-5 py-5 sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Pearson Edexcel · 9MA0
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-balance sm:mt-2 sm:text-4xl">
            Milo Maths, one short session at a time
          </h1>
          <p className="mt-2 text-pretty text-sm text-muted sm:mt-3 sm:text-base">
            All {specStats.points} spec points, {questionTemplates.length} question types marked as
            you go with the mark scheme shown. Pick whatever you are covering in class.
          </p>
        </div>
        {/*
         * On a phone there is no room beside the text, so the figure becomes a
         * band underneath it instead of a background. Overlapping them was
         * measurably worse: the curve and gridlines ran straight through the
         * heading.
         */}
        <HeroFigure faded={false} className="pointer-events-none block h-24 w-full sm:hidden" />
      </section>

      <div className="order-1 sm:order-2">
        <TodayPanel />
      </div>

      <section className="order-3">
        <h2 className="mb-4 text-lg font-bold">Ready to practise now</h2>
        <PractiseNow cards={cards} />
      </section>

      <section className="order-4 rounded-xl border border-border bg-surface-2 p-6">
        <h2 className="text-lg font-bold">What is in here</h2>
        <dl className="mt-4 grid gap-5 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-muted">Specification</dt>
            <dd className="mt-0.5 text-2xl font-bold tabular-nums">{specStats.points}</dd>
            <dd className="text-sm text-muted">
              spec points across {specStats.topics} topics, mapped from the official 9MA0
              specification
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Formulae</dt>
            <dd className="mt-0.5 text-2xl font-bold tabular-nums">{formulaStats.memorise}</dd>
            <dd className="text-sm text-muted">
              you must memorise, separated from the {formulaStats.booklet} you are given in the exam
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Practice</dt>
            <dd className="mt-0.5 text-2xl font-bold tabular-nums">{covered.size}</dd>
            <dd className="text-sm text-muted">
              spec points with auto-marked questions, each generating fresh numbers every time
            </dd>
          </div>
        </dl>
        <p className="mt-5 border-t border-border pt-4 text-sm text-muted">
          Every spec point has questions and a teaching note, so nothing in the specification is
          invisible to the review schedule.{" "}
          <Link href="/topics" className="text-accent underline underline-offset-4">
            Browse the whole specification
          </Link>{" "}
          to see what each topic actually asks of you.
        </p>
      </section>
    </div>
  );
}
