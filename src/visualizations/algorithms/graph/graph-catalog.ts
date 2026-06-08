import type { AnimationStep, VisualizationModule } from "@/types/visualization";

// Shared graph nodes
const NODES4 = [
  { id: 0, label: "0", x: 120, y: 80 },
  { id: 1, label: "1", x: 300, y: 80 },
  { id: 2, label: "2", x: 120, y: 240 },
  { id: 3, label: "3", x: 300, y: 240 },
];
const NODES6 = [
  { id: 0, label: "A", x: 80, y: 160 },
  { id: 1, label: "B", x: 200, y: 60 },
  { id: 2, label: "C", x: 320, y: 60 },
  { id: 3, label: "D", x: 200, y: 260 },
  { id: 4, label: "E", x: 320, y: 260 },
  { id: 5, label: "F", x: 440, y: 160 },
];

// ── Floyd-Warshall ───────────────────────────────────────────────────────────
export const floydWarshallModule: VisualizationModule<null> = {
  id: "graph-floyd-warshall",
  slug: "floyd-warshall",
  title: "Floyd-Warshall",
  category: ["algorithms", "graph-algorithms"],
  difficulty: "intermediate",
  timeComplexity: "O(V³)",
  spaceComplexity: "O(V²)",
  description: "All-pairs shortest paths using dynamic programming. Handles negative edges (but not negative cycles).",
  relatedTopics: ["dijkstra", "bellman-ford"],
  pythonCode: `INF = float('inf')

def floyd_warshall(dist):
    n = len(dist)
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
    return dist`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const INF = 99;
    // 4-node weighted directed graph
    const dist = [
      [0, 3, INF, 7],
      [8, 0, 2, INF],
      [5, INF, 0, 1],
      [2, INF, INF, 0],
    ];
    const n = 4;
    const rowLabels = ["0", "1", "2", "3"];
    const colLabels = ["0", "1", "2", "3"];

    const snap = () => dist.map((r) => r.map((v) => v === INF ? "∞" : v));

    steps.push({
      stepNumber: 1,
      description: "Floyd-Warshall: all-pairs shortest paths. Initialize dist[][] from edge weights.",
      highlightLines: [1, 2],
      visualState: { type: "matrix", matrix: snap(), rowLabels, colLabels, title: "dist[i][j]" },
      variables: { n, INF: "∞" },
    });

    for (let k = 0; k < n; k++) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const through = dist[i][k] === INF || dist[k][j] === INF ? INF : dist[i][k] + dist[k][j];
          if (through < dist[i][j]) {
            dist[i][j] = through;
            steps.push({
              stepNumber: steps.length + 1,
              description: `k=${k}, i=${i}, j=${j}: dist[${i}][${k}]+dist[${k}][${j}]=${through}<${dist[i][j]}. Update dist[${i}][${j}]=${through}.`,
              highlightLines: [5, 6, 7],
              visualState: { type: "matrix", matrix: snap(), rowLabels, colLabels, active: [i, j], title: `k=${k} pass` },
              variables: { k, i, j, newDist: through },
            });
          }
        }
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: "All-pairs shortest paths computed.",
      highlightLines: [8],
      visualState: { type: "matrix", matrix: snap(), rowLabels, colLabels, title: "Final dist[i][j]" },
      variables: { done: true },
    });

    return steps;
  },
};

// ── A* Search ────────────────────────────────────────────────────────────────
export const aStarModule: VisualizationModule<null> = {
  id: "graph-a-star",
  slug: "a-star",
  title: "A* Search",
  category: ["algorithms", "graph-algorithms"],
  difficulty: "intermediate",
  timeComplexity: "O(E log V)",
  spaceComplexity: "O(V)",
  description: "Heuristic-guided shortest path. Uses f(n)=g(n)+h(n) where h is an admissible heuristic.",
  relatedTopics: ["dijkstra", "bfs"],
  pythonCode: `import heapq

def a_star(graph, start, goal, h):
    open_set = [(h[start], 0, start)]
    g = {start: 0}
    while open_set:
        _, cost, u = heapq.heappop(open_set)
        if u == goal:
            return cost
        for v, w in graph[u]:
            new_g = g[u] + w
            if new_g < g.get(v, float('inf')):
                g[v] = new_g
                heapq.heappush(open_set, (new_g + h[v], new_g, v))
    return float('inf')`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const nodes = [
      { id: 0, label: "S", x: 80, y: 160 },
      { id: 1, label: "A", x: 200, y: 80 },
      { id: 2, label: "B", x: 200, y: 240 },
      { id: 3, label: "C", x: 340, y: 80 },
      { id: 4, label: "D", x: 340, y: 240 },
      { id: 5, label: "G", x: 460, y: 160 },
    ];
    const edges = [
      { from: 0, to: 1, weight: 2, directed: true },
      { from: 0, to: 2, weight: 4, directed: true },
      { from: 1, to: 3, weight: 3, directed: true },
      { from: 2, to: 4, weight: 2, directed: true },
      { from: 3, to: 5, weight: 1, directed: true },
      { from: 4, to: 5, weight: 3, directed: true },
      { from: 1, to: 4, weight: 5, directed: true },
    ];
    // Heuristic (straight-line to G=node 5)
    const h = [5, 4, 4, 1, 2, 0];

    steps.push({
      stepNumber: 1,
      description: `A* from S(0) to G(5). h(n)=[${h.join(",")}]. f(n) = g(n) + h(n).`,
      highlightLines: [3, 4],
      visualState: { type: "graph", nodes, edges, visited: [], frontier: [0], current: 0, distances: { 0: 0, 1: 99, 2: 99, 3: 99, 4: 99, 5: 99 } },
      variables: { start: 0, goal: 5, heuristic: JSON.stringify(h) },
    });

    // Simulate A*
    const g: Record<number, number> = { 0: 0 };
    const visited: number[] = [];
    const frontier = [0];
    const order = [[0], [1, 2], [3, 4], [5]];

    for (const wave of order) {
      const cur = wave[0];
      visited.push(cur);
      const newFrontier = frontier.filter((n) => !visited.includes(n));

      steps.push({
        stepNumber: steps.length + 1,
        description: `Expand ${nodes[cur].label}: g=${g[cur] ?? 0}, h=${h[cur]}, f=${(g[cur] ?? 0) + h[cur]}. Explore neighbors.`,
        highlightLines: [6, 7, 8],
        visualState: {
          type: "graph", nodes, edges,
          visited: [...visited],
          frontier: newFrontier,
          current: cur,
          distances: Object.fromEntries(Object.entries(g).map(([k, v]) => [k, v])),
        },
        variables: { current: nodes[cur].label, g: g[cur] ?? 0, h: h[cur], f: (g[cur] ?? 0) + h[cur] },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `A* reached goal G. Shortest path S→A→C→G cost=6. A* is optimal with admissible heuristic.`,
      highlightLines: [8],
      visualState: {
        type: "graph", nodes, edges, visited, frontier: [], current: 5,
        path: [0, 1, 3, 5], distances: { 0: 0, 1: 2, 2: 4, 3: 5, 4: 6, 5: 6 },
      },
      variables: { shortestPath: "S→A→C→G", cost: 6 },
    });

    return steps;
  },
};

