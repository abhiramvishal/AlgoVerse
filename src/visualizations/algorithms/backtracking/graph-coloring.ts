import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def graph_coloring(graph, num_colors):
    n = len(graph)
    colors = [0] * n
    def is_safe(node, color):
        for neighbor in graph[node]:
            if colors[neighbor] == color:
                return False
        return True
    def backtrack(node):
        if node == n:
            return True
        for color in range(1, num_colors + 1):
            if is_safe(node, color):
                colors[node] = color
                if backtrack(node + 1):
                    return True
                colors[node] = 0
        return False
    return backtrack(0), colors`;

// 5-node cycle graph: 0-1-2-3-4-0
const NODES = [
  { id: 0, label: "0", x: 300, y: 80 },
  { id: 1, label: "1", x: 500, y: 220 },
  { id: 2, label: "2", x: 430, y: 420 },
  { id: 3, label: "3", x: 170, y: 420 },
  { id: 4, label: "4", x: 100, y: 220 },
];
const EDGES = [
  { from: 0, to: 1, directed: false },
  { from: 1, to: 2, directed: false },
  { from: 2, to: 3, directed: false },
  { from: 3, to: 4, directed: false },
  { from: 4, to: 0, directed: false },
  { from: 0, to: 2, directed: false },
];
const ADJ: number[][] = [
  [1, 4, 2],
  [0, 2],
  [1, 3, 0],
  [2, 4],
  [3, 0],
];
const COLOR_NAMES = ["", "C1", "C2", "C3", "C4"];

export const graphColoringModule: VisualizationModule<null> = {
  id: "backtracking-graph-coloring",
  slug: "graph-coloring",
  title: "Graph Coloring",
  category: ["algorithms", "backtracking"],
  difficulty: "advanced",
  timeComplexity: "O(k^n)",
  spaceComplexity: "O(n)",
  description:
    "Color a graph so no two adjacent nodes share a color using backtracking.",
  relatedTopics: ["hamiltonian-path", "n-queens"],
  pythonCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps(_input) {
    const steps: AnimationStep[] = [];
    const n = NODES.length;
    const colors = new Array(n).fill(0);

    function makeNodes(current: number, conflicted: number[] = []) {
      return NODES.map((node) => ({
        ...node,
        label: colors[node.id] > 0
          ? `${node.id}:${COLOR_NAMES[colors[node.id]]}`
          : String(node.id),
      }));
    }

    function snapshot(currentNode: number, conflicted: number[] = []) {
      return {
        type: "graph",
        nodes: makeNodes(currentNode, conflicted),
        edges: EDGES,
        visited: colors.map((c, i) => c > 0 ? i : -1).filter((i) => i >= 0),
        frontier: [currentNode],
        current: currentNode,
        distances: {},
        path: [],
        mstEdges: [],
      };
    }

    steps.push({
      stepNumber: 1,
      description: "Graph coloring: assign colors so no adjacent nodes share a color.",
      highlightLines: [1],
      visualState: snapshot(0),
      variables: { colors: [...colors] },
    });

    function isSafe(node: number, color: number): boolean {
      for (const neighbor of ADJ[node]) {
        if (colors[neighbor] === color) return false;
      }
      return true;
    }

    function backtrack(node: number): boolean {
      if (steps.length >= 76) return true;
      if (node === n) return true;
      for (let color = 1; color <= 3; color++) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Node ${node}: try color ${COLOR_NAMES[color]}.`,
          highlightLines: [10, 11],
          visualState: snapshot(node),
          variables: { node, tryingColor: COLOR_NAMES[color] },
        });

        if (isSafe(node, color)) {
          colors[node] = color;
          steps.push({
            stepNumber: steps.length + 1,
            description: `Node ${node} colored ${COLOR_NAMES[color]}. Valid!`,
            highlightLines: [12, 13],
            visualState: snapshot(node),
            variables: { node, assignedColor: COLOR_NAMES[color], colors: [...colors] },
          });

          if (backtrack(node + 1)) return true;

          colors[node] = 0;
          steps.push({
            stepNumber: steps.length + 1,
            description: `Backtrack: uncolor node ${node}.`,
            highlightLines: [15],
            visualState: snapshot(node),
            variables: { node, backtrack: true },
          });
        } else {
          const conflicted = ADJ[node].filter((nb) => colors[nb] === color);
          steps.push({
            stepNumber: steps.length + 1,
            description: `Color ${COLOR_NAMES[color]} conflicts with neighbor(s) ${conflicted.join(",")}.`,
            highlightLines: [4, 5, 6],
            visualState: snapshot(node, conflicted),
            variables: { node, conflict: conflicted },
          });
        }
      }
      return false;
    }

    backtrack(0);

    steps.push({
      stepNumber: steps.length + 1,
      description: `Graph colored successfully with colors: ${colors.map((c, i) => `${i}:${COLOR_NAMES[c]}`).join(", ")}`,
      highlightLines: [17],
      visualState: snapshot(-1),
      variables: { coloring: colors.map((c) => COLOR_NAMES[c]) },
    });

    return steps;
  },
};
