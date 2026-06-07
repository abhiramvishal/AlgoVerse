"use client";

import Link from "next/link";
import { ChevronRight, Folder, FileCode } from "lucide-react";
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
            "flex min-h-8 items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-all duration-200 border border-transparent",
            isActive 
              ? "bg-indigo-600/15 text-indigo-300 font-semibold border-indigo-500/25 shadow-[0_0_15px_rgba(99,102,241,0.06)]" 
              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
          )}
          style={{ marginLeft: `${depth * 8}px` }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {hasChildren ? (
              <Folder className={cn("h-3.5 w-3.5 shrink-0 text-indigo-400/80", isActive && "text-indigo-400")} />
            ) : (
              <FileCode className={cn("h-3.5 w-3.5 shrink-0 text-zinc-500", isActive && "text-indigo-300")} />
            )}

            {visualization ? (
              <Link
                href={`/explore/${visualization.category[visualization.category.length - 1]}/${visualization.slug}`}
                className="min-w-0 flex-1 truncate font-mono text-[11px]"
              >
                {node.label}
              </Link>
            ) : (
              <span className="min-w-0 flex-1 truncate font-sans tracking-wide text-zinc-300">{node.label}</span>
            )}
          </div>

          {visualization ? (
            <Badge 
              variant={difficultyVariantMap[visualization.difficulty]}
              className="px-1.5 py-0 text-[9px] uppercase font-mono tracking-tighter"
            >
              {visualization.difficulty}
            </Badge>
          ) : null}

          {hasChildren ? (
            <button
              type="button"
              className="ml-1 rounded p-0.5 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition"
              onClick={() => toggleNode(node.id)}
              aria-label={`Toggle ${node.label}`}
            >
              <ChevronRight
                className={cn("h-3 w-3 transition-transform duration-200", shouldExpand && "rotate-90")}
              />
            </button>
          ) : null}
        </div>
        {hasChildren && shouldExpand ? (
          <div className="space-y-1.5 border-l border-white/5 ml-2.5 pl-1.5 py-0.5">
            {node.children?.map((child) => renderNode(child, depth + 1))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <aside className="h-full w-72 shrink-0 overflow-auto border-r border-white/5 bg-[#0a0914]/50 backdrop-blur-md p-3 select-none flex flex-col gap-4">
      <div>
        <p className="px-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">CS Courseware</p>
        <div className="space-y-1">{taxonomy.map((node) => renderNode(node))}</div>
      </div>
    </aside>
  );
}
