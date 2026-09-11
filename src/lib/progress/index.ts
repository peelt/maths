import { getSupabaseClient, ensureAnonymousUser, supabaseConfigured } from "@/lib/supabase/client";
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
 * Supabase when it is configured and reachable, browser storage otherwise.
 * Resolution is cached so the anonymous sign-in only happens once per load.
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
    const userId = await ensureAnonymousUser(client);
    if (!userId) return createLocalStore();
    return createSupabaseStore(client, userId);
  } catch (error) {
    // Never let a backend problem stop a revision session.
    console.warn("Supabase unavailable, using local progress:", error);
    return createLocalStore();
  }
}

/** Used by tests and by the reset control in settings. */
export function resetProgressStoreCache(): void {
  cached = null;
}
