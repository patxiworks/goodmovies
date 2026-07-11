import { GroupsManager } from "@/components/GroupsManager";

// Per-user page — never statically prerendered.
export const dynamic = "force-dynamic";

export default function GroupsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Groups</h1>
      <p className="text-sm text-neutral-500">
        Create up to 5 groups of people you want to share movie recommendations with. Invite
        members by email — they&apos;ll see recommendations you share to the group when they sign
        in with that address.
      </p>
      <GroupsManager />
    </div>
  );
}
