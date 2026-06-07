import type { AnimationStep, VisualizationModule } from "@/types/visualization";

/* ── Python code ───────────────────────────────────────────────────────────── */
const pythonCode = `# Stack (LIFO) and Queue (FIFO) operations
from collections import deque

class Stack:
    def __init__(self):
        self.data = []

    def push(self, value):
        self.data.append(value)

    def pop(self):
        if not self.data:
            raise IndexError("Stack underflow")
        return self.data.pop()

    def peek(self):
        return self.data[-1] if self.data else None

class Queue:
    def __init__(self):
        self.data = deque()

    def enqueue(self, value):
        self.data.append(value)

    def dequeue(self):
        if not self.data:
            raise IndexError("Queue underflow")
        return self.data.popleft()

    def front(self):
        return self.data[0] if self.data else None`;

/* ── Step generator ─────────────────────────────────────────────────────────── */
function generateStackQueueSteps(inputValues: number[]): AnimationStep[] {
  const steps: AnimationStep[] = [];

  // ── Phase 1: Stack ───────────────────────────────────────────────────────────
  let stackCells: number[] = [];

  function stackSnap(
    desc: string,
    lines: number[],
    activeIndex?: number,
  ) {
    steps.push({
      stepNumber: steps.length + 1,
      description: desc,
      highlightLines: lines,
      visualState: {
        type: "stackqueue",
        mode: "stack",
        cells: [...stackCells],
        activeIndex,
        topIndex: stackCells.length - 1,
      },
      variables: {
        structure: "Stack (LIFO)",
        top: stackCells[stackCells.length - 1] ?? "—",
        size: stackCells.length,
        data: `[${stackCells.join(", ")}]`,
      },
    });
  }

  stackSnap("Stack initialized — empty. LIFO: Last In, First Out.", [4, 5, 6]);

  for (const v of inputValues) {
    stackCells = [...stackCells, v];
    stackSnap(`PUSH ${v} → top of stack.`, [8, 9], stackCells.length - 1);
  }

  // Peek
  stackSnap(
    `PEEK → top is ${stackCells[stackCells.length - 1]}.`,
    [15, 16],
    stackCells.length - 1,
  );

  // Pop 3 items
  const popCount = Math.min(3, stackCells.length);
  for (let i = 0; i < popCount; i++) {
    const popped = stackCells[stackCells.length - 1];
    stackSnap(`POP → removing ${popped} from top.`, [11, 12, 13, 14], stackCells.length - 1);
    stackCells = stackCells.slice(0, -1);
    stackSnap(`Popped ${popped}. Stack now has ${stackCells.length} elements.`, [13, 14]);
  }

  // ── Phase 2: Queue ───────────────────────────────────────────────────────────
  let queueCells: number[] = [];

  function queueSnap(
    desc: string,
    lines: number[],
    activeIndex?: number,
  ) {
    steps.push({
      stepNumber: steps.length + 1,
      description: desc,
      highlightLines: lines,
      visualState: {
        type: "stackqueue",
        mode: "queue",
        cells: [...queueCells],
        activeIndex,
      },
      variables: {
        structure: "Queue (FIFO)",
        front: queueCells[0] ?? "—",
        rear: queueCells[queueCells.length - 1] ?? "—",
        size: queueCells.length,
        data: `[${queueCells.join(", ")}]`,
      },
    });
  }

  queueSnap("Now demonstrating Queue — FIFO: First In, First Out.", [20, 21, 22]);

  for (const v of inputValues) {
    queueCells = [...queueCells, v];
    queueSnap(`ENQUEUE ${v} → added at rear.`, [24, 25], queueCells.length - 1);
  }

  // Front
  queueSnap(`FRONT → ${queueCells[0]}.`, [30, 31], 0);

  // Dequeue
  const deqCount = Math.min(3, queueCells.length);
  for (let i = 0; i < deqCount; i++) {
    const dequeued = queueCells[0];
    queueSnap(`DEQUEUE → removing ${dequeued} from front.`, [27, 28, 29], 0);
    queueCells = queueCells.slice(1);
    queueSnap(`Dequeued ${dequeued}. Queue now has ${queueCells.length} elements.`, [28, 29]);
  }

  queueSnap("Stack and Queue demonstrations complete.", [30]);

  return steps;
}

/* ── Module ────────────────────────────────────────────────────────────────── */
export const stackQueueModule: VisualizationModule<number[]> = {
  id: "stack-queue",
  slug: "stack-queue",
  title: "Stack and Queue Operations",
  category: ["data-structures", "stacks-queues"],
  difficulty: "beginner",
  timeComplexity: "O(1) push/pop/enqueue/dequeue",
  spaceComplexity: "O(n)",
  description:
    "Visualizes Stack (LIFO) and Queue (FIFO) — the two fundamental linear data structures behind most algorithms.",
  relatedTopics: ["linked-list", "bfs", "dfs"],
  pythonCode,
  codeSteps: [],
  defaultInput: [10, 20, 30, 40, 50],
  generateSteps(input) {
    return generateStackQueueSteps(input ?? [10, 20, 30, 40, 50]);
  },
};
