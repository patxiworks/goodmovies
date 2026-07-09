import { redirect } from "next/navigation";

// The old members hub is now split across the top-nav menus (Shared, Groups,
// Propose, Review). Send /dashboard to the Shared page.
export default function DashboardPage() {
  redirect("/shared");
}
