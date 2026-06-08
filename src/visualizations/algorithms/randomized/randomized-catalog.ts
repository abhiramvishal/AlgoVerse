import type { AnimationStep, VisualizationModule } from "@/types/visualization";

// ── Randomized QuickSort ─────────────────────────────────────────────────────
export const randomizedQuicksortModule: VisualizationModule<number[]> = {
  id: "rand-quicksort",
  slug: "randomized-quicksort",
  title: "Randomized QuickSort",
  category: ["algorithms", "randomized"],
  difficulty: "intermediate",
  timeComplexity: "O(n log n) expected",
  spaceComplexity: "O(log n)",
  description: "QuickSort with random pivot selection. Expected O(n log n) regardless of input distribution.",
  relatedTopics: ["quick-sort", "las-vegas"],
  pythonCode: `import random

def randomized_quicksort(arr, lo, hi):
    if lo < hi:
        pivot_idx = random.randint(lo, hi)
        arr[pivot_idx], arr[hi] = arr[hi], arr[pivot_idx]  # move pivot to end
        p = partition(arr, lo, hi)
        randomized_quicksort(arr, lo, p - 1)
        randomized_quicksort(arr, p + 1, hi)

def partition(arr, lo, hi):
    pivot = arr[hi]
    i = lo - 1
    for j in range(lo, hi):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i+1], arr[hi] = arr[hi], arr[i+1]
    return i + 1`,
  codeSteps: [],
  defaultInput: [3, 6, 8, 10, 1, 2, 1],
  generateSteps(input) {
    const arr = [...(input ?? [3, 6, 8, 10, 1, 2, 1])];
    const steps: AnimationStep[] = [];
    const sorted: number[] = [];

    // Deterministic "random" pivots (middle of range for demo)
    function qs(a: number[], lo: number, hi: number) {
      if (lo >= hi) { sorted.push(lo); return; }
      // Pick middle as "random" pivot
      const pivotIdx = Math.floor((lo + hi) / 2);
      [a[pivotIdx], a[hi]] = [a[hi], a[pivotIdx]];

      steps.push({
        stepNumber: steps.length + 1,
        description: `Partition [${lo}..${hi}]. Random pivot=${a[hi]} (moved to end).`,
        highlightLines: [4, 5],
        visualState: { array: [...a], active: [hi], sorted: [...sorted], pivotIndex: hi },
        variables: { lo, hi, pivot: a[hi] },
      });

      const pivot = a[hi];
      let i = lo - 1;
      for (let j = lo; j < hi; j++) {
        if (a[j] <= pivot) {
          i++;
          [a[i], a[j]] = [a[j], a[i]];
          steps.push({
            stepNumber: steps.length + 1,
            description: `a[${j}]=${a[i]} ≤ pivot ${pivot}. Swap with a[${i}].`,
            highlightLines: [12, 13, 14],
            visualState: { array: [...a], active: [i, j], sorted: [...sorted], pivotIndex: hi },
            variables: { i, j, pivot },
          });
        }
      }
      [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
      const p = i + 1;
      sorted.push(p);

      steps.push({
        stepNumber: steps.length + 1,
        description: `Pivot ${a[p]} placed at index ${p}.`,
        highlightLines: [15, 16],
        visualState: { array: [...a], active: [p], sorted: [...sorted], pivotIndex: p },
        variables: { pivotIndex: p, pivot: a[p] },
      });

      qs(a, lo, p - 1);
      qs(a, p + 1, hi);
    }

    steps.push({
      stepNumber: 1,
      description: "Randomized QuickSort: random pivot selection avoids O(n²) worst case.",
      highlightLines: [1],
      visualState: { array: [...arr], active: [], sorted: [] },
      variables: { n: arr.length },
    });

    qs(arr, 0, arr.length - 1);

    steps.push({
      stepNumber: steps.length + 1,
      description: "Sorted!",
      highlightLines: [],
      visualState: { array: [...arr], active: [], sorted: arr.map((_, i) => i) },
      variables: { sorted: true },
    });

    return steps;
  },
};

// ── Reservoir Sampling ───────────────────────────────────────────────────────
export const reservoirSamplingModule: VisualizationModule<{ stream: number[]; k: number }> = {
  id: "rand-reservoir-sampling",
  slug: "reservoir-sampling",
  title: "Reservoir Sampling",
  category: ["algorithms", "randomized"],
  difficulty: "intermediate",
  timeComplexity: "O(n)",
  spaceComplexity: "O(k)",
  description: "Uniformly sample k elements from a stream of unknown size in a single pass.",
  relatedTopics: ["monte-carlo-pi"],
  pythonCode: `import random

def reservoir_sampling(stream, k):
    reservoir = stream[:k]
    for i in range(k, len(stream)):
        j = random.randint(0, i)   # uniform in [0, i]
        if j < k:
            reservoir[j] = stream[i]  # replace with probability k/(i+1)
    return reservoir

stream = list(range(1, 11))
print(reservoir_sampling(stream, 3))`,
  codeSteps: [],
  defaultInput: { stream: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], k: 3 },
  generateSteps(input) {
    const { stream, k } = input ?? { stream: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], k: 3 };
    const steps: AnimationStep[] = [];

    const reservoir = stream.slice(0, k);

    steps.push({
      stepNumber: 1,
      description: `Reservoir Sampling: sample ${k} from stream of ${stream.length}. Fill reservoir with first ${k} elements.`,
      highlightLines: [3],
      visualState: {
        type: "array1d",
        cells: stream.map((v, i) => ({
          val: v,
          state: i < k ? "computed" as const : "default" as const,
        })),
        label: `Stream (reservoir = first ${k})`,
      },
      variables: { reservoir: JSON.stringify(reservoir), streamSize: stream.length, k },
    });

    // Use deterministic "random" for demo: j = i % k  (not truly random but shows the concept)
    const swaps: Array<{ i: number; j: number; replaced: boolean }> = [];
    for (let i = k; i < stream.length; i++) {
      const j = i % (i + 1); // deterministic demo
      const replaced = j < k;
      if (replaced) reservoir[j] = stream[i];
      swaps.push({ i, j, replaced });

      steps.push({
        stepNumber: steps.length + 1,
        description: `Stream[${i}]=${stream[i]}: random j=${j}. ${replaced ? `j<${k} → replace reservoir[${j}]` : `j≥${k} → skip`}. Probability=${k}/${i + 1}.`,
        highlightLines: [4, 5, 6, 7],
        visualState: {
          type: "array1d",
          cells: stream.map((v, idx) => ({
            val: v,
            state: idx < k ? (reservoir.includes(v) ? "computed" as const : "default" as const)
              : idx === i ? "active" as const
              : "default" as const,
          })),
          label: `Reservoir: [${reservoir.join(",")}]`,
        },
        variables: { i, j, element: stream[i], reservoir: JSON.stringify([...reservoir]), replaced },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Final reservoir (${k} uniform samples): [${reservoir.join(",")}]. Each element had equal probability ${k}/${stream.length}.`,
      highlightLines: [8],
      visualState: {
        type: "array1d",
        cells: reservoir.map((v) => ({ val: v, state: "computed" as const })),
        label: `Sampled ${k} elements`,
      },
      variables: { sample: JSON.stringify(reservoir), probability: `${k}/${stream.length}` },
    });

    return steps;
  },
};

// ── Monte Carlo π ─────────────────────────────────────────────────────────────
export const monteCarloPiModule: VisualizationModule<null> = {
  id: "rand-monte-carlo-pi",
  slug: "monte-carlo-pi",
  title: "Monte Carlo π",
  category: ["algorithms", "randomized"],
  difficulty: "beginner",
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)",
  description: "Estimate π by counting random points inside a unit circle vs total points. π ≈ 4 × (inside/total).",
  relatedTopics: ["reservoir-sampling"],
  pythonCode: `import random

def estimate_pi(n_samples):
    inside = 0
    for _ in range(n_samples):
        x, y = random.random(), random.random()
        if x*x + y*y <= 1.0:
            inside += 1
    return 4 * inside / n_samples

for n in [100, 1000, 10000]:
    print(f"n={n}: π ≈ {estimate_pi(n):.4f}")`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];

    // Deterministic "random" points for reproducibility
    const pts: Array<{ x: number; y: number; inside: boolean }> = [];
    const seed = [0.2, 0.8, 0.5, 0.3, 0.9, 0.1, 0.6, 0.7, 0.4, 0.15,
      0.85, 0.45, 0.35, 0.75, 0.55, 0.25, 0.65, 0.05, 0.95, 0.38];
    const seed2 = [0.6, 0.3, 0.7, 0.9, 0.2, 0.5, 0.1, 0.8, 0.4, 0.72,
      0.18, 0.55, 0.82, 0.45, 0.63, 0.28, 0.91, 0.37, 0.14, 0.78];

    steps.push({
      stepNumber: 1,
      description: "Monte Carlo π: Sample random points in [0,1]². Count fraction inside unit circle. π ≈ 4 × inside/total.",
      highlightLines: [1, 2],
      visualState: {
        type: "scatter",
        points: [],
        centroids: [{ x: 200, y: 200, id: 0 }],
        title: "Monte Carlo π",
      },
      variables: { inside: 0, total: 0, pi: 0 },
    });

    let inside = 0;
    for (let i = 0; i < 20; i++) {
      const x = seed[i], y = seed2[i];
      const isInside = x * x + y * y <= 1.0;
      if (isInside) inside++;
      pts.push({ x, y, inside: isInside });

      const piEstimate = (4 * inside / (i + 1)).toFixed(4);

      steps.push({
        stepNumber: steps.length + 1,
        description: `Point ${i + 1}: (${x.toFixed(2)}, ${y.toFixed(2)}) → ${isInside ? "INSIDE" : "OUTSIDE"} circle. π ≈ ${piEstimate}`,
        highlightLines: [4, 5, 6],
        visualState: {
          type: "scatter",
          points: pts.map((p, j) => ({
            x: p.x * 380 + 10,
            y: (1 - p.y) * 280 + 10,
            label: `${j + 1}`,
            cluster: p.inside ? 0 : 1,
          })),
          centroids: [],
          title: `π ≈ ${piEstimate} (${inside}/${i + 1})`,
        },
        variables: { sample: i + 1, inside, outside: i + 1 - inside, pi: piEstimate },
      });
    }

    const finalPi = (4 * inside / 20).toFixed(4);
    steps.push({
      stepNumber: steps.length + 1,
      description: `After 20 samples: ${inside} inside, ${20 - inside} outside. π ≈ ${finalPi}. More samples → better accuracy.`,
      highlightLines: [8],
      visualState: {
        type: "array1d",
        cells: [
          { val: `inside=${inside}`, state: "computed" as const },
          { val: `total=20`, state: "default" as const },
          { val: `π≈${finalPi}`, state: "highlighted" as const },
        ],
        label: "Estimate",
      },
      variables: { inside, total: 20, piEstimate: finalPi, actual: "3.14159..." },
    });

    return steps;
  },
};

// ── Las Vegas (QuickSelect) ───────────────────────────────────────────────────
export const lasVegasModule: VisualizationModule<{ arr: number[]; k: number }> = {
  id: "rand-las-vegas",
  slug: "las-vegas",
  title: "Las Vegas Algorithms",
  category: ["algorithms", "randomized"],
  difficulty: "intermediate",
  timeComplexity: "O(n) expected",
  spaceComplexity: "O(1)",
  description: "QuickSelect: Las Vegas algorithm that always finds the kth smallest element. Expected O(n) time.",
  relatedTopics: ["randomized-quicksort", "median-of-medians"],
  pythonCode: `import random

def quickselect(arr, lo, hi, k):
    if lo == hi:
        return arr[lo]
    pivot_idx = random.randint(lo, hi)
    arr[pivot_idx], arr[hi] = arr[hi], arr[pivot_idx]
    p = partition(arr, lo, hi)
    if k == p:
        return arr[p]
    elif k < p:
        return quickselect(arr, lo, p - 1, k)
    else:
        return quickselect(arr, p + 1, hi, k)

arr = [7, 10, 4, 3, 20, 15]
print(quickselect(arr, 0, len(arr)-1, 2))   # 3rd smallest = 7`,
  codeSteps: [],
  defaultInput: { arr: [7, 10, 4, 3, 20, 15], k: 2 },
  generateSteps(input) {
    const { arr: inputArr, k } = input ?? { arr: [7, 10, 4, 3, 20, 15], k: 2 };
    const arr = [...inputArr];
    const steps: AnimationStep[] = [];

    steps.push({
      stepNumber: 1,
      description: `QuickSelect: find ${k + 1}th smallest (index ${k}) in [${inputArr.join(",")}].`,
      highlightLines: [3],
      visualState: { array: [...arr], active: [], sorted: [] },
      variables: { arr: JSON.stringify(arr), k, target: `${k + 1}th smallest` },
    });

    function qs(lo: number, hi: number, target: number): number {
      if (lo === hi) return lo;
      // Deterministic "random" pivot: use middle
      const pivotIdx = Math.floor((lo + hi) / 2);
      [arr[pivotIdx], arr[hi]] = [arr[hi], arr[pivotIdx]];

      const pivot = arr[hi];
      let i = lo - 1;
      for (let j = lo; j < hi; j++) {
        if (arr[j] <= pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }
      [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
      const p = i + 1;

      steps.push({
        stepNumber: steps.length + 1,
        description: `Partition [${lo}..${hi}]: pivot=${arr[p]} at index ${p}. Target k=${target}: ${target === p ? "FOUND!" : target < p ? "go left" : "go right"}`,
        highlightLines: [6, 7, 8, 9],
        visualState: { array: [...arr], active: [p], sorted: [], pivotIndex: p },
        variables: { lo, hi, pivot: arr[p], p, k: target },
      });

      if (target === p) return p;
      else if (target < p) return qs(lo, p - 1, target);
      else return qs(p + 1, hi, target);
    }

    const resultIdx = qs(0, arr.length - 1, k);

    steps.push({
      stepNumber: steps.length + 1,
      description: `Found! ${k + 1}th smallest = ${arr[resultIdx]}. QuickSelect always correct (Las Vegas property).`,
      highlightLines: [10],
      visualState: { array: [...arr], active: [resultIdx], sorted: [resultIdx] },
      variables: { result: arr[resultIdx], rank: k + 1 },
    });

    return steps;
  },
};
