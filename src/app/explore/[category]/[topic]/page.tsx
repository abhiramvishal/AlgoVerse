import { Suspense } from "react";
import { ExploreClient } from "@/components/explore/ExploreClient";
import { visualizationModules } from "@/lib/visualization-registry";

interface TopicPageProps {
  params: Promise<{ category: string; topic: string }>;
}

/* Pre-render every algorithm page at build time → static HTML, zero cold-start */
export function generateStaticParams() {
  return visualizationModules.map((m) => ({
    category: m.category[m.category.length - 1] ?? "algorithms",
    topic: m.slug,
  }));
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { topic } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-zinc-400">
          Loading…
        </div>
      }
    >
      <ExploreClient initialSlug={topic} />
    </Suspense>
  );
}
