import { RecommendForm } from "@/components/RecommendForm";
import { MemberGate } from "@/components/MemberGate";

export default function RecommendPage({
  searchParams
}: {
  searchParams: { movie?: string; title?: string };
}) {
  const movieId = searchParams.movie ? Number(searchParams.movie) : null;
  const title = searchParams.title ?? "";

  return (
    <MemberGate>
      <div className="mx-auto max-w-lg">
        <h1 className="mt-3 text-2xl font-bold tracking-tight">Recommend to a group</h1>
        <p className="text-sm text-neutral-500">
          Rate the movie 1–10 and tell one of your groups why they should watch it.
        </p>
        <RecommendForm movieId={movieId} title={title} />
      </div>
    </MemberGate>
  );
}
