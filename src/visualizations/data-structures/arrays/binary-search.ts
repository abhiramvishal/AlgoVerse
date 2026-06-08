import type { AnimationStep, VisualizationModule } from "@/types/visualization";

function cell(val: number, state: string): { val: number; state: string } {
  return { val, state };
}

const pythonCode = `def binary_search(arr, target):
    """Iterative binary search on a sorted array."""
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid          # found
        elif arr[mid] < target:
            left = mid + 1      # search right half
        else:
            right = mid - 1     # search left half
    return -1                   # not found

def binary_search_recursive(arr, target, left=0, right=None):
    """Recursive binary search."""
    if right is None:
        right = len(arr) - 1
    if left > right:
        return -1
    mid = (left + right) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, right)
    else:
        return binary_search_recursive(arr, target, left, mid - 1)

# Example
arr = [2, 5, 8, 12, 16, 23, 38, 42, 55, 72]
print(binary_search(arr, 23))            # 5
print(binary_search(arr, 99))            # -1
print(binary_search_recursive(arr, 42)) # 7`;

interface BinarySearchInput {
  arr: number[];
  target: number;
}

export const binarySearchModule: VisualizationModule<BinarySearchInput> = {
  id: "array-binary-search",
  slug: "binary-search",
  title: "Binary Search",
  category: ["data-structures", "arrays"],
  difficulty: "beginner",
  timeComplexity: "O(log n)",
  spaceComplexity: "O(1)",
  description:
    "Efficiently locate a target value in a sorted array by repeatedly halving the search interval. Each comparison eliminates half the remaining candidates.",
  relatedTopics: ["linear-search", "interpolation-search", "binary-search-tree"],
  pythonCode,
  codeSteps: [
    { stepNumber: 1, highlightLines: [1, 2] },
    { stepNumber: 2, highlightLines: [3, 4] },
    { stepNumber: 3, highlightLines: [5, 6] },
    { stepNumber: 4, highlightLines: [7, 8] },
    { stepNumber: 5, highlightLines: [9, 10] },
    { stepNumber: 6, highlightLines: [11] },
  ],
  defaultInput: { arr: [2, 5, 8, 12, 16, 23, 38, 42, 55, 72], target: 23 },
  generateSteps(input) {
    const arr = [...input.arr];
    const target = input.target;
    const steps: AnimationStep[] = [];
    const n = arr.length;

    // helper: build cell array where left..right are "active", rest are "default" or "eliminated"
    function makeCells(left: number, right: number, mid = -1, found = -1) {
      return arr.map((v, i) => {
        if (found === i) return cell(v, "highlighted");
        if (i === mid) return cell(v, "active");
        if (i >= left && i <= right) return cell(v, "computed");
        return cell(v, "default");
      });
    }

    // Step 1 – initialise
    steps.push({
      stepNumber: 1,
      description: `Binary Search for target=${target} in sorted array of ${n} elements. Set left=0, right=${n - 1}.`,
      highlightLines: [1, 2],
      visualState: {
        type: "array1d",
        cells: makeCells(0, n - 1),
        label: `Searching for ${target}`,
      },
      variables: { left: 0, right: n - 1, target },
    });

    let left = 0;
    let right = n - 1;
    let iteration = 0;

    while (left <= right) {
      iteration++;
      const mid = Math.floor((left + right) / 2);

      // Step – compute mid
      steps.push({
        stepNumber: steps.length + 1,
        description: `Iteration ${iteration}: left=${left}, right=${right} → mid=${mid}. Inspect arr[${mid}]=${arr[mid]}.`,
        highlightLines: [3, 4],
        visualState: {
          type: "array1d",
          cells: makeCells(left, right, mid),
          label: `mid=${mid} → ${arr[mid]}`,
        },
        variables: { left, right, mid, midVal: arr[mid], target },
      });

      if (arr[mid] === target) {
        // Found
        steps.push({
          stepNumber: steps.length + 1,
          description: `arr[${mid}]=${arr[mid]} === target=${target}. Found at index ${mid}! ✓`,
          highlightLines: [5, 6],
          visualState: {
            type: "array1d",
            cells: makeCells(left, right, -1, mid),
            label: `Found at index ${mid}`,
          },
          variables: { result: mid, found: true },
        });
        return steps;
      } else if (arr[mid] < target) {
        // Search right half
        steps.push({
          stepNumber: steps.length + 1,
          description: `arr[${mid}]=${arr[mid]} < ${target}. Target is in the right half. Move left to ${mid + 1}.`,
          highlightLines: [7, 8],
          visualState: {
            type: "array1d",
            cells: makeCells(mid + 1, right),
            label: `Eliminated indices 0–${mid}`,
          },
          variables: { left: mid + 1, right, mid },
        });
        left = mid + 1;
      } else {
        // Search left half
        steps.push({
          stepNumber: steps.length + 1,
          description: `arr[${mid}]=${arr[mid]} > ${target}. Target is in the left half. Move right to ${mid - 1}.`,
          highlightLines: [9, 10],
          visualState: {
            type: "array1d",
            cells: makeCells(left, mid - 1),
            label: `Eliminated indices ${mid}–${n - 1}`,
          },
          variables: { left, right: mid - 1, mid },
        });
        right = mid - 1;
      }
    }

    // Not found
    steps.push({
      stepNumber: steps.length + 1,
      description: `left=${left} > right=${right}: search space exhausted. Target=${target} is not in the array. Return -1.`,
      highlightLines: [11],
      visualState: {
        type: "array1d",
        cells: arr.map(v => cell(v, "default")),
        label: "Not found",
      },
      variables: { result: -1, found: false },
    });

    return steps;
  },
};
