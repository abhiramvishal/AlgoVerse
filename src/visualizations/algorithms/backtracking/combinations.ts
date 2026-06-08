import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type CombinationsInput = { n: number; k: number };

const pythonCode = `def combinations(n, k):
    result = []
    def backtrack(start, current):
        if len(current) == k:
            result.append(current[:])
            return
        for i in range(start, n + 1):
            current.append(i)
            backtrack(i + 1, current)
            current.pop()
    backtrack(1, [])
    return result`;

export const combinationsBtModule: VisualizationModule<CombinationsInput> = {
  id: "backtracking-combinations",
  slug: "combinations",
  title: "Combinations",
  category: ["algorithms", "backtracking"],
  difficulty: "intermediate",
  timeComplexity: "O(C(n,k))",
  spaceComplexity: "O(k)",
  description:
    "Generate all combinations C(n,k) using backtracking.",
  relatedTopics: ["permutations", "subsets"],
  pythonCode,
  codeSteps: [],
  defaultInput: { n: 4, k: 2 },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { n, k } = input;
    const current: number[] = [];
    const results: number[][] = [];

    function snapshot() {
      const cells = Array.from({ length: n }, (_, i) => ({
        val: String(i + 1),
        state: (current.includes(i + 1) ? "computed" : "default") as "computed" | "default",
      }));
      return cells;
    }

    function backtrack(start: number) {
      if (steps.length >= 78) return;
      if (current.length === k) {
        results.push([...current]);
        steps.push({
          stepNumber: steps.length + 1,
          description: `Found combination: [${current.join(", ")}]`,
          highlightLines: [3, 4],
          visualState: {
            type: "array1d",
            cells: snapshot(),
            label: `Combination #${results.length}: [${current.join(",")}]`,
            pointers: current.map((v) => ({ index: v - 1, label: "✓" })),
          },
          variables: { combination: [...current], totalFound: results.length },
        });
        return;
      }

      for (let i = start; i <= n; i++) {
        if (steps.length >= 78) return;
        current.push(i);
        steps.push({
          stepNumber: steps.length + 1,
          description: `Choose ${i}. Current: [${current.join(",")}]`,
          highlightLines: [6, 7],
          visualState: {
            type: "array1d",
            cells: snapshot(),
            label: `Building: [${current.join(",")}]  Need ${k - current.length} more`,
            pointers: [{ index: i - 1, label: "add" }],
          },
          variables: { current: [...current], start: i + 1 },
        });

        backtrack(i + 1);

        current.pop();
        steps.push({
          stepNumber: steps.length + 1,
          description: `Backtrack: remove ${i} from current.`,
          highlightLines: [8],
          visualState: {
            type: "array1d",
            cells: snapshot(),
            label: `After backtrack: [${current.join(",")}]`,
            pointers: [{ index: i - 1, label: "×" }],
          },
          variables: { current: [...current], removed: i },
        });
      }
    }

    backtrack(1);

    steps.push({
      stepNumber: steps.length + 1,
      description: `All C(${n},${k})=${results.length} combinations found.`,
      highlightLines: [9],
      visualState: {
        type: "array1d",
        cells: results.map((c) => ({ val: `[${c.join(",")}]`, state: "computed" as const })),
        label: `All ${results.length} combinations`,
        pointers: [],
      },
      variables: { totalCombinations: results.length },
    });

    return steps;
  },
};
