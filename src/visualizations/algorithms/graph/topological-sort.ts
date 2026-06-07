import type { AnimationStep, VisualizationModule } from "@/types/visualization";

// DAG nodes
const NODES = [
  { id: "A", label: "A", x: 60,  y: 160 },
  { id: "B", label: "B", x: 200, y: 60 },
  { id: "C", label: "C", x: 200, y: 260 },
  { id: "D", label: "D", x: 360, y: 60 },
  { id: "E", label: "E", x: 360, y: 260 },
  { id: "F", label: "F", x: 500, y: 160 },
];

const EDGES = [
  { from: "A", to: "B", directed: true },
  { from: "A", to: "C", directed: true },
  { from: "B", to: "D", directed: true },
  { from: "C", to: "D", directed: true },
  { from: "C", to: "E", directed: true },
  { from: "D", to: "F", directed: true },
  { from: "E", to: "F", directed: true },
];

const pythonCode = `def topological_sort(graph):
    visited = set()
    stack = []

    def dfs(v):
        visited.add(v)
        for neighbor in graph[v]:
            if neighbor not in visited:
                dfs(neighbor)
        stack.append(v)

    for v in graph:
        if v not in visited:
            dfs(v)

    return stack[::-1]`;

export const topologicalSortModule: VisualizationModule<null> = {
  id: "graph-topological-sort",
  slug: "topological-sort",
  title: "Topological Sort",
  category: ["algorithms", "graph"],
  difficulty: "intermediate",
  timeComplexity: "O(V + E)",
  spaceComplexity: "O(V)",
  description: "Orders vertices so every directed edge goes from earlier to later. Uses DFS and a result stack.",
  relatedTopics: ["dfs", "kahns-algorithm"],
  pythonCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const visited = new Set<string>();
    const stack: string[] = [];
    const frontier = new Set<string>();

    const adj = new Map<string, string[]>();
    for (const n of NODES) adj.set(n.id, []);
    for (const e of EDGES) adj.get(e.from)!.push(e.to);

    function pushStep(desc: string, lines: number[], current?: string) {
      steps.push({
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: lines,
        visualState: { type: "graph", nodes: NODES, edges: EDGES, visited: [...visited], frontier: [...frontier], current, distances: {} },
        variables: { visited: [...visited].join("→"), stack: [...stack].join(","), topoOrder: [...stack].reverse().join("→") },
      });
    }

    pushStep("Starting topological sort (DFS-based) on DAG.", [1, 2, 3]);

    function dfs(v: string) {
      visited.add(v);
      frontier.add(v);
      pushStep(`DFS visit ${v}. Explore neighbors.`, [4, 5, 6], v);

      for (const nb of adj.get(v) ?? []) {
        if (!visited.has(nb)) {
          pushStep(`Go deeper: ${v} → ${nb}.`, [6, 7, 8], nb);
          dfs(nb);
        }
      }

      frontier.delete(v);
      stack.push(v);
      pushStep(`${v} finished. Push ${v} to stack. Stack: [${stack.join(", ")}].`, [9], v);
    }

    for (const n of NODES) {
      if (!visited.has(n.id)) {
        pushStep(`Start DFS from unvisited node ${n.id}.`, [11, 12], n.id);
        dfs(n.id);
      }
    }

    const result = [...stack].reverse();
    pushStep(`Topological order: ${result.join(" → ")}.`, [14]);

    return steps;
  },
};
