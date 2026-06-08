import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `class AVLNode:
    def __init__(self, key):
        self.key = key
        self.left = self.right = None
        self.height = 1

class AVLTree:
    def height(self, node):
        return node.height if node else 0

    def balance_factor(self, node):
        return self.height(node.left) - self.height(node.right)

    def right_rotate(self, z):
        y = z.left; T3 = y.right
        y.right = z; z.left = T3
        z.height = 1 + max(self.height(z.left), self.height(z.right))
        y.height = 1 + max(self.height(y.left), self.height(y.right))
        return y

    def left_rotate(self, z):
        y = z.right; T2 = y.left
        y.left = z; z.right = T2
        z.height = 1 + max(self.height(z.left), self.height(z.right))
        y.height = 1 + max(self.height(y.left), self.height(y.right))
        return y

    def insert(self, node, key):
        if not node: return AVLNode(key)
        if key < node.key: node.left = self.insert(node.left, key)
        elif key > node.key: node.right = self.insert(node.right, key)
        else: return node
        node.height = 1 + max(self.height(node.left), self.height(node.right))
        bf = self.balance_factor(node)
        if bf > 1 and key < node.left.key: return self.right_rotate(node)   # LL
        if bf < -1 and key > node.right.key: return self.left_rotate(node)  # RR
        if bf > 1 and key > node.left.key:   # LR
            node.left = self.left_rotate(node.left); return self.right_rotate(node)
        if bf < -1 and key < node.right.key: # RL
            node.right = self.right_rotate(node.right); return self.left_rotate(node)
        return node`;

interface AVLNode {
  key: number;
  left: AVLNode | null;
  right: AVLNode | null;
  height: number;
}

function nodeHeight(n: AVLNode | null): number {
  return n ? n.height : 0;
}

function bf(n: AVLNode): number {
  return nodeHeight(n.left) - nodeHeight(n.right);
}

function updateHeight(n: AVLNode) {
  n.height = 1 + Math.max(nodeHeight(n.left), nodeHeight(n.right));
}

function rotateRight(z: AVLNode): AVLNode {
  const y = z.left!;
  z.left = y.right;
  y.right = z;
  updateHeight(z);
  updateHeight(y);
  return y;
}

function rotateLeft(z: AVLNode): AVLNode {
  const y = z.right!;
  z.right = y.left;
  y.left = z;
  updateHeight(z);
  updateHeight(y);
  return y;
}

function insertAVL(node: AVLNode | null, key: number): { root: AVLNode; rotation: string } {
  if (!node) return { root: { key, left: null, right: null, height: 1 }, rotation: "" };
  if (key < node.key) {
    const r = insertAVL(node.left, key);
    node.left = r.root;
  } else if (key > node.key) {
    const r = insertAVL(node.right, key);
    node.right = r.root;
  } else return { root: node, rotation: "" };

  updateHeight(node);
  const b = bf(node);
  let rotation = "";

  if (b > 1 && key < node.left!.key) { rotation = "LL"; return { root: rotateRight(node), rotation }; }
  if (b < -1 && key > node.right!.key) { rotation = "RR"; return { root: rotateLeft(node), rotation }; }
  if (b > 1 && key > node.left!.key) {
    rotation = "LR";
    node.left = rotateLeft(node.left!);
    return { root: rotateRight(node), rotation };
  }
  if (b < -1 && key < node.right!.key) {
    rotation = "RL";
    node.right = rotateRight(node.right!);
    return { root: rotateLeft(node), rotation };
  }
  return { root: node, rotation };
}

let idGen = 0;
function treeToNodes(
  node: AVLNode | null,
  x: number,
  y: number,
  spread: number,
): { id: number; label: string; x: number; y: number; left?: number; right?: number }[] {
  if (!node) return [];
  const id = idGen++;
  const left = node.left ? treeToNodes(node.left, x - spread, y + 60, spread / 2) : [];
  const right = node.right ? treeToNodes(node.right, x + spread, y + 60, spread / 2) : [];
  const entry: { id: number; label: string; x: number; y: number; left?: number; right?: number } = {
    id,
    label: String(node.key),
    x,
    y,
  };
  if (left.length) entry.left = left[0].id;
  if (right.length) entry.right = right[0].id;
  return [entry, ...left, ...right];
}

export const avlTreeModule: VisualizationModule<number[]> = {
  id: "data-structures-trees-avl-tree",
  slug: "avl-tree",
  title: "AVL Tree",
  category: ["data-structures", "trees"],
  difficulty: "advanced",
  timeComplexity: "O(log n) insert/search",
  spaceComplexity: "O(n)",
  description: "Self-balancing BST that maintains balance factor ≤ 1 via LL/RR/LR/RL rotations.",
  relatedTopics: ["trie", "segment-tree"],
  pythonCode,
  codeSteps: [],
  defaultInput: [10, 20, 30, 40, 50, 25],
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    let root: AVLNode | null = null;

    steps.push({
      stepNumber: steps.length + 1,
      description: "Initialize empty AVL tree.",
      highlightLines: [7, 8],
      visualState: { type: "tree", nodes: [], highlighted: [], comparing: [] },
      variables: { keys: input },
    });

    for (const key of input) {
      const result = insertAVL(root, key);
      const oldRoot = root;
      root = result.root;

      idGen = 0;
      const nodes = treeToNodes(root, 300, 40, 120);

      if (result.rotation) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Inserted ${key}. ${result.rotation} rotation applied to rebalance tree.`,
          highlightLines: result.rotation === "LL" ? [30] : result.rotation === "RR" ? [31] : result.rotation === "LR" ? [32, 33] : [34, 35],
          visualState: {
            type: "tree",
            nodes,
            highlighted: [],
            comparing: [],
            inserted: nodes.find((n) => n.label === String(key))?.id,
          },
          variables: { inserted: key, rotation: result.rotation, height: nodeHeight(root), bf: bf(root) },
        });
      } else {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Inserted ${key}. No rotation needed. Tree height = ${nodeHeight(root)}.`,
          highlightLines: [26, 27, 28],
          visualState: {
            type: "tree",
            nodes,
            highlighted: [],
            comparing: [],
            inserted: nodes.find((n) => n.label === String(key))?.id,
          },
          variables: { inserted: key, height: nodeHeight(root), bf: bf(root) },
        });
      }
      void oldRoot;
    }

    idGen = 0;
    const finalNodes = treeToNodes(root!, 300, 40, 120);
    steps.push({
      stepNumber: steps.length + 1,
      description: `AVL tree complete. Root=${root!.key}, Height=${nodeHeight(root)}.`,
      highlightLines: [],
      visualState: { type: "tree", nodes: finalNodes, highlighted: [], comparing: [] },
      variables: { root: root!.key, height: nodeHeight(root) },
    });

    return steps;
  },
};
