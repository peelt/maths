-- A Level Maths (Edexcel 9MA0) — initial schema.
--
-- Design notes:
--
--  * Only USER STATE lives here. All content — the specification map, the
--    formula reference, the question bank — lives in the repository, so the
--    database and the content can never drift out of sync with each other.
--
--  * Spec points are stored as text codes qualified by paper ("pure:5.6")
--    rather than as foreign keys into a topics table, for the same reason.
--
--  * Row level security is enabled on every table, with policies keyed to
--    auth.uid(). Sign-in is anonymous, so a user has a real auth identity —
--    and therefore real isolation — without ever seeing a sign-in screen.

-- Progress is keyed directly to the Supabase auth user.

create table if not exists public.review_states (
  user_id       uuid        not null references auth.users (id) on delete cascade,
  spec_point    text        not null,
  interval_days integer     not null default 0,
  difficulty    numeric(4,2) not null default 5,
  reps          integer     not null default 0,
  lapses        integer     not null default 0,
  due           timestamptz not null default now(),
  last_reviewed timestamptz,
  updated_at    timestamptz not null default now(),
  primary key (user_id, spec_point)
);

create table if not exists public.attempts (
  id          uuid        primary key,
  user_id     uuid        not null references auth.users (id) on delete cascade,
  template_id text        not null,
  seed        bigint      not null,
  spec_point  text        not null,
  correct     boolean     not null,
  given       text        not null default '',
  time_ms     integer     not null default 0,
  at          timestamptz not null default now()
);

-- The dashboard reads recent attempts constantly; the spec point index backs
-- the per-topic accuracy figures.
create index if not exists attempts_user_at_idx on public.attempts (user_id, at desc);
create index if not exists attempts_user_spec_point_idx on public.attempts (user_id, spec_point);
create index if not exists review_states_user_due_idx on public.review_states (user_id, due);

create table if not exists public.streaks (
  user_id                 uuid    primary key references auth.users (id) on delete cascade,
  current                 integer not null default 0,
  longest                 integer not null default 0,
  last_active_date        date,
  freezes                 integer not null default 0,
  days_toward_next_freeze integer not null default 0,
  updated_at              timestamptz not null default now()
);

create table if not exists public.sessions (
  id                  uuid        primary key,
  user_id             uuid        not null references auth.users (id) on delete cascade,
  started_at          timestamptz not null,
  ended_at            timestamptz not null,
  questions_attempted integer     not null default 0,
  questions_correct   integer     not null default 0
);

create index if not exists sessions_user_started_idx on public.sessions (user_id, started_at desc);

-- Row level security ---------------------------------------------------------
--
-- Every table is deny-by-default once RLS is enabled, and each policy grants
-- access only to rows the current user owns. A user therefore cannot read or
-- write another user's progress even with a valid anon key, which is what
-- makes it safe to ship that key to the browser.

alter table public.review_states enable row level security;
alter table public.attempts      enable row level security;
alter table public.streaks       enable row level security;
alter table public.sessions      enable row level security;

drop policy if exists "own review states" on public.review_states;
create policy "own review states" on public.review_states
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own attempts" on public.attempts;
create policy "own attempts" on public.attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own streak" on public.streaks;
create policy "own streak" on public.streaks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own sessions" on public.sessions;
create policy "own sessions" on public.sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Keep updated_at honest without relying on the client to send it.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists review_states_touch on public.review_states;
create trigger review_states_touch
  before update on public.review_states
  for each row execute function public.touch_updated_at();

drop trigger if exists streaks_touch on public.streaks;
create trigger streaks_touch
  before update on public.streaks
  for each row execute function public.touch_updated_at();
