import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def binary_search(arr, lo, hi, target):
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1

def exponential_search(arr, target):
    if arr[0] == target: return 0
    n = len(arr)
    i = 1
    while i < n and arr[i] <= target:
        i *= 2
    return binary_search(arr, i // 2, min(i, n - 1), target)`;

const DEFAULT_ARRAY = [2, 3, 4, 10, 40, 80, 120, 200];
const DEFAULT_TARGET = 40;

export const exponentialSearchModule: VisualizationModule<null> = {
  id: "searching-exponential-search",
  slug: "exponential-search",
  title: "Exponential Search",
  category: ["algorithms", "searching"],
  difficulty: "intermediate",
  timeComplexity: "O(log n)",
  spaceComplexity: "O(1)",
  description: "Finds range exponentially then applies binary search. Good for unbounded or large sorted arrays.",
  relatedTopics: ["binary-search", "jump-search"],
  pythonCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const arr = DEFAULT_ARRAY;
    const target = DEFAULT_TARGET;
    const steps: AnimationStep[] = [];
    const n = arr.length;

    steps.push({
      stepNumber: steps.length + 1,
      description: `Exponential Search for target=${target}. Phase 1: doubling to find range.`,
      highlightLines: [9, 10, 11],
      visualState: { type: "search", array: [...arr], target, active: [0], searchLeft: 0, searchRight: n - 1, found: -1 },
      variables: { target, n },
    });

    if (arr[0] === target) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `Found at index 0!`,
        highlightLines: [10],
        visualState: { type: "search", array: [...arr], target, active: [], searchLeft: 0, searchRight: 0, found: 0 },
        variables: { result: 0 },
      });
      return steps;
    }

    let i = 1;
    while (i < n && arr[i] <= target) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `arr[${i}]=${arr[i]} <= ${target}. Double i: ${i} → ${i * 2}.`,
        highlightLines: [12, 13],
        visualState: { type: "search", array: [...arr], target, active: [i], searchLeft: 0, searchRight: Math.min(i, n - 1), found: -1 },
        variables: { i, val: arr[i], nextI: i * 2 },
      });
      i *= 2;
    }

    const lo = Math.floor(i / 2);
    const hi = Math.min(i, n - 1);

    steps.push({
      stepNumber: steps.length + 1,
      description: `Range found: [${lo}..${hi}]. Phase 2: Binary search in this range.`,
      highlightLines: [14],
      visualState: { type: "search", array: [...arr], target, active: [], searchLeft: lo, searchRight: hi, found: -1 },
      variables: { lo, hi },
    });

    let left = lo;
    let right = hi;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      steps.push({
        stepNumber: steps.length + 1,
        description: `Binary search: mid=${mid}, arr[${mid}]=${arr[mid]} vs target=${target}.`,
        highlightLines: [2, 3],
        visualState: { type: "search", array: [...arr], target, active: [mid], searchLeft: left, searchRight: right, found: -1 },
        variables: { left, right, mid, midVal: arr[mid] },
      });

      if (arr[mid] === target) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Found! arr[${mid}]=${arr[mid]} == target=${target}.`,
          highlightLines: [4],
          visualState: { type: "search", array: [...arr], target, active: [], searchLeft: left, searchRight: right, found: mid },
          variables: { result: mid },
        });
        return steps;
      } else if (arr[mid] < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Target ${target} not found.`,
      highlightLines: [7],
      visualState: { type: "search", array: [...arr], target, active: [], searchLeft: lo, searchRight: hi, found: -1 },
      variables: { result: -1 },
    });

    return steps;
  },
};
