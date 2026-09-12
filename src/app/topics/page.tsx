import Link from "next/link";
import type { Metadata } from "next";
import { allTopics, paperLabels, specStats, type Paper } from "@/content/spec";
import { specPointsWithQuestions } from "@/lib/questions";
import { PageHeading } from "@/components/ui";
import { TopicIllustration } from "@/components/illustration/topics";

export const metadata: Metadata = {
  title: "Topics",
  description: "Every topic and spec point in Edexcel A Level Mathematics 9MA0.",
};

const order: Paper[] = ["pure", "statistics", "mechanics"];

const paperIntro: Record<Paper, string> = {
  pure: "Examined on Papers 1 and 2, two hours and 100 marks each. Any Pure topic can appear on either paper.",
  statistics: "Section A of Paper 3. All Pure content is assumed knowledge here and may be tested within these questions.",
  mechanics: "Section B of Paper 3. Leans heavily on calculus and vectors from the Pure content.",
};

export default function TopicsPage() {
  const covered = specPointsWithQuestions();

  return (
    <div>
      <PageHeading
        eyebrow="Edexcel 9MA0"
        title="The whole specification"
        lead={`All ${specStats.topics} topics and ${specStats.points} spec points, in specification order. Each one says what the exam actually asks of you.`}
      />

      <div className="space-y-10">
        {order.map((paper) => {
          const topics = allTopics.filter((t) => t.paper === paper);
          return (
            <section key={paper}>
              <h2 className="text-xl font-bold">{paperLabels[paper]}</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted">{paperIntro[paper]}</p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {topics.map((topic) => {
                  const practisable = topic.points.filter((p) => covered.has(`${paper}:${p.code}`)).length;
                  return (
                    <li key={topic.slug}>
                      <Link
                        href={`/topics/${topic.slug}`}
                        className="group block h-full rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/50 hover:bg-surface-2"
                      >
                        <div className="flex items-start gap-3">
                          <TopicIllustration
                            slug={topic.slug}
                            className="mt-0.5 h-10 w-[3.6rem] shrink-0 opacity-80 transition-opacity group-hover:opacity-100"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="font-mono text-xs text-muted">{topic.number}</span>
                              <span className="font-semibold group-hover:text-accent">{topic.name}</span>
                            </div>
                            <p className="mt-1.5 text-sm text-muted">{topic.blurb}</p>
                            <p className="mt-3 text-xs text-muted">
                              {topic.points.length} spec point{topic.points.length === 1 ? "" : "s"}
                              {/*
                               * Neutral, not amber: this is a count, not an
                               * action. Every topic is practisable now, so it
                               * is close to redundant, but it still differs
                               * per topic so it is kept.
                               */}
                              <span className="ml-2 rounded-full border border-border-soft bg-surface-2 px-2 py-0.5 font-medium text-muted">
                                {practisable} practisable
                              </span>
                            </p>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
