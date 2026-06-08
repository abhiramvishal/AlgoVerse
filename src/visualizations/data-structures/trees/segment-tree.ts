import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `class SegmentTree:
    def __init__(self, arr):
        self.n = len(arr)
        self.tree = [0] * (4 * self.n)
        self.build(arr, 0, 0, self.n - 1)

    def build(self, arr, node, start, end):
        if start == end:
            self.tree[node] = arr[start]
        else:
            mid = (start + end) // 2
            self.build(arr, 2*node+1, start, mid)
            self.build(arr, 2*node+2, mid+1, end)
            self.tree[node] = self.tree[2*node+1] + self.tree[2*node+2]

    def query(self, node, start, end, l, r):
        if r < start or end < l: return 0
        if l <= start and end <= r: return self.tree[node]
        mid = (start + end) // 2
        return self.query(2*node+1, start, mid, l, r) + \
               self.query(2*node+2, mid+1, end, l, r)`;

interface SegTree {
  tree: number[];
  n: number;
}

function buildSeg(arr: number[], seg: number[], node: number, start: number, end: number) {
  if (start === end) { seg[node] = arr[start]; return; }
  const mid = (start + end) >> 1;
  buildSeg(arr, seg, 2 * node + 1, start, mid);
  buildSeg(arr, seg, 2 * node + 2, mid + 1, end);
  seg[node] = seg[2 * node + 1] + seg[2 * node + 2];
}

function nodeX(node: number): number {
  // level = floor(log2(node+1)), pos in level
  const level = Math.floor(Math.log2(node + 1));
  const posInLevel = node - ((1 << level) - 1);
  const totalInLevel = 1 << level;
  const spacing = 620 / (totalInLevel + 1);
  return spacing * (posInLevel + 1);
}

function nodeY(node: number): number {
  const level = Math.floor(Math.log2(node + 1));
  return 40 + level * 60;
}

export const segmentTreeModule: VisualizationModule<{ arr: number[]; queryL: number; queryR: number }> = {
  id: "data-structures-trees-segment-tree",
  slug: "segment-tree",
  title: "Segment Tree",
  category: ["data-structures", "trees"],
  difficulty: "advanced",
  timeComplexity: "O(n) build, O(log n) query",
  spaceComplexity: "O(n)",
  description: "Build a segment tree for range sum queries; each node stores sum of a subrange.",
  relatedTopics: ["fenwick-tree", "avl-tree"],
  pythonCode,
  codeSteps: [],
  defaultInput: { arr: [1, 3, 5, 7, 9, 11], queryL: 1, queryR: 3 },
  generateSteps(input) {
    const { arr, queryL, queryR } = input;
    const n = arr.length;
    const seg = new Array(4 * n).fill(0);
    buildSeg(arr, seg, 0, 0, n - 1);

    const steps: AnimationStep[] = [];
    const maxNode = 2 * n; // enough nodes for display

    const buildNodes = (highlighted: number[] = [], active: number[] = []) => {
      const nodes = [];
      for (let i = 0; i < maxNode; i++) {
        if (seg[i] === 0 && i >= n) continue;
        const level = Math.floor(Math.log2(i + 1));
        if (level > 4) continue;
        const left = 2 * i + 1 < maxNode ? 2 * i + 1 : undefined;
        const right = 2 * i + 2 < maxNode ? 2 * i + 2 : undefined;
        nodes.push({
          id: i,
          label: String(seg[i]),
          x: nodeX(i),
          y: nodeY(i),
          left: left !== undefined && left < maxNode ? left : undefined,
          right: right !== undefined && right < maxNode ? right : undefined,
        });
      }
      return nodes;
    };

    steps.push({
      stepNumber: steps.length + 1,
      description: `Build segment tree for [${arr.join(", ")}].`,
      highlightLines: [1, 2, 3, 4, 5],
      visualState: {
        type: "tree",
        nodes: buildNodes(),
        highlighted: [0],
        comparing: [],
      },
      variables: { arr, n },
    });

    // Show build by levels
    for (let level = 0; level <= 3; level++) {
      const start = (1 << level) - 1;
      const end = Math.min((1 << (level + 1)) - 2, 2 * n - 1);
      const levelNodes = [];
      for (let i = start; i <= end; i++) if (i < seg.length) levelNodes.push(i);

      steps.push({
        stepNumber: steps.length + 1,
        description: `Build level ${level}: nodes ${levelNodes.join(", ")} store range sums.`,
        highlightLines: [7, 8, 9, 10, 11, 12, 13],
        visualState: {
          type: "tree",
          nodes: buildNodes(levelNodes),
          highlighted: levelNodes,
          comparing: [],
        },
        variables: { level, nodes: levelNodes.map((i) => seg[i]) },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Segment tree built. Root (node 0) = ${seg[0]} = sum of all elements.`,
      highlightLines: [13],
      visualState: {
        type: "tree",
        nodes: buildNodes(),
        highlighted: [0],
        comparing: [],
      },
      variables: { totalSum: seg[0] },
    });

    // Query
    const queryNodes: number[] = [];
    const queryResult: number[] = [];

    function query(node: number, start: number, end: number, l: number, r: number): number {
      queryNodes.push(node);
      if (r < start || end < l) { return 0; }
      if (l <= start && end <= r) { queryResult.push(node); return seg[node]; }
      const mid = (start + end) >> 1;
      return query(2 * node + 1, start, mid, l, r) + query(2 * node + 2, mid + 1, end, l, r);
    }

    const result = query(0, 0, n - 1, queryL, queryR);

    steps.push({
      stepNumber: steps.length + 1,
      description: `Query range sum [${queryL}..${queryR}]: traverse relevant nodes.`,
      highlightLines: [15, 16, 17, 18, 19, 20],
      visualState: {
        type: "tree",
        nodes: buildNodes(queryNodes, queryResult),
        highlighted: queryNodes,
        comparing: queryResult,
        found: queryResult[0],
      },
      variables: { queryL, queryR, visitedNodes: queryNodes, sumNodes: queryResult },
    });

    steps.push({
      stepNumber: steps.length + 1,
      description: `Range sum query [${queryL}..${queryR}] = ${result}. (arr[${queryL}..${queryR}] = [${arr.slice(queryL, queryR + 1).join("+")}])`,
      highlightLines: [20],
      visualState: {
        type: "tree",
        nodes: buildNodes(queryResult),
        highlighted: queryResult,
        comparing: [],
      },
      variables: { queryL, queryR, result },
    });

    return steps;
  },
};
