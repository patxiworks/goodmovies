"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type Movie,
  type Facets,
  type Filters,
  type SortField,
  type SearchScope,
  type WatchedFilter,
  SORT_LABELS,
  SEARCH_PLACEHOLDERS,
  WATCHED_LABELS,
  BOUNDS,
  synopsisOf
} from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { MovieCard } from "./MovieCard";
import { MovieListItem } from "./MovieListItem";
import { FilterPanel } from "./FilterPanel";

const PAGE = 60;
const STORAGE_KEY = "goodmovies.gallery.v1";
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
    case "rt_critics":
      return m.RT_Critics ?? null;
    case "rt_audience":
      return m.RT_Audience ?? null;
    default:
      return null;
  }
}

/* Inline icons keep the toggles compact and dependency-free. */
const IconList = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <line x1="2" y1="4" x2="14" y2="4" /><line x1="2" y1="8" x2="14" y2="8" /><line x1="2" y1="12" x2="14" y2="12" />
  </svg>
);
const IconCards = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" /><rect x="9" y="1.5" width="5.5" height="5.5" rx="1" />
    <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" /><rect x="9" y="9" width="5.5" height="5.5" rx="1" />
  </svg>
);
const IconArrow = ({ up }: { up: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: up ? "none" : "rotate(180deg)" }}>
    <path d="M8 13 V3 M4 7 L8 3 L12 7" />
  </svg>
);

