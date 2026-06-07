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

const pythonCode = `def kruskal(nodes, edges):
    parent = {n: n for n in nodes}
    rank = {n: 0 for n in nodes}

    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]

    def union(x, y):
        px, py = find(x), find(y)
        if px == py: return False
        if rank[px] < rank[py]: px, py = py, px
        parent[py] = px
        if rank[px] == rank[py]: rank[px] += 1
        return True

    mst = []
    for u, v, w in sorted(edges, key=lambda e: e[2]):
        if union(u, v):
            mst.append((u, v, w))
    return mst`;

export const kruskalModule: VisualizationModule<null> = {
  id: "graph-kruskal",
  slug: "kruskal",
  title: "Kruskal's MST",
  category: ["algorithms", "graph"],
  difficulty: "intermediate",
  timeComplexity: "O(E log E)",
  spaceComplexity: "O(V)",
  description: "Builds a Minimum Spanning Tree by greedily adding the lightest edge that doesn't form a cycle.",
  relatedTopics: ["prim", "union-find"],
  pythonCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const parent: Record<string, string> = {};
    const rank: Record<string, number> = {};
    for (const n of NODES) { parent[n.id] = n.id; rank[n.id] = 0; }

    function find(x: string): string {
      if (parent[x] !== x) parent[x] = find(parent[x]);
      return parent[x];
    }

    function union(x: string, y: string): boolean {
      let px = find(x), py = find(y);
      if (px === py) return false;
      if (rank[px] < rank[py]) [px, py] = [py, px];
      parent[py] = px;
      if (rank[px] === rank[py]) rank[px]++;
      return true;
    }

    const mstEdges: [string, string][] = [];
    const sortedEdges = [...EDGES].sort((a, b) => a.weight - b.weight);

    function pushStep(desc: string, lines: number[], current?: string, relaxed?: string) {
      steps.push({
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: lines,
        visualState: { type: "graph", nodes: NODES, edges: EDGES, visited: mstEdges.map(([u]) => u), frontier: [], current, distances: {}, relaxed, mstEdges: [...mstEdges] },
        variables: { mstEdgeCount: mstEdges.length, mstEdges: mstEdges.map(([u, v]) => `${u}-${v}`).join(", ") },
      });
    }

    pushStep("Sort all edges by weight. Start adding lightest edges that don't create cycles.", [17, 18]);

    for (const edge of sortedEdges) {
      const { from: u, to: v, weight: w } = edge;
      pushStep(`Consider edge ${u}-${v} (weight=${w}). Check if adding creates a cycle.`, [18, 19], u, v);

      if (union(u, v)) {
        mstEdges.push([u, v]);
        pushStep(`Edge ${u}-${v} added to MST! MST now has ${mstEdges.length} edges.`, [20], u, v);
      } else {
        pushStep(`Edge ${u}-${v} skipped — would create a cycle (same component).`, [19], u, v);
      }

      if (mstEdges.length === NODES.length - 1) break;
    }

    pushStep(`Kruskal's complete. MST has ${mstEdges.length} edges: ${mstEdges.map(([u, v]) => `${u}-${v}`).join(", ")}.`, [21]);

    return steps;
  },
};
