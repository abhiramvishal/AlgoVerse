import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type StrassenInput = { A: number[][]; B: number[][] };

const pythonCode = `def strassen(A, B):
    a, b, c, d = A[0][0], A[0][1], A[1][0], A[1][1]
    e, f, g, h = B[0][0], B[0][1], B[1][0], B[1][1]
    M1 = (a + d) * (e + h)
    M2 = (c + d) * e
    M3 = a * (f - h)
    M4 = d * (g - e)
    M5 = (a + b) * h
    M6 = (c - a) * (e + f)
    M7 = (b - d) * (g + h)
    C00 = M1 + M4 - M5 + M7
    C01 = M3 + M5
    C10 = M2 + M4
    C11 = M1 - M2 + M3 + M6
    return [[C00, C01], [C10, C11]]`;

export const strassenModule: VisualizationModule<StrassenInput> = {
  id: "divide-conquer-strassen",
  slug: "strassen",
  title: "Strassen Matrix Multiplication",
  category: ["algorithms", "divide-conquer"],
  difficulty: "advanced",
  timeComplexity: "O(n^2.807)",
  spaceComplexity: "O(n^2)",
  description:
    "Strassen's algorithm multiplies 2x2 matrices with 7 multiplications instead of 8.",
  relatedTopics: ["karatsuba", "fast-fourier-transform"],
  pythonCode,
  codeSteps: [],
  defaultInput: { A: [[1, 2], [3, 4]], B: [[5, 6], [7, 8]] },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { A, B } = input;
    const [a, b, c, d] = [A[0][0], A[0][1], A[1][0], A[1][1]];
    const [e, f, g, h] = [B[0][0], B[0][1], B[1][0], B[1][1]];

    steps.push({
      stepNumber: 1,
      description: `Strassen: A=[[${a},${b}],[${c},${d}]] × B=[[${e},${f}],[${g},${h}]]. Computing 7 products M1-M7.`,
      highlightLines: [1, 2, 3],
      visualState: {
        type: "array1d",
        cells: [
          { val: `a=${a}`, state: "default" },
          { val: `b=${b}`, state: "default" },
          { val: `c=${c}`, state: "default" },
          { val: `d=${d}`, state: "default" },
          { val: `e=${e}`, state: "default" },
          { val: `f=${f}`, state: "default" },
          { val: `g=${g}`, state: "default" },
          { val: `h=${h}`, state: "default" },
        ],
        label: "A and B elements",
        pointers: [],
      },
      variables: { a, b, c, d, e, f, g, h },
    });

    const products = [
      { name: "M1", formula: "(a+d)*(e+h)", value: (a + d) * (e + h), line: 4 },
      { name: "M2", formula: "(c+d)*e", value: (c + d) * e, line: 5 },
      { name: "M3", formula: "a*(f-h)", value: a * (f - h), line: 6 },
      { name: "M4", formula: "d*(g-e)", value: d * (g - e), line: 7 },
      { name: "M5", formula: "(a+b)*h", value: (a + b) * h, line: 8 },
      { name: "M6", formula: "(c-a)*(e+f)", value: (c - a) * (e + f), line: 9 },
      { name: "M7", formula: "(b-d)*(g+h)", value: (b - d) * (g + h), line: 10 },
    ];

    const computed: { val: string; state: "default" | "active" | "computed" }[] = [];

    for (const p of products) {
      computed.push({ val: `${p.name}=${p.value}`, state: "computed" });
      steps.push({
        stepNumber: steps.length + 1,
        description: `${p.name} = ${p.formula} = ${p.value}`,
        highlightLines: [p.line],
        visualState: {
          type: "array1d",
          cells: [...computed.slice(0, -1).map((c) => ({ ...c })), { ...computed[computed.length - 1], state: "active" as const }],
          label: "Strassen products M1..M7",
          pointers: [{ index: computed.length - 1, label: p.name }],
        },
        variables: { [p.name]: p.value },
      });
    }

    const [M1, M2, M3, M4, M5, M6, M7] = products.map((p) => p.value);
    const C00 = M1 + M4 - M5 + M7;
    const C01 = M3 + M5;
    const C10 = M2 + M4;
    const C11 = M1 - M2 + M3 + M6;

    const resultFormulas = [
      { name: "C[0][0]", formula: "M1+M4-M5+M7", value: C00, line: 11 },
      { name: "C[0][1]", formula: "M3+M5", value: C01, line: 12 },
      { name: "C[1][0]", formula: "M2+M4", value: C10, line: 13 },
      { name: "C[1][1]", formula: "M1-M2+M3+M6", value: C11, line: 14 },
    ];

    for (const r of resultFormulas) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `${r.name} = ${r.formula} = ${r.value}`,
        highlightLines: [r.line],
        visualState: {
          type: "array1d",
          cells: [
            ...computed,
            { val: `${r.name}=${r.value}`, state: "active" },
          ],
          label: "Computing result matrix C",
          pointers: [{ index: computed.length, label: r.name }],
        },
        variables: { [r.name]: r.value },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Result C = [[${C00},${C01}],[${C10},${C11}]]. Only 7 multiplications!`,
      highlightLines: [15],
      visualState: {
        type: "array1d",
        cells: [
          { val: `C[0][0]=${C00}`, state: "computed" },
          { val: `C[0][1]=${C01}`, state: "computed" },
          { val: `C[1][0]=${C10}`, state: "computed" },
          { val: `C[1][1]=${C11}`, state: "computed" },
        ],
        label: `Result C = [[${C00},${C01}],[${C10},${C11}]]`,
        pointers: [],
      },
      variables: { C: [[C00, C01], [C10, C11]] },
    });

    return steps;
  },
};
