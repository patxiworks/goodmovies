import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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
    ready: false
  },
  {
    href: "/groups",
    title: "Your groups",
    body: "Create up to 5 groups and invite people to share recommendations.",
    ready: false
  }
];

export default async function DashboardPage() {
  let email = "";
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    email = user?.email ?? "";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Members area</h1>
      <p className="text-sm text-neutral-500">Signed in as {email || "a member"}.</p>

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
    </div>
  );
}
