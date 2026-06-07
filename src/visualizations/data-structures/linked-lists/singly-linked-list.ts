import type { AnimationStep, VisualizationModule } from "@/types/visualization";

/* ── Python code ───────────────────────────────────────────────────────────── */
const pythonCode = `class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
        self.size = 0

    def append(self, value):
        new_node = Node(value)
        if self.head is None:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node
        self.size += 1

    def prepend(self, value):
        new_node = Node(value)
        new_node.next = self.head
        self.head = new_node
        self.size += 1

    def delete(self, value):
        if self.head is None:
            return
        if self.head.value == value:
            self.head = self.head.next
            return
        current = self.head
        while current.next:
            if current.next.value == value:
                current.next = current.next.next
                return
            current = current.next`;

/* ── Node structure ─────────────────────────────────────────────────────────── */
interface LLNode {
  id: number;
  value: number;
}

/* ── Step generator ─────────────────────────────────────────────────────────── */
function generateLinkedListSteps(inputValues: number[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  let nodes: LLNode[] = [];
  let nextId = 0;

  function makeNode(value: number): LLNode {
    return { id: nextId++, value };
  }

  function snap(
    desc: string,
    lines: number[],
    activeIndex?: number,
    highlightedIndex?: number,
    deletedIndex?: number,
  ) {
    steps.push({
      stepNumber: steps.length + 1,
      description: desc,
      highlightLines: lines,
      visualState: {
        type: "linkedlist",
        nodes: nodes.map((n) => ({ id: n.id, value: n.value })),
        activeIndex,
        highlightedIndex,
        deletedIndex,
      },
      variables: {
        size: nodes.length,
        head: nodes[0]?.value ?? "null",
        tail: nodes[nodes.length - 1]?.value ?? "null",
      },
    });
  }

  snap("Initialize empty singly linked list.", [6, 7, 8, 9]);

  // Append all values
  for (const v of inputValues) {
    const newNode = makeNode(v);

    if (nodes.length === 0) {
      nodes = [newNode];
      snap(`Append ${v}: list empty — set as head.`, [11, 12, 13, 14, 15], 0, undefined);
    } else {
      snap(`Append ${v}: traverse to find tail.`, [11, 12, 16, 17, 18], undefined);
      for (let i = 0; i < nodes.length; i++) {
        snap(
          `Traversing — at node ${nodes[i].value}${i === nodes.length - 1 ? " (tail found)." : "..."}`,
          [17, 18],
          i,
        );
      }
      nodes = [...nodes, newNode];
      snap(`Append ${v}: linked to tail. New tail is ${v}.`, [18, 19, 20], nodes.length - 1, undefined);
    }
  }

  // Prepend a value
  const prependVal = 99;
  snap(`Now prepend ${prependVal} at the head.`, [23, 24, 25, 26, 27]);
  const prepNode = makeNode(prependVal);
  nodes = [prepNode, ...nodes];
  snap(`Prepend ${prependVal}: new node points to old head. head = ${prependVal}.`, [24, 25, 26, 27], 0);

  // Delete a value
  const deleteVal = inputValues[Math.floor(inputValues.length / 2)] ?? inputValues[1];
  snap(`Now delete node with value ${deleteVal}.`, [29, 30]);
  let deletedIdx = -1;
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].value === deleteVal) {
      deletedIdx = i;
      break;
    }
    snap(`Checking node ${nodes[i].value} — not target.`, [35, 36, 37, 38], i);
  }
  if (deletedIdx >= 0) {
    snap(`Found ${deleteVal} at index ${deletedIdx} — marking for deletion.`, [32, 33, 34, 35, 36, 37], undefined, undefined, deletedIdx);
    nodes = nodes.filter((_, i) => i !== deletedIdx);
    snap(`Deleted ${deleteVal}. Pointer bypassed.`, [37, 38], undefined);
  }

  snap(`Linked list operations complete. Final list has ${nodes.length} nodes.`, [30]);

  return steps;
}

/* ── Module ────────────────────────────────────────────────────────────────── */
export const singlyLinkedListModule: VisualizationModule<number[]> = {
  id: "linked-list-singly",
  slug: "singly-linked-list",
  title: "Singly Linked List",
  category: ["data-structures", "linked-lists"],
  difficulty: "beginner",
  timeComplexity: "O(n) traversal, O(1) prepend",
  spaceComplexity: "O(n)",
  description:
    "A linear data structure where each node points to the next. Demonstrates append, prepend, and delete operations.",
  relatedTopics: ["doubly-linked-list", "stack", "queue"],
  pythonCode,
  codeSteps: [],
  defaultInput: [10, 20, 30, 40, 50],
  generateSteps(input) {
    return generateLinkedListSteps(input ?? [10, 20, 30, 40, 50]);
  },
};
