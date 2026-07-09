import Link from "next/link";
import type { Movie } from "@/lib/types";

/** Deterministic pastel gradient from the title, so cards look varied. */
function gradient(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return `linear-gradient(135deg, hsl(${h} 55% 45%), hsl(${(h + 40) % 360} 55% 30%))`;
}

export function MovieCard({ movie, isNew }: { movie: Movie; isNew?: boolean }) {
  const initials = (movie.Title ?? "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Link
      href={`/movie/${movie.ID}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div
        className="relative flex aspect-[3/4] items-center justify-center"
        style={{ background: gradient(movie.Title ?? "") }}
      >
        <span className="select-none text-4xl font-black text-white/85">{initials}</span>
        {isNew && (
          <span className="absolute left-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
            New
          </span>
        )}
        {movie.Type && movie.Type !== "Movie" && (
          <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white">
            {movie.Type}
          </span>
        )}
        {movie.IMDb != null && (
          <span className="absolute bottom-2 right-2 rounded-md bg-yellow-400 px-1.5 py-0.5 text-[11px] font-bold text-black">
            ★ {movie.IMDb.toFixed(1)}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-brand">
          {movie.Title}
        </h3>
        <div className="mt-auto flex items-center gap-2 text-xs text-neutral-500">
          {movie.Year && <span>{movie.Year}</span>}
          {movie.Runtime && <span>· {movie.Runtime}</span>}
        </div>
        {movie.Primary_Genre && (
          <span className="text-[11px] text-neutral-400">{movie.Primary_Genre}</span>
        )}
      </div>
    </Link>
  );
}
