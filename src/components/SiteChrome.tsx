"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { FormulaSheet } from "./FormulaSheet";

const NAV = [
  { href: "/", label: "Today" },
  { href: "/topics", label: "Topics" },
  { href: "/exam", label: "The exam" },
];

export function SiteChrome({ children }: { children: ReactNode }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const pathname = usePathname();

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // Ignore the shortcut while an answer is being typed.
      const target = event.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;
      if (typing) return;

      if (event.key === "f" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        setSheetOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="font-bold tracking-tight">
            A Level Maths
            <span className="ml-2 hidden text-xs font-medium text-muted sm:inline">Edexcel 9MA0</span>
          </Link>

          <nav className="flex items-center gap-1" aria-label="Main">
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                    active ? "bg-surface-2 font-semibold text-text" : "text-muted hover:text-text"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => setSheetOpen(true)}
              className="ml-1 inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text"
              aria-haspopup="dialog"
            >
              Formulae
              <kbd className="hidden rounded border border-border bg-surface-2 px-1 text-[10px] font-semibold sm:inline">
                f
              </kbd>
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-6 text-xs leading-relaxed text-muted">
          <p>
            Built for Pearson Edexcel A Level Mathematics <strong>9MA0</strong>, against the Issue 4
            specification. Papers 1 and 2 are Pure; Paper 3 is Statistics and Mechanics. Each paper is
            2 hours, 100 marks, and worth a third of the qualification.
          </p>
          <p className="mt-2">
            This is an independent revision tool and is not affiliated with or endorsed by Pearson.
            Always check the current specification and your teacher&rsquo;s guidance.
          </p>
        </div>
      </footer>

      <FormulaSheet open={sheetOpen} onClose={closeSheet} />
    </>
  );
}
