import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1`;

const DEFAULT_ARRAY = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
const DEFAULT_TARGET = 23;

export const linearSearchAlgModule: VisualizationModule<null> = {
  id: "searching-linear-search",
  slug: "linear-search-alg",
  title: "Linear Search",
  category: ["algorithms", "searching"],
  difficulty: "beginner",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description: "Sequentially checks each element until the target is found or array is exhausted.",
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
      description: `Linear Search for target=${target} in [${arr.join(", ")}].`,
      highlightLines: [1],
      visualState: { type: "search", array: [...arr], target, active: [], searchLeft: 0, searchRight: n - 1, found: -1 },
      variables: { target, n },
    });

    for (let i = 0; i < n; i++) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `Check arr[${i}]=${arr[i]}. Is it ${target}?`,
        highlightLines: [2, 3],
        visualState: { type: "search", array: [...arr], target, active: [i], searchLeft: 0, searchRight: i, found: -1 },
        variables: { i, current: arr[i], target },
      });

      if (arr[i] === target) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Found! arr[${i}]=${arr[i]} == target=${target}. Return ${i}.`,
          highlightLines: [3, 4],
          visualState: { type: "search", array: [...arr], target, active: [], searchLeft: 0, searchRight: i, found: i },
          variables: { i, result: i },
        });
        return steps;
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Target ${target} not found. Return -1.`,
      highlightLines: [5],
      visualState: { type: "search", array: [...arr], target, active: [], searchLeft: 0, searchRight: n - 1, found: -1 },
      variables: { result: -1 },
    });

    return steps;
  },
};