// ── Johnson's Algorithm ──────────────────────────────────────────────────────
export const johnsonsModule: VisualizationModule<null> = {
  id: "graph-johnsons",
  slug: "johnsons",
  title: "Johnson's Algorithm",
  category: ["algorithms", "graph-algorithms"],
  difficulty: "advanced",
  timeComplexity: "O(VE + V² log V)",
  spaceComplexity: "O(V²)",
  description: "All-pairs shortest paths for sparse graphs using Bellman-Ford + Dijkstra with reweighting.",
  relatedTopics: ["dijkstra", "bellman-ford", "floyd-warshall"],
  pythonCode: `def johnsons(graph, n):
    # 1. Add virtual source q connected to all nodes with weight 0
    # 2. Run Bellman-Ford from q to get h[v] (no negative cycles allowed)
    # 3. Reweight edges: w'(u,v) = w(u,v) + h[u] - h[v] (all ≥ 0)
    # 4. Run Dijkstra from each node on reweighted graph
    # 5. Adjust: dist(u,v) = dijkstra_dist(u,v) - h[u] + h[v]
    pass`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const nodes = NODES4;
    // Edges with possible negatives
    const edges = [
      { from: 0, to: 1, weight: -1, directed: true },
      { from: 0, to: 2, weight: 4, directed: true },
      { from: 1, to: 2, weight: 3, directed: true },
      { from: 1, to: 3, weight: 2, directed: true },
      { from: 2, to: 3, weight: -3, directed: true },
    ];

    const stages = [
      { desc: "Step 1: Add virtual source q with 0-weight edges to all nodes.", h: { q: 0 } },
      { desc: "Step 2: Bellman-Ford from q → h=[0,-1,2,-1]. No negative cycles.", h: { 0: 0, 1: -1, 2: 2, 3: -1 } },
      { desc: "Step 3: Reweight w'(u,v)=w(u,v)+h[u]-h[v]. All weights become non-negative.", h: {} },
      { desc: "Step 4: Run Dijkstra from each vertex on reweighted graph.", h: {} },
      { desc: "Step 5: Adjust distances back: d(u,v) = d'(u,v) - h[u] + h[v].", h: {} },
    ];

    for (const [i, s] of stages.entries()) {
      steps.push({
        stepNumber: steps.length + 1,
        description: s.desc,
        highlightLines: [i + 1],
        visualState: {
          type: "graph", nodes, edges,
          visited: i >= 2 ? [0, 1, 2, 3] : [],
          frontier: [], current: -1,
          distances: i >= 1 ? { 0: 0, 1: -1, 2: 2, 3: -1 } : {},
        },
        variables: { step: i + 1, description: s.desc },
      });
    }

    return steps;
  },
};

// ── Borůvka's MST ─────────────────────────────────────────────────────────────
export const boruvkaModule: VisualizationModule<null> = {
  id: "graph-boruvka",
  slug: "boruvka",
  title: "Borůvka's MST",
  category: ["algorithms", "graph-algorithms"],
  difficulty: "advanced",
  timeComplexity: "O(E log V)",
  spaceComplexity: "O(V)",
  description: "MST algorithm that merges components by adding cheapest outgoing edge per component each round.",
  relatedTopics: ["kruskal", "prim"],
  pythonCode: `def boruvka(n, edges):
    parent = list(range(n))
    def find(x):
        while parent[x] != x: parent[x] = parent[parent[x]]; x = parent[x]
        return x
    def union(x, y):
        parent[find(x)] = find(y)
    mst_cost, mst_edges = 0, []
    components = n
    while components > 1:
        cheapest = [-1] * n
        for u, v, w in edges:
            cu, cv = find(u), find(v)
            if cu != cv:
                if cheapest[cu] == -1 or w < edges[cheapest[cu]][2]: cheapest[cu] = edges.index((u,v,w))
                if cheapest[cv] == -1 or w < edges[cheapest[cv]][2]: cheapest[cv] = edges.index((u,v,w))
        for i in range(n):
            if cheapest[i] != -1:
                u, v, w = edges[cheapest[i]]
                if find(u) != find(v):
                    mst_cost += w; mst_edges.append((u,v)); union(u, v); components -= 1
    return mst_cost, mst_edges`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const nodes = NODES6;
    const edges = [
      { from: 0, to: 1, weight: 4, directed: false },
      { from: 0, to: 3, weight: 6, directed: false },
      { from: 1, to: 2, weight: 2, directed: false },
      { from: 1, to: 3, weight: 3, directed: false },
      { from: 2, to: 4, weight: 5, directed: false },
      { from: 2, to: 5, weight: 7, directed: false },
      { from: 3, to: 4, weight: 1, directed: false },
      { from: 4, to: 5, weight: 8, directed: false },
    ];

    steps.push({
      stepNumber: 1,
      description: "Borůvka's MST: each component picks cheapest outgoing edge. Round 1.",
      highlightLines: [7],
      visualState: { type: "graph", nodes, edges, visited: [], frontier: [], current: -1, mstEdges: [] },
      variables: { components: 6, round: 1 },
    });

    const mstEdges: [number, number][] = [];
    // Round 1: cheapest edges per node
    mstEdges.push([0, 1], [1, 2], [3, 4]);
    steps.push({
      stepNumber: 2,
      description: "Round 1: add cheapest outgoing edges. Components: {0,1}, {1,2}, {2}, {3,4}, {4}, {5}.",
      highlightLines: [9, 10],
      visualState: { type: "graph", nodes, edges, visited: [0, 1, 2, 3, 4], frontier: [], current: -1, mstEdges: [[0,1],[1,2],[3,4]] },
      variables: { mstEdges: "0-1, 1-2, 3-4", components: 3 },
    });

    mstEdges.push([1, 3], [2, 5]);
    steps.push({
      stepNumber: 3,
      description: "Round 2: merge remaining components. MST edges: 0-1, 1-2, 1-3, 3-4, 2-5.",
      highlightLines: [12],
      visualState: { type: "graph", nodes, edges, visited: [0, 1, 2, 3, 4, 5], frontier: [], current: -1, mstEdges },
      variables: { mstEdges: JSON.stringify(mstEdges), components: 1, mstCost: "2+3+4+1+7=17" },
    });

    return steps;
  },
};

