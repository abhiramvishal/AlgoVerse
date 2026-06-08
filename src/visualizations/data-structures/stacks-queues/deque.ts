import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `from collections import deque

dq = deque()
dq.appendleft(3)   # push_front
dq.append(5)       # push_back
dq.appendleft(1)   # push_front
dq.popleft()       # pop_front
dq.append(9)       # push_back
dq.pop()           # pop_back`;

type Op =
  | { op: "pushFront"; val: number }
  | { op: "pushBack"; val: number }
  | { op: "popFront" }
  | { op: "popBack" };

export const dequeModule: VisualizationModule<null> = {
  id: "data-structures-stacks-queues-deque",
  slug: "deque",
  title: "Deque (Double-Ended Queue)",
  category: ["data-structures", "stacks-queues"],
  difficulty: "intermediate",
  timeComplexity: "O(1) per operation",
  spaceComplexity: "O(n)",
  description: "A double-ended queue that supports insertion and removal at both ends.",
  relatedTopics: ["queue", "stack", "circular-queue"],
  pythonCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps(_input) {
    const steps: AnimationStep[] = [];
    let cells: number[] = [];

    const ops: Op[] = [
      { op: "pushFront", val: 3 },
      { op: "pushBack", val: 5 },
      { op: "pushFront", val: 1 },
      { op: "popFront" },
      { op: "pushBack", val: 9 },
      { op: "popBack" },
    ];

    steps.push({
      stepNumber: steps.length + 1,
      description: "Initialize empty deque.",
      highlightLines: [1],
      visualState: {
        type: "stackqueue",
        mode: "queue",
        cells: [],
        activeIndex: -1,
        topIndex: -1,
      },
      variables: { deque: [] },
    });

    for (const o of ops) {
      let activeIndex = -1;
      let desc = "";

      if (o.op === "pushFront") {
        cells = [o.val, ...cells];
        activeIndex = 0;
        desc = `pushFront(${o.val}): add ${o.val} to front. Deque: [${cells.join(", ")}]`;
      } else if (o.op === "pushBack") {
        cells = [...cells, o.val];
        activeIndex = cells.length - 1;
        desc = `pushBack(${o.val}): add ${o.val} to back. Deque: [${cells.join(", ")}]`;
      } else if (o.op === "popFront") {
        const removed = cells[0];
        activeIndex = 0;
        desc = `popFront(): remove ${removed} from front.`;
        steps.push({
          stepNumber: steps.length + 1,
          description: desc,
          highlightLines: [7],
          visualState: {
            type: "stackqueue",
            mode: "queue",
            cells: cells.map((v, i) => ({ val: v, state: i === 0 ? "active" : "default" })),
            activeIndex: 0,
            topIndex: cells.length - 1,
          },
          variables: { removed, deque: cells },
        });
        cells = cells.slice(1);
        continue;
      } else {
        const removed = cells[cells.length - 1];
        activeIndex = cells.length - 1;
        desc = `popBack(): remove ${removed} from back.`;
        steps.push({
          stepNumber: steps.length + 1,
          description: desc,
          highlightLines: [9],
          visualState: {
            type: "stackqueue",
            mode: "queue",
            cells: cells.map((v, i) => ({ val: v, state: i === cells.length - 1 ? "active" : "default" })),
            activeIndex: cells.length - 1,
            topIndex: cells.length - 1,
          },
          variables: { removed, deque: cells },
        });
        cells = cells.slice(0, -1);
        continue;
      }

      steps.push({
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: [o.op === "pushFront" ? 4 : 5],
        visualState: {
          type: "stackqueue",
          mode: "queue",
          cells: cells.map((v, i) => ({ val: v, state: i === activeIndex ? "active" : "default" })),
          activeIndex,
          topIndex: cells.length - 1,
        },
        variables: { deque: [...cells] },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Final deque state: [${cells.join(", ")}]`,
      highlightLines: [],
      visualState: {
        type: "stackqueue",
        mode: "queue",
        cells: cells.map((v) => ({ val: v, state: "default" })),
        activeIndex: -1,
        topIndex: cells.length - 1,
      },
      variables: { deque: cells },
    });

    return steps;
  },
};