export function Gallery({ movies, facets }: { movies: Movie[]; facets: Facets }) {
  const [visible, setVisible] = useState(PAGE);
  const [view, setView] = useState<View>("list");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [watchedSet, setWatchedSet] = useState<Set<number>>(new Set());
  const [signedIn, setSignedIn] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    searchScope: "any",
    type: "",
    genres: [],
    yearMin: null,
    yearMax: null,
    imdbMin: BOUNDS.imdb.min,
    imdbMax: BOUNDS.imdb.max,
    rtCriticsMin: BOUNDS.rt.min,
    rtCriticsMax: BOUNDS.rt.max,
    rtAudienceMin: BOUNDS.rt.min,
    rtAudienceMax: BOUNDS.rt.max,
    availableOnly: true,
    subtitledOnly: false,
    watchedFilter: "all",
    sortField: "added",
    sortDir: "desc"
  });

  // Load which movies the signed-in user has marked watched.
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    let active = true;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user }
        } = await supabase.auth.getUser();
        if (!user || !active) return;
        setSignedIn(true);
        const { data } = await supabase.from("watched").select("movie_id");
        if (active && data) setWatchedSet(new Set(data.map((r) => Number(r.movie_id))));
      } catch {
        /* not configured / offline */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = filtersOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [filtersOpen]);

  // Retain filters/view/scroll across navigation (e.g. opening a movie and
  // coming back). Stored per browser tab in sessionStorage.
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.filters) setFilters((f) => ({ ...f, ...saved.filters }));
        if (saved.view) setView(saved.view);
        if (typeof saved.visible === "number") setVisible(saved.visible);
      }
    } catch {
      /* ignore malformed state */
    }
    setRestored(true);
  }, []);
  useEffect(() => {
    if (!restored) return; // don't overwrite saved state before it's restored
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ filters, view, visible }));
    } catch {
      /* storage may be unavailable (private mode) */
    }
  }, [filters, view, visible, restored]);

  const imdbActive = filters.imdbMin > BOUNDS.imdb.min || filters.imdbMax < BOUNDS.imdb.max;
  const rtCriticsActive =
    filters.rtCriticsMin > BOUNDS.rt.min || filters.rtCriticsMax < BOUNDS.rt.max;
  const rtAudienceActive =
    filters.rtAudienceMin > BOUNDS.rt.min || filters.rtAudienceMax < BOUNDS.rt.max;

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const result = movies.filter((m) => {
      if (filters.availableOnly && m.Status && m.Status.toLowerCase() !== "available")
        return false;
      if (filters.subtitledOnly && !m.Subtitled) return false;
      if (filters.watchedFilter === "watched" && !watchedSet.has(m.ID)) return false;
      if (filters.watchedFilter === "unwatched" && watchedSet.has(m.ID)) return false;
      if (filters.type && m.Type !== filters.type) return false;
      if (filters.genres.length && !filters.genres.every((g) => (m.Genres ?? []).includes(g)))
        return false;
      if (filters.yearMin != null && (m.Year ?? -Infinity) < filters.yearMin) return false;
      if (filters.yearMax != null && (m.Year ?? Infinity) > filters.yearMax) return false;
      if (imdbActive) {
        const v = m.IMDb;
        if (v == null || v < filters.imdbMin || v > filters.imdbMax) return false;
      }
      if (rtCriticsActive) {
        const v = m.RT_Critics;
        if (v == null || v < filters.rtCriticsMin || v > filters.rtCriticsMax) return false;
      }
      if (rtAudienceActive) {
        const v = m.RT_Audience;
        if (v == null || v < filters.rtAudienceMin || v > filters.rtAudienceMax) return false;
      }
      if (q) {
        let hay: string;
        switch (filters.searchScope) {
          case "title":
            hay = m.Title ?? "";
            break;
          case "synopsis":
            hay = synopsisOf(m) ?? "";
            break;
          case "actors":
            hay = m.Cast ?? "";
            break;
          default:
            hay = `${m.Title ?? ""} ${m.Cast ?? ""} ${synopsisOf(m) ?? ""}`;
        }
        if (!hay.toLowerCase().includes(q)) return false;
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
      if (av == null) return 1;
      if (bv == null) return -1;
      return dir * (av - bv);
    });
    return result;
  }, [movies, filters, imdbActive, rtCriticsActive, rtAudienceActive, watchedSet]);

  const shown = filtered.slice(0, visible);

  function update(patch: Partial<Filters>) {
    setFilters((f) => ({ ...f, ...patch }));
    setVisible(PAGE);
  }

  const activeCount = [
    filters.type !== "",
    filters.genres.length > 0,
    filters.yearMin != null,
    filters.yearMax != null,
    imdbActive,
    rtCriticsActive,
    rtAudienceActive,
    filters.subtitledOnly,
    !filters.availableOnly
  ].filter(Boolean).length;

  function cycleWatched() {
    const order: WatchedFilter[] = ["all", "watched", "unwatched"];
    const next = order[(order.indexOf(filters.watchedFilter) + 1) % order.length];
    update({ watchedFilter: next });
  }

  return (
    <div>
      {/* Movie count + watched toggle (signed-in only) */}
      <div className="mb-4 flex flex-wrap items-center gap-x-2 text-sm text-neutral-500">
        <span>{movies.length.toLocaleString()} movies</span>
        {signedIn && (
          <>
            <span aria-hidden>·</span>
            <button onClick={cycleWatched} className="text-neutral-500 hover:underline">
              {WATCHED_LABELS[filters.watchedFilter]}
            </button>
          </>
        )}
      </div>

      {/* Prominent search with a scope selector */}
      <div className="mb-4 flex gap-2">
        <select
          value={filters.searchScope}
          onChange={(e) => update({ searchScope: e.target.value as SearchScope })}
          aria-label="Search in"
          className="shrink-0 rounded-lg border border-violet-400 bg-violet-50 px-2 text-sm text-violet-950 ring-2 ring-violet-200 focus:outline-none dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-50 dark:ring-violet-900"
        >
          <option value="any">All</option>
          <option value="title">Titles</option>
          <option value="synopsis">Synopsis</option>
          <option value="actors">Actors</option>
        </select>
        <input
          type="search"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          placeholder={SEARCH_PLACEHOLDERS[filters.searchScope]}
          className="flex-1 rounded-lg border border-violet-400 bg-violet-50 px-4 py-2.5 text-sm text-violet-950 ring-2 ring-violet-200 placeholder:text-violet-700/60 focus:bg-white focus:outline-none dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-50 dark:ring-violet-900 dark:placeholder:text-violet-300/50 dark:focus:bg-violet-950/25"
        />
      </div>

      {/* Controls (single line, even on mobile) */}
      <div className="mb-3 flex flex-nowrap items-center justify-between gap-2 text-sm text-neutral-500">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-neutral-300 px-2.5 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <span aria-hidden>☰</span>
            <span className="hidden sm:inline">Filters</span>
            {activeCount > 0 && (
              <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </button>
          <span className="truncate whitespace-nowrap">
            <span className="tabular-nums">{filtered.length.toLocaleString()}</span>
            <span className="hidden sm:inline"> result(s)</span>
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {/* View toggle (icons) */}
          <div className="flex overflow-hidden rounded-md border border-neutral-300 dark:border-neutral-700">
            <button
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              aria-label="List view"
              title="List view"
              className={`px-2 py-1.5 ${
                view === "list" ? "bg-brand text-white" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <IconList />
            </button>
            <button
              onClick={() => setView("cards")}
              aria-pressed={view === "cards"}
              aria-label="Card view"
              title="Card view"
              className={`px-2 py-1.5 ${
                view === "cards" ? "bg-brand text-white" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <IconCards />
            </button>
          </div>

          {/* Sort field + direction */}
          <select
            value={filters.sortField}
            onChange={(e) => update({ sortField: e.target.value as SortField })}
            aria-label="Sort by"
            className="rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 dark:border-neutral-700"
          >
            {(Object.keys(SORT_LABELS) as SortField[]).map((f) => (
              <option key={f} value={f}>
                {SORT_LABELS[f]}
              </option>
            ))}
          </select>
          <button
            onClick={() => update({ sortDir: filters.sortDir === "asc" ? "desc" : "asc" })}
            title={filters.sortDir === "asc" ? "Ascending" : "Descending"}
            aria-label={`Sort ${filters.sortDir === "asc" ? "ascending" : "descending"}`}
            className="rounded-md border border-neutral-300 px-2 py-1.5 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            <IconArrow up={filters.sortDir === "asc"} />
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
            <MovieCard key={m.ID} movie={m} watched={watchedSet.has(m.ID)} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800">
          <div className="divide-y divide-neutral-200 px-4 dark:divide-neutral-800">
            {shown.map((m) => (
              <MovieListItem key={m.ID} movie={m} watched={watchedSet.has(m.ID)} />
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
