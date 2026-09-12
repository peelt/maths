import type { Metadata } from "next";
import Link from "next/link";
import { MarkSchemeDrill } from "@/components/MarkSchemeDrill";
import { PageHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Mark scheme drills",
  description:
    "Practise reading a mark scheme: which step earns the method mark, what a dependent mark needs, and what an arithmetic slip actually costs.",
};

export default function DrillsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link href="/exam" className="text-sm text-muted hover:text-text">
          ← The exam
        </Link>
      </div>

      <PageHeading
        eyebrow="Edexcel 9MA0"
        title="Mark scheme drills"
        lead="Around half the marks in this qualification are for method and reasoning rather than the final answer. These drills are about seeing where those marks are."
      />

      <MarkSchemeDrill />
    </div>
  );
}
