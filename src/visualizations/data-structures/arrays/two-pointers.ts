import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def two_pointers(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        s = arr[left] + arr[right]
        if s == target:
            return (left, right)
        elif s < target:
            left += 1
        else:
            right -= 1
    return None`;

export const twoPointersModule: VisualizationModule<{ arr: number[]; target: number }> = {
  id: "data-structures-arrays-two-pointers",
  slug: "two-pointers",
  title: "Two Pointers",
  category: ["data-structures", "arrays"],
  difficulty: "beginner",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description: "Two-pointer technique to find a pair with a given sum in a sorted array.",
  relatedTopics: ["sliding-window", "binary-search"],
  pythonCode,
  codeSteps: [],
  defaultInput: { arr: [1, 2, 3, 4, 6, 8, 9], target: 10 },
  generateSteps(input) {
    const { arr, target } = input;
    const steps: AnimationStep[] = [];
    let left = 0;
    let right = arr.length - 1;

    steps.push({
      stepNumber: steps.length + 1,
      description: `Two Pointers: find pair summing to ${target} in sorted array [${arr.join(", ")}].`,
      highlightLines: [1, 2],
      visualState: {
        type: "array1d",
        cells: arr.map((val, i) => ({ val, state: i === left ? "active" : i === right ? "highlighted" : "default" })),
        label: "Sorted Array",
        pointer: [{ index: left, label: "L" }, { index: right, label: "R" }],
      },
      variables: { left, right, target },
    });

    while (left < right) {
      const sum = arr[left] + arr[right];

      steps.push({
        stepNumber: steps.length + 1,
        description: `arr[${left}]=${arr[left]} + arr[${right}]=${arr[right]} = ${sum}. Target = ${target}.`,
        highlightLines: [3, 4],
        visualState: {
          type: "array1d",
          cells: arr.map((val, i) => ({ val, state: i === left ? "active" : i === right ? "highlighted" : "default" })),
          label: "Sorted Array",
          pointer: [{ index: left, label: "L" }, { index: right, label: "R" }],
        },
        variables: { left, right, sum, target },
      });

      if (sum === target) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Found pair! arr[${left}]=${arr[left]} + arr[${right}]=${arr[right]} = ${target}.`,
          highlightLines: [5, 6],
          visualState: {
            type: "array1d",
            cells: arr.map((val, i) => ({ val, state: i === left || i === right ? "computed" : "default" })),
            label: "Sorted Array",
            pointer: [{ index: left, label: "L" }, { index: right, label: "R" }],
          },
          variables: { left, right, sum, found: true },
        });
        break;
      } else if (sum < target) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Sum ${sum} < ${target}. Move left pointer right.`,
          highlightLines: [7, 8],
          visualState: {
            type: "array1d",
            cells: arr.map((val, i) => ({ val, state: i === left ? "active" : i === right ? "highlighted" : "default" })),
            label: "Sorted Array",
            pointer: [{ index: left, label: "L" }, { index: right, label: "R" }],
          },
          variables: { left, right, sum, action: "move left →" },
        });
        left++;
      } else {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Sum ${sum} > ${target}. Move right pointer left.`,
          highlightLines: [9, 10],
          visualState: {
            type: "array1d",
            cells: arr.map((val, i) => ({ val, state: i === left ? "active" : i === right ? "highlighted" : "default" })),
            label: "Sorted Array",
            pointer: [{ index: left, label: "L" }, { index: right, label: "R" }],
          },
          variables: { left, right, sum, action: "← move right" },
        });
        right--;
      }
    }

    return steps;
  },
};
