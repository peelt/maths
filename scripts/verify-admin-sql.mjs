/**
 * Runs the admin migration against a real PostgreSQL and tests the gate.
 *
 * The gate on /admin is a security boundary implemented in SQL, and nothing
 * else in this repository can check it: the unit tests exercise formatting,
 * and the Playwright suite runs with no backend at all, so it can only prove
 * the page 404s when there is nothing to show. That leaves the part that
 * actually matters — a signed-in student cannot read the sign-in log —
 * verified by reading the migration and hoping.
 *
 * So: start a throwaway cluster, stand up just enough of Supabase's auth
 * schema for the migration to run against (auth.users, auth.uid(), and the
 * anon and authenticated roles), apply the migration, and assert who can read
 * what. Every claim in the migration's comments is checked here.
 *
 * Needs initdb and psql on PATH. Skips with a clear message if they are
 * missing, rather than failing and looking like a real problem.
 */
import { execFileSync, spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const MIGRATION = "supabase/migrations/0002_admin_sign_in_log.sql";
const ADMIN = "admin@example.com";
const STUDENT = "student@example.com";

function have(binary) {
  return spawnSync("which", [binary], { stdio: "ignore" }).status === 0;
}

/*
 * Debian and Ubuntu keep the server binaries out of PATH — psql is there but
 * initdb and pg_ctl are under /usr/lib/postgresql/<version>/bin. Add the
 * newest one we can find rather than pinning a version that will age out.
 */
if (!have("initdb")) {
  const versions = existsSync("/usr/lib/postgresql")
    ? readdirSync("/usr/lib/postgresql")
        .map(Number)
        .filter((v) => Number.isFinite(v))
        .sort((a, b) => b - a)
    : [];
  if (versions.length > 0) {
    process.env.PATH = `${process.env.PATH}:/usr/lib/postgresql/${versions[0]}/bin`;
  }
}
if (!have("initdb") || !have("psql")) {
  console.log("initdb or psql not found — skipping the SQL gate check.");
  process.exit(0);
}

const root = mkdtempSync(join(tmpdir(), "admin-sql-"));
const data = join(root, "data");
const socket = join(root, "sock");
mkdirSync(socket, { recursive: true });

/*
 * PostgreSQL refuses to run as root, and CI containers commonly are root. When
 * that is the case, hand the cluster to the postgres system user — the
 * directories have to go with it. psql still runs as whoever we are, which is
 * fine: it connects over the socket with trust auth.
 */
const asRoot = typeof process.getuid === "function" && process.getuid() === 0;
const hasPostgresUser = spawnSync("id", ["postgres"], { stdio: "ignore" }).status === 0;
if (asRoot && !hasPostgresUser) {
  console.log("running as root with no postgres user — skipping the SQL gate check.");
  process.exit(0);
}
if (asRoot) {
  chmodSync(root, 0o777);
  execFileSync("chown", ["-R", "postgres", root]);
}

/** Run a server-side command, as the postgres user when we are root. */
function server(binary, args, options = {}) {
  if (!asRoot) return execFileSync(binary, args, { stdio: "ignore", ...options });
  return execFileSync("runuser", ["-u", "postgres", "--", binary, ...args], {
    stdio: "ignore",
    ...options,
  });
}

let started = false;
function cleanup() {
  if (started) {
    try {
      server("pg_ctl", ["-D", data, "-m", "immediate", "stop"]);
    } catch {
      // Already gone, or never came up. Either way the directory still goes.
    }
  }
  rmSync(root, { recursive: true, force: true });
}
process.on("exit", cleanup);

server("initdb", ["-D", data, "-U", "postgres", "--auth=trust", "-E", "UTF8"]);
// Listen on a unix socket only: no TCP port to collide with anything, and
// nothing reachable from outside this machine.
server("pg_ctl", ["-D", data, "-o", `-k ${socket} -h ''`, "-l", join(root, "log"), "-w", "start"]);
started = true;

/** Run SQL and return stdout, or throw with the server's message. */
function sql(text, { user = "postgres" } = {}) {
  const file = join(root, "q.sql");
  writeFileSync(file, text);
  const result = spawnSync(
    "psql",
    ["-h", socket, "-U", user, "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-q", "-t", "-A", "-f", file],
    { encoding: "utf8" },
  );
  if (result.status !== 0) throw new Error(result.stderr.trim());
  return result.stdout.trim();
}

const checks = [];
function check(what, fn) {
  try {
    fn();
    checks.push({ what, ok: true });
  } catch (error) {
    checks.push({ what, ok: false, why: error.message });
  }
}

/** Assert that running this SQL fails, and that the message looks right. */
function refuses(text, pattern, options) {
  let message = null;
  try {
    sql(text, options);
  } catch (error) {
    message = error.message;
  }
  if (message === null) throw new Error("expected this to be refused, but it succeeded");
  if (!pattern.test(message)) throw new Error(`refused for the wrong reason: ${message}`);
}

// ── Enough of Supabase to run against ───────────────────────────────────────
//
// Only the columns the migration touches. auth.uid() reads a session setting,
// which is how Supabase's own implementation works (it reads the JWT claims
// GoTrue puts there), so switching identity below is a one-line SET.
sql(`
  create role anon nologin;
  create role authenticated nologin;
  grant usage on schema public to anon, authenticated;
  -- Supabase's own bootstrap does exactly this, and it matters: it means every
  -- table and function the migration creates is granted to anon and
  -- authenticated BEFORE the migration's own revokes run. Leaving it out would
  -- make this harness weaker than production and would hide a real gap.
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant all on functions to anon, authenticated;
  alter default privileges in schema public grant all on sequences to anon, authenticated;
  create schema auth;
  create table auth.users (
    id                 uuid primary key default gen_random_uuid(),
    email              text unique,
    email_confirmed_at timestamptz,
    last_sign_in_at    timestamptz,
    created_at         timestamptz not null default now()
  );
  create or replace function auth.uid() returns uuid language sql stable as $fn$
    select nullif(current_setting('test.uid', true), '')::uuid;
  $fn$;
  insert into auth.users (id, email, email_confirmed_at, last_sign_in_at, created_at) values
    ('11111111-1111-1111-1111-111111111111', '${ADMIN}',   now(), now() - interval '1 hour', now() - interval '9 days'),
    ('22222222-2222-2222-2222-222222222222', '${STUDENT}', now(), now() - interval '2 days', now() - interval '5 days'),
    ('33333333-3333-3333-3333-333333333333', 'never@example.com', null, null, now());
`);

sql(readFileSync(MIGRATION, "utf8"));

const asAdmin = `set role authenticated; set test.uid = '11111111-1111-1111-1111-111111111111';`;
const asStudent = `set role authenticated; set test.uid = '22222222-2222-2222-2222-222222222222';`;
const asAnon = `set role anon; set test.uid = '22222222-2222-2222-2222-222222222222';`;

check("the migration applies cleanly", () => {
  if (sql("select count(*) from public.admins;") !== "0") throw new Error("admins should start empty");
});

/** Assert is_admin() under a given identity, reporting what came back. */
function expectAdmin(identity, expected, why) {
  const got = sql(`${identity} select public.is_admin();`);
  if (got !== expected) throw new Error(`${why}: expected ${expected}, got "${got}"`);
}

check("nobody is an admin until a row is added", () => {
  // The migration deliberately ships with the table empty, so the page is
  // closed until the one manual step is done.
  expectAdmin(asAdmin, "f", "an empty admin list should admit nobody");
});

check("a student cannot add themselves to the admin list", () => {
  // Row level security with no policy denies everything. This is the check
  // that matters most: if it fails, the gate is decorative.
  refuses(`${asStudent} insert into public.admins (email) values ('${STUDENT}');`, /policy|denied/i);
});

check("a student cannot read the admin list", () => {
  // They hold SELECT on the table, via Supabase's default privileges above.
  // Row level security with no policy is what makes it return nothing.
  const got = sql(`${asStudent} select count(*) from public.admins;`);
  if (got !== "0") throw new Error(`a student should see no rows, saw ${got}`);
});

// The one manual step, run as the owner — which is what the SQL editor is.
sql(`insert into public.admins (email) values ('${ADMIN}');`);

check("the named admin is recognised", () => {
  expectAdmin(asAdmin, "t", "the admin named in the table should be recognised");
});

check("the admin check is case insensitive", () => {
  // Supabase lowercases emails, but the row is typed by hand in the SQL
  // editor, and "Peel@..." must not silently lock them out.
  sql(`update public.admins set email = upper('${ADMIN}');`);
  expectAdmin(asAdmin, "t", "a differently cased address should still match");
  sql(`update public.admins set email = '${ADMIN}';`);
});

check("a student is not an admin", () => {
  expectAdmin(asStudent, "f", "a student must never be an admin");
});

check("a student is refused the sign-in log, loudly", () => {
  // Loudly matters: an empty result would be indistinguishable from "nobody
  // has signed in", which would hide a broken gate indefinitely.
  refuses(`${asStudent} select * from public.admin_sign_ins();`, /not authorised/i);
});

check("a signed-out caller cannot even execute it", () => {
  refuses(`${asAnon} select * from public.admin_sign_ins();`, /permission denied/i);
});

check("the admin sees every account, newest sign-in first", () => {
  const rows = sql(`${asAdmin} select email from public.admin_sign_ins();`).split("\n");
  const expected = [ADMIN, STUDENT, "never@example.com"];
  if (rows.join(",") !== expected.join(",")) {
    throw new Error(`got ${rows.join(", ")}`);
  }
});

check("an account that never signed in is listed, with no time", () => {
  const row = sql(
    `${asAdmin} select coalesce(last_sign_in_at::text, 'NULL') from public.admin_sign_ins() where email = 'never@example.com';`,
  );
  if (row !== "NULL") throw new Error(`expected no sign-in time, got ${row}`);
});

check("an unconfirmed email is not enough to be an admin", () => {
  // is_admin() requires email_confirmed_at. Belt and braces: with magic link
  // the only way to hold a session is to have received the mail, but the
  // function should not depend on that being the only auth method forever.
  sql(`insert into public.admins (email) values ('never@example.com');`);
  let failure = null;
  try {
    expectAdmin(
      `set role authenticated; set test.uid = '33333333-3333-3333-3333-333333333333';`,
      "f",
      "an unconfirmed address must not be an admin",
    );
  } catch (error) {
    failure = error;
  }
  sql(`delete from public.admins where email = 'never@example.com';`);
  if (failure) throw failure;
});

check("no session means no admin", () => {
  expectAdmin("set role authenticated;", "f", "no session should mean no admin");
});

console.log("\nAdmin SQL gate:\n");
for (const { what, ok, why } of checks) {
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${what}${ok ? "" : `\n          ${why}`}`);
}

const failed = checks.filter((c) => !c.ok).length;
if (failed > 0) {
  console.error(`\n${failed} check${failed === 1 ? "" : "s"} failed.`);
  process.exit(1);
}
console.log("\nAdmin SQL gate verified.");
