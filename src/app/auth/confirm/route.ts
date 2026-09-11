import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Where the magic link lands.
 *
 * This uses the token-hash flow rather than PKCE deliberately. PKCE keeps a
 * code verifier in the browser that requested the link, so the link only works
 * in that same browser — a student who asks for a link on a laptop and opens
 * the email on their phone would get an error. A token hash carries no
 * browser-bound state and works wherever the mail is opened.
 *
 * It requires the Supabase email template to point here:
 *   /auth/confirm?token_hash={{ .TokenHash }}&type=email
 */

/**
 * Only ever redirect to a path on this site.
 *
 * `next` arrives from the URL, so without this an attacker could craft a
 * confirm link that bounces a freshly signed-in student to another site.
 * Rejects anything not starting with a single "/", which covers absolute URLs
 * and protocol-relative "//evil.com".
 */
function safeRedirectPath(value: string | null): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeRedirectPath(searchParams.get("next"));

  const failed = new URL("/signin", request.nextUrl.origin);

  if (!tokenHash || !type) {
    failed.searchParams.set("error", "invalid");
    return NextResponse.redirect(failed);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    failed.searchParams.set("error", "unavailable");
    return NextResponse.redirect(failed);
  }

  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) {
    // Overwhelmingly this means the link has expired or has already been used.
    failed.searchParams.set("error", "expired");
    return NextResponse.redirect(failed);
  }

  return NextResponse.redirect(new URL(next, request.nextUrl.origin));
}
