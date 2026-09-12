import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";
import { APPEARANCE_SCRIPT } from "@/lib/appearance";

export const metadata: Metadata = {
  title: {
    default: "A Level Maths — Edexcel 9MA0",
    template: "%s · A Level Maths",
  },
  description:
    "Spec-mapped revision and practice for Pearson Edexcel A Level Mathematics (9MA0): interactive notes, auto-marked questions with mark scheme breakdowns, and spaced repetition.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#d9e4ec" },
    { media: "(prefers-color-scheme: dark)", color: "#171c22" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className="h-full antialiased">
      <head>
        {/*
         * Applies the saved theme before the first paint. Without it the page
         * renders in the default palette and then swaps, which is a flash of
         * the wrong colours on every navigation — exactly the sort of
         * unnecessary visual event this design removes elsewhere.
         */}
        <script dangerouslySetInnerHTML={{ __html: APPEARANCE_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
