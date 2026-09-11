import Link from "next/link";
import { TodayPanel } from "@/components/TodayPanel";
import { allTopics, specStats } from "@/content/spec";
import { formulaStats } from "@/content/formulae";
import { questionTemplates, specPointsWithQuestions } from "@/lib/questions";
import { PaperBadge } from "@/components/ui";

export default function HomePage() {
  const covered = specPointsWithQuestions();
  const practisableTopics = allTopics.filter((t) =>
    t.points.some((p) => covered.has(`${t.paper}:${p.code}`)),
  );

  return (
    <div className="space-y-10">
      <TodayPanel />

      <section>
        <h2 className="mb-4 text-lg font-bold">Ready to practise now</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {practisableTopics.map((topic) => {
            const count = questionTemplates.filter((q) => q.topicSlug === topic.slug).length;
            return (
              <Link
                key={topic.slug}
                href={`/practice/${topic.slug}`}
                className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/50 hover:bg-surface-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold group-hover:text-accent">{topic.name}</span>
                  <PaperBadge paper={topic.paper} />
                </div>
                <p className="mt-1.5 text-sm text-muted">
                  {count} question type{count === 1 ? "" : "s"} · {topic.points.length} spec point
                  {topic.points.length === 1 ? "" : "s"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface-2 p-6">
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
          The full specification is mapped and browsable. The question bank is being built out
          topic by topic, starting with Year 1 Pure —{" "}
          <Link href="/topics" className="text-accent underline underline-offset-4">
            every topic page
          </Link>{" "}
          says exactly what is available and what is not yet.
        </p>
      </section>
    </div>
  );
}
