import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def heapify(arr, n, i):
    largest = i
    l, r = 2*i+1, 2*i+2
    if l < n and arr[l] > arr[largest]: largest = l
    if r < n and arr[r] > arr[largest]: largest = r
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

def heap_sort(arr):
    n = len(arr)
    for i in range(n//2-1, -1, -1):
        heapify(arr, n, i)
    for i in range(n-1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)`;

export const heapSortModule: VisualizationModule<number[]> = {
  id: "sorting-heap-sort",
  slug: "heap-sort",
  title: "Heap Sort",
  category: ["algorithms", "sorting"],
  difficulty: "intermediate",
  timeComplexity: "O(n log n)",
  spaceComplexity: "O(1)",
  description: "Builds a max-heap then repeatedly extracts the maximum to sort in-place.",
  relatedTopics: ["selection-sort", "priority-queue"],
  pythonCode,
  codeSteps: [],
  defaultInput: [12, 11, 13, 5, 6, 7],
  generateSteps(input) {
    const arr = [...input];
    const steps: AnimationStep[] = [];
    const n = arr.length;
    const sorted: number[] = [];

    function pushStep(desc: string, lines: number[], active: number[], heapSize: number) {
      steps.push({
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: lines,
        visualState: { array: [...arr], active, sorted: [...sorted], heapSize },
        variables: { heapSize, sorted: [...sorted] },
      });
    }

    function heapify(size: number, i: number) {
      let largest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;

      pushStep(`Heapify at index ${i} (val=${arr[i]}), heap size=${size}.`, [1, 2, 3], [i], size);

      if (l < size && arr[l] > arr[largest]) largest = l;
      if (r < size && arr[r] > arr[largest]) largest = r;

      if (largest !== i) {
        pushStep(`Swap arr[${i}]=${arr[i]} with arr[${largest}]=${arr[largest]}.`, [6, 7], [i, largest], size);
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        pushStep(`After swap. Recurse on index ${largest}.`, [8], [largest], size);
        heapify(size, largest);
      } else {
        pushStep(`arr[${i}]=${arr[i]} is largest. Heap property satisfied here.`, [3, 4, 5], [i], size);
      }
    }

    pushStep("Phase 1: Build max-heap (heapify from n/2-1 to 0).", [10, 11], [], n);

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(n, i);
    }

    pushStep("Max-heap built. Phase 2: Extract elements one by one.", [12], [], n);

    for (let i = n - 1; i > 0; i--) {
      pushStep(`Swap root arr[0]=${arr[0]} with arr[${i}]=${arr[i]}.`, [13, 14], [0, i], i + 1);
      [arr[0], arr[i]] = [arr[i], arr[0]];
      sorted.unshift(i);
      pushStep(`arr[${i}]=${arr[i]} is in final position. Heapify remaining ${i} elements.`, [15], [0], i);
      heapify(i, 0);
    }

    sorted.unshift(0);
    pushStep("Heap Sort complete.", [16], [], 0);

    return steps;
  },
};
