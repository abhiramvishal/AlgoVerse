import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def gcd(a, b):
    while b != 0:
        a, b = b, a % b
    return a`;

export const gcdEuclideanModule: VisualizationModule<{ a: number; b: number }> = {
  id: "math-gcd-euclidean",
  slug: "gcd-euclidean",
  title: "GCD (Euclidean Algorithm)",
  category: ["algorithms", "math"],
  difficulty: "beginner",
  timeComplexity: "O(log min(a,b))",
  spaceComplexity: "O(1)",
  description: "Computes the Greatest Common Divisor using the Euclidean algorithm: gcd(a,b) = gcd(b, a mod b).",
  relatedTopics: ["extended-euclidean", "prime-factorization"],
  pythonCode,
  codeSteps: [],
  defaultInput: { a: 48, b: 18 },
  generateSteps(input) {
    let { a, b } = input ?? { a: 48, b: 18 };
    const steps: AnimationStep[] = [];
    let step = 0;

    function makeCells(av: number, bv: number, rem: number | null) {
      const base: { val: number; state: "highlighted" | "active" | "computed" | "default" | "min" }[] = [
        { val: av, state: "highlighted" },
        { val: bv, state: "active" },
      ];
      if (rem !== null) base.push({ val: rem, state: "computed" });
      return base;
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `GCD(${a}, ${b}) using Euclidean algorithm.`,
      highlightLines: [1],
      visualState: { type: "array1d", cells: makeCells(a, b, null), label: "[a, b]" },
      variables: { a, b },
    });

    while (b !== 0) {
      const rem = a % b;
      step++;
      steps.push({
        stepNumber: steps.length + 1,
        description: `Step ${step}: gcd(${a}, ${b}). ${a} mod ${b} = ${rem}. → gcd(${b}, ${rem}).`,
        highlightLines: [2, 3],
        visualState: { type: "array1d", cells: makeCells(a, b, rem), label: "[a, b, a%b]" },
        variables: { a, b, remainder: rem },
      });
      a = b;
      b = rem;
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `b=0. GCD = ${a}.`,
      highlightLines: [4],
      visualState: { type: "array1d", cells: [{ val: a, state: "computed" as const }], label: "GCD" },
      variables: { gcd: a },
    });

    return steps;
  },
};
