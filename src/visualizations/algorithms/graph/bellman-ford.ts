import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const NODES = [
  { id: "A", label: "A", x: 60,  y: 160 },
  { id: "B", label: "B", x: 200, y: 60 },
  { id: "C", label: "C", x: 200, y: 260 },
  { id: "D", label: "D", x: 360, y: 60 },
  { id: "E", label: "E", x: 360, y: 260 },
  { id: "F", label: "F", x: 500, y: 160 },
];

// Directed weighted graph (allows negative weights)
const EDGES = [
  { from: "A", to: "B", weight: 4,  directed: true },
  { from: "A", to: "C", weight: 2,  directed: true },
  { from: "B", to: "C", weight: -3, directed: true },
  { from: "B", to: "D", weight: 5,  directed: true },
  { from: "C", to: "E", weight: 3,  directed: true },
  { from: "D", to: "F", weight: 2,  directed: true },
  { from: "E", to: "D", weight: 1,  directed: true },
  { from: "E", to: "F", weight: 5,  directed: true },
];

const pythonCode = `def bellman_ford(graph, edges, source):
    dist = {v: float('inf') for v in graph}
    dist[source] = 0
    V = len(graph)

    for i in range(V - 1):
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w

    # Check for negative cycles
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            return None  # Negative cycle

    return dist`;

export const bellmanFordModule: VisualizationModule<null> = {
  id: "graph-bellman-ford",
  slug: "bellman-ford",
  title: "Bellman-Ford Algorithm",
  category: ["algorithms", "graph"],
  difficulty: "intermediate",
  timeComplexity: "O(V·E)",
  spaceComplexity: "O(V)",
  description: "Single-source shortest paths that handles negative weights by relaxing all edges V-1 times.",
  relatedTopics: ["dijkstra", "floyd-warshall"],
  pythonCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const INF = Infinity;
    const dist: Record<string, number> = {};
    for (const n of NODES) dist[n.id] = INF;
    dist["A"] = 0;

    function distRecord() {
      const rec: Record<string, number | null> = {};
      for (const [k, v] of Object.entries(dist)) rec[k] = v === INF ? null : v;
      return rec;
    }

    function push(desc: string, lines: number[], current?: string, relaxed?: string) {
      steps.push({
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: lines,
        visualState: { type: "graph", nodes: NODES, edges: EDGES, visited: [], frontier: [], current, distances: distRecord(), relaxed },
        variables: { dist: JSON.stringify(Object.fromEntries(Object.entries(dist).map(([k, v]) => [k, v === INF ? "∞" : v]))) },
      });
    }

    push("Initialize: dist[A]=0, all others=∞.", [1, 2, 3]);

    const V = NODES.length;
    for (let i = 0; i < V - 1; i++) {
      push(`Round ${i + 1} of ${V - 1}: relax all edges.`, [5, 6]);

      for (const edge of EDGES) {
        const { from: u, to: v, weight: w } = edge;
        if (dist[u] === INF) continue;
        const newDist = dist[u] + w;

        push(`Relax edge ${u}→${v} (w=${w}). dist[${u}]=${dist[u] === INF ? "∞" : dist[u]} + ${w} = ${newDist} vs dist[${v}]=${dist[v] === INF ? "∞" : dist[v]}.`, [7, 8], u, v);

        if (newDist < dist[v]) {
          dist[v] = newDist;
          push(`Updated dist[${v}] = ${newDist}.`, [8], u, v);
        }
      }
    }

    push("All V-1 rounds done. Check for negative cycles.", [11, 12]);
    let hasNegCycle = false;
    for (const edge of EDGES) {
      const { from: u, to: v, weight: w } = edge;
      if (dist[u] !== INF && dist[u] + w < dist[v]) {
        hasNegCycle = true;
        push(`Negative cycle detected via edge ${u}→${v}!`, [12, 13], u, v);
      }
    }

    if (!hasNegCycle) {
      push(`Bellman-Ford complete. No negative cycles. Shortest distances from A: ${Object.entries(dist).map(([k, v]) => `${k}=${v === INF ? "∞" : v}`).join(", ")}.`, [15]);
    }

    return steps;
  },
};