// ── Kahn's Algorithm ─────────────────────────────────────────────────────────
export const kahnsAlgorithmModule: VisualizationModule<null> = {
  id: "graph-kahns",
  slug: "kahns-algorithm",
  title: "Kahn's Algorithm",
  category: ["algorithms", "graph-algorithms"],
  difficulty: "intermediate",
  timeComplexity: "O(V + E)",
  spaceComplexity: "O(V)",
  description: "BFS-based topological sort. Process nodes with in-degree 0, reduce neighbors' in-degrees.",
  relatedTopics: ["topological-sort", "bfs"],
  pythonCode: `from collections import deque

def kahns(graph, n):
    indegree = [0] * n
    for u in range(n):
        for v in graph[u]: indegree[v] += 1
    queue = deque(u for u in range(n) if indegree[u] == 0)
    order = []
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in graph[u]:
            indegree[v] -= 1
            if indegree[v] == 0: queue.append(v)
    return order if len(order) == n else []  # empty = cycle`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const nodes = [
      { id: 0, label: "0", x: 80, y: 120 },
      { id: 1, label: "1", x: 80, y: 240 },
      { id: 2, label: "2", x: 200, y: 60 },
      { id: 3, label: "3", x: 200, y: 200 },
      { id: 4, label: "4", x: 320, y: 120 },
      { id: 5, label: "5", x: 440, y: 120 },
    ];
    const adj = [[2, 3], [3], [4], [4, 5], [5], []];
    const edges = adj.flatMap((neighbors, u) => neighbors.map((v) => ({ from: u, to: v, weight: 0, directed: true })));
    const indegree = [0, 0, 1, 2, 2, 2];

    steps.push({
      stepNumber: 1,
      description: `Kahn's topological sort. Compute in-degrees: [${indegree.join(",")}]. Start with 0-indegree nodes.`,
      highlightLines: [3, 4, 5],
      visualState: { type: "graph", nodes, edges, visited: [], frontier: [0, 1], current: -1 },
      variables: { indegree: JSON.stringify(indegree), queue: "[0,1]" },
    });

    const queue = [0, 1];
    const order: number[] = [];
    const deg = [...indegree];
    const visited: number[] = [];

    while (queue.length > 0) {
      const u = queue.shift()!;
      order.push(u);
      visited.push(u);

      for (const v of adj[u]) {
        deg[v]--;
        if (deg[v] === 0) queue.push(v);
      }

      steps.push({
        stepNumber: steps.length + 1,
        description: `Process ${u}: add to order [${order.join(",")}]. Reduce neighbors' in-degrees. Queue: [${queue.join(",")}]`,
        highlightLines: [8, 9, 10, 11],
        visualState: { type: "graph", nodes, edges, visited: [...visited], frontier: [...queue], current: u },
        variables: { processed: u, order: JSON.stringify(order), queue: JSON.stringify(queue) },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Topological order: [${order.join(",")}]. Valid since all in-degrees reduced to 0.`,
      highlightLines: [13],
      visualState: { type: "graph", nodes, edges, visited: order, frontier: [], current: -1 },
      variables: { topologicalOrder: JSON.stringify(order), valid: order.length === nodes.length },
    });

    return steps;
  },
};

// ── Tarjan's SCC ─────────────────────────────────────────────────────────────
export const tarjanSccModule: VisualizationModule<null> = {
  id: "graph-tarjan-scc",
  slug: "tarjan-scc",
  title: "Tarjan's SCC",
  category: ["algorithms", "graph-algorithms"],
  difficulty: "advanced",
  timeComplexity: "O(V + E)",
  spaceComplexity: "O(V)",
  description: "Find all Strongly Connected Components in O(V+E) using DFS discovery/low-link values.",
  relatedTopics: ["kosaraju-scc", "dfs"],
  pythonCode: `def tarjan_scc(graph, n):
    disc = [-1]*n; low = [0]*n; on_stack = [False]*n
    stack = []; sccs = []; timer = [0]
    def dfs(u):
        disc[u] = low[u] = timer[0]; timer[0]+=1
        stack.append(u); on_stack[u] = True
        for v in graph[u]:
            if disc[v]==-1: dfs(v); low[u]=min(low[u],low[v])
            elif on_stack[v]: low[u]=min(low[u],disc[v])
        if low[u]==disc[u]:  # root of SCC
            scc=[]; w=-1
            while w!=u: w=stack.pop(); on_stack[w]=False; scc.append(w)
            sccs.append(scc)
    for i in range(n):
        if disc[i]==-1: dfs(i)
    return sccs`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const nodes = [
      { id: 0, label: "0", x: 120, y: 80 },
      { id: 1, label: "1", x: 260, y: 80 },
      { id: 2, label: "2", x: 400, y: 80 },
      { id: 3, label: "3", x: 120, y: 220 },
      { id: 4, label: "4", x: 260, y: 220 },
      { id: 5, label: "5", x: 400, y: 220 },
    ];
    const edges = [
      { from: 0, to: 1, weight: 0, directed: true },
      { from: 1, to: 2, weight: 0, directed: true },
      { from: 2, to: 0, weight: 0, directed: true },
      { from: 1, to: 3, weight: 0, directed: true },
      { from: 3, to: 4, weight: 0, directed: true },
      { from: 4, to: 5, weight: 0, directed: true },
      { from: 5, to: 3, weight: 0, directed: true },
    ];

    steps.push({
      stepNumber: 1,
      description: "Tarjan's SCC: DFS with discovery time + low-link values. SCCs: {0,1,2} and {3,4,5}.",
      highlightLines: [1, 2],
      visualState: { type: "graph", nodes, edges, visited: [], frontier: [0], current: -1 },
      variables: { components: "to be found" },
    });

    const dfsOrder = [0, 1, 2, 3, 4, 5];
    const scc1 = [0, 1, 2], scc2 = [3, 4, 5];
    const disc = [0, 1, 2, 4, 5, 6];
    const low = [0, 0, 0, 4, 4, 4];

    for (const u of dfsOrder) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `DFS visit ${u}: disc[${u}]=${disc[u]}, low[${u}]=${low[u]}${low[u] === disc[u] ? " → SCC root!" : ""}`,
        highlightLines: [4, 5, 8, 9],
        visualState: {
          type: "graph", nodes, edges,
          visited: dfsOrder.slice(0, dfsOrder.indexOf(u) + 1),
          frontier: [], current: u,
        },
        variables: { u, disc: disc[u], low: low[u], isSccRoot: low[u] === disc[u] },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `SCCs found: SCC1={${scc1.join(",")}}, SCC2={${scc2.join(",")}}. Condensation DAG has 2 nodes.`,
      highlightLines: [11],
      visualState: {
        type: "graph", nodes, edges,
        visited: scc1, frontier: scc2, current: -1,
      },
      variables: { SCC1: JSON.stringify(scc1), SCC2: JSON.stringify(scc2) },
    });

    return steps;
  },
};

// ── Kosaraju's SCC ───────────────────────────────────────────────────────────
export const kosarajuSccModule: VisualizationModule<null> = {
  id: "graph-kosaraju",
  slug: "kosaraju-scc",
  title: "Kosaraju's SCC",
  category: ["algorithms", "graph-algorithms"],
  difficulty: "advanced",
  timeComplexity: "O(V + E)",
  spaceComplexity: "O(V)",
  description: "Two-pass DFS: finish-order on G, then DFS on G^T in reverse finish order.",
  relatedTopics: ["tarjan-scc", "dfs"],
  pythonCode: `def kosaraju(graph, rgraph, n):
    visited = [False]*n; order = []
    def dfs1(u):
        visited[u] = True
        for v in graph[u]:
            if not visited[v]: dfs1(v)
        order.append(u)
    def dfs2(u, comp):
        visited[u] = True; comp.append(u)
        for v in rgraph[u]:
            if not visited[v]: dfs2(v, comp)
    for i in range(n):
        if not visited[i]: dfs1(i)
    visited = [False]*n; sccs = []
    for u in reversed(order):
        if not visited[u]:
            comp=[]; dfs2(u, comp); sccs.append(comp)
    return sccs`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const nodes = [
      { id: 0, label: "0", x: 120, y: 80 },
      { id: 1, label: "1", x: 260, y: 80 },
      { id: 2, label: "2", x: 400, y: 80 },
      { id: 3, label: "3", x: 120, y: 220 },
      { id: 4, label: "4", x: 260, y: 220 },
      { id: 5, label: "5", x: 400, y: 220 },
    ];
    const edges = [
      { from: 0, to: 1, weight: 0, directed: true },
      { from: 1, to: 2, weight: 0, directed: true },
      { from: 2, to: 0, weight: 0, directed: true },
      { from: 1, to: 3, weight: 0, directed: true },
      { from: 3, to: 4, weight: 0, directed: true },
      { from: 4, to: 5, weight: 0, directed: true },
      { from: 5, to: 3, weight: 0, directed: true },
    ];

    const stageMsgs = [
      "Pass 1: DFS on G, record finish order: [2,0,1,5,3,4] (or similar).",
      "Pass 2: reverse G (G^T). DFS in reverse finish order.",
      "SCC 1: {0,1,2} — reachable from each other in G^T.",
      "SCC 2: {3,4,5} — reachable from each other in G^T.",
    ];

    for (const [i, msg] of stageMsgs.entries()) {
      steps.push({
        stepNumber: steps.length + 1,
        description: msg,
        highlightLines: [i < 2 ? i + 1 : 9],
        visualState: {
          type: "graph", nodes, edges,
          visited: i < 2 ? [] : i === 2 ? [0, 1, 2] : [0, 1, 2, 3, 4, 5],
          frontier: i === 2 ? [3, 4, 5] : [],
          current: -1,
        },
        variables: { phase: i < 2 ? "DFS" : "SCC found", step: i + 1 },
      });
    }

    return steps;
  },
};

// ── Ford-Fulkerson ───────────────────────────────────────────────────────────
export const fordFulkersonModule: VisualizationModule<null> = {
  id: "graph-ford-fulkerson",
  slug: "ford-fulkerson",
  title: "Ford-Fulkerson Max Flow",
  category: ["algorithms", "graph-algorithms"],
  difficulty: "advanced",
  timeComplexity: "O(E × max_flow)",
  spaceComplexity: "O(V²)",
  description: "Find maximum flow from source to sink by repeatedly finding augmenting paths.",
  relatedTopics: ["edmonds-karp", "bfs"],
  pythonCode: `def ford_fulkerson(cap, source, sink, n):
    flow = [[0]*n for _ in range(n)]
    max_flow = 0
    while True:
        # BFS for augmenting path
        parent = [-1]*n; visited = {source}
        queue = [source]
        while queue and parent[sink] == -1:
            u = queue.pop(0)
            for v in range(n):
                if v not in visited and cap[u][v]-flow[u][v] > 0:
                    parent[v] = u; visited.add(v); queue.append(v)
        if parent[sink] == -1: break
        # Find bottleneck
        path_flow = float('inf')
        v = sink
        while v != source:
            u = parent[v]; path_flow = min(path_flow, cap[u][v]-flow[u][v]); v=u
        # Update flows
        v = sink
        while v != source:
            u = parent[v]; flow[u][v]+=path_flow; flow[v][u]-=path_flow; v=u
        max_flow += path_flow
    return max_flow`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const nodes = [
      { id: 0, label: "S", x: 80, y: 180 },
      { id: 1, label: "A", x: 220, y: 80 },
      { id: 2, label: "B", x: 220, y: 280 },
      { id: 3, label: "C", x: 360, y: 80 },
      { id: 4, label: "D", x: 360, y: 280 },
      { id: 5, label: "T", x: 500, y: 180 },
    ];
    const baseEdges = [
      { from: 0, to: 1, weight: 10, directed: true },
      { from: 0, to: 2, weight: 10, directed: true },
      { from: 1, to: 3, weight: 10, directed: true },
      { from: 1, to: 2, weight: 2, directed: true },
      { from: 2, to: 4, weight: 10, directed: true },
      { from: 3, to: 5, weight: 10, directed: true },
      { from: 4, to: 3, weight: 6, directed: true },
      { from: 4, to: 5, weight: 10, directed: true },
    ];

    const paths = [
      { path: [0, 1, 3, 5], flow: 10, desc: "Path S→A→C→T, bottleneck=10." },
      { path: [0, 2, 4, 5], flow: 10, desc: "Path S→B→D→T, bottleneck=10." },
    ];

    steps.push({
      stepNumber: 1,
      description: "Ford-Fulkerson max flow. Find augmenting paths from S to T.",
      highlightLines: [3],
      visualState: { type: "graph", nodes, edges: baseEdges, visited: [], frontier: [0], current: 0 },
      variables: { source: "S", sink: "T", maxFlow: 0 },
    });

    let totalFlow = 0;
    for (const p of paths) {
      totalFlow += p.flow;
      steps.push({
        stepNumber: steps.length + 1,
        description: `${p.desc} Send ${p.flow} units. Total flow=${totalFlow}.`,
        highlightLines: [8, 9, 10],
        visualState: {
          type: "graph", nodes, edges: baseEdges,
          visited: p.path, frontier: [], current: p.path[p.path.length - 1], path: p.path,
        },
        variables: { path: JSON.stringify(p.path), augment: p.flow, totalFlow },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Max flow = ${totalFlow}. No more augmenting paths. Minimum cut separates S from T.`,
      highlightLines: [12],
      visualState: {
        type: "graph", nodes, edges: baseEdges, visited: [0, 1, 2, 3, 4, 5], frontier: [], current: -1,
      },
      variables: { maxFlow: totalFlow },
    });

    return steps;
  },
};

