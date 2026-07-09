"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Small red bubble on the Shared menu showing how many recommendations from
 * others are newer than the last time the user opened their Shared page.
 * Visiting /shared marks everything seen and clears the badge.
 */
export function SharedBadge() {
  const supabase = createClient();
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;

      if (pathname === "/shared") {
        await supabase
          .from("profiles")
          .update({ shared_last_seen: new Date().toISOString() })
          .eq("id", user.id);
        if (active) setCount(0);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("shared_last_seen")
        .eq("id", user.id)
        .single();
      const since = profile?.shared_last_seen ?? new Date(0).toISOString();

      const { count: c } = await supabase
        .from("recommendations")
        .select("id", { count: "exact", head: true })
        .neq("recommender_id", user.id)
        .gt("created_at", since);

      if (active) setCount(c ?? 0);
    })();
    return () => {
      active = false;
    };
  }, [pathname, supabase]);

  if (count <= 0) return null;
  return (
    <span className="absolute -right-2 -top-1.5 min-w-[1.1rem] rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
