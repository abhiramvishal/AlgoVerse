import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def ternary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid1 = lo + (hi - lo) // 3
        mid2 = hi - (hi - lo) // 3
        if arr[mid1] == target: return mid1
        if arr[mid2] == target: return mid2
        if target < arr[mid1]:
            hi = mid1 - 1
        elif target > arr[mid2]:
            lo = mid2 + 1
        else:
            lo = mid1 + 1
            hi = mid2 - 1
    return -1`;

const DEFAULT_ARRAY = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
const DEFAULT_TARGET = 13;

export const ternarySearchModule: VisualizationModule<null> = {
  id: "searching-ternary-search",
  slug: "ternary-search",
  title: "Ternary Search",
  category: ["algorithms", "searching"],
  difficulty: "intermediate",
  timeComplexity: "O(log₃ n)",
  spaceComplexity: "O(1)",
  description: "Divides the search range into three parts using two mid points instead of one.",
  relatedTopics: ["binary-search"],
  pythonCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const arr = DEFAULT_ARRAY;
    const target = DEFAULT_TARGET;
    const steps: AnimationStep[] = [];
    let lo = 0;
    let hi = arr.length - 1;

    steps.push({
      stepNumber: steps.length + 1,
      description: `Ternary Search for target=${target}.`,
      highlightLines: [1, 2],
      visualState: { type: "search", array: [...arr], target, active: [], searchLeft: lo, searchRight: hi, found: -1 },
      variables: { lo, hi, target },
    });

    while (lo <= hi) {
      const mid1 = lo + Math.floor((hi - lo) / 3);
      const mid2 = hi - Math.floor((hi - lo) / 3);

      steps.push({
        stepNumber: steps.length + 1,
        description: `lo=${lo}, hi=${hi}. mid1=${mid1} (val=${arr[mid1]}), mid2=${mid2} (val=${arr[mid2]}).`,
        highlightLines: [3, 4],
        visualState: { type: "search", array: [...arr], target, active: [mid1, mid2], searchLeft: lo, searchRight: hi, found: -1 },
        variables: { lo, hi, mid1, mid2, val1: arr[mid1], val2: arr[mid2] },
      });

      if (arr[mid1] === target) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Found at mid1=${mid1}!`,
          highlightLines: [5, 6],
          visualState: { type: "search", array: [...arr], target, active: [], searchLeft: lo, searchRight: hi, found: mid1 },
          variables: { result: mid1 },
        });
        return steps;
      }
      if (arr[mid2] === target) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Found at mid2=${mid2}!`,
          highlightLines: [7],
          visualState: { type: "search", array: [...arr], target, active: [], searchLeft: lo, searchRight: hi, found: mid2 },
          variables: { result: mid2 },
        });
        return steps;
      }

      if (target < arr[mid1]) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `${target} < arr[mid1]=${arr[mid1]}. Search left third. hi = ${mid1 - 1}.`,
          highlightLines: [8, 9],
          visualState: { type: "search", array: [...arr], target, active: [mid1], searchLeft: lo, searchRight: mid1 - 1, found: -1 },
          variables: { lo, hi: mid1 - 1 },
        });
        hi = mid1 - 1;
      } else if (target > arr[mid2]) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `${target} > arr[mid2]=${arr[mid2]}. Search right third. lo = ${mid2 + 1}.`,
          highlightLines: [10, 11],
          visualState: { type: "search", array: [...arr], target, active: [mid2], searchLeft: mid2 + 1, searchRight: hi, found: -1 },
          variables: { lo: mid2 + 1, hi },
        });
        lo = mid2 + 1;
      } else {
        steps.push({
          stepNumber: steps.length + 1,
          description: `${target} is between arr[mid1] and arr[mid2]. Search middle third. lo=${mid1 + 1}, hi=${mid2 - 1}.`,
          highlightLines: [12, 13, 14],
          visualState: { type: "search", array: [...arr], target, active: [mid1, mid2], searchLeft: mid1 + 1, searchRight: mid2 - 1, found: -1 },
          variables: { lo: mid1 + 1, hi: mid2 - 1 },
        });
        lo = mid1 + 1;
        hi = mid2 - 1;
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Target ${target} not found.`,
      highlightLines: [15],
      visualState: { type: "search", array: [...arr], target, active: [], searchLeft: lo, searchRight: hi, found: -1 },
      variables: { result: -1 },
    });

    return steps;
  },
};