// ── Edmonds-Karp ─────────────────────────────────────────────────────────────
export const edmondsKarpModule: VisualizationModule<null> = {
  id: "graph-edmonds-karp",
  slug: "edmonds-karp",
  title: "Edmonds-Karp",
  category: ["algorithms", "graph-algorithms"],
  difficulty: "advanced",
  timeComplexity: "O(VE²)",
  spaceComplexity: "O(V²)",
  description: "Ford-Fulkerson with BFS for augmenting paths, guaranteeing O(VE²) worst-case complexity.",
  relatedTopics: ["ford-fulkerson", "bfs"],
  pythonCode: `# Edmonds-Karp: Ford-Fulkerson with BFS
# Using BFS guarantees shortest augmenting paths
# This gives O(VE^2) time complexity
# vs Ford-Fulkerson's O(E * max_flow)

def bfs_path(cap, flow, source, sink, n):
    parent = [-1]*n; visited = {source}
    queue = [source]
    while queue:
        u = queue.pop(0)
        for v in range(n):
            if v not in visited and cap[u][v]-flow[u][v] > 0:
                parent[v] = u; visited.add(v)
                if v == sink: return parent
                queue.append(v)
    return None`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const nodes = [
      { id: 0, label: "S", x: 80, y: 180 },
      { id: 1, label: "A", x: 220, y: 80 },
      { id: 2, label: "B", x: 220, y: 280 },
      { id: 3, label: "T", x: 380, y: 180 },
    ];
    const edges = [
      { from: 0, to: 1, weight: 4, directed: true },
      { from: 0, to: 2, weight: 2, directed: true },
      { from: 1, to: 3, weight: 3, directed: true },
      { from: 2, to: 3, weight: 5, directed: true },
      { from: 1, to: 2, weight: 1, directed: true },
    ];

    const bfsPaths = [
      { path: [0, 1, 3], flow: 3, desc: "BFS shortest path S→A→T (length 2), bottleneck=3." },
      { path: [0, 2, 3], flow: 2, desc: "BFS shortest path S→B→T (length 2), bottleneck=2." },
    ];

    steps.push({
      stepNumber: 1,
      description: "Edmonds-Karp: BFS finds shortest (by hops) augmenting path each iteration.",
      highlightLines: [1, 2, 3],
      visualState: { type: "graph", nodes, edges, visited: [], frontier: [0], current: 0 },
      variables: { algorithm: "BFS-based Ford-Fulkerson", complexity: "O(VE²)" },
    });

    let total = 0;
    for (const p of bfsPaths) {
      total += p.flow;
      steps.push({
        stepNumber: steps.length + 1,
        description: `${p.desc} Total flow=${total}.`,
        highlightLines: [7, 8, 9, 10],
        visualState: {
          type: "graph", nodes, edges, visited: p.path, frontier: [], current: p.path[p.path.length - 1], path: p.path,
        },
        variables: { path: JSON.stringify(p.path), flow: p.flow, total },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Max flow = ${total}. BFS guarantees at most O(VE) augmentations.`,
      highlightLines: [14],
      visualState: { type: "graph", nodes, edges, visited: [0, 1, 2, 3], frontier: [], current: -1 },
      variables: { maxFlow: total, advantage: "O(VE²) vs O(E·maxflow)" },
    });

    return steps;
  },
};

// ── Bipartite Check ──────────────────────────────────────────────────────────
export const bipartiteCheckModule: VisualizationModule<null> = {
  id: "graph-bipartite",
  slug: "bipartite-check",
  title: "Bipartite Check",
  category: ["algorithms", "graph-algorithms"],
  difficulty: "intermediate",
  timeComplexity: "O(V + E)",
  spaceComplexity: "O(V)",
  description: "Check if a graph is 2-colorable (bipartite) using BFS coloring.",
  relatedTopics: ["bfs", "dfs"],
  pythonCode: `from collections import deque

def is_bipartite(graph, n):
    color = [-1] * n
    for start in range(n):
        if color[start] != -1: continue
        color[start] = 0
        queue = deque([start])
        while queue:
            u = queue.popleft()
            for v in graph[u]:
                if color[v] == -1:
                    color[v] = 1 - color[u]
                    queue.append(v)
                elif color[v] == color[u]:
                    return False  # same color → not bipartite
    return True`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const nodes = [
      { id: 0, label: "0", x: 100, y: 100 },
      { id: 1, label: "1", x: 260, y: 60 },
      { id: 2, label: "2", x: 100, y: 240 },
      { id: 3, label: "3", x: 260, y: 200 },
      { id: 4, label: "4", x: 420, y: 120 },
      { id: 5, label: "5", x: 420, y: 240 },
    ];
    const adj = [[1, 3], [0, 2, 4], [1, 3], [0, 2, 5], [1, 5], [3, 4]];
    const edges = adj.flatMap((nbrs, u) => nbrs.filter((v) => v > u).map((v) => ({ from: u, to: v, weight: 0, directed: false })));

    const color: number[] = Array(6).fill(-1);
    color[0] = 0;
    const queue = [0];
    const setA: number[] = [0]; // color 0
    const setB: number[] = [];  // color 1

    steps.push({
      stepNumber: 1,
      description: "Bipartite Check: 2-color with BFS. Start node 0 → color 0 (Set A).",
      highlightLines: [4, 5],
      visualState: { type: "graph", nodes, edges, visited: [0], frontier: [1, 3], current: 0 },
      variables: { setA: "[0]", setB: "[]", color0: 0 },
    });

    const bfsOrder = [[1, 3], [2, 4], [5]];
    for (const wave of bfsOrder) {
      for (const v of wave) {
        color[v] = color[v] === -1 ? 1 - color[adj[v].find((u) => color[u] !== -1)!] : color[v];
        if (color[v] === 0) setA.push(v); else setB.push(v);
      }

      steps.push({
        stepNumber: steps.length + 1,
        description: `Color nodes ${wave.join(",")} with ${1 - color[wave[0]] === 0 ? "Set A" : "Set B"}. A={${setA.join(",")}} B={${setB.join(",")}}`,
        highlightLines: [9, 10, 11],
        visualState: {
          type: "graph", nodes, edges,
          visited: setA, frontier: setB, current: wave[wave.length - 1],
        },
        variables: { setA: JSON.stringify(setA), setB: JSON.stringify(setB) },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Graph IS bipartite! Set A={${setA.join(",")}} Set B={${setB.join(",")}}. No odd cycles.`,
      highlightLines: [14],
      visualState: { type: "graph", nodes, edges, visited: setA, frontier: setB, current: -1 },
      variables: { bipartite: true, setA: JSON.stringify(setA), setB: JSON.stringify(setB) },
    });

    return steps;
  },
};

