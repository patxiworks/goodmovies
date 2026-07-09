"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Recommendation } from "@/lib/types";

export function RecommendationsFeed() {
  const supabase = createClient();
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      // RLS returns only recommendations for groups you own or belong to.
      const { data } = await supabase
        .from("recommendations")
        .select("*, groups(name)")
        .order("created_at", { ascending: false })
        .limit(100);
      setRecs((data ?? []) as Recommendation[]);
      setLoading(false);
    })();
  }, [supabase]);

  async function remove(id: string) {
    if (!confirm("Delete this recommendation for everyone in the group?")) return;
    const { error } = await supabase.from("recommendations").delete().eq("id", id);
    if (!error) setRecs((rs) => rs.filter((r) => r.id !== id));
  }

  if (loading) return <p className="text-sm text-neutral-500">Loading recommendations…</p>;

  if (recs.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
        No recommendations yet. Recommend a movie to one of your groups, or wait for a group
        member to share one.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {recs.map((r) => {
        const mine = userId != null && r.recommender_id === userId;
        return (
          <li
            key={r.id}
            className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-start justify-between gap-3">
              <Link href={`/movie/${r.movie_id}`} className="font-semibold hover:text-brand">
                {r.movie_title ?? `Movie #${r.movie_id}`}
              </Link>
              <span className="shrink-0 rounded-md bg-yellow-400 px-2 py-0.5 text-xs font-bold text-black">
                ★ {r.rating}/10
              </span>
            </div>
            {r.reason && (
              <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">{r.reason}</p>
            )}
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-xs text-neutral-400">
                {r.recommender_name ? `${r.recommender_name} · ` : ""}
                to <span className="font-medium">{r.groups?.name ?? "a group"}</span> ·{" "}
                {new Date(r.created_at).toLocaleDateString()}
              </p>
              {mine && (
                <button
                  onClick={() => remove(r.id)}
                  className="shrink-0 text-xs text-neutral-500 hover:text-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
