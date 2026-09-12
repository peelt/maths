import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/redirect";

/**
 * Where the magic link lands.
 *
 * Supabase can deliver the link in two shapes, and this handles both, because
 * which one arrives depends on a dashboard setting rather than on this code.
 *
 *  1. **Token hash** — `?token_hash=…&type=…`, produced by an email template
 *     pointing here explicitly. Preferred: it carries no browser-bound state,
 *     so the link works wherever the mail is opened. A student can request a
 *     link on a laptop and open it on their phone.
 *
 *  2. **PKCE code** — `?code=…`, produced by Supabase's DEFAULT template. This
 *     only works in the browser that requested the link, because the matching
 *     code verifier is stored there. Supported anyway so sign-in works before
 *     the template is customised — a site whose front door depends on a manual
 *     dashboard step is a site that is broken out of the box.
 *
 * To get cross-device links, set the email template to:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
 */

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"));

  const failWith = (reason: string) => {
    const failed = new URL("/signin", request.nextUrl.origin);
    failed.searchParams.set("error", reason);
    return NextResponse.redirect(failed);
  };

  // Supabase reports its own failures by redirecting here with an error, for
  // example when a link has already been consumed.
  if (searchParams.get("error") || searchParams.get("error_code")) {
    return failWith("expired");
  }

  if (!tokenHash && !code) {
    // Neither shape present. Almost always means the email template points
    // somewhere unexpected, so the sign-in page says so rather than blaming
    // the student for a link they did nothing wrong with.
    return failWith("misconfigured");
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return failWith("unavailable");

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    // Overwhelmingly this means the link has expired or has already been used.
    if (error) return failWith("expired");
    return NextResponse.redirect(new URL(next, request.nextUrl.origin));
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // The usual cause is opening the link in a different browser from the
      // one that requested it — PKCE cannot work across devices.
      return failWith("wrong-device");
    }
    return NextResponse.redirect(new URL(next, request.nextUrl.origin));
  }

  // A token hash without a type.
  return failWith("misconfigured");
}
