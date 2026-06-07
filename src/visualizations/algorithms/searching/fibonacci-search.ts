import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def fibonacci_search(arr, target):
    n = len(arr)
    fib2, fib1, fib = 0, 1, 1
    while fib < n:
        fib2, fib1, fib = fib1, fib, fib1 + fib
    offset = -1
    while fib > 1:
        i = min(offset + fib2, n - 1)
        if arr[i] < target:
            fib, fib1, fib2 = fib1, fib2, fib1 - fib2
            offset = i
        elif arr[i] > target:
            fib, fib1, fib2 = fib2, fib1 - fib2, fib2 - (fib1 - fib2)
        else:
            return i
    if fib1 and arr[offset + 1] == target:
        return offset + 1
    return -1`;

const DEFAULT_ARRAY = [10, 22, 35, 40, 45, 50, 80, 82, 85, 90, 100];
const DEFAULT_TARGET = 85;

export const fibonacciSearchModule: VisualizationModule<null> = {
  id: "searching-fibonacci-search",
  slug: "fibonacci-search",
  title: "Fibonacci Search",
  category: ["algorithms", "searching"],
  difficulty: "advanced",
  timeComplexity: "O(log n)",
  spaceComplexity: "O(1)",
  description: "Uses Fibonacci numbers to divide the sorted array. Avoids division operations.",
  relatedTopics: ["binary-search", "interpolation-search"],
  pythonCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const arr = DEFAULT_ARRAY;
    const target = DEFAULT_TARGET;
    const steps: AnimationStep[] = [];
    const n = arr.length;

    let fib2 = 0, fib1 = 1, fib = 1;
    while (fib < n) {
      [fib2, fib1, fib] = [fib1, fib, fib1 + fib];
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Fibonacci Search for target=${target}. n=${n}. Fibonacci numbers built up to fib=${fib}.`,
      highlightLines: [1, 2, 3, 4],
      visualState: { type: "search", array: [...arr], target, active: [], searchLeft: 0, searchRight: n - 1, found: -1 },
      variables: { target, n, fib, fib1, fib2 },
    });

    let offset = -1;

    while (fib > 1) {
      const i = Math.min(offset + fib2, n - 1);
      steps.push({
        stepNumber: steps.length + 1,
        description: `Check index i=min(${offset}+${fib2}, ${n - 1})=${i}, arr[${i}]=${arr[i]} vs target=${target}. fib=${fib}, fib1=${fib1}, fib2=${fib2}.`,
        highlightLines: [6, 7, 8],
        visualState: { type: "search", array: [...arr], target, active: [i], searchLeft: Math.max(0, offset + 1), searchRight: Math.min(offset + fib, n - 1), found: -1 },
        variables: { i, val: arr[i], target, fib, fib1, fib2, offset },
      });

      if (arr[i] < target) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `arr[${i}]=${arr[i]} < ${target}. Eliminate left side. offset = ${i}.`,
          highlightLines: [9, 10, 11],
          visualState: { type: "search", array: [...arr], target, active: [i], searchLeft: i + 1, searchRight: Math.min(offset + fib, n - 1), found: -1 },
          variables: { offset: i, fib: fib1, fib1: fib2, fib2: fib1 - fib2 },
        });
        [fib, fib1, fib2] = [fib1, fib2, fib1 - fib2];
        offset = i;
      } else if (arr[i] > target) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `arr[${i}]=${arr[i]} > ${target}. Eliminate right side.`,
          highlightLines: [12, 13],
          visualState: { type: "search", array: [...arr], target, active: [i], searchLeft: Math.max(0, offset + 1), searchRight: i - 1, found: -1 },
          variables: { fib: fib2 },
        });
        [fib, fib1, fib2] = [fib2, fib1 - fib2, fib2 - (fib1 - fib2)];
      } else {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Found! arr[${i}]=${arr[i]} == target=${target}.`,
          highlightLines: [14, 15],
          visualState: { type: "search", array: [...arr], target, active: [], searchLeft: 0, searchRight: n - 1, found: i },
          variables: { result: i },
        });
        return steps;
      }
    }

    if (fib1 && offset + 1 < n && arr[offset + 1] === target) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `Found at offset+1=${offset + 1}!`,
        highlightLines: [16, 17],
        visualState: { type: "search", array: [...arr], target, active: [], searchLeft: 0, searchRight: n - 1, found: offset + 1 },
        variables: { result: offset + 1 },
      });
      return steps;
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Target ${target} not found.`,
      highlightLines: [18],
      visualState: { type: "search", array: [...arr], target, active: [], searchLeft: 0, searchRight: n - 1, found: -1 },
      variables: { result: -1 },
    });

    return steps;
  },
};
