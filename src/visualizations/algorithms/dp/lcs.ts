import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]`;

export const lcsModule: VisualizationModule<{ s1: string; s2: string }> = {
  id: "dp-lcs",
  slug: "lcs",
  title: "Longest Common Subsequence",
  category: ["algorithms", "dp"],
  difficulty: "intermediate",
  timeComplexity: "O(m·n)",
  spaceComplexity: "O(m·n)",
  description: "Finds the longest subsequence common to two strings using a 2D DP table.",
  relatedTopics: ["edit-distance", "lis"],
  pythonCode,
  codeSteps: [],
  defaultInput: { s1: "ABCBDAB", s2: "BDCAB" },
  generateSteps(input) {
    const { s1, s2 } = input ?? { s1: "ABCBDAB", s2: "BDCAB" };
    const steps: AnimationStep[] = [];
    const m = s1.length, n = s2.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    const filledCells: [number, number][] = [];

    const rowLabels = ["", ...s1.split("")];
    const colLabels = ["", ...s2.split("")];

    function matrixSnapshot() {
      return dp.map((row) => [...row]);
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `LCS of "${s1}" and "${s2}". Build ${m + 1}×${n + 1} DP table.`,
      highlightLines: [1, 2, 3],
      visualState: { type: "table2d", matrix: matrixSnapshot(), rowLabels, colLabels, title: "LCS Table dp[i][j]" },
      variables: { s1, s2, m, n },
    });

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `dp[${i}][${j}]: s1[${i - 1}]='${s1[i - 1]}' vs s2[${j - 1}]='${s2[j - 1]}'.`,
          highlightLines: [4, 5, 6],
          visualState: { type: "table2d", matrix: matrixSnapshot(), rowLabels, colLabels, activeCell: [i, j], filledCells: [...filledCells], title: "LCS Table dp[i][j]" },
          variables: { i, j, c1: s1[i - 1], c2: s2[j - 1] },
        });

        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          steps.push({
            stepNumber: steps.length + 1,
            description: `Match! dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}.`,
            highlightLines: [7],
            visualState: { type: "table2d", matrix: matrixSnapshot(), rowLabels, colLabels, activeCell: [i, j], filledCells: [...filledCells], title: "LCS Table dp[i][j]" },
            variables: { i, j, val: dp[i][j] },
          });
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          steps.push({
            stepNumber: steps.length + 1,
            description: `No match. dp[${i}][${j}] = max(dp[${i - 1}][${j}]=${dp[i - 1][j]}, dp[${i}][${j - 1}]=${dp[i][j - 1]}) = ${dp[i][j]}.`,
            highlightLines: [8, 9],
            visualState: { type: "table2d", matrix: matrixSnapshot(), rowLabels, colLabels, activeCell: [i, j], filledCells: [...filledCells], title: "LCS Table dp[i][j]" },
            variables: { i, j, val: dp[i][j] },
          });
        }
        filledCells.push([i, j]);
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `LCS length = dp[${m}][${n}] = ${dp[m][n]}.`,
      highlightLines: [10],
      visualState: { type: "table2d", matrix: matrixSnapshot(), rowLabels, colLabels, activeCell: [m, n], filledCells: [...filledCells], title: "LCS Table dp[i][j]" },
      variables: { answer: dp[m][n] },
    });

    return steps;
  },
};
