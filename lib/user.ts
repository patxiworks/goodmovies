import type { User } from "@supabase/supabase-js";

/**
 * Human-facing name for a user: their chosen username, then any full name,
 * falling back to the local-part of their email. Reads from user_metadata so
 * no extra query is needed.
 */
export function displayName(user: User | null | undefined): string {
  if (!user) return "member";
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const username = typeof meta.username === "string" ? meta.username : "";
  const full = typeof meta.full_name === "string" ? meta.full_name : "";
  if (username) return username;
  if (full) return full;
  return user.email ? user.email.split("@")[0] : "member";
}
