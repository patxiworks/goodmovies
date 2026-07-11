import { RecommendationsFeed } from "@/components/RecommendationsFeed";
import { MemberGate } from "@/components/MemberGate";

// Per-user page — never statically prerendered.
export const dynamic = "force-dynamic";

export default function SharedPage() {
  return (
    <MemberGate>
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Recommends</h1>
      <p className="text-sm text-neutral-500">
        Movies recommended within your groups — shared with you, and shared by you.
      </p>
      <div className="mt-6">
        <RecommendationsFeed />
      </div>
    </div>
    </MemberGate>
  );
}
