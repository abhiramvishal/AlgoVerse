import type { AnimationStep, VisualizationModule } from "@/types/visualization";

/* ── Graph definition ──────────────────────────────────────────────────────── */
const DEFAULT_NODES = [
  { id: "A", label: "A", x: 300, y: 40 },
  { id: "B", label: "B", x: 140, y: 120 },
  { id: "C", label: "C", x: 460, y: 120 },
  { id: "D", label: "D", x: 60,  y: 220 },
  { id: "E", label: "E", x: 220, y: 220 },
  { id: "F", label: "F", x: 380, y: 220 },
  { id: "G", label: "G", x: 540, y: 220 },
  { id: "H", label: "H", x: 300, y: 300 },
];

const DEFAULT_EDGES = [
  { from: "A", to: "B", directed: false },
  { from: "A", to: "C", directed: false },
  { from: "B", to: "D", directed: false },
  { from: "B", to: "E", directed: false },
  { from: "C", to: "F", directed: false },
  { from: "C", to: "G", directed: false },
  { from: "E", to: "H", directed: false },
  { from: "F", to: "H", directed: false },
];

function buildAdj(edges: typeof DEFAULT_EDGES): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    if (!adj.has(e.to)) adj.set(e.to, []);
    adj.get(e.from)!.push(e.to);
    if (!e.directed) adj.get(e.to)!.push(e.from);
  }
  return adj;
}

/* ── Python code ───────────────────────────────────────────────────────────── */
const pythonCode = `def dfs(graph, start):
    visited = set()
    order = []

    def dfs_recursive(node):
        visited.add(node)
        order.append(node)

        for neighbor in graph[node]:
            if neighbor not in visited:
                dfs_recursive(neighbor)

    dfs_recursive(start)
    return order`;

/* ── Step generation ───────────────────────────────────────────────────────── */
function generateDFSSteps(startId: string): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const adj = buildAdj(DEFAULT_EDGES);
  const nodes = DEFAULT_NODES;
  const edges = DEFAULT_EDGES;

  const visited: string[] = [];
  const order: string[] = [];
  const stack: string[] = []; // the call stack (for display)

  function push(
    desc: string,
    lines: number[],
    current: string | undefined,
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
        frontier: [...stack],
        current,
      },
      variables: {
        callStack: `[${stack.join(", ")}]`,
        visited: `{${visited.join(", ")}}`,
        order: `[${order.join(", ")}]`,
        current: current ?? "—",
      },
    });
  }

  push(
    `Start DFS from node ${startId}.`,
    [1, 2, 3, 12],
    undefined,
  );

  function dfs(node: string) {
    visited.push(node);
    order.push(node);
    stack.push(node);

    push(
      `Visit node ${node} — mark visited, add to order.`,
      [5, 6, 7],
      node,
    );

    const neighbors = adj.get(node) ?? [];
    for (const nb of neighbors) {
      if (!visited.includes(nb)) {
        push(
          `Neighbor ${nb} of ${node} is unvisited — recurse into it.`,
          [9, 10, 11],
          node,
        );
        dfs(nb);
      } else {
        push(
          `Neighbor ${nb} already visited — skip.`,
          [9, 10],
          node,
        );
      }
    }

    stack.pop();
    push(
      `Return from ${node} — backtrack.`,
      [11],
      stack[stack.length - 1],
    );
  }

  dfs(startId);

  push(
    `DFS complete. Traversal order: ${order.join(" → ")}.`,
    [12],
    undefined,
  );

  return steps;
}

/* ── Module ────────────────────────────────────────────────────────────────── */
export const dfsModule: VisualizationModule<string> = {
  id: "graph-dfs",
  slug: "dfs",
  title: "Depth-First Search",
  category: ["algorithms", "graph"],
  difficulty: "beginner",
  timeComplexity: "O(V + E)",
  spaceComplexity: "O(V)",
  description:
    "Explores a graph by going as deep as possible before backtracking — uses recursion or an explicit stack.",
  relatedTopics: ["bfs", "topological-sort", "tarjan-scc"],
  pythonCode,
  codeSteps: [],
  defaultInput: "A",
  generateSteps(input) {
    return generateDFSSteps(input ?? "A");
  },
};
