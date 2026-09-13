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

  const input = page.getByLabel("Your answer");
  if (await input.isVisible().catch(() => false)) {
    // Deliberately wrong, so the mark scheme is shown without being asked for.
    await input.fill("-999999");
  } else {
    // A multiple choice question. Nothing in the DOM says which option is
    // right, and this topic's one such question has the correct answer first
    // in roughly a third of seeds — so the verdict decides what to assert
    // below, rather than the test assuming it answered wrongly. Assuming it
    // is what made this test fail about one run in fifty.
    await page.locator("main fieldset button").first().click();
  }
  await page.getByRole("button", { name: "Check", exact: true }).click();

  await expect(page.getByText(/^(Correct\.|Not quite\.)$/)).toBeVisible();

  const reveal = page.getByRole("button", { name: "Show the worked solution" });
  if (await page.getByText("Not quite.").isVisible()) {
    // Getting it wrong opens the mark scheme on its own. The student should
    // not have to ask for it at the moment they most need it, so the reveal
    // button being absent is the assertion, not an incidental detail.
    await expect(reveal).toHaveCount(0);
  } else {
    await reveal.click();
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
    await page.locator("main fieldset button").first().click();
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
    await page.locator("main fieldset button").first().click();
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

test("a confirm link with no token explains it is a configuration problem", async ({ page }) => {
  // Hitting /auth/confirm with neither token_hash nor code is what happens when
  // the Supabase email template has not been pointed at this route. The student
  // did nothing wrong, so the message must not imply a fresh link will help.
  await page.goto("/auth/confirm");
  await expect(page).toHaveURL(/\/signin\?error=misconfigured/);
  await expect(page.getByText(/email template needs configuring/)).toBeVisible();
});

test("a confirm link reports a same-browser failure distinctly", async ({ page }) => {
  // A PKCE code that cannot be exchanged — the cross-device failure. It must
  // read differently from an expired link, because the remedy is different.
  await page.goto("/auth/confirm?code=not-a-real-code");
  await expect(page).toHaveURL(/\/signin\?error=(wrong-device|unavailable)/);
});

test("the exam guide links to the mark scheme drill", async ({ page }) => {
  await page.goto("/exam");
  await expect(page.getByRole("link", { name: /Drill the mark scheme/ })).toBeVisible();
});

test("a mark scheme drill can be answered and gives the meaning of the code", async ({ page }) => {
  await page.goto("/exam/drills");
  await expect(page.getByRole("heading", { name: "Mark scheme drills" })).toBeVisible();

  // The set is built after mount, so wait for the first question.
  await expect(page.getByText(/1 of 6/)).toBeVisible();

  // Pick the first option and check it. Right or wrong, an explanation follows.
  await page.locator("main fieldset button").first().click();
  await page.getByRole("button", { name: "Check", exact: true }).click();

  await expect(page.getByText(/Correct\.|Not quite\./)).toBeVisible();
  await expect(page.getByRole("button", { name: /Next|Finish/ })).toBeVisible();
});

test("a mark scheme drill runs to the end and offers another set", async ({ page }) => {
  await page.goto("/exam/drills");
  await expect(page.getByText(/1 of 6/)).toBeVisible();

  for (let i = 0; i < 6; i++) {
    await page.locator("main fieldset button").first().click();
    await page.getByRole("button", { name: "Check", exact: true }).click();
    await page.getByRole("button", { name: /Next|Finish/ }).click();
  }

  await expect(page.getByText(/Mark scheme drill · complete/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Another set" })).toBeVisible();
});

test("the drill page does not scroll sideways on a phone", async ({ page }) => {
  await page.goto("/exam/drills");
  await expect(page.getByText(/1 of 6/)).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("a spec point offers a teaching note with a method and pitfalls", async ({ page }) => {
  await page.goto("/topics/differentiation");
  // Named rather than positional. This used to take the first <details> in
  // main, which broke the moment the page grew another disclosure above the
  // spec list — a test should say which control it means.
  const note = page.locator("main details").filter({ hasText: "How it works" }).first();
  // Collapsed by default, so the page stays scannable.
  await expect(note).not.toHaveAttribute("open", "");
  await note.locator("summary").first().click();
  await expect(note.getByText("Method")).toBeVisible();
  await expect(note.getByText("Watch for")).toBeVisible();
});

test("the teaching note is in the served HTML, not only after hydration", async ({ request }) => {
  // A <details> was chosen over a React toggle precisely so the content is
  // present and readable before any JavaScript runs.
  const response = await request.get("/topics/differentiation");
  const html = await response.text();
  expect(html).toContain("How it works");
  expect(html).toContain("Watch for");
});

test("the unit circle interactive links the circle to the graph", async ({ page }) => {
  await page.goto("/topics/trigonometry");
  // The same explorer is registered against 5.1 and 5.3, so scope to one.
  const panel = page.locator("li").filter({ hasText: "Where sine and cosine come from" }).first();
  await expect(panel).toBeVisible();

  await panel.getByRole("button", { name: "π/6", exact: true }).click();
  await expect(panel.getByText("sin θ = 0.500")).toBeVisible();
  await expect(panel.getByText("cos θ = 0.866")).toBeVisible();
  // Pythagoras on the radius must hold at every angle.
  await expect(panel.getByText("sin²+cos² = 1.000")).toBeVisible();
});

test("the R form interactive shows the maximum is R, not a + b", async ({ page }) => {
  await page.goto("/topics/trigonometry");
  const panel = page.locator("li").filter({ hasText: "Two waves make one" }).first();
  await expect(panel).toBeVisible();
  // Defaults are a = 3, b = 4, so R = 5 while a + b = 7.
  await expect(panel.getByText("5.000").first()).toBeVisible();
  await expect(panel.getByText("a + b, for comparison")).toBeVisible();
});

test("the area interactive converges on the exact integral as strips increase", async ({ page }) => {
  await page.goto("/topics/integration");
  // Registered against 8.3 and 8.4; take the first.
  const panel = page.locator("li").filter({ hasText: "Area under a curve, by rectangles" }).first();
  await expect(panel).toBeVisible();

  const slider = panel.locator('input[type="range"]');
  const errorOf = async () => {
    const text = await panel.getByText("Error", { exact: true }).locator("..").innerText();
    return Math.abs(Number(text.split("\n").pop()));
  };

  await slider.fill("4");
  const coarse = await errorOf();
  await slider.fill("60");
  const fine = await errorOf();

  // The whole point of the interactive: more strips, less error.
  expect(fine).toBeLessThan(coarse);
});

test("the projectile interactive keeps horizontal velocity constant", async ({ page }) => {
  await page.goto("/topics/kinematics");
  const panel = page.locator("li").filter({ hasText: "Horizontal and vertical are independent" }).first();
  await expect(panel).toBeVisible();

  const horizontal = panel.getByText("Horizontal velocity", { exact: true }).locator("..");
  const time = panel.locator("#time");

  await time.fill("0.2");
  const early = await horizontal.innerText();
  await time.fill("2.5");
  const late = await horizontal.innerText();

  // Horizontal velocity is unchanged by time — there is no horizontal force.
  expect(early).toBe(late);
});

test("the display panel offers light, tinted and dark, and the choice sticks", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Display settings").click();

  // Every option is visible at once rather than hidden behind a cycling
  // toggle, so the current state is always readable.
  for (const name of ["System", "Mist", "Warm", "Dark"]) {
    await expect(page.getByRole("button", { name: new RegExp(name) })).toBeVisible();
  }

  await page.getByRole("button", { name: /Dark/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  // The choice must survive a reload, and apply before the first paint.
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("the saved theme is applied before the page paints", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("appearance.theme", "warm"));

  // Capture the attribute at the earliest possible moment on the next load.
  await page.goto("/topics");
  const earliest = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  expect(earliest).toBe("warm");
});

test("text size scales the whole page, not just the text", async ({ page }) => {
  await page.goto("/");
  const rootSize = () => page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
  const before = await rootSize();

  await page.getByLabel("Display settings").click();
  await page.getByRole("button", { name: "Larger", exact: true }).click();

  // Scaling the root carries every rem-based size with it, so spacing keeps
  // its proportions instead of text growing inside boxes that do not.
  expect(await rootSize()).toBeGreaterThan(before);
  await expect(page.locator("html")).toHaveAttribute("data-text-size", "larger");
});

test("choosing a light theme overrides a device set to dark", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");

  /** How light the page actually is, 0 to 1, from its rendered background. */
  const brightness = () =>
    page.evaluate(() => {
      const [r, g, b] = getComputedStyle(document.body)
        .backgroundColor.match(/\d+/g)!
        .map(Number);
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    });

  const onDarkDevice = await brightness();
  expect(onDarkDevice).toBeLessThan(0.3);

  await page.getByLabel("Display settings").click();
  await page.getByRole("button", { name: /Mist/ }).click();

  // An explicit choice has to win over the media query, or picking light on a
  // dark device would silently do nothing. Asserted as "the page went light"
  // rather than against a literal colour, so a palette change cannot make this
  // fail without anything actually being broken — which is what it just did.
  await expect(page.locator("html")).toHaveAttribute("data-theme", "mist");
  expect(await brightness()).toBeGreaterThan(0.8);
});

test("the card is visibly distinct from the canvas in every theme", async ({ page }) => {
  // The most supported ADHD-specific finding in the design brief: a distinct
  // figure against its ground reduces errors, and all-white performs worst.
  for (const theme of ["mist", "warm", "dark"]) {
    await page.goto("/");
    await page.evaluate((t) => localStorage.setItem("appearance.theme", t), theme);
    await page.reload();

    const { canvas, card } = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return { canvas: styles.getPropertyValue("--bg").trim(), card: styles.getPropertyValue("--surface").trim() };
    });
    expect(canvas, theme).not.toBe(card);
  }
});

test("the homepage has exactly one h1, and the figure is decorative", async ({ page }) => {
  await page.goto("/");
  // The homepage had no h1 at all before the hero was added.
  await expect(page.locator("h1")).toHaveCount(1);
  // Asserted as "there is one, and it is the hero" rather than against its
  // wording, so renaming the heading cannot fail a test about page structure.
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toContainText("one short session at a time");

  // The figure repeats nothing a screen reader needs, so it must be hidden.
  const figures = page.locator("main section svg");
  const count = await figures.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    await expect(figures.nth(i)).toHaveAttribute("aria-hidden", "true");
  }
});

test("every topic on the index has an illustration", async ({ page }) => {
  await page.goto("/topics");
  const cards = page.locator("main li");
  const cardCount = await cards.count();
  expect(cardCount).toBe(19);
  // One figure per card, all nineteen.
  await expect(page.locator("main li svg")).toHaveCount(19);
});

test("the primary action stays in view on a small phone", async ({ page }) => {
  // The hero must never push the one primary action below the fold — that is
  // the whole reason the homepage resolves to a single button. Measured, not
  // assumed: with the hero above the panel this landed at 738px on a 640px
  // screen, so on narrow viewports the task comes first.
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/");
  const start = page.getByRole("link", { name: "Start", exact: true });
  await expect(start).toBeVisible();
  const box = await start.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y + box!.height).toBeLessThanOrEqual(640);
});

test("the display control is reachable on a phone without sideways scrolling", async ({ page }) => {
  // It used to sit inside the nav's horizontal scroller, where it slid off the
  // edge — hiding the most important accessibility control on the site.
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/");
  const inView = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('[aria-label="Display settings"]')];
    return buttons.some((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.left >= -1 && r.right <= window.innerWidth + 1;
    });
  });
  expect(inView).toBe(true);
});

