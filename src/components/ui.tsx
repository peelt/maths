import Link from "next/link";
import type { ReactNode } from "react";
import type { Paper } from "@/content/spec";

/** Shared presentational pieces, kept in one place so spacing stays consistent. */

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-surface p-5 ${className}`}>{children}</div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
}) {
  return (
    <header className="mb-8">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-2">{eyebrow}</p>
      ) : null}
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">{title}</h1>
      {lead ? <p className="mt-3 text-muted max-w-2xl text-pretty">{lead}</p> : null}
    </header>
  );
}

const paperStyles: Record<Paper, string> = {
  pure: "text-pure border-pure/35 bg-pure/10",
  statistics: "text-statistics border-statistics/35 bg-statistics/10",
  mechanics: "text-mechanics border-mechanics/35 bg-mechanics/10",
};

export function PaperBadge({ paper }: { paper: Paper }) {
  const label = paper === "pure" ? "Papers 1 & 2" : "Paper 3";
  const name = paper[0].toUpperCase() + paper.slice(1);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${paperStyles[paper]}`}>
      {name}
      <span className="opacity-60">·</span>
      <span className="opacity-80">{label}</span>
    </span>
  );
}

export function YearBadge({ year }: { year: 1 | 2 | "both" }) {
  const label = year === "both" ? "Year 1 → 2" : `Year ${year}`;
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted">
      {label}
    </span>
  );
}

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-semibold transition-colors";
  const styles =
    variant === "primary"
      ? "bg-accent text-on-accent hover:bg-accent-hover"
      : "border border-border bg-surface text-text hover:bg-surface-2";
  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}

/** A labelled progress bar. Used for topic mastery. */
export function Meter({ value, label }: { value: number; label?: string }) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
      >
        <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${percent}%` }} />
      </div>
      <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted">{percent}%</span>
    </div>
  );
}
