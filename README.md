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
| **Question bank** | Parameterised templates generating fresh numbers every attempt, auto-marked, with mark-scheme-annotated solutions |
| **Interactives** | Graph transformations and the derivative-as-gradient, where seeing it move beats reading about it |
| **Spaced repetition** | Every spec point is scheduled to come back before it is forgotten |

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

It works immediately with no backend: progress is saved in the browser.

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm test` | Unit tests (marking, scheduling, question bank integrity) |
| `npm run e2e` | End-to-end tests, desktop and mobile |
| `npm run lint` | Lint |

## Deploying

### Vercel

1. Import the repository in Vercel. The defaults are correct for Next.js.
2. Add the two environment variables below.
3. Add your domain and point its DNS at Vercel.

### Supabase (optional — enables progress syncing across devices)

Without these variables the site falls back to browser storage and everything
still works. With them, progress follows the student between phone and laptop.

1. Create a Supabase project. Choose a region near your users.
2. Run `supabase/migrations/0001_initial_schema.sql` in the SQL editor.
3. Enable **anonymous sign-ins** under Authentication → Providers.
4. Set these in Vercel:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
   ```

**On keys.** The anon key is designed to be public and to sit in the browser;
row level security is what actually protects the data. The **service role key
is never needed by this app** — do not add it to Vercel, the repository, or
anywhere else. If something appears to need it, that is a bug.

**On sign-in.** There is none. Supabase anonymous auth creates a real auth
identity silently, which is what makes row level security meaningful — without
it every row would have to be world-readable. The student opens the site and
starts working.

## How it is put together

```
src/content/spec/      the 9MA0 specification map — the single source of truth
src/content/formulae   the formula reference, split by given vs memorised
src/content/questions/ parameterised question templates
src/lib/marking/       expression parser, evaluator, equivalence, marking
src/lib/questions/     seeded generation and practice set building
src/lib/scheduling/    spaced repetition
src/lib/progress/      ProgressStore, with local and Supabase adapters
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

The most important test asserts that **every question template marks its own
canonical answer as correct across 60 generated variants**. A question that
disagrees with its own mark scheme tells a student they are wrong when they are
right, which would undermine everything else in here. The same suite checks
that no variant renders malformed output like `+ -3`, and that all LaTeX
parses.

## Scope

The specification map and formula reference are **complete**. The question bank
is **partial** and is being built out topic by topic, starting with Year 1 Pure.
Every topic page states plainly whether it can be practised yet — coverage is
never overstated.

---

This is an independent revision tool. It is not affiliated with or endorsed by
Pearson. Always check the current specification and your teacher's guidance.