test("the homepage does not scroll sideways on the narrowest phones", async ({ page }) => {
  for (const width of [320, 360, 390]) {
    await page.setViewportSize({ width, height: 700 });
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `${width}px`).toBeLessThanOrEqual(1);
  }
});

test("exam pace is off until asked for, and then stays on", async ({ page }) => {
  await page.goto("/practice/algebra-and-functions");

  // Off by default. A clock nobody asked for is pressure, and the brief's
  // whole point is that the timing is short practice rather than an ordeal.
  const toggle = page.getByRole("button", { name: /Exam pace/ });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("progressbar", { name: "Time used on this question" })).toHaveCount(0);

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  const clock = page.getByRole("progressbar", { name: "Time used on this question" });
  await expect(clock).toBeVisible();

  // Remembered across visits, so it is a choice made once rather than a
  // decision every single time the site is opened.
  await page.goto("/practice/differentiation");
  await expect(page.getByRole("button", { name: /Exam pace/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("progressbar", { name: "Time used on this question" })).toBeVisible();
});

test("the clock counts up, and stops while feedback is on screen", async ({ page }) => {
  await page.goto("/practice/algebra-and-functions");
  await page.getByRole("button", { name: /Exam pace/ }).click();

  const used = () =>
    page
      .getByRole("progressbar", { name: "Time used on this question" })
      .getAttribute("aria-valuenow")
      .then(Number);

  await page.waitForTimeout(1200);
  const running = await used();

  // Answer it — anything will do, since this is about the clock and not the
  // marking. Feedback then has to freeze it: reading the mark scheme is not
  // time spent thinking about the question, and counting it would make every
  // pace figure meaningless.
  // The set is random, so question one may be multiple choice rather than a
  // typed answer. Handle both, or this passes until the day it does not.
  const input = page.locator("main").getByLabel("Your answer");
  if (await input.isVisible().catch(() => false)) await input.fill("0");
  else await page.locator("main fieldset button").first().click();
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByText(/Correct\.|Not quite\./)).toBeVisible();

  const atFeedback = await used();
  await page.waitForTimeout(1500);
  expect(await used()).toBe(atFeedback);
  expect(atFeedback).toBeGreaterThanOrEqual(running);
});

