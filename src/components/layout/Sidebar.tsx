"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { taxonomy } from "@/data/taxonomy";
import { visualizationModules } from "@/lib/visualization-registry";
import type { VisualizationTaxonomyNode } from "@/types/visualization";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const difficultyVariantMap = {
  beginner: "beginner",
  intermediate: "intermediate",
  advanced: "advanced",
} as const;

interface SidebarProps {
  activeSlug?: string;
}

export function Sidebar({ activeSlug }: SidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    algorithms: true,
    sorting: true,
    "data-structures": true,
  });

  const moduleMap = useMemo(
    () => new Map(visualizationModules.map((item) => [item.slug, item])),
    [],
  );

  function toggleNode(id: string) {
    setExpanded((previous) => ({ ...previous, [id]: !previous[id] }));
  }

  function renderNode(node: VisualizationTaxonomyNode, depth = 0) {
    const hasChildren = Boolean(node.children?.length);
    const visualization = moduleMap.get(node.id);
    const isActive = activeSlug === node.id;
    const shouldExpand = expanded[node.id] ?? depth < 2;

    return (
      <div key={node.id} className="space-y-1">
        <div
          className={cn(
            "flex min-h-8 items-center justify-between rounded-md px-2 py-1 text-sm",
            isActive ? "bg-zinc-800 text-zinc-100" : "text-zinc-300 hover:bg-zinc-900/80",
          )}
          style={{ marginLeft: `${depth * 10}px` }}
        >
          {visualization ? (
            <Link
              href={`/explore/${visualization.category[visualization.category.length - 1]}/${visualization.slug}`}
              className="min-w-0 flex-1 truncate"
            >
              {node.label}
            </Link>
          ) : (
            <span className="min-w-0 flex-1 truncate">{node.label}</span>
          )}

          {visualization ? (
            <Badge variant={difficultyVariantMap[visualization.difficulty]}>
              {visualization.difficulty}
            </Badge>
          ) : null}

          {hasChildren ? (
            <button
              type="button"
              className="ml-2 rounded p-1 hover:bg-zinc-800"
              onClick={() => toggleNode(node.id)}
              aria-label={`Toggle ${node.label}`}
            >
              <ChevronRight
                className={cn("h-3 w-3 transition-transform", shouldExpand && "rotate-90")}
              />
            </button>
          ) : null}
        </div>
        {hasChildren && shouldExpand ? (
          <div className="space-y-1">{node.children?.map((child) => renderNode(child, depth + 1))}</div>
        ) : null}
      </div>
    );
  }

  return (
    <aside className="h-full w-72 shrink-0 overflow-auto border-r border-zinc-800 bg-zinc-950/80 p-2">
      <p className="mb-3 px-2 text-xs uppercase tracking-wider text-zinc-500">Fields</p>
      <div className="space-y-1">{taxonomy.map((node) => renderNode(node))}</div>
    </aside>
  );
}
