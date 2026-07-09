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

/* ---- Members' data (Supabase) ---- */

export interface Group {
  id: string;
  owner_id: string;
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
