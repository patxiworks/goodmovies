"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function auth(mode: "signin" | "signup") {
    setError(null);
    setInfo(null);
    if (!email || password.length < 6) {
      setError("Enter an email and a password of at least 6 characters.");
      return;
    }
    if (mode === "signup") {
      if (username.trim().length < 2) return setError("Choose a username (at least 2 characters).");
      if (!firstName.trim() || !lastName.trim())
        return setError("Enter your first and last name.");
    }

    setBusy(true);
    const supabase = createClient();
    const res =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username: username.trim(),
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                full_name: `${firstName.trim()} ${lastName.trim()}`.trim()
              }
            }
          })
        : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);

    if (res.error) {
      setError(res.error.message);
      return;
    }
    if (!res.data.session) {
      setInfo(
        "Account created, but email confirmation is enabled. Turn it off in " +
          "Supabase (Authentication → Providers → Email → Confirm email) to sign in instantly."
      );
      return;
    }
    // Land on the main page after signing in.
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto mt-10 max-w-sm rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <h1 className="text-xl font-bold">Sign in to GoodMovies</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Members can propose films, report issues and recommend to their groups.
      </p>

      <div className="mt-5 space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6 characters)"
          autoComplete="current-password"
          className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
        />

        <p className="pt-1 text-xs text-neutral-400">New here? These are used when you create an account:</p>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          autoComplete="username"
          className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            autoComplete="given-name"
            className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            autoComplete="family-name"
            className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => auth("signin")}
            disabled={busy}
            className="flex-1 rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            Sign in
          </button>
          <button
            onClick={() => auth("signup")}
            disabled={busy}
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-100 disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Create account
          </button>
        </div>
      </div>

      <div className="my-4 flex items-center gap-3 text-xs text-neutral-400">
        <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" /> or{" "}
        <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
      </div>

      <button
        disabled
        title="Google sign-in is temporarily disabled"
        className="w-full cursor-not-allowed rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-400 opacity-60 dark:border-neutral-700"
      >
        Continue with Google (disabled)
      </button>

      {info && <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">{info}</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}
