import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type SortingInput = number[];

function recordStep(
  steps: AnimationStep[],
  description: string,
  highlightLines: number[],
  array: number[],
  active: number[] = [],
  pivotIndex: number | null = null,
  sorted: number[] = [],
  variables: Record<string, unknown> = {},
) {
  steps.push({
    stepNumber: steps.length + 1,
    description,
    highlightLines,
    visualState: { array, active, pivotIndex, sorted },
    variables,
  });
}

const pythonCode = `def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1

    if low >= high:
        return

    pivot = arr[high]
    i = low
    for j in range(low, high):
        if arr[j] <= pivot:
            arr[i], arr[j] = arr[j], arr[i]
            i += 1

    arr[i], arr[high] = arr[high], arr[i]
    quick_sort(arr, low, i - 1)
    quick_sort(arr, i + 1, high)
    return arr`;

export const quickSortModule: VisualizationModule<SortingInput> = {
  id: "sorting-quick-sort",
  slug: "quick-sort",
  title: "Quick Sort",
  category: ["algorithms", "sorting"],
  difficulty: "intermediate",
  timeComplexity: "O(n log n) average",
  spaceComplexity: "O(log n)",
  description: "Partitions around a pivot and recursively sorts left and right sides.",
  relatedTopics: ["merge-sort", "partition-schemes"],
  pythonCode,
  codeSteps: [],
  defaultInput: [29, 10, 14, 37, 13, 5, 42, 7],
  generateSteps(input) {
    const arr = [...input];
    const steps: AnimationStep[] = [];
    const sortedIndexes = new Set<number>();

    recordStep(steps, "Start Quick Sort.", [1, 2], [...arr], [], null, [], {
      low: 0,
      high: arr.length - 1,
    });

    function partition(low: number, high: number) {
      const pivot = arr[high];
      let i = low;

      recordStep(
        steps,
        `Choose pivot arr[${high}] = ${pivot}.`,
        [7, 8, 9],
        [...arr],
        [high],
        high,
        [...sortedIndexes],
        { low, high, i, pivot },
      );

      for (let j = low; j < high; j += 1) {
        recordStep(
          steps,
          `Compare arr[${j}] (${arr[j]}) with pivot ${pivot}.`,
          [10, 11],
          [...arr],
          [j, i],
          high,
          [...sortedIndexes],
          { low, high, i, j, pivot },
        );

        if (arr[j] <= pivot) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          recordStep(
            steps,
            `Move ${arr[i]} to partition <= pivot by swapping indices ${i} and ${j}.`,
            [11, 12, 13],
            [...arr],
            [i, j],
            high,
            [...sortedIndexes],
            { low, high, i, j, pivot },
          );
          i += 1;
        }
      }

      [arr[i], arr[high]] = [arr[high], arr[i]];
      sortedIndexes.add(i);
      recordStep(
        steps,
        `Place pivot ${pivot} at final index ${i}.`,
        [15],
        [...arr],
        [i],
        i,
        [...sortedIndexes],
        { low, high, i, pivot },
      );

      return i;
    }

    function quickSort(low: number, high: number) {
      if (low >= high) {
        if (low === high) {
          sortedIndexes.add(low);
          recordStep(
            steps,
            `Single element at index ${low} is in final position.`,
            [5, 6],
            [...arr],
            [low],
            null,
            [...sortedIndexes],
            { low, high },
          );
        }
        return;
      }

      const pivotIndex = partition(low, high);
      recordStep(
        steps,
        `Recursively sort left partition [${low}, ${pivotIndex - 1}] and right partition [${pivotIndex + 1}, ${high}].`,
        [16, 17],
        [...arr],
        [pivotIndex],
        pivotIndex,
        [...sortedIndexes],
        { low, high, pivotIndex },
      );

      quickSort(low, pivotIndex - 1);
      quickSort(pivotIndex + 1, high);
    }

    quickSort(0, arr.length - 1);

    recordStep(
      steps,
      "Quick Sort complete.",
      [18],
      [...arr],
      [],
      null,
      Array.from({ length: arr.length }, (_, index) => index),
      { sorted: true },
    );

    return steps;
  },
};
