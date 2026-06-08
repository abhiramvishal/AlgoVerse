import type { AnimationStep, VisualizationModule } from "@/types/visualization";

// Re-export individual string implementations
export { rabinKarpModule } from "@/visualizations/algorithms/string/rabin-karp";
export { boyerMooreModule } from "@/visualizations/algorithms/string/boyer-moore";
export { zAlgorithmModule } from "@/visualizations/algorithms/string/z-algorithm";
export { ahoCorasickModule } from "@/visualizations/algorithms/string/aho-corasick";
export { manacherModule } from "@/visualizations/algorithms/string/manacher";

// ── Suffix Array ─────────────────────────────────────────────────────────────
const suffixArrayCode = `def build_suffix_array(s):
    n = len(s)
    suffixes = sorted(range(n), key=lambda i: s[i:])
    return suffixes

def kasai_lcp(s, sa):
    n = len(s)
    rank = [0] * n
    for i, v in enumerate(sa):
        rank[v] = i
    lcp = [0] * n
    h = 0
    for i in range(n):
        if rank[i] > 0:
            j = sa[rank[i] - 1]
            while i + h < n and j + h < n and s[i+h] == s[j+h]:
                h += 1
            lcp[rank[i]] = h
            if h > 0:
                h -= 1
    return lcp

s = "banana"
sa = build_suffix_array(s)
print(sa)   # [5,3,1,0,4,2] -> ana,anana,banana,...`;

export const suffixArrayModule: VisualizationModule<{ str: string }> = {
  id: "string-suffix-array",
  slug: "suffix-array",
  title: "Suffix Array",
  category: ["algorithms", "string-algorithms"],
  difficulty: "advanced",
  timeComplexity: "O(n log² n)",
  spaceComplexity: "O(n)",
  description: "Sort all suffixes of a string to enable fast pattern searching and other string operations.",
  relatedTopics: ["suffix-tree", "kmp"],
  pythonCode: suffixArrayCode,
  codeSteps: [],
  defaultInput: { str: "banana" },
  generateSteps(input) {
    const { str } = input ?? { str: "banana" };
    const steps: AnimationStep[] = [];
    const n = str.length;

    // Generate all suffixes
    const suffixes: Array<{ idx: number; suffix: string }> = [];
    for (let i = 0; i < n; i++) {
      suffixes.push({ idx: i, suffix: str.slice(i) });
    }

    steps.push({
      stepNumber: 1,
      description: `Build suffix array for "${str}". Generate all ${n} suffixes.`,
      highlightLines: [1, 2],
      visualState: {
        type: "array1d",
        cells: suffixes.map((s, i) => ({ val: `${i}:${s.suffix}`, state: "default" as const })),
        label: "Suffixes (before sorting)",
      },
      variables: { str, n },
    });

    // Sort suffixes
    const sorted = [...suffixes].sort((a, b) => a.suffix < b.suffix ? -1 : 1);

    for (let i = 0; i < sorted.length; i++) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `Sorted position ${i}: suffix starting at index ${sorted[i].idx} → "${sorted[i].suffix}"`,
        highlightLines: [2],
        visualState: {
          type: "array1d",
          cells: sorted.map((s, j) => ({
            val: `${s.idx}:${s.suffix}`,
            state: j < i ? "computed" as const : j === i ? "active" as const : "default" as const,
          })),
          label: "Suffix Array (sorted)",
        },
        variables: { position: i, startIndex: sorted[i].idx, suffix: sorted[i].suffix },
      });
    }

    const sa = sorted.map((s) => s.idx);

    steps.push({
      stepNumber: steps.length + 1,
      description: `Suffix Array complete: [${sa.join(", ")}]. Enables O(m log n) pattern search.`,
      highlightLines: [3],
      visualState: {
        type: "array1d",
        cells: sa.map((v) => ({ val: v, state: "computed" as const })),
        label: "SA (suffix start indices)",
      },
      variables: { suffixArray: JSON.stringify(sa) },
    });

    return steps;
  },
};

// ── Suffix Tree (simplified) ─────────────────────────────────────────────────
const suffixTreeCode = `class SuffixTreeNode:
    def __init__(self):
        self.children = {}
        self.suffix_index = -1

def build_naive_suffix_tree(s):
    root = SuffixTreeNode()
    for i in range(len(s)):
        node = root
        for ch in s[i:]:
            if ch not in node.children:
                node.children[ch] = SuffixTreeNode()
            node = node.children[ch]
        node.suffix_index = i
    return root

def search(root, pattern):
    node = root
    for ch in pattern:
        if ch not in node.children:
            return False
        node = node.children[ch]
    return True

s = "banana"
root = build_naive_suffix_tree(s)
print(search(root, "ana"))  # True`;

export const suffixTreeModule: VisualizationModule<{ str: string }> = {
  id: "string-suffix-tree",
  slug: "suffix-tree",
  title: "Suffix Tree",
  category: ["algorithms", "string-algorithms"],
  difficulty: "advanced",
  timeComplexity: "O(n²) naive / O(n) Ukkonen",
  spaceComplexity: "O(n²)",
  description: "A compressed trie of all suffixes enabling O(m) pattern search, LCS, and other string queries.",
  relatedTopics: ["suffix-array", "trie"],
  pythonCode: suffixTreeCode,
  codeSteps: [],
  defaultInput: { str: "banana" },
  generateSteps(input) {
    const { str } = input ?? { str: "banana" };
    const steps: AnimationStep[] = [];

    steps.push({
      stepNumber: 1,
      description: `Build suffix tree for "${str}". Insert each suffix into a trie.`,
      highlightLines: [1, 2],
      visualState: {
        type: "array1d",
        cells: [{ val: "(root)", state: "active" as const }],
        label: "Suffix Tree construction",
      },
      variables: { str },
    });

    const suffixes: string[] = [];
    for (let i = 0; i < str.length; i++) {
      const suffix = str.slice(i);
      suffixes.push(suffix);
      steps.push({
        stepNumber: steps.length + 1,
        description: `Insert suffix ${i}: "${suffix}"`,
        highlightLines: [3, 4, 5],
        visualState: {
          type: "array1d",
          cells: suffixes.map((s, j) => ({
            val: s,
            state: j === suffixes.length - 1 ? "active" as const : "computed" as const,
          })),
          label: "Suffixes inserted",
        },
        variables: { suffixIndex: i, suffix },
      });
    }

    // Show compressed tree edges
    const edges = ["b→anana$", "a→na$|banana$|na$", "n→a$|ana$"];
    steps.push({
      stepNumber: steps.length + 1,
      description: `Suffix tree complete. ${str.length} suffixes → compressed trie with O(n) nodes after path compression.`,
      highlightLines: [13],
      visualState: {
        type: "array1d",
        cells: edges.map((e) => ({ val: e, state: "computed" as const })),
        label: "Compressed edges",
      },
      variables: { totalSuffixes: str.length, patternSearch: "O(m)" },
    });

    return steps;
  },
};