test("the sign-in log is closed by default", async ({ page }) => {
  // With no Supabase configured there are no accounts, no identity to check,
  // and nothing to show — so the page must not exist rather than render an
  // empty table. Closed by default is the only safe failure for this one.
  const response = await page.goto("/admin");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("table")).toHaveCount(0);
});

test("the header carries the logo, and it is still called what the site is called", async ({ page }) => {
  await page.goto("/");

  // The mark stands in for the A on screen, so a reader who cannot see it must
  // still get the real name from the link rather than "Level Maths".
  const brand = page.getByRole("banner").getByRole("link", { name: "A Level Maths" });
  await expect(brand).toBeVisible();

  // One decorative SVG inside it, hidden from assistive technology.
  const mark = brand.locator("svg");
  await expect(mark).toHaveAttribute("aria-hidden", "true");

  // And it renders at a real size rather than collapsing to nothing, which is
  // how an em-sized SVG fails when its container has no font size.
  const box = await mark.boundingBox();
  expect(box!.width).toBeGreaterThan(14);
  expect(box!.height).toBeGreaterThan(14);
});

test("the dashboard opens on whatever was practised last", async ({ page }) => {
  await page.goto("/");
  // With no history it suggests a starting point rather than resuming.
  await expect(page.getByRole("link", { name: "Pick a topic" })).toBeVisible();
  await expect(page.getByText("Carry on with")).toHaveCount(0);

  // Practise something — one answered question is enough to record it.
  await page.goto("/practice/differentiation");
  await expect(page.getByText(/Question 1 of 5/)).toBeVisible();
  const input = page.locator("main").getByLabel("Your answer");
  if (await input.isVisible().catch(() => false)) await input.fill("0");
  else await page.locator("main fieldset button").first().click();
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.getByText(/Correct\.|Not quite\./)).toBeVisible();

  // No declaring, no button: the dashboard now opens there.
  await page.goto("/");
  await expect(page.getByText("Carry on with")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Differentiation" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Start" })).toHaveAttribute(
    "href",
    "/practice/differentiation",
  );
});

