import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type ZAlgorithmInput = { str: string };

const pythonCode = `def z_function(s):
    n = len(s)
    z = [0] * n
    l, r = 0, 0
    for i in range(1, n):
        if i < r:
            z[i] = min(r - i, z[i - l])
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1
        if i + z[i] > r:
            l, r = i, i + z[i]
    z[0] = n
    return z`;

export const zAlgorithmModule: VisualizationModule<ZAlgorithmInput> = {
  id: "string-z-algorithm",
  slug: "z-algorithm",
  title: "Z-Algorithm",
  category: ["algorithms", "string"],
  difficulty: "intermediate",
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)",
  description:
    "Compute Z-array: Z[i] = length of longest substring starting at i that matches a prefix.",
  relatedTopics: ["kmp", "rabin-karp"],
  pythonCode,
  codeSteps: [],
  defaultInput: { str: "aabxaaabxaaabxb" },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const s = input.str;
    const n = s.length;
    const z = new Array(n).fill(0);
    let l = 0;
    let r = 0;

    steps.push({
      stepNumber: 1,
      description: `Compute Z-array for "${s}". Z[i] = length of longest prefix match starting at i.`,
      highlightLines: [1, 2],
      visualState: {
        type: "array1d",
        cells: s.split("").map((c) => ({ val: c, state: "default" as const })),
        label: "String",
        pointers: [],
      },
      variables: { l: 0, r: 0, n },
    });

    z[0] = n;
    steps.push({
      stepNumber: steps.length + 1,
      description: `Z[0] = n = ${n} by convention.`,
      highlightLines: [11],
      visualState: {
        type: "array1d",
        cells: [...s.split("").map((c) => ({ val: c, state: "default" as const })), ...z.map((v) => ({ val: String(v), state: "default" as const }))],
        label: "String + Z-array",
        pointers: [{ index: 0, label: "Z[0]" }],
      },
      variables: { "Z[0]": n },
    });

    for (let i = 1; i < n && steps.length < 75; i++) {
      if (i < r) {
        z[i] = Math.min(r - i, z[i - l]);
      }

      while (i + z[i] < n && s[z[i]] === s[i + z[i]]) {
        z[i]++;
      }

      if (i + z[i] > r) {
        l = i;
        r = i + z[i];
      }

      steps.push({
        stepNumber: steps.length + 1,
        description: `i=${i}: Z[${i}]=${z[i]}. Window [l=${l}, r=${r}).${z[i] > 0 ? ` Matches prefix "${s.slice(0, z[i])}".` : " No prefix match."}`,
        highlightLines: z[i] > 0 ? [7, 8, 9, 10] : [4, 5, 6],
        visualState: {
          type: "array1d",
          cells: [
            ...s.split("").map((c, ci) => ({
              val: c,
              state: (ci === i ? "active" : ci >= i && ci < i + z[i] ? "computed" : "default") as "active" | "computed" | "default",
            })),
            ...z.map((v, zi) => ({
              val: String(v),
              state: (zi === i ? "active" : zi < i ? "computed" : "default") as "active" | "computed" | "default",
            })),
          ],
          label: `Z-array (top=string, bottom=Z values)`,
          pointers: [{ index: i, label: `i=${i}` }, { index: n + i, label: `Z=${z[i]}` }],
        },
        variables: { i, "Z[i]": z[i], l, r },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Z-algorithm complete. Z=[${z.join(",")}]`,
      highlightLines: [12],
      visualState: {
        type: "array1d",
        cells: z.map((v, i) => ({ val: `${s[i]}:${v}`, state: "computed" as const })),
        label: "Final Z-array (char:Z[i])",
        pointers: [],
      },
      variables: { Z: z },
    });

    return steps;
  },
};
