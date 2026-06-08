import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `class MinHeap:
    def __init__(self):
        self.heap = []

    def insert(self, val):
        self.heap.append(val)
        self._sift_up(len(self.heap) - 1)

    def _sift_up(self, i):
        while i > 0:
            parent = (i - 1) // 2
            if self.heap[parent] > self.heap[i]:
                self.heap[parent], self.heap[i] = self.heap[i], self.heap[parent]
                i = parent
            else:
                break

    def extract_min(self):
        self.heap[0], self.heap[-1] = self.heap[-1], self.heap[0]
        min_val = self.heap.pop()
        self._sift_down(0)
        return min_val

    def _sift_down(self, i):
        n = len(self.heap)
        while True:
            smallest = i
            l, r = 2*i+1, 2*i+2
            if l < n and self.heap[l] < self.heap[smallest]: smallest = l
            if r < n and self.heap[r] < self.heap[smallest]: smallest = r
            if smallest == i: break
            self.heap[i], self.heap[smallest] = self.heap[smallest], self.heap[i]
            i = smallest`;

export const minHeapModule: VisualizationModule<number[]> = {
  id: "ds-min-heap",
  slug: "min-heap",
  title: "Min-Heap",
  category: ["data-structures", "heaps"],
  difficulty: "intermediate",
  timeComplexity: "O(log n) insert/extract",
  spaceComplexity: "O(n)",
  description: "A complete binary tree where every parent is <= its children. Supports O(log n) insert and extract-min.",
  relatedTopics: ["max-heap", "priority-queue"],
  pythonCode,
  codeSteps: [],
  defaultInput: [9, 7, 3, 8, 2, 1],
  generateSteps(input) {
    const values = input ?? [9, 7, 3, 8, 2, 1];
    const steps: AnimationStep[] = [];
    const heap: number[] = [];

    function pushStep(desc: string, lines: number[], active: number[] = [], swap?: [number, number]) {
      steps.push({
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: lines,
        visualState: { type: "heap", heap: [...heap], mode: "min", activeIndices: active, swapIndices: swap },
        variables: { heap: "[" + heap.join(",") + "]" },
      });
    }

    pushStep("Starting Min-Heap construction.", [1, 2, 3]);

    for (const val of values) {
      heap.push(val);
      let i = heap.length - 1;
      pushStep(`Insert ${val} at index ${i}.`, [5, 6, 7], [i]);

      while (i > 0) {
        const parent = Math.floor((i - 1) / 2);
        pushStep(`Sift-up: compare heap[${i}]=${heap[i]} with parent heap[${parent}]=${heap[parent]}.`, [10, 11], [i, parent]);

        if (heap[parent] > heap[i]) {
          pushStep(`heap[${parent}]=${heap[parent]} > heap[${i}]=${heap[i]}. Swap.`, [12, 13], [i, parent], [i, parent]);
          [heap[parent], heap[i]] = [heap[i], heap[parent]];
          i = parent;
          pushStep(`After swap. Continue sift-up from index ${i}.`, [14], [i]);
        } else {
          pushStep(`heap[${parent}]=${heap[parent]} <= heap[${i}]=${heap[i]}. Heap property satisfied.`, [15], [i, parent]);
          break;
        }
      }

      pushStep(`${val} inserted. Heap: [${heap.join(",")}].`, [7], []);
    }

    pushStep("Min-Heap built. Now extract-min.", [18, 19]);

    if (heap.length > 0) {
      pushStep(`Extract min: swap root heap[0]=${heap[0]} with last heap[${heap.length - 1}]=${heap[heap.length - 1]}.`, [18, 19], [0, heap.length - 1], [0, heap.length - 1]);
      [heap[0], heap[heap.length - 1]] = [heap[heap.length - 1], heap[0]];
      const min = heap.pop()!;
      pushStep(`Removed min=${min}. Sift-down from root.`, [20, 21], [0]);

      let i = 0;
      const n = heap.length;
      while (true) {
        let smallest = i;
        const l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && heap[l] < heap[smallest]) smallest = l;
        if (r < n && heap[r] < heap[smallest]) smallest = r;

        pushStep(`Sift-down at ${i}. Smallest child at ${smallest} (val=${heap[smallest]}).`, [26, 27, 28], [i]);

        if (smallest === i) {
          pushStep(`Heap property restored.`, [29], [i]);
          break;
        }

        pushStep(`Swap heap[${i}]=${heap[i]} with heap[${smallest}]=${heap[smallest]}.`, [30], [i, smallest], [i, smallest]);
        [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
        i = smallest;
      }

      pushStep(`Extract-min complete. Extracted: ${min}. Remaining: [${heap.join(",")}].`, [31]);
    }

    return steps;
  },
};
