import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type SortingInput = number[];

function createStep(
  steps: AnimationStep[],
  description: string,
  highlightLines: number[],
  array: number[],
  active: number[] = [],
  sorted: number[] = [],
  swapped = false,
  variables: Record<string, unknown> = {},
) {
  steps.push({
    stepNumber: steps.length + 1,
    description,
    highlightLines,
    visualState: { array, active, sorted, swapped },
    variables,
  });
}

const pythonCode = `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr`;

export const bubbleSortModule: VisualizationModule<SortingInput> = {
  id: "sorting-bubble-sort",
  slug: "bubble-sort",
  title: "Bubble Sort",
  category: ["algorithms", "sorting"],
  difficulty: "beginner",
  timeComplexity: "O(n^2)",
  spaceComplexity: "O(1)",
  description:
    "Repeatedly compares adjacent elements and bubbles larger elements to the right.",
  relatedTopics: ["insertion-sort", "selection-sort"],
  pythonCode,
  codeSteps: [],
  defaultInput: [8, 4, 2, 9, 5, 7, 1, 3],
  generateSteps(input) {
    const arr = [...input];
    const steps: AnimationStep[] = [];
    const n = arr.length;

    createStep(steps, "Starting Bubble Sort.", [1, 2], [...arr], [], [], false, {
      n,
      i: null,
      j: null,
      swapped: false,
    });

    for (let i = 0; i < n; i += 1) {
      let swapped = false;
      const sorted = Array.from({ length: i }, (_, k) => n - 1 - k);
      createStep(
        steps,
        `Pass ${i + 1}: scan unsorted range.`,
        [3, 4],
        [...arr],
        [],
        sorted,
        false,
        { i, j: null, swapped },
      );

      for (let j = 0; j < n - i - 1; j += 1) {
        createStep(
          steps,
          `Compare arr[${j}] (${arr[j]}) with arr[${j + 1}] (${arr[j + 1]}).`,
          [5, 6],
          [...arr],
          [j, j + 1],
          sorted,
          false,
          { i, j, swapped },
        );

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swapped = true;
          createStep(
            steps,
            `Swap because ${arr[j + 1]} > ${arr[j]} was out of order.`,
            [6, 7, 8],
            [...arr],
            [j, j + 1],
            sorted,
            true,
            { i, j, swapped },
          );
        }
      }

      if (!swapped) {
        createStep(
          steps,
          "No swaps in this pass, array is sorted early.",
          [9, 10],
          [...arr],
          [],
          Array.from({ length: n }, (_, index) => index),
          false,
          { i, j: null, swapped },
        );
        break;
      }
    }

    createStep(
      steps,
      "Bubble Sort complete.",
      [11],
      [...arr],
      [],
      Array.from({ length: n }, (_, index) => index),
      false,
      { sorted: true },
    );

    return steps;
  },
};
