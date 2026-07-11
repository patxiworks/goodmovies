import { ProposeForm } from "@/components/ProposeForm";
import { MemberGate } from "@/components/MemberGate";

export default function ProposePage() {
  return (
    <MemberGate>
      <div className="mx-auto max-w-lg">
        <h1 className="mt-3 text-2xl font-bold tracking-tight">Propose a title</h1>
        <p className="text-sm text-neutral-500">
          Your suggestion is saved as <em>pending</em> for a curator to review and add via the
          Movie Data sheet.
        </p>
        <ProposeForm />
      </div>
    </MemberGate>
  );
}
