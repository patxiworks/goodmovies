import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminQueue } from "@/components/AdminQueue";

// Admins only — never statically prerendered.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let isAdmin = false;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
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
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-brand">
        ← Members area
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Admin · review queue</h1>

      {isAdmin ? (
        <AdminQueue />
      ) : (
        <p className="mt-6 rounded-lg border border-neutral-200 p-6 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
          You don&apos;t have admin access. An existing admin can grant it in Supabase by setting
          <code className="mx-1 rounded bg-neutral-100 px-1 dark:bg-neutral-800">
            profiles.is_admin = true
          </code>
          for your account.
        </p>
      )}
    </div>
  );
}
