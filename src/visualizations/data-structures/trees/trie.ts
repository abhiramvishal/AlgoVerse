import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True

    def search(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return node.is_end`;

interface TrieNode {
  id: number;
  label: string;
  x: number;
  y: number;
  left?: number;
  right?: number;
  children: Record<string, number>;
  isEnd: boolean;
}

let nodeIdCounter = 0;

function buildTrieNodes(
  words: string[],
): { nodes: TrieNode[]; steps: { word: string; path: number[] }[] } {
  nodeIdCounter = 0;
  const nodes: TrieNode[] = [];
  const charToId: Map<string, number>[] = [];
  const steps: { word: string; path: number[] }[] = [];

  // root
  const root: TrieNode = { id: nodeIdCounter++, label: "*", x: 300, y: 40, children: {}, isEnd: false };
  nodes.push(root);
  charToId.push(new Map()); // level 0

  for (const word of words) {
    let cur = 0; // root id
    const path = [0];
    for (let d = 0; d < word.length; d++) {
      const ch = word[d];
      const key = `${cur}:${ch}`;
      // check if child exists
      const existing = nodes[cur].children[ch];
      if (existing === undefined) {
        const newId = nodeIdCounter++;
        const parentNode = nodes[cur];
        // place child — simple x spread
        const childCount = Object.keys(parentNode.children).length;
        const x = parentNode.x + (childCount - 1) * 60;
        const y = parentNode.y + 60;
        const newNode: TrieNode = { id: newId, label: ch, x, y, children: {}, isEnd: false };
        nodes.push(newNode);
        parentNode.children[ch] = newId;
        cur = newId;
      } else {
        cur = existing;
      }
      path.push(cur);
    }
    nodes[cur].isEnd = true;
    steps.push({ word, path });
    void key; // suppress unused warning
  }

  return { nodes, steps };
}

export const trieModule: VisualizationModule<{ words: string[] }> = {
  id: "data-structures-trees-trie",
  slug: "trie",
  title: "Trie (Prefix Tree)",
  category: ["data-structures", "trees"],
  difficulty: "intermediate",
  timeComplexity: "O(m) per operation (m = word length)",
  spaceComplexity: "O(n·m)",
  description: "A tree where each node represents a character; paths from root spell out words.",
  relatedTopics: ["avl-tree", "segment-tree"],
  pythonCode,
  codeSteps: [],
  defaultInput: { words: ["apple", "app", "apt", "bat", "ball"] },
  generateSteps(input) {
    const { words } = input;
    const steps: AnimationStep[] = [];

    // Build incrementally
    nodeIdCounter = 0;
    const allNodes: TrieNode[] = [];
    const root: TrieNode = { id: nodeIdCounter++, label: "*", x: 300, y: 40, children: {}, isEnd: false };
    allNodes.push(root);

    steps.push({
      stepNumber: steps.length + 1,
      description: "Initialize trie with root node (*).",
      highlightLines: [6, 7, 8],
      visualState: {
        type: "tree",
        nodes: [{ id: 0, label: "*", x: 300, y: 40 }],
        highlighted: [],
        comparing: [],
      },
      variables: { words },
    });

    for (const word of words) {
      let cur = 0;
      const path = [0];

      steps.push({
        stepNumber: steps.length + 1,
        description: `Insert "${word}": start at root.`,
        highlightLines: [10, 11],
        visualState: {
          type: "tree",
          nodes: allNodes.map((n) => ({
            id: n.id,
            label: n.label + (n.isEnd ? "✓" : ""),
            x: n.x,
            y: n.y,
            ...buildEdges(allNodes, n),
          })),
          highlighted: [0],
          comparing: [],
        },
        variables: { inserting: word },
      });

      let xOffset = 0;
      for (let d = 0; d < word.length; d++) {
        const ch = word[d];
        const existing = allNodes[cur].children[ch];
        if (existing === undefined) {
          const newId = nodeIdCounter++;
          const parentNode = allNodes[cur];
          const childCount = Object.keys(parentNode.children).length;
          xOffset = childCount * 60;
          const x = parentNode.x - 60 + xOffset;
          const y = parentNode.y + 60;
          const newNode: TrieNode = { id: newId, label: ch, x, y, children: {}, isEnd: false };
          allNodes.push(newNode);
          parentNode.children[ch] = newId;
          cur = newId;
          path.push(cur);

          steps.push({
            stepNumber: steps.length + 1,
            description: `Create node '${ch}' for "${word}"[${d}].`,
            highlightLines: [13, 14],
            visualState: {
              type: "tree",
              nodes: allNodes.map((n) => ({
                id: n.id,
                label: n.label + (n.isEnd ? "✓" : ""),
                x: n.x,
                y: n.y,
                ...buildEdges(allNodes, n),
              })),
              highlighted: path,
              comparing: [],
              inserted: newId,
            },
            variables: { char: ch, nodeId: newId },
          });
        } else {
          cur = existing;
          path.push(cur);
          steps.push({
            stepNumber: steps.length + 1,
            description: `Node '${ch}' exists at id=${cur}. Follow it.`,
            highlightLines: [12],
            visualState: {
              type: "tree",
              nodes: allNodes.map((n) => ({
                id: n.id,
                label: n.label + (n.isEnd ? "✓" : ""),
                x: n.x,
                y: n.y,
                ...buildEdges(allNodes, n),
              })),
              highlighted: path,
              comparing: [],
            },
            variables: { char: ch, existingId: cur },
          });
        }
      }

      allNodes[cur].isEnd = true;
      steps.push({
        stepNumber: steps.length + 1,
        description: `Mark node '${allNodes[cur].label}' as end of word "${word}".`,
        highlightLines: [15],
        visualState: {
          type: "tree",
          nodes: allNodes.map((n) => ({
            id: n.id,
            label: n.label + (n.isEnd ? "✓" : ""),
            x: n.x,
            y: n.y,
            ...buildEdges(allNodes, n),
          })),
          highlighted: [],
          comparing: [],
          found: cur,
        },
        variables: { word, endNode: cur },
      });
    }

    // search "app"
    const searchWord = "app";
    let cur = 0;
    const searchPath = [0];
    steps.push({
      stepNumber: steps.length + 1,
      description: `Search "${searchWord}": start at root.`,
      highlightLines: [17, 18],
      visualState: {
        type: "tree",
        nodes: allNodes.map((n) => ({
          id: n.id,
          label: n.label + (n.isEnd ? "✓" : ""),
          x: n.x,
          y: n.y,
          ...buildEdges(allNodes, n),
        })),
        highlighted: [0],
        comparing: [],
      },
      variables: { searching: searchWord },
    });

    let found = true;
    for (const ch of searchWord) {
      const next = allNodes[cur].children[ch];
      if (next === undefined) { found = false; break; }
      cur = next;
      searchPath.push(cur);
      steps.push({
        stepNumber: steps.length + 1,
        description: `Follow '${ch}' → node ${cur}.`,
        highlightLines: [20, 21],
        visualState: {
          type: "tree",
          nodes: allNodes.map((n) => ({
            id: n.id,
            label: n.label + (n.isEnd ? "✓" : ""),
            x: n.x,
            y: n.y,
            ...buildEdges(allNodes, n),
          })),
          highlighted: searchPath,
          comparing: [],
        },
        variables: { char: ch, cur },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: found
        ? `Found "${searchWord}" (isEnd=${allNodes[cur].isEnd}).`
        : `"${searchWord}" not in trie.`,
      highlightLines: [22],
      visualState: {
        type: "tree",
        nodes: allNodes.map((n) => ({
          id: n.id,
          label: n.label + (n.isEnd ? "✓" : ""),
          x: n.x,
          y: n.y,
          ...buildEdges(allNodes, n),
        })),
        highlighted: [],
        comparing: [],
        found: found ? cur : undefined,
      },
      variables: { word: searchWord, found, isEnd: allNodes[cur].isEnd },
    });

    return steps;
  },
};

function buildEdges(nodes: TrieNode[], n: TrieNode): { left?: number; right?: number } {
  const childIds = Object.values(n.children);
  if (childIds.length === 0) return {};
  if (childIds.length === 1) return { left: childIds[0] };
  return { left: childIds[0], right: childIds[childIds.length - 1] };
}
