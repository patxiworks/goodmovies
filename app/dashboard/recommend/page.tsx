import Link from "next/link";
import { RecommendForm } from "@/components/RecommendForm";

export default function RecommendPage({
  searchParams
}: {
  searchParams: { movie?: string; title?: string };
}) {
  const movieId = searchParams.movie ? Number(searchParams.movie) : null;
  const title = searchParams.title ?? "";

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-brand">
        ← Members area
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Recommend to a group</h1>
      <p className="text-sm text-neutral-500">
        Rate the movie 1–10 and tell one of your groups why they should watch it.
      </p>
      <RecommendForm movieId={movieId} title={title} />
    </div>
  );
}
