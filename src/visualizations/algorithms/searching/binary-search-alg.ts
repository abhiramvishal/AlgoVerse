import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`;

const DEFAULT_ARRAY = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
const DEFAULT_TARGET = 7;

export const binarySearchAlgModule: VisualizationModule<null> = {
  id: "searching-binary-search-alg",
  slug: "binary-search-alg",
  title: "Binary Search",
  category: ["algorithms", "searching"],
  difficulty: "beginner",
  timeComplexity: "O(log n)",
  spaceComplexity: "O(1)",
  description: "Efficiently searches a sorted array by repeatedly halving the search range.",
  relatedTopics: ["linear-search", "interpolation-search"],
  pythonCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const arr = DEFAULT_ARRAY;
    const target = DEFAULT_TARGET;
    const steps: AnimationStep[] = [];
    let left = 0;
    let right = arr.length - 1;

    steps.push({
      stepNumber: steps.length + 1,
      description: `Binary Search for target=${target}. Array is sorted: [${arr.join(", ")}].`,
      highlightLines: [1, 2],
      visualState: { type: "search", array: [...arr], target, active: [], searchLeft: left, searchRight: right, found: -1 },
      variables: { left, right, target },
    });

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      steps.push({
        stepNumber: steps.length + 1,
        description: `left=${left}, right=${right}, mid=${mid}. Check arr[${mid}]=${arr[mid]} vs target=${target}.`,
        highlightLines: [3, 4],
        visualState: { type: "search", array: [...arr], target, active: [mid], searchLeft: left, searchRight: right, found: -1 },
        variables: { left, right, mid, midVal: arr[mid], target },
      });

      if (arr[mid] === target) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Found! arr[${mid}]=${arr[mid]} == target. Return ${mid}.`,
          highlightLines: [5, 6],
          visualState: { type: "search", array: [...arr], target, active: [], searchLeft: left, searchRight: right, found: mid },
          variables: { mid, result: mid },
        });
        return steps;
      } else if (arr[mid] < target) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `arr[${mid}]=${arr[mid]} < ${target}. Search right half. left = ${mid + 1}.`,
          highlightLines: [7, 8],
          visualState: { type: "search", array: [...arr], target, active: [mid], searchLeft: mid + 1, searchRight: right, found: -1 },
          variables: { left: mid + 1, right, mid },
        });
        left = mid + 1;
      } else {
        steps.push({
          stepNumber: steps.length + 1,
          description: `arr[${mid}]=${arr[mid]} > ${target}. Search left half. right = ${mid - 1}.`,
          highlightLines: [9, 10],
          visualState: { type: "search", array: [...arr], target, active: [mid], searchLeft: left, searchRight: mid - 1, found: -1 },
          variables: { left, right: mid - 1, mid },
        });
        right = mid - 1;
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Target ${target} not found. Return -1.`,
      highlightLines: [11],
      visualState: { type: "search", array: [...arr], target, active: [], searchLeft: left, searchRight: right, found: -1 },
      variables: { result: -1 },
    });

    return steps;
  },
};
