import type { AnimationStep, VisualizationModule } from "@/types/visualization";

// ── Re-exports from individual files ────────────────────────────────────────
export { linearSearchModule } from "@/visualizations/data-structures/arrays/linear-search";
export { twoPointersModule } from "@/visualizations/data-structures/arrays/two-pointers";
export { slidingWindowModule } from "@/visualizations/data-structures/arrays/sliding-window";
export { kadaneModule } from "@/visualizations/data-structures/arrays/kadane";
export { doublyLinkedListModule } from "@/visualizations/data-structures/linked-lists/doubly-linked-list";
export { circularLinkedListModule } from "@/visualizations/data-structures/linked-lists/circular-linked-list";
export { stackModule } from "@/visualizations/data-structures/stacks/stack";
export { monotonicStackModule } from "@/visualizations/data-structures/stacks/monotonic-stack";
export { queueModule } from "@/visualizations/data-structures/queues/queue";
export { dequeModule } from "@/visualizations/data-structures/stacks-queues/deque";
export { priorityQueueModule } from "@/visualizations/data-structures/stacks-queues/priority-queue";
export { circularQueueModule } from "@/visualizations/data-structures/stacks-queues/circular-queue";
export { hashTableLinearProbingModule } from "@/visualizations/data-structures/hash-tables/hash-table-linear-probing";
export { hashTableQuadraticProbingModule } from "@/visualizations/data-structures/hash-tables/hash-table-quadratic-probing";
export { hashTableDoubleHashingModule } from "@/visualizations/data-structures/hash-tables/hash-table-double-hashing";
export { avlTreeModule } from "@/visualizations/data-structures/trees/avl-tree";
export { trieModule } from "@/visualizations/data-structures/trees/trie";
export { segmentTreeModule } from "@/visualizations/data-structures/trees/segment-tree";
export { fenwickTreeModule } from "@/visualizations/data-structures/trees/fenwick-tree";
export { minHeapModule } from "@/visualizations/data-structures/heaps/min-heap";
export { maxHeapModule } from "@/visualizations/data-structures/heaps/max-heap";
export { adjacencyListModule } from "@/visualizations/data-structures/graphs/adjacency-list";
export { unionFindModule } from "@/visualizations/data-structures/advanced/union-find";
export { lruCacheModule } from "@/visualizations/data-structures/advanced/lru-cache";
export { bloomFilterModule } from "@/visualizations/data-structures/advanced/bloom-filter";

// ── Skip List ────────────────────────────────────────────────────────────────
export const skipListModule: VisualizationModule<number[]> = {
  id: "ds-skip-list",
  slug: "skip-list",
  title: "Skip List",
  category: ["data-structures", "linked-lists"],
  difficulty: "advanced",
  timeComplexity: "O(log n) expected",
  spaceComplexity: "O(n log n)",
  description: "Probabilistic data structure with multiple layers of linked lists for fast search, insert, and delete.",
  pythonCode: `import random

class SkipNode:
    def __init__(self, val, level):
        self.val = val
        self.next = [None] * (level + 1)

class SkipList:
    MAX_LEVEL = 4
    P = 0.5

    def __init__(self):
        self.head = SkipNode(-float('inf'), self.MAX_LEVEL)
        self.level = 0

    def random_level(self):
        lvl = 0
        while random.random() < self.P and lvl < self.MAX_LEVEL:
            lvl += 1
        return lvl

    def insert(self, val):
        update = [None] * (self.MAX_LEVEL + 1)
        cur = self.head
        for i in range(self.level, -1, -1):
            while cur.next[i] and cur.next[i].val < val:
                cur = cur.next[i]
            update[i] = cur
        lvl = self.random_level()
        node = SkipNode(val, lvl)
        for i in range(lvl + 1):
            node.next[i] = update[i].next[i]
            update[i].next[i] = node

    def search(self, target):
        cur = self.head
        for i in range(self.level, -1, -1):
            while cur.next[i] and cur.next[i].val < target:
                cur = cur.next[i]
        return cur.next[0] and cur.next[0].val == target`,
  codeSteps: [],
  defaultInput: [3, 6, 7, 9, 12, 17, 19, 21, 25, 26],
  generateSteps(input) {
    const vals = input ?? [3, 6, 7, 9, 12, 17, 19, 21, 25, 26];
    const steps: AnimationStep[] = [];
    const levels = [2, 1, 3, 1, 2, 1, 2, 1, 3, 1];
    const inserted: Array<{ val: number; level: number }> = [];

    steps.push({
      stepNumber: 1,
      description: "Skip List: probabilistic multilevel linked list. Higher levels skip more nodes for fast O(log n) search.",
      highlightLines: [1, 2],
      visualState: { type: "array1d", cells: [{ val: "HEAD", state: "highlighted" as const }], label: "Skip List" },
      variables: { maxLevel: 4, p: 0.5 },
    });

    for (let i = 0; i < vals.length; i++) {
      const v = vals[i];
      const lvl = levels[i] ?? 1;
      inserted.push({ val: v, level: lvl });
      steps.push({
        stepNumber: steps.length + 1,
        description: `Insert ${v}: random level=${lvl}. Update pointers at levels 0..${lvl}.`,
        highlightLines: [21, 22, 23, 24, 25, 26, 27],
        visualState: {
          type: "array1d",
          cells: [
            { val: "HEAD", state: "default" as const },
            ...inserted.map((x) => ({
              val: `${x.val}(L${x.level})`,
              state: x.val === v ? "active" as const : "computed" as const,
            })),
          ],
          label: `Skip List (${inserted.length} nodes)`,
        },
        variables: { inserted: v, level: lvl, listSize: inserted.length },
      });
    }

    const target = 17;
    steps.push({
      stepNumber: steps.length + 1,
      description: `Search ${target}: start at highest level, skip large ranges, drop level when value exceeded. O(log n) expected.`,
      highlightLines: [33, 34, 35, 36],
      visualState: {
        type: "array1d",
        cells: [
          { val: "HEAD", state: "default" as const },
          ...inserted.map((x) => ({
            val: `${x.val}`,
            state: x.val === target ? "highlighted" as const : x.val < target ? "active" as const : "default" as const,
          })),
        ],
        label: `Found ${target}`,
      },
      variables: { target, found: true, comparisons: 4 },
    });

    return steps;
  },
};

