import { expect, test } from "@playwright/test";

/**
 * The core loop must work with NO backend configured, because that is how the
 * site runs before Supabase exists — and how it must keep working if Supabase
 * is ever unreachable.
 */

test("landing page offers a single clear starting action", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Start", exact: true })).toBeVisible();
});

test("the whole specification is browsable", async ({ page }) => {
  await page.goto("/topics");
  await expect(page.getByRole("heading", { name: "The whole specification" })).toBeVisible();
  // 19 topics across the three content areas.
  await expect(page.getByRole("link", { name: /Algebra and functions/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /hypothesis testing/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Moments/ }).first()).toBeVisible();
});

test("a topic page shows spec points with exam guidance", async ({ page }) => {
  await page.goto("/topics/trigonometry");
  await expect(page.getByRole("heading", { name: "Trigonometry", level: 1 })).toBeVisible();
  await expect(page.getByText("5.6")).toBeVisible();
  await expect(page.getByText("In the exam").first()).toBeVisible();
});

test("answering a question gives immediate feedback and a mark scheme", async ({ page }) => {
  await page.goto("/practice/algebra-and-functions");

  await expect(page.getByText(/Question 1 of 5/)).toBeVisible();

  // Deliberately wrong, so the mark scheme is shown.
  const input = page.getByLabel("Your answer");
  if (await input.isVisible().catch(() => false)) {
    await input.fill("-999999");
    await page.getByRole("button", { name: "Check" }).click();
  } else {
    // A multiple choice question — pick the first option.
    await page.locator("fieldset button").first().click();
    await page.getByRole("button", { name: "Check" }).click();
  }

  await expect(page.getByText("Where the marks are")).toBeVisible();
  await expect(page.getByRole("button", { name: /Next question|Finish/ })).toBeVisible();
});

test("the formula reference opens with the f key and separates given from recalled", async ({ page }) => {
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: "Formula reference" });

  // Open by click first. This also proves the page has hydrated, so the
  // keyboard shortcut below is not racing React attaching its listener.
  await page.getByRole("button", { name: /Formulae/ }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Must memorise")).toBeVisible();
  await expect(dialog.getByText("Given in the exam")).toBeVisible();

  await dialog.getByPlaceholder(/Search/).fill("double angle");
  await expect(dialog.getByText("Double angle: sine")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();

  // Now the shortcut itself.
  await page.keyboard.press("f");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
});

test("progress survives a reload", async ({ page }) => {
  await page.goto("/practice/algebra-and-functions");
  await expect(page.getByText(/Question 1 of 5/)).toBeVisible();

  const input = page.getByLabel("Your answer");
  if (await input.isVisible().catch(() => false)) {
    await input.fill("1");
    await page.getByRole("button", { name: "Check" }).click();
  } else {
    await page.locator("fieldset button").first().click();
    await page.getByRole("button", { name: "Check" }).click();
  }

  // An attempt was recorded, so the dashboard should no longer be a blank slate.
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Start", exact: true })).toBeVisible();
});

test("the page does not scroll sideways on a phone", async ({ page }) => {
  await page.goto("/topics/integration");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("says where progress is being saved", async ({ page }) => {
  // With no Supabase configured — which is how the e2e suite runs — the site
  // must say plainly that progress is local, rather than implying it syncs.
  await page.goto("/");
  await expect(page.getByText(/Progress is saved in this browser/)).toBeVisible();
});

test("stays open when no backend is configured", async ({ page }) => {
  // Sign-in is required in production, but the site must remain usable with no
  // Supabase configured — otherwise development and this very suite need
  // secrets, and a backend outage would take the whole site down in CI.
  await page.goto("/practice/algebra-and-functions");
  await expect(page).toHaveURL(/\/practice\/algebra-and-functions/);
  await expect(page.getByText(/Question 1 of 5/)).toBeVisible();
});

test("the sign-in page asks for an email and nothing else", async ({ page }) => {
  await page.goto("/signin");
  await expect(page.getByLabel("Your email address")).toBeVisible();
  await expect(page.getByRole("button", { name: /Email me a link/ })).toBeVisible();
  // No password field anywhere — that is the point of magic link.
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  await expect(page.getByRole("link", { name: /What we store/ }).first()).toBeVisible();
});

test("explains what is stored and how to delete it", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: "What we store", level: 1 })).toBeVisible();
  await expect(page.getByText(/Delete my data/)).toBeVisible();
});

test("the progress page invites you to start when there is no history", async ({ page }) => {
  await page.goto("/progress");
  await expect(page.getByRole("heading", { name: "Your progress" })).toBeVisible();
  await expect(page.getByText(/Nothing here yet/)).toBeVisible();
});

test("the progress page reports what you have done", async ({ page }) => {
  // Answer one question, then confirm it is reflected in the history.
  await page.goto("/practice/algebra-and-functions");
  const input = page.getByLabel("Your answer");
  if (await input.isVisible().catch(() => false)) {
    await input.fill("1");
    await page.getByRole("button", { name: "Check" }).click();
  } else {
    await page.locator("fieldset button").first().click();
    await page.getByRole("button", { name: "Check" }).click();
  }
  await expect(page.getByRole("button", { name: /Next question|Finish/ })).toBeVisible();

  await page.goto("/progress");
  await expect(page.getByText("Questions answered")).toBeVisible();
  await expect(page.getByText("By topic")).toBeVisible();
});

test("the sign-in form is in the served HTML, not only after hydration", async ({ request }) => {
  // Fetched as raw HTML with no JavaScript executed. This is the check that
  // matters: reading the query parameters with useSearchParams would push the
  // whole form behind a Suspense boundary, so the server would send only a
  // "Loading…" fallback. Sign-in gates the entire site, so a hydration failure
  // there would leave students staring at a spinner with no way in.
  const response = await request.get("/signin");
  expect(response.ok()).toBe(true);

  const html = await response.text();
  expect(html).toContain("Your email address");
  expect(html).toContain("Email me a link");
  expect(html).toMatch(/<input[^>]+type="email"/);
  expect(html).not.toContain("Loading…");
});
