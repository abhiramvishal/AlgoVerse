import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `import math

def introsort(arr):
    max_depth = 2 * math.floor(math.log2(len(arr)))
    _introsort(arr, 0, len(arr) - 1, max_depth)

def _introsort(arr, lo, hi, depth):
    if hi - lo < 16:
        insertion_sort(arr, lo, hi)
    elif depth == 0:
        heapsort(arr, lo, hi)
    else:
        pivot_idx = partition(arr, lo, hi)
        _introsort(arr, lo, pivot_idx - 1, depth - 1)
        _introsort(arr, pivot_idx + 1, hi, depth - 1)`;

export const introSortModule: VisualizationModule<number[]> = {
  id: "sorting-intro-sort",
  slug: "intro-sort",
  title: "Intro Sort",
  category: ["algorithms", "sorting"],
  difficulty: "advanced",
  timeComplexity: "O(n log n)",
  spaceComplexity: "O(log n)",
  description: "Hybrid of quicksort, heapsort, and insertion sort. Switches algorithms based on depth and size.",
  relatedTopics: ["quick-sort", "heap-sort", "insertion-sort"],
  pythonCode,
  codeSteps: [],
  defaultInput: [5, 1, 4, 2, 8, 6, 3, 7],
  generateSteps(input) {
    const arr = [...input];
    const steps: AnimationStep[] = [];
    const n = arr.length;
    const maxDepth = 2 * Math.floor(Math.log2(n));

    steps.push({
      stepNumber: steps.length + 1,
      description: `Starting Intro Sort. n=${n}, maxDepth=${maxDepth}. Will use quicksort by default, heapsort if depth exceeded.`,
      highlightLines: [3, 4],
      visualState: { array: [...arr], active: [], sorted: [] },
      variables: { n, maxDepth, algorithm: "quicksort" },
    });

    function insertionSort(lo: number, hi: number) {
      for (let i = lo + 1; i <= hi; i++) {
        const key = arr[i];
        let j = i - 1;
        while (j >= lo && arr[j] > key) {
          arr[j + 1] = arr[j];
          j--;
        }
        arr[j + 1] = key;
      }
    }

    function heapify(size: number, i: number, offset: number) {
      let largest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < size && arr[offset + l] > arr[offset + largest]) largest = l;
      if (r < size && arr[offset + r] > arr[offset + largest]) largest = r;
      if (largest !== i) {
        [arr[offset + i], arr[offset + largest]] = [arr[offset + largest], arr[offset + i]];
        heapify(size, largest, offset);
      }
    }

    function heapSort(lo: number, hi: number) {
      const size = hi - lo + 1;
      for (let i = Math.floor(size / 2) - 1; i >= 0; i--) heapify(size, i, lo);
      for (let i = size - 1; i > 0; i--) {
        [arr[lo], arr[lo + i]] = [arr[lo + i], arr[lo]];
        heapify(i, 0, lo);
      }
    }

    function partition(lo: number, hi: number): number {
      const pivot = arr[hi];
      let i = lo - 1;
      for (let j = lo; j < hi; j++) {
        if (arr[j] <= pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }
      [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
      return i + 1;
    }

    function introsort(lo: number, hi: number, depth: number) {
      if (hi <= lo) return;

      const size = hi - lo + 1;

      if (size < 4) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Size=${size} < 4. Using insertion sort on [${lo}..${hi}].`,
          highlightLines: [8, 9],
          visualState: { array: [...arr], active: Array.from({ length: size }, (_, k) => lo + k), sorted: [] },
          variables: { lo, hi, depth, algorithm: "insertion sort" },
        });
        insertionSort(lo, hi);
        steps.push({
          stepNumber: steps.length + 1,
          description: `Insertion sort done on [${lo}..${hi}]: [${arr.slice(lo, hi + 1).join(",")}].`,
          highlightLines: [9],
          visualState: { array: [...arr], active: [], sorted: Array.from({ length: size }, (_, k) => lo + k) },
          variables: { lo, hi, algorithm: "insertion sort" },
        });
        return;
      }

      if (depth === 0) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Depth limit reached! Switching to heapsort on [${lo}..${hi}].`,
          highlightLines: [10, 11],
          visualState: { array: [...arr], active: Array.from({ length: size }, (_, k) => lo + k), sorted: [] },
          variables: { lo, hi, depth, algorithm: "heapsort" },
        });
        heapSort(lo, hi);
        steps.push({
          stepNumber: steps.length + 1,
          description: `Heapsort done on [${lo}..${hi}].`,
          highlightLines: [11],
          visualState: { array: [...arr], active: [], sorted: Array.from({ length: size }, (_, k) => lo + k) },
          variables: { lo, hi, algorithm: "heapsort" },
        });
        return;
      }

      steps.push({
        stepNumber: steps.length + 1,
        description: `Quicksort partition on [${lo}..${hi}]. depth=${depth}. Pivot=arr[${hi}]=${arr[hi]}.`,
        highlightLines: [12, 13],
        visualState: { array: [...arr], active: [hi], sorted: [], pivotIndex: hi },
        variables: { lo, hi, depth, pivot: arr[hi], algorithm: "quicksort" },
      });

      const pivotIdx = partition(lo, hi);

      steps.push({
        stepNumber: steps.length + 1,
        description: `Partition done. Pivot ${arr[pivotIdx]} at index ${pivotIdx}.`,
        highlightLines: [13],
        visualState: { array: [...arr], active: [pivotIdx], sorted: [pivotIdx], pivotIndex: pivotIdx },
        variables: { lo, hi, pivotIdx, algorithm: "quicksort" },
      });

      introsort(lo, pivotIdx - 1, depth - 1);
      introsort(pivotIdx + 1, hi, depth - 1);
    }

    introsort(0, n - 1, maxDepth);

    steps.push({
      stepNumber: steps.length + 1,
      description: "Intro Sort complete.",
      highlightLines: [15],
      visualState: { array: [...arr], active: [], sorted: Array.from({ length: n }, (_, k) => k) },
      variables: { sorted: true },
    });

    return steps;
  },
};
