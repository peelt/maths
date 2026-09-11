import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading, Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "What we store",
  description: "What this site stores about you, and how to delete it.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeading
        title="What we store"
        lead="Short version: your email address and your progress through the course. Nothing else."
      />

      <div className="space-y-4">
        <Card>
          <h2 className="font-bold">What is stored</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            <li>
              <strong className="text-text">Your email address</strong> — used only to send you a
              sign-in link and to recognise you when you come back.
            </li>
            <li>
              <strong className="text-text">Your progress</strong> — which questions you have
              answered, whether you got them right, how long you took, which topics are due for
              review, and your streak.
            </li>
          </ul>
        </Card>

        <Card>
          <h2 className="font-bold">What is not stored</h2>
          <p className="mt-2 text-sm text-muted">
            No password — there is not one. No name, no age, no school, no address. No advertising or
            analytics trackers. Your progress is not shared with anyone, and it is not sold.
          </p>
        </Card>

        <Card>
          <h2 className="font-bold">Who can see it</h2>
          <p className="mt-2 text-sm text-muted">
            You can. The database enforces, at the row level, that your records are readable only by
            your own account — another student signed in on the same site cannot see them.
          </p>
        </Card>

        <Card>
          <h2 className="font-bold">Deleting it</h2>
          <p className="mt-2 text-sm text-muted">
            There is a <strong className="text-text">Delete my data</strong> control in the footer of
            every page. It removes your progress immediately, without asking anyone. You do not have
            to give a reason.
          </p>
        </Card>

        <Card>
          <h2 className="font-bold">If you are under 18</h2>
          <p className="mt-2 text-sm text-muted">
            This is a personal revision tool rather than a school system. If you are under 18, check
            with a parent or guardian before signing up with your email address.
          </p>
        </Card>
      </div>

      <p className="mt-8 text-sm text-muted">
        <Link href="/signin" className="text-accent underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
