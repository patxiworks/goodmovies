import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { displayName } from "@/lib/user";
import { RecommendationsFeed } from "@/components/RecommendationsFeed";

// Per-user page — never statically prerendered.
export const dynamic = "force-dynamic";

const CARDS = [
  {
    href: "/dashboard/propose",
    title: "Propose a film",
    body: "Suggest a movie by title and IMDB link for the curators to add.",
    ready: true
  },
  {
    href: "/dashboard/report",
    title: "Report a movie",
    body: "Flag an existing movie as inappropriate or problematic.",
    ready: true
  },
  {
    href: "/dashboard/recommend",
    title: "Recommend to a group",
    body: "Rate a movie 1–10 and tell one of your groups why to watch it.",
    ready: true
  },
  {
    href: "/groups",
    title: "Your groups",
    body: "Create up to 5 groups and invite people to share recommendations.",
    ready: true
  }
];

export default async function DashboardPage() {
  let name = "";
  let isAdmin = false;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    name = user ? displayName(user) : "";
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      isAdmin = Boolean(profile?.is_admin);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Members area</h1>
      <p className="text-sm text-neutral-500">Signed in as {name || "a member"}.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-brand hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{c.title}</h2>
              {!c.ready && (
                <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-medium uppercase text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                  Soon
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-neutral-500">{c.body}</p>
          </Link>
        ))}
      </div>

      {isAdmin && (
        <Link
          href="/admin"
          className="mt-4 flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 p-5 transition hover:shadow-sm dark:border-amber-800 dark:bg-amber-950/30"
        >
          <div>
            <h2 className="font-semibold">Admin · review queue</h2>
            <p className="mt-1 text-sm text-neutral-500">
              View and action proposed films and reported movies.
            </p>
          </div>
          <span aria-hidden>→</span>
        </Link>
      )}

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-bold tracking-tight">Shared with you</h2>
        <RecommendationsFeed />
      </section>
    </div>
  );
}
