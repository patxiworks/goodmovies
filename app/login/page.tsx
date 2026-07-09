"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`;

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }
    });
    setBusy(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  async function google() {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo }
    });
    if (error) setError(error.message);
  }

  return (
    <div className="mx-auto mt-10 max-w-sm rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <h1 className="text-xl font-bold">Sign in to GoodMovies</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Members can propose films, report issues and recommend to their groups.
      </p>

      {sent ? (
        <div className="mt-6 rounded-md bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          Check <strong>{email}</strong> for a magic sign-in link.
        </div>
      ) : (
        <>
          <form onSubmit={sendMagicLink} className="mt-6 space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {busy ? "Sending…" : "Email me a magic link"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-neutral-400">
            <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" /> or{" "}
            <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>

          <button
            onClick={google}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Continue with Google
          </button>
        </>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mt-10 text-center text-sm text-neutral-500">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
