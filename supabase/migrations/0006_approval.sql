-- GoodMovies · sign-up approval gate. Idempotent.
-- New users are unapproved until an admin approves them; member write actions
-- (propose / report / recommend / create group) require approval. Admins are
-- always treated as approved.

alter table public.profiles add column if not exists approved boolean not null default false;

-- Admins bypass approval.
update public.profiles set approved = true where is_admin = true and approved = false;

create or replace function public.is_approved()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select approved or is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ---- gate member write actions on approval ----
drop policy if exists "proposals: insert self" on public.proposals;
create policy "proposals: insert self" on public.proposals
  for insert with check (auth.uid() = proposer_id and public.is_approved());

drop policy if exists "reports: insert self" on public.reports;
create policy "reports: insert self" on public.reports
  for insert with check (auth.uid() = reporter_id and public.is_approved());

drop policy if exists "recs: insert to own group" on public.recommendations;
create policy "recs: insert to own group" on public.recommendations
  for insert with check (
    auth.uid() = recommender_id and public.is_group_owner(group_id) and public.is_approved()
  );

drop policy if exists "groups: insert own" on public.groups;
create policy "groups: insert own" on public.groups
  for insert with check (auth.uid() = owner_id and public.is_approved());

-- ---- let admins see and set the approved flag (for the Review queue) ----
drop policy if exists "profiles: admin read"   on public.profiles;
drop policy if exists "profiles: admin update" on public.profiles;
create policy "profiles: admin read"   on public.profiles for select using (public.is_admin());
create policy "profiles: admin update" on public.profiles for update using (public.is_admin())
  with check (public.is_admin());
