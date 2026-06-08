import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def kadane(arr):
    max_sum = arr[0]
    cur_sum = arr[0]
    start = end = temp_start = 0
    for i in range(1, len(arr)):
        if cur_sum + arr[i] < arr[i]:
            cur_sum = arr[i]
            temp_start = i
        else:
            cur_sum += arr[i]
        if cur_sum > max_sum:
            max_sum = cur_sum
            start = temp_start
            end = i
    return max_sum, arr[start:end+1]`;

export const kadaneModule: VisualizationModule<number[]> = {
  id: "data-structures-arrays-kadane",
  slug: "kadane",
  title: "Kadane's Algorithm",
  category: ["data-structures", "arrays"],
  difficulty: "intermediate",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description: "Find the maximum sum contiguous subarray using Kadane's algorithm.",
  relatedTopics: ["sliding-window", "dynamic-programming"],
  pythonCode,
  codeSteps: [],
  defaultInput: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
  generateSteps(input) {
    const arr = [...input];
    const steps: AnimationStep[] = [];
    const n = arr.length;

    let maxSum = arr[0];
    let curSum = arr[0];
    let tempStart = 0;
    let maxStart = 0;
    let maxEnd = 0;

    steps.push({
      stepNumber: steps.length + 1,
      description: `Kadane's Algorithm on [${arr.join(", ")}]. Initialize: curSum = maxSum = arr[0] = ${arr[0]}.`,
      highlightLines: [1, 2],
      visualState: {
        type: "array1d",
        cells: arr.map((val, i) => ({ val, state: i === 0 ? "active" : "default" })),
        label: "Array",
        pointer: [{ index: 0, label: "i" }],
      },
      variables: { curSum, maxSum, maxStart, maxEnd, tempStart },
    });

    for (let i = 1; i < n; i++) {
      const extend = curSum + arr[i];
      const restart = arr[i];

      steps.push({
        stepNumber: steps.length + 1,
        description: `i=${i}: arr[i]=${arr[i]}. Extend? ${extend} vs Restart? ${restart}.`,
        highlightLines: [6, 7],
        visualState: {
          type: "array1d",
          cells: arr.map((val, idx) => ({
            val,
            state: idx === i ? "active" : idx >= tempStart && idx < i ? "highlighted" : "default",
          })),
          label: "Array",
          pointer: [{ index: i, label: "i" }],
        },
        variables: { i, curSum, extend, restart, maxSum },
      });

      if (extend < restart) {
        curSum = restart;
        tempStart = i;
        steps.push({
          stepNumber: steps.length + 1,
          description: `Restart at i=${i}. curSum = ${curSum}.`,
          highlightLines: [8, 9],
          visualState: {
            type: "array1d",
            cells: arr.map((val, idx) => ({
              val,
              state: idx === i ? "active" : "default",
            })),
            label: "Array",
            pointer: [{ index: i, label: "i" }],
          },
          variables: { i, curSum, maxSum, tempStart },
        });
      } else {
        curSum = extend;
      }

      if (curSum > maxSum) {
        maxSum = curSum;
        maxStart = tempStart;
        maxEnd = i;
        steps.push({
          stepNumber: steps.length + 1,
          description: `New max! maxSum = ${maxSum}, subarray [${maxStart}..${maxEnd}] = [${arr.slice(maxStart, maxEnd + 1).join(", ")}].`,
          highlightLines: [11, 12, 13, 14],
          visualState: {
            type: "array1d",
            cells: arr.map((val, idx) => ({
              val,
              state: idx >= maxStart && idx <= maxEnd ? "computed" : idx >= tempStart && idx <= i ? "active" : "default",
            })),
            label: "Array",
            pointer: [{ index: i, label: "i" }],
          },
          variables: { i, curSum, maxSum, maxStart, maxEnd },
        });
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Kadane complete. Max subarray sum = ${maxSum}, subarray = [${arr.slice(maxStart, maxEnd + 1).join(", ")}].`,
      highlightLines: [15],
      visualState: {
        type: "array1d",
        cells: arr.map((val, idx) => ({
          val,
          state: idx >= maxStart && idx <= maxEnd ? "computed" : "default",
        })),
        label: "Array",
        pointer: [{ index: maxStart, label: "start" }, { index: maxEnd, label: "end" }],
      },
      variables: { maxSum, maxStart, maxEnd },
    });

    return steps;
  },
};
