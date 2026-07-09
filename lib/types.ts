/** A movie record as returned by the Apps Script JSON web app (Json.gs). */
export interface Movie {
  ID: number;
  Title: string;
  Year?: number;
  Type?: string;
  Status?: string;
  Subtitled?: boolean;
  Origin?: string;
  Season_Info?: string;
  Cast?: string;
  IMDb?: number;
  RT_Critics?: number;
  RT_Audience?: number;
  Runtime_Min?: number;
  Runtime?: string;
  Genres?: string[];
  Primary_Genre?: string;
  Edited?: boolean;
  Synopsis?: string;
}

export interface MoviesResponse {
  generatedAt?: string;
  count?: number;
  total?: number;
  movies: Movie[];
}

/** Facets derived from the dataset, used to populate filter controls. */
export interface Facets {
  types: string[];
  genres: string[];
  origins: string[];
  yearMin: number;
  yearMax: number;
  maxId: number;
}

export interface Filters {
  search: string;
  type: string;
  genres: string[];
  yearMin: number | null;
  yearMax: number | null;
  imdbMin: number;
  rtMin: number;
  availableOnly: boolean;
  subtitledOnly: boolean;
  sort: SortKey;
}

export type SortKey = "newest" | "imdb" | "year" | "title";
