"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function ReportForm({ movieId, title }: { movieId: number | null; title: string }) {
  const [reason, setReason] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  if (movieId == null) {
    return (
      <div className="mt-6 rounded-md border border-neutral-200 p-4 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
        Open a movie and choose <strong>Report a problem</strong> to start a report.{" "}
        <Link href="/" className="text-brand hover:underline">
          Browse movies
        </Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (reason.trim().length < 5) return setError("Please describe the problem (a few words).");

    setState("saving");
    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setState("idle");
      return setError("Your session expired — please sign in again.");
    }

    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      movie_id: movieId,
      movie_title: title,
      reason: reason.trim()
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
        Thanks — your report was submitted.{" "}
        <Link href="/" className="underline">
          Back to browse
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <p className="rounded-md bg-neutral-100 px-3 py-2 text-sm dark:bg-neutral-800">
        Reporting: <strong>{title || `movie #${movieId}`}</strong>
      </p>
      <div>
        <label className="mb-1 block text-sm font-medium">What's the problem?</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          placeholder="Describe why this movie is inappropriate or problematic…"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={state === "saving"}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
      >
        {state === "saving" ? "Submitting…" : "Submit report"}
      </button>
    </form>
  );
}
