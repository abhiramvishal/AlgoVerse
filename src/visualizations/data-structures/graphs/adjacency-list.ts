import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `from collections import defaultdict, deque

class Graph:
    def __init__(self):
        self.adj = defaultdict(list)

    def add_edge(self, u, v):
        self.adj[u].append(v)
        self.adj[v].append(u)

    def bfs(self, start):
        visited = set([start])
        queue = deque([start])
        order = []
        while queue:
            node = queue.popleft()
            order.append(node)
            for neighbor in self.adj[node]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        return order`;

const NODES = [
  { id: 0, label: "0", x: 300, y: 40 },
  { id: 1, label: "1", x: 150, y: 140 },
  { id: 2, label: "2", x: 450, y: 140 },
  { id: 3, label: "3", x: 100, y: 260 },
  { id: 4, label: "4", x: 250, y: 260 },
];

const EDGES = [
  { from: 0, to: 1, directed: false },
  { from: 0, to: 2, directed: false },
  { from: 1, to: 3, directed: false },
  { from: 1, to: 4, directed: false },
  { from: 2, to: 4, directed: false },
];

const ADJ: number[][] = [
  [1, 2],    // 0
  [0, 3, 4], // 1
  [0, 4],    // 2
  [1],       // 3
  [1, 2],    // 4
];

export const adjacencyListModule: VisualizationModule<null> = {
  id: "data-structures-graphs-adjacency-list",
  slug: "adjacency-list",
  title: "Adjacency List",
  category: ["data-structures", "graphs"],
  difficulty: "beginner",
  timeComplexity: "O(V+E)",
  spaceComplexity: "O(V+E)",
  description: "Graph represented as an adjacency list; each vertex stores its neighbors. Demonstrates BFS traversal.",
  relatedTopics: ["adjacency-matrix", "edge-list"],
  pythonCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps(_input) {
    const steps: AnimationStep[] = [];

    steps.push({
      stepNumber: steps.length + 1,
      description: "Graph with 5 nodes (0-4) and 5 undirected edges. Adjacency list representation.",
      highlightLines: [3, 4, 5],
      visualState: {
        type: "graph",
        nodes: NODES,
        edges: EDGES,
        visited: [],
        frontier: [],
        current: -1,
      },
      variables: {
        adj: ADJ.map((n, i) => `${i}: [${n.join(",")}]`),
      },
    });

    // Show adj list per node
    for (let v = 0; v < 5; v++) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `Node ${v} adjacency list: [${ADJ[v].join(", ")}].`,
        highlightLines: [7, 8, 9],
        visualState: {
          type: "graph",
          nodes: NODES,
          edges: EDGES,
          visited: [],
          frontier: ADJ[v],
          current: v,
        },
        variables: { node: v, neighbors: ADJ[v] },
      });
    }

    // BFS from 0
    const visited = new Set<number>();
    const queue: number[] = [0];
    visited.add(0);
    const order: number[] = [];

    steps.push({
      stepNumber: steps.length + 1,
      description: "BFS from node 0: initialize queue with [0], mark 0 visited.",
      highlightLines: [13, 14, 15],
      visualState: {
        type: "graph",
        nodes: NODES,
        edges: EDGES,
        visited: [...visited],
        frontier: [...queue],
        current: 0,
      },
      variables: { queue: [...queue], visited: [...visited] },
    });

    while (queue.length > 0) {
      const node = queue.shift()!;
      order.push(node);

      steps.push({
        stepNumber: steps.length + 1,
        description: `Dequeue node ${node}. Explore neighbors: [${ADJ[node].join(", ")}].`,
        highlightLines: [16, 17],
        visualState: {
          type: "graph",
          nodes: NODES,
          edges: EDGES,
          visited: [...visited],
          frontier: [...queue],
          current: node,
        },
        variables: { current: node, queue: [...queue], order: [...order] },
      });

      for (const nb of ADJ[node]) {
        if (!visited.has(nb)) {
          visited.add(nb);
          queue.push(nb);
          steps.push({
            stepNumber: steps.length + 1,
            description: `Enqueue neighbor ${nb} of node ${node}.`,
            highlightLines: [18, 19, 20],
            visualState: {
              type: "graph",
              nodes: NODES,
              edges: EDGES,
              visited: [...visited],
              frontier: [...queue],
              current: node,
            },
            variables: { enqueued: nb, queue: [...queue] },
          });
        }
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `BFS complete. Order: [${order.join(" → ")}].`,
      highlightLines: [21],
      visualState: {
        type: "graph",
        nodes: NODES,
        edges: EDGES,
        visited: [...visited],
        frontier: [],
        current: -1,
      },
      variables: { bfsOrder: order },
    });

    return steps;
  },
};
