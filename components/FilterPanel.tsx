"use client";

import type { Facets, Filters } from "@/lib/types";

export function FilterPanel({
  facets,
  filters,
  onChange
}: {
  facets: Facets;
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
}) {
  function toggleGenre(g: string) {
    const has = filters.genres.includes(g);
    onChange({ genres: has ? filters.genres.filter((x) => x !== g) : [...filters.genres, g] });
  }

  function reset() {
    onChange({
      search: "",
      type: "",
      genres: [],
      yearMin: null,
      yearMax: null,
      imdbMin: 0,
      rtCriticsMin: 0,
      rtAudienceMin: 0,
      availableOnly: true,
      subtitledOnly: false
    });
  }

  return (
    <aside className="space-y-5 text-sm">
      <div>
        <label className="mb-1 block font-medium">Search</label>
        <input
          type="search"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Title or actor…"
          className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Type</label>
        <select
          value={filters.type}
          onChange={(e) => onChange({ type: e.target.value })}
          className="w-full rounded-md border border-neutral-300 bg-transparent px-2 py-2 dark:border-neutral-700"
        >
          <option value="">All types</option>
          {facets.types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block font-medium">
          Year <span className="text-neutral-400">({facets.yearMin}–{facets.yearMax})</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="from"
            value={filters.yearMin ?? ""}
            onChange={(e) => onChange({ yearMin: e.target.value ? Number(e.target.value) : null })}
            className="w-full rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 dark:border-neutral-700"
          />
          <span className="text-neutral-400">–</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="to"
            value={filters.yearMax ?? ""}
            onChange={(e) => onChange({ yearMax: e.target.value ? Number(e.target.value) : null })}
            className="w-full rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 dark:border-neutral-700"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 flex justify-between font-medium">
          <span>IMDb ≥</span>
          <span className="text-brand">{filters.imdbMin.toFixed(1)}</span>
        </label>
        <input
          type="range"
          min={0}
          max={10}
          step={0.1}
          value={filters.imdbMin}
          onChange={(e) => onChange({ imdbMin: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <span className="mb-1 block font-medium">Rotten Tomatoes</span>
        <div className="space-y-3">
          <div>
            <label className="mb-1 flex justify-between text-xs text-neutral-500">
              <span>Critics ≥</span>
              <span className="text-brand">{filters.rtCriticsMin}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={filters.rtCriticsMin}
              onChange={(e) => onChange({ rtCriticsMin: Number(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1 flex justify-between text-xs text-neutral-500">
              <span>Audience ≥</span>
              <span className="text-brand">{filters.rtAudienceMin}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={filters.rtAudienceMin}
              onChange={(e) => onChange({ rtAudienceMin: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1 block font-medium">Genres</label>
        <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto">
          {facets.genres.map((g) => {
            const active = filters.genres.includes(g);
            return (
              <button
                key={g}
                onClick={() => toggleGenre(g)}
                className={`rounded-full border px-2.5 py-1 text-xs transition ${
                  active
                    ? "border-brand bg-brand text-white"
                    : "border-neutral-300 hover:border-brand dark:border-neutral-700"
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.availableOnly}
            onChange={(e) => onChange({ availableOnly: e.target.checked })}
          />
          Available only
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.subtitledOnly}
            onChange={(e) => onChange({ subtitledOnly: e.target.checked })}
          />
          Subtitled only
        </label>
      </div>

      <button
        onClick={reset}
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        Reset filters
      </button>
    </aside>
  );
}
