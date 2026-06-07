import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const NODES = [
  { id: "A", label: "A", x: 60,  y: 160 },
  { id: "B", label: "B", x: 200, y: 60 },
  { id: "C", label: "C", x: 200, y: 260 },
  { id: "D", label: "D", x: 360, y: 60 },
  { id: "E", label: "E", x: 360, y: 260 },
  { id: "F", label: "F", x: 500, y: 160 },
];

const EDGES = [
  { from: "A", to: "B", weight: 4,  directed: false },
  { from: "A", to: "C", weight: 2,  directed: false },
  { from: "B", to: "C", weight: 1,  directed: false },
  { from: "B", to: "D", weight: 5,  directed: false },
  { from: "C", to: "E", weight: 8,  directed: false },
  { from: "D", to: "E", weight: 2,  directed: false },
  { from: "D", to: "F", weight: 6,  directed: false },
  { from: "E", to: "F", weight: 3,  directed: false },
];

type AdjEntry = { to: string; weight: number };

function buildAdj() {
  const adj = new Map<string, AdjEntry[]>();
  for (const n of NODES) adj.set(n.id, []);
  for (const e of EDGES) {
    adj.get(e.from)!.push({ to: e.to, weight: e.weight });
    adj.get(e.to)!.push({ to: e.from, weight: e.weight });
  }
  return adj;
}

const pythonCode = `def prim(graph, start):
    in_mst = set()
    key = {v: float('inf') for v in graph}
    parent = {v: None for v in graph}
    key[start] = 0
    pq = [(0, start)]

    while pq:
        w, u = heapq.heappop(pq)
        if u in in_mst: continue
        in_mst.add(u)
        for v, weight in graph[u]:
            if v not in in_mst and weight < key[v]:
                key[v] = weight
                parent[v] = u
                heapq.heappush(pq, (weight, v))
    return parent`;

export const primModule: VisualizationModule<null> = {
  id: "graph-prim",
  slug: "prim",
  title: "Prim's MST",
  category: ["algorithms", "graph"],
  difficulty: "intermediate",
  timeComplexity: "O((V+E) log V)",
  spaceComplexity: "O(V)",
  description: "Grows MST from a start node by always picking the minimum weight edge to an unvisited node.",
  relatedTopics: ["kruskal", "dijkstra"],
  pythonCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const adj = buildAdj();
    const inMst = new Set<string>();
    const key: Record<string, number> = {};
    const mstEdges: [string, string][] = [];

    for (const n of NODES) key[n.id] = Infinity;
    key["A"] = 0;

    function pushStep(desc: string, lines: number[], current?: string, relaxed?: string) {
      steps.push({
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: lines,
        visualState: { type: "graph", nodes: NODES, edges: EDGES, visited: [...inMst], frontier: [], current, distances: Object.fromEntries(Object.entries(key).map(([k, v]) => [k, v === Infinity ? null : v])), relaxed, mstEdges: [...mstEdges] },
        variables: { inMst: [...inMst].join(","), mstEdges: mstEdges.map(([u, v]) => `${u}-${v}`).join(", ") },
      });
    }

    pushStep("Initialize Prim's from node A. key[A]=0, all others=∞.", [1, 2, 3, 4, 5]);

    const pq: { weight: number; node: string; from: string | null }[] = [{ weight: 0, node: "A", from: null }];

    while (pq.length > 0) {
      pq.sort((a, b) => a.weight - b.weight);
      const { node: u, from } = pq.shift()!;

      if (inMst.has(u)) continue;
      inMst.add(u);

      if (from) {
        mstEdges.push([from, u]);
        pushStep(`Add node ${u} to MST via edge ${from}-${u} (weight=${key[u]}).`, [8, 9, 10], u);
      } else {
        pushStep(`Start with node ${u}. Add to MST.`, [8, 9, 10], u);
      }

      for (const { to: v, weight: w } of adj.get(u) ?? []) {
        if (!inMst.has(v) && w < key[v]) {
          key[v] = w;
          pq.push({ weight: w, node: v, from: u });
          pushStep(`Update key[${v}] = ${w} via ${u}. Added to priority queue.`, [12, 13, 14, 15], u, v);
        }
      }
    }

    pushStep(`Prim's complete. MST: ${mstEdges.map(([u, v]) => `${u}-${v}`).join(", ")}.`, [17]);
    return steps;
  },
};
