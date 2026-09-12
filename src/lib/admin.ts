/**
 * The admin sign-in log.
 *
 * Who is an admin is decided entirely in the database — see
 * supabase/migrations/0002_admin_sign_in_log.sql. Nothing here is a security
 * boundary: this module shapes and formats what the database agrees to return,
 * and if the caller is not an admin it returns nothing to shape.
 */

export interface SignInRecord {
  email: string;
  /** Null for an account that was created but never completed a sign-in. */
  lastSignInAt: string | null;
  firstSeenAt: string;
}

/** The shape the database function returns, before it is tidied. */
interface Row {
  email?: unknown;
  last_sign_in_at?: unknown;
  first_seen_at?: unknown;
}

/**
 * Times are shown in UK time, explicitly.
 *
 * Vercel runs in UTC, so formatting in the server's zone would quietly report
 * every summer sign-in an hour early — the kind of wrong that looks right.
 */
const UK = "Europe/London";

export function formatSignInTime(iso: string | null): string {
  if (!iso) return "Never signed in";
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: UK,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(at);
}

/** Normalise what came back, dropping anything without a usable email. */
export function toSignInRecords(rows: unknown): SignInRecord[] {
  if (!Array.isArray(rows)) return [];
  const records: SignInRecord[] = [];
  for (const row of rows as Row[]) {
    if (typeof row?.email !== "string" || row.email === "") continue;
    records.push({
      email: row.email,
      lastSignInAt: typeof row.last_sign_in_at === "string" ? row.last_sign_in_at : null,
      firstSeenAt: typeof row.first_seen_at === "string" ? row.first_seen_at : "",
    });
  }
  return records;
}

/**
 * Most recent sign-in first, and accounts that never signed in last.
 *
 * The database orders it this way too. Doing it again here means the page does
 * not depend on that, and it is the ordering the page is actually tested for.
 */
export function byMostRecent(records: SignInRecord[]): SignInRecord[] {
  return [...records].sort((a, b) => {
    if (a.lastSignInAt === b.lastSignInAt) return a.email.localeCompare(b.email);
    if (!a.lastSignInAt) return 1;
    if (!b.lastSignInAt) return -1;
    return b.lastSignInAt.localeCompare(a.lastSignInAt);
  });
}
