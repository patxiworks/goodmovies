-- GoodMovies · initial schema
-- Run in the Supabase SQL editor (or via the Supabase CLI).
-- Movies themselves live in the Google Sheet; this schema is only the
-- user-generated data: profiles, groups, proposals, reports, recommendations.
--
-- Ordering matters: tables are created first, then the helper functions
-- (which reference those tables), then the RLS policies. The script is
-- idempotent — safe to re-run.

-- ============================================================
-- Tables
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  member_email text not null,
  member_id uuid references auth.users(id),
  status text not null default 'invited',   -- invited | active
  created_at timestamptz not null default now(),
  unique (group_id, member_email)
);

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  proposer_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  imdb_url text not null,
  status text not null default 'pending',    -- pending | approved | rejected
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  movie_id bigint not null,                  -- the sheet's ID
  movie_title text,
  reason text not null,
  status text not null default 'open',       -- open | reviewed | dismissed
  created_at timestamptz not null default now()
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  recommender_id uuid not null references auth.users(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  movie_id bigint not null,
  movie_title text,
  rating int not null check (rating between 1 and 10),
  reason text,
  created_at timestamptz not null default now()
);

-- Enable Row-Level Security on everything.
alter table public.profiles          enable row level security;
alter table public.groups            enable row level security;
alter table public.group_members     enable row level security;
alter table public.proposals         enable row level security;
alter table public.reports           enable row level security;
alter table public.recommendations   enable row level security;

-- ============================================================
-- Helper functions
-- SECURITY DEFINER bypasses RLS internally, which avoids recursive
-- policy evaluation between groups and group_members.
-- ============================================================
create or replace function public.is_group_owner(gid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.groups where id = gid and owner_id = auth.uid());
$$;

create or replace function public.is_group_member(gid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and member_email = auth.jwt() ->> 'email'
  );
$$;

-- Auto-create a profile row when a user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enforce max 5 groups per owner.
create or replace function public.enforce_group_limit()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.groups where owner_id = new.owner_id) >= 5 then
    raise exception 'A user can create at most 5 groups';
  end if;
  return new;
end;
$$;

drop trigger if exists group_limit on public.groups;
create trigger group_limit
  before insert on public.groups
  for each row execute function public.enforce_group_limit();

-- ============================================================
-- Policies (dropped-then-created so the script is re-runnable)
-- ============================================================

-- profiles: self only
drop policy if exists "profiles: self read"   on public.profiles;
drop policy if exists "profiles: self insert" on public.profiles;
drop policy if exists "profiles: self update" on public.profiles;
create policy "profiles: self read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles: self insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles: self update" on public.profiles for update using (auth.uid() = id);

-- groups: owner manages; owner + members can read
drop policy if exists "groups: read own or member" on public.groups;
drop policy if exists "groups: insert own"          on public.groups;
drop policy if exists "groups: update own"          on public.groups;
drop policy if exists "groups: delete own"          on public.groups;
create policy "groups: read own or member" on public.groups
  for select using (auth.uid() = owner_id or public.is_group_member(id));
create policy "groups: insert own" on public.groups
  for insert with check (auth.uid() = owner_id);
create policy "groups: update own" on public.groups
  for update using (auth.uid() = owner_id);
create policy "groups: delete own" on public.groups
  for delete using (auth.uid() = owner_id);

-- group_members: owner manages; the invitee can read their own row
drop policy if exists "members: owner manages" on public.group_members;
drop policy if exists "members: self read"     on public.group_members;
create policy "members: owner manages" on public.group_members
  for all using (public.is_group_owner(group_id))
  with check (public.is_group_owner(group_id));
create policy "members: self read" on public.group_members
  for select using (member_email = auth.jwt() ->> 'email');

-- proposals: proposer only
drop policy if exists "proposals: insert self" on public.proposals;
drop policy if exists "proposals: read self"   on public.proposals;
create policy "proposals: insert self" on public.proposals
  for insert with check (auth.uid() = proposer_id);
create policy "proposals: read self" on public.proposals
  for select using (auth.uid() = proposer_id);

-- reports: reporter only
drop policy if exists "reports: insert self" on public.reports;
drop policy if exists "reports: read self"   on public.reports;
create policy "reports: insert self" on public.reports
  for insert with check (auth.uid() = reporter_id);
create policy "reports: read self" on public.reports
  for select using (auth.uid() = reporter_id);

-- recommendations: insert to a group you own; read as owner or member
drop policy if exists "recs: insert to own group"    on public.recommendations;
drop policy if exists "recs: read as owner or member" on public.recommendations;
drop policy if exists "recs: delete own"             on public.recommendations;
create policy "recs: insert to own group" on public.recommendations
  for insert with check (auth.uid() = recommender_id and public.is_group_owner(group_id));
create policy "recs: read as owner or member" on public.recommendations
  for select using (public.is_group_owner(group_id) or public.is_group_member(group_id));
create policy "recs: delete own" on public.recommendations
  for delete using (auth.uid() = recommender_id);
