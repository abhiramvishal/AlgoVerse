import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def bucket_sort(arr):
    n = len(arr)
    buckets = [[] for _ in range(n)]
    for num in arr:
        idx = int(num * n)
        buckets[idx].append(num)
    for bucket in buckets:
        bucket.sort()
    return [num for bucket in buckets for num in bucket]`;

// Scale floats 0-1 as integers x100 for the bar chart
export const bucketSortModule: VisualizationModule<number[]> = {
  id: "sorting-bucket-sort",
  slug: "bucket-sort",
  title: "Bucket Sort",
  category: ["algorithms", "sorting"],
  difficulty: "intermediate",
  timeComplexity: "O(n + k)",
  spaceComplexity: "O(n + k)",
  description: "Distributes elements into buckets, sorts each bucket, then concatenates.",
  relatedTopics: ["counting-sort", "radix-sort"],
  pythonCode,
  codeSteps: [],
  defaultInput: [78, 17, 39, 26, 72, 94, 21, 12],
  generateSteps(input) {
    const arr = [...input];
    const steps: AnimationStep[] = [];
    const n = arr.length;
    // Treat as 0-100 range, scale to 0-1 for bucket logic
    const maxVal = 100;

    steps.push({
      stepNumber: steps.length + 1,
      description: `Starting Bucket Sort on ${n} elements (values 0-100 scaled). Creating ${n} buckets.`,
      highlightLines: [1, 2],
      visualState: { array: [...arr], active: [], sorted: [] },
      variables: { n, bucketCount: n },
    });

    const buckets: number[][] = Array.from({ length: n }, () => []);

    for (let i = 0; i < n; i++) {
      const bucketIdx = Math.min(Math.floor((arr[i] / maxVal) * n), n - 1);
      buckets[bucketIdx].push(arr[i]);
      steps.push({
        stepNumber: steps.length + 1,
        description: `arr[${i}]=${arr[i]} → bucket[${bucketIdx}]. Buckets: ${buckets.map((b, bi) => b.length ? `[${bi}]:[${b.join(",")}]` : "").filter(Boolean).join(" ")}`,
        highlightLines: [3, 4, 5],
        visualState: { array: [...arr], active: [i], sorted: [] },
        variables: { i, val: arr[i], bucketIdx, buckets: buckets.map((b) => [...b]) },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `All elements distributed. Now sorting each non-empty bucket.`,
      highlightLines: [6, 7],
      visualState: { array: [...arr], active: [], sorted: [] },
      variables: { buckets: buckets.map((b) => [...b]) },
    });

    for (let bi = 0; bi < n; bi++) {
      if (buckets[bi].length > 1) {
        buckets[bi].sort((a, b) => a - b);
        steps.push({
          stepNumber: steps.length + 1,
          description: `Sorted bucket[${bi}]: [${buckets[bi].join(", ")}].`,
          highlightLines: [7],
          visualState: { array: [...arr], active: [], sorted: [] },
          variables: { bucket: bi, sorted: [...buckets[bi]] },
        });
      }
    }

    const result = ([] as number[]).concat(...buckets);
    steps.push({
      stepNumber: steps.length + 1,
      description: `Concatenating buckets: [${result.join(", ")}].`,
      highlightLines: [8],
      visualState: { array: [...result], active: [], sorted: [] },
      variables: { result: [...result] },
    });

    steps.push({
      stepNumber: steps.length + 1,
      description: "Bucket Sort complete.",
      highlightLines: [9],
      visualState: { array: [...result], active: [], sorted: Array.from({ length: n }, (_, k) => k) },
      variables: { sorted: true },
    });

    return steps;
  },
};
