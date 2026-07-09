# GoodMovies

A web app for browsing the Movie Data catalogue and — for signed-in members —
proposing films, reporting problems, and recommending movies to private groups.

- **Public section** (no login): browse every available movie, newest first,
  with rich filtering (year, type, genre, IMDb, Rotten Tomatoes, subtitled) and
  search by title or actor. Fully responsive.
- **Members section** (auth wall): everything above, plus propose films, report
  movies, and recommend movies to groups you create.

## Tech stack
- **Next.js 14** (App Router, TypeScript) + **Tailwind CSS**
- **Supabase** — Auth (magic link + Google) and Postgres with Row-Level Security
- Movies come from the **Apps Script JSON web app** (`Json.gs`) over the Google
  Sheet. This app never writes to the sheet — curated data stays curated.

## Architecture
```
Google Sheet ──▶ Apps Script JSON (Json.gs) ──▶  Public gallery  (read)
                                                        │
Members' data (accounts, groups, proposals,            ▼
reports, recommendations) ─────────────────▶  Supabase (Postgres + Auth + RLS)
```

## Data model (Supabase)
See `supabase/migrations/0001_init.sql`.

| Table | Purpose | Visibility (RLS) |
|---|---|---|
| `profiles` | one row per user | self |
| `groups` | user's groups (**max 5**) | owner + members |
| `group_members` | invited members (by email) | owner + the invitee |
| `proposals` | proposed films (title + IMDB URL) | proposer |
| `reports` | flagged movies (movie id + reason) | reporter |
| `recommendations` | rating 1–10 + reason, to a group | group owner + members |

## Setup

### 1. Movies JSON
Deploy `Json.gs` (from the Movie Data Apps Script project) as a **Web app** and
copy its `…/exec` URL.

### 2. Supabase
1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor** → run each file in `supabase/migrations/` in order
   (`0001_init.sql`, then `0002_recommendation_author.sql`).
3. **Authentication → Providers**: enable **Email** (magic link). Optionally
   enable **Google** and add your OAuth credentials.
4. **Authentication → URL Configuration**: add your site URL and
   `…/auth/callback` to the redirect allow-list.
5. **Project Settings → API**: copy the Project URL and the `anon` public key.

### 3. Environment
```bash
cp .env.example .env.local
# then fill in:
#   MOVIES_JSON_URL, NEXT_PUBLIC_SUPABASE_URL,
#   NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SITE_URL
```

### 4. Run
```bash
npm install
npm run dev        # http://localhost:3000
```

## Deploy (Vercel)
1. Push this repo to GitHub (already done if you're reading it there).
2. Import the repo in [Vercel](https://vercel.com).
3. Add the same env vars in **Project → Settings → Environment Variables**
   (set `NEXT_PUBLIC_SITE_URL` to the production URL).
4. Deploy, then add the production `…/auth/callback` URL to Supabase's redirect
   allow-list.

## Project structure
```
app/
  page.tsx                 Public gallery (server) → components/Gallery
  movie/[id]/page.tsx      Movie detail + member actions
  login/page.tsx           Magic-link / Google sign-in
  auth/callback/route.ts   OAuth/magic-link code exchange
  dashboard/               Members area (propose, report, recommend)
  groups/                  Groups (scaffold)
components/                 Gallery, FilterPanel, MovieCard, forms, …
lib/
  movies.ts                JSON fetch + facets
  types.ts                 Shared types
  supabase/                Browser/server clients + session middleware
supabase/migrations/       SQL schema + RLS policies
```

## Status / roadmap
- [x] Public gallery: fetch, sort (newest-first), filter, search, responsive, "New" badges
- [x] Auth (magic link + Google), protected members routes
- [x] Propose a film (working) · Report a movie (working)
- [x] Full DB schema + RLS for groups & recommendations
- [x] Groups UI: create (max 5) / invite by email / manage / delete
- [x] Recommend flow wired to groups (rating 1–10 + reason)
- [x] Members' "shared with me" recommendations feed
- [ ] Curator/admin views for proposals & reports
- [ ] Membership accept flow + email notifications
