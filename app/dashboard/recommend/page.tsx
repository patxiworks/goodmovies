import Link from "next/link";

export default function RecommendPage({
  searchParams
}: {
  searchParams: { title?: string };
}) {
  return (
    <div className="mx-auto max-w-lg">
      <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-brand">
        ← Members area
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Recommend to a group</h1>
      <p className="text-sm text-neutral-500">
        {searchParams.title ? (
          <>
            You&apos;re about to recommend <strong>{searchParams.title}</strong>.{" "}
          </>
        ) : null}
        This will let you pick one of your groups, give the movie a rating (1–10) and a short
        reason.
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-neutral-300 p-6 text-sm text-neutral-500 dark:border-neutral-700">
        <p className="font-medium text-neutral-700 dark:text-neutral-300">Coming next</p>
        <p className="mt-1">
          Recommendations depend on the Groups feature. Once you can create groups and invite
          members, this form will save a rating + reason to <code>recommendations</code>, visible
          only to that group.
        </p>
        <Link href="/groups" className="mt-3 inline-block text-brand hover:underline">
          Set up your groups →
        </Link>
      </div>
    </div>
  );
}
