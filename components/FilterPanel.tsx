"use client";

import { type Facets, type Filters, BOUNDS } from "@/lib/types";
import { DualRange } from "./DualRange";

export function FilterPanel({
  facets,
  filters,
  onChange
}: {
  facets: Facets;
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
}) {
  // Year slider bounds: oldest year in the data → current year.
  const yearMinBound = facets.yearMin;
  const yearMaxBound = Math.max(facets.yearMax, new Date().getFullYear());
  const yearLow = filters.yearMin ?? yearMinBound;
  const yearHigh = filters.yearMax ?? yearMaxBound;

  function toggleGenre(g: string) {
    const has = filters.genres.includes(g);
    onChange({ genres: has ? filters.genres.filter((x) => x !== g) : [...filters.genres, g] });
  }

  function reset() {
    onChange({
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
      subtitledOnly: false
    });
  }

  return (
    <aside className="space-y-5 text-sm">
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
        <label className="mb-1 flex justify-between font-medium">
          <span>Year</span>
          <span className="text-brand">
            {yearLow} – {yearHigh}
          </span>
        </label>
        <DualRange
          min={yearMinBound}
          max={yearMaxBound}
          step={1}
          low={yearLow}
          high={yearHigh}
          onChange={(lo, hi) =>
            onChange({
              yearMin: lo <= yearMinBound ? null : lo,
              yearMax: hi >= yearMaxBound ? null : hi
            })
          }
        />
      </div>

      <div>
        <label className="mb-1 flex justify-between font-medium">
          <span>IMDb</span>
          <span className="text-brand">
            {filters.imdbMin.toFixed(1)} – {filters.imdbMax.toFixed(1)}
          </span>
        </label>
        <DualRange
          min={BOUNDS.imdb.min}
          max={BOUNDS.imdb.max}
          step={BOUNDS.imdb.step}
          low={filters.imdbMin}
          high={filters.imdbMax}
          onChange={(lo, hi) => onChange({ imdbMin: lo, imdbMax: hi })}
        />
      </div>

      <div>
        <span className="mb-1 block font-medium">Rotten Tomatoes</span>
        <div className="space-y-4">
          <div>
            <label className="mb-1 flex justify-between text-xs text-neutral-500">
              <span>Critics</span>
              <span className="text-brand">
                {filters.rtCriticsMin}% – {filters.rtCriticsMax}%
              </span>
            </label>
            <DualRange
              min={BOUNDS.rt.min}
              max={BOUNDS.rt.max}
              step={BOUNDS.rt.step}
              low={filters.rtCriticsMin}
              high={filters.rtCriticsMax}
              onChange={(lo, hi) => onChange({ rtCriticsMin: lo, rtCriticsMax: hi })}
            />
          </div>
          <div>
            <label className="mb-1 flex justify-between text-xs text-neutral-500">
              <span>Audience</span>
              <span className="text-brand">
                {filters.rtAudienceMin}% – {filters.rtAudienceMax}%
              </span>
            </label>
            <DualRange
              min={BOUNDS.rt.min}
              max={BOUNDS.rt.max}
              step={BOUNDS.rt.step}
              low={filters.rtAudienceMin}
              high={filters.rtAudienceMax}
              onChange={(lo, hi) => onChange({ rtAudienceMin: lo, rtAudienceMax: hi })}
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
