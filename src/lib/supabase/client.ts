"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from "./config";

export { supabaseConfigured };

let cached: SupabaseClient | null = null;

/**
 * The browser Supabase client, or null when Supabase is not configured.
 *
 * Sessions are stored in cookies rather than local storage — that is the whole
 * point of @supabase/ssr, and it is what lets the Proxy and Server Components
 * read the same session the browser wrote.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseConfigured()) return null;
  cached ??= createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  return cached;
}
