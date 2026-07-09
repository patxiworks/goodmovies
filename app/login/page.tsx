"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Method = "password" | "magic";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";

  const [method, setMethod] = useState<Method>("password");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`;

  async function passwordAuth(mode: "signin" | "signup") {
    setError(null);
    setInfo(null);
    if (!email || password.length < 6) {
      setError("Enter an email and a password of at least 6 characters.");
      return;
    }
    if (mode === "signup" && username.trim().length < 2) {
      setError("Choose a username (at least 2 characters).");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const res =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { data: { username: username.trim() } }
          })
        : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);

    if (res.error) {
      setError(res.error.message);
      return;
    }
    if (!res.data.session) {
      // Sign-up succeeded but no session → email confirmation is still on.
      setInfo(
        "Account created, but email confirmation is enabled. Turn it off in " +
          "Supabase (Authentication → Providers → Email → Confirm email) to sign in instantly."
      );
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function magicLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        data: username.trim() ? { username: username.trim() } : undefined
      }
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

      {/* method tabs (neutral, distinct from the purple submit buttons) */}
      <div className="mt-4 flex rounded-md bg-neutral-100 p-0.5 text-sm dark:bg-neutral-800">
        <button
          onClick={() => setMethod("password")}
          className={`flex-1 rounded px-3 py-1.5 transition ${
            method === "password"
              ? "bg-neutral-300 font-medium text-neutral-900 dark:bg-neutral-600 dark:text-white"
              : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          Password
        </button>
        <button
          onClick={() => setMethod("magic")}
          className={`flex-1 rounded px-3 py-1.5 transition ${
            method === "magic"
              ? "bg-neutral-300 font-medium text-neutral-900 dark:bg-neutral-600 dark:text-white"
              : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          Email link
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
        />

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username (for new accounts)"
          autoComplete="username"
          className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
        />

        {method === "password" ? (
          <>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
            />
            <div className="flex gap-2">
              <button
                onClick={() => passwordAuth("signin")}
                disabled={busy}
                className="flex-1 rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
              >
                Sign in
              </button>
              <button
                onClick={() => passwordAuth("signup")}
                disabled={busy}
                className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-100 disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                Create account
              </button>
            </div>
          </>
        ) : sent ? (
          <div className="rounded-md bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            Check <strong>{email}</strong> for a magic sign-in link.
          </div>
        ) : (
          <form onSubmit={magicLink}>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {busy ? "Sending…" : "Email me a magic link"}
            </button>
          </form>
        )}
      </div>

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

      {info && <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">{info}</p>}
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