// ── Cycle Detection in Directed Graph ────────────────────────────────────────
export const cycleDetectionGraphModule: VisualizationModule<null> = {
  id: "graph-cycle-detection",
  slug: "cycle-detection-graph",
  title: "Cycle Detection (Directed)",
  category: ["algorithms", "graph-algorithms"],
  difficulty: "intermediate",
  timeComplexity: "O(V + E)",
  spaceComplexity: "O(V)",
  description: "Detect cycles in a directed graph using DFS with white/grey/black node coloring.",
  relatedTopics: ["dfs", "topological-sort"],
  pythonCode: `def has_cycle(graph, n):
    # 0=white(unvisited), 1=grey(in stack), 2=black(done)
    color = [0] * n
    def dfs(u):
        color[u] = 1  # grey
        for v in graph[u]:
            if color[v] == 1: return True   # back edge = cycle
            if color[v] == 0 and dfs(v): return True
        color[u] = 2  # black
        return False
    for i in range(n):
        if color[i] == 0 and dfs(i): return True
    return False`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const nodes = [
      { id: 0, label: "0", x: 100, y: 80 },
      { id: 1, label: "1", x: 260, y: 80 },
      { id: 2, label: "2", x: 180, y: 220 },
      { id: 3, label: "3", x: 380, y: 160 },
      { id: 4, label: "4", x: 260, y: 300 },
    ];
    // Graph with cycle: 0→1→2→0, 1→3, 3→4
    const edges = [
      { from: 0, to: 1, weight: 0, directed: true },
      { from: 1, to: 2, weight: 0, directed: true },
      { from: 2, to: 0, weight: 0, directed: true }, // back edge → cycle!
      { from: 1, to: 3, weight: 0, directed: true },
      { from: 3, to: 4, weight: 0, directed: true },
    ];

    const dfsOrder = [0, 1, 2, 3, 4];
    const grey: number[] = [];

    steps.push({
      stepNumber: 1,
      description: "Cycle Detection: DFS coloring. White=unvisited, Grey=in stack, Black=done. Cycle if grey→grey edge.",
      highlightLines: [1, 2],
      visualState: { type: "graph", nodes, edges, visited: [], frontier: [], current: -1 },
      variables: { white: "[0,1,2,3,4]", grey: "[]", black: "[]" },
    });

    for (const u of [0, 1]) {
      grey.push(u);
      steps.push({
        stepNumber: steps.length + 1,
        description: `DFS visit ${u}: color GREY (in stack).`,
        highlightLines: [3],
        visualState: { type: "graph", nodes, edges, visited: [], frontier: [...grey], current: u },
        variables: { grey: JSON.stringify(grey) },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: "Visit 2: color GREY. Check neighbor 0 → 0 is GREY (back edge)! CYCLE DETECTED!",
      highlightLines: [4, 5],
      visualState: { type: "graph", nodes, edges, visited: [2], frontier: [...grey, 2], current: 2 },
      variables: { backEdge: "2→0", cyclePath: "0→1→2→0", result: "CYCLE DETECTED" },
    });

    return steps;
  },
};

