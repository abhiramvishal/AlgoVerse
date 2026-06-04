"use client";

import { scaleLinear } from "d3-scale";
import { motion } from "framer-motion";

interface VisualizationCanvasProps {
  visualState: Record<string, unknown> | null;
}

export function VisualizationCanvas({ visualState }: VisualizationCanvasProps) {
  const array = (visualState?.array as number[] | undefined) ?? [];
  const active = (visualState?.active as number[] | undefined) ?? [];
  const sorted = (visualState?.sorted as number[] | undefined) ?? [];
  const pivotIndex =
    typeof visualState?.pivotIndex === "number" ? visualState.pivotIndex : null;

  const maxValue = array.length ? Math.max(...array) : 1;
  const barScale = scaleLinear().domain([0, maxValue]).range([20, 240]);

  return (
    <div className="h-full rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
      <div className="flex h-full items-end gap-2">
        {!array.length && (
          <div className="m-auto text-sm text-zinc-500">
            No visual state available for this step.
          </div>
        )}
        {array.map((value, index) => {
          const isActive = active.includes(index);
          const isSorted = sorted.includes(index);
          const isPivot = pivotIndex === index;

          const barClassName = isPivot
            ? "bg-purple-500"
            : isSorted
              ? "bg-emerald-500"
              : isActive
                ? "bg-orange-400"
                : "bg-blue-500";

          return (
            <div key={`bar-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <span className="text-xs text-zinc-300">{value}</span>
              <motion.div
                layout
                transition={{ type: "spring", damping: 20, stiffness: 240 }}
                className={`w-full rounded-t-md ${barClassName}`}
                style={{ height: `${barScale(value)}px` }}
              />
              <span className="text-[10px] text-zinc-500">{index}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
