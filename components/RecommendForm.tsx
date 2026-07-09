"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { displayName } from "@/lib/user";
import type { Group } from "@/lib/types";

export function RecommendForm({ movieId, title }: { movieId: number | null; title: string }) {
  const supabase = createClient();
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState("");
  const [rating, setRating] = useState(8);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return setLoading(false);
      const { data } = await supabase
        .from("groups")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at");
      const g = (data ?? []) as Group[];
      setGroups(g);
      if (g.length) setGroupId(g[0].id);
      setLoading(false);
    })();
  }, [supabase]);

  if (movieId == null) {
    return (
      <div className="mt-6 rounded-md border border-neutral-200 p-4 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
        Open a movie and choose <strong>Recommend to a group</strong> to start.{" "}
        <Link href="/" className="text-brand hover:underline">
          Browse movies
        </Link>
      </div>
    );
  }

  if (loading) return <p className="mt-6 text-sm text-neutral-500">Loading your groups…</p>;

  if (groups.length === 0) {
    return (
      <div className="mt-6 rounded-md border border-dashed border-neutral-300 p-6 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
        You need a group first. {" "}
        <Link href="/groups" className="text-brand hover:underline">
          Create a group →
        </Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!groupId) return setError("Choose a group.");
    if (rating < 1 || rating > 10) return setError("Rating must be 1–10.");

    setState("saving");
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setState("idle");
      return setError("Your session expired — please sign in again.");
    }

    const { error } = await supabase.from("recommendations").insert({
      recommender_id: user.id,
      recommender_name: displayName(user),
      group_id: groupId,
      movie_id: movieId,
      movie_title: title,
      rating,
      reason: reason.trim() || null
    });

    if (error) {
      setState("idle");
      setError(error.message);
    } else {
      setState("done");
    }
  }

  if (state === "done") {
    return (
      <div className="mt-6 rounded-md bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
        Recommended! Your group can see it now.{" "}
        <Link href="/dashboard" className="underline">
          Back to members area
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <p className="rounded-md bg-neutral-100 px-3 py-2 text-sm dark:bg-neutral-800">
        Recommending: <strong>{title || `movie #${movieId}`}</strong>
      </p>

      <div>
        <label className="mb-1 block text-sm font-medium">To group</label>
        <select
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          className="w-full rounded-md border border-neutral-300 bg-transparent px-2 py-2 text-sm dark:border-neutral-700"
        >
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 flex justify-between text-sm font-medium">
          <span>Your rating</span>
          <span className="text-brand">{rating}/10</span>
        </label>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Why do you recommend it?</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          placeholder="A short reason…"
        />
      </div>

      <button
        type="submit"
        disabled={state === "saving"}
        className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {state === "saving" ? "Sharing…" : "Share recommendation"}
      </button>
    </form>
  );
}
