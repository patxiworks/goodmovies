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
  /** Fallback if the sheet still uses the original "COMMENTS" header. */
  COMMENTS?: string;
}

/** The movie description, tolerant of either header name. */
export function synopsisOf(m: Movie): string | undefined {
  return m.Synopsis ?? m.COMMENTS;
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

export type SearchScope = "any" | "title" | "synopsis" | "actors";

export const SEARCH_PLACEHOLDERS: Record<SearchScope, string> = {
  any: "Search title, actor or synopsis…",
  title: "Search titles…",
  synopsis: "Search synopsis…",
  actors: "Search actors…"
};

export interface Filters {
  search: string;
  searchScope: SearchScope;
  type: string;
  genres: string[];
  yearMin: number | null;
  yearMax: number | null;
  imdbMin: number;
  imdbMax: number;
  rtCriticsMin: number;
  rtCriticsMax: number;
  rtAudienceMin: number;
  rtAudienceMax: number;
  availableOnly: boolean;
  subtitledOnly: boolean;
  sortField: SortField;
  sortDir: SortDir;
}

export type SortField =
  | "added"
  | "title"
  | "year"
  | "imdb"
  | "duration"
  | "rt_critics"
  | "rt_audience";
export type SortDir = "asc" | "desc";

export const SORT_LABELS: Record<SortField, string> = {
  added: "Date added",
  title: "Title",
  year: "Year",
  imdb: "IMDb",
  duration: "Duration",
  rt_critics: "RT critics",
  rt_audience: "RT audience"
};

/** Default (unfiltered) numeric bounds. */
export const BOUNDS = {
  imdb: { min: 0, max: 10, step: 0.1 },
  rt: { min: 0, max: 100, step: 1 }
};

/* ---- Members' data (Supabase) ---- */

export interface Group {
  id: string;
  owner_id: string;
  owner_name: string | null;
  name: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  member_email: string;
  status: string;
  created_at: string;
}

/** A group joined via a membership row (owned by someone else). */
export interface MembershipWithGroup extends GroupMember {
  groups: Group | null;
}

export interface Recommendation {
  id: string;
  group_id: string;
  recommender_id: string;
  recommender_name: string | null;
  movie_id: number;
  movie_title: string | null;
  rating: number;
  reason: string | null;
  created_at: string;
  groups?: { name: string } | null;
}

export const MAX_GROUPS = 5;

export interface Proposal {
  id: string;
  title: string;
  imdb_url: string;
  status: string;
  proposer_name: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  movie_id: number;
  movie_title: string | null;
  reason: string;
  status: string;
  reporter_name: string | null;
  created_at: string;
}
