import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { byMostRecent, formatSignInTime, toSignInRecords } from "@/lib/admin";

export const metadata: Metadata = { title: "Sign-in log", robots: { index: false, follow: false } };

/**
 * Sessions are per-request, and this page reads who is calling it.
 */
export const dynamic = "force-dynamic";

/**
 * Who has signed in.
 *
 * The gate is not here. Whether the caller is an admin is decided by the
 * database function, which raises rather than returning an empty list, so any
 * error — not an admin, no admin configured, Supabase unreachable — lands in
 * the same place: a 404. Not a "forbidden" page, because a page that announces
 * itself to everyone who is not allowed in is telling them something they did
 * not need to know.
 */
export default async function AdminPage() {
  const client = await createSupabaseServerClient();
  // In open mode there are no accounts at all, so there is nothing to show and
  // no identity to check against.
  if (!client) notFound();

  const { data, error } = await client.rpc("admin_sign_ins");
  if (error) notFound();

  const records = byMostRecent(toSignInRecords(data));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Sign-in log</h1>
      <p className="mt-2 text-sm text-muted">
        Every account on the site, most recently signed in first.{" "}
        {records.length === 1 ? "One account." : `${records.length} accounts.`}
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Accounts and the last time each signed in</caption>
          <thead>
            <tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-muted">
              <th scope="col" className="px-4 py-3">
                Email
              </th>
              <th scope="col" className="px-4 py-3">
                Last signed in
              </th>
              <th scope="col" className="px-4 py-3">
                First seen
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.email} className="border-b border-border-soft last:border-0">
                <td className="px-4 py-3 font-medium break-all">{record.email}</td>
                <td className="px-4 py-3 tabular-nums text-muted">
                  {formatSignInTime(record.lastSignInAt)}
                </td>
                <td className="px-4 py-3 tabular-nums text-muted">
                  {formatSignInTime(record.firstSeenAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {records.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted">
            No accounts yet. The first sign-in will appear here.
          </p>
        ) : null}
      </div>

      <p className="mt-4 text-xs text-muted">
        Times are UK time. Postgres keeps only the most recent sign-in for each
        account, so this is &ldquo;who, and when last&rdquo; rather than a row per visit.
      </p>
    </div>
  );
}
