import Link from "next/link";

export default function GroupsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-brand">
        ← Members area
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Your groups</h1>
      <p className="text-sm text-neutral-500">
        Create up to 5 groups of people you want to share movie recommendations with.
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-neutral-300 p-6 text-sm text-neutral-500 dark:border-neutral-700">
        <p className="font-medium text-neutral-700 dark:text-neutral-300">Coming next</p>
        <p className="mt-1">
          The database tables and security rules for groups, members and recommendations are
          already defined (see <code>supabase/migrations</code>). This screen will let you create a
          group, invite members by email, and see a feed of recommendations shared with you.
        </p>
      </div>
    </div>
  );
}
