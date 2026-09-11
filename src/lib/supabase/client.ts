"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase is optional.
 *
 * With no environment variables configured the app falls back to browser
 * storage, so the site is fully usable before any backend exists. That keeps
 * local development and end-to-end tests free of network dependencies, and
 * means deployment is a configuration step rather than a rewrite.
 */
export function supabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

let cached: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseConfigured()) return null;
  cached ??= createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return cached;
}

/**
 * Get a user without ever showing a sign-in screen.
 *
 * Anonymous sign-in creates a real auth identity in the background, which is
 * what makes row level security meaningful — without it every row would have
 * to be world-readable. The student simply opens the site and starts working.
 */
export async function ensureAnonymousUser(client: SupabaseClient): Promise<string | null> {
  const { data: existing } = await client.auth.getUser();
  if (existing.user) return existing.user.id;

  const { data, error } = await client.auth.signInAnonymously();
  if (error) {
    // Anonymous sign-in is disabled or unreachable — fall back to local
    // storage rather than blocking the student from working.
    console.warn("Anonymous sign-in unavailable, using local progress:", error.message);
    return null;
  }
  return data.user?.id ?? null;
}