test("the dashboard never frames revision as a debt", async ({ page }) => {
  // The wording is the feature here. "Due", "overdue" and a count of what is
  // waiting turn a revision site into a pile of homework, which is the thing
  // most likely to end the session before it starts.
  await page.goto("/");
  // Prove the panel actually rendered first: an assertion that some words are
  // absent passes just as happily on a blank page.
  await expect(page.getByRole("link", { name: "Start" })).toBeVisible();
  const main = await page.locator("main").innerText();
  expect(main).not.toMatch(/\boverdue\b/i);
  expect(main).not.toMatch(/due for review/i);
  expect(main).not.toMatch(/\d+ spec points? ready for review/i);
});

test("being stuck mid-question does not mean leaving the session", async ({ page }) => {
  await page.goto("/practice/differentiation");
  await expect(page.getByText(/Question 1 of 5/)).toBeVisible();

  const article = page.locator("article");
  const question = (await article.innerText()).split("\n")[0];

  // The explanation comes to the question. Leaving for the topic page would
  // build a brand new set on the way back, so "read up and carry on" used to
  // cost you your place.
  await page.getByRole("button", { name: "Explain this" }).click();
  await expect(article).toContainText(/METHOD/i);
  await expect(article).toContainText(/WATCH FOR/i);
  expect(await article.innerText()).toContain(question);

  // Opening the method must not hand over the hint as well: that is separate
  // help the student did not ask for.
  await expect(page.getByRole("button", { name: "Nudge me" })).toBeVisible();

  // And it folds away, still without navigating.
  await page.getByRole("button", { name: "Hide" }).click();
  await expect(article).not.toContainText(/WATCH FOR/i);
  expect(await article.innerText()).toContain(question);
  await expect(page.getByText(/Question 1 of 5/)).toBeVisible();
});

