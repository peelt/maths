import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run against a production build, which is what actually
 * ships. They cover the core loop — land, pick a topic, answer, get marked,
 * see progress recorded — at both phone and desktop widths.
 */
/**
 * Some environments (including CI sandboxes) ship a preinstalled Chromium that
 * does not match the build this Playwright version would download. Point at it
 * explicitly when PLAYWRIGHT_CHROMIUM_PATH is set, rather than downloading a
 * second browser.
 */
const launchOptions = process.env.PLAYWRIGHT_CHROMIUM_PATH
  ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
  : {};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], launchOptions } },
    { name: "mobile", use: { ...devices["Pixel 7"], launchOptions } },
  ],
  webServer: {
    command: "npm run start -- --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
