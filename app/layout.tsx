import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { displayName } from "@/lib/user";
import { AuthButton } from "@/components/AuthButton";
import { SharedBadge } from "@/components/SharedBadge";

export const metadata: Metadata = {
  title: "GoodMovies",
  description: "Browse, filter and recommend great movies."
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  let name: string | null = null;
  let signedIn = false;
  let isAdmin = false;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user) {
        signedIn = true;
        name = displayName(user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();
        isAdmin = Boolean(profile?.is_admin);
      }
    } catch {
      /* Supabase not configured yet */
    }
  }

  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="text-lg font-bold tracking-tight">
              🎬 Good<span className="text-brand">Movies</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm sm:gap-2">
              {signedIn && (
                <>
                  <NavItem href="/shared" label="Shared" icon={<IconShared />} badge={<SharedBadge />} />
                  <NavItem href="/groups" label="Groups" icon={<IconGroups />} />
                  <NavItem href="/dashboard/propose" label="Propose" icon={<IconPropose />} />
                  {isAdmin && <NavItem href="/admin" label="Review" icon={<IconReview />} />}
                </>
              )}
              <AuthButton name={name} />
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

function NavItem({
  href,
  label,
  icon,
  badge
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={label}
      className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-brand dark:text-neutral-300 dark:hover:bg-neutral-800"
    >
      <span className="relative">
        {icon}
        {badge}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

/* Inline icons (16px, currentColor) keep the header compact on mobile. */
function IconShared() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9.5 3.4 3.2A1 1 0 0 1 4.4 2.5h7.2a1 1 0 0 1 1 .7L14 9.5" />
      <path d="M2 9.5h3l1 1.6h4l1-1.6h3v2.5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1Z" />
    </svg>
  );
}
function IconGroups() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="6" r="2" /><circle cx="11" cy="6.5" r="1.6" />
      <path d="M1.5 13c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" /><path d="M10 9.7c2 0 4 1 4 3.3" />
    </svg>
  );
}
function IconPropose() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.2" /><path d="M8 5v6M5 8h6" />
    </svg>
  );
}
function IconReview() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="2.5" width="10" height="11" rx="1.5" /><path d="M6 2.5h4v1.6H6z" /><path d="M5.6 8l1.4 1.4 3-3.2" />
    </svg>
  );
}
