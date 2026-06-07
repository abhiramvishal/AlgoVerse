import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def fibonacci(n):
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]`;

export const fibonacciDpModule: VisualizationModule<number> = {
  id: "dp-fibonacci",
  slug: "fibonacci-dp",
  title: "Fibonacci (DP)",
  category: ["algorithms", "dp"],
  difficulty: "beginner",
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)",
  description: "Computes Fibonacci numbers using bottom-up dynamic programming to avoid recomputation.",
  relatedTopics: ["coin-change", "lis"],
  pythonCode,
  codeSteps: [],
  defaultInput: 10,
  generateSteps(n) {
    const target = n ?? 10;
    const steps: AnimationStep[] = [];
    const dp = new Array(target + 1).fill(0);

    function makeCells(activeIdx: number, computedUpTo: number) {
      return dp.map((val, i) => ({
        val: i <= computedUpTo ? val : "?",
        state: i === activeIdx ? "active" as const : i < activeIdx ? "computed" as const : "default" as const,
      }));
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Computing Fibonacci up to n=${target}. Initialize dp[0]=0, dp[1]=1.`,
      highlightLines: [1, 2, 3],
      visualState: { type: "array1d", cells: makeCells(-1, 1), label: `dp[0..${target}]` },
      variables: { n: target, dp0: 0, dp1: 1 },
    });

    dp[0] = 0; dp[1] = 1;

    steps.push({
      stepNumber: steps.length + 1,
      description: "dp[0]=0, dp[1]=1 initialized.",
      highlightLines: [2, 3],
      visualState: { type: "array1d", cells: makeCells(1, 1), label: `dp[0..${target}]` },
      variables: { "dp[0]": 0, "dp[1]": 1 },
    });

    for (let i = 2; i <= target; i++) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `Compute dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]}.`,
        highlightLines: [4, 5],
        visualState: {
          type: "array1d",
          cells: dp.map((val, idx) => ({
            val: idx < i ? val : "?",
            state: idx === i - 1 || idx === i - 2 ? "highlighted" as const : idx < i ? "computed" as const : "default" as const,
          })),
          label: `dp[0..${target}]`,
          pointer: [{ index: i - 1, label: "i-1" }, { index: i - 2, label: "i-2" }],
        },
        variables: { i, "dp[i-1]": dp[i - 1], "dp[i-2]": dp[i - 2] },
      });

      dp[i] = dp[i - 1] + dp[i - 2];

      steps.push({
        stepNumber: steps.length + 1,
        description: `dp[${i}] = ${dp[i]}.`,
        highlightLines: [5],
        visualState: { type: "array1d", cells: makeCells(i, i), label: `dp[0..${target}]` },
        variables: { i, result: dp[i] },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Fibonacci(${target}) = dp[${target}] = ${dp[target]}.`,
      highlightLines: [6],
      visualState: { type: "array1d", cells: makeCells(target, target), label: `dp[0..${target}]` },
      variables: { answer: dp[target] },
    });

    return steps;
  },
};
