import { Suspense } from "react";
import { ExploreClient } from "@/components/explore/ExploreClient";

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-zinc-400">
          Loading explorer...
        </div>
      }
    >
      <ExploreClient initialSlug="bubble-sort" />
    </Suspense>
  );
}