// ── Red-Black Tree ────────────────────────────────────────────────────────────
export const redBlackTreeModule: VisualizationModule<number[]> = {
  id: "ds-red-black-tree",
  slug: "red-black-tree",
  title: "Red-Black Tree",
  category: ["data-structures", "trees"],
  difficulty: "advanced",
  timeComplexity: "O(log n)",
  spaceComplexity: "O(n)",
  description: "Self-balancing BST where nodes are colored red/black and rotations maintain invariants guaranteeing O(log n) height.",
  pythonCode: `class RBNode:
    def __init__(self, val):
        self.val = val
        self.color = "RED"
        self.left = self.right = self.parent = None

class RedBlackTree:
    def __init__(self):
        self.NIL = RBNode(0)
        self.NIL.color = "BLACK"
        self.root = self.NIL

    def insert(self, val):
        node = RBNode(val)
        node.left = node.right = self.NIL
        y, x = None, self.root
        while x != self.NIL:
            y = x
            x = x.left if node.val < x.val else x.right
        node.parent = y
        if y is None: self.root = node
        elif node.val < y.val: y.left = node
        else: y.right = node
        self.fix_insert(node)

    def fix_insert(self, z):
        while z.parent and z.parent.color == "RED":
            if z.parent == z.parent.parent.left:
                y = z.parent.parent.right  # uncle
                if y.color == "RED":       # Case 1: recolor
                    z.parent.color = y.color = "BLACK"
                    z.parent.parent.color = "RED"
                    z = z.parent.parent
                else:
                    if z == z.parent.right:  # Case 2: left-rotate
                        z = z.parent; self.left_rotate(z)
                    z.parent.color = "BLACK"  # Case 3: right-rotate
                    z.parent.parent.color = "RED"
                    self.right_rotate(z.parent.parent)
        self.root.color = "BLACK"`,
  codeSteps: [],
  defaultInput: [10, 20, 30, 15, 25, 5, 1],
  generateSteps(input) {
    const vals = input ?? [10, 20, 30, 15, 25, 5, 1];
    const steps: AnimationStep[] = [];
    const positions: Record<number, { x: number; y: number }> = {
      10: { x: 250, y: 50 }, 20: { x: 350, y: 130 }, 30: { x: 420, y: 210 },
      15: { x: 300, y: 210 }, 25: { x: 380, y: 290 }, 5: { x: 150, y: 130 }, 1: { x: 80, y: 210 },
    };
    const treeNodes: Array<{ id: number; label: string; x: number; y: number }> = [];
    const inserted: number[] = [];

    steps.push({
      stepNumber: 1,
      description: "Red-Black Tree: root=BLACK, RED nodes have BLACK children, all root-to-null paths have equal black-height.",
      highlightLines: [1, 2, 3, 4],
      visualState: { type: "tree", nodes: [], highlighted: [], comparing: [], inserted: [], found: [] },
      variables: { invariants: "root BLACK | RED→BLACK children | equal black-height" },
    });

    for (const v of vals) {
      inserted.push(v);
      const pos = positions[v] ?? { x: 250, y: 50 + inserted.length * 60 };
      treeNodes.push({ id: v, label: `${v}`, x: pos.x, y: pos.y });
      steps.push({
        stepNumber: steps.length + 1,
        description: `Insert ${v}: BST insert as RED, fix_insert() recolors/rotates to restore RB properties.`,
        highlightLines: [13, 14, 22, 23],
        visualState: {
          type: "tree",
          nodes: treeNodes.map((n) => ({ ...n })),
          highlighted: [v],
          comparing: [],
          inserted: [...inserted],
          found: [],
        },
        variables: { inserting: v, initialColor: "RED" },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: "All RB invariants satisfied. Height ≤ 2·log₂(n+1) guarantees O(log n) search/insert/delete.",
      highlightLines: [38],
      visualState: {
        type: "tree",
        nodes: treeNodes,
        highlighted: [],
        comparing: [],
        inserted: [...inserted],
        found: inserted,
      },
      variables: { balanced: true, height: "≤ 2·log₂(n+1)" },
    });

    return steps;
  },
};

// ── B-Tree ────────────────────────────────────────────────────────────────────
export const bTreeModule: VisualizationModule<number[]> = {
  id: "ds-b-tree",
  slug: "b-tree",
  title: "B-Tree",
  category: ["data-structures", "trees"],
  difficulty: "advanced",
  timeComplexity: "O(log n)",
  spaceComplexity: "O(n)",
  description: "Self-balancing multi-way search tree for databases/filesystems. Nodes hold up to 2t-1 keys; splits keep tree balanced.",
  pythonCode: `class BTreeNode:
    def __init__(self, leaf=True):
        self.keys = []
        self.children = []
        self.leaf = leaf

class BTree:
    def __init__(self, t):  # minimum degree
        self.root = BTreeNode()
        self.t = t

    def search(self, k, node=None):
        node = node or self.root
        i = 0
        while i < len(node.keys) and k > node.keys[i]:
            i += 1
        if i < len(node.keys) and k == node.keys[i]:
            return (node, i)
        if node.leaf: return None
        return self.search(k, node.children[i])

    def insert(self, k):
        r = self.root
        if len(r.keys) == 2 * self.t - 1:
            s = BTreeNode(leaf=False)
            s.children.append(self.root)
            self.split_child(s, 0)
            self.root = s
        self.insert_nonfull(self.root, k)

    def split_child(self, parent, i):
        t = self.t
        y = parent.children[i]
        z = BTreeNode(leaf=y.leaf)
        parent.keys.insert(i, y.keys[t - 1])
        z.keys = y.keys[t:]
        y.keys = y.keys[:t - 1]
        if not y.leaf:
            z.children = y.children[t:]
            y.children = y.children[:t]
        parent.children.insert(i + 1, z)`,
  codeSteps: [],
  defaultInput: [10, 20, 5, 6, 12, 30, 7, 17],
  generateSteps(input) {
    const vals = input ?? [10, 20, 5, 6, 12, 30, 7, 17];
    const steps: AnimationStep[] = [];
    const t = 2;

    steps.push({
      stepNumber: 1,
      description: `B-Tree (t=${t}): each node holds ${t - 1}–${2 * t - 1} keys. Full node splits — median promoted to parent.`,
      highlightLines: [7, 8, 9],
      visualState: { type: "array1d", cells: [{ val: "[]", state: "default" as const }], label: "B-Tree root (empty)" },
      variables: { t, minKeys: t - 1, maxKeys: 2 * t - 1 },
    });

    const rootKeys: number[] = [];

    for (const v of vals) {
      if (rootKeys.length < 2 * t - 1) {
        rootKeys.push(v);
        rootKeys.sort((a, b) => a - b);
        steps.push({
          stepNumber: steps.length + 1,
          description: `Insert ${v}: root has room (${rootKeys.length}/${2 * t - 1}). Add and sort. Keys: [${rootKeys.join(", ")}].`,
          highlightLines: [21, 22, 27],
          visualState: {
            type: "array1d",
            cells: rootKeys.map((k) => ({ val: k, state: k === v ? "active" as const : "computed" as const })),
            label: `Root (${rootKeys.length} keys)`,
          },
          variables: { inserted: v, rootKeyCount: rootKeys.length },
        });
      } else {
        const median = rootKeys[t - 1];
        const left = rootKeys.slice(0, t - 1);
        const right = rootKeys.slice(t);
        rootKeys.length = 0; rootKeys.push(median);
        steps.push({
          stepNumber: steps.length + 1,
          description: `Root full! Split: median=${median} → new root. L=[${left.join(",")}], R=[${right.join(",")}]. Insert ${v} in correct child.`,
          highlightLines: [23, 24, 25, 26, 30, 31, 32],
          visualState: {
            type: "array1d",
            cells: [
              { val: `Root:[${median}]`, state: "highlighted" as const },
              { val: `L:[${left.join(",")}]`, state: "default" as const },
              { val: `R:[${right.join(",")}]`, state: "default" as const },
              { val: `+${v}`, state: "active" as const },
            ],
            label: "After split",
          },
          variables: { median, left: JSON.stringify(left), right: JSON.stringify(right) },
        });
      }
    }

    return steps;
  },
};

// ── Splay Tree ───────────────────────────────────────────────────────────────
export const splayTreeModule: VisualizationModule<number[]> = {
  id: "ds-splay-tree",
  slug: "splay-tree",
  title: "Splay Tree",
  category: ["data-structures", "trees"],
  difficulty: "advanced",
  timeComplexity: "O(log n) amortized",
  spaceComplexity: "O(n)",
  description: "Self-adjusting BST: every access splays node to root via Zig/Zig-Zig/Zig-Zag rotations. Amortized O(log n).",
  pythonCode: `class SplayNode:
    def __init__(self, val):
        self.val = val
        self.left = self.right = None

class SplayTree:
    def __init__(self): self.root = None

    def right_rotate(self, x):
        y = x.left; x.left = y.right; y.right = x; return y

    def left_rotate(self, x):
        y = x.right; x.right = y.left; y.left = x; return y

    def splay(self, root, key):
        if not root or root.val == key: return root
        if key < root.val:
            if not root.left: return root
            if key < root.left.val:        # Zig-Zig (LL)
                root.left.left = self.splay(root.left.left, key)
                root = self.right_rotate(root)
            elif key > root.left.val:      # Zig-Zag (LR)
                root.left.right = self.splay(root.left.right, key)
                if root.left.right:
                    root.left = self.left_rotate(root.left)
            return root if not root.left else self.right_rotate(root)
        else:
            if not root.right: return root
            if key > root.right.val:       # Zag-Zag (RR)
                root.right.right = self.splay(root.right.right, key)
                root = self.left_rotate(root)
            elif key < root.right.val:     # Zag-Zig (RL)
                root.right.left = self.splay(root.right.left, key)
                if root.right.left:
                    root.right = self.right_rotate(root.right)
            return root if not root.right else self.left_rotate(root)`,
  codeSteps: [],
  defaultInput: [10, 20, 30, 40, 50],
  generateSteps(input) {
    const vals = input ?? [10, 20, 30, 40, 50];
    const steps: AnimationStep[] = [];
    const basePositions = [
      { x: 250, y: 50 }, { x: 350, y: 130 }, { x: 420, y: 210 },
      { x: 470, y: 290 }, { x: 500, y: 370 },
    ];

    steps.push({
      stepNumber: 1,
      description: "Splay Tree: Zig (single rotation), Zig-Zig (LL/RR double), Zig-Zag (LR/RL double). Amortized O(log n). Great for temporal locality.",
      highlightLines: [1, 2],
      visualState: { type: "tree", nodes: [], highlighted: [], comparing: [], inserted: [], found: [] },
      variables: { rotations: "Zig | Zig-Zig (LL/RR) | Zig-Zag (LR/RL)" },
    });

    const treeNodes: Array<{ id: number; label: string; x: number; y: number }> = [];
    for (let i = 0; i < vals.length; i++) {
      const v = vals[i];
      const pos = basePositions[i] ?? { x: 250, y: 50 + i * 60 };
      treeNodes.push({ id: v, label: `${v}`, x: pos.x, y: pos.y });
      steps.push({
        stepNumber: steps.length + 1,
        description: `Insert ${v}: BST insert, then splay ${v} to root. Root = ${v}.`,
        highlightLines: [14, 18, 19],
        visualState: {
          type: "tree",
          nodes: treeNodes.map((n) => ({ ...n })),
          highlighted: [v],
          comparing: [],
          inserted: vals.slice(0, i + 1),
          found: [],
        },
        variables: { inserted: v, root: v },
      });
    }

    const searchVal = vals[Math.floor(vals.length / 2)];
    steps.push({
      stepNumber: steps.length + 1,
      description: `Access ${searchVal}: splay it to root. Future accesses to ${searchVal} are O(1). Amortized cost = O(log n).`,
      highlightLines: [15, 17, 24],
      visualState: {
        type: "tree",
        nodes: treeNodes,
        highlighted: [searchVal],
        comparing: [],
        inserted: vals,
        found: [searchVal],
      },
      variables: { accessed: searchVal, newRoot: searchVal, amortized: "O(log n)" },
    });

    return steps;
  },
};

// ── Fibonacci Heap ────────────────────────────────────────────────────────────
export const fibonacciHeapModule: VisualizationModule<number[]> = {
  id: "ds-fibonacci-heap",
  slug: "fibonacci-heap",
  title: "Fibonacci Heap",
  category: ["data-structures", "heaps"],
  difficulty: "advanced",
  timeComplexity: "O(1) insert, O(log n) extract-min",
  spaceComplexity: "O(n)",
  description: "Lazy heap: O(1) amortized insert and decrease-key. Consolidation deferred until extract-min. Enables optimal Dijkstra.",
  pythonCode: `class FibNode:
    def __init__(self, val):
        self.val = val
        self.degree = 0
        self.marked = False
        self.parent = self.child = None
        self.left = self.right = self  # circular DLL

class FibonacciHeap:
    def __init__(self):
        self.min_node = None
        self.total = 0

    def insert(self, val):           # O(1) amortized
        node = FibNode(val)
        self._add_to_root(node)
        if not self.min_node or node.val < self.min_node.val:
            self.min_node = node
        self.total += 1

    def extract_min(self):           # O(log n) amortized
        z = self.min_node
        if z:
            # Move all children to root list
            child = z.child
            if child:
                kids = []
                cur = child
                while True:
                    kids.append(cur); cur = cur.right
                    if cur is child: break
                for k in kids: self._add_to_root(k)
            self._remove_from_root(z)
            if z is z.right:
                self.min_node = None
            else:
                self.min_node = z.right
                self._consolidate()
            self.total -= 1
        return z.val if z else None

    def decrease_key(self, node, val):  # O(1) amortized
        node.val = val
        if node.parent and node.val < node.parent.val:
            self._cut(node)
            self._cascading_cut(node.parent)
        if node.val < self.min_node.val:
            self.min_node = node`,
  codeSteps: [],
  defaultInput: [3, 7, 1, 9, 2, 5, 8],
  generateSteps(input) {
    const vals = input ?? [3, 7, 1, 9, 2, 5, 8];
    const steps: AnimationStep[] = [];

    steps.push({
      stepNumber: 1,
      description: "Fibonacci Heap: lazy root list. insert=O(1) (no restructuring). extract-min triggers consolidation by tree degree.",
      highlightLines: [14, 15, 16],
      visualState: { type: "array1d", cells: [{ val: "min=∞", state: "default" as const }], label: "Root list (empty)" },
      variables: { total: 0, minNode: "∞" },
    });

    const rootList: number[] = [];
    let minVal = Infinity;

    for (const v of vals) {
      rootList.push(v);
      if (v < minVal) minVal = v;
      steps.push({
        stepNumber: steps.length + 1,
        description: `insert(${v}): O(1) — append to root list. Update min → ${minVal}.`,
        highlightLines: [14, 15, 16, 17],
        visualState: {
          type: "array1d",
          cells: rootList.map((k) => ({
            val: k,
            state: k === minVal ? "highlighted" as const : k === v ? "active" as const : "computed" as const,
          })),
          label: `Root list (min=${minVal}, size=${rootList.length})`,
        },
        variables: { inserted: v, rootListSize: rootList.length, min: minVal },
      });
    }

    const extracted = minVal;
    const remaining = rootList.filter((v) => v !== extracted);
    const newMin = remaining.length ? Math.min(...remaining) : Infinity;

    steps.push({
      stepNumber: steps.length + 1,
      description: `extract_min()=${extracted}: remove, promote children to root list, consolidate (merge equal-degree trees). New min=${newMin}. O(log n) amortized.`,
      highlightLines: [21, 22, 30, 33, 34],
      visualState: {
        type: "array1d",
        cells: [
          { val: `✓extracted:${extracted}`, state: "highlighted" as const },
          ...remaining.map((k) => ({
            val: k,
            state: k === newMin ? "active" as const : "default" as const,
          })),
        ],
        label: `After extract-min (new min=${newMin})`,
      },
      variables: { extracted, newMin, operation: "consolidate equal-degree trees" },
    });

    return steps;
  },
};

// ── Adjacency Matrix ──────────────────────────────────────────────────────────
export const adjacencyMatrixModule: VisualizationModule<null> = {
  id: "ds-adjacency-matrix",
  slug: "adjacency-matrix",
  title: "Adjacency Matrix",
  category: ["data-structures", "graphs-ds"],
  difficulty: "beginner",
  timeComplexity: "O(1) edge check",
  spaceComplexity: "O(V²)",
  description: "Graph stored as V×V boolean matrix. O(1) edge check but O(V²) space even for sparse graphs.",
  pythonCode: `class AdjacencyMatrix:
    def __init__(self, n):
        self.n = n
        self.matrix = [[0] * n for _ in range(n)]

    def add_edge(self, u, v, weight=1, directed=False):
        self.matrix[u][v] = weight
        if not directed:
            self.matrix[v][u] = weight

    def remove_edge(self, u, v, directed=False):
        self.matrix[u][v] = 0
        if not directed: self.matrix[v][u] = 0

    def has_edge(self, u, v):      # O(1)
        return self.matrix[u][v] != 0

    def neighbors(self, u):         # O(V)
        return [v for v in range(self.n) if self.matrix[u][v]]

g = AdjacencyMatrix(4)
g.add_edge(0, 1); g.add_edge(1, 2)
g.add_edge(2, 3); g.add_edge(0, 3)
print(g.matrix)`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const n = 4;
    const edges: [number, number][] = [[0, 1], [1, 2], [2, 3], [0, 3]];
    const labels = ["0", "1", "2", "3"];

    const makeMatrix = (edgeSet: [number, number][]) => {
      const m = Array.from({ length: n }, () => Array(n).fill(0));
      for (const [u, v] of edgeSet) { m[u][v] = 1; m[v][u] = 1; }
      return m;
    };

    steps.push({
      stepNumber: 1,
      description: `Adjacency Matrix: ${n}×${n} grid. matrix[u][v]=1 means edge u↔v. O(1) check, O(V²)=${n * n} cells total.`,
      highlightLines: [1, 2, 3],
      visualState: {
        type: "matrix",
        matrix: makeMatrix([]),
        rowLabels: labels,
        colLabels: labels,
        highlighted: [],
        active: [],
        title: "Empty adjacency matrix",
      },
      variables: { nodes: n, space: `O(V²)=${n * n}` },
    });

    for (let i = 0; i < edges.length; i++) {
      const [u, v] = edges[i];
      steps.push({
        stepNumber: steps.length + 1,
        description: `add_edge(${u},${v}): set [${u}][${v}]=1 and [${v}][${u}]=1 (undirected).`,
        highlightLines: [6, 7, 8],
        visualState: {
          type: "matrix",
          matrix: makeMatrix(edges.slice(0, i + 1)),
          rowLabels: labels,
          colLabels: labels,
          highlighted: [[u, v], [v, u]],
          active: [[u, v]],
          title: `After edge (${u},${v})`,
        },
        variables: { u, v, edgesAdded: i + 1 },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: "has_edge(1,2): matrix[1][2]=1 → true in O(1). Compare: adjacency list needs O(degree) scan.",
      highlightLines: [14, 15],
      visualState: {
        type: "matrix",
        matrix: makeMatrix(edges),
        rowLabels: labels,
        colLabels: labels,
        highlighted: [[1, 2]],
        active: [[1, 2]],
        title: "has_edge(1,2) = 1 ✓",
      },
      variables: { query: "has_edge(1,2)", result: 1, time: "O(1)" },
    });

    return steps;
  },
};

// ── Edge List ─────────────────────────────────────────────────────────────────
export const edgeListModule: VisualizationModule<null> = {
  id: "ds-edge-list",
  slug: "edge-list",
  title: "Edge List",
  category: ["data-structures", "graphs-ds"],
  difficulty: "beginner",
  timeComplexity: "O(E) edge check",
  spaceComplexity: "O(E)",
  description: "Simplest graph representation: list of (u,v,weight) tuples. Compact for sparse graphs; sorting enables Kruskal's MST.",
  pythonCode: `class EdgeList:
    def __init__(self):
        self.edges = []

    def add_edge(self, u, v, weight=1):
        self.edges.append((u, v, weight))  # O(1)

    def has_edge(self, u, v):           # O(E) scan
        return any(e[0]==u and e[1]==v for e in self.edges)

    def neighbors(self, u):             # O(E)
        return [(e[1], e[2]) for e in self.edges if e[0]==u]

    def sort_by_weight(self):           # for Kruskal's
        self.edges.sort(key=lambda e: e[2])

g = EdgeList()
g.add_edge(0, 1, 4); g.add_edge(0, 2, 1)
g.add_edge(1, 2, 2); g.add_edge(1, 3, 5)
g.sort_by_weight()
print(g.edges)  # sorted by weight`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const edges: [number, number, number][] = [[0, 1, 4], [0, 2, 1], [1, 2, 2], [1, 3, 5], [2, 3, 3]];

    steps.push({
      stepNumber: 1,
      description: "Edge List: each edge = (u, v, weight) tuple. Simplest representation. O(E) space. Useful for Kruskal's after sorting.",
      highlightLines: [1, 2],
      visualState: { type: "array1d", cells: [{ val: "[]", state: "default" as const }], label: "Edge list" },
      variables: { edges: 0 },
    });

    const added: [number, number, number][] = [];
    for (const [u, v, w] of edges) {
      added.push([u, v, w]);
      steps.push({
        stepNumber: steps.length + 1,
        description: `add_edge(${u},${v},${w}): append tuple. O(1).`,
        highlightLines: [5, 6],
        visualState: {
          type: "array1d",
          cells: added.map(([a, b, c]) => ({
            val: `(${a},${b},${c})`,
            state: a === u && b === v ? "active" as const : "default" as const,
          })),
          label: "Edge list",
        },
        variables: { u, v, weight: w, total: added.length },
      });
    }

    const sorted = [...added].sort((a, b) => a[2] - b[2]);
    steps.push({
      stepNumber: steps.length + 1,
      description: "sort_by_weight(): O(E log E). Now Kruskal's can greedily pick cheapest safe edges for MST.",
      highlightLines: [13, 14],
      visualState: {
        type: "array1d",
        cells: sorted.map(([a, b, c]) => ({ val: `(${a},${b},${c})`, state: "computed" as const })),
        label: "Sorted by weight (Kruskal ready)",
      },
      variables: { sorted: sorted.map(([a, b, c]) => `(${a},${b},${c})`).join(" | ") },
    });

    return steps;
  },
};

