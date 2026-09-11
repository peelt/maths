import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/redirect";

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
