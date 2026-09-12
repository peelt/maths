# A Level Maths — Edexcel 9MA0

A revision and practice site for **Pearson Edexcel A Level Mathematics, specification 9MA0**.

Built around three ideas:

1. **Map the real specification, not a summary.** All 19 topics and 89 spec
   points are taken from the official Issue 4 specification, each with a note
   on what the exam actually asks.
2. **Mark what the answer means, not how it is spelt.** `1/2`, `0.5`, `2^-1`
   and `sqrt(2)/2*sqrt(2)` are all the same number, and all get the mark.
3. **Make sessions short and finishable.** Five questions, a visible counter,
   instant feedback, and a definite end.

## What is here

| | |
|---|---|
| **Specification map** | 19 topics, 89 spec points across Pure, Statistics and Mechanics, with exam guidance on each |
| **Formula reference** | Split by whether a formula is **given in the exam booklet** or must be **memorised** — press <kbd>f</kbd> anywhere |
| **Question bank** | 107 parameterised templates covering **all 89 spec points**, generating fresh numbers every attempt, auto-marked, with mark-scheme-annotated solutions |
| **Teaching notes** | A note for every spec point: the idea, a numbered method, and the things that actually go wrong — collapsed by default so the page stays scannable |
| **Mark scheme drills** | Practise reading a mark scheme: which step earns the method mark, what a dependent mark needs, what an arithmetic slip really costs |
| **Interactives** | Six, each targeting a specific misconception: the unit circle behind the trig graphs, integration as a limit of a sum, R form as one wave, projectile components, graph transformations, and the derivative as a gradient |
| **Spaced repetition** | Every spec point is scheduled to come back before it is forgotten |
| **Progress history** | What you have covered, per-topic accuracy and mastery, and the spec points worth going back to |
| **Sign-in** | Magic link — an email address, no password |

### The given-versus-memorised split

This is the part worth knowing about. Checking the specification appendix
against Pearson's formula booklet turns up some genuinely surprising pairings:

- Compound angle formulae are **given**; double angle formulae are **not**.
- The quotient rule is **given**; the product and chain rules are **not**.
- The `suvat` equations are **given**; the variable-acceleration calculus
  relations are **not**.
- Arithmetic and geometric **sum** formulae are given, but their **nth term**
  formulae are not — and the spec still expects you to be able to prove the
  sums.

## Running it

```bash
npm install
npm run dev
```

With no Supabase configured it runs **open**, with progress saved in the
browser — which is how development and the test suite run, with no secrets.
Configure Supabase and sign-in becomes required.

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm test` | Unit tests (marking, scheduling, question bank integrity) |
| `npm run e2e` | End-to-end tests, desktop and mobile |
| `npm run verify:auth` | Builds with Supabase configured and checks route protection actually redirects |
| `npm run lint` | Lint |

## Deploying

### Vercel

1. Import the repository in Vercel. The defaults are correct for Next.js.
2. Add the two environment variables below.
3. Add your domain and point its DNS at Vercel.

### Supabase and email

Students sign in with a **magic link**: they type an email address, click the
link that arrives, and they are in. No password is ever created.

1. Create a Supabase project and run `supabase/migrations/0001_initial_schema.sql`
   in the SQL editor.
2. **Authentication → Emails → SMTP Settings.** Custom SMTP is **required**, not
   optional: Supabase's built-in sender is capped at **2 emails per hour**, which
   is unusable with more than one student. For Postmark:

   | Field | Value |
   |---|---|
   | Host | `smtp.postmarkapp.com` (transactional, *not* `smtp-broadcasts`) |
   | Port | `587` |
   | Username | Postmark Server API Token |
   | Password | the same token |
   | Sender | an address on a verified Sender Signature |

3. **Authentication → Rate Limits.** Raise the email cap; the 2/hour limit stays
   in force until you do, whatever your SMTP provider can handle.
4. **Authentication → URL Configuration.** Set the Site URL and add redirect URLs
   for every domain the site runs on.
5. **Edit the magic link email template** to point at:

   ```
   /auth/confirm?token_hash={{ .TokenHash }}&type=email
   ```

   This matters. The default flow is PKCE, which keeps a code verifier in the
   browser that requested the link — so the link only works in *that* browser. A
   student who asks for a link on a laptop and opens the email on their phone
   would get an error. The token-hash flow carries no browser-bound state and
   works wherever the mail is opened.

6. Set these in Vercel, then redeploy — they are inlined at build time:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
   ```

**On keys.** The anon key is designed to be public and to sit in the browser;
row level security is what actually protects the data. The **service role key is
never needed by this app** — do not add it to Vercel, the repository, or
anywhere else. If something appears to need it, that is a bug.

**On data.** Only an email address and progress are stored. There is a
`/privacy` page saying so in plain English, and a self-service delete in the
footer of every page.

## Design, and why it looks like this

Built for a student with ADHD, so the palette follows what the evidence
supports rather than a general preference for calm colours. Four decisions, and
the reason for each:

**The card is visibly distinct from the canvas.** This carries most of the
benefit. In a classroom study, children with ADHD made significantly fewer
errors when the board and the wall behind it were different colours, and
performed worst in an all-white room. The first version of this site had a
canvas-to-card contrast of **1.04:1** — white on white, the condition that
performed worst. Every theme is now at least 1.25:1.