// ── LFU Cache ─────────────────────────────────────────────────────────────────
export const lfuCacheModule: VisualizationModule<null> = {
  id: "ds-lfu-cache",
  slug: "lfu-cache",
  title: "LFU Cache",
  category: ["data-structures", "advanced-ds"],
  difficulty: "advanced",
  timeComplexity: "O(1)",
  spaceComplexity: "O(capacity)",
  description: "Least Frequently Used cache: evicts item with fewest total accesses. Ties broken by LRU (insertion) order.",
  pythonCode: `from collections import defaultdict, OrderedDict

class LFUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.key_val = {}
        self.key_freq = {}
        self.freq_keys = defaultdict(OrderedDict)
        self.min_freq = 0

    def _update(self, key):
        f = self.key_freq[key]
        self.key_freq[key] = f + 1
        del self.freq_keys[f][key]
        if not self.freq_keys[f] and f == self.min_freq:
            self.min_freq += 1
        self.freq_keys[f + 1][key] = None

    def get(self, key):             # O(1)
        if key not in self.key_val: return -1
        self._update(key)
        return self.key_val[key]

    def put(self, key, val):        # O(1)
        if self.capacity <= 0: return
        if key in self.key_val:
            self.key_val[key] = val; self._update(key); return
        if len(self.key_val) >= self.capacity:
            evict = next(iter(self.freq_keys[self.min_freq]))
            del self.freq_keys[self.min_freq][evict]
            del self.key_val[evict]; del self.key_freq[evict]
        self.key_val[key] = val
        self.key_freq[key] = 1
        self.freq_keys[1][key] = None
        self.min_freq = 1`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const cap = 3;
    const ops: Array<{ op: "put" | "get"; key: number; val?: number }> = [
      { op: "put", key: 1, val: 10 }, { op: "put", key: 2, val: 20 },
      { op: "put", key: 3, val: 30 }, { op: "get", key: 1 },
      { op: "get", key: 1 }, { op: "get", key: 2 },
      { op: "put", key: 4, val: 40 }, { op: "get", key: 3 },
    ];

    steps.push({
      stepNumber: 1,
      description: `LFU Cache (capacity=${cap}): evict item with LOWEST access frequency. Ties → LRU order.`,
      highlightLines: [3, 4],
      visualState: { type: "array1d", cells: [{ val: "empty", state: "default" as const }], label: `LFU Cache (cap=${cap})` },
      variables: { capacity: cap, size: 0 },
    });

    const cache = new Map<number, { val: number; freq: number }>();

    for (const op of ops) {
      if (op.op === "put" && op.val !== undefined) {
        if (cache.size >= cap && !cache.has(op.key)) {
          let minFreq = Infinity; let evictKey = -1;
          for (const [k, { freq }] of cache) { if (freq < minFreq) { minFreq = freq; evictKey = k; } }
          cache.delete(evictKey);
          steps.push({
            stepNumber: steps.length + 1,
            description: `Cache full. Evict key=${evictKey} (freq=${minFreq}, LFU). Insert key=${op.key}.`,
            highlightLines: [26, 27, 28, 29],
            visualState: {
              type: "array1d",
              cells: [{ val: `EVICT k${evictKey}`, state: "highlighted" as const },
                ...Array.from(cache.entries()).map(([k, { val, freq }]) => ({
                  val: `k${k}:${val}(f${freq})`, state: "default" as const,
                }))],
              label: "Eviction",
            },
            variables: { evicted: evictKey, freq: minFreq },
          });
        }
        const ex = cache.get(op.key);
        cache.set(op.key, { val: op.val, freq: ex ? ex.freq + 1 : 1 });
        steps.push({
          stepNumber: steps.length + 1,
          description: `put(${op.key},${op.val}): ${ex ? `update, freq++ → ${ex.freq + 1}` : "new, freq=1"}.`,
          highlightLines: [23, 24, 30, 31, 32, 33],
          visualState: {
            type: "array1d",
            cells: Array.from(cache.entries()).map(([k, { val, freq }]) => ({
              val: `k${k}:${val}(f${freq})`,
              state: k === op.key ? "active" as const : "default" as const,
            })),
            label: "LFU Cache",
          },
          variables: { key: op.key, val: op.val, freq: cache.get(op.key)!.freq },
        });
      } else if (op.op === "get") {
        const entry = cache.get(op.key);
        if (entry) {
          entry.freq++;
          steps.push({
            stepNumber: steps.length + 1,
            description: `get(${op.key}) → ${entry.val}. freq++ → ${entry.freq}.`,
            highlightLines: [19, 20],
            visualState: {
              type: "array1d",
              cells: Array.from(cache.entries()).map(([k, { val, freq }]) => ({
                val: `k${k}:${val}(f${freq})`,
                state: k === op.key ? "computed" as const : "default" as const,
              })),
              label: "LFU Cache",
            },
            variables: { key: op.key, value: entry.val, newFreq: entry.freq },
          });
        } else {
          steps.push({
            stepNumber: steps.length + 1,
            description: `get(${op.key}) → MISS (-1). Was evicted.`,
            highlightLines: [19],
            visualState: {
              type: "array1d",
              cells: Array.from(cache.entries()).map(([k, { val, freq }]) => ({
                val: `k${k}:${val}(f${freq})`, state: "default" as const,
              })),
              label: `MISS: key ${op.key}`,
            },
            variables: { key: op.key, result: -1 },
          });
        }
      }
    }

    return steps;
  },
};

