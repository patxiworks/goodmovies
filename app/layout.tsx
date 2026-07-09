import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { AuthButton } from "@/components/AuthButton";

export const metadata: Metadata = {
  title: "GoodMovies",
  description: "Browse, filter and recommend great movies."
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  let email: string | null = null;
  // Guard: Supabase may not be configured yet during initial setup.
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      email = user?.email ?? null;
    } catch {
      email = null;
    }
  }

  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="text-lg font-bold tracking-tight">
              🎬 Good<span className="text-brand">Movies</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="hover:text-brand">
                Browse
              </Link>
              <Link href="/dashboard" className="hover:text-brand">
                Members
              </Link>
              <AuthButton email={email} />
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-7xl px-4 py-10 text-center text-xs text-neutral-500">
          GoodMovies · data from the Movie Data sheet
        </footer>
      </body>
    </html>
  );
}
