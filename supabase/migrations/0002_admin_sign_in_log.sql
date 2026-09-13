-- Admin sign-in log.
--
-- One question to answer: who has signed in, and when.
--
-- Three constraints shaped how, and all three are worth stating because each
-- ruled out the obvious implementation.
--
--  1. NO SERVICE ROLE KEY. The secret key would read auth.users trivially, and
--     this app has never needed it — it is not in Vercel, not in the repo, and
--     adding it to reach an admin page would put full database access into a
--     web deployment to save writing this file. Everything here runs as the
--     signed-in user with the publishable key, exactly like the rest of the
--     app, and the privilege is held by the function rather than the client.
--
--  2. NO ADMIN EMAIL IN THE REPOSITORY. This repository is public. Hardcoding
--     the address would publish a real person's email and make the gate a
--     matter of public record. So the admin list is DATA, held in a table
--     nothing can read, seeded once from the SQL editor. It is also how a
--     second admin gets added later without a deploy.
--
--  3. NO NEW WRITE PATH. Supabase already records last_sign_in_at on every
--     user, so nothing needs recording from the client — which means there is
--     nothing for a student to forge, and the log is already complete for
--     everyone who has ever signed in, including before this migration ran.
--
-- What it shows: every account, its email, when it was created, and the last
-- time it signed in. What it does NOT show: a row per visit. Postgres keeps
-- only the most recent sign-in per user, and recording a history would mean a
-- table written from the client, which is constraint 3 again. Worth adding if
-- the question ever becomes "how often", but "who, and when last" is what was
-- asked for.

-- ── Who counts as an admin ──────────────────────────────────────────────────

create table if not exists public.admins (
  email    text        primary key,
  added_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Deliberately no policies. RLS with no policy denies everything, so neither
-- the anon nor the authenticated role can read this table, list who is on it,
-- or add themselves to it. Only the security definer functions below see it,
-- and they only ever answer yes or no about the caller.

-- ── Is the caller an admin? ─────────────────────────────────────────────────

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  -- Checked against auth.users rather than against the JWT's email claim, so
  -- the answer comes from the authoritative record, and only for an address
  -- whose owner has actually proved they receive mail there.
  select exists (
    select 1
    from auth.users u
    join public.admins a on lower(a.email) = lower(u.email)
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  );
$$;

-- ── The log ─────────────────────────────────────────────────────────────────

create or replace function public.admin_sign_ins()
returns table (
  email          text,
  last_sign_in_at timestamptz,
  first_seen_at   timestamptz
)
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  -- Refuse loudly rather than returning no rows. An empty result would be
  -- indistinguishable from "nobody has signed in", which is the sort of
  -- ambiguity that hides a broken gate for months.
  if not public.is_admin() then
    raise exception 'admin_sign_ins: not authorised' using errcode = '42501';
  end if;

  return query
    select u.email::text, u.last_sign_in_at, u.created_at
    from auth.users u
    order by u.last_sign_in_at desc nulls last, u.created_at desc;
end;
$$;

-- Two separate grants have to be taken back here, and missing the second one
-- is easy: Postgres grants EXECUTE on a new function to PUBLIC, and Supabase's
-- default privileges ALSO grant it to anon and authenticated directly. A
-- revoke from PUBLIC does not touch a direct grant, so revoking only that
-- leaves anon able to call these — which is exactly what happened in the first
-- version of this file, caught by scripts/verify-admin-sql.mjs.
revoke all on function public.is_admin() from public, anon;
revoke all on function public.admin_sign_ins() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_sign_ins() to authenticated;

-- ── One step left, which cannot live in this file ────────────────────────────
--
-- Name the admin. Run this once in the Supabase SQL editor, with the real
-- address, for the reason in constraint 2 above:
--
--   insert into public.admins (email) values ('you@example.com')
--   on conflict (email) do nothing;
--
-- Until that row exists, /admin returns 404 for everyone, which is the correct
-- failure: closed by default.
