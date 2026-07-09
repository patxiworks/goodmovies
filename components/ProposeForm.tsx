"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const IMDB_RE = /^https?:\/\/(www\.)?imdb\.com\/title\/tt\d+\/?/i;

export function ProposeForm() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("Please enter a title.");
    if (!IMDB_RE.test(url.trim()))
      return setError("Enter a valid IMDb title URL, e.g. https://www.imdb.com/title/tt1234567/");

    setState("saving");
    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setState("idle");
      return setError("Your session expired — please sign in again.");
    }

    const { error } = await supabase
      .from("proposals")
      .insert({ proposer_id: user.id, title: title.trim(), imdb_url: url.trim() });

    if (error) {
      setState("idle");
      setError(error.message);
    } else {
      setState("done");
      setTitle("");
      setUrl("");
    }
  }

  if (state === "done") {
    return (
      <div className="mt-6 rounded-md bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
        Thanks! Your proposal was submitted for review.{" "}
        <button className="underline" onClick={() => setState("idle")}>
          Propose another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          placeholder="e.g. The Truce"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">IMDB URL</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          placeholder="https://www.imdb.com/title/tt…/"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={state === "saving"}
        className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {state === "saving" ? "Submitting…" : "Submit proposal"}
      </button>
    </form>
  );
}
