import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`;

export const insertionSortModule: VisualizationModule<number[]> = {
  id: "sorting-insertion-sort",
  slug: "insertion-sort",
  title: "Insertion Sort",
  category: ["algorithms", "sorting"],
  difficulty: "beginner",
  timeComplexity: "O(n²)",
  spaceComplexity: "O(1)",
  description: "Builds a sorted array one element at a time by inserting each element into its correct position.",
  relatedTopics: ["selection-sort", "bubble-sort", "shell-sort"],
  pythonCode,
  codeSteps: [],
  defaultInput: [12, 11, 13, 5, 6],
  generateSteps(input) {
    const arr = [...input];
    const steps: AnimationStep[] = [];
    const n = arr.length;

    steps.push({
      stepNumber: steps.length + 1,
      description: "Starting Insertion Sort. First element is trivially sorted.",
      highlightLines: [1],
      visualState: { array: [...arr], active: [], sorted: [0] },
      variables: { n },
    });

    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;
      const sortedSoFar = Array.from({ length: i }, (_, k) => k);

      steps.push({
        stepNumber: steps.length + 1,
        description: `Pick key = arr[${i}] = ${key}. Insert into sorted portion [0..${i - 1}].`,
        highlightLines: [2, 3, 4],
        visualState: { array: [...arr], active: [i], sorted: sortedSoFar },
        variables: { i, key, j },
      });

      while (j >= 0 && arr[j] > key) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `arr[${j}]=${arr[j]} > key=${key}. Shift arr[${j}] right to position ${j + 1}.`,
          highlightLines: [5, 6, 7],
          visualState: { array: [...arr], active: [j, j + 1], sorted: sortedSoFar },
          variables: { i, key, j },
        });
        arr[j + 1] = arr[j];
        j--;
      }

      arr[j + 1] = key;
      steps.push({
        stepNumber: steps.length + 1,
        description: `Place key=${key} at position ${j + 1}.`,
        highlightLines: [8],
        visualState: { array: [...arr], active: [j + 1], sorted: Array.from({ length: i + 1 }, (_, k) => k) },
        variables: { i, key, insertedAt: j + 1 },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: "Insertion Sort complete.",
      highlightLines: [9],
      visualState: { array: [...arr], active: [], sorted: Array.from({ length: n }, (_, k) => k) },
      variables: { sorted: true },
    });

    return steps;
  },
};