test("the explanation is still there once the answer is marked", async ({ page }) => {
  await page.goto("/practice/differentiation");
  await expect(page.getByText(/Question 1 of 5/)).toBeVisible();

  const input = page.locator("main").getByLabel("Your answer");
  if (await input.isVisible().catch(() => false)) await input.fill("0");
  else await page.locator("main fieldset button").first().click();
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.getByText(/Correct\.|Not quite\./)).toBeVisible();

  // Getting it wrong is exactly when the method is wanted most.
  await page.getByRole("button", { name: "Explain the method" }).click();
  await expect(page.locator("article")).toContainText(/METHOD/i);
});

test("the nudge to go back to a topic names it, rather than counting things", async ({ page }) => {
  // The review record is seeded rather than earned. Driving the marking engine
  // to make a spec point due needs a WRONG answer, and on a multiple-choice
  // question the test cannot know which option that is — it passed or failed
  // depending on which question came up. This test is about the wording, so it
  // sets up the state it needs and leaves the engine to its own tests.
  await page.goto("/");
  await page.evaluate(() => {
    const overdue = new Date(Date.now() - 12 * 86_400_000).toISOString();
    localStorage.setItem(
      "9ma0:reviews",
      JSON.stringify([
        {
          specPoint: "pure:8.1",
          intervalDays: 1,
          difficulty: 5,
          reps: 1,
          lapses: 0,
          due: overdue,
          lastReviewed: overdue,
          updatedAt: overdue,
        },
      ]),
    );
  });

  // Practise something else, so the nudge is not what Start already opens on.
  await page.goto("/practice/differentiation");
  await expect(page.getByText(/Question 1 of 5/)).toBeVisible();
  const input = page.locator("main").getByLabel("Your answer");
  if (await input.isVisible().catch(() => false)) await input.fill("0");
  else await page.locator("main fieldset button").first().click();
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.getByText(/Correct\.|Not quite\./)).toBeVisible();

  await page.goto("/");
  await expect(page.getByText("Carry on with")).toBeVisible();

  // Named and clickable, not "some earlier topics are ready for another look".
  const nudge = page.getByText(/You last practised/);
  await expect(nudge).toBeVisible();
  // Scoped to the sentence: "Integration" also names a card further down the
  // page, and an unscoped role lookup matches both.
  await expect(nudge.getByRole("link", { name: "Integration" })).toHaveAttribute(
    "href",
    "/practice/integration",
  );
  await expect(nudge).toContainText("12 days ago");
  // And it must never suggest the topic Start already opens on.
  await expect(nudge).not.toContainText("Differentiation");
});

