import Link from "next/link";
import { type Movie, synopsisOf } from "@/lib/types";

/** Compact text row used by the default list view. */
export function MovieListItem({ movie, watched }: { movie: Movie; watched?: boolean }) {
  const synopsis = synopsisOf(movie);
  const meta = [movie.Year, movie.Type !== "Movie" ? movie.Type : null, movie.Runtime]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/movie/${movie.ID}`}
      className="-mx-4 flex items-start justify-between gap-4 px-4 py-3 transition odd:bg-neutral-200/70 hover:bg-neutral-100/60 dark:odd:bg-neutral-800/50 dark:hover:bg-neutral-900/60 sm:odd:bg-transparent sm:dark:odd:bg-transparent"
    >
      <div className="min-w-0">
        <h3 className="font-semibold leading-snug hover:text-brand">{movie.Title}</h3>
        {meta && <p className="mt-0.5 text-xs text-neutral-500">{meta}</p>}
        {synopsis && (
          <p className="mt-1 line-clamp-1 text-sm text-neutral-600 dark:text-neutral-400">
            {synopsis}
          </p>
        )}
      </div>
      <span className="flex shrink-0 items-center gap-1.5 pt-0.5 text-xs text-neutral-500">
        {movie.IMDb != null && <span>★ {movie.IMDb.toFixed(1)}</span>}
        {watched && (
          <span
            title="Watched"
            aria-label="Watched"
            className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-white"
          >
            ✓
          </span>
        )}
      </span>
    </Link>
  );
}
