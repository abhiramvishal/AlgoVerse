import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i and dp[i - coin] + 1 < dp[i]:
                dp[i] = dp[i - coin] + 1
    return dp[amount] if dp[amount] != float('inf') else -1`;

export const coinChangeModule: VisualizationModule<{ coins: number[]; amount: number }> = {
  id: "dp-coin-change",
  slug: "coin-change",
  title: "Coin Change",
  category: ["algorithms", "dp"],
  difficulty: "intermediate",
  timeComplexity: "O(n·k)",
  spaceComplexity: "O(n)",
  description: "Finds the minimum number of coins to make a given amount using dynamic programming.",
  relatedTopics: ["fibonacci-dp", "knapsack-01"],
  pythonCode,
  codeSteps: [],
  defaultInput: { coins: [1, 5, 6, 9], amount: 11 },
  generateSteps(input) {
    const { coins, amount } = input ?? { coins: [1, 5, 6, 9], amount: 11 };
    const steps: AnimationStep[] = [];
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;

    function makeCells(activeIdx: number) {
      return dp.map((val, i) => ({
        val: val === Infinity ? "∞" : val,
        state: i === activeIdx ? "active" as const : val !== Infinity && i > 0 ? "computed" as const : "default" as const,
      }));
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Coin Change: coins=[${coins.join(",")}], amount=${amount}. Initialize dp[0]=0, all others=∞.`,
      highlightLines: [1, 2, 3],
      visualState: { type: "array1d", cells: makeCells(-1), label: `dp[0..${amount}]` },
      variables: { coins: coins.join(","), amount },
    });

    for (let i = 1; i <= amount; i++) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `Compute dp[${i}]: try all coins.`,
        highlightLines: [3, 4],
        visualState: { type: "array1d", cells: makeCells(i), label: `dp[0..${amount}]` },
        variables: { i, currentDp: dp[i] === Infinity ? "∞" : dp[i] },
      });

      for (const coin of coins) {
        if (coin <= i) {
          const candidate = dp[i - coin] + 1;
          if (candidate < dp[i]) {
            steps.push({
              stepNumber: steps.length + 1,
              description: `coin=${coin}: dp[${i - coin}]+1=${dp[i - coin] === Infinity ? "∞+1" : candidate} < dp[${i}]=${dp[i] === Infinity ? "∞" : dp[i]}. Update!`,
              highlightLines: [5, 6, 7],
              visualState: {
                type: "array1d",
                cells: dp.map((val, idx) => ({
                  val: val === Infinity ? "∞" : val,
                  state: idx === i ? "active" as const : idx === i - coin ? "highlighted" as const : val !== Infinity && idx > 0 ? "computed" as const : "default" as const,
                })),
                label: `dp[0..${amount}]`,
                pointer: [{ index: i - coin, label: `i-${coin}` }],
              },
              variables: { i, coin, candidate, prev: dp[i - coin] === Infinity ? "∞" : dp[i - coin] },
            });
            dp[i] = candidate;
          }
        }
      }
    }

    const result = dp[amount] === Infinity ? -1 : dp[amount];
    steps.push({
      stepNumber: steps.length + 1,
      description: `dp[${amount}] = ${dp[amount] === Infinity ? "∞" : dp[amount]}. Answer: ${result} coins.`,
      highlightLines: [8],
      visualState: { type: "array1d", cells: makeCells(amount), label: `dp[0..${amount}]` },
      variables: { answer: result },
    });

    return steps;
  },
};
