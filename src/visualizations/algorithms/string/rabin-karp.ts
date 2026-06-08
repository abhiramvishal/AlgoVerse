import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type RabinKarpInput = { text: string; pattern: string };

const pythonCode = `def rabin_karp(text, pattern, q=101):
    n, m = len(text), len(pattern)
    d = 256
    h = pow(d, m-1, q)
    p_hash = t_hash = 0
    for i in range(m):
        p_hash = (d * p_hash + ord(pattern[i])) % q
        t_hash = (d * t_hash + ord(text[i])) % q
    matches = []
    for i in range(n - m + 1):
        if p_hash == t_hash:
            if text[i:i+m] == pattern:
                matches.append(i)
        if i < n - m:
            t_hash = (d*(t_hash - ord(text[i])*h) + ord(text[i+m])) % q
    return matches`;

export const rabinKarpModule: VisualizationModule<RabinKarpInput> = {
  id: "string-rabin-karp",
  slug: "rabin-karp",
  title: "Rabin-Karp",
  category: ["algorithms", "string"],
  difficulty: "intermediate",
  timeComplexity: "O(n+m)",
  spaceComplexity: "O(1)",
  description:
    "String matching using rolling hash: slide window over text, compare hash to pattern hash.",
  relatedTopics: ["kmp", "boyer-moore", "z-algorithm"],
  pythonCode,
  codeSteps: [],
  defaultInput: { text: "AABABDABACD", pattern: "ABAB" },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { text, pattern } = input;
    const n = text.length;
    const m = pattern.length;
    const d = 256;
    const q = 101;
    const matches: number[] = [];

    // Compute initial hash
    let pHash = 0;
    let tHash = 0;
    let h = 1;
    for (let i = 0; i < m - 1; i++) h = (h * d) % q;

    for (let i = 0; i < m; i++) {
      pHash = (d * pHash + pattern.charCodeAt(i)) % q;
      tHash = (d * tHash + text.charCodeAt(i)) % q;
    }

    steps.push({
      stepNumber: 1,
      description: `Pattern hash = ${pHash}. Initial window hash = ${tHash}.`,
      highlightLines: [4, 5, 6, 7],
      visualState: {
        type: "textmatch",
        text,
        pattern,
        textHighlight: Array.from({ length: m }, (_, i) => i),
        patternHighlight: Array.from({ length: m }, (_, i) => i),
        matchIndices: [],
        mismatchIndex: -1,
        offset: 0,
        label: `pattern_hash=${pHash}, window_hash=${tHash}`,
      },
      variables: { patternHash: pHash, windowHash: tHash },
    });

    for (let i = 0; i <= n - m; i++) {
      const windowHighlight = Array.from({ length: m }, (_, k) => i + k);
      const hashMatch = pHash === tHash;
      const strMatch = hashMatch && text.slice(i, i + m) === pattern;

      steps.push({
        stepNumber: steps.length + 1,
        description: hashMatch
          ? (strMatch ? `Match at i=${i}! Hashes equal and strings match.` : `Hash collision at i=${i}: hashes equal but strings differ.`)
          : `i=${i}: window hash ${tHash} ≠ pattern hash ${pHash}. Slide.`,
        highlightLines: hashMatch ? [10, 11, 12] : [10],
        visualState: {
          type: "textmatch",
          text,
          pattern,
          textHighlight: windowHighlight,
          patternHighlight: strMatch ? Array.from({ length: m }, (_, k) => k) : [],
          matchIndices: [...matches],
          mismatchIndex: hashMatch && !strMatch ? i : -1,
          offset: i,
          label: `window_hash=${tHash}, pattern_hash=${pHash}${strMatch ? " MATCH!" : ""}`,
        },
        variables: { i, windowHash: tHash, patternHash: pHash, match: strMatch },
      });

      if (strMatch) matches.push(i);

      if (i < n - m) {
        tHash = (d * (tHash - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % q;
        if (tHash < 0) tHash += q;
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: matches.length > 0
        ? `Pattern found at positions: ${matches.join(", ")}.`
        : "Pattern not found.",
      highlightLines: [15],
      visualState: {
        type: "textmatch",
        text,
        pattern,
        textHighlight: matches.flatMap((pos) => Array.from({ length: m }, (_, k) => pos + k)),
        patternHighlight: [],
        matchIndices: matches,
        mismatchIndex: -1,
        offset: 0,
        label: `Matches at: ${matches.join(", ")}`,
      },
      variables: { matches },
    });

    return steps;
  },
};
