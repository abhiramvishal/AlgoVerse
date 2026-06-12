import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type SubsetsInput = number[];

const pythonCode = `def subsets(nums):
    result = [[]]
    def backtrack(start, current):
        result.append(current[:])
        for i in range(start, len(nums)):
            current.append(nums[i])
            backtrack(i + 1, current)
            current.pop()
    backtrack(0, [])
    return result`;

export const subsetsBtModule: VisualizationModule<SubsetsInput> = {
  id: "backtracking-subsets",
  slug: "subsets-bt",
  title: "Subsets",
  category: ["algorithms", "backtracking"],
  difficulty: "intermediate",
  timeComplexity: "O(2^n)",
  spaceComplexity: "O(n)",
  description:
    "Generate all subsets (power set) of an array using backtracking.",
  relatedTopics: ["combinations", "permutations"],
  pythonCode,
  codeSteps: [],
  defaultInput: [1, 2, 3],
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const nums = input;
    const n = nums.length;
    const current: number[] = [];
    const results: number[][] = [[]];

    function snapshot() {
      return nums.map((v, i) => ({
        val: String(v),
        state: (current.includes(v) ? "computed" : "default") as "computed" | "default",
      }));
    }

    steps.push({
      stepNumber: 1,
      description: "Start with empty subset [].",
      highlightLines: [1],
      visualState: {
        type: "array1d",
        cells: snapshot(),
        label: "Current subset: []",
        pointers: [],
      },
      variables: { current: [], subsets: 1 },
    });

    function backtrack(start: number) {
      if (steps.length >= 76) return;
      for (let i = start; i < n; i++) {
        current.push(nums[i]);

        steps.push({
          stepNumber: steps.length + 1,
          description: `Add ${nums[i]}. Subset: [${current.join(",")}]`,
          highlightLines: [4, 5],
          visualState: {
            type: "array1d",
            cells: snapshot(),
            label: `Subset: [${current.join(",")}]`,
            pointers: [{ index: i, label: "add" }],
          },
          variables: { current: [...current], start: i + 1 },
        });

        results.push([...current]);
        steps.push({
          stepNumber: steps.length + 1,
          description: `Record subset #${results.length - 1}: [${current.join(",")}]`,
          highlightLines: [3],
          visualState: {
            type: "array1d",
            cells: results.slice(0, 8).map((s) => ({ val: `[${s.join(",")}]`, state: "computed" as const })),
            label: `Subsets found so far: ${results.length}`,
            pointers: [],
          },
          variables: { subset: [...current], totalFound: results.length },
        });

        backtrack(i + 1);

        current.pop();
        steps.push({
          stepNumber: steps.length + 1,
          description: `Backtrack: remove ${nums[i]}.`,
          highlightLines: [7],
          visualState: {
            type: "array1d",
            cells: snapshot(),
            label: `After backtrack: [${current.join(",")}]`,
            pointers: [{ index: i, label: "×" }],
          },
          variables: { current: [...current], removed: nums[i] },
        });
      }
    }

    backtrack(0);

    steps.push({
      stepNumber: steps.length + 1,
      description: `All 2^${n}=${results.length} subsets generated.`,
      highlightLines: [8],
      visualState: {
        type: "array1d",
        cells: results.map((s) => ({ val: `[${s.join(",")}]` || "[]", state: "computed" as const })),
        label: `All ${results.length} subsets (power set)`,
        pointers: [],
      },
      variables: { totalSubsets: results.length },
    });

    return steps;
  },
};