test("the dashboard explains itself without jargon", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Pick a topic" })).toBeVisible();
  const main = await page.locator("main").innerText();
  // "this panel will open on it from then on" meant nothing to a student, and
  // neither does any other word taken straight from the code.
  expect(main).not.toMatch(/\bpanel\b/i);
  // The button this used to talk about is gone; nothing may still mention it.
  expect(main).not.toMatch(/covering this in class/i);
});

test("the companion panel starts closed and opens without loading anything", async ({ page }) => {
  // The strong claim in this feature is a privacy one: a student reading a
  // topic page tells YouTube nothing until they ask for the video. A thumbnail
  // would break that as surely as the player would, so the assertion is that
  // NO request leaves for a third party — not that no iframe exists.
  const thirdParty: string[] = [];
  page.on("request", (request) => {
    const host = new URL(request.url()).host;
    if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) thirdParty.push(host);
  });

  await page.goto("/topics/differentiation");

  const panel = page.locator("main details").filter({ hasText: "Stuck? Try a different way" }).first();
  expect(await panel.evaluate((el: HTMLDetailsElement) => el.open), "panel starts open").toBe(false);

  // The invitation is readable while the panel is shut, or nobody opens it.
  await expect(page.getByText("Stuck? Try a different way of seeing this topic.")).toBeVisible();

  await panel.locator("summary").first().click();
  const tips = panel.locator("details").filter({ hasNot: page.locator("summary", { hasText: "explanation" }) });
  const stuckOn = page.getByText("I forget the extra factor in the chain rule.");
  await expect(stuckOn).toBeVisible();

  // Every tip closed to start with, and more than one may be open at once.
  await expect(page.getByText("Think of the chain rule as two connected gears")).toBeHidden();
  await stuckOn.click();
  await expect(page.getByText("Think of the chain rule as two connected gears")).toBeVisible();
  await page.getByText("I do not understand why the product rule has two terms.").click();
  await expect(page.getByText("Think of the chain rule as two connected gears")).toBeVisible();
  expect(await tips.count()).toBeGreaterThanOrEqual(3);

  // The answer waits to be asked for.
  await expect(page.getByText("It is 18.")).toBeHidden();
  await page.getByText("Reveal explanation").click();
  await expect(page.getByText("It is 18.")).toBeVisible();
  await expect(page.getByText("Hide explanation")).toBeVisible();

  expect(thirdParty, "something was fetched before Load video was pressed").toEqual([]);
});

test("the video loads only when asked, and the watch link outlives it", async ({ page }) => {
  await page.goto("/topics/differentiation");
  const panel = page.locator("main details").filter({ hasText: "Stuck? Try a different way" }).first();
  await panel.locator("summary").first().click();

  // The full length is labelled as the whole video, not as what to watch.
  await expect(page.getByText("3Blue1Brown · 16:50 long")).toBeVisible();
  // The caveat stays on screen: this one is not an exam-method lesson.
  await expect(page.getByText(/A conceptual animation, not an exam-method lesson/)).toBeVisible();

  const watch = page.getByRole("link", { name: "Watch on YouTube" });
  await expect(watch).toHaveAttribute("href", "https://www.youtube.com/watch?v=9vKqVkMQHKk");
  await expect(watch).toHaveAttribute("rel", /noopener/);

  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: "Load video" }).click();

  const frame = page.locator("iframe");
  await expect(frame).toHaveCount(1);
  await expect(frame).toHaveAttribute("src", /^https:\/\/www\.youtube-nocookie\.com\/embed\/9vKqVkMQHKk\?/);
  await expect(frame).toHaveAttribute("title", /paradox of the derivative/);
  // Still there, because embedded playback can be refused by the video's owner.
  await expect(watch).toBeVisible();
});

