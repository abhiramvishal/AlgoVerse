import { Suspense } from "react";
import { ExploreClient } from "@/components/explore/ExploreClient";

interface TopicPageProps {
  params: Promise<{ category: string; topic: string }>;
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { topic } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-zinc-400 bg-[#06050b]">
          Loading…
        </div>
      }
    >
      <ExploreClient initialSlug={topic} />
    </Suspense>
  );
}
