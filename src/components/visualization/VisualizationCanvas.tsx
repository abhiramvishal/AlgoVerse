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
  const barScale = scaleLinear().domain([0, maxValue]).range([24, 260]);

  return (
    <div className="flex h-full items-end gap-2 relative z-10">
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
          <div key={`bar-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className="text-[10px] font-semibold font-mono text-zinc-400">{value}</span>
            <motion.div
              layout
              transition={{ type: "spring", damping: 18, stiffness: 220 }}
              className={`w-full rounded-t-lg border bg-gradient-to-t shadow-lg relative overflow-hidden ${barGradientClass}`}
              style={{ height: `${barScale(value)}px` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)] -translate-x-full animate-[shimmer_2.5s_infinite] pointer-events-none" />
            </motion.div>
            <span className="text-[9px] font-mono text-zinc-600">{index}</span>
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
              stroke={isOnPath ? "#10b981" : isActive ? "#818cf8" : "#4c4880"}
              strokeWidth={isOnPath ? 2.5 : isActive ? 2 : 1.5}
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
  const cells = (visualState.cells as (string | number)[]) ?? [];
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
        {display.map((val, i) => {
          const originalIndex = cells.length - 1 - i;
          const isActive = originalIndex === activeIndex;
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
                {val}
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
      {cells.map((val, i) => {
        const isActive = i === activeIndex;
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
              {val}
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
  } else {
    // Default: sorting bar chart (handles array-based states without a type)
    renderer = <SortingRenderer visualState={visualState} />;
  }

  return (
    <div className="h-full rounded-2xl border border-white/5 bg-zinc-950/60 p-4 flex flex-col justify-end relative overflow-hidden shadow-inner">
      {/* Dynamic ambient background mesh inside canvas */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.03),transparent_60%)] pointer-events-none" />
      <div className="h-full flex items-center justify-center relative z-10">
        {renderer}
      </div>
    </div>
  );
}
