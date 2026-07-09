// Normalised Supabase connection values.
// Trailing slashes / stray whitespace in NEXT_PUBLIC_SUPABASE_URL produce a
// "double slash" path that Supabase rejects with "Invalid path specified in
// request URL", so we trim them defensively here.
export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
  .trim()
  .replace(/\/+$/, "");

export const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

export const SUPABASE_CONFIGURED = SUPABASE_URL !== "" && SUPABASE_ANON_KEY !== "";
