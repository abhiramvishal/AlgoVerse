import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1`;

export const linearSearchModule: VisualizationModule<{ arr: number[]; target: number }> = {
  id: "data-structures-arrays-linear-search",
  slug: "linear-search",
  title: "Linear Search",
  category: ["data-structures", "arrays"],
  difficulty: "beginner",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description: "Sequentially check each element until the target is found or the list ends.",
  relatedTopics: ["binary-search", "two-pointers"],
  pythonCode,
  codeSteps: [],
  defaultInput: { arr: [4, 2, 7, 1, 9, 3, 5], target: 9 },
  generateSteps(input) {
    const { arr, target } = input;
    const steps: AnimationStep[] = [];

    steps.push({
      stepNumber: steps.length + 1,
      description: `Linear Search for target=${target} in [${arr.join(", ")}].`,
      highlightLines: [1],
      visualState: {
        type: "search",
        array: arr,
        target,
        active: -1,
        searchLeft: 0,
        searchRight: -1,
        found: false,
      },
      variables: { target, i: null },
    });

    for (let i = 0; i < arr.length; i++) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `Check arr[${i}] = ${arr[i]}. Is it ${target}?`,
        highlightLines: [2, 3],
        visualState: {
          type: "search",
          array: arr,
          target,
          active: i,
          searchLeft: 0,
          searchRight: i,
          found: false,
        },
        variables: { i, current: arr[i], target },
      });

      if (arr[i] === target) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Found! arr[${i}] = ${target}. Return index ${i}.`,
          highlightLines: [3, 4],
          visualState: {
            type: "search",
            array: arr,
            target,
            active: i,
            searchLeft: 0,
            searchRight: i,
            found: true,
          },
          variables: { i, found: true, result: i },
        });
        return steps;
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Target ${target} not found. Return -1.`,
      highlightLines: [5],
      visualState: {
        type: "search",
        array: arr,
        target,
        active: -1,
        searchLeft: 0,
        searchRight: arr.length - 1,
        found: false,
      },
      variables: { found: false, result: -1 },
    });

    return steps;
  },
};