// ── LSM Tree ──────────────────────────────────────────────────────────────────
export const lsmTreeModule: VisualizationModule<null> = {
  id: "ds-lsm-tree",
  slug: "lsm-tree",
  title: "LSM Tree",
  category: ["data-structures", "advanced-ds"],
  difficulty: "advanced",
  timeComplexity: "O(1) write (amortized)",
  spaceComplexity: "O(n)",
  description: "Log-Structured Merge Tree: writes to MemTable, flushed as sorted SSTables. Used in Cassandra, RocksDB, LevelDB.",
  pythonCode: `class MemTable:
    def __init__(self, max_size=4):
        self.data = {}
        self.max_size = max_size

    def put(self, key, val): self.data[key] = val
    def get(self, key): return self.data.get(key)
    def is_full(self): return len(self.data) >= self.max_size
    def flush(self):
        result = sorted(self.data.items())
        self.data = {}
        return result

class SSTable:
    def __init__(self, data): self.data = dict(data)

class LSMTree:
    def __init__(self):
        self.memtable = MemTable()
        self.sstables = []

    def put(self, key, val):
        self.memtable.put(key, val)
        if self.memtable.is_full():
            flushed = self.memtable.flush()
            self.sstables.append(SSTable(flushed))

    def get(self, key):
        val = self.memtable.get(key)
        if val is not None: return val
        for sst in reversed(self.sstables):
            if key in sst.data: return sst.data[key]
        return None`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const writes = [
      { k: "a", v: 1 }, { k: "c", v: 2 }, { k: "b", v: 3 }, { k: "e", v: 4 },
      { k: "d", v: 5 }, { k: "f", v: 6 }, { k: "a", v: 7 }, { k: "g", v: 8 },
    ];
    const maxSize = 4;

    steps.push({
      stepNumber: 1,
      description: "LSM Tree: writes to in-memory MemTable (O(1)). When full → flush sorted SSTable to disk. Reads: MemTable first, then SSTables newest→oldest.",
      highlightLines: [17, 18, 19],
      visualState: {
        type: "array1d",
        cells: [{ val: "MemTable:[]", state: "active" as const }, { val: "SSTables:0", state: "default" as const }],
        label: "LSM Tree",
      },
      variables: { memSize: 0, sstables: 0 },
    });

    const mem: Record<string, number> = {};
    const sstables: Array<string> = [];

    for (const { k, v } of writes) {
      mem[k] = v;
      steps.push({
        stepNumber: steps.length + 1,
        description: `put(${k},${v}) → MemTable. O(1). Size: ${Object.keys(mem).length}/${maxSize}.`,
        highlightLines: [21, 22],
        visualState: {
          type: "array1d",
          cells: [
            ...Object.entries(mem).sort(([a], [b]) => a.localeCompare(b)).map(([key, val]) => ({
              val: `${key}:${val}`,
              state: key === k ? "active" as const : "default" as const,
            })),
            ...(sstables.length > 0 ? [{ val: `| SST×${sstables.length}`, state: "computed" as const }] : []),
          ],
          label: `MemTable (${Object.keys(mem).length}/${maxSize})`,
        },
        variables: { key: k, value: v, memSize: Object.keys(mem).length },
      });

      if (Object.keys(mem).length >= maxSize) {
        const sorted = Object.entries(mem).sort(([a], [b]) => a.localeCompare(b));
        const label = sorted.map(([k2, v2]) => `${k2}:${v2}`).join(",");
        sstables.push(label);
        Object.keys(mem).forEach((key) => delete mem[key]);

        steps.push({
          stepNumber: steps.length + 1,
          description: `MemTable full! Flush → SSTable #${sstables.length}: [${label}] (sorted). MemTable cleared.`,
          highlightLines: [23, 24, 25],
          visualState: {
            type: "array1d",
            cells: [
              { val: `SST${sstables.length}:[${label}]`, state: "computed" as const },
              { val: "MemTable:[]", state: "active" as const },
            ],
            label: `Flushed to SSTable #${sstables.length}`,
          },
          variables: { flushed: label, sstableCount: sstables.length },
        });
      }
    }

    return steps;
  },
};

