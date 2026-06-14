"use client";

import { scaleLinear } from "d3-scale";
import { motion } from "framer-motion";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface VisualState {
  type?: string;
  [key: string]: unknown;
}

interface VisualizationCanvasProps {
  visualState: VisualState | null;
}

/* ─── Sorting Bar-Chart Renderer ─────────────────────────────────────────── */
function SortingRenderer({ visualState }: { visualState: VisualState }) {
  const array = (visualState.array as number[] | undefined) ?? [];
  const active = (visualState.active as number[] | undefined) ?? [];
  const sorted = (visualState.sorted as number[] | undefined) ?? [];
  const pivotIndex =
    typeof visualState.pivotIndex === "number" ? visualState.pivotIndex : null;
  const mergedRange = (visualState.mergedRange as [number, number] | null) ?? null;

  const maxValue = array.length ? Math.max(...array) : 1;
  // Use % heights so bars fill any container size without clipping
  const barHeightPct = (v: number) => `${((v / maxValue) * 82 + 8)}%`;

  return (
    <div className="flex h-full w-full items-end gap-1.5 relative z-10 px-2 pb-1">
      {!array.length && (
        <div className="m-auto text-xs text-zinc-500 font-mono">
          No visual state available for this step.
        </div>
      )}
      {array.map((value, index) => {
        const isActive = active.includes(index);
        const isSorted = sorted.includes(index);
        const isPivot = pivotIndex === index;
        const isMerged =
          mergedRange !== null &&
          index >= mergedRange[0] &&
          index <= mergedRange[1];

        const barGradientClass = isPivot
          ? "from-fuchsia-600 to-fuchsia-400 border-fuchsia-400/30 shadow-fuchsia-900/20"
          : isSorted
            ? "from-emerald-600 to-emerald-400 border-emerald-400/30 shadow-emerald-900/20"
            : isActive
              ? "from-rose-600 to-rose-400 border-rose-400/30 shadow-rose-900/30"
              : isMerged
                ? "from-amber-600 to-amber-400 border-amber-400/20 shadow-amber-900/10"
                : "from-indigo-600 to-indigo-400 border-indigo-400/20 shadow-indigo-900/10";

        return (
          <div key={`bar-${index}`} className="flex min-w-0 flex-1 flex-col items-center justify-end h-full gap-1">
            <span className="text-[10px] font-semibold font-mono text-zinc-400 shrink-0">{value}</span>
            <motion.div
              layout
              transition={{ type: "spring", damping: 18, stiffness: 220 }}
              className={`w-full rounded-t-lg border bg-gradient-to-t shadow-lg relative overflow-hidden ${barGradientClass}`}
              style={{ height: barHeightPct(value) }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)] -translate-x-full animate-[shimmer_2.5s_infinite] pointer-events-none" />
            </motion.div>
            <span className="text-[9px] font-mono text-zinc-600 shrink-0">{index}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Graph Renderer (SVG nodes + edges) ─────────────────────────────────── */
export interface GraphNode {
  id: string | number;
  label: string;
  x: number;
  y: number;
}
export interface GraphEdge {
  from: string | number;
  to: string | number;
  weight?: number;
  directed?: boolean;
}

function GraphRenderer({ visualState }: { visualState: VisualState }) {
  const nodes = (visualState.nodes as GraphNode[]) ?? [];
  const edges = (visualState.edges as GraphEdge[]) ?? [];
  const visited = new Set<string | number>(
    (visualState.visited as (string | number)[]) ?? [],
  );
  const frontier = new Set<string | number>(
    (visualState.frontier as (string | number)[]) ?? [],
  );
  const current = visualState.current as string | number | undefined;
  const distances = (visualState.distances as Record<string | number, number | null>) ?? {};
  const relaxed = (visualState.relaxed as string | number | undefined);
  const path = new Set<string | number>(
    (visualState.path as (string | number)[]) ?? [],
  );
  const mstEdges = (visualState.mstEdges as [string | number, string | number][] | undefined) ?? [];
  const mstSet = new Set(mstEdges.map(([a, b]) => `${a}__${b}`));

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  function nodeColor(id: string | number) {
    if (id === current) return "#6366f1"; // indigo — currently processing
    if (path.has(id)) return "#10b981"; // emerald — on shortest path
    if (visited.has(id)) return "#10b981"; // emerald — visited
    if (frontier.has(id)) return "#f59e0b"; // amber — in frontier/queue
    return "#1e1b4b"; // dark indigo — unvisited
  }

  function nodeStroke(id: string | number) {
    if (id === current) return "#818cf8";
    if (path.has(id)) return "#6ee7b7";
    if (visited.has(id)) return "#6ee7b7";
    if (frontier.has(id)) return "#fcd34d";
    return "#4c4880";
  }

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 600 340"
      className="w-full h-full"
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#4c4880" />
        </marker>
        <marker
          id="arrowhead-active"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#818cf8" />
        </marker>
      </defs>

      {edges.map((edge, i) => {
        const fromNode = nodeMap.get(edge.from);
        const toNode = nodeMap.get(edge.to);
        if (!fromNode || !toNode) return null;

        const isActive =
          edge.to === relaxed ||
          (visited.has(edge.from) && frontier.has(edge.to));
        const isOnPath = path.has(edge.from) && path.has(edge.to);
        const isMst =
          mstSet.has(`${edge.from}__${edge.to}`) ||
          mstSet.has(`${edge.to}__${edge.from}`);

        // Offset endpoints slightly from node center
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const r = 22;
        const x1 = fromNode.x + (dx / len) * r;
        const y1 = fromNode.y + (dy / len) * r;
        const x2 = toNode.x - (dx / len) * r;
        const y2 = toNode.y - (dy / len) * r;

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        return (
          <g key={i}>
            <line
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isMst ? "#10b981" : isOnPath ? "#10b981" : isActive ? "#818cf8" : "#4c4880"}
              strokeWidth={isMst ? 3 : isOnPath ? 2.5 : isActive ? 2 : 1.5}
              strokeOpacity={0.9}
              markerEnd={
                edge.directed !== false
                  ? isActive
                    ? "url(#arrowhead-active)"
                    : "url(#arrowhead)"
                  : undefined
              }
            />
            {edge.weight !== undefined && (
              <text
                x={midX}
                y={midY - 6}
                textAnchor="middle"
                fontSize={10}
                fill={isActive ? "#818cf8" : "#6b7280"}
                fontFamily="monospace"
              >
                {edge.weight}
              </text>
            )}
          </g>
        );
      })}

      {nodes.map((node) => {
        const distStr =
          distances[node.id] !== undefined && distances[node.id] !== null
            ? String(distances[node.id] === Infinity ? "∞" : distances[node.id])
            : null;

        return (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={22}
              fill={nodeColor(node.id)}
              stroke={nodeStroke(node.id)}
              strokeWidth={2}
            />
            <text
              x={node.x}
              y={node.y + 5}
              textAnchor="middle"
              fontSize={13}
              fontWeight="bold"
              fill="white"
              fontFamily="monospace"
            >
              {node.label}
            </text>
            {distStr !== null && (
              <text
                x={node.x}
                y={node.y - 30}
                textAnchor="middle"
                fontSize={11}
                fill="#f59e0b"
                fontFamily="monospace"
                fontWeight="600"
              >
                {distStr}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Tree Renderer (BST / generic binary tree) ──────────────────────────── */
export interface TreeNode {
  id: string | number;
  label: string;
  x: number;
  y: number;
  left?: string | number | null;
  right?: string | number | null;
}

function TreeRenderer({ visualState }: { visualState: VisualState }) {
  const nodes = (visualState.nodes as TreeNode[]) ?? [];
  const highlighted = new Set<string | number>(
    (visualState.highlighted as (string | number)[]) ?? [],
  );
  const comparing = visualState.comparing as string | number | undefined;
  const inserted = visualState.inserted as string | number | undefined;
  const found = visualState.found as string | number | undefined;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  function nodeColor(id: string | number) {
    if (id === found) return "#10b981";
    if (id === inserted) return "#10b981";
    if (id === comparing) return "#f59e0b";
    if (highlighted.has(id)) return "#6366f1";
    return "#1e1b4b";
  }
  function nodeStroke(id: string | number) {
    if (id === found || id === inserted) return "#6ee7b7";
    if (id === comparing) return "#fcd34d";
    if (highlighted.has(id)) return "#818cf8";
    return "#4c4880";
  }

  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (const node of nodes) {
    for (const childId of [node.left, node.right]) {
      if (childId != null) {
        const child = nodeMap.get(childId);
        if (child) {
          edges.push({ x1: node.x, y1: node.y, x2: child.x, y2: child.y });
        }
      }
    }
  }

  return (
    <svg width="100%" height="100%" viewBox="0 0 600 340" className="w-full h-full">
      {edges.map((e, i) => (
        <line
          key={i}
          x1={e.x1}
          y1={e.y1}
          x2={e.x2}
          y2={e.y2}
          stroke="#4c4880"
          strokeWidth={1.5}
          strokeOpacity={0.8}
        />
      ))}
      {nodes.map((node) => (
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r={20}
            fill={nodeColor(node.id)}
            stroke={nodeStroke(node.id)}
            strokeWidth={2}
          />
          <text
            x={node.x}
            y={node.y + 5}
            textAnchor="middle"
            fontSize={13}
            fontWeight="bold"
            fill="white"
            fontFamily="monospace"
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ─── Linked List Renderer ──────────────────────────────────────────────── */
export interface LinkedListNode {
  value: string | number;
  id: string | number;
}

function LinkedListRenderer({ visualState }: { visualState: VisualState }) {
  const nodes = (visualState.nodes as LinkedListNode[]) ?? [];
  const activeIndex = visualState.activeIndex as number | undefined;
  const highlightedIndex = visualState.highlightedIndex as number | undefined;
  const deletedIndex = visualState.deletedIndex as number | undefined;

  const cellW = 72;
  const cellH = 44;
  const arrowW = 28;
  const startX = 30;
  const y = 120;
  const totalW = Math.min(
    580,
    nodes.length * (cellW + arrowW) + startX,
  );

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${totalW + 40} 240`}
      className="w-full h-full"
    >
      {/* HEAD label */}
      {nodes.length > 0 && (
        <>
          <text
            x={startX + cellW / 2}
            y={y - 36}
            textAnchor="middle"
            fontSize={10}
            fill="#6366f1"
            fontFamily="monospace"
            fontWeight="600"
          >
            HEAD
          </text>
          <line
            x1={startX + cellW / 2}
            y1={y - 26}
            x2={startX + cellW / 2}
            y2={y - 2}
            stroke="#6366f1"
            strokeWidth={1.5}
            markerEnd="url(#arrow-indigo)"
          />
        </>
      )}

      <defs>
        <marker id="arrow-indigo" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#6366f1" />
        </marker>
        <marker id="arrow-gray" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#4c4880" />
        </marker>
      </defs>

      {nodes.map((node, i) => {
        const x = startX + i * (cellW + arrowW);
        const isActive = i === activeIndex;
        const isHighlighted = i === highlightedIndex;
        const isDeleted = i === deletedIndex;

        const fill = isDeleted
          ? "#450a0a"
          : isHighlighted
            ? "#065f46"
            : isActive
              ? "#312e81"
              : "#1e1b4b";
        const stroke = isDeleted
          ? "#ef4444"
          : isHighlighted
            ? "#10b981"
            : isActive
              ? "#818cf8"
              : "#4c4880";

        return (
          <g key={node.id}>
            {/* Value cell */}
            <rect
              x={x}
              y={y}
              width={cellW * 0.65}
              height={cellH}
              rx={6}
              fill={fill}
              stroke={stroke}
              strokeWidth={1.5}
            />
            <text
              x={x + cellW * 0.33}
              y={y + cellH / 2 + 5}
              textAnchor="middle"
              fontSize={13}
              fill="white"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {node.value}
            </text>

            {/* Next pointer cell */}
            <rect
              x={x + cellW * 0.65}
              y={y}
              width={cellW * 0.35}
              height={cellH}
              rx={4}
              fill={isActive ? "#312e81" : "#12112a"}
              stroke={stroke}
              strokeWidth={1.5}
            />
            <text
              x={x + cellW * 0.82}
              y={y + cellH / 2 + 5}
              textAnchor="middle"
              fontSize={9}
              fill="#6b7280"
              fontFamily="monospace"
            >
              →
            </text>

            {/* Arrow to next */}
            {i < nodes.length - 1 && (
              <line
                x1={x + cellW}
                y1={y + cellH / 2}
                x2={x + cellW + arrowW}
                y2={y + cellH / 2}
                stroke="#4c4880"
                strokeWidth={1.5}
                markerEnd="url(#arrow-gray)"
              />
            )}

            {/* NULL for last */}
            {i === nodes.length - 1 && (
              <text
                x={x + cellW + 8}
                y={y + cellH / 2 + 4}
                fontSize={10}
                fill="#6b7280"
                fontFamily="monospace"
              >
                NULL
              </text>
            )}

            {/* Index label below */}
            <text
              x={x + cellW * 0.33}
              y={y + cellH + 18}
              textAnchor="middle"
              fontSize={9}
              fill="#6b7280"
              fontFamily="monospace"
            >
              [{i}]
            </text>
          </g>
        );
      })}

      {nodes.length === 0 && (
        <text x={300} y={120} textAnchor="middle" fontSize={12} fill="#4b5563" fontFamily="monospace">
          Empty list
        </text>
      )}
    </svg>
  );
}

/* ─── Stack / Queue Renderer ─────────────────────────────────────────────── */
function StackQueueRenderer({ visualState }: { visualState: VisualState }) {
  const mode = (visualState.mode as string) ?? "stack";
  // Cells may be plain values or { val, state } objects
  const rawCells = Array.isArray(visualState.cells) ? (visualState.cells as unknown[]) : [];
  const cells = rawCells.map((c) =>
    typeof c === "object" && c !== null && "val" in c
      ? (c as { val: string | number; state?: string })
      : { val: c as string | number, state: undefined },
  );
  const activeIndex = visualState.activeIndex as number | undefined;
  const topIndex = visualState.topIndex as number | undefined;

  const isStack = mode === "stack";

  // Stack: render vertically (top = last)
  // Queue: render horizontally (front = first)
  if (isStack) {
    const display = [...cells].reverse();
    const cellH = 44;
    const cellW = 160;
    const startX = 220;
    const startY = 280;

    return (
      <svg width="100%" height="100%" viewBox="0 0 600 340" className="w-full h-full">
        {/* Stack label */}
        <text x={300} y={24} textAnchor="middle" fontSize={11} fill="#818cf8" fontFamily="monospace" fontWeight="700">
          STACK
        </text>
        {/* Base line */}
        <line x1={startX - 10} y1={startY + 4} x2={startX + cellW + 10} y2={startY + 4} stroke="#4c4880" strokeWidth={2} />
        {display.map((cell, i) => {
          const originalIndex = cells.length - 1 - i;
          const isActive = originalIndex === activeIndex || cell.state === "active";
          const isTop = originalIndex === (topIndex ?? cells.length - 1);
          const y = startY - (i + 1) * (cellH + 2);

          return (
            <g key={i}>
              <rect
                x={startX}
                y={y}
                width={cellW}
                height={cellH}
                rx={6}
                fill={isActive ? "#312e81" : "#1e1b4b"}
                stroke={isActive ? "#818cf8" : "#4c4880"}
                strokeWidth={1.5}
              />
              <text
                x={startX + cellW / 2}
                y={y + cellH / 2 + 5}
                textAnchor="middle"
                fontSize={14}
                fill="white"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {cell.val}
              </text>
              {isTop && (
                <text
                  x={startX + cellW + 16}
                  y={y + cellH / 2 + 5}
                  fontSize={10}
                  fill="#f59e0b"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  ← TOP
                </text>
              )}
            </g>
          );
        })}
        {cells.length === 0 && (
          <text x={300} y={230} textAnchor="middle" fontSize={12} fill="#4b5563" fontFamily="monospace">
            Stack is empty
          </text>
        )}
      </svg>
    );
  }

  // Queue: horizontal
  const cellW = 72;
  const cellH = 50;
  const startX = 20;
  const y = 130;

  return (
    <svg width="100%" height="100%" viewBox="0 0 620 280" className="w-full h-full">
      <text x={300} y={24} textAnchor="middle" fontSize={11} fill="#818cf8" fontFamily="monospace" fontWeight="700">
        QUEUE
      </text>
      {cells.map((cell, i) => {
        const isActive = i === activeIndex || cell.state === "active";
        const x = startX + i * (cellW + 4);
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={cellW}
              height={cellH}
              rx={6}
              fill={isActive ? "#312e81" : "#1e1b4b"}
              stroke={isActive ? "#818cf8" : "#4c4880"}
              strokeWidth={1.5}
            />
            <text
              x={x + cellW / 2}
              y={y + cellH / 2 + 5}
              textAnchor="middle"
              fontSize={13}
              fill="white"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {cell.val}
            </text>
            {i === 0 && (
              <text x={x + cellW / 2} y={y + cellH + 18} textAnchor="middle" fontSize={9} fill="#f59e0b" fontFamily="monospace" fontWeight="600">
                FRONT
              </text>
            )}
            {i === cells.length - 1 && (
              <text x={x + cellW / 2} y={y + cellH + 18} textAnchor="middle" fontSize={9} fill="#818cf8" fontFamily="monospace" fontWeight="600">
                REAR
              </text>
            )}
          </g>
        );
      })}
      {cells.length === 0 && (
        <text x={300} y={160} textAnchor="middle" fontSize={12} fill="#4b5563" fontFamily="monospace">
          Queue is empty
        </text>
      )}
    </svg>
  );
}

/* ─── Hash Table Renderer ─────────────────────────────────────────────────── */
export interface HashBucket {
  index: number;
  chain: { key: string | number; value?: string | number }[];
}

function HashTableRenderer({ visualState }: { visualState: VisualState }) {
  const buckets = (visualState.buckets as HashBucket[]) ?? [];
  const highlightedBucket = visualState.highlightedBucket as number | undefined;
  const highlightedKey = visualState.highlightedKey as string | number | undefined;
  const operation = (visualState.operation as string) ?? "";

  const rowH = 36;
  const labelW = 52;
  const cellW = 84;
  const startX = 60;
  const startY = 20;

  return (
    <svg width="100%" height="100%" viewBox="0 0 600 340" className="w-full h-full">
      <text x={16} y={14} fontSize={9} fill="#818cf8" fontFamily="monospace" fontWeight="700">
        HASH TABLE (chaining)
      </text>
      {operation && (
        <text x={400} y={14} fontSize={9} fill="#f59e0b" fontFamily="monospace">
          op: {operation}
        </text>
      )}

      {buckets.map((bucket, i) => {
        const y = startY + i * (rowH + 4) + 12;
        const isBucketHighlighted = bucket.index === highlightedBucket;

        return (
          <g key={bucket.index}>
            {/* Bucket index label */}
            <rect
              x={startX}
              y={y}
              width={labelW}
              height={rowH}
              rx={4}
              fill={isBucketHighlighted ? "#312e81" : "#12112a"}
              stroke={isBucketHighlighted ? "#818cf8" : "#2d2b54"}
              strokeWidth={1.5}
            />
            <text
              x={startX + labelW / 2}
              y={y + rowH / 2 + 5}
              textAnchor="middle"
              fontSize={12}
              fill={isBucketHighlighted ? "#818cf8" : "#6b7280"}
              fontFamily="monospace"
              fontWeight="600"
            >
              [{bucket.index}]
            </text>

            {/* Chain cells */}
            {bucket.chain.map((item, j) => {
              const x = startX + labelW + 12 + j * (cellW + 10);
              const isKeyHighlighted =
                isBucketHighlighted && item.key === highlightedKey;

              return (
                <g key={`${i}-${j}`}>
                  <rect
                    x={x}
                    y={y}
                    width={cellW}
                    height={rowH}
                    rx={4}
                    fill={isKeyHighlighted ? "#1e3a5f" : "#1a1830"}
                    stroke={isKeyHighlighted ? "#10b981" : "#3f3c72"}
                    strokeWidth={1.5}
                  />
                  <text
                    x={x + cellW / 2}
                    y={y + rowH / 2 + 5}
                    textAnchor="middle"
                    fontSize={11}
                    fill={isKeyHighlighted ? "#10b981" : "#e2e8f0"}
                    fontFamily="monospace"
                  >
                    {String(item.key)}
                    {item.value !== undefined ? `:${item.value}` : ""}
                  </text>
                  {j < bucket.chain.length - 1 && (
                    <line
                      x1={x + cellW}
                      y1={y + rowH / 2}
                      x2={x + cellW + 10}
                      y2={y + rowH / 2}
                      stroke="#4c4880"
                      strokeWidth={1.5}
                      markerEnd="url(#arrow-chain)"
                    />
                  )}
                </g>
              );
            })}

            {bucket.chain.length === 0 && (
              <text
                x={startX + labelW + 20}
                y={y + rowH / 2 + 5}
                fontSize={10}
                fill="#374151"
                fontFamily="monospace"
              >
                — empty —
              </text>
            )}
          </g>
        );
      })}

      <defs>
        <marker id="arrow-chain" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#4c4880" />
        </marker>
      </defs>
    </svg>
  );
}

/* ─── Flow Diagram Renderer (for protocols) ──────────────────────────────── */
export interface FlowStep {
  from: string;
  to: string;
  label: string;
  color?: string;
}

function FlowDiagramRenderer({ visualState }: { visualState: VisualState }) {
  const lanes = (visualState.lanes as string[]) ?? [];
  const steps = (visualState.steps as FlowStep[]) ?? [];
  const activeStep = (visualState.activeStep as number) ?? -1;
  const completedSteps = new Set<number>(
    (visualState.completedSteps as number[]) ?? [],
  );

  const laneW = 560 / Math.max(lanes.length, 1);
  const laneColors = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"];
  const rowH = 48;
  const startY = 70;

  return (
    <svg width="100%" height="100%" viewBox="0 0 600 340" className="w-full h-full">
      {/* Lane headers */}
      {lanes.map((lane, i) => {
        const x = 20 + i * laneW + laneW / 2;
        return (
          <g key={lane}>
            <rect
              x={20 + i * laneW + 4}
              y={8}
              width={laneW - 8}
              height={32}
              rx={6}
              fill={`${laneColors[i % laneColors.length]}18`}
              stroke={`${laneColors[i % laneColors.length]}40`}
              strokeWidth={1}
            />
            <text
              x={x}
              y={28}
              textAnchor="middle"
              fontSize={11}
              fill={laneColors[i % laneColors.length]}
              fontFamily="monospace"
              fontWeight="700"
            >
              {lane}
            </text>
            {/* Vertical lane divider */}
            <line
              x1={x}
              y1={44}
              x2={x}
              y2={340}
              stroke={`${laneColors[i % laneColors.length]}15`}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          </g>
        );
      })}

      {/* Flow steps */}
      {steps.map((step, i) => {
        const fromIndex = lanes.indexOf(step.from);
        const toIndex = lanes.indexOf(step.to);
        const isActive = i === activeStep;
        const isDone = completedSteps.has(i);

        const x1 = 20 + fromIndex * laneW + laneW / 2;
        const x2 = 20 + toIndex * laneW + laneW / 2;
        const y = startY + i * rowH;

        const color = isDone
          ? "#10b981"
          : isActive
            ? step.color ?? "#6366f1"
            : "#374151";

        return (
          <g key={i}>
            {/* Horizontal arrow */}
            <line
              x1={x1}
              y1={y}
              x2={x2}
              y2={y}
              stroke={color}
              strokeWidth={isActive ? 2.5 : isDone ? 2 : 1.5}
              strokeOpacity={isDone || isActive ? 1 : 0.4}
              markerEnd={`url(#flow-arrow-${i})`}
            />
            <defs>
              <marker
                id={`flow-arrow-${i}`}
                markerWidth="8"
                markerHeight="6"
                refX={x1 < x2 ? 7 : 1}
                refY="3"
                orient="auto"
              >
                <polygon
                  points={x1 < x2 ? "0 0, 8 3, 0 6" : "8 0, 0 3, 8 6"}
                  fill={color}
                />
              </marker>
            </defs>

            {/* Label */}
            <rect
              x={Math.min(x1, x2) + Math.abs(x2 - x1) / 2 - 60}
              y={y - 18}
              width={120}
              height={18}
              rx={3}
              fill="#08070f"
              opacity={0.7}
            />
            <text
              x={(x1 + x2) / 2}
              y={y - 5}
              textAnchor="middle"
              fontSize={9}
              fill={color}
              fontFamily="monospace"
              fontWeight={isActive ? "700" : "400"}
              opacity={isDone || isActive ? 1 : 0.5}
            >
              {step.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Search Renderer ────────────────────────────────────────────────────── */
function SearchRenderer({ visualState }: { visualState: VisualState }) {
  const array = (visualState.array as number[] | undefined) ?? [];
  const target = visualState.target as number | undefined;
  // active may be an index list, or a single index number (-1 = none)
  const active = Array.isArray(visualState.active)
    ? (visualState.active as number[])
    : typeof visualState.active === "number" && visualState.active >= 0
      ? [visualState.active]
      : [];
  const searchLeft = typeof visualState.searchLeft === "number" ? visualState.searchLeft : null;
  const searchRight = typeof visualState.searchRight === "number" ? visualState.searchRight : null;
  const found = typeof visualState.found === "number" ? visualState.found : -1;

  const maxValue = array.length ? Math.max(...array, 1) : 1;
  const barHeightPct = (v: number) => `${((v / maxValue) * 82 + 8)}%`;

  return (
    <div className="flex h-full w-full flex-col gap-2 relative z-10">
      {target !== undefined && (
        <div className="text-xs font-mono text-amber-400 text-center font-semibold shrink-0">
          Target: {target}
        </div>
      )}
      <div className="flex flex-1 items-end gap-1.5 relative px-2 pb-1">
        {array.map((value, index) => {
          const isFound = found === index;
          const isActive = active.includes(index);
          const inRange =
            searchLeft !== null && searchRight !== null &&
            index >= searchLeft && index <= searchRight;

          const barClass = isFound
            ? "from-emerald-600 to-emerald-400 border-emerald-400/30"
            : isActive
              ? "from-rose-600 to-rose-400 border-rose-400/30"
              : inRange
                ? "from-indigo-600 to-indigo-400 border-indigo-400/20"
                : "from-zinc-700 to-zinc-600 border-zinc-600/20";

          return (
            <div key={index} className="flex min-w-0 flex-1 flex-col items-center justify-end h-full gap-1 relative">
              {searchLeft === index && (
                <div className="absolute -left-0.5 bottom-0 top-0 w-0.5 bg-cyan-400 opacity-70" />
              )}
              {searchRight === index && (
                <div className="absolute -right-0.5 bottom-0 top-0 w-0.5 bg-cyan-400 opacity-70" />
              )}
              <span className="text-[10px] font-semibold font-mono text-zinc-400 shrink-0">{value}</span>
              <motion.div
                layout
                transition={{ type: "spring", damping: 18, stiffness: 220 }}
                className={`w-full rounded-t-lg border bg-gradient-to-t shadow-lg ${barClass}`}
                style={{ height: barHeightPct(value) }}
              />
              <span className="text-[9px] font-mono text-zinc-600 shrink-0">{index}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Array1D Renderer ───────────────────────────────────────────────────── */
interface Array1DCell {
  val: number | string;
  state: "default" | "active" | "computed" | "highlighted" | "min";
}

function Array1DRenderer({ visualState }: { visualState: VisualState }) {
  const cells = (visualState.cells as Array1DCell[] | undefined) ?? [];
  const label = visualState.label as string | undefined;
  const pointers = (visualState.pointer as { index: number; label: string }[] | undefined) ?? [];

  // Auto-size cells to the longest value so wide content (hashes, "256 bits")
  // isn't cramped. Cap so a handful of short cells don't balloon.
  const longest = cells.reduce((m, c) => Math.max(m, String(c.val).length), 1);
  const perChar = 9;               // ~px per monospace char at text-xs
  const minW = 38;
  const maxW = 120;
  const cellW = Math.min(maxW, Math.max(minW, longest * perChar + 16));
  // Tighten gap a little when there are many cells, widen when few
  const gapPx = cells.length > 12 ? 6 : cells.length > 6 ? 10 : 14;

  function cellColor(state: string) {
    switch (state) {
      case "active": return { bg: "#9f1239", border: "#fb7185" };
      case "computed": return { bg: "#065f46", border: "#34d399" };
      case "highlighted": return { bg: "#78350f", border: "#fbbf24" };
      case "min": return { bg: "#1e1b4b", border: "#818cf8" };
      default: return { bg: "#18181b", border: "#3f3f46" };
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full h-full justify-center px-4 overflow-auto">
      {label && <div className="text-sm font-mono text-zinc-300 font-semibold">{label}</div>}
      <div className="flex flex-wrap justify-center items-end" style={{ gap: `${gapPx}px` }}>
        {cells.map((cell, i) => {
          const { bg, border } = cellColor(cell.state);
          const ptr = pointers.find((p) => p.index === i);
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              {ptr && (
                <div className="text-[10px] font-mono text-amber-400 font-semibold">{ptr.label}</div>
              )}
              {ptr && <div className="w-px h-2.5 bg-amber-400" />}
              <motion.div
                layout
                transition={{ type: "spring", damping: 20, stiffness: 250 }}
                className="flex items-center justify-center rounded-lg font-mono font-bold text-white text-xs px-2 shadow-md"
                style={{
                  width: cellW,
                  height: 46,
                  background: bg,
                  border: `1.5px solid ${border}`,
                }}
              >
                {String(cell.val)}
              </motion.div>
              <div className="text-[9px] font-mono text-zinc-600">{i}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Table2D Renderer ───────────────────────────────────────────────────── */
function Table2DRenderer({ visualState }: { visualState: VisualState }) {
  const matrix = (visualState.matrix as (number | string)[][] | undefined) ?? [];
  const rowLabels = (visualState.rowLabels as string[] | undefined) ?? [];
  const colLabels = (visualState.colLabels as string[] | undefined) ?? [];
  const activeCell = visualState.activeCell as [number, number] | undefined;
  const filledCells = (visualState.filledCells as [number, number][] | undefined) ?? [];
  const title = visualState.title as string | undefined;

  const filledSet = new Set(filledCells.map(([r, c]) => `${r},${c}`));
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  const cellSize = Math.min(44, Math.floor(480 / Math.max(cols + 1, 1)));

  return (
    <div className="flex flex-col items-center gap-2 overflow-auto max-h-full max-w-full">
      {title && <div className="text-xs font-mono text-zinc-400 font-semibold">{title}</div>}
      <div className="overflow-auto">
        <table className="border-collapse text-xs font-mono">
          <thead>
            <tr>
              <td className="p-1" style={{ width: cellSize, height: cellSize }} />
              {colLabels.map((cl, ci) => (
                <td key={ci} className="text-center text-zinc-500 font-semibold p-1" style={{ width: cellSize, height: cellSize }}>
                  {cl}
                </td>
              ))}
              {colLabels.length === 0 && Array.from({ length: cols }).map((_, ci) => (
                <td key={ci} className="text-center text-zinc-600 p-1" style={{ width: cellSize, height: cellSize }}>{ci}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, ri) => (
              <tr key={ri}>
                <td className="text-center text-zinc-500 font-semibold p-1" style={{ width: cellSize, height: cellSize }}>
                  {rowLabels[ri] ?? ri}
                </td>
                {row.map((val, ci) => {
                  const isActive = activeCell && activeCell[0] === ri && activeCell[1] === ci;
                  const isFilled = filledSet.has(`${ri},${ci}`);
                  const bg = isActive ? "#9f1239" : isFilled ? "#064e3b" : "#18181b";
                  const border = isActive ? "#fb7185" : isFilled ? "#34d399" : "#3f3f46";
                  return (
                    <td key={ci} style={{ width: cellSize, height: cellSize, padding: 2 }}>
                      <motion.div
                        layout
                        transition={{ type: "spring", damping: 20, stiffness: 250 }}
                        className="flex items-center justify-center rounded font-bold text-white"
                        style={{ width: "100%", height: "100%", background: bg, border: `1.5px solid ${border}`, fontSize: Math.min(12, cellSize * 0.3) }}
                      >
                        {String(val)}
                      </motion.div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Gantt Renderer ─────────────────────────────────────────────────────── */
function GanttRenderer({ visualState }: { visualState: VisualState }) {
  const processes = (visualState.processes as { name: string; color: string }[] | undefined) ?? [];
  const timeline = (visualState.timeline as { processName: string; start: number; end: number }[] | undefined) ?? [];
  const currentTime = typeof visualState.currentTime === "number" ? visualState.currentTime : 0;
  const maxTime = typeof visualState.maxTime === "number" ? visualState.maxTime : 1;

  const colorMap = new Map(processes.map((p) => [p.name, p.color]));
  const barH = 44;
  const startX = 60;
  const endX = 560;
  const totalW = endX - startX;
  const scale = totalW / Math.max(maxTime, 1);

  const cursorX = startX + currentTime * scale;

  return (
    <svg width="100%" height="100%" viewBox="0 0 600 200" className="w-full h-full">
      <text x={16} y={20} fontSize={10} fill="#818cf8" fontFamily="monospace" fontWeight="700">CPU SCHEDULING TIMELINE</text>

      {/* Timeline bar background */}
      <rect x={startX} y={40} width={totalW} height={barH} rx={4} fill="#18181b" stroke="#3f3f46" strokeWidth={1} />

      {timeline.map((seg, i) => {
        const x = startX + seg.start * scale;
        const w = (seg.end - seg.start) * scale;
        const color = colorMap.get(seg.processName) ?? "#6366f1";
        return (
          <g key={i}>
            <rect x={x} y={40} width={w} height={barH} rx={2} fill={color} opacity={0.85} />
            <text x={x + w / 2} y={40 + barH / 2 + 5} textAnchor="middle" fontSize={11} fill="white" fontFamily="monospace" fontWeight="700">
              {seg.processName}
            </text>
          </g>
        );
      })}

      {/* Time markers */}
      {Array.from({ length: maxTime + 1 }, (_, t) => {
        const x = startX + t * scale;
        return (
          <g key={t}>
            <line x1={x} y1={84} x2={x} y2={94} stroke="#6b7280" strokeWidth={1} />
            <text x={x} y={106} textAnchor="middle" fontSize={9} fill="#6b7280" fontFamily="monospace">{t}</text>
          </g>
        );
      })}

      {/* Current time cursor */}
      <line x1={cursorX} y1={34} x2={cursorX} y2={100} stroke="#f59e0b" strokeWidth={2} />
      <text x={cursorX} y={28} textAnchor="middle" fontSize={9} fill="#f59e0b" fontFamily="monospace">t={currentTime}</text>

      {/* Legend */}
      {processes.map((p, i) => (
        <g key={p.name}>
          <rect x={startX + i * 80} y={130} width={14} height={14} rx={3} fill={p.color} />
          <text x={startX + i * 80 + 18} y={142} fontSize={10} fill="#d1d5db" fontFamily="monospace">{p.name}</text>
        </g>
      ))}
    </svg>
  );
}

/* ─── NQueens Renderer ───────────────────────────────────────────────────── */
function NQueensRenderer({ visualState }: { visualState: VisualState }) {
  const n = typeof visualState.n === "number" ? visualState.n : 4;
  const queens = (visualState.queens as [number, number][] | undefined) ?? [];
  const current = visualState.current as [number, number] | undefined;
  const conflicted = (visualState.conflicted as [number, number][] | undefined) ?? [];

  const queensSet = new Set(queens.map(([r, c]) => `${r},${c}`));
  const conflictSet = new Set(conflicted.map(([r, c]) => `${r},${c}`));
  const currentKey = current ? `${current[0]},${current[1]}` : null;

  const cellSize = Math.min(52, Math.floor(320 / n));
  const boardW = n * cellSize;
  const offsetX = (600 - boardW) / 2;
  const offsetY = (260 - boardW) / 2;

  return (
    <svg width="100%" height="100%" viewBox="0 0 600 280" className="w-full h-full">
      <text x={300} y={18} textAnchor="middle" fontSize={11} fill="#818cf8" fontFamily="monospace" fontWeight="700">
        {n}-QUEENS BOARD
      </text>
      {Array.from({ length: n }, (_, r) =>
        Array.from({ length: n }, (_, c) => {
          const key = `${r},${c}`;
          const isLight = (r + c) % 2 === 0;
          const hasQueen = queensSet.has(key);
          const isConflict = conflictSet.has(key);
          const isCurrent = key === currentKey;

          let fill = isLight ? "#3f3f46" : "#27272a";
          if (isConflict) fill = "#450a0a";
          if (isCurrent) fill = "#78350f";

          return (
            <g key={key}>
              <rect
                x={offsetX + c * cellSize}
                y={offsetY + r * cellSize}
                width={cellSize}
                height={cellSize}
                fill={fill}
                stroke={isCurrent ? "#f59e0b" : isConflict ? "#ef4444" : "#18181b"}
                strokeWidth={isCurrent || isConflict ? 2 : 0.5}
              />
              {hasQueen && (
                <text
                  x={offsetX + c * cellSize + cellSize / 2}
                  y={offsetY + r * cellSize + cellSize / 2 + 6}
                  textAnchor="middle"
                  fontSize={cellSize * 0.6}
                  fill={isConflict ? "#ef4444" : "#f59e0b"}
                >
                  ♛
                </text>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}

/* ─── Sieve Renderer ─────────────────────────────────────────────────────── */
interface SieveNumber {
  val: number;
  state: "prime" | "composite" | "current" | "unmarked";
}

function SieveRenderer({ visualState }: { visualState: VisualState }) {
  const numbers = (visualState.numbers as SieveNumber[] | undefined) ?? [];

  function cellStyle(state: string) {
    switch (state) {
      case "prime": return { bg: "#065f46", border: "#34d399", text: "#a7f3d0" };
      case "composite": return { bg: "#27272a", border: "#3f3f46", text: "#52525b" };
      case "current": return { bg: "#78350f", border: "#fbbf24", text: "#fef3c7" };
      default: return { bg: "#18181b", border: "#3f3f46", text: "#d1d5db" };
    }
  }

  const cols = 10;
  const cellSize = 44;

  return (
    <div className="flex flex-col items-center gap-1 overflow-auto max-h-full">
      <div className="text-xs font-mono text-zinc-400 mb-1">Sieve of Eratosthenes</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gap: 3 }}>
        {numbers.map((num) => {
          const { bg, border, text } = cellStyle(num.state);
          return (
            <motion.div
              key={num.val}
              layout
              transition={{ type: "spring", damping: 20, stiffness: 250 }}
              className="flex items-center justify-center rounded font-mono font-bold text-xs"
              style={{
                width: cellSize,
                height: cellSize,
                background: bg,
                border: `1.5px solid ${border}`,
                color: text,
                textDecoration: num.state === "composite" ? "line-through" : "none",
              }}
            >
              {num.val}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Heap Renderer ──────────────────────────────────────────────────────── */
function HeapRenderer({ visualState }: { visualState: VisualState }) {
  const heap = (visualState.heap as number[] | undefined) ?? [];
  const activeIndices = (visualState.activeIndices as number[] | undefined) ?? [];
  const swapIndices = visualState.swapIndices as [number, number] | undefined;
  const mode = (visualState.mode as string) ?? "max";

  const n = heap.length;
  if (n === 0) return (
    <div className="m-auto text-xs text-zinc-500 font-mono">Empty heap</div>
  );

  // Compute positions for a binary tree layout
  const levels = Math.floor(Math.log2(n)) + 1;
  const svgW = 600;
  const svgH = 300;
  const levelH = svgH / (levels + 1);

  function pos(i: number): { x: number; y: number } {
    const level = Math.floor(Math.log2(i + 1));
    const levelNodes = Math.pow(2, level);
    const posInLevel = i - (levelNodes - 1);
    const x = (svgW / (levelNodes + 1)) * (posInLevel + 1);
    const y = (level + 1) * levelH;
    return { x, y };
  }

  const swapSet = new Set(swapIndices ?? []);

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
      <text x={300} y={18} textAnchor="middle" fontSize={10} fill="#818cf8" fontFamily="monospace" fontWeight="700">
        {mode.toUpperCase()}-HEAP (array index based)
      </text>

      {heap.map((_, i) => {
        const { x, y } = pos(i);
        const leftIdx = 2 * i + 1;
        const rightIdx = 2 * i + 2;
        return (
          <g key={`edges-${i}`}>
            {leftIdx < n && (() => {
              const { x: lx, y: ly } = pos(leftIdx);
              return <line x1={x} y1={y} x2={lx} y2={ly} stroke="#4c4880" strokeWidth={1.5} />;
            })()}
            {rightIdx < n && (() => {
              const { x: rx, y: ry } = pos(rightIdx);
              return <line x1={x} y1={y} x2={rx} y2={ry} stroke="#4c4880" strokeWidth={1.5} />;
            })()}
          </g>
        );
      })}

      {heap.map((val, i) => {
        const { x, y } = pos(i);
        const isActive = activeIndices.includes(i);
        const isSwap = swapSet.has(i);
        const fill = isSwap ? "#9f1239" : isActive ? "#1e1b4b" : "#1e1b4b";
        const stroke = isSwap ? "#fb7185" : isActive ? "#818cf8" : "#4c4880";

        return (
          <g key={i}>
            <circle cx={x} cy={y} r={20} fill={fill} stroke={stroke} strokeWidth={2} />
            <text x={x} y={y + 5} textAnchor="middle" fontSize={12} fontWeight="bold" fill="white" fontFamily="monospace">
              {val}
            </text>
            <text x={x} y={y + 32} textAnchor="middle" fontSize={9} fill="#6b7280" fontFamily="monospace">
              [{i}]
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Matrix Renderer ────────────────────────────────────────────────────── */
function MatrixRenderer({ visualState }: { visualState: VisualState }) {
  const matrix = (visualState.matrix as (number | string)[][] | undefined) ?? [];
  const rowLabels = (visualState.rowLabels as string[] | undefined) ?? [];
  const colLabels = (visualState.colLabels as string[] | undefined) ?? [];
  const highlighted = (visualState.highlighted as [number, number][] | undefined) ?? [];
  const active = visualState.active as [number, number] | undefined;
  const title = visualState.title as string | undefined;

  const highlightSet = new Set(highlighted.map(([r, c]) => `${r},${c}`));
  const cols = matrix[0]?.length ?? 0;
  const cellSize = Math.min(44, Math.floor(480 / Math.max(cols + 1, 1)));

  return (
    <div className="flex flex-col items-center gap-2 overflow-auto max-h-full max-w-full">
      {title && <div className="text-xs font-mono text-zinc-400 font-semibold">{title}</div>}
      <div className="overflow-auto">
        <table className="border-collapse text-xs font-mono">
          <thead>
            <tr>
              <td style={{ width: cellSize, height: cellSize }} />
              {colLabels.map((cl, ci) => (
                <td key={ci} className="text-center text-zinc-500 font-semibold p-1" style={{ width: cellSize }}>{cl}</td>
              ))}
              {colLabels.length === 0 && Array.from({ length: cols }).map((_, ci) => (
                <td key={ci} className="text-center text-zinc-600 p-1" style={{ width: cellSize }}>{ci}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, ri) => (
              <tr key={ri}>
                <td className="text-center text-zinc-500 font-semibold p-1" style={{ width: cellSize, height: cellSize }}>
                  {rowLabels[ri] ?? ri}
                </td>
                {row.map((val, ci) => {
                  const isActive = active && active[0] === ri && active[1] === ci;
                  const isHighlighted = highlightSet.has(`${ri},${ci}`);
                  const bg = isActive ? "#9f1239" : isHighlighted ? "#78350f" : "#18181b";
                  const border = isActive ? "#fb7185" : isHighlighted ? "#fbbf24" : "#3f3f46";
                  return (
                    <td key={ci} style={{ padding: 2 }}>
                      <div
                        className="flex items-center justify-center rounded font-bold text-white"
                        style={{ width: cellSize, height: cellSize, background: bg, border: `1.5px solid ${border}`, fontSize: Math.min(12, cellSize * 0.3) }}
                      >
                        {String(val)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Bit Renderer ───────────────────────────────────────────────────────── */
/* Accept bits as either a string ("1010") or a number[] ([1,0,1,0]) */
function normalizeBits(b: unknown): string {
  if (typeof b === "string") return b;
  if (Array.isArray(b)) return b.join("");
  if (typeof b === "number") return b.toString(2).padStart(8, "0");
  return "00000000";
}

function BitRenderer({ visualState }: { visualState: VisualState }) {
  const number = typeof visualState.number === "number" ? visualState.number : 0;
  const bits = normalizeBits(visualState.bits);
  const activeBits = new Set<number>((visualState.activeBits as number[] | undefined) ?? []);
  const label = visualState.label as string | undefined;
  const rawResult = visualState.result as { bits: unknown; number: number } | undefined;
  const rawOperandB = visualState.operandB as { bits: unknown; number: number } | undefined;
  const result = rawResult ? { bits: normalizeBits(rawResult.bits), number: rawResult.number } : undefined;
  const operandB = rawOperandB ? { bits: normalizeBits(rawOperandB.bits), number: rawOperandB.number } : undefined;

  const cellSize = 28;
  const gap = 2;
  const len = bits.length;
  const rowW = len * (cellSize + gap);

  function BitRow({ rowBits, rowNum, rowLabel }: { rowBits: string; rowNum: number; rowLabel: string }) {
    return (
      <g>
        <text x={-8} y={cellSize / 2 + 5} textAnchor="end" fontSize={10} fill="#9ca3af" fontFamily="monospace">{rowLabel}</text>
        {rowBits.split("").map((bit, i) => {
          const bitIndex = rowBits.length - 1 - i;
          const isActive = activeBits.has(bitIndex);
          const fill = isActive ? "#d97706" : bit === "1" ? "#6366f1" : "#3f3f46";
          const stroke = isActive ? "#fbbf24" : bit === "1" ? "#818cf8" : "#52525b";
          return (
            <g key={i}>
              <rect x={i * (cellSize + gap)} y={0} width={cellSize} height={cellSize} rx={4} fill={fill} stroke={stroke} strokeWidth={1.5} />
              <text x={i * (cellSize + gap) + cellSize / 2} y={cellSize / 2 + 5} textAnchor="middle" fontSize={12} fontWeight="bold" fill="white" fontFamily="monospace">{bit}</text>
            </g>
          );
        })}
        <text x={rowW + 8} y={cellSize / 2 + 5} fontSize={10} fill="#9ca3af" fontFamily="monospace">= {rowNum}</text>
      </g>
    );
  }

  const rowCount = 1 + (operandB ? 1 : 0) + (result ? 1 : 0);
  const svgH = 60 + rowCount * (cellSize + 12) + 24;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${rowW + 160} ${svgH}`} className="w-full h-full">
      {label && (
        <text x={(rowW + 160) / 2} y={20} textAnchor="middle" fontSize={11} fill="#f59e0b" fontFamily="monospace" fontWeight="700">{label}</text>
      )}
      <g transform="translate(80, 36)">
        <BitRow rowBits={bits} rowNum={number} rowLabel="A" />
        {operandB && (
          <g transform={`translate(0, ${cellSize + 12})`}>
            <BitRow rowBits={operandB.bits} rowNum={operandB.number} rowLabel="B" />
          </g>
        )}
        {result && (
          <g transform={`translate(0, ${(operandB ? 2 : 1) * (cellSize + 12)})`}>
            <line x1={0} y1={-4} x2={rowW} y2={-4} stroke="#4b5563" strokeWidth={1} />
            <BitRow rowBits={result.bits} rowNum={result.number} rowLabel="=" />
          </g>
        )}
        {/* Index labels */}
        {bits.split("").map((_, i) => {
          const bitIndex = bits.length - 1 - i;
          return (
            <text key={i} x={i * (cellSize + gap) + cellSize / 2} y={rowCount * (cellSize + 12) + 16} textAnchor="middle" fontSize={8} fill="#6b7280" fontFamily="monospace">{bitIndex}</text>
          );
        })}
      </g>
    </svg>
  );
}

/* ─── Geometry Renderer ──────────────────────────────────────────────────── */
interface GeoPoint { x: number; y: number; id?: string; state?: "default" | "active" | "hull" | "current" | "inside" | "outside" }
interface GeoLine { x1: number; y1: number; x2: number; y2: number; color?: string }

function GeometryRenderer({ visualState }: { visualState: VisualState }) {
  const points = (visualState.points as GeoPoint[]) ?? [];
  const lines = (visualState.lines as GeoLine[] | undefined) ?? [];
  const polygon = (visualState.polygon as { x: number; y: number }[] | undefined);
  const hullPoints = (visualState.hullPoints as { x: number; y: number }[] | undefined);
  const label = visualState.label as string | undefined;

  const svgW = 500;
  const svgH = 340;
  const pad = 40;

  const allX = points.map((p) => p.x);
  const allY = points.map((p) => p.y);
  const minX = allX.length ? Math.min(...allX) : 0;
  const maxX = allX.length ? Math.max(...allX) : 10;
  const minY = allY.length ? Math.min(...allY) : 0;
  const maxY = allY.length ? Math.max(...allY) : 10;

  const scaleX = scaleLinear().domain([minX - 1, maxX + 1]).range([pad, svgW - pad]);
  const scaleY = scaleLinear().domain([minY - 1, maxY + 1]).range([svgH - pad, pad]);

  function ptColor(state?: string) {
    switch (state) {
      case "hull": return "#10b981";
      case "active": return "#f59e0b";
      case "current": return "#f43f5e";
      case "inside": return "#6366f1";
      case "outside": return "#71717a";
      default: return "#6366f1";
    }
  }

  function polyPath(pts: { x: number; y: number }[]) {
    return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p.x)},${scaleY(p.y)}`).join(" ") + " Z";
  }

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
      {/* Axes */}
      <line x1={pad} y1={svgH - pad} x2={svgW - pad} y2={svgH - pad} stroke="#374151" strokeWidth={1} />
      <line x1={pad} y1={pad} x2={pad} y2={svgH - pad} stroke="#374151" strokeWidth={1} />

      {label && (
        <text x={svgW / 2} y={16} textAnchor="middle" fontSize={11} fill="#f59e0b" fontFamily="monospace" fontWeight="700">{label}</text>
      )}

      {/* Polygon */}
      {polygon && polygon.length > 1 && (
        <path d={polyPath(polygon)} fill="#6366f120" stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4,3" />
      )}

      {/* Hull */}
      {hullPoints && hullPoints.length > 1 && (
        <path d={polyPath(hullPoints)} fill="#10b98115" stroke="#10b981" strokeWidth={2} />
      )}

      {/* Lines */}
      {lines.map((l, i) => (
        <line key={i} x1={scaleX(l.x1)} y1={scaleY(l.y1)} x2={scaleX(l.x2)} y2={scaleY(l.y2)} stroke={l.color ?? "#818cf8"} strokeWidth={1.5} />
      ))}

      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={scaleX(p.x)} cy={scaleY(p.y)} r={6} fill={ptColor(p.state)} stroke="white" strokeWidth={1} />
          {p.id && (
            <text x={scaleX(p.x) + 9} y={scaleY(p.y) - 5} fontSize={9} fill="#9ca3af" fontFamily="monospace">{p.id}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

/* ─── Text Match Renderer ────────────────────────────────────────────────── */
function TextMatchRenderer({ visualState }: { visualState: VisualState }) {
  const text = (visualState.text as string) ?? "";
  const pattern = (visualState.pattern as string) ?? "";
  const textHighlight = new Set<number>((visualState.textHighlight as number[] | undefined) ?? []);
  const patternHighlight = new Set<number>((visualState.patternHighlight as number[] | undefined) ?? []);
  const matchIndices = new Set<number>((visualState.matchIndices as number[] | undefined) ?? []);
  const mismatchIndex = visualState.mismatchIndex as number | undefined;
  const offset = typeof visualState.offset === "number" ? visualState.offset : 0;
  const label = visualState.label as string | undefined;

  const cellW = 28;
  const cellH = 32;
  const gap = 2;

  function textCellColor(i: number) {
    if (i === mismatchIndex) return { fill: "#9f1239", stroke: "#fb7185" };
    if (matchIndices.has(i)) return { fill: "#065f46", stroke: "#34d399" };
    if (textHighlight.has(i)) return { fill: "#78350f", stroke: "#fbbf24" };
    return { fill: "#18181b", stroke: "#3f3f46" };
  }

  function patCellColor(i: number) {
    const ti = i + offset;
    if (ti === mismatchIndex) return { fill: "#9f1239", stroke: "#fb7185" };
    if (patternHighlight.has(i)) return { fill: "#312e81", stroke: "#818cf8" };
    return { fill: "#18181b", stroke: "#3f3f46" };
  }

  const totalW = Math.max(text.length, pattern.length + offset) * (cellW + gap) + 80;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${totalW} 160`} className="w-full h-full">
      {label && (
        <text x={totalW / 2} y={16} textAnchor="middle" fontSize={11} fill="#f59e0b" fontFamily="monospace" fontWeight="700">{label}</text>
      )}

      {/* Text row */}
      <text x={4} y={45} fontSize={9} fill="#9ca3af" fontFamily="monospace">text</text>
      {text.split("").map((ch, i) => {
        const { fill, stroke } = textCellColor(i);
        const x = 44 + i * (cellW + gap);
        return (
          <g key={i}>
            <rect x={x} y={26} width={cellW} height={cellH} rx={4} fill={fill} stroke={stroke} strokeWidth={1.5} />
            <text x={x + cellW / 2} y={26 + cellH / 2 + 5} textAnchor="middle" fontSize={12} fontWeight="bold" fill="white" fontFamily="monospace">{ch}</text>
            <text x={x + cellW / 2} y={26 + cellH + 12} textAnchor="middle" fontSize={8} fill="#6b7280" fontFamily="monospace">{i}</text>
          </g>
        );
      })}

      {/* Pattern row */}
      <text x={4} y={105} fontSize={9} fill="#9ca3af" fontFamily="monospace">pat</text>
      {pattern.split("").map((ch, i) => {
        const { fill, stroke } = patCellColor(i);
        const x = 44 + (i + offset) * (cellW + gap);
        return (
          <g key={i}>
            <rect x={x} y={86} width={cellW} height={cellH} rx={4} fill={fill} stroke={stroke} strokeWidth={1.5} />
            <text x={x + cellW / 2} y={86 + cellH / 2 + 5} textAnchor="middle" fontSize={12} fontWeight="bold" fill="white" fontFamily="monospace">{ch}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Scatter Plot Renderer ──────────────────────────────────────────────── */
interface ScatterPoint { x: number; y: number; label?: number | string; cluster?: number }
interface Centroid { x: number; y: number; id: number }

function ScatterRenderer({ visualState }: { visualState: VisualState }) {
  const points = (visualState.points as ScatterPoint[]) ?? [];
  const centroids = (visualState.centroids as Centroid[] | undefined) ?? [];
  const clusterColors = (visualState.clusterColors as string[] | undefined) ?? ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#06b6d4", "#ec4899"];
  const decisionBoundary = visualState.decisionBoundary as { x1: number; y1: number; x2: number; y2: number } | undefined;
  const title = visualState.title as string | undefined;

  const svgW = 500;
  const svgH = 340;
  const pad = 40;

  const allX = [...points.map((p) => p.x), ...centroids.map((c) => c.x)];
  const allY = [...points.map((p) => p.y), ...centroids.map((c) => c.y)];
  const minX = allX.length ? Math.min(...allX) : 0;
  const maxX = allX.length ? Math.max(...allX) : 10;
  const minY = allY.length ? Math.min(...allY) : 0;
  const maxY = allY.length ? Math.max(...allY) : 10;

  const sx = scaleLinear().domain([minX - 1, maxX + 1]).range([pad, svgW - pad]);
  const sy = scaleLinear().domain([minY - 1, maxY + 1]).range([svgH - pad, pad]);

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
      {title && <text x={svgW / 2} y={16} textAnchor="middle" fontSize={11} fill="#f59e0b" fontFamily="monospace" fontWeight="700">{title}</text>}

      {/* Axes */}
      <line x1={pad} y1={svgH - pad} x2={svgW - pad} y2={svgH - pad} stroke="#374151" strokeWidth={1} />
      <line x1={pad} y1={pad} x2={pad} y2={svgH - pad} stroke="#374151" strokeWidth={1} />

      {/* Decision boundary */}
      {decisionBoundary && (
        <line x1={sx(decisionBoundary.x1)} y1={sy(decisionBoundary.y1)} x2={sx(decisionBoundary.x2)} y2={sy(decisionBoundary.y2)} stroke="#818cf8" strokeWidth={1.5} strokeDasharray="6,3" />
      )}

      {/* Points */}
      {points.map((p, i) => {
        const color = p.cluster !== undefined ? (clusterColors[p.cluster % clusterColors.length] ?? "#6366f1") : "#6366f1";
        return (
          <g key={i}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={5} fill={color} fillOpacity={0.75} stroke={color} strokeWidth={1} />
            {p.label !== undefined && (
              <text x={sx(p.x) + 7} y={sy(p.y) + 4} fontSize={8} fill="#9ca3af" fontFamily="monospace">{p.label}</text>
            )}
          </g>
        );
      })}

      {/* Centroids as ✕ */}
      {centroids.map((c) => {
        const color = clusterColors[c.id % clusterColors.length] ?? "#f59e0b";
        const cx = sx(c.x);
        const cy = sy(c.y);
        const r = 7;
        return (
          <g key={c.id}>
            <line x1={cx - r} y1={cy - r} x2={cx + r} y2={cy + r} stroke={color} strokeWidth={2.5} />
            <line x1={cx + r} y1={cy - r} x2={cx - r} y2={cy + r} stroke={color} strokeWidth={2.5} />
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Neural Network Renderer ────────────────────────────────────────────── */
interface NNLayer { size: number; label?: string }

function NeuralNetRenderer({ visualState }: { visualState: VisualState }) {
  const layers = (visualState.layers as NNLayer[]) ?? [];
  const activations = (visualState.activations as number[][] | undefined) ?? [];
  const weights = (visualState.weights as number[][][] | undefined) ?? [];
  const activeLayer = typeof visualState.activeLayer === "number" ? visualState.activeLayer : -1;
  const highlightedEdges = (visualState.highlightedEdges as [number, number, number][] | undefined) ?? [];
  const title = visualState.title as string | undefined;

  const svgW = 600;
  const svgH = 320;
  const padX = 60;
  const padY = 40;

  const maxNodes = Math.max(...layers.map((l) => l.size), 1);
  const layerX = layers.map((_, li) =>
    padX + li * ((svgW - 2 * padX) / Math.max(layers.length - 1, 1))
  );

  function nodeY(li: number, ni: number) {
    const n = layers[li].size;
    const usableH = svgH - 2 * padY;
    const spacing = usableH / Math.max(n - 1, 1);
    const startY = padY + (maxNodes - n) * spacing / 2;
    return n === 1 ? svgH / 2 : startY + ni * spacing;
  }

  const hlEdgeSet = new Set(highlightedEdges.map(([l, f, t]) => `${l},${f},${t}`));

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
      {title && <text x={svgW / 2} y={14} textAnchor="middle" fontSize={11} fill="#f59e0b" fontFamily="monospace" fontWeight="700">{title}</text>}

      {/* Edges */}
      {layers.slice(0, -1).map((layer, li) =>
        Array.from({ length: layer.size }, (_, fi) =>
          Array.from({ length: layers[li + 1].size }, (_, ti) => {
            const isHl = hlEdgeSet.has(`${li},${fi},${ti}`);
            const w = weights[li]?.[fi]?.[ti];
            const opacity = w !== undefined ? Math.min(1, Math.abs(w) + 0.15) : 0.3;
            return (
              <line key={`${li}-${fi}-${ti}`}
                x1={layerX[li]} y1={nodeY(li, fi)}
                x2={layerX[li + 1]} y2={nodeY(li + 1, ti)}
                stroke={isHl ? "#f59e0b" : "#4c4880"}
                strokeWidth={isHl ? 2 : 1}
                strokeOpacity={isHl ? 1 : opacity}
              />
            );
          })
        )
      )}

      {/* Nodes */}
      {layers.map((layer, li) =>
        Array.from({ length: layer.size }, (_, ni) => {
          const act = activations[li]?.[ni] ?? 0;
          const isActiveLyr = li === activeLayer;
          const fill = isActiveLyr ? `rgba(245,158,11,${0.2 + act * 0.7})` : `rgba(99,102,241,${0.15 + act * 0.7})`;
          const stroke = isActiveLyr ? "#f59e0b" : "#818cf8";
          return (
            <g key={`${li}-${ni}`}>
              <circle cx={layerX[li]} cy={nodeY(li, ni)} r={14} fill={fill} stroke={stroke} strokeWidth={1.5} />
              <text x={layerX[li]} y={nodeY(li, ni) + 4} textAnchor="middle" fontSize={9} fill="white" fontFamily="monospace">
                {act > 0 ? act.toFixed(1) : ""}
              </text>
            </g>
          );
        })
      )}

      {/* Layer labels */}
      {layers.map((layer, li) => (
        <text key={li} x={layerX[li]} y={svgH - 6} textAnchor="middle" fontSize={9} fill="#6b7280" fontFamily="monospace">
          {layer.label ?? (li === 0 ? "in" : li === layers.length - 1 ? "out" : `h${li}`)}
        </text>
      ))}
    </svg>
  );
}

/* ─── Blockchain Renderer ────────────────────────────────────────────────── */
interface BlockData { index: number; hash: string; prevHash: string; data: string; nonce?: number; valid: boolean }

function BlockchainRenderer({ visualState }: { visualState: VisualState }) {
  const blocks = (visualState.blocks as BlockData[]) ?? [];
  const currentBlock = visualState.currentBlock as number | undefined;
  const miningBlock = visualState.miningBlock as number | undefined;

  const blockW = 110;
  const blockH = 90;
  const gap = 36;
  const startX = 20;
  const y = 80;
  const totalW = Math.max(600, blocks.length * (blockW + gap) + startX + 20);

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${totalW} 220`} className="w-full h-full">
      <text x={totalW / 2} y={20} textAnchor="middle" fontSize={11} fill="#818cf8" fontFamily="monospace" fontWeight="700">BLOCKCHAIN</text>

      {blocks.map((block, i) => {
        const x = startX + i * (blockW + gap);
        const isCurrent = block.index === currentBlock;
        const isMining = block.index === miningBlock;
        const stroke = isMining ? "#f59e0b" : block.valid ? "#10b981" : "#f43f5e";
        const fill = isMining ? "#78350f30" : block.valid ? "#065f4630" : "#9f123930";

        return (
          <g key={block.index}>
            {/* Arrow from prev */}
            {i > 0 && (
              <line
                x1={x - gap + 4} y1={y + blockH / 2}
                x2={x - 4} y2={y + blockH / 2}
                stroke="#4c4880" strokeWidth={1.5}
                markerEnd="url(#bc-arrow)"
              />
            )}
            <rect x={x} y={y} width={blockW} height={blockH} rx={6} fill={fill} stroke={stroke} strokeWidth={isMining || isCurrent ? 2.5 : 1.5} />
            <text x={x + blockW / 2} y={y + 16} textAnchor="middle" fontSize={9} fill={stroke} fontFamily="monospace" fontWeight="700">Block #{block.index}</text>
            <text x={x + blockW / 2} y={y + 32} textAnchor="middle" fontSize={7} fill="#9ca3af" fontFamily="monospace">h: {block.hash.slice(0, 8)}…</text>
            <text x={x + blockW / 2} y={y + 46} textAnchor="middle" fontSize={7} fill="#6b7280" fontFamily="monospace">p: {block.prevHash.slice(0, 8)}…</text>
            <text x={x + blockW / 2} y={y + 62} textAnchor="middle" fontSize={8} fill="#d1d5db" fontFamily="monospace">{String(block.data).slice(0, 12)}</text>
            {block.nonce !== undefined && (
              <text x={x + blockW / 2} y={y + 76} textAnchor="middle" fontSize={7} fill="#818cf8" fontFamily="monospace">nonce: {block.nonce}</text>
            )}
          </g>
        );
      })}

      <defs>
        <marker id="bc-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#4c4880" />
        </marker>
      </defs>
    </svg>
  );
}

/* ─── Quantum Circuit Renderer ───────────────────────────────────────────── */
interface QGate { qubit: number; col: number; name: string; color?: string }
interface QCGate { control: number; target: number; col: number }
interface QMeasure { qubit: number; col: number; result?: string }

function QuantumRenderer({ visualState }: { visualState: VisualState }) {
  const qubits = (visualState.qubits as { label: string; state: string }[]) ?? [];
  const gates = (visualState.gates as QGate[]) ?? [];
  const controlledGates = (visualState.controlledGates as QCGate[] | undefined) ?? [];
  const measurements = (visualState.measurements as QMeasure[] | undefined) ?? [];
  const cols = typeof visualState.cols === "number" ? visualState.cols : 4;
  const currentCol = typeof visualState.currentCol === "number" ? visualState.currentCol : -1;

  const wireGap = 52;
  const colW = 60;
  const startX = 100;
  const startY = 40;
  const gateSize = 28;
  const svgW = startX + cols * colW + 60;
  const svgH = startY + qubits.length * wireGap + 40;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
      {/* Column highlights */}
      {currentCol >= 0 && (
        <rect x={startX + currentCol * colW - colW / 2 + 4} y={startY - 12} width={colW} height={qubits.length * wireGap} rx={4} fill="#f59e0b18" stroke="#f59e0b40" strokeWidth={1} />
      )}

      {/* Qubit labels and wires */}
      {qubits.map((q, qi) => {
        const y = startY + qi * wireGap;
        return (
          <g key={qi}>
            <text x={startX - 8} y={y + 5} textAnchor="end" fontSize={10} fill="#818cf8" fontFamily="monospace">{q.label}</text>
            <text x={startX - 8} y={y + 16} textAnchor="end" fontSize={8} fill="#6b7280" fontFamily="monospace">{q.state}</text>
            <line x1={startX} y1={y} x2={svgW - 20} y2={y} stroke="#3f3f46" strokeWidth={1.5} />
          </g>
        );
      })}

      {/* Single-qubit gates */}
      {gates.map((g, i) => {
        const x = startX + g.col * colW;
        const y = startY + g.qubit * wireGap;
        const color = g.color ?? "#6366f1";
        return (
          <g key={`g-${i}`}>
            <rect x={x - gateSize / 2} y={y - gateSize / 2} width={gateSize} height={gateSize} rx={4} fill={`${color}30`} stroke={color} strokeWidth={1.5} />
            <text x={x} y={y + 5} textAnchor="middle" fontSize={10} fontWeight="bold" fill={color} fontFamily="monospace">{g.name}</text>
          </g>
        );
      })}

      {/* CNOT controlled gates */}
      {controlledGates.map((cg, i) => {
        const x = startX + cg.col * colW;
        const cy = startY + cg.control * wireGap;
        const ty = startY + cg.target * wireGap;
        return (
          <g key={`cg-${i}`}>
            <line x1={x} y1={cy} x2={x} y2={ty} stroke="#818cf8" strokeWidth={1.5} />
            <circle cx={x} cy={cy} r={5} fill="#818cf8" />
            <circle cx={x} cy={ty} r={12} fill="#6366f130" stroke="#818cf8" strokeWidth={1.5} />
            <line x1={x - 12} y1={ty} x2={x + 12} y2={ty} stroke="#818cf8" strokeWidth={1.5} />
            <line x1={x} y1={ty - 12} x2={x} y2={ty + 12} stroke="#818cf8" strokeWidth={1.5} />
          </g>
        );
      })}

      {/* Measurements */}
      {measurements.map((m, i) => {
        const x = startX + m.col * colW;
        const y = startY + m.qubit * wireGap;
        return (
          <g key={`m-${i}`}>
            <rect x={x - gateSize / 2} y={y - gateSize / 2} width={gateSize} height={gateSize} rx={4} fill="#06b6d430" stroke="#06b6d4" strokeWidth={1.5} />
            <text x={x} y={y + 5} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#06b6d4" fontFamily="monospace">M</text>
            {m.result && <text x={x} y={y + gateSize / 2 + 12} textAnchor="middle" fontSize={9} fill="#f59e0b" fontFamily="monospace">{m.result}</text>}
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Pipeline Renderer ──────────────────────────────────────────────────── */
interface PipelineInstruction { name: string; stages: Record<string, number> }
interface PipelineStall { instruction: number; stage: string; cycle: number }

function PipelineRenderer({ visualState }: { visualState: VisualState }) {
  const stages = (visualState.stages as string[]) ?? ["IF", "ID", "EX", "MEM", "WB"];
  const instructions = (visualState.instructions as PipelineInstruction[]) ?? [];
  const currentCycle = typeof visualState.currentCycle === "number" ? visualState.currentCycle : 0;
  // Some modules pass stalls as a count (number) rather than a list
  const stalls = Array.isArray(visualState.stalls) ? (visualState.stalls as PipelineStall[]) : [];
  const hazards = Array.isArray(visualState.hazards) ? (visualState.hazards as string[]) : [];

  const stallSet = new Set(stalls.map((s) => `${s.instruction},${s.stage},${s.cycle}`));

  // Find total cycle range
  const allCycles: number[] = [];
  for (const instr of instructions) {
    allCycles.push(...Object.values(instr.stages));
  }
  const minCycle = allCycles.length ? Math.min(...allCycles) : 1;
  const maxCycle = allCycles.length ? Math.max(...allCycles) : currentCycle;
  const totalCycles = maxCycle - minCycle + 1;

  const cellW = 36;
  const cellH = 32;
  const labelW = 80;
  const headerH = 28;
  const svgW = labelW + totalCycles * cellW + 20;
  const svgH = headerH + instructions.length * cellH + 40;

  function stageColor(stageName: string) {
    const colors: Record<string, string> = {
      IF: "#6366f1", ID: "#8b5cf6", EX: "#ec4899", MEM: "#f59e0b", WB: "#10b981",
    };
    return colors[stageName] ?? "#6366f1";
  }

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
      <text x={svgW / 2} y={14} textAnchor="middle" fontSize={10} fill="#818cf8" fontFamily="monospace" fontWeight="700">PIPELINE DIAGRAM</text>

      {/* Cycle headers */}
      {Array.from({ length: totalCycles }, (_, i) => {
        const cycle = minCycle + i;
        const x = labelW + i * cellW;
        const isCurrent = cycle === currentCycle;
        return (
          <g key={cycle}>
            {isCurrent && <rect x={x} y={headerH} width={cellW} height={instructions.length * cellH} fill="#f59e0b10" />}
            <text x={x + cellW / 2} y={headerH - 6} textAnchor="middle" fontSize={9} fill={isCurrent ? "#f59e0b" : "#6b7280"} fontFamily="monospace" fontWeight={isCurrent ? "700" : "400"}>{cycle}</text>
          </g>
        );
      })}

      {/* Instructions */}
      {instructions.map((instr, ii) => {
        const y = headerH + ii * cellH;
        return (
          <g key={ii}>
            <text x={labelW - 6} y={y + cellH / 2 + 4} textAnchor="end" fontSize={9} fill="#d1d5db" fontFamily="monospace">{instr.name}</text>
            {Object.entries(instr.stages).map(([stage, cycle]) => {
              const ci = cycle - minCycle;
              const x = labelW + ci * cellW;
              const isStall = stallSet.has(`${ii},${stage},${cycle}`);
              const color = isStall ? "#f43f5e" : stageColor(stage);
              return (
                <g key={stage}>
                  <rect x={x + 1} y={y + 2} width={cellW - 2} height={cellH - 4} rx={3} fill={`${color}30`} stroke={color} strokeWidth={1.5} />
                  <text x={x + cellW / 2} y={y + cellH / 2 + 4} textAnchor="middle" fontSize={8} fontWeight="bold" fill={color} fontFamily="monospace">{stage}</text>
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Hazard labels */}
      {hazards.length > 0 && (
        <text x={labelW} y={svgH - 6} fontSize={9} fill="#f43f5e" fontFamily="monospace">Hazards: {hazards.join(", ")}</text>
      )}
    </svg>
  );
}

/* ─── Placeholder Renderer ────────────────────────────────────────────────── */
function PlaceholderRenderer() {
  return (
    <div className="m-auto flex flex-col items-center gap-3 text-center">
      <div className="text-4xl opacity-20">🔧</div>
      <p className="text-xs text-zinc-500 font-mono max-w-xs">
        Visualization module coming soon. The step-through and code panel are
        already wired — just needs a custom renderer.
      </p>
    </div>
  );
}

/* ─── Main Canvas Router ─────────────────────────────────────────────────── */
export function VisualizationCanvas({ visualState }: VisualizationCanvasProps) {
  const type = visualState?.type;

  let renderer: React.ReactNode;

  if (!visualState || type === "placeholder") {
    renderer = <PlaceholderRenderer />;
  } else if (type === "graph") {
    renderer = <GraphRenderer visualState={visualState} />;
  } else if (type === "tree") {
    renderer = <TreeRenderer visualState={visualState} />;
  } else if (type === "linkedlist") {
    renderer = <LinkedListRenderer visualState={visualState} />;
  } else if (type === "stackqueue") {
    renderer = <StackQueueRenderer visualState={visualState} />;
  } else if (type === "hashtable") {
    renderer = <HashTableRenderer visualState={visualState} />;
  } else if (type === "flowdiagram") {
    renderer = <FlowDiagramRenderer visualState={visualState} />;
  } else if (type === "search") {
    renderer = <SearchRenderer visualState={visualState} />;
  } else if (type === "array1d") {
    renderer = <Array1DRenderer visualState={visualState} />;
  } else if (type === "table2d") {
    renderer = <Table2DRenderer visualState={visualState} />;
  } else if (type === "gantt") {
    renderer = <GanttRenderer visualState={visualState} />;
  } else if (type === "nqueens") {
    renderer = <NQueensRenderer visualState={visualState} />;
  } else if (type === "sieve") {
    renderer = <SieveRenderer visualState={visualState} />;
  } else if (type === "heap") {
    renderer = <HeapRenderer visualState={visualState} />;
  } else if (type === "matrix") {
    renderer = <MatrixRenderer visualState={visualState} />;
  } else if (type === "bits") {
    renderer = <BitRenderer visualState={visualState} />;
  } else if (type === "geometry") {
    renderer = <GeometryRenderer visualState={visualState} />;
  } else if (type === "textmatch") {
    renderer = <TextMatchRenderer visualState={visualState} />;
  } else if (type === "scatter") {
    renderer = <ScatterRenderer visualState={visualState} />;
  } else if (type === "neural") {
    renderer = <NeuralNetRenderer visualState={visualState} />;
  } else if (type === "blockchain") {
    renderer = <BlockchainRenderer visualState={visualState} />;
  } else if (type === "quantum") {
    renderer = <QuantumRenderer visualState={visualState} />;
  } else if (type === "pipeline") {
    renderer = <PipelineRenderer visualState={visualState} />;
  } else {
    // Default: sorting bar chart (handles array-based states without a type)
    renderer = <SortingRenderer visualState={visualState} />;
  }

  return (
    <div className="h-full w-full rounded-2xl border border-white/5 bg-zinc-950/60 flex flex-col relative overflow-hidden shadow-inner">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.03),transparent_60%)] pointer-events-none" />
      <div className="flex-1 min-h-0 flex items-stretch justify-stretch relative z-10 p-3">
        <div className="flex-1 min-w-0 min-h-0">
          {renderer}
        </div>
      </div>
    </div>
  );
}
