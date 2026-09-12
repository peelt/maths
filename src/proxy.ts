import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isPublicPath, supabaseConfigured } from "@/lib/supabase/config";

/**
 * Proxy — what Next.js called Middleware before version 16.
 *
 * Two jobs:
 *
 *  1. Refresh the auth token. Server Components cannot write cookies, so
 *     something has to run before them to keep the session current.
 *  2. Send signed-out visitors to the sign-in page.
 *
 * When Supabase is not configured the app runs open, on browser storage. That
 * is what allows `npm run dev` and the end-to-end suite to run without secrets.
 * In production Supabase is configured, so sign-in is required.
 */
export async function proxy(request: NextRequest) {
  if (!supabaseConfigured()) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // Write to the request so anything later in this pass sees the fresh
        // token, then rebuild the response and write them there for the browser.
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // Without these a CDN could cache a response carrying auth cookies and
        // serve one student's session to another.
        for (const [key, value] of Object.entries(headers)) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // Verifies and refreshes the session. Must be called before any redirect
  // decision, or the refreshed cookies are never written.
  const { data } = await supabase.auth.getClaims();

  // An ANONYMOUS session does not count as signed in.
  //
  // An earlier version of this app created anonymous Supabase users silently on
  // page load. Those sessions are still valid JWTs, so without this check a
  // browser holding one would sail past the sign-in page it is now supposed to
  // meet. The same applies to any anonymous session created while that setting
  // remains enabled in the Supabase project.
  const claims = data?.claims;
  const signedIn = Boolean(claims) && claims?.is_anonymous !== true;

  const { pathname } = request.nextUrl;
  if (!signedIn && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    // Send them where they were heading once they are signed in.
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Everything except static assets and image files. Auth and sign-in paths are
  // matched but allowed through by isPublicPath, so their sessions still refresh.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
