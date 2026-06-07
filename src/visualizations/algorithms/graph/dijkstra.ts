import type { AnimationStep, VisualizationModule } from "@/types/visualization";

/* ── Graph definition ──────────────────────────────────────────────────────── */
// A weighted directed graph
const DEFAULT_NODES = [
  { id: "A", label: "A", x: 60,  y: 160 },
  { id: "B", label: "B", x: 200, y: 60 },
  { id: "C", label: "C", x: 200, y: 260 },
  { id: "D", label: "D", x: 360, y: 60 },
  { id: "E", label: "E", x: 360, y: 260 },
  { id: "F", label: "F", x: 500, y: 160 },
];

const DEFAULT_EDGES = [
  { from: "A", to: "B", weight: 4,  directed: true },
  { from: "A", to: "C", weight: 2,  directed: true },
  { from: "B", to: "C", weight: 1,  directed: true },
  { from: "B", to: "D", weight: 5,  directed: true },
  { from: "C", to: "E", weight: 8,  directed: true },
  { from: "C", to: "D", weight: 10, directed: true },
  { from: "D", to: "F", weight: 2,  directed: true },
  { from: "E", to: "D", weight: 2,  directed: true },
  { from: "E", to: "F", weight: 5,  directed: true },
];

type NodeId = "A" | "B" | "C" | "D" | "E" | "F";

interface WeightedAdj {
  to: string;
  weight: number;
}

function buildWeightedAdj(): Map<string, WeightedAdj[]> {
  const adj = new Map<string, WeightedAdj[]>();
  for (const node of DEFAULT_NODES) adj.set(node.id, []);
  for (const e of DEFAULT_EDGES) {
    adj.get(e.from)!.push({ to: e.to, weight: e.weight });
  }
  return adj;
}

/* ── Python code ───────────────────────────────────────────────────────────── */
const pythonCode = `import heapq

def dijkstra(graph, start):
    dist = {node: float('inf') for node in graph}
    dist[start] = 0
    prev = {node: None for node in graph}
    pq = [(0, start)]   # (distance, node)

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue          # stale entry

        for neighbor, weight in graph[u]:
            new_dist = dist[u] + weight
            if new_dist < dist[neighbor]:
                dist[neighbor] = new_dist
                prev[neighbor] = u
                heapq.heappush(pq, (new_dist, neighbor))

    return dist, prev`;

/* ── Step generation ───────────────────────────────────────────────────────── */
function generateDijkstraSteps(startId: string): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const adj = buildWeightedAdj();
  const nodes = DEFAULT_NODES;
  const edges = DEFAULT_EDGES;
  const INF = Infinity;

  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  for (const n of nodes) {
    dist[n.id] = INF;
    prev[n.id] = null;
  }
  dist[startId] = 0;

  const visited: string[] = [];

  function distLabel(d: number) {
    return d === INF ? "∞" : String(d);
  }

  function distRecord() {
    const rec: Record<string, number | null> = {};
    for (const [k, v] of Object.entries(dist)) {
      rec[k] = v === INF ? null : v;
    }
    return rec;
  }

  function push(
    desc: string,
    lines: number[],
    current: string | undefined,
    relaxed?: string,
  ) {
    steps.push({
      stepNumber: steps.length + 1,
      description: desc,
      highlightLines: lines,
      visualState: {
        type: "graph",
        nodes,
        edges,
        visited: [...visited],
        frontier: [],
        current,
        distances: distRecord(),
        relaxed,
      },
      variables: {
        current: current ?? "—",
        dist: JSON.stringify(
          Object.fromEntries(
            Object.entries(dist).map(([k, v]) => [k, v === INF ? "∞" : v]),
          ),
        ),
        prev: JSON.stringify(
          Object.fromEntries(
            Object.entries(prev).map(([k, v]) => [k, v ?? "null"]),
          ),
        ),
      },
    });
  }

  push(
    `Initialize distances: ${startId}=0, all others=∞.`,
    [3, 4, 5, 6, 7],
    undefined,
  );

  // Simple priority queue simulation
  const pq: { dist: number; node: string }[] = [{ dist: 0, node: startId }];

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist);
    const { dist: d, node: u } = pq.shift()!;

    if (d > dist[u]) {
      push(
        `Stale entry for ${u} (${d} > ${distLabel(dist[u])}) — skip.`,
        [10, 11, 12],
        u,
      );
      continue;
    }

    if (visited.includes(u)) continue;
    visited.push(u);

    push(
      `Process node ${u} with shortest distance ${distLabel(dist[u])}.`,
      [9, 10],
      u,
    );

    const neighbors = adj.get(u) ?? [];
    for (const { to: nb, weight } of neighbors) {
      const newDist = dist[u] + weight;

      push(
        `Check edge ${u}→${nb} (weight ${weight}). New distance candidate: ${distLabel(dist[u])} + ${weight} = ${newDist}.`,
        [14, 15, 16],
        u,
        nb,
      );

      if (newDist < dist[nb]) {
        dist[nb] = newDist;
        prev[nb] = u;
        pq.push({ dist: newDist, node: nb });

        push(
          `Relaxed! dist[${nb}] updated to ${newDist}. Previous node set to ${u}.`,
          [16, 17, 18, 19],
          u,
          nb,
        );
      } else {
        push(
          `No improvement for ${nb} (${distLabel(dist[nb])} ≤ ${newDist}) — skip.`,
          [16],
          u,
        );
      }
    }
  }

  push(
    `Dijkstra complete. Shortest distances from ${startId}: ${Object.entries(dist)
      .map(([k, v]) => `${k}=${distLabel(v)}`)
      .join(", ")}.`,
    [21],
    undefined,
  );

  return steps;
}

/* ── Module ────────────────────────────────────────────────────────────────── */
export const dijkstraModule: VisualizationModule<string> = {
  id: "graph-dijkstra",
  slug: "dijkstra",
  title: "Dijkstra's Shortest Path",
  category: ["algorithms", "graph"],
  difficulty: "intermediate",
  timeComplexity: "O((V + E) log V)",
  spaceComplexity: "O(V)",
  description:
    "Greedy single-source shortest path for weighted graphs using a priority queue.",
  relatedTopics: ["bfs", "bellman-ford", "a-star"],
  pythonCode,
  codeSteps: [],
  defaultInput: "A",
  generateSteps(input) {
    return generateDijkstraSteps(input ?? "A");
  },
};
