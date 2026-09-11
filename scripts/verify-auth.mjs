/**
 * Verifies route protection with Supabase configured.
 *
 * This cannot live in the normal Playwright suite. NEXT_PUBLIC_* values are
 * inlined at build time, so that suite's unconfigured build can never exercise
 * the signed-out-and-redirected path. That path only exists once Supabase is
 * configured, which makes it the easiest thing here to break without noticing.
 *
 * So: build with deliberately fake Supabase credentials into a separate output
 * directory, start the server, and check that protected routes redirect while
 * public ones do not. The credentials are unreachable on purpose — a failed
 * session lookup must DENY access, not grant it.
 */
import { spawn, spawnSync } from "node:child_process";
import { rmSync } from "node:fs";

const PORT = 3999;
const DIST = ".next-auth-check";

const env = {
  ...process.env,
  NEXT_DIST_DIR: DIST,
  NEXT_PUBLIC_SUPABASE_URL: "https://fake-project.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.fake",
};

const CHECKS = [
  { path: "/signin", status: 200, why: "sign-in must be reachable when signed out" },
  { path: "/privacy", status: 200, why: "privacy must be reachable when signed out" },
  { path: "/", status: 307, redirectsTo: "/signin", why: "the dashboard must be protected" },
  { path: "/topics", status: 307, redirectsTo: "/signin", why: "topics must be protected" },
  { path: "/progress", status: 307, redirectsTo: "/signin", why: "progress must be protected" },
];

function run(command, args) {
  const result = spawnSync(command, args, { env, stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`\n${command} ${args.join(" ")} failed`);
    process.exit(1);
  }
}

async function waitForServer(url, attempts = 60) {
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status > 0) return;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Server did not start at ${url}`);
}

rmSync(DIST, { recursive: true, force: true });
console.log("Building with Supabase configured…\n");
run("npx", ["next", "build"]);

const server = spawn("npx", ["next", "start", "--port", String(PORT)], { env, stdio: "ignore" });
let failures = 0;

try {
  await waitForServer(`http://127.0.0.1:${PORT}/signin`);
  console.log("\nChecking route protection:\n");

  for (const check of CHECKS) {
    const response = await fetch(`http://127.0.0.1:${PORT}${check.path}`, { redirect: "manual" });
    const location = response.headers.get("location") ?? "";
    const statusOk = response.status === check.status;
    const redirectOk = !check.redirectsTo || location.includes(check.redirectsTo);

    if (statusOk && redirectOk) {
      console.log(`  ok    ${check.path} -> ${response.status}${location ? ` ${location}` : ""}`);
    } else {
      failures++;
      console.error(
        `  FAIL  ${check.path} -> ${response.status}${location ? ` ${location}` : ""} ` +
          `(expected ${check.status}${check.redirectsTo ? ` -> ${check.redirectsTo}` : ""}) — ${check.why}`,
      );
    }
  }
} finally {
  server.kill("SIGKILL");
  rmSync(DIST, { recursive: true, force: true });
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed: route protection is not working.`);
  process.exit(1);
}
console.log("\nRoute protection verified.");
