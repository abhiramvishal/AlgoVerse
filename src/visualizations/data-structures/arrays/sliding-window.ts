import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def max_sum_subarray(arr, k):
    n = len(arr)
    window_sum = sum(arr[:k])
    max_sum = window_sum
    max_start = 0
    for i in range(k, n):
        window_sum += arr[i] - arr[i - k]
        if window_sum > max_sum:
            max_sum = window_sum
            max_start = i - k + 1
    return max_sum, arr[max_start:max_start+k]`;

export const slidingWindowModule: VisualizationModule<{ arr: number[]; k: number }> = {
  id: "data-structures-arrays-sliding-window",
  slug: "sliding-window",
  title: "Sliding Window",
  category: ["data-structures", "arrays"],
  difficulty: "beginner",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description: "Find the maximum sum subarray of size k using the sliding window technique.",
  relatedTopics: ["two-pointers", "kadane"],
  pythonCode,
  codeSteps: [],
  defaultInput: { arr: [2, 1, 5, 1, 3, 2, 8, 1, 4], k: 3 },
  generateSteps(input) {
    const { arr, k } = input;
    const steps: AnimationStep[] = [];
    const n = arr.length;

    let windowSum = arr.slice(0, k).reduce((a, b) => a + b, 0);
    let maxSum = windowSum;
    let maxStart = 0;

    steps.push({
      stepNumber: steps.length + 1,
      description: `Sliding Window: find max sum subarray of size ${k}. Initial window [0..${k - 1}] sum = ${windowSum}.`,
      highlightLines: [1, 2, 3],
      visualState: {
        type: "array1d",
        cells: arr.map((val, i) => ({ val, state: i < k ? "highlighted" : "default" })),
        label: `Array (k=${k})`,
        pointer: [{ index: 0, label: "start" }],
      },
      variables: { windowSum, maxSum, maxStart, windowEnd: k - 1 },
    });

    for (let i = k; i < n; i++) {
      const removed = arr[i - k];
      const added = arr[i];
      windowSum = windowSum - removed + added;
      const start = i - k + 1;

      steps.push({
        stepNumber: steps.length + 1,
        description: `Slide window: remove arr[${i - k}]=${removed}, add arr[${i}]=${added}. Window [${start}..${i}] sum = ${windowSum}.`,
        highlightLines: [6, 7],
        visualState: {
          type: "array1d",
          cells: arr.map((val, idx) => ({
            val,
            state: idx >= start && idx <= i ? "highlighted" : "default",
          })),
          label: `Array (k=${k})`,
          pointer: [{ index: start, label: "start" }],
        },
        variables: { windowSum, maxSum, start, windowEnd: i },
      });

      if (windowSum > maxSum) {
        maxSum = windowSum;
        maxStart = start;
        steps.push({
          stepNumber: steps.length + 1,
          description: `New maximum! sum=${maxSum} at window [${maxStart}..${maxStart + k - 1}].`,
          highlightLines: [8, 9, 10],
          visualState: {
            type: "array1d",
            cells: arr.map((val, idx) => ({
              val,
              state: idx >= maxStart && idx < maxStart + k ? "computed" : "default",
            })),
            label: `Array (k=${k})`,
            pointer: [{ index: maxStart, label: "maxStart" }],
          },
          variables: { windowSum, maxSum, maxStart, windowEnd: maxStart + k - 1 },
        });
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Done. Maximum sum = ${maxSum}, window = [${arr.slice(maxStart, maxStart + k).join(", ")}].`,
      highlightLines: [11],
      visualState: {
        type: "array1d",
        cells: arr.map((val, idx) => ({
          val,
          state: idx >= maxStart && idx < maxStart + k ? "computed" : "default",
        })),
        label: `Array (k=${k})`,
        pointer: [{ index: maxStart, label: "maxStart" }],
      },
      variables: { maxSum, maxStart, maxWindow: arr.slice(maxStart, maxStart + k) },
    });

    return steps;
  },
};
