import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`;

export const selectionSortModule: VisualizationModule<number[]> = {
  id: "sorting-selection-sort",
  slug: "selection-sort",
  title: "Selection Sort",
  category: ["algorithms", "sorting"],
  difficulty: "beginner",
  timeComplexity: "O(n²)",
  spaceComplexity: "O(1)",
  description: "Finds the minimum element in the unsorted range and swaps it into place.",
  relatedTopics: ["bubble-sort", "insertion-sort"],
  pythonCode,
  codeSteps: [],
  defaultInput: [64, 25, 12, 22, 11],
  generateSteps(input) {
    const arr = [...input];
    const steps: AnimationStep[] = [];
    const n = arr.length;
    const sorted: number[] = [];

    steps.push({
      stepNumber: steps.length + 1,
      description: "Starting Selection Sort.",
      highlightLines: [1, 2],
      visualState: { array: [...arr], active: [], sorted: [] },
      variables: { n, i: null, minIdx: null },
    });

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;

      steps.push({
        stepNumber: steps.length + 1,
        description: `Pass ${i + 1}: looking for minimum in range [${i}..${n - 1}]. Current minimum at index ${i} (value ${arr[i]}).`,
        highlightLines: [3, 4],
        visualState: { array: [...arr], active: [i, minIdx], sorted: [...sorted] },
        variables: { i, minIdx, minVal: arr[minIdx] },
      });

      for (let j = i + 1; j < n; j++) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Compare arr[${j}]=${arr[j]} with current min arr[${minIdx}]=${arr[minIdx]}.`,
          highlightLines: [5, 6],
          visualState: { array: [...arr], active: [j, minIdx], sorted: [...sorted] },
          variables: { i, j, minIdx, minVal: arr[minIdx] },
        });

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          steps.push({
            stepNumber: steps.length + 1,
            description: `New minimum found: arr[${j}]=${arr[j]}.`,
            highlightLines: [6, 7],
            visualState: { array: [...arr], active: [j, minIdx], sorted: [...sorted] },
            variables: { i, j, minIdx, minVal: arr[minIdx] },
          });
        }
      }

      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        steps.push({
          stepNumber: steps.length + 1,
          description: `Swap arr[${i}]=${arr[minIdx]} and arr[${minIdx}]=${arr[i]} (swapping back to show original).`,
          highlightLines: [8],
          visualState: { array: [...arr], active: [i, minIdx], sorted: [...sorted] },
          variables: { i, minIdx, swapped: true },
        });
      } else {
        steps.push({
          stepNumber: steps.length + 1,
          description: `arr[${i}]=${arr[i]} is already the minimum. No swap needed.`,
          highlightLines: [8],
          visualState: { array: [...arr], active: [i], sorted: [...sorted] },
          variables: { i, minIdx, swapped: false },
        });
      }

      sorted.push(i);
    }
    sorted.push(n - 1);

    steps.push({
      stepNumber: steps.length + 1,
      description: "Selection Sort complete.",
      highlightLines: [9],
      visualState: { array: [...arr], active: [], sorted: Array.from({ length: n }, (_, k) => k) },
      variables: { sorted: true },
    });

    return steps;
  },
};
