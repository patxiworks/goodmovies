-- GoodMovies · per-user "watched" tracking. Idempotent.

create table if not exists public.watched (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id bigint not null,        -- the sheet's ID
  watched_on date,                 -- optional
  comments text,                   -- optional
  created_at timestamptz not null default now(),
  unique (user_id, movie_id)
);
alter table public.watched enable row level security;

drop policy if exists "watched: manage own" on public.watched;
create policy "watched: manage own" on public.watched
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