test("the companion panel keeps its hands off progress", async ({ page }) => {
  await page.goto("/topics/integration");
  const before = await page.evaluate(() =>
    Object.keys(localStorage)
      .filter((k) => k.startsWith("9ma0:"))
      .map((k) => `${k}=${localStorage.getItem(k)}`)
      .sort(),
  );

  const panel = page.locator("main details").filter({ hasText: "Stuck? Try a different way" }).first();
  await panel.locator("summary").first().click();
  await page.getByText("An integral feels like algebra without a meaning.").click();
  await page.getByText("Reveal explanation").click();
  await page.getByRole("button", { name: "Load video" }).click();
  await page.waitForTimeout(300);

  const after = await page.evaluate(() =>
    Object.keys(localStorage)
      .filter((k) => k.startsWith("9ma0:"))
      .map((k) => `${k}=${localStorage.getItem(k)}`)
      .sort(),
  );
  // Reading is not practising. Nothing here may mark a spec point, record an
  // attempt, move a review date or touch the streak.
  expect(after).toEqual(before);
});

test("the companion panel resets when you move to another topic", async ({ page }) => {
  await page.goto("/topics/vectors");
  const panel = page.locator("main details").filter({ hasText: "Stuck? Try a different way" }).first();
  await panel.locator("summary").first().click();
  await page.getByRole("button", { name: "Load video" }).click();
  await expect(page.locator("iframe")).toHaveCount(1);

  // Client-side navigation, which is the case where stale state survives.
  await page.getByRole("link", { name: "← All topics" }).click();
  await page.getByRole("link", { name: /Moments/ }).first().click();
  await expect(page.getByRole("heading", { name: "Moments", level: 1 })).toBeVisible();

  const next = page.locator("main details").filter({ hasText: "Stuck? Try a different way" }).first();
  expect(await next.evaluate((el: HTMLDetailsElement) => el.open), "panel carried over open").toBe(false);
  await expect(page.locator("iframe")).toHaveCount(0);
});

test("the companion panel works from the keyboard alone", async ({ page }) => {
  await page.goto("/topics/trigonometry");
  const panel = page.locator("main details").filter({ hasText: "Stuck? Try a different way" }).first();
  const summary = panel.locator("summary").first();

  // A real <summary>, so it is in the tab order and announces its own state
  // without any of that being hand-written — which is why this is a <details>
  // and not a div with a click handler.
  await summary.focus();
  await expect(summary).toBeFocused();
  await page.keyboard.press("Enter");
  expect(await panel.evaluate((el: HTMLDetailsElement) => el.open)).toBe(true);

  // What matters to someone using a screen reader is not a flag but whether
  // the content is in the accessibility tree at all: closed, none of it should
  // be reachable; open, all of it should be. A div-with-a-click-handler that
  // merely hides text visually fails this.
  const opened = await panel.ariaSnapshot();
  expect(opened).toContain("Radians feel like an arbitrary alternative to degrees.");

  await page.keyboard.press("Enter");
  expect(await panel.ariaSnapshot()).not.toContain("Radians feel like an arbitrary alternative");
  expect(await panel.evaluate((el: HTMLDetailsElement) => el.open)).toBe(false);

  // And the focus ring the rest of the site uses applies here too.
  const outline = await summary.evaluate((el) => getComputedStyle(el).outlineWidth);
  expect(outline).not.toBe("0px");
});
