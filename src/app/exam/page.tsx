import type { Metadata } from "next";
import Link from "next/link";
import { papers, specStats } from "@/content/spec";
import { PageHeading, Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "The exam",
  description: "How Edexcel A Level Mathematics 9MA0 is assessed, and where the marks actually go.",
};

const objectives = [
  {
    code: "AO1",
    name: "Use and apply standard techniques",
    weight: "48–52%",
    detail:
      "Carrying out routine procedures, and recalling facts, terminology and definitions accurately. This is the part most revision focuses on — and it is only about half the paper.",
  },
  {
    code: "AO2",
    name: "Reason, interpret and communicate",
    weight: "23–27%",
    detail:
      "Constructing rigorous arguments and proofs, making deductions, assessing whether an argument is valid, and explaining your reasoning in correct mathematical language. Marks here are won and lost on how you write, not only on what you work out.",
  },
  {
    code: "AO3",
    name: "Solve problems and model",
    weight: "23–27%",
    detail:
      "Translating a real situation into mathematics, interpreting the answer back in context, and recognising the limitations of a model. Almost always the longest questions on the paper.",
  },
];

export default function ExamPage() {
  return (
    <div>
      <PageHeading
        eyebrow="Pearson Edexcel · 9MA0"
        title="How the exam actually works"
        lead="Three papers, two hours each, 100 marks each, and no coursework. Knowing where the marks are is worth as much as knowing the maths."
      />

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold">The papers</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {papers.map((paper) => (
            <Card key={paper.id}>
              <h3 className="font-bold">{paper.label}</h3>
              <p className="mt-2 text-sm text-muted">
                {paper.durationMinutes / 60} hours · {paper.marks} marks ·{" "}
                {paper.weight.toFixed(1)}% of the A Level
              </p>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">
          Pure content can appear on either Paper 1 or Paper 2 — there is no split between them. All
          Pure content is also assumed knowledge for Paper 3, so it can be tested inside a Statistics
          or Mechanics question.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-2 text-xl font-bold">Where the marks go</h2>
        <p className="mb-4 max-w-2xl text-sm text-muted">
          This is the single most useful thing to understand about this qualification: roughly half
          the marks are <strong>not</strong> for executing a technique. They are for reasoning,
          explaining, modelling and interpreting.
        </p>
        <div className="space-y-3">
          {objectives.map((ao) => (
            <Card key={ao.code}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="rounded bg-surface-2 px-2 py-0.5 font-mono text-sm font-bold">
                  {ao.code}
                </span>
                <h3 className="font-bold">{ao.name}</h3>
                <span className="ml-auto text-sm font-semibold tabular-nums text-muted">
                  {ao.weight}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{ao.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-2 text-xl font-bold">Mark scheme codes</h2>
        <p className="mb-4 max-w-2xl text-sm text-muted">
          Every worked solution in here is labelled with the codes examiners actually use, so you can
          see which line earns which mark.
        </p>
        <dl className="space-y-2">
          {[
            ["M1", "Method mark — for a correct method, even if the arithmetic then goes wrong. This is why you write down your working even when you are unsure."],
            ["A1", "Accuracy mark — for the correct answer, and only available if the method mark was earned."],
            ["B1", "Independent mark — for a correct statement or value on its own merit."],
            ["A1ft", "Follow-through — a correct answer based on your own earlier value, even if that value was wrong."],
            ["dM1", "Dependent method mark — only available if the previous method mark was earned."],
          ].map(([code, meaning]) => (
            <div key={code} className="flex gap-3 rounded-lg border border-border bg-surface p-3">
              <dt className="h-fit shrink-0 rounded bg-surface-2 px-2 py-0.5 font-mono text-xs font-bold">
                {code}
              </dt>
              <dd className="text-sm text-muted">{meaning}</dd>
            </div>
          ))}
        </dl>

        <Link
          href="/exam/drills"
          className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-accent/40 bg-accent-soft p-5 transition-colors hover:bg-accent-soft/70"
        >
          <span>
            <span className="block font-bold text-accent">Drill the mark scheme →</span>
            <span className="mt-1 block text-sm text-muted">
              Reading what the codes mean is not the same as spotting which line of your own working
              earns which mark. Six questions, real mark schemes.
            </span>
          </span>
        </Link>
      </section>

      <section className="mb-10">
        <h2 className="mb-2 text-xl font-bold">The large data set</h2>
        <Card>
          <p className="text-sm leading-relaxed">
            Paper 3 assumes familiarity with a large data set, and Pearson states plainly that
            questions are designed so that students who know it have a{" "}
            <strong>material advantage</strong>. Edexcel&rsquo;s is Met Office weather data from
            Camborne, Heathrow, Hurn, Leeming and Leuchars, plus Beijing, Jacksonville and Perth.
          </p>
          <p className="mt-3 text-sm text-muted">
            Worth confirming with his teacher which version his cohort is using before revising from
            it, since the data set has been revised over the life of the specification.
          </p>
        </Card>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-bold">Calculators</h2>
        <Card>
          <p className="text-sm leading-relaxed">
            A calculator is allowed in all three papers, and it must have an iterative function and
            be able to compute summary statistics and probabilities from standard statistical
            distributions. Several Paper 3 questions assume you can get binomial and normal
            probabilities straight from the calculator, so it is worth knowing exactly where those
            functions are on the model he actually owns.
          </p>
        </Card>
      </section>

      <p className="mt-10 text-sm text-muted">
        <Link href="/topics" className="text-accent underline underline-offset-4">
          Browse all {specStats.points} spec points →
        </Link>
      </p>
    </div>
  );
}
