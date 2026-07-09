"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function IconSignOut() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2.5H3.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1H6" />
      <path d="M10 11l3-3-3-3M13 8H6.5" />
    </svg>
  );
}
function IconSignIn() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2.5h2.5a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10" />
      <path d="M6 11l3-3-3-3M9 8H2.5" />
    </svg>
  );
}

export function AuthButton({ name }: { name: string | null }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  if (name) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden max-w-[10rem] truncate text-neutral-500 sm:inline">{name}</span>
        <button
          onClick={signOut}
          title="Sign out"
          aria-label="Sign out"
          className="flex items-center gap-1.5 rounded-md border border-neutral-300 px-2 py-1.5 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <IconSignOut />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      title="Sign in"
      aria-label="Sign in"
      className="flex items-center gap-1.5 rounded-md bg-brand px-2.5 py-1.5 font-medium text-white hover:bg-brand-dark"
    >
      <IconSignIn />
      <span className="hidden sm:inline">Sign in</span>
    </Link>
  );
}
