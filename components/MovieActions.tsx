"use client";

import Link from "next/link";

/**
 * Member actions on a movie: Report and Recommend.
 * For anonymous users these prompt sign-in. The forms themselves live in the
 * members area (scaffolded now, wired up in a follow-up).
 */
export function MovieActions({
  movieId,
  title,
  isAuthed
}: {
  movieId: number;
  title: string;
  isAuthed: boolean;
}) {
  if (!isAuthed) {
    return (
      <div className="mt-8 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>{" "}
        to recommend this movie to your groups or report a problem.
      </div>
    );
  }

  const q = `?movie=${movieId}&title=${encodeURIComponent(title)}`;
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link
        href={`/dashboard/recommend${q}`}
        className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
      >
        Recommend to a group
      </Link>
      <Link
        href={`/dashboard/report${q}`}
        className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
      >
        Report a problem
      </Link>
    </div>
  );
}
