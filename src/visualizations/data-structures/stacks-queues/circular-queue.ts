import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `class CircularQueue:
    def __init__(self, capacity):
        self.buf = [None] * capacity
        self.front = 0
        self.rear = -1
        self.size = 0
        self.capacity = capacity

    def enqueue(self, val):
        if self.size == self.capacity:
            raise Exception("Queue full")
        self.rear = (self.rear + 1) % self.capacity
        self.buf[self.rear] = val
        self.size += 1

    def dequeue(self):
        if self.size == 0:
            raise Exception("Queue empty")
        val = self.buf[self.front]
        self.buf[self.front] = None
        self.front = (self.front + 1) % self.capacity
        self.size -= 1
        return val`;

export const circularQueueModule: VisualizationModule<null> = {
  id: "data-structures-stacks-queues-circular-queue",
  slug: "circular-queue",
  title: "Circular Queue",
  category: ["data-structures", "stacks-queues"],
  difficulty: "intermediate",
  timeComplexity: "O(1) per operation",
  spaceComplexity: "O(n)",
  description: "A fixed-size queue where the rear wraps around to the front of the buffer.",
  relatedTopics: ["queue", "deque", "stack"],
  pythonCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps(_input) {
    const capacity = 5;
    const buf: (number | null)[] = new Array(capacity).fill(null);
    let front = 0;
    let rear = -1;
    let size = 0;
    const steps: AnimationStep[] = [];

    const snap = (desc: string, lines: number[], vars: Record<string, unknown>) => {
      steps.push({
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: lines,
        visualState: {
          type: "array1d",
          cells: buf.map((v, i) => ({
            val: v === null ? "_" : v,
            state: i === front ? "active" : i === rear ? "highlighted" : "default",
          })),
          label: `Circular Queue (capacity=${capacity})`,
          pointer: [
            { index: front, label: "F" },
            ...(rear >= 0 ? [{ index: rear, label: "R" }] : []),
          ],
        },
        variables: { front, rear, size, ...vars },
      });
    };

    snap("Initialize circular queue with capacity 5.", [1, 2, 3, 4, 5, 6, 7], { buf: [...buf] });

    const enqueue = (val: number) => {
      rear = (rear + 1) % capacity;
      buf[rear] = val;
      size++;
      snap(`enqueue(${val}): rear → ${rear}. buf[${rear}]=${val}.`, [9, 10, 11, 12, 13], { op: `enqueue(${val})` });
    };

    const dequeue = () => {
      const val = buf[front];
      buf[front] = null;
      snap(`dequeue(): remove buf[${front}]=${val}. front → ${(front + 1) % capacity}.`, [16, 17, 18, 19, 20, 21], {
        op: "dequeue()",
        removed: val,
      });
      front = (front + 1) % capacity;
      size--;
    };

    enqueue(1);
    enqueue(2);
    enqueue(3);
    enqueue(4);
    dequeue();
    dequeue();
    enqueue(5);
    enqueue(6);

    snap(`Final state: front=${front}, rear=${rear}, size=${size}. Buffer wraps around.`, [], {
      buf: [...buf],
    });

    return steps;
  },
};
