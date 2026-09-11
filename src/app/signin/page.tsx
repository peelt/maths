import { Suspense } from "react";
import type { Metadata } from "next";
import { SignInForm } from "@/components/SignInForm";
import { PageHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to save your progress through A Level Maths.",
};

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md">
      <PageHeading
        eyebrow="Edexcel 9MA0"
        title="Sign in to save your progress"
        lead="So the site remembers what you have done, what is due for review, and can pick up where you left off on any device."
      />
      {/* useSearchParams needs a Suspense boundary to keep the page static. */}
      <Suspense fallback={<div className="rounded-xl border border-border bg-surface p-6 text-muted">Loading…</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
