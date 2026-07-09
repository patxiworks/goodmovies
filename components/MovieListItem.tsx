import Link from "next/link";
import { type Movie, synopsisOf } from "@/lib/types";

/** Compact text row used by the default list view. */
export function MovieListItem({ movie, isNew }: { movie: Movie; isNew?: boolean }) {
  const synopsis = synopsisOf(movie);
  const meta = [movie.Year, movie.Type !== "Movie" ? movie.Type : null, movie.Runtime]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/movie/${movie.ID}`}
      className="-mx-4 flex items-start justify-between gap-4 px-4 py-3 transition hover:bg-neutral-100/60 dark:hover:bg-neutral-900/60"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold leading-snug hover:text-brand">{movie.Title}</h3>
          {isNew && (
            <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              New
            </span>
          )}
        </div>
        {meta && <p className="mt-0.5 text-xs text-neutral-500">{meta}</p>}
        {synopsis && (
          <p className="mt-1 line-clamp-1 text-sm text-neutral-600 dark:text-neutral-400">
            {synopsis}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2 pt-0.5 text-xs">
        {movie.IMDb != null && (
          <span className="rounded bg-yellow-400 px-1.5 py-0.5 font-bold text-black">
            ★ {movie.IMDb.toFixed(1)}
          </span>
        )}
      </div>
    </Link>
  );
}
