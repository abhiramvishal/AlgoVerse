"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { taxonomy } from "@/data/taxonomy";
import { visualizationModules } from "@/lib/visualization-registry";
import type { VisualizationTaxonomyNode } from "@/types/visualization";

/* ── module slug → module ── */
const moduleMap = new Map(visualizationModules.map((m) => [m.slug, m]));

/* ── color class per top-level category id ── */
const CAT_COLOR: Record<string, string> = {
  "data-structures":       "cat-indigo",
  "algorithms":            "cat-amber",
  "os":                    "cat-cyan",
  "networks":              "cat-emerald",
  "databases":             "cat-rose",
  "ml-ai":                 "cat-fuchsia",
  "compiler":              "cat-orange",
  "computer-architecture": "cat-violet",
  "cryptography":          "cat-yellow",
  "distributed-systems":   "cat-blue",
  "theory":                "cat-purple",
  "computer-graphics":     "cat-pink",
  "parallel":              "cat-teal",
  "quantum":               "cat-sky",
  "blockchain":            "cat-lime",
};

/* ── difficulty dot colors ── */
const DIFF_DOT: Record<string, string> = {
  beginner:     "bg-emerald-500",
  intermediate: "bg-amber-400",
  advanced:     "bg-rose-500",
};

function collectLeaves(node: VisualizationTaxonomyNode): VisualizationTaxonomyNode[] {
  if (!node.children?.length) return [node];
  return node.children.flatMap(collectLeaves);
}

function findTopCategory(slug: string | undefined): string | null {
  if (!slug) return null;
  for (const top of taxonomy) {
    if (collectLeaves(top).some((l) => l.id === slug)) return top.id;
  }
  return null;
}

const SPRING = { type: "spring" as const, damping: 26, stiffness: 380, mass: 0.6 };

interface CategoryNavProps { activeSlug?: string }

export function CategoryNav({ activeSlug }: CategoryNavProps) {
  const defaultTop = useMemo(
    () => findTopCategory(activeSlug) ?? taxonomy[0]?.id ?? "",
    [activeSlug],
  );
  const [selectedTop, setSelectedTop] = useState(defaultTop);
  const [search, setSearch] = useState("");

  const topNode  = useMemo(() => taxonomy.find((t) => t.id === selectedTop), [selectedTop]);
  const allLeaves = useMemo(() => (topNode ? collectLeaves(topNode) : []), [topNode]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? allLeaves.filter((l) => l.label.toLowerCase().includes(q)) : allLeaves;
  }, [allLeaves, search]);

  const activeCatColor = CAT_COLOR[selectedTop] ?? "cat-indigo";

  return (
    <div className="border-b border-white/5 backdrop-blur-md select-none" style={{ background: "var(--nav-bg)" }}>

      {/* ── Row 1: top-level category pills ── */}
      <div className="flex items-center gap-0.5 px-4 pt-2.5 pb-2 overflow-x-auto scrollbar-hide">
        {taxonomy.map((cat) => {
          const isActive = selectedTop === cat.id;
          const colorCls = CAT_COLOR[cat.id] ?? "cat-indigo";
          return (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setSelectedTop(cat.id); setSearch(""); }}
              className={`relative shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${colorCls} ${
                isActive ? "cat-pill-active" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {cat.label}
            </motion.button>
          );
        })}
      </div>

      {/* ── Row 2: algorithm pills + search ── */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={selectedTop}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0, transition: SPRING }}
          exit={{ opacity: 0, y: 4, transition: { duration: 0.1 } }}
          className="flex items-center gap-1.5 px-4 pb-2.5 overflow-x-auto scrollbar-hide"
        >
          {/* Search */}
          <div className={`relative shrink-0 flex items-center ${activeCatColor}`}>
            <Search className="absolute left-2.5 h-3 w-3 pointer-events-none" style={{ color: "var(--cat)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter…"
              className="w-32 pl-7 pr-6 py-1 rounded-full bg-zinc-900/50 border border-white/8 text-xs placeholder-zinc-600 focus:outline-none transition"
              style={{ borderColor: search ? "var(--cat)" : undefined, color: "var(--foreground)" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2">
                <X className="h-3 w-3 text-zinc-500 hover:text-zinc-300" />
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-white/10 shrink-0" />

          {/* Algorithm pills */}
          {filtered.map((leaf) => {
            const mod    = moduleMap.get(leaf.id);
            const isActive = activeSlug === leaf.id;
            const href   = mod
              ? `/explore/${mod.category[mod.category.length - 1]}/${mod.slug}`
              : null;
            const diff   = mod?.difficulty;

            const pillContent = (
              <motion.div
                key={leaf.id}
                whileHover={mod ? { scale: 1.05 } : {}}
                whileTap={mod ? { scale: 0.95 } : {}}
                className={`relative shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${activeCatColor} ${
                  isActive
                    ? "cat-pill-active shadow-md"
                    : mod
                      ? "text-zinc-400 hover:text-zinc-200 bg-zinc-900/30 border border-white/5 hover:border-white/10"
                      : "text-zinc-600 bg-transparent border border-white/3 cursor-not-allowed opacity-40"
                }`}
              >
                {diff && (
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${DIFF_DOT[diff] ?? "bg-zinc-500"}`} />
                )}
                {leaf.label}
                {!mod && (
                  <span className="text-[9px] text-zinc-600 font-normal">soon</span>
                )}
              </motion.div>
            );

            return href ? (
              <Link key={leaf.id} href={href} className="shrink-0">{pillContent}</Link>
            ) : (
              <span key={leaf.id} className="shrink-0">{pillContent}</span>
            );
          })}

          {filtered.length === 0 && (
            <span className="text-xs text-zinc-600 py-1 shrink-0">No matches for "{search}"</span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
