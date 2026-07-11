-- GoodMovies · store each user's email on their profile so admins can see it
-- in the Review queue (auth.users isn't readable via the client). Idempotent.

alter table public.profiles add column if not exists email text;

-- Include email when creating the profile on sign-up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare uname text;
begin
  uname := coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), split_part(new.email, '@', 1));
  insert into public.profiles (id, username, display_name, email)
  values (new.id, uname, coalesce(new.raw_user_meta_data ->> 'full_name', uname), new.email);
  return new;
end;
$$;

-- Backfill existing profiles.
update public.profiles p set email = u.email
  from auth.users u
  where u.id = p.id and (p.email is null or p.email = '');
