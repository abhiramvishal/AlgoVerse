import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def next_greater_element(arr):
    n = len(arr)
    result = [-1] * n
    stack = []  # stores indices
    for i in range(n):
        while stack and arr[stack[-1]] < arr[i]:
            idx = stack.pop()
            result[idx] = arr[i]
        stack.append(i)
    return result`;

export const monotonicStackModule: VisualizationModule<number[]> = {
  id: "data-structures-stacks-monotonic-stack",
  slug: "monotonic-stack",
  title: "Monotonic Stack",
  category: ["data-structures", "stacks"],
  difficulty: "intermediate",
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)",
  description: "Use a monotonic decreasing stack to find the next greater element for each position.",
  relatedTopics: ["stack", "two-pointers"],
  pythonCode,
  codeSteps: [],
  defaultInput: [4, 5, 2, 10, 8],
  generateSteps(input) {
    const arr = [...input];
    const n = arr.length;
    const result = new Array(n).fill(-1);
    const stack: number[] = []; // indices
    const steps: AnimationStep[] = [];

    steps.push({
      stepNumber: steps.length + 1,
      description: `Monotonic Stack: find next greater element for [${arr.join(", ")}].`,
      highlightLines: [1, 2, 3],
      visualState: {
        type: "array1d",
        cells: arr.map((val) => ({ val, state: "default" })),
        label: "Input Array",
      },
      variables: { result: [...result], stack: [] },
    });

    for (let i = 0; i < n; i++) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `i=${i}: process arr[${i}]=${arr[i]}. Stack indices: [${stack.join(", ")}].`,
        highlightLines: [4, 5],
        visualState: {
          type: "array1d",
          cells: arr.map((val, idx) => ({
            val,
            state: idx === i ? "active" : stack.includes(idx) ? "highlighted" : "default",
          })),
          label: "Input Array",
          pointer: [{ index: i, label: "i" }],
        },
        variables: { i, current: arr[i], stack: stack.map((idx) => arr[idx]), result: [...result] },
      });

      while (stack.length > 0 && arr[stack[stack.length - 1]] < arr[i]) {
        const idx = stack.pop()!;
        result[idx] = arr[i];
        steps.push({
          stepNumber: steps.length + 1,
          description: `arr[${idx}]=${arr[idx]} < arr[${i}]=${arr[i]}. NGE(${arr[idx]}) = ${arr[i]}. Pop index ${idx}.`,
          highlightLines: [5, 6, 7],
          visualState: {
            type: "array1d",
            cells: arr.map((val, k) => ({
              val,
              state: k === idx ? "computed" : k === i ? "active" : stack.includes(k) ? "highlighted" : "default",
            })),
            label: "Input Array",
            pointer: [{ index: i, label: "i" }],
          },
          variables: { popped: arr[idx], nge: arr[i], result: [...result] },
        });
      }

      stack.push(i);
      steps.push({
        stepNumber: steps.length + 1,
        description: `Push index ${i} (arr[${i}]=${arr[i]}) onto stack.`,
        highlightLines: [8],
        visualState: {
          type: "array1d",
          cells: arr.map((val, idx) => ({
            val,
            state: idx === i ? "active" : stack.includes(idx) ? "highlighted" : "default",
          })),
          label: "Input Array",
          pointer: [{ index: i, label: "i" }],
        },
        variables: { stack: stack.map((s) => arr[s]), result: [...result] },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Done. Next greater elements: [${result.join(", ")}] (-1 means none exists).`,
      highlightLines: [9],
      visualState: {
        type: "array1d",
        cells: arr.map((val, i) => ({ val, state: result[i] !== -1 ? "computed" : "default" })),
        label: "Input Array",
      },
      variables: { input: arr, result },
    });

    return steps;
  },
};