**Nothing meaningful rests on blue versus yellow.** ADHD is associated with
impaired blue–yellow discrimination, and in one virtual-environment study
participants took markedly longer on attention tasks under a blue/yellow scheme
than a green/red one. Correct and incorrect are green and red, always next to a
word. The three paper badges used to be indigo, teal and amber — an
indigo-versus-amber distinction — and are now a single neutral, because each
badge already says "Pure" or "Statistics" in words.

**Base contrast is softened, not maximised.** Pure black on pure white raises
visual stress. Body text was **17.4:1**; it now sits near 8:1 — past AAA, but
reached with charcoal rather than black. The contrast test has an *upper* bound
as well as a lower one, because maximising contrast here is the wrong instinct.

**One directional accent.** Muted amber means "do this next" and nothing else.
It is never used for status, and status is never amber — which is why the
progress meter and the primary button share a colour that no badge or panel
borrows.

Plot series get their own tokens, deliberately outside both the green/red
feedback pair and the blue/yellow axis, and separated in lightness as well as
hue so two curves stay distinguishable.

### Choice, because preference varies

Light, tinted and dark themes plus three text sizes, under **Display** in the
header. This is the strongest single recommendation in neurodiversity design
guidance: what is restful for one reader is glaring or muddy for another, and
the variation across ADHD, dyslexia and autism is wide enough that it has to be
a setting rather than a default someone else picked. The choice is stored per
device, applied before the first paint so there is no flash of the wrong
palette, and an explicit choice overrides the device setting.

### The structural part matters more than the colours

For a revision site the bigger wins are not chromatic: one task per screen, a
visible finish line, no autoplay, no hover-triggered menus, and the primary
action in the same place every time. Colour reinforces that hierarchy rather
than competing with it.

`src/app/theme.test.ts` parses `globals.css` and asserts every ratio above, so
the stylesheet is the single source of truth and a change that breaks one of
these fails the build.

## How it is put together

```
src/content/spec/      the 9MA0 specification map — the single source of truth
src/content/formulae   the formula reference, split by given vs memorised
src/content/questions/ parameterised question templates
src/lib/marking/       expression parser, evaluator, equivalence, marking
src/lib/questions/     seeded generation and practice set building
src/lib/scheduling/    spaced repetition
src/lib/progress/      ProgressStore, with local and Supabase adapters
src/lib/supabase/      browser and server clients, shared config
src/proxy.ts           session refresh and route protection (Next 16 "Proxy")
supabase/migrations/   schema and row level security
```

**Content lives in the repository, user state lives in the database.** Nothing
about the specification, the formulae or the questions is stored in Supabase,
so the two can never drift apart. Spec points are referenced by text code
(`"pure:5.6"`) rather than by foreign key, for the same reason.

### Two things that are load-bearing

**Algebraic equivalence is checked by numerical sampling.** Two expressions are
evaluated at many random points; if they agree everywhere, they are equivalent
for marking. That accepts any correct rearrangement — `x(3x+2)` for `3x^2+2x`.
Where a question is about *form* rather than value ("rationalise the
denominator"), a rejected-form check stops the unsimplified original being
marked correct, since it is algebraically equal to the right answer.

**Questions are generated, not stored.** Each template produces fresh numbers
from a seed, so the same question is never repeated verbatim, and storing the
seed reproduces any past question exactly for review.

### Testing

`NEXT_PUBLIC_*` values are inlined at build time, so the end-to-end suite — which
runs with no backend — can never exercise the signed-out-and-redirected path.
That path only exists once Supabase is configured, which makes it the easiest
thing here to break unnoticed. `npm run verify:auth` covers it: it builds with
deliberately unreachable Supabase credentials into a separate output directory
and asserts that protected routes redirect while `/signin` and `/privacy` do
not. Unreachable is the point — a failed session lookup must deny access, not
grant it.

The most important test asserts that **every question template marks its own
canonical answer as correct across 60 generated variants**. A question that
disagrees with its own mark scheme tells a student they are wrong when they are
right, which would undermine everything else in here. The same suite checks
that no variant renders malformed output like `+ -3`, and that all LaTeX
parses.

## Scope

Being precise about this, because a revision tool that overstates its coverage
is worse than one that admits its gaps.

**Complete:**

- The specification map — all 19 topics and 89 spec points, each with exam
  guidance.
- The formula reference — every formula from the specification appendix and
  the A Level section of the exam booklet, correctly attributed to one list or
  the other.
- The exam guide — papers, assessment objectives, mark scheme codes, the large
  data set, calculator requirements.

- The question bank. 107 templates covering every one of the 89 spec points,
  so nothing in the specification is invisible to the scheduler. Depth still
  varies — Algebra and functions has the most question types, and several spec
  points have exactly one — but no spec point has none.
- Teaching notes. One for every spec point: the idea, a numbered method you
  could follow under exam pressure, and the handful of things that go wrong.
- Mark scheme drills, generated from the question bank plus authored questions
  on the marking rules themselves.

**Partial:**

- Depth within a spec point. One template per spec point means one shape of
  question; a student who has seen it twice has seen the shape. The points with
  a single template are the obvious place to add next.
- Interactives. Six, covering the places where watching something move beats
  reading about it. More would be possible — the normal distribution and
  connected particles are the obvious candidates — but an interactive only
  earns its place where a sentence genuinely cannot do the job.

Tests assert both kinds of full coverage, so adding a spec point without
questions or without a note fails the build rather than quietly leaving a gap.

---

This is an independent revision tool. It is not affiliated with or endorsed by
Pearson. Always check the current specification and your teacher's guidance.
