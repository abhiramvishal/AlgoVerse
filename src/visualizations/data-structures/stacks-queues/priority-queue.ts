import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `import heapq

class MinPriorityQueue:
    def __init__(self):
        self.heap = []

    def insert(self, val):
        heapq.heappush(self.heap, val)

    def extract_min(self):
        return heapq.heappop(self.heap)

    def peek(self):
        return self.heap[0] if self.heap else None`;

function heapifyUp(heap: number[], i: number): number[][] {
  const swaps: number[][] = [];
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);
    if (heap[parent] > heap[i]) {
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      swaps.push([parent, i]);
      i = parent;
    } else break;
  }
  return swaps;
}

function heapifyDown(heap: number[], i: number): number[][] {
  const swaps: number[][] = [];
  const n = heap.length;
  while (true) {
    let smallest = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && heap[l] < heap[smallest]) smallest = l;
    if (r < n && heap[r] < heap[smallest]) smallest = r;
    if (smallest !== i) {
      [heap[smallest], heap[i]] = [heap[i], heap[smallest]];
      swaps.push([i, smallest]);
      i = smallest;
    } else break;
  }
  return swaps;
}

export const priorityQueueModule: VisualizationModule<number[]> = {
  id: "data-structures-stacks-queues-priority-queue",
  slug: "priority-queue",
  title: "Priority Queue (Min-Heap)",
  category: ["data-structures", "stacks-queues"],
  difficulty: "intermediate",
  timeComplexity: "O(log n) insert/extract",
  spaceComplexity: "O(n)",
  description: "A min-priority queue backed by a binary min-heap.",
  relatedTopics: ["heap", "deque", "stack"],
  pythonCode,
  codeSteps: [],
  defaultInput: [5, 3, 8, 1, 4, 2, 7],
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const heap: number[] = [];

    steps.push({
      stepNumber: steps.length + 1,
      description: "Initialize empty min-priority queue (min-heap).",
      highlightLines: [3, 4],
      visualState: { type: "heap", heap: [], mode: "min", activeIndices: [] },
      variables: { heap: [] },
    });

    for (const val of input) {
      heap.push(val);
      steps.push({
        stepNumber: steps.length + 1,
        description: `Insert ${val}: place at index ${heap.length - 1}, then bubble up.`,
        highlightLines: [7, 8],
        visualState: { type: "heap", heap: [...heap], mode: "min", activeIndices: [heap.length - 1] },
        variables: { inserted: val, heapSize: heap.length },
      });

      const swaps = heapifyUp(heap, heap.length - 1);
      for (const [a, b] of swaps) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Bubble up: swap heap[${a}]=${heap[b]} and heap[${b}]=${heap[a]}.`,
          highlightLines: [8],
          visualState: { type: "heap", heap: [...heap], mode: "min", activeIndices: [a, b], swapIndices: [a, b] },
          variables: { swapped: [heap[b], heap[a]] },
        });
      }

      steps.push({
        stepNumber: steps.length + 1,
        description: `After inserting ${val}: heap = [${heap.join(", ")}]. Min = ${heap[0]}.`,
        highlightLines: [8],
        visualState: { type: "heap", heap: [...heap], mode: "min", activeIndices: [0] },
        variables: { heap: [...heap], min: heap[0] },
      });
    }

    // extract min once
    const minVal = heap[0];
    heap[0] = heap[heap.length - 1];
    heap.pop();
    steps.push({
      stepNumber: steps.length + 1,
      description: `Extract-min: remove ${minVal} (root), move last element to root.`,
      highlightLines: [11, 12],
      visualState: { type: "heap", heap: [...heap], mode: "min", activeIndices: [0] },
      variables: { extracted: minVal, heap: [...heap] },
    });

    const swaps = heapifyDown(heap, 0);
    for (const [a, b] of swaps) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `Sift down: swap heap[${a}]=${heap[b]} and heap[${b}]=${heap[a]}.`,
        highlightLines: [12],
        visualState: { type: "heap", heap: [...heap], mode: "min", activeIndices: [a, b], swapIndices: [a, b] },
        variables: { swapped: [heap[b], heap[a]] },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Heap after extract-min: [${heap.join(", ")}]. New min = ${heap[0]}.`,
      highlightLines: [12],
      visualState: { type: "heap", heap: [...heap], mode: "min", activeIndices: [0] },
      variables: { heap: [...heap], min: heap[0] },
    });

    return steps;
  },
};
