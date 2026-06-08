import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `from collections import deque

class Queue:
    def __init__(self):
        self.q = deque()

    def enqueue(self, val):
        self.q.append(val)

    def dequeue(self):
        if not self.q:
            raise Exception("Queue empty")
        return self.q.popleft()

    def front(self):
        return self.q[0] if self.q else None`;

export const queueModule: VisualizationModule<null> = {
  id: "data-structures-queues-queue",
  slug: "queue",
  title: "Queue",
  category: ["data-structures", "queues"],
  difficulty: "beginner",
  timeComplexity: "O(1) enqueue/dequeue",
  spaceComplexity: "O(n)",
  description: "A FIFO data structure with enqueue and dequeue operations.",
  relatedTopics: ["stack", "deque", "circular-queue"],
  pythonCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps(_input) {
    const steps: AnimationStep[] = [];
    let q: number[] = [];

    const snap = (desc: string, activeIdx: number, lines: number[], vars: Record<string, unknown>) => {
      steps.push({
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: lines,
        visualState: {
          type: "stackqueue",
          mode: "queue",
          cells: q.map((v, i) => ({ val: v, state: i === activeIdx ? "active" : "default" })),
          activeIndex: activeIdx,
          topIndex: q.length - 1,
        },
        variables: { queue: [...q], ...vars },
      });
    };

    snap("Initialize empty queue.", -1, [3, 4], { size: 0 });

    for (const val of [3, 1, 4, 1, 5]) {
      q.push(val);
      snap(`enqueue(${val}): add ${val} at rear. Queue: [${q.join(", ")}]`, q.length - 1, [7, 8], {
        enqueued: val,
        front: q[0],
        rear: val,
      });
    }

    snap(`front(): front element = ${q[0]}.`, 0, [15, 16], { front: q[0] });

    for (let i = 0; i < 3; i++) {
      const val = q[0];
      snap(`dequeue(): remove front = ${val}.`, 0, [10, 11, 12, 13], { dequeued: val });
      q.shift();
      snap(`After dequeue: queue = [${q.join(", ")}].`, -1, [13], {
        front: q[0] ?? "empty",
        size: q.length,
      });
    }

    snap(`Final queue (front→rear): [${q.join(", ")}].`, -1, [], { size: q.length });

    return steps;
  },
};
