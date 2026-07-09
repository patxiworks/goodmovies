"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { displayName } from "@/lib/user";
import { MAX_GROUPS, type Group, type GroupMember, type MembershipWithGroup } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function GroupsManager() {
  const supabase = createClient();
  const [email, setEmail] = useState<string>("");
  const [owned, setOwned] = useState<Group[]>([]);
  const [memberOf, setMemberOf] = useState<MembershipWithGroup[]>([]);
  const [membersByGroup, setMembersByGroup] = useState<Record<string, GroupMember[]>>({});
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    setEmail(user.email ?? "");

    const [{ data: mine }, { data: mships }] = await Promise.all([
      supabase.from("groups").select("*").eq("owner_id", user.id).order("created_at"),
      supabase
        .from("group_members")
        .select("*, groups(*)")
        .eq("member_email", user.email ?? "")
        .order("created_at")
    ]);

    const ownedGroups = (mine ?? []) as Group[];
    setOwned(ownedGroups);
    setMemberOf((mships ?? []) as MembershipWithGroup[]);

    // members for each owned group
    if (ownedGroups.length) {
      const { data: members } = await supabase
        .from("group_members")
        .select("*")
        .in(
          "group_id",
          ownedGroups.map((g) => g.id)
        );
      const grouped: Record<string, GroupMember[]> = {};
      (members ?? []).forEach((m: GroupMember) => {
        (grouped[m.group_id] ??= []).push(m);
      });
      setMembersByGroup(grouped);
    } else {
      setMembersByGroup({});
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function createGroup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const name = newName.trim();
    if (!name) return setError("Give the group a name.");
    if (owned.length >= MAX_GROUPS) return setError(`You can create at most ${MAX_GROUPS} groups.`);

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("groups")
      .insert({ owner_id: user.id, name, owner_name: displayName(user) });
    if (error) setError(error.message);
    else {
      setNewName("");
      load();
    }
  }

  async function deleteGroup(id: string, name: string) {
    if (!confirm(`Delete group "${name}" and all its recommendations?`)) return;
    const { error } = await supabase.from("groups").delete().eq("id", id);
    if (error) setError(error.message);
    else load();
  }

  async function invite(groupId: string, inputId: string) {
    setError(null);
    const el = document.getElementById(inputId) as HTMLInputElement | null;
    const addr = (el?.value ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(addr)) return setError("Enter a valid email address to invite.");
    const { error } = await supabase
      .from("group_members")
      .insert({ group_id: groupId, member_email: addr });
    if (error) {
      setError(error.code === "23505" ? "That person is already in the group." : error.message);
    } else {
      if (el) el.value = "";
      load();
    }
  }

  async function removeMember(memberId: string) {
    const { error } = await supabase.from("group_members").delete().eq("id", memberId);
    if (error) setError(error.message);
    else load();
  }

  async function leaveGroup(membershipId: string, name: string) {
    if (!confirm(`Leave "${name}"? You'll stop seeing its recommendations.`)) return;
    const { error } = await supabase.from("group_members").delete().eq("id", membershipId);
    if (error) setError(error.message);
    else load();
  }

  if (loading) return <p className="mt-6 text-sm text-neutral-500">Loading your groups…</p>;

  return (
    <div className="mt-6 space-y-8">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {/* Create */}
      <form onSubmit={createGroup} className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New group name…"
          className="flex-1 rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
        />
        <button
          type="submit"
          disabled={owned.length >= MAX_GROUPS}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          Create
        </button>
      </form>
      <p className="-mt-6 text-xs text-neutral-500">
        {owned.length}/{MAX_GROUPS} groups created.
      </p>

      {/* Owned groups */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Groups you own
        </h2>
        {owned.length === 0 && (
          <p className="text-sm text-neutral-500">
            You haven&apos;t created any groups yet.
          </p>
        )}
        {owned.map((g) => {
          const members = membersByGroup[g.id] ?? [];
          const inputId = `invite-${g.id}`;
          return (
            <div
              key={g.id}
              className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{g.name}</h3>
                <button
                  onClick={() => deleteGroup(g.id, g.name)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>

              <ul className="mt-3 space-y-1 text-sm">
                {members.length === 0 && (
                  <li className="text-neutral-500">No members yet — invite someone below.</li>
                )}
                {members.map((m) => (
                  <li key={m.id} className="flex items-center justify-between">
                    <span>
                      {m.member_email}{" "}
                      <span className="text-xs text-neutral-400">({m.status})</span>
                    </span>
                    <button
                      onClick={() => removeMember(m.id)}
                      className="text-xs text-neutral-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex gap-2">
                <input
                  id={inputId}
                  type="email"
                  placeholder="invite by email…"
                  className="flex-1 rounded-md border border-neutral-300 bg-transparent px-3 py-1.5 text-sm dark:border-neutral-700"
                />
                <button
                  onClick={() => invite(g.id, inputId)}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  Invite
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Member of */}
      {memberOf.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Groups you&apos;re in
          </h2>
          <ul className="space-y-2 text-sm">
            {memberOf.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-800"
              >
                <span>
                  {m.groups?.name ?? "A group"}
                  {m.groups?.owner_name && (
                    <span className="text-xs text-neutral-400"> · by {m.groups.owner_name}</span>
                  )}
                </span>
                <button
                  onClick={() => leaveGroup(m.id, m.groups?.name ?? "this group")}
                  className="shrink-0 text-xs text-neutral-500 hover:text-red-600"
                >
                  Leave
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
