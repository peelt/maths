/**
 * Supabase configuration, readable from both client and server.
 *
 * Kept separate from the clients themselves so the Proxy — which runs in the
 * edge runtime and must not pull in browser-only code — can check whether
 * Supabase is configured at all.
 *
 * When it is NOT configured the app runs in open mode on browser storage. That
 * is what lets `npm run dev` work without secrets and lets the end-to-end suite
 * run with no backend. In production Supabase is configured, so sign-in is
 * required.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function supabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** Paths reachable without a session, even when auth is required. */
export const PUBLIC_PATHS = ["/signin", "/auth", "/privacy"];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
