"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { sendMagicLink } from "@/lib/auth";
import { supabaseConfigured } from "@/lib/supabase/client";

/**
 * Magic link sign-in.
 *
 * One field, no password, no separate sign-up. Typing an email and clicking a
 * link is the entire flow — a password is one more thing to forget, and this
 * is a revision site, not a bank.
 */

const LINK_ERRORS: Record<string, string> = {
  expired: "That link has expired or has already been used. Enter your email for a fresh one.",
  invalid: "That link was not valid. Enter your email to get a new one.",
  unavailable: "Sign-in is not available at the moment. Please try again shortly.",
};

export function SignInForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const linkError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(linkError ? (LINK_ERRORS[linkError] ?? LINK_ERRORS.invalid) : null);

  const configured = supabaseConfigured();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim() || status === "sending") return;

    setStatus("sending");
    setError(null);

    const result = await sendMagicLink(email.trim(), next);
    if (result.sent) {
      setStatus("sent");
    } else {
      setStatus("idle");
      setError(result.message ?? "Could not send the link. Try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rise rounded-xl border border-correct-border bg-correct-soft p-6">
        <h2 className="text-lg font-bold text-correct">Check your email</h2>
        <p className="mt-2 text-sm">
          A sign-in link is on its way to <strong>{email}</strong>. It is good for one use.
        </p>
        <p className="mt-3 text-sm text-muted">
          You can open it on any device — phone, laptop, whichever is nearest. If it has not arrived
          in a minute or two, check your spam folder.
        </p>
        <button
          onClick={() => {
            setStatus("idle");
            setEmail("");
          }}
          className="mt-4 text-sm font-medium text-accent underline underline-offset-4"
        >
          Use a different address
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-surface p-6">
      <label htmlFor="email" className="block text-sm font-medium">
        Your email address
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        autoCapitalize="off"
        spellCheck={false}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="mt-1.5 w-full rounded-lg border border-border bg-bg px-4 py-3 outline-none"
      />

      <p className="mt-2 text-sm text-muted">
        We will email you a link. There is no password to create or remember.
      </p>

      {error ? (
        <p role="alert" className="mt-4 rounded-lg border border-wrong-border bg-wrong-soft px-4 py-3 text-sm text-wrong">
          {error}
        </p>
      ) : null}

      {!configured ? (
        <p className="mt-4 rounded-lg border border-warn-border bg-warn-soft px-4 py-3 text-sm text-warn">
          Sign-in is not configured on this deployment, so progress is saved in this browser instead.
          Everything else works normally.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending" || !email.trim()}
        className="mt-5 w-full rounded-lg bg-accent px-5 py-3 font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-40"
      >
        {status === "sending" ? "Sending…" : "Email me a link"}
      </button>

      <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted">
        We store your email address and your progress through the course — nothing else. We do not
        share it with anyone, and you can delete it at any time from the footer.{" "}
        <Link href="/privacy" className="text-accent underline underline-offset-2">
          What we store
        </Link>
      </p>
    </form>
  );
}
