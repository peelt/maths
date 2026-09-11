import type { Metadata } from "next";
import { ProgressView } from "@/components/ProgressView";
import { PageHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Your progress",
  description: "What you have covered, where you are strong, and what is worth going back to.",
};

export default function ProgressPage() {
  return (
    <div>
      <PageHeading
        title="Your progress"
        lead="What you have covered so far, and where the time is best spent next."
      />
      <ProgressView />
    </div>
  );
}
