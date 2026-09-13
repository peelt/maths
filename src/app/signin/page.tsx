import type { Metadata } from "next";
import { SignInForm } from "@/components/SignInForm";
import { PageHeading } from "@/components/ui";
import { safeRedirectPath } from "@/lib/redirect";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to save your progress through A Level Maths.",
};

/**
 * The query parameters are read HERE, on the server, and passed down as props.
 *
 * The obvious alternative — `useSearchParams()` inside the form — forces the
 * form behind a Suspense boundary on a prerendered page, so the server emits
 * only the fallback and the form exists solely after hydration. This page is
 * the gate to the whole site, so a hydration failure there locks everyone out
 * with nothing on screen but a spinner. Reading the params server-side keeps
 * the form in the HTML.
 *
 * The cost is that this page is dynamic rather than static, which is the right
 * trade for a sign-in page.
 */
export default async function SignInPage(props: PageProps<"/signin">) {
  const params = await props.searchParams;

  const nextParam = Array.isArray(params.next) ? params.next[0] : params.next;
  const errorParam = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <div className="mx-auto max-w-md">
      <PageHeading
        eyebrow="Edexcel 9MA0"
        title="Sign in to save your progress"
        lead="So the site remembers what you have done and can pick up where you left off on any device."
      />
      <SignInForm next={safeRedirectPath(nextParam)} linkError={errorParam ?? null} />
    </div>
  );
}
