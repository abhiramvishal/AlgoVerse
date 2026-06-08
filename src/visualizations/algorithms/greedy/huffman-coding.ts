import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `import heapq

def huffman_coding(chars, freqs):
    heap = [(f, i, c, None, None) for i, (c, f) in enumerate(zip(chars, freqs))]
    heapq.heapify(heap)
    while len(heap) > 1:
        f1, _, c1, l1, r1 = heapq.heappop(heap)
        f2, _, c2, l2, r2 = heapq.heappop(heap)
        merged = (f1+f2, id({}), c1+c2, (f1,c1,l1,r1), (f2,c2,l2,r2))
        heapq.heappush(heap, merged)
    return heap[0]`;

interface HuffInput {
  chars: string[];
  freqs: number[];
}

interface HuffNode {
  id: string | number;
  label: string;
  x: number;
  y: number;
  left?: string | number | null;
  right?: string | number | null;
}

export const huffmanCodingModule: VisualizationModule<HuffInput> = {
  id: "greedy-huffman-coding",
  slug: "huffman-coding",
  title: "Huffman Coding",
  category: ["algorithms", "greedy"],
  difficulty: "intermediate",
  timeComplexity: "O(n log n)",
  spaceComplexity: "O(n)",
  description: "Builds an optimal prefix-free code by greedily merging the two lowest-frequency nodes.",
  relatedTopics: ["activity-selection", "priority-queue"],
  pythonCode,
  codeSteps: [],
  defaultInput: { chars: ["a", "b", "c", "d", "e"], freqs: [5, 9, 12, 13, 16] },
  generateSteps(input) {
    const { chars, freqs } = input ?? { chars: ["a", "b", "c", "d", "e"], freqs: [5, 9, 12, 13, 16] };
    const steps: AnimationStep[] = [];

    interface QNode {
      id: number;
      freq: number;
      label: string;
      left?: number;
      right?: number;
    }

    let idCounter = 0;
    const allNodes: QNode[] = [];

    // Initial leaf nodes
    const queue: QNode[] = chars.map((c, i) => {
      const node: QNode = { id: idCounter++, freq: freqs[i], label: `${c}:${freqs[i]}` };
      allNodes.push(node);
      return node;
    });

    function layoutNodes(nodeList: QNode[]): HuffNode[] {
      // Simple flat layout for visualization
      const result: HuffNode[] = [];
      const nodeMap = new Map(nodeList.map((n) => [n.id, n]));

      function layout(id: number, x: number, y: number, spread: number) {
        const n = nodeMap.get(id);
        if (!n) return;
        result.push({ id: n.id, label: n.label, x, y, left: n.left, right: n.right });
        if (n.left !== undefined) layout(n.left, x - spread, y + 60, spread / 2);
        if (n.right !== undefined) layout(n.right, x + spread, y + 60, spread / 2);
      }

      // Find root (last added node that isn't a child of anyone)
      const childIds = new Set<number>();
      for (const n of nodeList) {
        if (n.left !== undefined) childIds.add(n.left);
        if (n.right !== undefined) childIds.add(n.right);
      }
      const roots = nodeList.filter((n) => !childIds.has(n.id));
      let startX = 60;
      for (const root of roots) {
        layout(root.id, startX, 30, 80);
        startX += 200;
      }
      return result;
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Huffman Coding: chars=${chars.join(",")}, freqs=${freqs.join(",")}. Initialize priority queue.`,
      highlightLines: [3, 4],
      visualState: { type: "tree", nodes: layoutNodes([...allNodes]), highlighted: [], comparing: undefined },
      variables: { queueFreqs: queue.map((n) => `${n.label}`).join(", ") },
    });

    while (queue.length > 1) {
      queue.sort((a, b) => a.freq - b.freq);

      const n1 = queue.shift()!;
      const n2 = queue.shift()!;

      steps.push({
        stepNumber: steps.length + 1,
        description: `Pop two smallest: "${n1.label}" (freq=${n1.freq}) and "${n2.label}" (freq=${n2.freq}).`,
        highlightLines: [6, 7],
        visualState: { type: "tree", nodes: layoutNodes([...allNodes]), highlighted: [n1.id, n2.id], comparing: n1.id },
        variables: { n1: n1.label, n2: n2.label, mergedFreq: n1.freq + n2.freq },
      });

      const merged: QNode = {
        id: idCounter++,
        freq: n1.freq + n2.freq,
        label: `*:${n1.freq + n2.freq}`,
        left: n1.id,
        right: n2.id,
      };
      allNodes.push(merged);
      queue.push(merged);

      steps.push({
        stepNumber: steps.length + 1,
        description: `Merge into new node "${merged.label}". Push to queue. Queue size: ${queue.length}.`,
        highlightLines: [8, 9],
        visualState: { type: "tree", nodes: layoutNodes([...allNodes]), highlighted: [merged.id], comparing: merged.id },
        variables: { merged: merged.label, queueSize: queue.length },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Huffman tree complete! Root frequency = ${queue[0].freq} (total).`,
      highlightLines: [10],
      visualState: { type: "tree", nodes: layoutNodes([...allNodes]), highlighted: [queue[0].id], comparing: undefined },
      variables: { rootFreq: queue[0].freq },
    });

    return steps;
  },
};
