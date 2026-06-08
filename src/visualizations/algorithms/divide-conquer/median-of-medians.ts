import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type MedianOfMediansInput = { arr: number[]; k: number };

const pythonCode = `def median_of_medians(arr, k):
    if len(arr) <= 5:
        return sorted(arr)[k-1]
    chunks = [arr[i:i+5] for i in range(0, len(arr), 5)]
    medians = [sorted(c)[len(c)//2] for c in chunks]
    pivot = median_of_medians(medians, len(medians)//2 + 1)
    low = [x for x in arr if x < pivot]
    high = [x for x in arr if x > pivot]
    if k <= len(low):
        return median_of_medians(low, k)
    elif k > len(low) + 1:
        return median_of_medians(high, k - len(low) - 1)
    return pivot`;

export const medianOfMediansModule: VisualizationModule<MedianOfMediansInput> = {
  id: "divide-conquer-median-of-medians",
  slug: "median-of-medians",
  title: "Median of Medians",
  category: ["algorithms", "divide-conquer"],
  difficulty: "advanced",
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)",
  description:
    "Find the kth smallest element in linear time using median-of-medians pivot selection.",
  relatedTopics: ["quick-sort", "karatsuba"],
  pythonCode,
  codeSteps: [],
  defaultInput: { arr: [3, 2, 1, 5, 6, 4, 9, 8, 7, 10], k: 4 },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const arr = [...input.arr];
    const k = input.k;

    function addStep(desc: string, lines: number[], current: number[], active: number[] = [], sorted: number[] = []) {
      steps.push({
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: lines,
        visualState: { array: current, active, sorted, pivotIndex: -1 },
        variables: { k, n: current.length },
      });
    }

    addStep(`Find ${k}th smallest in [${arr.join(",")}].`, [1], arr);

    // Split into chunks of 5
    const chunks: number[][] = [];
    for (let i = 0; i < arr.length; i += 5) {
      chunks.push(arr.slice(i, i + 5));
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Split into groups of 5: ${chunks.map((c) => `[${c.join(",")}]`).join(" | ")}`,
      highlightLines: [3],
      visualState: { array: arr, active: [], sorted: [], pivotIndex: -1 },
      variables: { groups: chunks },
    });

    // Find medians
    const medians = chunks.map((c) => {
      const sorted = [...c].sort((a, b) => a - b);
      return sorted[Math.floor(sorted.length / 2)];
    });

    steps.push({
      stepNumber: steps.length + 1,
      description: `Medians of each group: [${medians.join(",")}]`,
      highlightLines: [4],
      visualState: {
        array: arr,
        active: medians.map((m) => arr.indexOf(m)),
        sorted: [],
        pivotIndex: -1,
      },
      variables: { medians },
    });

    const mediansArr = [...medians].sort((a, b) => a - b);
    const pivot = mediansArr[Math.floor(mediansArr.length / 2)];
    const pivotIndex = arr.indexOf(pivot);

    steps.push({
      stepNumber: steps.length + 1,
      description: `Pivot = median of medians = ${pivot}.`,
      highlightLines: [5],
      visualState: { array: arr, active: [], sorted: [], pivotIndex },
      variables: { pivot },
    });

    const low = arr.filter((x) => x < pivot);
    const high = arr.filter((x) => x > pivot);

    steps.push({
      stepNumber: steps.length + 1,
      description: `Partition around pivot ${pivot}: low=[${low.join(",")}], high=[${high.join(",")}].`,
      highlightLines: [6, 7],
      visualState: {
        array: [...low, pivot, ...high],
        active: [low.length],
        sorted: low.map((_, i) => i),
        pivotIndex: low.length,
      },
      variables: { low, pivot, high, k },
    });

    let result: number;
    if (k <= low.length) {
      result = [...low].sort((a, b) => a - b)[k - 1];
      steps.push({
        stepNumber: steps.length + 1,
        description: `k=${k} ≤ |low|=${low.length}. Recurse in low=[${low.join(",")}].`,
        highlightLines: [8, 9],
        visualState: { array: low, active: [], sorted: [], pivotIndex: -1 },
        variables: { recursing: "low", k },
      });
    } else if (k > low.length + 1) {
      const newK = k - low.length - 1;
      result = [...high].sort((a, b) => a - b)[newK - 1];
      steps.push({
        stepNumber: steps.length + 1,
        description: `k=${k} > |low|+1=${low.length + 1}. Recurse in high=[${high.join(",")}] with k=${newK}.`,
        highlightLines: [10, 11],
        visualState: { array: high, active: [], sorted: [], pivotIndex: -1 },
        variables: { recursing: "high", newK },
      });
    } else {
      result = pivot;
      steps.push({
        stepNumber: steps.length + 1,
        description: `k=${k} equals pivot rank. Pivot ${pivot} is the answer!`,
        highlightLines: [12],
        visualState: { array: arr, active: [pivotIndex], sorted: [], pivotIndex },
        variables: { result: pivot },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `The ${k}th smallest element is ${result}.`,
      highlightLines: [12],
      visualState: {
        array: [...arr].sort((a, b) => a - b),
        active: [k - 1],
        sorted: Array.from({ length: k - 1 }, (_, i) => i),
        pivotIndex: k - 1,
      },
      variables: { result, k },
    });

    return steps;
  },
};
