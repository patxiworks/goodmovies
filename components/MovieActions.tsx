"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { RecommendForm } from "./RecommendForm";
import { ReportForm } from "./ReportForm";

interface WatchedRow {
  watched_on: string | null;
  comments: string | null;
}

type ModalKind = "watched" | "recommend" | "report" | null;

export function MovieActions({
  movieId,
  title,
  isAuthed,
  isApproved
}: {
  movieId: number;
  title: string;
  isAuthed: boolean;
  isApproved: boolean;
}) {
  const supabase = createClient();
  const [watched, setWatched] = useState<WatchedRow | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
  const [date, setDate] = useState("");
  const [comments, setComments] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isAuthed || !isApproved) return;
    (async () => {
      const { data } = await supabase
        .from("watched")
        .select("watched_on, comments")
        .eq("movie_id", movieId)
        .maybeSingle();
      if (data) {
        setWatched(data as WatchedRow);
        setDate((data as WatchedRow).watched_on ?? "");
        setComments((data as WatchedRow).comments ?? "");
      }
      setLoaded(true);
    })();
  }, [isAuthed, isApproved, movieId, supabase]);

  // Lock background scroll while any modal is open.
  useEffect(() => {
    document.body.style.overflow = modal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modal]);

  if (!isAuthed) {
    return (
      <div className="mt-8 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>{" "}
        to recommend this movie, mark it watched, or report a problem.
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
        Your account is awaiting approval. Once an admin approves you, you can recommend,
        mark movies watched and report problems.
      </div>
    );
  }

  async function saveWatched() {
    setBusy(true);
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }
    const { error } = await supabase.from("watched").upsert(
      {
        user_id: user.id,
        movie_id: movieId,
        watched_on: date || null,
        comments: comments.trim() || null
      },
      { onConflict: "user_id,movie_id" }
    );
    setBusy(false);
    if (!error) {
      setWatched({ watched_on: date || null, comments: comments.trim() || null });
      setModal(null);
    }
  }

  async function unmarkWatched() {
    setBusy(true);
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }
    await supabase.from("watched").delete().eq("user_id", user.id).eq("movie_id", movieId);
    setBusy(false);
    setWatched(null);
    setDate("");
    setComments("");
    setModal(null);
  }

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => setModal("recommend")}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          Recommend
        </button>
        <button
          onClick={() => setModal("watched")}
          disabled={!loaded}
          className={`rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60 ${
            watched
              ? "border border-emerald-400 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950"
              : "border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          }`}
        >
          {watched ? "✓ Watched" : "Mark as watched"}
        </button>
        <button
          onClick={() => setModal("report")}
          className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
        >
          <span className="sm:hidden">Report</span>
          <span className="hidden sm:inline">Report a problem</span>
        </button>
      </div>

      {modal === "recommend" && (
        <Modal title="Recommend to a group" onClose={() => setModal(null)}>
          <RecommendForm movieId={movieId} title={title} />
        </Modal>
      )}

      {modal === "report" && (
        <Modal title="Report a movie" onClose={() => setModal(null)}>
          <ReportForm movieId={movieId} title={title} />
        </Modal>
      )}

      {modal === "watched" && (
        <Modal title="Mark as watched" onClose={() => setModal(null)}>
          <p className="mt-0.5 truncate text-sm text-neutral-500">{title}</p>
          <label className="mt-4 block text-sm font-medium">
            Date watched <span className="text-neutral-400">(optional)</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          />
          <label className="mt-3 block text-sm font-medium">
            Comments <span className="text-neutral-400">(optional)</span>
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            placeholder="What did you think?"
            className="mt-1 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          />
          <div className="mt-5 flex items-center justify-between gap-2">
            {watched ? (
              <button
                onClick={unmarkWatched}
                disabled={busy}
                className="text-sm text-red-600 hover:underline disabled:opacity-60"
              >
                Unmark
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setModal(null)}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={saveWatched}
                disabled={busy}
                className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
              >
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

function Modal({
  title,
  onClose,
  children
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-xl border border-neutral-200 bg-white p-5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
