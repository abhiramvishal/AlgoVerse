import type { AnimationStep, VisualizationModule } from "@/types/visualization";

/* ── Graph definition ──────────────────────────────────────────────────────── */
// A simple undirected graph with positioned nodes for the visual layout
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

// Build adjacency list
function buildAdj(
  edges: typeof DEFAULT_EDGES,
): Map<string, string[]> {
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
const pythonCode = `from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    order = []

    while queue:
        node = queue.popleft()
        order.append(node)

        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

    return order`;

/* ── Step generation ───────────────────────────────────────────────────────── */
function generateBFSSteps(startId: string): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const adj = buildAdj(DEFAULT_EDGES);
  const nodes = DEFAULT_NODES;
  const edges = DEFAULT_EDGES;

  function push(
    desc: string,
    lines: number[],
    visited: string[],
    frontier: string[],
    current: string | undefined,
    order: string[],
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
        frontier: [...frontier],
        current,
      },
      variables: {
        queue: `[${frontier.join(", ")}]`,
        visited: `{${visited.join(", ")}}`,
        order: `[${order.join(", ")}]`,
        current: current ?? "—",
      },
    });
  }

  const visited: string[] = [];
  const frontier: string[] = [startId];
  const order: string[] = [];
  visited.push(startId);

  push(
    `Initialize BFS from node ${startId}. Add to queue and mark visited.`,
    [3, 4, 5, 6, 7],
    [...visited],
    [...frontier],
    undefined,
    [...order],
  );

  while (frontier.length > 0) {
    const current = frontier.shift()!;
    order.push(current);

    push(
      `Dequeue node ${current}. Add to traversal order.`,
      [9, 10, 11],
      [...visited],
      [...frontier],
      current,
      [...order],
    );

    const neighbors = adj.get(current) ?? [];
    for (const nb of neighbors) {
      if (!visited.includes(nb)) {
        visited.push(nb);
        frontier.push(nb);

        push(
          `Neighbor ${nb} of ${current} is unvisited — enqueue it.`,
          [13, 14, 15, 16],
          [...visited],
          [...frontier],
          current,
          [...order],
        );
      } else {
        push(
          `Neighbor ${nb} already visited — skip.`,
          [13, 14],
          [...visited],
          [...frontier],
          current,
          [...order],
        );
      }
    }
  }

  push(
    `BFS complete. Traversal order: ${order.join(" → ")}.`,
    [18],
    [...visited],
    [],
    undefined,
    [...order],
  );

  return steps;
}

/* ── Module ────────────────────────────────────────────────────────────────── */
export const bfsModule: VisualizationModule<string> = {
  id: "graph-bfs",
  slug: "bfs",
  title: "Breadth-First Search",
  category: ["algorithms", "graph"],
  difficulty: "beginner",
  timeComplexity: "O(V + E)",
  spaceComplexity: "O(V)",
  description:
    "Explores a graph level by level using a queue — visits all neighbors before going deeper.",
  relatedTopics: ["dfs", "dijkstra", "bfs-shortest-path"],
  pythonCode,
  codeSteps: [],
  defaultInput: "A",
  generateSteps(input) {
    return generateBFSSteps(input ?? "A");
  },
};
