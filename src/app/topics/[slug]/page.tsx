import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { allTopics, getTopic } from "@/content/spec";
import { questionTemplates, specPointsWithQuestions } from "@/lib/questions";
import { Maths } from "@/components/Maths";
import { PageHeading, PaperBadge, YearBadge } from "@/components/ui";
import { interactiveFor } from "@/components/interactive";

export function generateStaticParams() {
  return allTopics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata(props: PageProps<"/topics/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const topic = getTopic(slug);
  if (!topic) return { title: "Topic not found" };
  return { title: topic.name, description: topic.blurb };
}

export default async function TopicPage(props: PageProps<"/topics/[slug]">) {
  const { slug } = await props.params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  const covered = specPointsWithQuestions();
  const templateCount = questionTemplates.filter((q) => q.topicSlug === topic.slug).length;

  return (
    <div>
      <Link href="/topics" className="mb-6 inline-block text-sm text-muted hover:text-text">
        ← All topics
      </Link>

      <PageHeading eyebrow={`Topic ${topic.number}`} title={topic.name} lead={topic.blurb} />

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <PaperBadge paper={topic.paper} />
        <span className="text-sm text-muted">
          {topic.points.length} spec point{topic.points.length === 1 ? "" : "s"}
        </span>
      </div>

      {templateCount > 0 ? (
        <Link
          href={`/practice/${topic.slug}`}
          className="mb-10 inline-flex items-center rounded-lg bg-accent px-6 py-3 font-semibold text-on-accent hover:bg-accent-hover"
        >
          Practise this topic
        </Link>
      ) : (
        <p className="mb-10 rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm text-muted">
          No practice questions for this topic yet — the bank is being built out starting with Year 1
          Pure. The spec breakdown below is complete and usable for revision now.
        </p>
      )}

      <ol className="space-y-5">
        {topic.points.map((point) => {
          const hasQuestions = covered.has(`${topic.paper}:${point.code}`);
          const interactive = interactiveFor(topic.paper, point.code);
          return (
            <li key={point.code} id={point.code} className="rounded-xl border border-border bg-surface p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded bg-surface-2 px-2 py-0.5 font-mono text-sm font-bold">
                  {point.code}
                </span>
                <h2 className="text-lg font-bold">{point.title}</h2>
                <YearBadge year={point.year} />
                {hasQuestions ? (
                  <span className="rounded-full border border-accent/30 bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                    practisable
                  </span>
                ) : null}
              </div>

              <Maths className="text-[0.97rem] leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0">
                {point.summary}
              </Maths>

              {point.examNote ? (
                <div className="mt-4 rounded-lg border-l-2 border-accent bg-accent-soft/40 py-2 pl-4 pr-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">
                    In the exam
                  </p>
                  <Maths className="text-sm leading-relaxed [&_p]:m-0">{point.examNote}</Maths>
                </div>
              ) : null}

              {interactive ? (
                <div className="mt-5">
                  <p className="mb-1 text-sm font-bold">{interactive.title}</p>
                  <p className="mb-3 text-sm text-muted">{interactive.prompt}</p>
                  <interactive.Component />
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
