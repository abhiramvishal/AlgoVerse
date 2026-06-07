import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `class MaxHeap:
    def __init__(self):
        self.heap = []

    def insert(self, val):
        self.heap.append(val)
        self._sift_up(len(self.heap) - 1)

    def _sift_up(self, i):
        while i > 0:
            parent = (i - 1) // 2
            if self.heap[parent] < self.heap[i]:
                self.heap[parent], self.heap[i] = self.heap[i], self.heap[parent]
                i = parent
            else:
                break

    def extract_max(self):
        self.heap[0], self.heap[-1] = self.heap[-1], self.heap[0]
        max_val = self.heap.pop()
        self._sift_down(0)
        return max_val

    def _sift_down(self, i):
        n = len(self.heap)
        while True:
            largest = i
            l, r = 2*i+1, 2*i+2
            if l < n and self.heap[l] > self.heap[largest]: largest = l
            if r < n and self.heap[r] > self.heap[largest]: largest = r
            if largest == i: break
            self.heap[i], self.heap[largest] = self.heap[largest], self.heap[i]
            i = largest`;

export const maxHeapModule: VisualizationModule<number[]> = {
  id: "ds-max-heap",
  slug: "max-heap",
  title: "Max-Heap",
  category: ["data-structures", "heaps"],
  difficulty: "intermediate",
  timeComplexity: "O(log n) insert/extract",
  spaceComplexity: "O(n)",
  description: "A complete binary tree where every parent is >= its children. Supports O(log n) insert and extract-max.",
  relatedTopics: ["min-heap", "priority-queue", "heap-sort"],
  pythonCode,
  codeSteps: [],
  defaultInput: [3, 1, 6, 5, 2, 4],
  generateSteps(input) {
    const values = input ?? [3, 1, 6, 5, 2, 4];
    const steps: AnimationStep[] = [];
    const heap: number[] = [];

    function pushStep(desc: string, lines: number[], active: number[] = [], swap?: [number, number]) {
      steps.push({
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: lines,
        visualState: { type: "heap", heap: [...heap], mode: "max", activeIndices: active, swapIndices: swap },
        variables: { heap: "[" + heap.join(",") + "]" },
      });
    }

    pushStep("Starting Max-Heap construction by inserting elements one by one.", [1, 2, 3]);

    // Insert phase
    for (const val of values) {
      heap.push(val);
      let i = heap.length - 1;
      pushStep(`Insert ${val} at index ${i}.`, [5, 6, 7], [i]);

      while (i > 0) {
        const parent = Math.floor((i - 1) / 2);
        pushStep(`Sift-up: compare heap[${i}]=${heap[i]} with parent heap[${parent}]=${heap[parent]}.`, [10, 11], [i, parent]);

        if (heap[parent] < heap[i]) {
          pushStep(`heap[${parent}]=${heap[parent]} < heap[${i}]=${heap[i]}. Swap.`, [12, 13], [i, parent], [i, parent]);
          [heap[parent], heap[i]] = [heap[i], heap[parent]];
          i = parent;
          pushStep(`After swap. Continue sift-up from index ${i}.`, [14], [i]);
        } else {
          pushStep(`heap[${parent}]=${heap[parent]} >= heap[${i}]=${heap[i]}. Heap property satisfied.`, [15], [i, parent]);
          break;
        }
      }

      pushStep(`${val} inserted. Heap: [${heap.join(",")}].`, [7], []);
    }

    pushStep("Max-Heap built. Now extract-max.", [18, 19]);

    // Extract max
    if (heap.length > 0) {
      pushStep(`Extract max: swap root heap[0]=${heap[0]} with last heap[${heap.length - 1}]=${heap[heap.length - 1]}.`, [18, 19], [0, heap.length - 1], [0, heap.length - 1]);
      [heap[0], heap[heap.length - 1]] = [heap[heap.length - 1], heap[0]];
      const max = heap.pop()!;
      pushStep(`Removed max=${max}. Sift-down from root.`, [20, 21], [0]);

      let i = 0;
      const n = heap.length;
      while (true) {
        let largest = i;
        const l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && heap[l] > heap[largest]) largest = l;
        if (r < n && heap[r] > heap[largest]) largest = r;

        pushStep(`Sift-down at ${i}: compare with children. Largest at ${largest} (val=${heap[largest]}).`, [26, 27, 28], [i, l < n ? l : i, r < n ? r : i].filter((x, idx, a) => a.indexOf(x) === idx));

        if (largest === i) {
          pushStep(`Heap property restored at ${i}.`, [29], [i]);
          break;
        }

        pushStep(`Swap heap[${i}]=${heap[i]} with heap[${largest}]=${heap[largest]}.`, [30], [i, largest], [i, largest]);
        [heap[i], heap[largest]] = [heap[largest], heap[i]];
        i = largest;
      }

      pushStep(`Extract-max complete. Extracted: ${max}. Remaining heap: [${heap.join(",")}].`, [31]);
    }

    return steps;
  },
};
