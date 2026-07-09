"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type Movie,
  type Facets,
  type Filters,
  type SortField,
  SORT_LABELS
} from "@/lib/types";
import { MovieCard } from "./MovieCard";
import { MovieListItem } from "./MovieListItem";
import { FilterPanel } from "./FilterPanel";

const PAGE = 60;
type View = "list" | "cards";

function sortVal(m: Movie, field: SortField): number | null {
  switch (field) {
    case "added":
      return m.ID ?? null;
    case "year":
      return m.Year ?? null;
    case "imdb":
      return m.IMDb ?? null;
    case "duration":
      return m.Runtime_Min ?? null;
    default:
      return null;
  }
}

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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    type: "",
    genres: [],
    yearMin: null,
    yearMax: null,
    imdbMin: 0,
    rtCriticsMin: 0,
    rtAudienceMin: 0,
    availableOnly: true,
    subtitledOnly: false,
    sortField: "added",
    sortDir: "desc"
  });

  // Lock background scroll while the filter drawer is open.
  useEffect(() => {
    document.body.style.overflow = filtersOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [filtersOpen]);

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
      if (filters.rtCriticsMin > 0 && (m.RT_Critics ?? -1) < filters.rtCriticsMin) return false;
      if (filters.rtAudienceMin > 0 && (m.RT_Audience ?? -1) < filters.rtAudienceMin) return false;
      if (q) {
        const hay = `${m.Title ?? ""} ${m.Cast ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const dir = filters.sortDir === "asc" ? 1 : -1;
    result.sort((a, b) => {
      if (filters.sortField === "title") {
        return dir * (a.Title ?? "").localeCompare(b.Title ?? "");
      }
      const av = sortVal(a, filters.sortField);
      const bv = sortVal(b, filters.sortField);
      if (av == null && bv == null) return 0;
      if (av == null) return 1; // missing values always sort last
      if (bv == null) return -1;
      return dir * (av - bv);
    });
    return result;
  }, [movies, filters]);

  const shown = filtered.slice(0, visible);

  function update(patch: Partial<Filters>) {
    setFilters((f) => ({ ...f, ...patch }));
    setVisible(PAGE);
  }

  const activeCount = [
    filters.search.trim() !== "",
    filters.type !== "",
    filters.genres.length > 0,
    filters.yearMin != null,
    filters.yearMax != null,
    filters.imdbMin > 0,
    filters.rtCriticsMin > 0,
    filters.rtAudienceMin > 0,
    filters.subtitledOnly,
    !filters.availableOnly
  ].filter(Boolean).length;

  return (
    <div>
      {/* Controls */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-neutral-500">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <span aria-hidden>☰</span> Filters
            {activeCount > 0 && (
              <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </button>
          <span>{filtered.length.toLocaleString()} result(s)</span>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex overflow-hidden rounded-md border border-neutral-300 dark:border-neutral-700">
            <button
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              className={`px-2.5 py-1 text-xs ${
                view === "list" ? "bg-brand text-white" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView("cards")}
              aria-pressed={view === "cards"}
              className={`px-2.5 py-1 text-xs ${
                view === "cards" ? "bg-brand text-white" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              Cards
            </button>
          </div>

          {/* Sort field + direction */}
          <label className="flex items-center gap-2">
            Sort
            <select
              value={filters.sortField}
              onChange={(e) => update({ sortField: e.target.value as SortField })}
              className="rounded-md border border-neutral-300 bg-transparent px-2 py-1 dark:border-neutral-700"
            >
              {(Object.keys(SORT_LABELS) as SortField[]).map((f) => (
                <option key={f} value={f}>
                  {SORT_LABELS[f]}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => update({ sortDir: filters.sortDir === "asc" ? "desc" : "asc" })}
            title={filters.sortDir === "asc" ? "Ascending" : "Descending"}
            aria-label={`Sort ${filters.sortDir === "asc" ? "ascending" : "descending"}`}
            className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            {filters.sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
        </div>
      </div>

      {/* Results */}
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

      {/* Filter drawer (slides in from the left; locks the list behind it) */}
      <div
        className={`fixed inset-0 z-40 ${filtersOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!filtersOpen}
      >
        <div
          onClick={() => setFiltersOpen(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
            filtersOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-y-0 left-0 flex w-80 max-w-[85%] transform flex-col bg-neutral-50 shadow-xl transition-transform duration-200 dark:bg-neutral-950 ${
            filtersOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <h2 className="font-semibold">Filters</h2>
            <button
              onClick={() => setFiltersOpen(false)}
              className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
              aria-label="Close filters"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <FilterPanel facets={facets} filters={filters} onChange={update} />
          </div>
          <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
            <button
              onClick={() => setFiltersOpen(false)}
              className="w-full rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Show {filtered.length.toLocaleString()} result(s)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
