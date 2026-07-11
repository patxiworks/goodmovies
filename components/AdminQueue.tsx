"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Proposal, Report } from "@/lib/types";

export function AdminQueue() {
  const supabase = createClient();
  const [members, setMembers] = useState<Profile[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [{ data: m }, { data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("proposals").select("*").order("created_at", { ascending: false }),
      supabase.from("reports").select("*").order("created_at", { ascending: false })
    ]);
    setMembers((m ?? []) as Profile[]);
    setProposals((p ?? []) as Proposal[]);
    setReports((r ?? []) as Report[]);
    setLoading(false);
  }

  async function setApproved(id: string, approved: boolean) {
    await supabase.from("profiles").update({ approved }).eq("id", id);
    setMembers((ms) => ms.map((x) => (x.id === id ? { ...x, approved } : x)));
  }

  useEffect(() => {
    load();
  }, []);

  async function setProposalStatus(id: string, status: string) {
    await supabase.from("proposals").update({ status }).eq("id", id);
    setProposals((ps) => ps.map((p) => (p.id === id ? { ...p, status } : p)));
  }
  async function setReportStatus(id: string, status: string) {
    await supabase.from("reports").update({ status }).eq("id", id);
    setReports((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  if (loading) return <p className="mt-6 text-sm text-neutral-500">Loading queue…</p>;

  const pending = members.filter((m) => !m.approved && !m.is_admin);
  const approvedMembers = members.filter((m) => m.approved && !m.is_admin);

  return (
    <div className="mt-6 space-y-10">
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Pending sign-ups ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-neutral-500">No one is waiting for approval.</p>
        ) : (
          <ul className="space-y-2">
            {pending.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950/30"
              >
                <span>
                  <span className="font-medium">{m.username || m.display_name || "New user"}</span>
                  <span className="text-xs text-neutral-500">
                    {" "}· joined {new Date(m.created_at).toLocaleDateString()}
                  </span>
                </span>
                <button
                  onClick={() => setApproved(m.id, true)}
                  className="shrink-0 rounded border border-emerald-400 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950"
                >
                  Approve
                </button>
              </li>
            ))}
          </ul>
        )}

        {approvedMembers.length > 0 && (
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer text-neutral-500">
              Approved members ({approvedMembers.length})
            </summary>
            <ul className="mt-2 space-y-1">
              {approvedMembers.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 px-1">
                  <span>{m.username || m.display_name || "Member"}</span>
                  <button
                    onClick={() => setApproved(m.id, false)}
                    className="text-xs text-neutral-500 hover:text-red-600"
                  >
                    Revoke
                  </button>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Proposed films ({proposals.length})
        </h2>
        {proposals.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing proposed yet.</p>
        ) : (
          <ul className="space-y-2">
            {proposals.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{p.title}</p>
                    <a
                      href={p.imdb_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-xs text-brand hover:underline"
                    >
                      {p.imdb_url}
                    </a>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      by {p.proposer_name ?? "unknown"} ·{" "}
                      {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => setProposalStatus(p.id, "approved")}
                    className="rounded border border-emerald-300 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setProposalStatus(p.id, "rejected")}
                    className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setProposalStatus(p.id, "pending")}
                    className="rounded border border-neutral-300 px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                  >
                    Reset
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Reported movies ({reports.length})
        </h2>
        {reports.length === 0 ? (
          <p className="text-sm text-neutral-500">No reports.</p>
        ) : (
          <ul className="space-y-2">
            {reports.map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/movie/${r.movie_id}`} className="font-medium hover:text-brand">
                      {r.movie_title ?? `Movie #${r.movie_id}`}
                    </Link>
                    <p className="mt-0.5 text-neutral-600 dark:text-neutral-400">{r.reason}</p>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      by {r.reporter_name ?? "unknown"} ·{" "}
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => setReportStatus(r.id, "reviewed")}
                    className="rounded border border-emerald-300 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950"
                  >
                    Mark reviewed
                  </button>
                  <button
                    onClick={() => setReportStatus(r.id, "dismissed")}
                    className="rounded border border-neutral-300 px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                  >
                    Dismiss
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "approved" || status === "reviewed"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
      : status === "rejected" || status === "dismissed"
        ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
        : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${tone}`}>{status}</span>;
}
