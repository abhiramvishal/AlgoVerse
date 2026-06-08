import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type KaratsubaInput = { a: number; b: number };

const pythonCode = `def karatsuba(x, y):
    if x < 10 or y < 10:
        return x * y
    n = max(len(str(x)), len(str(y)))
    m = n // 2
    high1, low1 = divmod(x, 10**m)
    high2, low2 = divmod(y, 10**m)
    z0 = karatsuba(low1, low2)
    z1 = karatsuba(low1 + high1, low2 + high2)
    z2 = karatsuba(high1, high2)
    return z2 * 10**(2*m) + (z1 - z2 - z0) * 10**m + z0`;

export const karatsubaModule: VisualizationModule<KaratsubaInput> = {
  id: "divide-conquer-karatsuba",
  slug: "karatsuba",
  title: "Karatsuba Multiplication",
  category: ["algorithms", "divide-conquer"],
  difficulty: "advanced",
  timeComplexity: "O(n^1.585)",
  spaceComplexity: "O(log n)",
  description:
    "Fast multiplication using divide-and-conquer, reducing multiplications from 4 to 3.",
  relatedTopics: ["strassen", "fast-fourier-transform"],
  pythonCode,
  codeSteps: [],
  defaultInput: { a: 1234, b: 5678 },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const cells: { val: string; state: "default" | "active" | "computed" | "highlighted" }[] = [];

    function addStep(desc: string, lines: number[], highlight: number = -1) {
      steps.push({
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: lines,
        visualState: {
          type: "array1d",
          cells: cells.map((c, i) => ({ ...c, state: i === highlight ? "active" : c.state })),
          label: "Karatsuba intermediate values",
          pointers: [],
        },
        variables: {},
      });
    }

    function karatsuba(x: number, y: number, depth: number): number {
      if (steps.length >= 72) return x * y;
      const indent = "  ".repeat(depth);

      if (x < 10 || y < 10) {
        const result = x * y;
        cells.push({ val: `${indent}${x}×${y}=${result}`, state: "computed" });
        addStep(`Base case: ${x} × ${y} = ${result}`, [2], cells.length - 1);
        return result;
      }

      const n = Math.max(String(x).length, String(y).length);
      const m = Math.floor(n / 2);
      const p = Math.pow(10, m);

      const high1 = Math.floor(x / p);
      const low1 = x % p;
      const high2 = Math.floor(y / p);
      const low2 = y % p;

      cells.push({ val: `${indent}split(${x},${y}): hi1=${high1} lo1=${low1} hi2=${high2} lo2=${low2}`, state: "highlighted" });
      addStep(`Split: ${x} → (${high1}, ${low1}), ${y} → (${high2}, ${low2})`, [5, 6], cells.length - 1);

      const z0 = karatsuba(low1, low2, depth + 1);
      const z2 = karatsuba(high1, high2, depth + 1);
      const z1 = karatsuba(low1 + high1, low2 + high2, depth + 1);

      const result = z2 * Math.pow(10, 2 * m) + (z1 - z2 - z0) * Math.pow(10, m) + z0;
      cells.push({ val: `${indent}z0=${z0} z1=${z1} z2=${z2} → ${result}`, state: "computed" });
      addStep(`Combine z0=${z0}, z1=${z1}, z2=${z2} → result=${result}`, [9, 10], cells.length - 1);

      return result;
    }

    steps.push({
      stepNumber: 1,
      description: `Karatsuba multiplication of ${input.a} × ${input.b}.`,
      highlightLines: [1],
      visualState: {
        type: "array1d",
        cells: [{ val: `${input.a} × ${input.b}`, state: "active" }],
        label: "Computing...",
        pointers: [],
      },
      variables: { a: input.a, b: input.b },
    });

    const result = karatsuba(input.a, input.b, 0);

    steps.push({
      stepNumber: steps.length + 1,
      description: `Final result: ${input.a} × ${input.b} = ${result}`,
      highlightLines: [10],
      visualState: {
        type: "array1d",
        cells: [{ val: `${input.a} × ${input.b} = ${result}`, state: "computed" }],
        label: "Karatsuba result",
        pointers: [],
      },
      variables: { result },
    });

    return steps;
  },
};
