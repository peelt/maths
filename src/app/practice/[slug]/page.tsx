import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { allTopics, getTopic } from "@/content/spec";
import { PracticeSession } from "@/components/PracticeSession";

export function generateStaticParams() {
  return allTopics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata(props: PageProps<"/practice/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const topic = getTopic(slug);
  return { title: topic ? `Practise ${topic.name}` : "Practice" };
}

export default async function PracticePage(props: PageProps<"/practice/[slug]">) {
  const { slug } = await props.params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link href={`/topics/${topic.slug}`} className="text-sm text-muted hover:text-text">
          ← {topic.name}
        </Link>
        <Link href="/" className="text-sm text-muted hover:text-text">
          Stop
        </Link>
      </div>

      <PracticeSession topicSlug={topic.slug} topicName={topic.name} />
    </div>
  );
}
