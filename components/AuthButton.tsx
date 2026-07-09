"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthButton({ email }: { email: string | null }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  if (email) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden max-w-[10rem] truncate text-neutral-500 sm:inline">
          {email}
        </span>
        <button
          onClick={signOut}
          className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark"
    >
      Sign in
    </Link>
  );
}
