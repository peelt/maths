import { getSupabaseClient, supabaseConfigured } from "@/lib/supabase/client";
import { createLocalStore } from "./local";
import { createSupabaseStore } from "./supabase";
import type { ProgressStore } from "./types";

export * from "./types";
export * from "./streak";
export { createLocalStore } from "./local";
export { createSupabaseStore } from "./supabase";

let cached: Promise<ProgressStore> | null = null;

/**
 * The store the app should use.
 *
 * Supabase when there is a signed-in session; browser storage only when
 * Supabase is not configured at all, which is how development and the
 * end-to-end suite run without secrets.
 *
 * Resolution is cached, so sign-in and sign-out must clear it —
 * `resetProgressStoreCache()` is called from the auth helpers.
 */
export function getProgressStore(): Promise<ProgressStore> {
  cached ??= resolveStore();
  return cached;
}

async function resolveStore(): Promise<ProgressStore> {
  if (!supabaseConfigured()) return createLocalStore();

  const client = getSupabaseClient();
  if (!client) return createLocalStore();

  try {
    const { data } = await client.auth.getUser();
    // No session, or an anonymous one left over from the earlier build — see
    // the note in src/proxy.ts. Neither should write to a real account's rows.
    // The Proxy normally redirects before this is reached, so this is a
    // fallback rather than a route students take.
    if (!data.user || data.user.is_anonymous) return createLocalStore();
    return createSupabaseStore(client, data.user.id);
  } catch (error) {
    // Never let a backend problem interrupt a session in progress.
    console.warn("Supabase unavailable, using local progress:", error);
    return createLocalStore();
  }
}

/** Clear the resolved store. Called on sign-in and sign-out. */
export function resetProgressStoreCache(): void {
  cached = null;
}
