import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `class Node:
    def __init__(self, val):
        self.val = val
        self.prev = None
        self.next = None

class DoublyLinkedList:
    def __init__(self):
        self.head = None

    def insert_tail(self, val):
        node = Node(val)
        if not self.head:
            self.head = node
            return
        cur = self.head
        while cur.next:
            cur = cur.next
        cur.next = node
        node.prev = cur

    def insert_head(self, val):
        node = Node(val)
        node.next = self.head
        if self.head:
            self.head.prev = node
        self.head = node

    def delete(self, val):
        cur = self.head
        while cur:
            if cur.val == val:
                if cur.prev: cur.prev.next = cur.next
                else: self.head = cur.next
                if cur.next: cur.next.prev = cur.prev
                return
            cur = cur.next`;

type DoublyNode = { id: number; val: number };

function makeCell(node: DoublyNode, state: string) {
  return { val: `←${node.val}→`, state };
}

export const doublyLinkedListModule: VisualizationModule<null> = {
  id: "data-structures-linked-lists-doubly",
  slug: "doubly-linked-list",
  title: "Doubly Linked List",
  category: ["data-structures", "linked-lists"],
  difficulty: "intermediate",
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)",
  description: "A doubly linked list where each node has pointers to both next and previous nodes.",
  relatedTopics: ["singly-linked-list", "circular-linked-list"],
  pythonCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps(_input) {
    const steps: AnimationStep[] = [];
    let list: DoublyNode[] = [];
    let nextId = 0;

    const snap = (desc: string, activeIdx: number, lines: number[], vars: Record<string, unknown>) => {
      steps.push({
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: lines,
        visualState: {
          type: "array1d",
          cells: list.map((n, i) => makeCell(n, i === activeIdx ? "active" : "default")),
          label: "Doubly Linked List [←val→]",
        },
        variables: vars,
      });
    };

    snap("Initialize empty doubly linked list.", -1, [8, 9], { list: "empty" });

    // insert 10 at tail
    list.push({ id: nextId++, val: 10 });
    snap("Insert 10 at tail. List: [10]", 0, [11, 12, 13, 14], { op: "insertTail(10)" });

    // insert 20 at tail
    list.push({ id: nextId++, val: 20 });
    snap("Insert 20 at tail. List: [10 ↔ 20]", list.length - 1, [11, 15, 16, 17, 18, 19], { op: "insertTail(20)" });

    // insert 5 at head
    list.unshift({ id: nextId++, val: 5 });
    snap("Insert 5 at head. List: [5 ↔ 10 ↔ 20]", 0, [22, 23, 24, 25, 26], { op: "insertHead(5)" });

    // show all links
    snap("List state after insertions: head→5↔10↔20←tail", -1, [], { list: list.map((n) => n.val) });

    // delete 10 — find it first
    const delIdx = list.findIndex((n) => n.val === 10);
    snap(`Delete 10: searching... found at index ${delIdx}.`, delIdx, [29, 30, 31], { op: "delete(10)", found: 10 });

    list.splice(delIdx, 1);
    snap("Deleted 10. Re-link: 5.next→20, 20.prev→5. List: [5 ↔ 20]", -1, [32, 33, 34], { op: "delete(10)", list: list.map((n) => n.val) });

    snap("Final state of doubly linked list: [5 ↔ 20]", -1, [], { list: list.map((n) => n.val) });

    return steps;
  },
};
