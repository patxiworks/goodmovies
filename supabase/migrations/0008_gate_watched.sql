-- GoodMovies · require approval to mark movies watched (reading/removing your
-- own existing rows stays allowed). Idempotent.

drop policy if exists "watched: manage own" on public.watched;
create policy "watched: manage own" on public.watched
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and public.is_approved());
