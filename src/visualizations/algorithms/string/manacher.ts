import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type ManacherInput = { str: string };

const pythonCode = `def manacher(s):
    # Transform: "abc" -> "#a#b#c#"
    t = '#' + '#'.join(s) + '#'
    n = len(t)
    P = [0] * n
    c = r = 0
    for i in range(n):
        mirror = 2*c - i
        if i < r:
            P[i] = min(r - i, P[mirror])
        while i - P[i] - 1 >= 0 and i + P[i] + 1 < n and t[i-P[i]-1] == t[i+P[i]+1]:
            P[i] += 1
        if i + P[i] > r:
            c, r = i, i + P[i]
    return P`;

export const manacherModule: VisualizationModule<ManacherInput> = {
  id: "string-manacher",
  slug: "manacher",
  title: "Manacher's Algorithm",
  category: ["algorithms", "string"],
  difficulty: "advanced",
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)",
  description:
    "Find all palindromic substrings in O(n) by maintaining a rightmost palindrome boundary.",
  relatedTopics: ["z-algorithm", "kmp"],
  pythonCode,
  codeSteps: [],
  defaultInput: { str: "abacaba" },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const s = input.str;
    const t = "#" + s.split("").join("#") + "#";
    const n = t.length;
    const P = new Array(n).fill(0);
    let c = 0;
    let r = 0;

    steps.push({
      stepNumber: 1,
      description: `Transform "${s}" → "${t}" (insert # separators).`,
      highlightLines: [2, 3],
      visualState: {
        type: "array1d",
        cells: t.split("").map((ch) => ({ val: ch, state: "default" as const })),
        label: `Transformed: "${t}"`,
        pointers: [],
      },
      variables: { original: s, transformed: t },
    });

    for (let i = 0; i < n && steps.length < 75; i++) {
      const mirror = 2 * c - i;
      if (i < r) {
        P[i] = Math.min(r - i, P[mirror]);
      }

      while (
        i - P[i] - 1 >= 0 &&
        i + P[i] + 1 < n &&
        t[i - P[i] - 1] === t[i + P[i] + 1]
      ) {
        P[i]++;
      }

      if (i + P[i] > r) {
        c = i;
        r = i + P[i];
      }

      steps.push({
        stepNumber: steps.length + 1,
        description: `i=${i} '${t[i]}': P[${i}]=${P[i]}. Center c=${c}, right=${r}.${P[i] > 0 ? ` Palindrome of radius ${P[i]}.` : ""}`,
        highlightLines: [10, 11, 12, 13],
        visualState: {
          type: "array1d",
          cells: [
            ...t.split("").map((ch, ci) => ({
              val: ch,
              state: (
                ci === i ? "active" :
                ci >= i - P[i] && ci <= i + P[i] && P[i] > 0 ? "computed" :
                "default"
              ) as "active" | "computed" | "default",
            })),
            ...P.map((v, pi) => ({
              val: String(v),
              state: (pi === i ? "active" : pi < i ? "computed" : "default") as "active" | "computed" | "default",
            })),
          ],
          label: `P-array below string (top=chars, bottom=P[i])`,
          pointers: [{ index: i, label: `P=${P[i]}` }],
        },
        variables: { i, "P[i]": P[i], c, r },
      });
    }

    // Find longest palindrome
    let maxLen = 0;
    let center = 0;
    for (let i = 0; i < n; i++) {
      if (P[i] > maxLen) { maxLen = P[i]; center = i; }
    }
    const start = Math.floor((center - maxLen) / 2);
    const longestPalindrome = s.slice(start, start + maxLen);

    steps.push({
      stepNumber: steps.length + 1,
      description: `Done. P=[${P.join(",")}]. Longest palindrome: "${longestPalindrome}" (length ${maxLen}).`,
      highlightLines: [14],
      visualState: {
        type: "array1d",
        cells: P.map((v, i) => ({ val: `${t[i]}:${v}`, state: "computed" as const })),
        label: `P-array. Longest palindrome: "${longestPalindrome}"`,
        pointers: [{ index: center, label: "max" }],
      },
      variables: { longestPalindrome, length: maxLen },
    });

    return steps;
  },
};
