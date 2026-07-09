-- GoodMovies · store the recommender's display name on each recommendation.
-- This lets the "shared with me" feed show who recommended a movie without
-- needing to read other users' profiles (profiles are self-read only).

alter table public.recommendations
  add column if not exists recommender_name text;
