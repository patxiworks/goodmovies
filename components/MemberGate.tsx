import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

/**
 * Wraps members-only page content. Signed-in users whose account hasn't been
 * approved by an admin yet see a "pending approval" notice instead.
 * (Anonymous users are already redirected to /login by the middleware.)
 */
export async function MemberGate({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return <>{children}</>;

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return <>{children}</>;

  const { data: profile } = await supabase
    .from("profiles")
    .select("approved, is_admin")
    .eq("id", user.id)
    .single();

  if (profile?.approved || profile?.is_admin) return <>{children}</>;

  return (
    <div className="mx-auto mt-6 max-w-lg rounded-xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
      <h1 className="text-base font-semibold">Awaiting approval</h1>
      <p className="mt-2">
        Thanks for signing up! An admin needs to approve your account before you can propose
        titles, recommend movies or create groups. You can still{" "}
        <Link href="/" className="font-medium underline">
          browse all movies
        </Link>{" "}
        in the meantime.
      </p>
    </div>
  );
}
