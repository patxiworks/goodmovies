import type { Movie, MoviesResponse, Facets } from "./types";

const MOVIES_JSON_URL = process.env.MOVIES_JSON_URL;

/**
 * Fetch all movies from the Apps Script JSON web app.
 * Cached/revalidated by Next.js so we don't hammer the endpoint.
 * Returns [] (and logs) if the URL is unset or the request fails, so the UI
 * can render a friendly "not configured" state instead of crashing.
 */
export async function getMovies(): Promise<Movie[]> {
  if (!MOVIES_JSON_URL) return [];
  try {
    const res = await fetch(MOVIES_JSON_URL, {
      next: { revalidate: 300 } // refresh at most every 5 minutes
    });
    if (!res.ok) {
      console.error(`Movies fetch failed: ${res.status}`);
      return [];
    }
    const data: MoviesResponse | Movie[] = await res.json();
    const movies = Array.isArray(data) ? data : data.movies ?? [];
    // Newest first by ID.
    return movies.slice().sort((a, b) => (b.ID ?? 0) - (a.ID ?? 0));
  } catch (err) {
    console.error("Movies fetch error:", err);
    return [];
  }
}

export function isConfigured(): boolean {
  return Boolean(MOVIES_JSON_URL);
}

/** How many of the newest IDs get the "New" badge. */
export const NEW_COUNT = 12;

/** Derive filter facets from the dataset. */
export function computeFacets(movies: Movie[]): Facets {
  const types = new Set<string>();
  const genres = new Set<string>();
  const origins = new Set<string>();
  let yearMin = Infinity;
  let yearMax = -Infinity;
  let maxId = 0;

  for (const m of movies) {
    if (m.Type) types.add(m.Type);
    (m.Genres ?? []).forEach((g) => genres.add(g));
    if (m.Origin) origins.add(m.Origin);
    if (typeof m.Year === "number") {
      yearMin = Math.min(yearMin, m.Year);
      yearMax = Math.max(yearMax, m.Year);
    }
    if (typeof m.ID === "number") maxId = Math.max(maxId, m.ID);
  }

  const sortStr = (a: string, b: string) => a.localeCompare(b);
  return {
    types: Array.from(types).sort(sortStr),
    genres: Array.from(genres).sort(sortStr),
    origins: Array.from(origins).sort(sortStr),
    yearMin: Number.isFinite(yearMin) ? yearMin : 1900,
    yearMax: Number.isFinite(yearMax) ? yearMax : new Date().getFullYear(),
    maxId
  };
}
