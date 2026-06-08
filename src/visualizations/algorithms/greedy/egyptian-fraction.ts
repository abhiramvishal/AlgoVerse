import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type EgyptianFractionInput = { numerator: number; denominator: number };

const pythonCode = `import math

def egyptian_fraction(numerator, denominator):
    fractions = []
    while numerator != 0:
        ceil_val = math.ceil(denominator / numerator)
        fractions.append(f"1/{ceil_val}")
        numerator = numerator * ceil_val - denominator
        denominator = denominator * ceil_val
        g = math.gcd(numerator, denominator)
        numerator //= g
        denominator //= g
    return fractions`;

export const egyptianFractionModule: VisualizationModule<EgyptianFractionInput> = {
  id: "greedy-egyptian-fraction",
  slug: "egyptian-fraction",
  title: "Egyptian Fraction",
  category: ["algorithms", "greedy"],
  difficulty: "intermediate",
  timeComplexity: "O(log n)",
  spaceComplexity: "O(log n)",
  description:
    "Represent a fraction as a sum of distinct unit fractions using the greedy algorithm.",
  relatedTopics: ["gcd-euclidean", "math"],
  pythonCode,
  codeSteps: [],
  defaultInput: { numerator: 6, denominator: 14 },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    let num = input.numerator;
    let den = input.denominator;
    const fractions: string[] = [];

    function gcd(a: number, b: number): number {
      return b === 0 ? a : gcd(b, a % b);
    }

    const g0 = gcd(num, den);
    num = Math.floor(num / g0);
    den = Math.floor(den / g0);

    steps.push({
      stepNumber: steps.length + 1,
      description: `Start with fraction ${input.numerator}/${input.denominator} = ${num}/${den} (simplified).`,
      highlightLines: [3],
      visualState: {
        type: "array1d",
        cells: [{ val: `${num}/${den}`, state: "active" }],
        label: "Egyptian fractions found",
        pointers: [],
      },
      variables: { numerator: num, denominator: den, fractions: [] },
    });

    let iter = 0;
    while (num !== 0 && iter < 20) {
      iter++;
      const ceilVal = Math.ceil(den / num);
      const unitFrac = `1/${ceilVal}`;
      fractions.push(unitFrac);

      steps.push({
        stepNumber: steps.length + 1,
        description: `ceil(${den}/${num}) = ${ceilVal}. Take unit fraction ${unitFrac}.`,
        highlightLines: [5, 6],
        visualState: {
          type: "array1d",
          cells: fractions.map((f, i) => ({
            val: f,
            state: i === fractions.length - 1 ? "active" : "computed",
          })),
          label: `${input.numerator}/${input.denominator} = ` + fractions.join(" + "),
          pointers: [{ index: fractions.length - 1, label: "new" }],
        },
        variables: { numerator: num, denominator: den, ceilVal, unitFrac, fractions: [...fractions] },
      });

      num = num * ceilVal - den;
      den = den * ceilVal;
      const g = gcd(Math.abs(num), Math.abs(den));
      if (g > 0) {
        num = Math.floor(num / g);
        den = Math.floor(den / g);
      }

      if (num !== 0) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Remaining fraction: ${num}/${den}.`,
          highlightLines: [7, 8, 9, 10],
          visualState: {
            type: "array1d",
            cells: fractions.map((f, i) => ({
              val: f,
              state: i === fractions.length - 1 ? "highlighted" : "computed",
            })),
            label: `Remaining: ${num}/${den}`,
            pointers: [],
          },
          variables: { numerator: num, denominator: den, fractions: [...fractions] },
        });
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Done. ${input.numerator}/${input.denominator} = ${fractions.join(" + ")}.`,
      highlightLines: [11],
      visualState: {
        type: "array1d",
        cells: fractions.map((f) => ({ val: f, state: "computed" })),
        label: `${input.numerator}/${input.denominator} = ` + fractions.join(" + "),
        pointers: [],
      },
      variables: { result: fractions.join(" + ") },
    });

    return steps;
  },
};
