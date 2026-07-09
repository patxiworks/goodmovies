"use client";

import { useMemo, useState } from "react";
import type { Movie, Facets, Filters } from "@/lib/types";
import { MovieCard } from "./MovieCard";
import { MovieListItem } from "./MovieListItem";
import { FilterPanel } from "./FilterPanel";

const PAGE = 60;
type View = "list" | "cards";

export function Gallery({
  movies,
  facets,
  newIds
}: {
  movies: Movie[];
  facets: Facets;
  newIds: number[];
}) {
  const newIdSet = useMemo(() => new Set(newIds), [newIds]);
  const [visible, setVisible] = useState(PAGE);
  const [view, setView] = useState<View>("list");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    type: "",
    genres: [],
    yearMin: null,
    yearMax: null,
    imdbMin: 0,
    rtMin: 0,
    availableOnly: true,
    subtitledOnly: false,
    sort: "newest"
  });

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const result = movies.filter((m) => {
      if (filters.availableOnly && m.Status && m.Status.toLowerCase() !== "available")
        return false;
      if (filters.subtitledOnly && !m.Subtitled) return false;
      if (filters.type && m.Type !== filters.type) return false;
      if (filters.genres.length && !filters.genres.every((g) => (m.Genres ?? []).includes(g)))
        return false;
      if (filters.yearMin != null && (m.Year ?? -Infinity) < filters.yearMin) return false;
      if (filters.yearMax != null && (m.Year ?? Infinity) > filters.yearMax) return false;
      if (filters.imdbMin > 0 && (m.IMDb ?? -1) < filters.imdbMin) return false;
      if (
        filters.rtMin > 0 &&
        Math.max(m.RT_Critics ?? -1, m.RT_Audience ?? -1) < filters.rtMin
      )
        return false;
      if (q) {
        const hay = `${m.Title ?? ""} ${m.Cast ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    switch (filters.sort) {
      case "imdb":
        result.sort((a, b) => (b.IMDb ?? -1) - (a.IMDb ?? -1));
        break;
      case "year":
        result.sort((a, b) => (b.Year ?? -1) - (a.Year ?? -1));
        break;
      case "title":
        result.sort((a, b) => (a.Title ?? "").localeCompare(b.Title ?? ""));
        break;
      default:
        result.sort((a, b) => (b.ID ?? 0) - (a.ID ?? 0));
    }
    return result;
  }, [movies, filters]);

  const shown = filtered.slice(0, visible);

  function update(patch: Partial<Filters>) {
    setFilters((f) => ({ ...f, ...patch }));
    setVisible(PAGE);
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Filters: drawer on mobile, sidebar on desktop */}
      <div className="lg:w-72 lg:flex-none">
        <button
          onClick={() => setMobileFiltersOpen((o) => !o)}
          className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium lg:hidden dark:border-neutral-700"
        >
          {mobileFiltersOpen ? "Hide filters" : "Show filters"}
        </button>
        <div className={`${mobileFiltersOpen ? "block" : "hidden"} lg:block`}>
          <FilterPanel facets={facets} filters={filters} onChange={update} />
        </div>
      </div>

      {/* Results */}
      <div className="min-w-0 flex-1">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-neutral-500">
          <span>{filtered.length.toLocaleString()} result(s)</span>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex overflow-hidden rounded-md border border-neutral-300 dark:border-neutral-700">
              <button
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
                className={`px-2.5 py-1 text-xs ${
                  view === "list"
                    ? "bg-brand text-white"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                List
              </button>
              <button
                onClick={() => setView("cards")}
                aria-pressed={view === "cards"}
                className={`px-2.5 py-1 text-xs ${
                  view === "cards"
                    ? "bg-brand text-white"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                Cards
              </button>
            </div>
            <label className="flex items-center gap-2">
              Sort
              <select
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value as Filters["sort"] })}
                className="rounded-md border border-neutral-300 bg-transparent px-2 py-1 dark:border-neutral-700"
              >
                <option value="newest">Newest</option>
                <option value="imdb">IMDb rating</option>
                <option value="year">Year</option>
                <option value="title">Title A–Z</option>
              </select>
            </label>
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500 dark:border-neutral-700">
            No movies match your filters.
          </p>
        ) : view === "cards" ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {shown.map((m) => (
              <MovieCard key={m.ID} movie={m} isNew={newIdSet.has(m.ID)} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800">
            <div className="divide-y divide-neutral-200 px-4 dark:divide-neutral-800">
              {shown.map((m) => (
                <MovieListItem key={m.ID} movie={m} isNew={newIdSet.has(m.ID)} />
              ))}
            </div>
          </div>
        )}

        {visible < filtered.length && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setVisible((v) => v + PAGE)}
              className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
