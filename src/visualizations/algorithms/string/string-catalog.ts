import { createPlaceholderModule } from "@/visualizations/placeholder";

export const kmpModule = createPlaceholderModule(
  "kmp", "kmp", "KMP Pattern Matching",
  ["algorithms", "string-algorithms"], "intermediate",
);

export const rabinKarpModule = createPlaceholderModule(
  "rabin-karp", "rabin-karp", "Rabin-Karp",
  ["algorithms", "string-algorithms"], "intermediate",
);

export const boyerMooreModule = createPlaceholderModule(
  "boyer-moore", "boyer-moore", "Boyer-Moore",
  ["algorithms", "string-algorithms"], "advanced",
);

export const zAlgorithmModule = createPlaceholderModule(
  "z-algorithm", "z-algorithm", "Z-Algorithm",
  ["algorithms", "string-algorithms"], "intermediate",
);

export const ahoCorasickModule = createPlaceholderModule(
  "aho-corasick", "aho-corasick", "Aho-Corasick",
  ["algorithms", "string-algorithms"], "advanced",
);

export const manacherModule = createPlaceholderModule(
  "manacher", "manacher", "Manacher's Algorithm",
  ["algorithms", "string-algorithms"], "advanced",
);

export const suffixArrayModule = createPlaceholderModule(
  "suffix-array", "suffix-array", "Suffix Array",
  ["algorithms", "string-algorithms"], "advanced",
);

export const suffixTreeModule = createPlaceholderModule(
  "suffix-tree", "suffix-tree", "Suffix Tree",
  ["algorithms", "string-algorithms"], "advanced",
);
