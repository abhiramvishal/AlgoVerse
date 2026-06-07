import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `import math

def jump_search(arr, target):
    n = len(arr)
    step = int(math.sqrt(n))
    prev = 0
    while arr[min(step, n)-1] < target:
        prev = step
        step += int(math.sqrt(n))
        if prev >= n:
            return -1
    while arr[prev] < target:
        prev += 1
        if prev == min(step, n):
            return -1
    if arr[prev] == target:
        return prev
    return -1`;

const DEFAULT_ARRAY = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
const DEFAULT_TARGET = 21;

export const jumpSearchModule: VisualizationModule<null> = {
  id: "searching-jump-search",
  slug: "jump-search",
  title: "Jump Search",
  category: ["algorithms", "searching"],
  difficulty: "intermediate",
  timeComplexity: "O(√n)",
  spaceComplexity: "O(1)",
  description: "Jumps ahead by √n steps to find the range containing the target, then does linear scan.",
  relatedTopics: ["binary-search", "linear-search"],
  pythonCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const arr = DEFAULT_ARRAY;
    const target = DEFAULT_TARGET;
    const steps: AnimationStep[] = [];
    const n = arr.length;
    const jumpStep = Math.floor(Math.sqrt(n));

    steps.push({
      stepNumber: steps.length + 1,
      description: `Jump Search for target=${target}. n=${n}, step=√n=~${jumpStep}.`,
      highlightLines: [3, 4, 5],
      visualState: { type: "search", array: [...arr], target, active: [], searchLeft: 0, searchRight: n - 1, found: -1 },
      variables: { n, jumpStep, target },
    });

    let prev = 0;
    let step = jumpStep;

    while (arr[Math.min(step, n) - 1] < target) {
      const checkIdx = Math.min(step, n) - 1;
      steps.push({
        stepNumber: steps.length + 1,
        description: `Jump: check arr[${checkIdx}]=${arr[checkIdx]} < ${target}. Jump forward. prev=${step}.`,
        highlightLines: [6, 7, 8],
        visualState: { type: "search", array: [...arr], target, active: [checkIdx], searchLeft: prev, searchRight: checkIdx, found: -1 },
        variables: { prev, step, checkIdx, val: arr[checkIdx] },
      });
      prev = step;
      step += jumpStep;
      if (prev >= n) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Jumped past end. Target not found.`,
          highlightLines: [9, 10],
          visualState: { type: "search", array: [...arr], target, active: [], searchLeft: 0, searchRight: n - 1, found: -1 },
          variables: { result: -1 },
        });
        return steps;
      }
    }

    const blockEnd = Math.min(step, n) - 1;
    steps.push({
      stepNumber: steps.length + 1,
      description: `arr[${blockEnd}]=${arr[blockEnd]} >= ${target}. Target is in range [${prev}..${blockEnd}]. Linear scan.`,
      highlightLines: [11, 12],
      visualState: { type: "search", array: [...arr], target, active: [], searchLeft: prev, searchRight: blockEnd, found: -1 },
      variables: { prev, blockEnd },
    });

    while (arr[prev] < target) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `arr[${prev}]=${arr[prev]} < ${target}. Move forward.`,
        highlightLines: [12, 13],
        visualState: { type: "search", array: [...arr], target, active: [prev], searchLeft: prev, searchRight: blockEnd, found: -1 },
        variables: { prev, val: arr[prev], target },
      });
      prev++;
      if (prev === Math.min(step, n)) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Reached end of block. Target not found.`,
          highlightLines: [13, 14],
          visualState: { type: "search", array: [...arr], target, active: [], searchLeft: 0, searchRight: n - 1, found: -1 },
          variables: { result: -1 },
        });
        return steps;
      }
    }

    if (arr[prev] === target) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `Found! arr[${prev}]=${arr[prev]} == target=${target}. Return ${prev}.`,
        highlightLines: [15, 16],
        visualState: { type: "search", array: [...arr], target, active: [], searchLeft: prev, searchRight: blockEnd, found: prev },
        variables: { result: prev },
      });
    }

    return steps;
  },
};
