import Link from "next/link";
import { notFound } from "next/navigation";
import { getMovies } from "@/lib/movies";
import { synopsisOf } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { MovieActions } from "@/components/MovieActions";

export default async function MoviePage({ params }: { params: { id: string } }) {
  const movies = await getMovies();
  const movie = movies.find((m) => String(m.ID) === params.id);
  if (!movie) notFound();

  let isAuthed = false;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      isAuthed = Boolean(user);
    } catch {
      isAuthed = false;
    }
  }

  const rt = [movie.RT_Critics, movie.RT_Audience].filter((x) => x != null);

  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/" className="text-sm text-neutral-500 hover:text-brand">
        ← Back to all movies
      </Link>

      <div className="mt-4 flex flex-col gap-6 sm:flex-row">
        {movie.Poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={movie.Poster}
            alt={`${movie.Title} poster`}
            loading="lazy"
            className="mx-auto w-44 shrink-0 self-start rounded-lg shadow sm:mx-0"
          />
        )}
        <div className="min-w-0 flex-1">
          <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{movie.Title}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {[movie.Year, movie.Type, movie.Runtime, movie.Origin]
              .filter(Boolean)
              .join(" · ")}
            {movie.Season_Info ? ` · ${movie.Season_Info}` : ""}
            {movie.Subtitled ? " · Subtitled" : ""}
          </p>
        </div>
        {movie.Status && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              movie.Status.toLowerCase() === "available"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
            }`}
          >
            {movie.Status}
          </span>
        )}
      </header>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {movie.IMDb != null && (
          <span className="rounded-md bg-yellow-400 px-2 py-1 font-semibold text-black">
            IMDb ★ {movie.IMDb.toFixed(1)}
          </span>
        )}
        {rt.length > 0 && (
          <span className="rounded-md bg-red-100 px-2 py-1 font-medium text-red-800 dark:bg-red-950 dark:text-red-300">
            🍅 {movie.RT_Critics ?? "–"}
            {movie.RT_Audience != null ? ` / ${movie.RT_Audience}` : ""}
          </span>
        )}
      </div>

      {movie.Genres && movie.Genres.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {movie.Genres.map((g) => (
            <span
              key={g}
              className="rounded-full border border-neutral-300 px-2.5 py-0.5 text-xs dark:border-neutral-700"
            >
              {g}
            </span>
          ))}
        </div>
      )}

      {movie.Cast && (
        <p className="mt-4 text-sm">
          <span className="font-medium">Cast:</span> {movie.Cast}
        </p>
      )}

      {(() => {
        const synopsis = synopsisOf(movie);
        return synopsis ? (
          <section className="mt-5 mb-6">
            <h2
              aria-hidden
              className="mb-1 text-sm font-semibold uppercase tracking-wide text-neutral-500 opacity-0"
            >
              Synopsis
            </h2>
            <p className="leading-relaxed text-neutral-700 dark:text-neutral-300">{synopsis}</p>
          </section>
        ) : null;
      })()}

          <MovieActions movieId={movie.ID} title={movie.Title} isAuthed={isAuthed} />
        </div>
      </div>
    </article>
  );
}
