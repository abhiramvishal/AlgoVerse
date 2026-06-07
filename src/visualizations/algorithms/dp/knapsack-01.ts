import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def knapsack_01(weights, values, capacity):
    n = len(weights)
    dp = [[0]*(capacity+1) for _ in range(n+1)]
    for i in range(1, n+1):
        for w in range(capacity+1):
            dp[i][w] = dp[i-1][w]
            if weights[i-1] <= w:
                dp[i][w] = max(dp[i][w], dp[i-1][w-weights[i-1]] + values[i-1])
    return dp[n][capacity]`;

export const knapsack01Module: VisualizationModule<{ weights: number[]; values: number[]; capacity: number }> = {
  id: "dp-knapsack-01",
  slug: "knapsack-01",
  title: "0/1 Knapsack",
  category: ["algorithms", "dp"],
  difficulty: "intermediate",
  timeComplexity: "O(n·W)",
  spaceComplexity: "O(n·W)",
  description: "Maximizes value of items packed into a knapsack where each item is used at most once.",
  relatedTopics: ["coin-change", "lcs"],
  pythonCode,
  codeSteps: [],
  defaultInput: { weights: [1, 3, 4, 5], values: [1, 4, 5, 7], capacity: 7 },
  generateSteps(input) {
    const { weights, values, capacity } = input ?? { weights: [1, 3, 4, 5], values: [1, 4, 5, 7], capacity: 7 };
    const steps: AnimationStep[] = [];
    const n = weights.length;
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));
    const filledCells: [number, number][] = [];

    const rowLabels = ["0", ...weights.map((w, i) => `i${i + 1}(w=${w})`).slice(0, n)];
    const colLabels = Array.from({ length: capacity + 1 }, (_, i) => String(i));

    function snapshot() { return dp.map((r) => [...r]); }

    steps.push({
      stepNumber: steps.length + 1,
      description: `0/1 Knapsack: n=${n} items, capacity=${capacity}. weights=[${weights}], values=[${values}].`,
      highlightLines: [1, 2, 3],
      visualState: { type: "table2d", matrix: snapshot(), rowLabels, colLabels, title: `Knapsack dp[i][w]` },
      variables: { n, capacity },
    });

    for (let i = 1; i <= n; i++) {
      for (let w = 0; w <= capacity; w++) {
        dp[i][w] = dp[i - 1][w];
        steps.push({
          stepNumber: steps.length + 1,
          description: `Item ${i} (w=${weights[i - 1]}, v=${values[i - 1]}), capacity=${w}. Start with dp[${i - 1}][${w}]=${dp[i - 1][w]}.`,
          highlightLines: [4, 5, 6],
          visualState: { type: "table2d", matrix: snapshot(), rowLabels, colLabels, activeCell: [i, w], filledCells: [...filledCells], title: `Knapsack dp[i][w]` },
          variables: { i, w, weight: weights[i - 1], value: values[i - 1], current: dp[i][w] },
        });

        if (weights[i - 1] <= w) {
          const candidate = dp[i - 1][w - weights[i - 1]] + values[i - 1];
          if (candidate > dp[i][w]) {
            dp[i][w] = candidate;
            steps.push({
              stepNumber: steps.length + 1,
              description: `Include item ${i}: dp[${i - 1}][${w - weights[i - 1]}]+${values[i - 1]}=${candidate} > ${dp[i - 1][w]}. Update dp[${i}][${w}]=${candidate}.`,
              highlightLines: [7, 8],
              visualState: { type: "table2d", matrix: snapshot(), rowLabels, colLabels, activeCell: [i, w], filledCells: [...filledCells], title: `Knapsack dp[i][w]` },
              variables: { i, w, dp: dp[i][w] },
            });
          }
        }
        filledCells.push([i, w]);
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Answer: dp[${n}][${capacity}] = ${dp[n][capacity]}.`,
      highlightLines: [9],
      visualState: { type: "table2d", matrix: snapshot(), rowLabels, colLabels, activeCell: [n, capacity], filledCells: [...filledCells], title: `Knapsack dp[i][w]` },
      variables: { answer: dp[n][capacity] },
    });

    return steps;
  },
};
