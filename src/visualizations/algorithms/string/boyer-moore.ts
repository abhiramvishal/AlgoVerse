import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type BoyerMooreInput = { text: string; pattern: string };

const pythonCode = `def bad_char_table(pattern):
    table = {}
    for i, c in enumerate(pattern):
        table[c] = i
    return table

def boyer_moore(text, pattern):
    n, m = len(text), len(pattern)
    bad_char = bad_char_table(pattern)
    matches = []
    s = 0
    while s <= n - m:
        j = m - 1
        while j >= 0 and pattern[j] == text[s+j]:
            j -= 1
        if j < 0:
            matches.append(s)
            s += m
        else:
            shift = max(1, j - bad_char.get(text[s+j], -1))
            s += shift
    return matches`;

export const boyerMooreModule: VisualizationModule<BoyerMooreInput> = {
  id: "string-boyer-moore",
  slug: "boyer-moore",
  title: "Boyer-Moore",
  category: ["algorithms", "string"],
  difficulty: "advanced",
  timeComplexity: "O(n/m) avg",
  spaceComplexity: "O(alphabet)",
  description:
    "Boyer-Moore string matching with bad character heuristic: scan right-to-left, skip on mismatch.",
  relatedTopics: ["kmp", "rabin-karp"],
  pythonCode,
  codeSteps: [],
  defaultInput: { text: "AABCAADAABAABA", pattern: "AABA" },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { text, pattern } = input;
    const n = text.length;
    const m = pattern.length;
    const matches: number[] = [];

    // Build bad char table
    const badChar: Record<string, number> = {};
    for (let i = 0; i < m; i++) badChar[pattern[i]] = i;

    steps.push({
      stepNumber: 1,
      description: `Bad character table: ${Object.entries(badChar).map(([c, i]) => `${c}:${i}`).join(", ")}`,
      highlightLines: [1, 2, 3, 4],
      visualState: {
        type: "textmatch",
        text,
        pattern,
        textHighlight: [],
        patternHighlight: [],
        matchIndices: [],
        mismatchIndex: -1,
        offset: 0,
        label: `Bad char: ${JSON.stringify(badChar)}`,
      },
      variables: { badChar },
    });

    let s = 0;
    while (s <= n - m && steps.length < 75) {
      let j = m - 1;

      steps.push({
        stepNumber: steps.length + 1,
        description: `Align pattern at position s=${s}. Scan right-to-left.`,
        highlightLines: [10, 11],
        visualState: {
          type: "textmatch",
          text,
          pattern,
          textHighlight: Array.from({ length: m }, (_, k) => s + k),
          patternHighlight: [],
          matchIndices: [...matches],
          mismatchIndex: -1,
          offset: s,
          label: `s=${s}`,
        },
        variables: { s, j },
      });

      while (j >= 0 && pattern[j] === text[s + j]) {
        j--;
      }

      if (j < 0) {
        matches.push(s);
        steps.push({
          stepNumber: steps.length + 1,
          description: `Match at s=${s}!`,
          highlightLines: [14, 15],
          visualState: {
            type: "textmatch",
            text,
            pattern,
            textHighlight: Array.from({ length: m }, (_, k) => s + k),
            patternHighlight: Array.from({ length: m }, (_, k) => k),
            matchIndices: [...matches],
            mismatchIndex: -1,
            offset: s,
            label: `MATCH at ${s}`,
          },
          variables: { match: s },
        });
        s += m;
      } else {
        const mismatchChar = text[s + j];
        const shift = Math.max(1, j - (badChar[mismatchChar] ?? -1));
        steps.push({
          stepNumber: steps.length + 1,
          description: `Mismatch at j=${j}: text='${mismatchChar}', pattern='${pattern[j]}'. Bad char shift = max(1, ${j} - ${badChar[mismatchChar] ?? -1}) = ${shift}.`,
          highlightLines: [17, 18],
          visualState: {
            type: "textmatch",
            text,
            pattern,
            textHighlight: Array.from({ length: m }, (_, k) => s + k),
            patternHighlight: [],
            matchIndices: [...matches],
            mismatchIndex: s + j,
            offset: s,
            label: `mismatch '${mismatchChar}' at ${s + j}, shift=${shift}`,
          },
          variables: { s, j, mismatchChar, shift },
        });
        s += shift;
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: matches.length > 0
        ? `Boyer-Moore complete. Matches at: ${matches.join(", ")}.`
        : "No matches found.",
      highlightLines: [19],
      visualState: {
        type: "textmatch",
        text,
        pattern,
        textHighlight: matches.flatMap((pos) => Array.from({ length: m }, (_, k) => pos + k)),
        patternHighlight: [],
        matchIndices: matches,
        mismatchIndex: -1,
        offset: 0,
        label: `Matches: ${matches.join(", ")}`,
      },
      variables: { matches },
    });

    return steps;
  },
};
