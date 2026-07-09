-- GoodMovies · usernames, admin role, group-creator name, group-owner-only
-- recommendation deletion, and letting members leave a group.
-- Idempotent — safe to re-run.

-- ---- profiles: username + admin flag ----
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- ---- groups: denormalised creator name so members can see who owns it ----
alter table public.groups add column if not exists owner_name text;

-- Populate username / display_name from the signup metadata.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare uname text;
begin
  uname := coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), split_part(new.email, '@', 1));
  insert into public.profiles (id, username, display_name)
  values (new.id, uname, coalesce(new.raw_user_meta_data ->> 'full_name', uname));
  return new;
end;
$$;

-- Backfill existing rows (username from email local-part; group owner_name).
update public.profiles p
  set username = split_part(u.email, '@', 1)
  from auth.users u
  where u.id = p.id and (p.username is null or p.username = '');

update public.groups g
  set owner_name = p.username
  from public.profiles p
  where p.id = g.owner_id and (g.owner_name is null or g.owner_name = '');

-- ---- admin role ----
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

drop policy if exists "proposals: admin read"   on public.proposals;
drop policy if exists "proposals: admin update" on public.proposals;
create policy "proposals: admin read"   on public.proposals for select using (public.is_admin());
create policy "proposals: admin update" on public.proposals for update using (public.is_admin());

drop policy if exists "reports: admin read"   on public.reports;
drop policy if exists "reports: admin update" on public.reports;
create policy "reports: admin read"   on public.reports for select using (public.is_admin());
create policy "reports: admin update" on public.reports for update using (public.is_admin());

-- ---- recommendation deletion: only the group's creator (= the recommender) ----
drop policy if exists "recs: delete own" on public.recommendations;
drop policy if exists "recs: delete by group owner" on public.recommendations;
create policy "recs: delete by group owner" on public.recommendations
  for delete using (public.is_group_owner(group_id));

-- ---- let a member leave a group (delete their own membership row) ----
drop policy if exists "members: self leave" on public.group_members;
create policy "members: self leave" on public.group_members
  for delete using (member_email = auth.jwt() ->> 'email');

-- To make yourself an admin, run (with your address):
--   update public.profiles set is_admin = true
--   where id = (select id from auth.users where email = 'you@example.com');