// ── Rope (String DS) ──────────────────────────────────────────────────────────
export const ropeDsModule: VisualizationModule<null> = {
  id: "ds-rope-ds",
  slug: "rope-ds",
  title: "Rope (String DS)",
  category: ["data-structures", "advanced-ds"],
  difficulty: "advanced",
  timeComplexity: "O(log n) index/concat",
  spaceComplexity: "O(n)",
  description: "Binary tree for large string ops: O(log n) index, concat, split. Used in text editors for efficient large-text manipulation.",
  pythonCode: `class RopeNode:
    def __init__(self, val=""):
        self.val = val           # non-empty only at leaves
        self.left = self.right = None
        self.weight = len(val)   # length of left subtree (internal nodes)

class Rope:
    def __init__(self, s=""):
        self.root = self._build(s)

    def _build(self, s):
        if len(s) <= 4:
            return RopeNode(s)
        mid = len(s) // 2
        node = RopeNode()
        node.left = self._build(s[:mid])
        node.right = self._build(s[mid:])
        node.weight = mid
        return node

    def index(self, i):              # O(log n)
        return self._index(self.root, i)

    def _index(self, node, i):
        if not node: return ''
        if node.val: return node.val[i]   # leaf
        if i < node.weight:
            return self._index(node.left, i)
        return self._index(node.right, i - node.weight)

    def concat(self, other):         # O(1)
        new_root = RopeNode()
        new_root.left = self.root
        new_root.right = other.root
        new_root.weight = self._len(self.root)
        self.root = new_root`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const str = "Hello, World!";

    steps.push({
      stepNumber: 1,
      description: `Build Rope for "${str}": split at midpoints recursively. Internal nodes store weight=left-subtree length.`,
      highlightLines: [8, 9],
      visualState: {
        type: "tree",
        nodes: [{ id: 0, label: `"${str}"`, x: 250, y: 50 }],
        highlighted: [0], comparing: [], inserted: [0], found: [],
      },
      variables: { string: str, length: str.length },
    });

    const mid1 = Math.floor(str.length / 2);
    const left = str.slice(0, mid1);
    const right = str.slice(mid1);
    const mid2 = Math.floor(left.length / 2);
    const ll = left.slice(0, mid2);
    const lr = left.slice(mid2);

    const nodes = [
      { id: 0, label: `w=${mid1}`, x: 250, y: 50, left: 1, right: 2 },
      { id: 1, label: `w=${mid2}`, x: 150, y: 130, left: 3, right: 4 },
      { id: 2, label: `"${right}"`, x: 380, y: 130 },
      { id: 3, label: `"${ll}"`, x: 90, y: 210 },
      { id: 4, label: `"${lr}"`, x: 220, y: 210 },
    ];

    steps.push({
      stepNumber: 2,
      description: `Rope built: root weight=${mid1}. Left subtree: "${ll}"+"${lr}"="${left}". Right leaf: "${right}".`,
      highlightLines: [11, 12, 13, 14, 15, 16, 17],
      visualState: {
        type: "tree",
        nodes,
        highlighted: [0], comparing: [1, 2], inserted: [0, 1, 2, 3, 4], found: [],
      },
      variables: { rootWeight: mid1, leftStr: left, rightStr: right },
    });

    const qi = 7;
    const qChar = str[qi];
    steps.push({
      stepNumber: 3,
      description: `index(${qi}) → '${qChar}': root.weight=${mid1}, ${qi}≥${mid1} → right, i=${qi - mid1}. Leaf "${right}"[${qi - mid1}]='${qChar}'. O(log n).`,
      highlightLines: [22, 23, 26, 27],
      visualState: {
        type: "tree",
        nodes,
        highlighted: [2], comparing: [0], inserted: [0, 1, 2, 3, 4], found: [2],
      },
      variables: { query: `index(${qi})`, rightIndex: qi - mid1, result: qChar },
    });

    const str2 = " !!";
    steps.push({
      stepNumber: 4,
      description: `concat("${str2}"): new root wraps current rope + new leaf. O(1) — one node creation! Final: "${str}${str2}"`,
      highlightLines: [29, 30, 31, 32, 33],
      visualState: {
        type: "tree",
        nodes: [
          { id: 10, label: `w=${str.length}`, x: 250, y: 20, left: 0, right: 20 },
          ...nodes,
          { id: 20, label: `"${str2}"`, x: 460, y: 80 },
        ],
        highlighted: [10], comparing: [20], inserted: [10, 0, 1, 2, 3, 4, 20], found: [],
      },
      variables: { appended: str2, cost: "O(1)", totalLen: str.length + str2.length },
    });

    return steps;
  },
};
