import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `class Stack:
    def __init__(self):
        self.items = []

    def push(self, val):
        self.items.append(val)

    def pop(self):
        if not self.items:
            raise Exception("Stack underflow")
        return self.items.pop()

    def peek(self):
        return self.items[-1] if self.items else None

    def is_empty(self):
        return len(self.items) == 0`;

export const stackModule: VisualizationModule<null> = {
  id: "data-structures-stacks-stack",
  slug: "stack",
  title: "Stack",
  category: ["data-structures", "stacks"],
  difficulty: "beginner",
  timeComplexity: "O(1) push/pop/peek",
  spaceComplexity: "O(n)",
  description: "A LIFO data structure with push, pop, and peek operations.",
  relatedTopics: ["queue", "monotonic-stack", "deque"],
  pythonCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps(_input) {
    const steps: AnimationStep[] = [];
    let items: number[] = [];

    const snap = (desc: string, activeIdx: number, lines: number[], vars: Record<string, unknown>) => {
      steps.push({
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: lines,
        visualState: {
          type: "stackqueue",
          mode: "stack",
          cells: items.map((v, i) => ({ val: v, state: i === activeIdx ? "active" : "default" })),
          activeIndex: activeIdx,
          topIndex: items.length - 1,
        },
        variables: { stack: [...items], ...vars },
      });
    };

    snap("Initialize empty stack.", -1, [1, 2], { size: 0 });

    for (const val of [5, 3, 8, 1]) {
      items.push(val);
      snap(`push(${val}): add ${val} on top. Stack top = ${val}.`, items.length - 1, [4, 5], {
        pushed: val,
        top: val,
      });
    }

    snap(`peek(): top = ${items[items.length - 1]}.`, items.length - 1, [12, 13], {
      peek: items[items.length - 1],
    });

    for (let i = 0; i < 2; i++) {
      const val = items[items.length - 1];
      snap(`pop(): remove top = ${val}.`, items.length - 1, [7, 8, 9, 10, 11], { popped: val });
      items.pop();
      snap(`After pop: stack = [${items.join(", ")}].`, items.length - 1, [11], {
        top: items[items.length - 1] ?? "empty",
      });
    }

    items.push(6);
    snap(`push(6): add 6 on top. Stack = [${items.join(", ")}].`, items.length - 1, [4, 5], {
      pushed: 6,
      top: 6,
    });

    snap(`Final stack (bottom→top): [${items.join(", ")}].`, -1, [], { size: items.length });

    return steps;
  },
};
