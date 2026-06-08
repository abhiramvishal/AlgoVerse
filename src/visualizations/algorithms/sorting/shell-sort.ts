import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def shell_sort(arr):
    n = len(arr)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap and arr[j - gap] > temp:
                arr[j] = arr[j - gap]
                j -= gap
            arr[j] = temp
        gap //= 2
    return arr`;

export const shellSortModule: VisualizationModule<number[]> = {
  id: "sorting-shell-sort",
  slug: "shell-sort",
  title: "Shell Sort",
  category: ["algorithms", "sorting"],
  difficulty: "intermediate",
  timeComplexity: "O(n log² n)",
  spaceComplexity: "O(1)",
  description: "Generalization of insertion sort that compares elements far apart first, then reduces the gap.",
  relatedTopics: ["insertion-sort", "comb-sort"],
  pythonCode,
  codeSteps: [],
  defaultInput: [12, 34, 54, 2, 3, 9, 17],
  generateSteps(input) {
    const arr = [...input];
    const steps: AnimationStep[] = [];
    const n = arr.length;

    steps.push({
      stepNumber: steps.length + 1,
      description: "Starting Shell Sort.",
      highlightLines: [1, 2, 3],
      visualState: { array: [...arr], active: [], sorted: [] },
      variables: { n, gap: Math.floor(n / 2) },
    });

    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `Gap = ${gap}. Performing gap-insertion sort.`,
        highlightLines: [4],
        visualState: { array: [...arr], active: [], sorted: [], gapLabel: gap },
        variables: { gap },
      });

      for (let i = gap; i < n; i++) {
        const temp = arr[i];
        let j = i;

        steps.push({
          stepNumber: steps.length + 1,
          description: `i=${i}, temp=arr[${i}]=${temp}. Compare with element ${gap} positions back.`,
          highlightLines: [5, 6],
          visualState: { array: [...arr], active: [i], sorted: [], gapLabel: gap },
          variables: { gap, i, temp },
        });

        while (j >= gap && arr[j - gap] > temp) {
          steps.push({
            stepNumber: steps.length + 1,
            description: `arr[${j - gap}]=${arr[j - gap]} > ${temp}. Shift right.`,
            highlightLines: [7, 8, 9],
            visualState: { array: [...arr], active: [j, j - gap], sorted: [], gapLabel: gap },
            variables: { gap, i, j, temp },
          });
          arr[j] = arr[j - gap];
          j -= gap;
        }

        arr[j] = temp;
        if (j !== i) {
          steps.push({
            stepNumber: steps.length + 1,
            description: `Place temp=${temp} at position ${j}.`,
            highlightLines: [10],
            visualState: { array: [...arr], active: [j], sorted: [], gapLabel: gap },
            variables: { gap, i, j, temp },
          });
        }
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: "Shell Sort complete.",
      highlightLines: [12],
      visualState: { array: [...arr], active: [], sorted: Array.from({ length: n }, (_, k) => k) },
      variables: { sorted: true },
    });

    return steps;
  },
};