// ── Euler Path ───────────────────────────────────────────────────────────────
export const eulerPathModule: VisualizationModule<null> = {
  id: "graph-euler-path",
  slug: "euler-path",
  title: "Euler Path / Circuit",
  category: ["algorithms", "graph-algorithms"],
  difficulty: "intermediate",
  timeComplexity: "O(E)",
  spaceComplexity: "O(V + E)",
  description: "Hierholzer's algorithm to find Euler path/circuit. Exists iff 0 or 2 nodes have odd degree.",
  relatedTopics: ["dfs", "hamiltonian-path"],
  pythonCode: `def hierholzer(graph, n, start):
    stack = [start]
    path = []
    adj = {u: list(nbrs) for u, nbrs in enumerate(graph)}
    while stack:
        u = stack[-1]
        if adj[u]:
            v = adj[u].pop()
            adj[v].remove(u)  # undirected
            stack.append(v)
        else:
            path.append(stack.pop())
    return path[::-1]`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const nodes = [
      { id: 0, label: "0", x: 100, y: 160 },
      { id: 1, label: "1", x: 220, y: 60 },
      { id: 2, label: "2", x: 340, y: 160 },
      { id: 3, label: "3", x: 220, y: 260 },
    ];
    const edges = [
      { from: 0, to: 1, weight: 0, directed: false },
      { from: 1, to: 2, weight: 0, directed: false },
      { from: 2, to: 3, weight: 0, directed: false },
      { from: 3, to: 0, weight: 0, directed: false },
      { from: 0, to: 2, weight: 0, directed: false },
      { from: 1, to: 3, weight: 0, directed: false },
    ];

    const degrees = [3, 3, 3, 3];
    const oddDegrees = degrees.filter((d) => d % 2 !== 0).length;

    steps.push({
      stepNumber: 1,
      description: `Euler Circuit check: degrees=[${degrees.join(",")}]. Odd-degree nodes=${oddDegrees}. All even → Euler CIRCUIT exists.`,
      highlightLines: [1],
      visualState: { type: "graph", nodes, edges, visited: [], frontier: [], current: -1 },
      variables: { degrees: JSON.stringify(degrees), oddDegree: oddDegrees, eulerian: "circuit" },
    });

    // Simulate Hierholzer's
    const circuit = [0, 1, 2, 0, 3, 1]; // simplified demo path
    const visited: number[] = [];

    for (let i = 0; i < circuit.length - 1; i++) {
      visited.push(circuit[i]);
      steps.push({
        stepNumber: steps.length + 1,
        description: `Visit edge ${circuit[i]}→${circuit[i + 1]}. Path: [${visited.join("→")}→${circuit[i + 1]}]`,
        highlightLines: [5, 6],
        visualState: { type: "graph", nodes, edges, visited: [...visited], frontier: [circuit[i + 1]], current: circuit[i] },
        variables: { current: circuit[i], next: circuit[i + 1], pathLen: visited.length },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Euler Circuit: [${[...circuit, circuit[0]].join("→")}]. All ${edges.length} edges used exactly once.`,
      highlightLines: [11],
      visualState: { type: "graph", nodes, edges, visited: [0, 1, 2, 3], frontier: [], current: 0 },
      variables: { eulerCircuit: circuit.join("→"), edgesUsed: edges.length },
    });

    return steps;
  },
};

// ── Articulation Points ──────────────────────────────────────────────────────
export const articulationPointsModule: VisualizationModule<null> = {
  id: "graph-articulation-points",
  slug: "articulation-points",
  title: "Articulation Points",
  category: ["algorithms", "graph-algorithms"],
  difficulty: "advanced",
  timeComplexity: "O(V + E)",
  spaceComplexity: "O(V)",
  description: "Find vertices whose removal disconnects the graph using Tarjan's low-link DFS.",
  relatedTopics: ["bridges-graph", "tarjan-scc"],
  pythonCode: `def find_articulation_points(graph, n):
    disc = [-1]*n; low = [0]*n; parent = [-1]*n
    ap = set(); timer = [0]
    def dfs(u):
        children = 0; disc[u] = low[u] = timer[0]; timer[0]+=1
        for v in graph[u]:
            if disc[v]==-1:
                children+=1; parent[v]=u; dfs(v)
                low[u]=min(low[u],low[v])
                if parent[u]==-1 and children>1: ap.add(u)
                if parent[u]!=-1 and low[v]>=disc[u]: ap.add(u)
            elif v!=parent[u]: low[u]=min(low[u],disc[v])
    for i in range(n):
        if disc[i]==-1: dfs(i)
    return ap`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const nodes = [
      { id: 0, label: "0", x: 80, y: 160 },
      { id: 1, label: "1", x: 200, y: 80 },
      { id: 2, label: "2", x: 200, y: 240 },
      { id: 3, label: "3", x: 340, y: 160 },
      { id: 4, label: "4", x: 460, y: 100 },
      { id: 5, label: "5", x: 460, y: 220 },
    ];
    const edges = [
      { from: 0, to: 1, weight: 0, directed: false },
      { from: 0, to: 2, weight: 0, directed: false },
      { from: 1, to: 2, weight: 0, directed: false },
      { from: 1, to: 3, weight: 0, directed: false },
      { from: 3, to: 4, weight: 0, directed: false },
      { from: 3, to: 5, weight: 0, directed: false },
      { from: 4, to: 5, weight: 0, directed: false },
    ];

    steps.push({
      stepNumber: 1,
      description: "Find articulation points using DFS + low-link values. Node 1 and 3 are cut vertices.",
      highlightLines: [1, 2],
      visualState: { type: "graph", nodes, edges, visited: [], frontier: [0], current: -1 },
      variables: {},
    });

    const dfsOrder = [0, 1, 3, 4, 5, 2];
    const disc = [0, 1, 5, 2, 3, 4];
    const low  = [0, 1, 5, 2, 2, 2];
    const articulationPts = [1, 3];

    for (const [i, u] of dfsOrder.entries()) {
      const isAP = articulationPts.includes(u);
      steps.push({
        stepNumber: steps.length + 1,
        description: `DFS ${u}: disc=${disc[i]}, low=${low[i]}${isAP ? ` ← ARTICULATION POINT (low[child]≥disc[${u}])` : ""}`,
        highlightLines: [4, 9, 10],
        visualState: {
          type: "graph", nodes, edges,
          visited: dfsOrder.slice(0, i + 1),
          frontier: articulationPts,
          current: u,
        },
        variables: { u, disc: disc[i], low: low[i], isAP },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Articulation points: {${articulationPts.join(",")}}. Removing node 1 or 3 disconnects the graph.`,
      highlightLines: [11],
      visualState: {
        type: "graph", nodes, edges,
        visited: dfsOrder, frontier: articulationPts, current: -1,
      },
      variables: { articulationPoints: JSON.stringify(articulationPts) },
    });

    return steps;
  },
};

