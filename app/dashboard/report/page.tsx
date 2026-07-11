import { ReportForm } from "@/components/ReportForm";
import { MemberGate } from "@/components/MemberGate";

export default function ReportPage({
  searchParams
}: {
  searchParams: { movie?: string; title?: string };
}) {
  const movieId = searchParams.movie ? Number(searchParams.movie) : null;
  const title = searchParams.title ?? "";

  return (
    <MemberGate>
      <div className="mx-auto max-w-lg">
        <h1 className="mt-3 text-2xl font-bold tracking-tight">Report a movie</h1>
        <p className="text-sm text-neutral-500">
          Flag a movie as inappropriate or problematic. A curator will review your report.
        </p>
        <ReportForm movieId={movieId} title={title} />
      </div>
    </MemberGate>
  );
}
