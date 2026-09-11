/**
 * Only ever redirect to a path on this site.
 *
 * The `next` value arrives from the URL and is fed into `emailRedirectTo` and
 * into the post-sign-in redirect, so without this an attacker could craft a
 * link that bounces a freshly signed-in student to another site.
 *
 * Anything not starting with a single "/" is rejected, which covers absolute
 * URLs ("https://evil.com") and protocol-relative ones ("//evil.com").
 *
 * Shared by the sign-in page and the magic link confirm route so there is one
 * definition rather than two that can drift apart.
 */
export function safeRedirectPath(value: string | null | undefined): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}
