import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

class CircularLinkedList:
    def __init__(self):
        self.head = None

    def insert(self, val):
        node = Node(val)
        if not self.head:
            self.head = node
            node.next = self.head
            return
        cur = self.head
        while cur.next != self.head:
            cur = cur.next
        cur.next = node
        node.next = self.head

    def traverse(self, rounds=1):
        if not self.head:
            return []
        result = []
        cur = self.head
        count = 0
        total = rounds * self._size()
        while count < total:
            result.append(cur.val)
            cur = cur.next
            count += 1
        return result

    def _size(self):
        if not self.head: return 0
        cur, count = self.head.next, 1
        while cur != self.head:
            cur = cur.next
            count += 1
        return count`;

export const circularLinkedListModule: VisualizationModule<null> = {
  id: "data-structures-linked-lists-circular",
  slug: "circular-linked-list",
  title: "Circular Linked List",
  category: ["data-structures", "linked-lists"],
  difficulty: "intermediate",
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)",
  description: "A linked list where the last node points back to the head, forming a circle.",
  relatedTopics: ["doubly-linked-list", "singly-linked-list"],
  pythonCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps(_input) {
    const steps: AnimationStep[] = [];
    const values = [1, 2, 3, 4];
    const list: number[] = [];

    const snap = (desc: string, active: number, lines: number[], vars: Record<string, unknown>) => {
      steps.push({
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: lines,
        visualState: {
          type: "linkedlist",
          nodes: list.map((v, i) => ({ value: v, id: i })),
          activeIndex: active,
          highlightedIndex: -1,
        },
        variables: vars,
      });
    };

    snap("Initialize empty circular linked list.", -1, [6, 7, 8], { list: "empty" });

    for (const v of values) {
      list.push(v);
      snap(
        `Insert ${v}. Node ${v}.next → ${v === values[values.length - 1] ? "head(1)" : "→"}. List: [${list.join("→")}→(back to 1)]`,
        list.length - 1,
        [11, 12, 13],
        { inserted: v, size: list.length },
      );
    }

    snap(`Built circular list: [${list.join("→")}→(back to head=${list[0]})]`, -1, [17, 18, 19, 20], {
      list: list,
      circular: true,
    });

    // Traverse round 1
    steps.push({
      stepNumber: steps.length + 1,
      description: "Traversal round 1: starting at head.",
      highlightLines: [23, 24, 25],
      visualState: {
        type: "linkedlist",
        nodes: list.map((v, i) => ({ value: v, id: i })),
        activeIndex: 0,
        highlightedIndex: -1,
      },
      variables: { round: 1, current: list[0] },
    });

    for (let round = 1; round <= 2; round++) {
      for (let i = 0; i < list.length; i++) {
        const next = (i + 1) % list.length;
        steps.push({
          stepNumber: steps.length + 1,
          description: `Round ${round}: visit node ${list[i]}. Next → ${list[next]}${i === list.length - 1 ? " (wraps to head)" : ""}.`,
          highlightLines: [26, 27, 28],
          visualState: {
            type: "linkedlist",
            nodes: list.map((v, idx) => ({ value: v, id: idx })),
            activeIndex: i,
            highlightedIndex: next,
          },
          variables: { round, current: list[i], next: list[next] },
        });
      }
    }

    snap("Traversal complete. Circular list behaves cyclically — no null tail.", -1, [], {
      traversed: [...list, ...list],
    });

    return steps;
  },
};
