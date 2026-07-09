-- GoodMovies · proposer/reporter usernames for the admin queue, and a
-- "last seen" marker for the Shared unread badge. Idempotent.

-- Denormalised submitter usernames so admins see who proposed/reported.
alter table public.proposals add column if not exists proposer_name text;
alter table public.reports    add column if not exists reporter_name text;

update public.proposals p set proposer_name = pr.username
  from public.profiles pr
  where pr.id = p.proposer_id and (p.proposer_name is null or p.proposer_name = '');

update public.reports r set reporter_name = pr.username
  from public.profiles pr
  where pr.id = r.reporter_id and (r.reporter_name is null or r.reporter_name = '');

-- When the user last viewed their Shared page (drives the unread badge).
alter table public.profiles
  add column if not exists shared_last_seen timestamptz not null default now();
