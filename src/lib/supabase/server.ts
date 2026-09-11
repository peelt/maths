import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from "./config";

/**
 * A Supabase client for server components and route handlers.
 *
 * A new client is created per request, which the library requires: the cache
 * headers that stop a CDN caching one user's session are only emitted on a
 * client's first cookie write, so a reused client would leave later responses
 * without them.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  if (!supabaseConfigured()) return null;

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // The second argument is a set of RESPONSE HEADERS (Cache-Control and
        // friends) that stop a CDN caching a response carrying auth cookies.
        // They are deliberately not applied here: from this context there is no
        // response object to set them on, and writing them through the cookie
        // store would create cookies literally named "Cache-Control". The Proxy
        // owns token refresh and applies them properly on the response it
        // returns.
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot write cookies. Expected and safe: the
          // Proxy has already refreshed the session for this navigation.
        }
      },
    },
  });
}

/** The signed-in user, or null. Safe to call when Supabase is not configured. */
export async function getServerUser() {
  const client = await createSupabaseServerClient();
  if (!client) return null;
  const { data, error } = await client.auth.getUser();
  if (error) return null;
  return data.user;
}
