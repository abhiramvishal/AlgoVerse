import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `MIN_MERGE = 4

def insertion_sort_run(arr, left, right):
    for i in range(left + 1, right + 1):
        key = arr[i]
        j = i - 1
        while j >= left and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key

def merge(arr, l, m, r):
    left = arr[l:m+1]
    right = arr[m+1:r+1]
    i = j = 0; k = l
    while i < len(left) and j < len(right):
        if left[i] <= right[j]: arr[k] = left[i]; i += 1
        else: arr[k] = right[j]; j += 1
        k += 1
    while i < len(left): arr[k] = left[i]; i += 1; k += 1
    while j < len(right): arr[k] = right[j]; j += 1; k += 1

def tim_sort(arr):
    n = len(arr)
    for i in range(0, n, MIN_MERGE):
        insertion_sort_run(arr, i, min(i+MIN_MERGE-1, n-1))
    size = MIN_MERGE
    while size < n:
        for left in range(0, n, 2*size):
            mid = min(left+size-1, n-1)
            right = min(left+2*size-1, n-1)
            if mid < right: merge(arr, left, mid, right)
        size *= 2`;

const MIN_MERGE = 4;

export const timSortModule: VisualizationModule<number[]> = {
  id: "sorting-tim-sort",
  slug: "tim-sort",
  title: "Tim Sort",
  category: ["algorithms", "sorting"],
  difficulty: "advanced",
  timeComplexity: "O(n log n)",
  spaceComplexity: "O(n)",
  description: "Hybrid sorting algorithm derived from merge sort and insertion sort. Used in Python and Java.",
  relatedTopics: ["merge-sort", "insertion-sort"],
  pythonCode,
  codeSteps: [],
  defaultInput: [5, 2, 4, 6, 1, 3, 8, 7],
  generateSteps(input) {
    const arr = [...input];
    const steps: AnimationStep[] = [];
    const n = arr.length;

    steps.push({
      stepNumber: steps.length + 1,
      description: `Starting Tim Sort. MIN_MERGE=${MIN_MERGE}. Phase 1: sort runs of size ${MIN_MERGE} with insertion sort.`,
      highlightLines: [23, 24],
      visualState: { array: [...arr], active: [], sorted: [] },
      variables: { n, MIN_MERGE },
    });

    // Phase 1: insertion sort each run
    for (let i = 0; i < n; i += MIN_MERGE) {
      const right = Math.min(i + MIN_MERGE - 1, n - 1);
      steps.push({
        stepNumber: steps.length + 1,
        description: `Insertion sort run [${i}..${right}].`,
        highlightLines: [24, 25],
        visualState: { array: [...arr], active: Array.from({ length: right - i + 1 }, (_, k) => i + k), sorted: [] },
        variables: { runStart: i, runEnd: right },
      });

      for (let j = i + 1; j <= right; j++) {
        const key = arr[j];
        let k = j - 1;
        while (k >= i && arr[k] > key) {
          arr[k + 1] = arr[k];
          k--;
        }
        arr[k + 1] = key;
      }

      steps.push({
        stepNumber: steps.length + 1,
        description: `Run [${i}..${right}] sorted: [${arr.slice(i, right + 1).join(", ")}].`,
        highlightLines: [6, 7, 8, 9, 10],
        visualState: { array: [...arr], active: [], sorted: Array.from({ length: right - i + 1 }, (_, k) => i + k) },
        variables: { runStart: i, runEnd: right, sorted: arr.slice(i, right + 1) },
      });
    }

    // Phase 2: merge runs
    steps.push({
      stepNumber: steps.length + 1,
      description: "Phase 2: merge runs together.",
      highlightLines: [26, 27],
      visualState: { array: [...arr], active: [], sorted: [] },
      variables: { phase: "merge" },
    });

    for (let size = MIN_MERGE; size < n; size *= 2) {
      for (let left = 0; left < n; left += 2 * size) {
        const mid = Math.min(left + size - 1, n - 1);
        const right = Math.min(left + 2 * size - 1, n - 1);

        if (mid >= right) continue;

        steps.push({
          stepNumber: steps.length + 1,
          description: `Merge runs [${left}..${mid}] and [${mid + 1}..${right}].`,
          highlightLines: [27, 28, 29],
          visualState: {
            array: [...arr],
            active: [...Array.from({ length: right - left + 1 }, (_, k) => left + k)],
            sorted: [],
            mergedRange: [left, right] as [number, number],
          },
          variables: { left, mid, right, size },
        });

        // merge
        const leftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid + 1, right + 1);
        let i = 0, j = 0, k = left;
        while (i < leftArr.length && j < rightArr.length) {
          if (leftArr[i] <= rightArr[j]) arr[k++] = leftArr[i++];
          else arr[k++] = rightArr[j++];
        }
        while (i < leftArr.length) arr[k++] = leftArr[i++];
        while (j < rightArr.length) arr[k++] = rightArr[j++];

        steps.push({
          stepNumber: steps.length + 1,
          description: `Merged [${left}..${right}]: [${arr.slice(left, right + 1).join(", ")}].`,
          highlightLines: [13, 14, 15, 16, 17, 18, 19, 20, 21],
          visualState: { array: [...arr], active: [], sorted: Array.from({ length: right - left + 1 }, (_, k) => left + k) },
          variables: { left, right, merged: arr.slice(left, right + 1) },
        });
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: "Tim Sort complete.",
      highlightLines: [31],
      visualState: { array: [...arr], active: [], sorted: Array.from({ length: n }, (_, k) => k) },
      variables: { sorted: true },
    });

    return steps;
  },
};
