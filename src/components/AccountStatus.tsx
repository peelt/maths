"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentEmail, signOut } from "@/lib/auth";
import { getProgressStore, resetProgressStoreCache } from "@/lib/progress";
import { supabaseConfigured } from "@/lib/supabase/client";

/**
 * Who is signed in, and the controls for leaving.
 *
 * Also surfaces where progress is being saved. The fallback to browser storage
 * is silent by design — a backend problem should never interrupt a revision
 * session — but silence is indistinguishable from success, so it is said out
 * loud here.
 */
type State =
  | { kind: "checking" }
  | { kind: "signed-in"; email: string }
  | { kind: "local" }
  | { kind: "signed-out" };

export function AccountStatus() {
  const [state, setState] = useState<State>({ kind: "checking" });
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!supabaseConfigured()) {
        if (!cancelled) setState({ kind: "local" });
        return;
      }
      const email = await getCurrentEmail();
      if (cancelled) return;
      setState(email ? { kind: "signed-in", email } : { kind: "signed-out" });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onDelete() {
    const store = await getProgressStore();
    await store.clear();
    resetProgressStoreCache();
    setConfirmingDelete(false);
    setDeleted(true);
  }

  if (state.kind === "checking") return null;

  if (state.kind === "local") {
    return (
      <p className="mt-3 flex items-start gap-2">
        <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-muted" aria-hidden />
        <span>Progress is saved in this browser. Sign-in is not configured on this deployment.</span>
      </p>
    );
  }

  if (state.kind === "signed-out") {
    return (
      <p className="mt-3 flex items-start gap-2">
        <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-note" aria-hidden />
        <span>
          Not signed in.{" "}
          <Link href="/signin" className="text-accent underline underline-offset-2">
            Sign in to save your progress
          </Link>
          .
        </span>
      </p>
    );
  }

  return (
    <div className="mt-3">
      <p className="flex items-start gap-2">
        <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-correct" aria-hidden />
        <span>
          Signed in as <strong>{state.email}</strong>. Progress is saved to your account.
        </span>
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 pl-[0.9rem]">
        <button onClick={() => void signOut().then(() => window.location.reload())} className="underline underline-offset-2 hover:text-text">
          Sign out
        </button>

        {deleted ? (
          <span className="text-correct">Your progress has been deleted.</span>
        ) : confirmingDelete ? (
          <span className="flex items-center gap-3">
            <span className="text-wrong">Delete all your progress?</span>
            <button onClick={() => void onDelete()} className="font-semibold text-wrong underline underline-offset-2">
              Yes, delete it
            </button>
            <button onClick={() => setConfirmingDelete(false)} className="underline underline-offset-2 hover:text-text">
              Cancel
            </button>
          </span>
        ) : (
          <button onClick={() => setConfirmingDelete(true)} className="underline underline-offset-2 hover:text-text">
            Delete my data
          </button>
        )}

        <Link href="/privacy" className="underline underline-offset-2 hover:text-text">
          What we store
        </Link>
      </div>
    </div>
  );
}
