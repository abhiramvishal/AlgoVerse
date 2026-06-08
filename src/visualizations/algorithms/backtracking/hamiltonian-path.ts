import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def hamiltonian_path(graph, n):
    path = [-1] * n
    path[0] = 0
    def is_safe(v, pos):
        if v not in graph[path[pos-1]]:
            return False
        if v in path:
            return False
        return True
    def backtrack(pos):
        if pos == n:
            return True
        for v in range(n):
            if is_safe(v, pos):
                path[pos] = v
                if backtrack(pos + 1):
                    return True
                path[pos] = -1
        return False
    return backtrack(1), path`;

// 5-node graph with edges forming a hamiltonian path
const NODES = [
  { id: 0, label: "0", x: 300, y: 80 },
  { id: 1, label: "1", x: 500, y: 220 },
  { id: 2, label: "2", x: 430, y: 420 },
  { id: 3, label: "3", x: 170, y: 420 },
  { id: 4, label: "4", x: 100, y: 220 },
];
const EDGES_DEF = [
  { from: 0, to: 1, directed: false },
  { from: 0, to: 3, directed: false },
  { from: 1, to: 2, directed: false },
  { from: 1, to: 3, directed: false },
  { from: 2, to: 4, directed: false },
  { from: 3, to: 4, directed: false },
];
const ADJ: number[][] = [
  [1, 3],
  [0, 2, 3],
  [1, 4],
  [0, 1, 4],
  [2, 3],
];

export const hamiltonianPathModule: VisualizationModule<null> = {
  id: "backtracking-hamiltonian-path",
  slug: "hamiltonian-path",
  title: "Hamiltonian Path",
  category: ["algorithms", "backtracking"],
  difficulty: "advanced",
  timeComplexity: "O(n!)",
  spaceComplexity: "O(n)",
  description:
    "Find a Hamiltonian path (visits all nodes exactly once) using backtracking.",
  relatedTopics: ["graph-coloring", "n-queens"],
  pythonCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps(_input) {
    const steps: AnimationStep[] = [];
    const n = NODES.length;
    const path: number[] = new Array(n).fill(-1);
    path[0] = 0;

    function snapshot(pathEdges: [number, number][], current: number) {
      return {
        type: "graph",
        nodes: NODES.map((nd) => ({
          ...nd,
          label: path.includes(nd.id) ? `${nd.id}✓` : String(nd.id),
        })),
        edges: EDGES_DEF,
        visited: path.filter((v) => v >= 0),
        frontier: [current],
        current,
        distances: {},
        path: path.filter((v) => v >= 0),
        mstEdges: pathEdges,
      };
    }

    steps.push({
      stepNumber: 1,
      description: "Find Hamiltonian path starting from node 0.",
      highlightLines: [1, 2],
      visualState: snapshot([], 0),
      variables: { path: [0], pos: 1 },
    });

    function isSafe(v: number, pos: number): boolean {
      if (!ADJ[path[pos - 1]].includes(v)) return false;
      if (path.includes(v)) return false;
      return true;
    }

    function getPathEdges(): [number, number][] {
      const edges: [number, number][] = [];
      for (let i = 0; i < n - 1; i++) {
        if (path[i] >= 0 && path[i + 1] >= 0) {
          edges.push([path[i], path[i + 1]]);
        }
      }
      return edges;
    }

    function backtrack(pos: number): boolean {
      if (steps.length >= 76) return true;
      if (pos === n) return true;

      for (let v = 0; v < n; v++) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Position ${pos}: try adding node ${v}.`,
          highlightLines: [12, 13],
          visualState: snapshot(getPathEdges(), v),
          variables: { pos, trying: v, currentPath: path.filter((x) => x >= 0) },
        });

        if (isSafe(v, pos)) {
          path[pos] = v;
          steps.push({
            stepNumber: steps.length + 1,
            description: `Add node ${v} at position ${pos}. Path: [${path.filter((x) => x >= 0).join("->")}]`,
            highlightLines: [14, 15],
            visualState: snapshot(getPathEdges(), v),
            variables: { pos, added: v, path: path.filter((x) => x >= 0) },
          });

          if (backtrack(pos + 1)) return true;

          path[pos] = -1;
          steps.push({
            stepNumber: steps.length + 1,
            description: `Backtrack: remove node ${v} from position ${pos}.`,
            highlightLines: [17],
            visualState: snapshot(getPathEdges(), v),
            variables: { pos, backtrack: v },
          });
        }
      }
      return false;
    }

    backtrack(1);

    const finalPath = path.filter((v) => v >= 0);
    steps.push({
      stepNumber: steps.length + 1,
      description: finalPath.length === n
        ? `Hamiltonian path found: ${finalPath.join(" -> ")}`
        : "No Hamiltonian path exists.",
      highlightLines: [19],
      visualState: snapshot(getPathEdges(), -1),
      variables: { hamiltonianPath: finalPath },
    });

    return steps;
  },
};