// ── Bridges in Graph ─────────────────────────────────────────────────────────
export const bridgesGraphModule: VisualizationModule<null> = {
  id: "graph-bridges",
  slug: "bridges-graph",
  title: "Bridges in Graph",
  category: ["algorithms", "graph-algorithms"],
  difficulty: "advanced",
  timeComplexity: "O(V + E)",
  spaceComplexity: "O(V)",
  description: "Find bridge edges whose removal increases connected components, using low-link DFS.",
  relatedTopics: ["articulation-points", "tarjan-scc"],
  pythonCode: `def find_bridges(graph, n):
    disc = [-1]*n; low = [0]*n; parent = [-1]*n
    bridges = []; timer = [0]
    def dfs(u):
        disc[u] = low[u] = timer[0]; timer[0]+=1
        for v in graph[u]:
            if disc[v]==-1:
                parent[v]=u; dfs(v)
                low[u]=min(low[u],low[v])
                if low[v] > disc[u]:   # bridge condition
                    bridges.append((u,v))
            elif v!=parent[u]: low[u]=min(low[u],disc[v])
    for i in range(n):
        if disc[i]==-1: dfs(i)
    return bridges`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const nodes = [
      { id: 0, label: "0", x: 80, y: 120 },
      { id: 1, label: "1", x: 200, y: 60 },
      { id: 2, label: "2", x: 200, y: 200 },
      { id: 3, label: "3", x: 340, y: 120 },
      { id: 4, label: "4", x: 460, y: 60 },
      { id: 5, label: "5", x: 460, y: 200 },
    ];
    const edges = [
      { from: 0, to: 1, weight: 0, directed: false },
      { from: 0, to: 2, weight: 0, directed: false },
      { from: 1, to: 2, weight: 0, directed: false },
      { from: 1, to: 3, weight: 0, directed: false }, // bridge
      { from: 3, to: 4, weight: 0, directed: false },
      { from: 3, to: 5, weight: 0, directed: false },
      { from: 4, to: 5, weight: 0, directed: false },
    ];

    steps.push({
      stepNumber: 1,
      description: "Find bridges: edges whose removal disconnects graph. Edge 1-3 is a bridge.",
      highlightLines: [1, 2],
      visualState: { type: "graph", nodes, edges, visited: [], frontier: [], current: -1 },
      variables: {},
    });

    const dfsOrder = [0, 1, 2, 3, 4, 5];
    const disc = [0, 1, 2, 3, 4, 5];
    const low  = [0, 0, 0, 3, 3, 3];
    const bridgeEdges: [number, number][] = [[1, 3]];

    for (const [i, u] of dfsOrder.entries()) {
      const isBridgeEndpoint = bridgeEdges.some(([a, b]) => a === u || b === u);
      steps.push({
        stepNumber: steps.length + 1,
        description: `DFS ${u}: disc=${disc[i]}, low=${low[i]}${isBridgeEndpoint && i === 1 ? ". low[3]=3 > disc[1]=1 → BRIDGE edge (1,3)!" : ""}`,
        highlightLines: [7, 8, 9],
        visualState: {
          type: "graph", nodes, edges,
          visited: dfsOrder.slice(0, i + 1),
          frontier: i === 1 ? [3] : [],
          current: u,
        },
        variables: { u, disc: disc[i], low: low[i] },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Bridge edges: ${bridgeEdges.map(([a, b]) => `(${a},${b})`).join(", ")}. Removing 1-3 splits graph into two components.`,
      highlightLines: [10],
      visualState: {
        type: "graph", nodes, edges,
        visited: [0, 1, 2], frontier: [3, 4, 5], current: -1,
      },
      variables: { bridges: JSON.stringify(bridgeEdges) },
    });

    return steps;
  },
};
