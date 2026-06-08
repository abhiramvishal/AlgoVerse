import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def counting_sort_digit(arr, exp):
    n = len(arr)
    output = [0] * n
    count = [0] * 10
    for i in range(n):
        idx = (arr[i] // exp) % 10
        count[idx] += 1
    for i in range(1, 10):
        count[i] += count[i-1]
    for i in range(n-1, -1, -1):
        idx = (arr[i] // exp) % 10
        output[count[idx]-1] = arr[i]
        count[idx] -= 1
    return output

def radix_sort(arr):
    max_val = max(arr)
    exp = 1
    while max_val // exp > 0:
        arr = counting_sort_digit(arr, exp)
        exp *= 10
    return arr`;

export const radixSortModule: VisualizationModule<number[]> = {
  id: "sorting-radix-sort",
  slug: "radix-sort",
  title: "Radix Sort",
  category: ["algorithms", "sorting"],
  difficulty: "intermediate",
  timeComplexity: "O(d·(n+k))",
  spaceComplexity: "O(n+k)",
  description: "Sorts integers digit by digit from least significant to most significant digit.",
  relatedTopics: ["counting-sort", "bucket-sort"],
  pythonCode,
  codeSteps: [],
  defaultInput: [170, 45, 75, 90, 802, 24, 2, 66],
  generateSteps(input) {
    let arr = [...input];
    const steps: AnimationStep[] = [];
    const n = arr.length;
    const maxVal = Math.max(...arr);

    steps.push({
      stepNumber: steps.length + 1,
      description: `Starting Radix Sort (LSD). Max value = ${maxVal}.`,
      highlightLines: [16, 17],
      visualState: { array: [...arr], active: [], sorted: [] },
      variables: { maxVal, exp: 1 },
    });

    function countingSortByDigit(exp: number) {
      const output = new Array(n).fill(0);
      const count = new Array(10).fill(0);

      steps.push({
        stepNumber: steps.length + 1,
        description: `Sorting by digit at place value ${exp} (${exp === 1 ? "units" : exp === 10 ? "tens" : exp === 100 ? "hundreds" : exp}).`,
        highlightLines: [1, 2, 3],
        visualState: { array: [...arr], active: [], sorted: [] },
        variables: { exp, digit: `(n / ${exp}) % 10` },
      });

      for (let i = 0; i < n; i++) {
        const digit = Math.floor(arr[i] / exp) % 10;
        count[digit]++;
        steps.push({
          stepNumber: steps.length + 1,
          description: `Digit of ${arr[i]} at exp=${exp} is ${digit}. count[${digit}]=${count[digit]}.`,
          highlightLines: [4, 5, 6],
          visualState: { array: [...arr], active: [i], sorted: [] },
          variables: { i, val: arr[i], digit, count: [...count] },
        });
      }

      for (let i = 1; i < 10; i++) count[i] += count[i - 1];

      steps.push({
        stepNumber: steps.length + 1,
        description: `Prefix sums computed. Building sorted output for exp=${exp}.`,
        highlightLines: [7, 8],
        visualState: { array: [...arr], active: [], sorted: [] },
        variables: { exp, count: [...count] },
      });

      for (let i = n - 1; i >= 0; i--) {
        const digit = Math.floor(arr[i] / exp) % 10;
        output[count[digit] - 1] = arr[i];
        count[digit]--;
      }

      arr = [...output];
      steps.push({
        stepNumber: steps.length + 1,
        description: `After sorting by exp=${exp}: [${arr.join(", ")}].`,
        highlightLines: [13],
        visualState: { array: [...arr], active: [], sorted: [] },
        variables: { exp, result: [...arr] },
      });
    }

    for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
      countingSortByDigit(exp);
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: "Radix Sort complete.",
      highlightLines: [19],
      visualState: { array: [...arr], active: [], sorted: Array.from({ length: n }, (_, k) => k) },
      variables: { sorted: true },
    });

    return steps;
  },
};
