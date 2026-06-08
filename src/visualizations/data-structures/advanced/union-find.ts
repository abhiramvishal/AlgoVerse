import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # path compression
        return self.parent[x]

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb: return False
        if self.rank[ra] < self.rank[rb]: ra, rb = rb, ra
        self.parent[rb] = ra
        if self.rank[ra] == self.rank[rb]: self.rank[ra] += 1
        return True`;

type UFOp =
  | { type: "union"; a: number; b: number }
  | { type: "find"; a: number };

export const unionFindModule: VisualizationModule<{
  n: number;
  operations: UFOp[];
}> = {
  id: "data-structures-advanced-union-find",
  slug: "union-find",
  title: "Union-Find (Disjoint Set)",
  category: ["data-structures", "advanced"],
  difficulty: "intermediate",
  timeComplexity: "O(α(n)) amortized",
  spaceComplexity: "O(n)",
  description: "Union-Find with path compression and union by rank for near-O(1) operations.",
  relatedTopics: ["graph-algorithms"],
  pythonCode,
  codeSteps: [],
  defaultInput: {
    n: 8,
    operations: [
      { type: "union", a: 0, b: 1 },
      { type: "union", a: 2, b: 3 },
      { type: "union", a: 4, b: 5 },
      { type: "union", a: 0, b: 2 },
      { type: "find", a: 4 },
      { type: "union", a: 0, b: 4 },
    ],
  },
  generateSteps(input) {
    const { n, operations } = input;
    const parent = Array.from({ length: n }, (_, i) => i);
    const rank = new Array(n).fill(0);
    const steps: AnimationStep[] = [];

    const snap = (desc: string, active: number[], lines: number[], vars: Record<string, unknown>) => {
      steps.push({
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: lines,
        visualState: {
          type: "array1d",
          cells: parent.map((p, i) => ({
            val: p,
            state: active.includes(i) ? "active" : p !== i ? "highlighted" : "default",
          })),
          label: "parent[] array",
          pointer: active.map((i) => ({ index: i, label: String(i) })),
        },
        variables: { parent: [...parent], rank: [...rank], ...vars },
      });
    };

    snap("Initialize Union-Find: parent[i]=i (each element is its own set).", [], [1, 2, 3], {
      n,
      components: n,
    });

    const find = (x: number): number => {
      if (parent[x] !== x) parent[x] = find(parent[x]);
      return parent[x];
    };

    const union = (a: number, b: number): boolean => {
      const ra = find(a), rb = find(b);
      if (ra === rb) return false;
      if (rank[ra] < rank[rb]) { parent[ra] = rb; }
      else if (rank[ra] > rank[rb]) { parent[rb] = ra; }
      else { parent[rb] = ra; rank[ra]++; }
      return true;
    };

    for (const op of operations) {
      if (op.type === "union") {
        const { a, b } = op;
        const ra = find(a), rb = find(b);
        snap(
          `union(${a}, ${b}): find(${a})=${ra}, find(${b})=${rb}.`,
          [a, b],
          [11, 12],
          { op: `union(${a},${b})`, ra, rb },
        );
        const merged = union(a, b);
        snap(
          merged
            ? `Merged: parent[${rb === find(b) ? ra : rb}] → ${parent[rb === find(b) ? ra : rb]}. New root = ${find(a)}.`
            : `${a} and ${b} already in same set (root=${ra}).`,
          [a, b],
          [13, 14, 15, 16],
          { merged, parent: [...parent], rank: [...rank] },
        );
      } else {
        const { a } = op;
        const root = find(a);
        snap(
          `find(${a}): root = ${root}. Path compression applied.`,
          [a],
          [6, 7, 8, 9],
          { query: `find(${a})`, root, parent: [...parent] },
        );
      }
    }

    snap(`Final parent array after all operations.`, [], [], {
      parent: [...parent],
      sets: [...new Set(parent.map((p) => find(p)))],
    });

    return steps;
  },
};
