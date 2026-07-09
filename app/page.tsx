import { getMovies, computeFacets, isConfigured, NEW_COUNT } from "@/lib/movies";
import { Gallery } from "@/components/Gallery";

export default async function HomePage() {
  const movies = await getMovies();
  const facets = computeFacets(movies);

  // IDs that earn a "New" badge: the newest NEW_COUNT by ID.
  const newIds = new Set(
    movies
      .map((m) => m.ID)
      .sort((a, b) => b - a)
      .slice(0, NEW_COUNT)
  );

  if (!isConfigured()) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
        <h1 className="mb-2 text-base font-semibold">Almost there</h1>
        <p>
          Set <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">MOVIES_JSON_URL</code>{" "}
          to your deployed Apps Script web-app URL (from <code>Json.gs</code>), then reload.
          See the README for the full setup.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Browse movies</h1>
        <p className="text-sm text-neutral-500">
          {movies.length.toLocaleString()} titles · newest first
        </p>
      </div>
      <Gallery movies={movies} facets={facets} newIds={Array.from(newIds)} />
    </div>
  );
}
