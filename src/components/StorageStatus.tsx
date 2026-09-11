"use client";

import { useEffect, useState } from "react";
import { getProgressStore } from "@/lib/progress";
import { supabaseConfigured } from "@/lib/supabase/client";

/**
 * Which store progress is actually going to.
 *
 * This exists because the fallback is silent by design: if Supabase is
 * configured but the migration has not been run, or anonymous sign-ins are
 * disabled, the app quietly keeps working on browser storage. That is the right
 * behaviour — a backend problem should never interrupt a revision session — but
 * it is indistinguishable from success unless it is surfaced somewhere.
 */
type Status = "checking" | "local" | "synced" | "fallback";

export function StorageStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const store = await getProgressStore();
      if (cancelled) return;
      if (store.kind === "supabase") setStatus("synced");
      // Configured but not resolved means sign-in or the schema failed.
      else setStatus(supabaseConfigured() ? "fallback" : "local");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking") return null;

  const text = {
    local: "Progress is saved on this device.",
    synced: "Progress is synced to your account.",
    fallback:
      "Progress is saved on this device — the sync backend is configured but unreachable, so check the migration has been run and anonymous sign-ins are enabled.",
  }[status];

  const dot = status === "synced" ? "bg-correct" : status === "fallback" ? "bg-warn" : "bg-muted";

  return (
    <p className="mt-3 flex items-start gap-2">
      <span className={`mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} aria-hidden />
      <span>{text}</span>
    </p>
  );
}
