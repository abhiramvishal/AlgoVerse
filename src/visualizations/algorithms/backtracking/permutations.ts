import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type PermutationsInput = number[];

const pythonCode = `def permutations(arr, start=0):
    if start == len(arr):
        print(arr[:])
        return
    for i in range(start, len(arr)):
        arr[start], arr[i] = arr[i], arr[start]
        permutations(arr, start + 1)
        arr[start], arr[i] = arr[i], arr[start]  # backtrack`;

export const permutationsBtModule: VisualizationModule<PermutationsInput> = {
  id: "backtracking-permutations",
  slug: "permutations",
  title: "Permutations",
  category: ["algorithms", "backtracking"],
  difficulty: "intermediate",
  timeComplexity: "O(n!)",
  spaceComplexity: "O(n)",
  description:
    "Generate all permutations of an array using backtracking and swapping.",
  relatedTopics: ["combinations", "subsets", "n-queens"],
  pythonCode,
  codeSteps: [],
  defaultInput: [1, 2, 3],
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const arr = [...input];
    const results: number[][] = [];

    function snapshot(active: number[] = [], swapPair: number[] = []) {
      return arr.map((v, i) => ({
        val: String(v),
        state: (
          swapPair.includes(i) ? "active" : active.includes(i) ? "computed" : "default"
        ) as "active" | "computed" | "default",
      }));
    }

    function permute(start: number) {
      if (steps.length >= 78) return;
      if (start === arr.length) {
        const perm = [...arr];
        results.push(perm);
        steps.push({
          stepNumber: steps.length + 1,
          description: `Found permutation: [${perm.join(", ")}]`,
          highlightLines: [2, 3],
          visualState: {
            type: "array1d",
            cells: snapshot(arr.map((_, i) => i)),
            label: `Permutation #${results.length}: [${perm.join(",")}]`,
            pointers: [],
          },
          variables: { permutation: perm, totalFound: results.length },
        });
        return;
      }

      for (let i = start; i < arr.length; i++) {
        if (steps.length >= 78) return;
        if (i !== start) {
          steps.push({
            stepNumber: steps.length + 1,
            description: `Swap arr[${start}]=${arr[start]} with arr[${i}]=${arr[i]}.`,
            highlightLines: [5],
            visualState: {
              type: "array1d",
              cells: snapshot([], [start, i]),
              label: `Swapping positions ${start} and ${i}`,
              pointers: [{ index: start, label: "start" }, { index: i, label: "i" }],
            },
            variables: { start, i },
          });
          [arr[start], arr[i]] = [arr[i], arr[start]];
        }

        steps.push({
          stepNumber: steps.length + 1,
          description: `Recurse with start=${start + 1}, arr=[${arr.join(",")}]`,
          highlightLines: [6],
          visualState: {
            type: "array1d",
            cells: snapshot(Array.from({ length: start + 1 }, (_, k) => k)),
            label: `Fixed: [${arr.slice(0, start + 1).join(",")}]  Remaining: [${arr.slice(start + 1).join(",")}]`,
            pointers: [{ index: start, label: "fixed" }],
          },
          variables: { start: start + 1, current: [...arr] },
        });

        permute(start + 1);

        if (i !== start) {
          steps.push({
            stepNumber: steps.length + 1,
            description: `Backtrack: swap back arr[${start}] and arr[${i}].`,
            highlightLines: [7],
            visualState: {
              type: "array1d",
              cells: snapshot([], [start, i]),
              label: `Backtracking at position ${start}`,
              pointers: [{ index: start, label: "start" }, { index: i, label: "i" }],
            },
            variables: { start, i, backtrack: true },
          });
          [arr[start], arr[i]] = [arr[i], arr[start]];
        }
      }
    }

    permute(0);

    steps.push({
      stepNumber: steps.length + 1,
      description: `All ${results.length} permutations generated.`,
      highlightLines: [1],
      visualState: {
        type: "array1d",
        cells: results.slice(0, 8).map((p) => ({ val: `[${p.join(",")}]`, state: "computed" as const })),
        label: `All ${results.length} permutations`,
        pointers: [],
      },
      variables: { totalPermutations: results.length },
    });

    return steps;
  },
};
