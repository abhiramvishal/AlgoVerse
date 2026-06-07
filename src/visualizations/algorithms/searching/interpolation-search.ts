import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def interpolation_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi and arr[lo] <= target <= arr[hi]:
        if arr[hi] == arr[lo]:
            if arr[lo] == target: return lo
            break
        pos = lo + ((target - arr[lo]) * (hi - lo) // (arr[hi] - arr[lo]))
        if arr[pos] == target:
            return pos
        elif arr[pos] < target:
            lo = pos + 1
        else:
            hi = pos - 1
    return -1`;

const DEFAULT_ARRAY = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const DEFAULT_TARGET = 70;

export const interpolationSearchModule: VisualizationModule<null> = {
  id: "searching-interpolation-search",
  slug: "interpolation-search",
  title: "Interpolation Search",
  category: ["algorithms", "searching"],
  difficulty: "intermediate",
  timeComplexity: "O(log log n) avg",
  spaceComplexity: "O(1)",
  description: "Estimates position using linear interpolation, better than binary search for uniform distributions.",
  relatedTopics: ["binary-search", "jump-search"],
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
      description: `Interpolation Search for target=${target} in uniformly distributed array.`,
      highlightLines: [1, 2],
      visualState: { type: "search", array: [...arr], target, active: [], searchLeft: lo, searchRight: hi, found: -1 },
      variables: { lo, hi, target },
    });

    while (lo <= hi && arr[lo] <= target && target <= arr[hi]) {
      if (arr[hi] === arr[lo]) break;

      const pos = lo + Math.floor(((target - arr[lo]) * (hi - lo)) / (arr[hi] - arr[lo]));
      steps.push({
        stepNumber: steps.length + 1,
        description: `Interpolate: pos = ${lo} + (${target} - ${arr[lo]}) * (${hi} - ${lo}) / (${arr[hi]} - ${arr[lo]}) = ${pos}.`,
        highlightLines: [7],
        visualState: { type: "search", array: [...arr], target, active: [pos], searchLeft: lo, searchRight: hi, found: -1 },
        variables: { lo, hi, pos, posVal: arr[pos], target },
      });

      if (arr[pos] === target) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Found! arr[${pos}]=${arr[pos]} == target=${target}.`,
          highlightLines: [8, 9],
          visualState: { type: "search", array: [...arr], target, active: [], searchLeft: lo, searchRight: hi, found: pos },
          variables: { result: pos },
        });
        return steps;
      } else if (arr[pos] < target) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `arr[${pos}]=${arr[pos]} < ${target}. Search right. lo = ${pos + 1}.`,
          highlightLines: [10, 11],
          visualState: { type: "search", array: [...arr], target, active: [pos], searchLeft: pos + 1, searchRight: hi, found: -1 },
          variables: { lo: pos + 1, hi },
        });
        lo = pos + 1;
      } else {
        steps.push({
          stepNumber: steps.length + 1,
          description: `arr[${pos}]=${arr[pos]} > ${target}. Search left. hi = ${pos - 1}.`,
          highlightLines: [12, 13],
          visualState: { type: "search", array: [...arr], target, active: [pos], searchLeft: lo, searchRight: pos - 1, found: -1 },
          variables: { lo, hi: pos - 1 },
        });
        hi = pos - 1;
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Target ${target} not found.`,
      highlightLines: [14],
      visualState: { type: "search", array: [...arr], target, active: [], searchLeft: lo, searchRight: hi, found: -1 },
      variables: { result: -1 },
    });

    return steps;
  },
};
