import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `class FenwickTree:
    def __init__(self, n):
        self.n = n
        self.bit = [0] * (n + 1)

    def update(self, i, delta):
        i += 1  # 1-indexed
        while i <= self.n:
            self.bit[i] += delta
            i += i & (-i)  # move to next responsible index

    def prefix_sum(self, i):
        i += 1
        s = 0
        while i > 0:
            s += self.bit[i]
            i -= i & (-i)
        return s

    def range_query(self, l, r):
        return self.prefix_sum(r) - (self.prefix_sum(l - 1) if l > 0 else 0)`;

export const fenwickTreeModule: VisualizationModule<{ arr: number[]; queries: { l: number; r: number }[] }> = {
  id: "data-structures-trees-fenwick-tree",
  slug: "fenwick-tree",
  title: "Fenwick Tree (BIT)",
  category: ["data-structures", "trees"],
  difficulty: "advanced",
  timeComplexity: "O(log n) update/query",
  spaceComplexity: "O(n)",
  description: "Binary Indexed Tree for efficient prefix sum queries and point updates.",
  relatedTopics: ["segment-tree"],
  pythonCode,
  codeSteps: [],
  defaultInput: { arr: [3, 2, -1, 6, 5, 4, -3, 3], queries: [{ l: 2, r: 5 }] },
  generateSteps(input) {
    const { arr, queries } = input;
    const n = arr.length;
    const bit = new Array(n + 1).fill(0);
    const steps: AnimationStep[] = [];

    const snap = (desc: string, active: number[], lines: number[], vars: Record<string, unknown>) => {
      steps.push({
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: lines,
        visualState: {
          type: "array1d",
          cells: bit.slice(1).map((v, i) => ({
            val: v,
            state: active.includes(i + 1) ? "active" : v !== 0 ? "highlighted" : "default",
          })),
          label: "BIT Array (1-indexed internally)",
          pointer: active.map((idx) => ({ index: idx - 1, label: `${idx}` })),
        },
        variables: { bit: [...bit], ...vars },
      });
    };

    snap("Initialize BIT of size n+1 = " + (n + 1) + " with zeros.", [], [1, 2, 3, 4], { n });

    // Build by updating each element
    for (let idx = 0; idx < n; idx++) {
      const val = arr[idx];
      let i = idx + 1;
      const updated: number[] = [];

      steps.push({
        stepNumber: steps.length + 1,
        description: `Update index ${idx} (1-indexed: ${i}) with value ${val}.`,
        highlightLines: [6, 7, 8],
        visualState: {
          type: "array1d",
          cells: bit.slice(1).map((v, k) => ({ val: v, state: k + 1 === i ? "active" : v !== 0 ? "highlighted" : "default" })),
          label: "BIT Array",
        },
        variables: { idx, val, i },
      });

      while (i <= n) {
        bit[i] += val;
        updated.push(i);
        i += i & (-i);
      }

      snap(`After update: positions ${updated.join(",")} incremented by ${val}.`, updated, [9, 10], {
        updated,
        val,
        bit: [...bit],
      });
    }

    snap("BIT fully built from input array.", [], [], { bit: bit.slice(1), arr });

    // Perform range queries
    for (const { l, r } of queries) {
      // prefix_sum(r)
      const computePrefixSum = (ri: number) => {
        let i = ri + 1;
        let s = 0;
        const visited: number[] = [];
        while (i > 0) {
          s += bit[i];
          visited.push(i);
          i -= i & (-i);
        }
        return { s, visited };
      };

      const { s: sumR, visited: vR } = computePrefixSum(r);
      snap(
        `Query [${l},${r}]: compute prefix_sum(${r}). Traverse: ${vR.join("→")}. Sum = ${sumR}.`,
        vR,
        [13, 14, 15, 16, 17],
        { query: `[${l},${r}]`, prefixR: sumR, traverse: vR },
      );

      if (l > 0) {
        const { s: sumL, visited: vL } = computePrefixSum(l - 1);
        snap(
          `Subtract prefix_sum(${l - 1}). Traverse: ${vL.join("→")}. Sum = ${sumL}.`,
          vL,
          [13, 14, 15, 16, 17],
          { prefixL: sumL, traverse: vL },
        );

        const result = sumR - sumL;
        snap(`Range sum [${l},${r}] = ${sumR} - ${sumL} = ${result}.`, [], [19], {
          l,
          r,
          result,
          expected: arr.slice(l, r + 1).reduce((a, b) => a + b, 0),
        });
      } else {
        snap(`Range sum [${l},${r}] = prefix_sum(${r}) = ${sumR}.`, [], [19], {
          l,
          r,
          result: sumR,
        });
      }
    }

    return steps;
  },
};
