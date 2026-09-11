"use client";

import { getSupabaseClient, supabaseConfigured } from "@/lib/supabase/client";
import { resetProgressStoreCache } from "@/lib/progress";

/** Why a sign-in attempt did not result in an email being sent. */
export type SignInFailure = "unavailable" | "rate-limited" | "invalid-email" | "unknown";

export interface SignInResult {
  sent: boolean;
  failure?: SignInFailure;
  message?: string;
}

/**
 * Send a magic link.
 *
 * A new account is created on first use, so there is no separate sign-up step
 * — the student types an email and clicks a link, and that is the whole flow.
 */
export async function sendMagicLink(email: string, next = "/"): Promise<SignInResult> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      sent: false,
      failure: "unavailable",
      message: "Sign-in is not configured on this deployment.",
    };
  }

  const redirect = new URL("/auth/confirm", window.location.origin);
  redirect.searchParams.set("next", next);

  const { error } = await client.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirect.toString() },
  });

  if (!error) return { sent: true };

  // Rate limiting is the failure students will actually hit, and "something
  // went wrong" would leave them clicking the button repeatedly, making it
  // worse. Supabase signals it with 429.
  if (error.status === 429) {
    return {
      sent: false,
      failure: "rate-limited",
      message: "Too many sign-in emails just now. Wait a minute and try again.",
    };
  }

  if (/email/i.test(error.message) && /valid|format/i.test(error.message)) {
    return { sent: false, failure: "invalid-email", message: "That email address does not look right." };
  }

  return { sent: false, failure: "unknown", message: error.message };
}

export async function signOut(): Promise<void> {
  const client = getSupabaseClient();
  if (client) await client.auth.signOut();
  resetProgressStoreCache();
}

/** The signed-in email, or null. */
export async function getCurrentEmail(): Promise<string | null> {
  if (!supabaseConfigured()) return null;
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data.user?.email ?? null;
}
