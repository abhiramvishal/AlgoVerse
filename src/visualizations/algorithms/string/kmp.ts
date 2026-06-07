import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def compute_lps(pattern):
    lps = [0] * len(pattern)
    length = 0
    i = 1
    while i < len(pattern):
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        elif length != 0:
            length = lps[length - 1]
        else:
            lps[i] = 0
            i += 1
    return lps

def kmp_search(text, pattern):
    lps = compute_lps(pattern)
    i = j = 0
    matches = []
    while i < len(text):
        if text[i] == pattern[j]:
            i += 1; j += 1
        if j == len(pattern):
            matches.append(i - j)
            j = lps[j - 1]
        elif i < len(text) and text[i] != pattern[j]:
            if j != 0: j = lps[j - 1]
            else: i += 1
    return matches`;

export const kmpModule: VisualizationModule<{ text: string; pattern: string }> = {
  id: "string-kmp",
  slug: "kmp",
  title: "KMP String Search",
  category: ["algorithms", "string"],
  difficulty: "intermediate",
  timeComplexity: "O(n + m)",
  spaceComplexity: "O(m)",
  description: "Knuth-Morris-Pratt: avoids re-scanning text by using a failure function (LPS array).",
  relatedTopics: ["rabin-karp", "boyer-moore"],
  pythonCode,
  codeSteps: [],
  defaultInput: { text: "AAABAAAB", pattern: "AAAB" },
  generateSteps(input) {
    const { text, pattern } = input ?? { text: "AAABAAAB", pattern: "AAAB" };
    const steps: AnimationStep[] = [];

    // Build LPS
    const lps = new Array(pattern.length).fill(0);
    let length = 0, idx = 1;
    while (idx < pattern.length) {
      if (pattern[idx] === pattern[length]) {
        length++;
        lps[idx] = length;
        idx++;
      } else if (length !== 0) {
        length = lps[length - 1];
      } else {
        lps[idx] = 0;
        idx++;
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `KMP: text="${text}", pattern="${pattern}". Computed LPS=[${lps.join(",")}].`,
      highlightLines: [1, 2, 3],
      visualState: {
        type: "array1d",
        cells: text.split("").map((c) => ({ val: c, state: "default" as const })),
        label: `text: "${text}" | pattern: "${pattern}" | lps=[${lps.join(",")}]`,
      },
      variables: { text, pattern, lps: lps.join(",") },
    });

    let i = 0, j = 0;
    const matches: number[] = [];

    while (i < text.length) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `Compare text[${i}]='${text[i]}' with pattern[${j}]='${pattern[j]}'.`,
        highlightLines: [17, 18, 19, 20],
        visualState: {
          type: "array1d",
          cells: text.split("").map((c, ci) => ({
            val: c,
            state: ci === i ? "active" as const
              : matches.some((m) => ci >= m && ci < m + pattern.length) ? "computed" as const
              : ci >= i - j && ci < i ? "highlighted" as const
              : "default" as const,
          })),
          label: `text | i=${i}, j=${j}`,
          pointer: [{ index: i, label: "i" }],
        },
        variables: { i, j, textChar: text[i], patChar: pattern[j] },
      });

      if (text[i] === pattern[j]) {
        i++;
        j++;
      }

      if (j === pattern.length) {
        const matchPos = i - j;
        matches.push(matchPos);
        steps.push({
          stepNumber: steps.length + 1,
          description: `MATCH found at index ${matchPos}! Pattern "${pattern}" found in text at position ${matchPos}.`,
          highlightLines: [23, 24],
          visualState: {
            type: "array1d",
            cells: text.split("").map((c, ci) => ({
              val: c,
              state: matches.some((m) => ci >= m && ci < m + pattern.length) ? "computed" as const : "default" as const,
            })),
            label: `Match at [${matches.join(", ")}]`,
          },
          variables: { match: matchPos, allMatches: matches.join(",") },
        });
        j = lps[j - 1];
      } else if (i < text.length && text[i] !== pattern[j]) {
        if (j !== 0) {
          steps.push({
            stepNumber: steps.length + 1,
            description: `Mismatch at i=${i}, j=${j}. Use LPS: j → lps[${j - 1}]=${lps[j - 1]}.`,
            highlightLines: [25, 26],
            visualState: {
              type: "array1d",
              cells: text.split("").map((c, ci) => ({
                val: c,
                state: ci === i ? "active" as const : "default" as const,
              })),
              label: `Mismatch. j=${j} → ${lps[j - 1]}`,
            },
            variables: { i, j, newJ: lps[j - 1] },
          });
          j = lps[j - 1];
        } else {
          i++;
        }
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: matches.length > 0
        ? `KMP complete. Pattern found at positions: [${matches.join(", ")}].`
        : `KMP complete. Pattern not found.`,
      highlightLines: [27],
      visualState: {
        type: "array1d",
        cells: text.split("").map((c, ci) => ({
          val: c,
          state: matches.some((m) => ci >= m && ci < m + pattern.length) ? "computed" as const : "default" as const,
        })),
        label: matches.length > 0 ? `Matches at [${matches.join(", ")}]` : "No matches",
      },
      variables: { matches: matches.join(",") || "none" },
    });

    return steps;
  },
};
