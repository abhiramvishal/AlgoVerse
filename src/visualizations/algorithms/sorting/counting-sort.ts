import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def counting_sort(arr):
    max_val = max(arr)
    count = [0] * (max_val + 1)
    for num in arr:
        count[num] += 1
    for i in range(1, len(count)):
        count[i] += count[i - 1]
    output = [0] * len(arr)
    for num in reversed(arr):
        output[count[num] - 1] = num
        count[num] -= 1
    return output`;

export const countingSortModule: VisualizationModule<number[]> = {
  id: "sorting-counting-sort",
  slug: "counting-sort",
  title: "Counting Sort",
  category: ["algorithms", "sorting"],
  difficulty: "intermediate",
  timeComplexity: "O(n + k)",
  spaceComplexity: "O(k)",
  description: "Sorts integers by counting occurrences, then reconstructing the sorted array.",
  relatedTopics: ["radix-sort", "bucket-sort"],
  pythonCode,
  codeSteps: [],
  defaultInput: [4, 2, 2, 8, 3, 3, 1],
  generateSteps(input) {
    const arr = [...input];
    const steps: AnimationStep[] = [];
    const n = arr.length;
    const maxVal = Math.max(...arr);

    steps.push({
      stepNumber: steps.length + 1,
      description: `Starting Counting Sort. Max value = ${maxVal}. Allocate count array of size ${maxVal + 1}.`,
      highlightLines: [1, 2],
      visualState: { array: [...arr], active: [], sorted: [] },
      variables: { maxVal, countSize: maxVal + 1 },
    });

    const count = new Array(maxVal + 1).fill(0);

    for (let i = 0; i < n; i++) {
      count[arr[i]]++;
      steps.push({
        stepNumber: steps.length + 1,
        description: `Count arr[${i}]=${arr[i]}. count[${arr[i]}] = ${count[arr[i]]}.`,
        highlightLines: [3, 4],
        visualState: { array: [...arr], active: [i], sorted: [] },
        variables: { i, val: arr[i], count: [...count] },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Count array built: ${count.join(", ")}. Computing prefix sums.`,
      highlightLines: [5, 6],
      visualState: { array: [...arr], active: [], sorted: [] },
      variables: { count: [...count], phase: "prefix sums" },
    });

    for (let i = 1; i <= maxVal; i++) {
      count[i] += count[i - 1];
      steps.push({
        stepNumber: steps.length + 1,
        description: `count[${i}] = count[${i}] + count[${i - 1}] = ${count[i]}.`,
        highlightLines: [6, 7],
        visualState: { array: [...arr], active: [], sorted: [] },
        variables: { i, countI: count[i], prefixCount: [...count] },
      });
    }

    const output = new Array(n).fill(0);

    steps.push({
      stepNumber: steps.length + 1,
      description: "Prefix sums complete. Building output array from right to left.",
      highlightLines: [8],
      visualState: { array: [...arr], active: [], sorted: [] },
      variables: { phase: "output reconstruction", output: [...output] },
    });

    for (let i = n - 1; i >= 0; i--) {
      const val = arr[i];
      const pos = count[val] - 1;
      output[pos] = val;
      count[val]--;
      steps.push({
        stepNumber: steps.length + 1,
        description: `Place arr[${i}]=${val} at output[${pos}]. count[${val}] → ${count[val]}.`,
        highlightLines: [9, 10, 11],
        visualState: { array: [...output], active: [pos], sorted: [] },
        variables: { i, val, pos, output: [...output] },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: "Counting Sort complete.",
      highlightLines: [12],
      visualState: { array: [...output], active: [], sorted: Array.from({ length: n }, (_, k) => k) },
      variables: { sorted: true },
    });

    return steps;
  },
};
