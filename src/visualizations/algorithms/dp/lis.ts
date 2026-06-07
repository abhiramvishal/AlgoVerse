import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def lis(arr):
    n = len(arr)
    dp = [1] * n
    for i in range(1, n):
        for j in range(i):
            if arr[j] < arr[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)`;

export const lisModule: VisualizationModule<number[]> = {
  id: "dp-lis",
  slug: "lis",
  title: "Longest Increasing Subsequence",
  category: ["algorithms", "dp"],
  difficulty: "intermediate",
  timeComplexity: "O(n²)",
  spaceComplexity: "O(n)",
  description: "Finds the length of the longest strictly increasing subsequence using DP.",
  relatedTopics: ["lcs", "coin-change"],
  pythonCode,
  codeSteps: [],
  defaultInput: [10, 9, 2, 5, 3, 7, 101, 18],
  generateSteps(input) {
    const arr = input ?? [10, 9, 2, 5, 3, 7, 101, 18];
    const steps: AnimationStep[] = [];
    const n = arr.length;
    const dp = new Array(n).fill(1);

    function makeArrCells(activeIdx: number) {
      return arr.map((val, i) => ({
        val,
        state: i === activeIdx ? "active" as const : "default" as const,
      }));
    }

    function makeDpCells(activeIdx: number, highlightIdx: number) {
      return dp.map((val, i) => ({
        val,
        state: i === activeIdx ? "active" as const : i === highlightIdx ? "highlighted" as const : val > 1 ? "computed" as const : "default" as const,
      }));
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `LIS on [${arr.join(",")}]. Initialize dp[i]=1 for all i.`,
      highlightLines: [1, 2, 3],
      visualState: { type: "array1d", cells: makeArrCells(-1), label: `arr = [${arr.join(",")}]` },
      variables: { n, dp: dp.join(",") },
    });

    for (let i = 1; i < n; i++) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `i=${i}, arr[${i}]=${arr[i]}. Check all j < ${i}.`,
        highlightLines: [3, 4],
        visualState: { type: "array1d", cells: makeArrCells(i), label: `arr, dp=[${dp.join(",")}]` },
        variables: { i, val: arr[i], dpI: dp[i] },
      });

      for (let j = 0; j < i; j++) {
        if (arr[j] < arr[i]) {
          const candidate = dp[j] + 1;
          steps.push({
            stepNumber: steps.length + 1,
            description: `arr[${j}]=${arr[j]} < arr[${i}]=${arr[i]}. dp[${j}]+1=${candidate} vs dp[${i}]=${dp[i]}.`,
            highlightLines: [5, 6, 7],
            visualState: { type: "array1d", cells: makeDpCells(i, j), label: `dp=[${dp.join(",")}]` },
            variables: { i, j, candidate, dpI: dp[i] },
          });
          if (candidate > dp[i]) {
            dp[i] = candidate;
          }
        }
      }

      steps.push({
        stepNumber: steps.length + 1,
        description: `dp[${i}] = ${dp[i]}.`,
        highlightLines: [7],
        visualState: { type: "array1d", cells: makeDpCells(i, -1), label: `dp=[${dp.join(",")}]` },
        variables: { i, dpI: dp[i] },
      });
    }

    const answer = Math.max(...dp);
    steps.push({
      stepNumber: steps.length + 1,
      description: `LIS length = max(dp) = ${answer}. dp=[${dp.join(",")}].`,
      highlightLines: [8],
      visualState: {
        type: "array1d",
        cells: dp.map((val) => ({ val, state: val === answer ? "highlighted" as const : "computed" as const })),
        label: `dp=[${dp.join(",")}]`,
      },
      variables: { answer, dp: dp.join(",") },
    });

    return steps;
  },
};
