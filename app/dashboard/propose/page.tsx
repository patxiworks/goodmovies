import { ProposeForm } from "@/components/ProposeForm";

export default function ProposePage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Propose a film</h1>
      <p className="text-sm text-neutral-500">
        Your suggestion is saved as <em>pending</em> for a curator to review and add via the
        Movie Data sheet.
      </p>
      <ProposeForm />
    </div>
  );
}
