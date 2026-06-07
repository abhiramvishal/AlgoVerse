import type { AnimationStep, VisualizationModule } from "@/types/visualization";

/* ── BST node for internal computation ─────────────────────────────────────── */
interface BSTNode {
  id: number;
  value: number;
  left: number | null;
  right: number | null;
}

/* ── Layout: compute x,y for a BST given level/position ───────────────────── */
function layoutTree(
  nodes: BSTNode[],
  rootId: number | null,
): { id: number; label: string; x: number; y: number; left: number | null; right: number | null }[] {
  if (rootId === null) return [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const result: { id: number; label: string; x: number; y: number; left: number | null; right: number | null }[] = [];

  const yGap = 72;
  const viewW = 600;

  function assign(
    id: number | null,
    level: number,
    minX: number,
    maxX: number,
  ) {
    if (id === null) return;
    const node = nodeMap.get(id);
    if (!node) return;
    const x = (minX + maxX) / 2;
    const y = 36 + level * yGap;
    result.push({
      id: node.id,
      label: String(node.value),
      x,
      y,
      left: node.left,
      right: node.right,
    });
    assign(node.left, level + 1, minX, x);
    assign(node.right, level + 1, x, maxX);
  }

  assign(rootId, 0, 0, viewW);
  return result;
}

/* ── Python code ───────────────────────────────────────────────────────────── */
const pythonCode = `class BST:
    def __init__(self):
        self.root = None

    def insert(self, value):
        self.root = self._insert(self.root, value)

    def _insert(self, node, value):
        if node is None:
            return Node(value)
        if value < node.value:
            node.left = self._insert(node.left, value)
        elif value > node.value:
            node.right = self._insert(node.right, value)
        return node

    def search(self, value):
        return self._search(self.root, value)

    def _search(self, node, value):
        if node is None or node.value == value:
            return node
        if value < node.value:
            return self._search(node.left, value)
        return self._search(node.right, value)`;

/* ── Step generator ─────────────────────────────────────────────────────────── */
function generateBSTSteps(insertValues: number[]): AnimationStep[] {
  const steps: AnimationStep[] = [];

  let nextId = 1;
  let rootId: number | null = null;
  const nodes: BSTNode[] = [];
  const nodeMap = new Map<number, BSTNode>();

  function getLayoutNodes() {
    return layoutTree(nodes, rootId);
  }

  function push(
    desc: string,
    lines: number[],
    highlighted: number[],
    comparing: number | undefined,
    inserted: number | undefined,
    found: number | undefined,
  ) {
    steps.push({
      stepNumber: steps.length + 1,
      description: desc,
      highlightLines: lines,
      visualState: {
        type: "tree",
        nodes: getLayoutNodes(),
        highlighted,
        comparing,
        inserted,
        found,
      },
      variables: {
        nodeCount: nodes.length,
        root: rootId !== null ? nodeMap.get(rootId)?.value ?? null : null,
      },
    });
  }

  push("Empty BST initialized. Will insert values one by one.", [1, 2, 3], [], undefined, undefined, undefined);

  // Insert all values
  function insertNode(value: number): number {
    const newNode: BSTNode = { id: nextId++, value, left: null, right: null };
    nodes.push(newNode);
    nodeMap.set(newNode.id, newNode);
    return newNode.id;
  }

  function insertIntoTree(value: number) {
    if (rootId === null) {
      const id = insertNode(value);
      rootId = id;
      push(
        `Insert ${value}: tree is empty — place at root.`,
        [5, 6, 7, 8, 9],
        [],
        undefined,
        id,
        undefined,
      );
      return;
    }

    const path: number[] = [];
    let current = rootId;
    push(
      `Insert ${value}: start at root.`,
      [5, 6, 7],
      [rootId],
      rootId,
      undefined,
      undefined,
    );

    while (true) {
      const curr = nodeMap.get(current)!;
      path.push(current);

      if (value < curr.value) {
        push(
          `${value} < ${curr.value}: go left.`,
          [10, 11],
          path,
          current,
          undefined,
          undefined,
        );
        if (curr.left === null) {
          const id = insertNode(value);
          curr.left = id;
          push(
            `Left child empty — insert ${value} here.`,
            [8, 9],
            [...path, id],
            undefined,
            id,
            undefined,
          );
          break;
        }
        current = curr.left;
      } else if (value > curr.value) {
        push(
          `${value} > ${curr.value}: go right.`,
          [12, 13],
          path,
          current,
          undefined,
          undefined,
        );
        if (curr.right === null) {
          const id = insertNode(value);
          curr.right = id;
          push(
            `Right child empty — insert ${value} here.`,
            [8, 9],
            [...path, id],
            undefined,
            id,
            undefined,
          );
          break;
        }
        current = curr.right;
      } else {
        push(
          `${value} already exists in the BST — skip duplicate.`,
          [13],
          path,
          current,
          undefined,
          undefined,
        );
        break;
      }
    }
  }

  for (const v of insertValues) {
    insertNode; // eslint
    insertIntoTree(v);
  }

  // Now do a search for a value to demonstrate search
  const searchTarget = insertValues[Math.floor(insertValues.length / 2)];

  push(
    `Now demonstrate search for ${searchTarget}.`,
    [17, 18],
    [],
    rootId ?? undefined,
    undefined,
    undefined,
  );

  let current: number | null = rootId;
  while (current !== null) {
    const curr: BSTNode = nodeMap.get(current)!;

    push(
      `Search ${searchTarget}: comparing with ${curr.value}.`,
      [19, 20, 21, 22, 23],
      [],
      current,
      undefined,
      undefined,
    );

    if (searchTarget === curr.value) {
      push(
        `Found ${searchTarget}!`,
        [19, 20],
        [],
        undefined,
        undefined,
        current,
      );
      break;
    } else if (searchTarget < curr.value) {
      push(
        `${searchTarget} < ${curr.value}: search left subtree.`,
        [21, 22],
        [],
        current,
        undefined,
        undefined,
      );
      current = curr.left ?? null;
    } else {
      push(
        `${searchTarget} > ${curr.value}: search right subtree.`,
        [23],
        [],
        current,
        undefined,
        undefined,
      );
      current = curr.right ?? null;
    }
  }

  return steps;
}

/* ── Module ────────────────────────────────────────────────────────────────── */
export const binarySearchTreeModule: VisualizationModule<number[]> = {
  id: "tree-binary-search-tree",
  slug: "binary-search-tree",
  title: "Binary Search Tree",
  category: ["data-structures", "trees"],
  difficulty: "intermediate",
  timeComplexity: "O(h) — h = tree height",
  spaceComplexity: "O(n)",
  description:
    "A tree where each node's left subtree has smaller values and right subtree has larger values. Supports O(log n) insert and search on average.",
  relatedTopics: ["avl-tree", "red-black-tree", "heap"],
  pythonCode,
  codeSteps: [],
  defaultInput: [50, 30, 70, 20, 40, 60, 80, 10],
  generateSteps(input) {
    return generateBSTSteps(input ?? [50, 30, 70, 20, 40, 60, 80]);
  },
};
