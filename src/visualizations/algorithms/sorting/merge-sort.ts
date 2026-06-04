import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type SortingInput = number[];

function pushStep(
  steps: AnimationStep[],
  description: string,
  highlightLines: number[],
  array: number[],
  active: number[] = [],
  mergedRange: [number, number] | null = null,
  variables: Record<string, unknown> = {},
) {
  steps.push({
    stepNumber: steps.length + 1,
    description,
    highlightLines,
    visualState: { array, active, mergedRange },
    variables,
  });
}

const pythonCode = `def merge_sort(arr):
    if len(arr) <= 1:
        return arr

    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1

    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged`;

export const mergeSortModule: VisualizationModule<SortingInput> = {
  id: "sorting-merge-sort",
  slug: "merge-sort",
  title: "Merge Sort",
  category: ["algorithms", "sorting"],
  difficulty: "intermediate",
  timeComplexity: "O(n log n)",
  spaceComplexity: "O(n)",
  description: "Divide-and-conquer sorting that recursively splits and merges arrays.",
  relatedTopics: ["quick-sort", "heap-sort"],
  pythonCode,
  codeSteps: [],
  defaultInput: [12, 3, 17, 8, 34, 25, 1, 9],
  generateSteps(input) {
    const arr = [...input];
    const steps: AnimationStep[] = [];

    pushStep(steps, "Start Merge Sort.", [1, 2], [...arr], [], null, {
      arrayLength: arr.length,
    });

    function mergeSort(left: number, right: number) {
      if (left >= right) {
        pushStep(
          steps,
          `Single element segment [${left}, ${right}] is already sorted.`,
          [2, 3],
          [...arr],
          [left],
          [left, right],
          { left, right },
        );
        return;
      }

      const mid = Math.floor((left + right) / 2);
      pushStep(
        steps,
        `Split range [${left}, ${right}] at mid ${mid}.`,
        [5, 6, 7],
        [...arr],
        [left, mid, right],
        [left, right],
        { left, mid, right },
      );

      mergeSort(left, mid);
      mergeSort(mid + 1, right);

      const leftSlice = arr.slice(left, mid + 1);
      const rightSlice = arr.slice(mid + 1, right + 1);
      let i = 0;
      let j = 0;
      let k = left;

      pushStep(
        steps,
        `Merge sorted halves [${left}, ${mid}] and [${mid + 1}, ${right}].`,
        [9, 10, 11],
        [...arr],
        [left, right],
        [left, right],
        { leftSlice, rightSlice, i, j, k },
      );

      while (i < leftSlice.length && j < rightSlice.length) {
        const leftValue = leftSlice[i];
        const rightValue = rightSlice[j];

        pushStep(
          steps,
          `Compare left value ${leftValue} and right value ${rightValue}.`,
          [12, 13],
          [...arr],
          [k],
          [left, right],
          { i, j, k, leftValue, rightValue },
        );

        if (leftValue <= rightValue) {
          arr[k] = leftValue;
          i += 1;
        } else {
          arr[k] = rightValue;
          j += 1;
        }

        pushStep(
          steps,
          `Write ${arr[k]} at index ${k}.`,
          [13, 14, 15, 16, 18],
          [...arr],
          [k],
          [left, right],
          { i, j, k, currentValue: arr[k] },
        );

        k += 1;
      }

      while (i < leftSlice.length) {
        arr[k] = leftSlice[i];
        i += 1;
        pushStep(
          steps,
          `Append remaining left value ${arr[k]} at index ${k}.`,
          [20, 21],
          [...arr],
          [k],
          [left, right],
          { i, j, k },
        );
        k += 1;
      }

      while (j < rightSlice.length) {
        arr[k] = rightSlice[j];
        j += 1;
        pushStep(
          steps,
          `Append remaining right value ${arr[k]} at index ${k}.`,
          [22, 23],
          [...arr],
          [k],
          [left, right],
          { i, j, k },
        );
        k += 1;
      }
    }

    mergeSort(0, arr.length - 1);

    pushStep(
      steps,
      "Merge Sort complete.",
      [24],
      [...arr],
      [],
      [0, arr.length - 1],
      { sorted: true },
    );

    return steps;
  },
};
