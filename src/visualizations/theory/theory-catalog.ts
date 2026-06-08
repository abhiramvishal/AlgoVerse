import type { AnimationStep, VisualizationModule } from "@/types/visualization";

// Re-export individual theory implementations
export { dfaAutomataModule } from "@/visualizations/theory/dfa-automata";
export { nfaAutomataModule } from "@/visualizations/theory/nfa-automata";
export { epsilonNfaModule } from "@/visualizations/theory/epsilon-nfa";
export { pdaModule } from "@/visualizations/theory/pda";
export { turingMachineModule } from "@/visualizations/theory/turing-machine";
export { cfgModule } from "@/visualizations/theory/cfg";

// ── CYK Algorithm ─────────────────────────────────────────────────────────────
const cykCode = `def cyk(grammar, string):
    # grammar: dict mapping NT -> list of productions (each a list of symbols)
    n = len(string)
    # T[i][j] = set of non-terminals that derive string[i..j]
    T = [[set() for _ in range(n)] for _ in range(n)]
    # Fill length-1 cells
    for i, ch in enumerate(string):
        for nt, prods in grammar.items():
            if [ch] in prods:
                T[i][i].add(nt)
    # Fill length > 1
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            for k in range(i, j):
                for nt, prods in grammar.items():
                    for prod in prods:
                        if len(prod) == 2:
                            B, C = prod
                            if B in T[i][k] and C in T[k+1][j]:
                                T[i][j].add(nt)
    return 'S' in T[0][n-1]`;

export const cykAlgorithmModule: VisualizationModule<null> = {
  id: "theory-cyk",
  slug: "cyk-algorithm",
  title: "CYK Algorithm",
  category: ["theory", "formal-languages"],
  difficulty: "advanced",
  timeComplexity: "O(n³ · |G|)",
  spaceComplexity: "O(n²)",
  description: "Cocke-Younger-Kasami parsing for CNF grammars. Fills a triangular DP table to determine if a string belongs to a CFG.",
  relatedTopics: ["cfg", "ll1-parser"],
  pythonCode: cykCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    // Grammar in CNF: S→AB|BC, A→BA|a, B→CC|b, C→AB|a
    // Input: "baaba"
    const str = "baaba";
    const n = str.length;
    const T: string[][][] = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => [])
    );

    const grammar: Record<string, string[][]> = {
      S: [["A", "B"], ["B", "C"]],
      A: [["B", "A"], ["a"]],
      B: [["C", "C"], ["b"]],
      C: [["A", "B"], ["a"]],
    };

    const matrix = () => T.map((row) => row.map((cell) => cell.join(",") || "·"));
    const rowLabels = str.split("").map((c, i) => `${i}:${c}`);
    const colLabels = str.split("").map((c, i) => `${i}:${c}`);

    steps.push({
      stepNumber: 1,
      description: `CYK parsing of "${str}" with CNF grammar S→AB|BC, A→BA|a, B→CC|b, C→AB|a`,
      highlightLines: [1, 2, 3],
      visualState: { type: "table2d", matrix: matrix(), rowLabels, colLabels, title: "CYK Table T[i][j]" },
      variables: { input: str, grammarSize: Object.keys(grammar).length },
    });

    // Fill length-1
    for (let i = 0; i < n; i++) {
      for (const [nt, prods] of Object.entries(grammar)) {
        for (const prod of prods) {
          if (prod.length === 1 && prod[0] === str[i]) T[i][i].push(nt);
        }
      }
      steps.push({
        stepNumber: steps.length + 1,
        description: `T[${i}][${i}]: char '${str[i]}' → {${T[i][i].join(", ")}}`,
        highlightLines: [4, 5, 6, 7],
        visualState: { type: "table2d", matrix: matrix(), rowLabels, colLabels, activeCell: [i, i], title: "CYK Table" },
        variables: { i, char: str[i], nonterminals: T[i][i].join(",") },
      });
    }

    // Fill length > 1
    for (let length = 2; length <= n; length++) {
      for (let i = 0; i <= n - length; i++) {
        const j = i + length - 1;
        for (let k = i; k < j; k++) {
          for (const [nt, prods] of Object.entries(grammar)) {
            for (const prod of prods) {
              if (prod.length === 2) {
                const [B, C] = prod;
                if (T[i][k].includes(B) && T[k + 1][j].includes(C)) {
                  if (!T[i][j].includes(nt)) T[i][j].push(nt);
                }
              }
            }
          }
        }
        if (T[i][j].length > 0) {
          steps.push({
            stepNumber: steps.length + 1,
            description: `T[${i}][${j}] (len ${length}): {${T[i][j].join(", ")}}`,
            highlightLines: [10, 11, 12, 13],
            visualState: { type: "table2d", matrix: matrix(), rowLabels, colLabels, activeCell: [i, j], title: "CYK Table" },
            variables: { i, j, length, result: T[i][j].join(",") },
          });
        }
      }
    }

    const accepted = T[0][n - 1].includes("S");
    steps.push({
      stepNumber: steps.length + 1,
      description: `T[0][${n - 1}] = {${T[0][n - 1].join(", ")}}. String "${str}" is ${accepted ? "ACCEPTED" : "REJECTED"} by the grammar.`,
      highlightLines: [14],
      visualState: { type: "table2d", matrix: matrix(), rowLabels, colLabels, activeCell: [0, n - 1], title: "CYK Final" },
      variables: { accepted, startNT: T[0][n - 1].join(",") },
    });

    return steps;
  },
};

// ── Pumping Lemma ─────────────────────────────────────────────────────────────
const pumpingCode = `# Pumping lemma for regular languages:
# If L is regular, ∃ pumping length p such that
# every string w in L with |w| >= p can be split
# into w = xyz where:
#   1. |xy| <= p
#   2. |y| >= 1
#   3. xy^i·z in L for all i >= 0

# Classic example: L = {a^n b^n | n >= 1} is NOT regular
# Proof by contradiction:
# Assume L is regular with pumping length p
# Choose w = a^p b^p (|w| = 2p >= p)
# Any split w = xyz with |xy| <= p means y = a^k (k >= 1)
# Pump i=2: x·y²·z = a^(p+k) b^p != a^n b^n
# Contradiction! So L is not regular.`;

export const pumpingLemmaModule: VisualizationModule<{ str: string; pumpingLength: number }> = {
  id: "theory-pumping-lemma",
  slug: "pumping-lemma",
  title: "Pumping Lemma",
  category: ["theory", "formal-languages"],
  difficulty: "advanced",
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)",
  description: "The pumping lemma proves a language is not regular by showing no pumping length exists.",
  relatedTopics: ["dfa-automata", "cfg"],
  pythonCode: pumpingCode,
  codeSteps: [],
  defaultInput: { str: "aabb", pumpingLength: 2 },
  generateSteps(input) {
    const { str, pumpingLength: p } = input ?? { str: "aabb", pumpingLength: 2 };
    const steps: AnimationStep[] = [];
    const n = str.length;

    steps.push({
      stepNumber: 1,
      description: `Pumping Lemma demonstration. String w="${str}", pumping length p=${p}.`,
      highlightLines: [1, 2, 3],
      visualState: {
        type: "array1d",
        cells: str.split("").map((c) => ({ val: c, state: "default" as const })),
        label: `w = "${str}" (length ${n})`,
      },
      variables: { w: str, p, length: n },
    });

    // Find a valid split: xy where |xy| <= p, |y| >= 1
    const xLen = Math.floor(p / 2);
    const yLen = 1;
    const zLen = n - xLen - yLen;

    const x = str.slice(0, xLen);
    const y = str.slice(xLen, xLen + yLen);
    const z = str.slice(xLen + yLen);

    const cells = str.split("").map((c, i) => ({
      val: c,
      state: i < xLen ? "default" as const : i < xLen + yLen ? "active" as const : "computed" as const,
    }));

    steps.push({
      stepNumber: 2,
      description: `Split w = xyz: x="${x}"(grey), y="${y}"(active), z="${z}"(blue). |xy|=${xLen + yLen}≤${p}, |y|=${yLen}≥1.`,
      highlightLines: [4, 5, 6],
      visualState: {
        type: "array1d",
        cells,
        label: `x|y|z decomposition`,
        pointer: [
          { index: xLen, label: "y start" },
          { index: xLen + yLen - 1, label: "y end" },
        ],
      },
      variables: { x, y, z, xLen, yLen, zLen },
    });

    // Show pumping
    for (const i of [0, 2, 3]) {
      const pumped = x + y.repeat(i) + z;
      steps.push({
        stepNumber: steps.length + 1,
        description: `Pump i=${i}: x·y^${i}·z = "${pumped}". ${pumped === str.slice(0, p).repeat(1) ? "Still in L?" : "Check if in L = {a^n b^n}..."}`,
        highlightLines: [7],
        visualState: {
          type: "array1d",
          cells: pumped.split("").map((c, idx) => ({
            val: c,
            state: idx < xLen ? "default" as const
              : idx < xLen + yLen * i ? "active" as const
              : "computed" as const,
          })),
          label: `y pumped ${i} times`,
        },
        variables: { i, pumped, inLanguage: pumped === "aabb" ? "yes (i=1 trivial)" : "no (violates a^n b^n)" },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Contradiction: no valid split works for all i. Therefore L={a^n b^n} is NOT regular.`,
      highlightLines: [8, 9, 10],
      visualState: {
        type: "array1d",
        cells: str.split("").map((c) => ({ val: c, state: "highlighted" as const })),
        label: "Proof complete: L not regular",
      },
      variables: { conclusion: "L is not regular", method: "Pumping Lemma" },
    });

    return steps;
  },
};

// ── P vs NP ────────────────────────────────────────────────────────────────────
const pNpCode = `# P: Problems solvable in polynomial time
# Examples: sorting (O(n log n)), shortest path (Dijkstra O(E log V))

# NP: Problems verifiable in polynomial time
# (but no known poly-time solution)
# Example: given a proposed Hamiltonian cycle, verify in O(V)

# NP-Hard: at least as hard as hardest NP problems
# Example: TSP optimization, Halting Problem

# NP-Complete: in NP AND NP-Hard
# Example: SAT, 3-SAT, Vertex Cover, Clique

# Key question: P = NP? (Unsolved - $1M Millennium Prize)
# If P=NP: every NP problem has poly-time solution
# If P≠NP: some problems inherently hard (cryptography is safe)

# Cook-Levin Theorem: SAT is NP-Complete (1971)
# Karp's 21 NP-Complete Problems (1972)`;

export const pNpModule: VisualizationModule<null> = {
  id: "theory-p-np",
  slug: "p-np",
  title: "P vs NP",
  category: ["theory", "complexity"],
  difficulty: "advanced",
  timeComplexity: "Unknown",
  spaceComplexity: "Unknown",
  description: "The most famous open problem in CS: whether every problem verifiable in polynomial time is also solvable in polynomial time.",
  relatedTopics: ["np-completeness", "reduction"],
  pythonCode: pNpCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];

    const classes = [
      { name: "P", examples: ["Sorting", "Shortest Path", "MST", "Matching"], color: "#10b981" },
      { name: "NP", examples: ["Hamiltonian Path", "Graph Coloring", "Subset Sum"], color: "#6366f1" },
      { name: "NP-Complete", examples: ["SAT", "3-SAT", "Vertex Cover", "Clique"], color: "#f59e0b" },
      { name: "NP-Hard", examples: ["TSP optimization", "Halting Problem"], color: "#ef4444" },
    ];

    for (const cls of classes) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `${cls.name}: ${cls.name === "P" ? "Solvable" : cls.name === "NP" ? "Verifiable" : cls.name === "NP-Complete" ? "In NP + NP-Hard" : "At least as hard as NP"} in polynomial time. Examples: ${cls.examples.join(", ")}.`,
        highlightLines: [cls.name === "P" ? 1 : cls.name === "NP" ? 4 : cls.name === "NP-Hard" ? 8 : 11],
        visualState: {
          type: "array1d",
          cells: cls.examples.map((e) => ({ val: e, state: "computed" as const })),
          label: `${cls.name} Examples`,
        },
        variables: { class: cls.name, definition: cls.name === "P" ? "poly-time solvable" : "poly-time verifiable" },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: "P ⊆ NP ⊆ NP-Hard. NP-Complete = NP ∩ NP-Hard. The question P=NP? remains unsolved after 50+ years.",
      highlightLines: [14, 15, 16],
      visualState: {
        type: "array1d",
        cells: ["P⊆NP", "NP-C=NP∩NPH", "P=NP?", "$1M prize"].map((v) => ({ val: v, state: "highlighted" as const })),
        label: "Relationships",
      },
      variables: { status: "Open problem", prize: "$1,000,000 Millennium Prize" },
    });

    return steps;
  },
};

// ── NP-Completeness ─────────────────────────────────────────────────────────
const npCompletenessCode = `# NP-Complete problems are the "hardest" problems in NP
# To show problem X is NP-Complete:
#   1. Show X is in NP (poly-time verifier exists)
#   2. Show X is NP-Hard: reduce known NP-C problem Y to X
#      i.e., Y ≤p X (Y poly-time reduces to X)

# Classic reductions chain:
# Circuit-SAT → SAT → 3-SAT → Vertex Cover → Independent Set
#                           → Clique
# SAT → 3-Coloring → k-Coloring
# 3-SAT → Subset Sum → Knapsack

# Vertex Cover example:
# Instance: Graph G, integer k
# Question: Does G have a vertex cover of size ≤ k?
# Verifier: Given set S, check |S| ≤ k and every edge has endpoint in S`;

export const npCompletenessModule: VisualizationModule<null> = {
  id: "theory-np-completeness",
  slug: "np-completeness",
  title: "NP-Completeness",
  category: ["theory", "complexity"],
  difficulty: "advanced",
  timeComplexity: "NP-Hard",
  spaceComplexity: "Polynomial (verifier)",
  description: "NP-Complete problems are both in NP and NP-Hard, forming the class of hardest verifiable problems.",
  relatedTopics: ["p-np", "reduction"],
  pythonCode: npCompletenessCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];

    const problems = ["Circuit-SAT", "SAT", "3-SAT", "Vertex Cover", "Clique", "3-Coloring", "Subset Sum"];

    steps.push({
      stepNumber: 1,
      description: "NP-Complete: must prove (1) problem is in NP, (2) known NP-Complete problem reduces to it.",
      highlightLines: [1, 2, 3],
      visualState: {
        type: "array1d",
        cells: ["In NP?", "NP-Hard?", "⇒ NP-Complete!"].map((v) => ({ val: v, state: "active" as const })),
        label: "Requirements",
      },
      variables: { step1: "poly-time verifier", step2: "reduction from NP-Hard" },
    });

    const reductions = [
      { from: "Circuit-SAT", to: "SAT" },
      { from: "SAT", to: "3-SAT" },
      { from: "3-SAT", to: "Vertex Cover" },
      { from: "3-SAT", to: "Clique" },
      { from: "3-SAT", to: "3-Coloring" },
      { from: "3-SAT", to: "Subset Sum" },
    ];

    for (const [i, r] of reductions.entries()) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `Reduction: ${r.from} ≤p ${r.to}. Any instance of ${r.from} can be transformed to ${r.to} in polynomial time.`,
        highlightLines: [7, 8, 9],
        visualState: {
          type: "array1d",
          cells: problems.map((p, j) => ({
            val: p,
            state: j <= i + 1 ? "computed" as const : "default" as const,
          })),
          label: "Reduction chain",
        },
        variables: { from: r.from, to: r.to, step: i + 1 },
      });
    }

    return steps;
  },
};

// ── Polynomial Reduction ────────────────────────────────────────────────────
const reductionCode = `# Polynomial reduction: A ≤p B
# If A reduces to B in poly time, then:
#   - If B is easy, A is easy
#   - If A is hard, B is hard

# Example: 3-SAT ≤p Vertex Cover
# Given a 3-SAT formula with variables x1..xn and clauses c1..cm:
# 1. For each variable xi: add edge (xi, ¬xi) — "variable gadget"
# 2. For each clause (a ∨ b ∨ c): add triangle a—b—c — "clause gadget"
# 3. Add edges from each variable to its literal in each clause

# The reduction: formula is satisfiable iff
# graph has vertex cover of size n + 2m
# (n from variable gadgets + 2 from each triangle)`;

export const reductionModule: VisualizationModule<null> = {
  id: "theory-reduction",
  slug: "reduction",
  title: "Polynomial Reduction",
  category: ["theory", "complexity"],
  difficulty: "advanced",
  timeComplexity: "O(n^k) for some k",
  spaceComplexity: "O(n^k)",
  description: "Polynomial reductions show problems are equally hard by transforming one to another in poly time.",
  relatedTopics: ["np-completeness", "p-np"],
  pythonCode: reductionCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const stages = [
      { label: "Problem A", desc: "Input instance of problem A (e.g., 3-SAT formula)" },
      { label: "Reduction f", desc: "Apply poly-time transformation f to convert A → B instance" },
      { label: "Solver B", desc: "Run any solver for problem B on transformed instance" },
      { label: "Answer A", desc: "Answer to B instance = answer to original A instance" },
    ];

    for (const [i, s] of stages.entries()) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `Step ${i + 1}: ${s.desc}`,
        highlightLines: [i + 1],
        visualState: {
          type: "array1d",
          cells: stages.map((st, j) => ({
            val: st.label,
            state: j < i ? "computed" as const : j === i ? "active" as const : "default" as const,
          })),
          label: "Reduction pipeline",
        },
        variables: { stage: s.label, description: s.desc },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: "If A ≤p B and B ∈ P, then A ∈ P. If A is NP-Hard and A ≤p B, then B is NP-Hard.",
      highlightLines: [2, 3, 4],
      visualState: {
        type: "array1d",
        cells: ["A ≤p B", "B easy ⇒ A easy", "A hard ⇒ B hard"].map((v) => ({ val: v, state: "highlighted" as const })),
        label: "Key implication",
      },
      variables: { transitivity: "A ≤p B ≤p C implies A ≤p C" },
    });

    return steps;
  },
};

// ── Approximation Algorithms ─────────────────────────────────────────────────
const approximationCode = `# For NP-Hard optimization problems, find near-optimal solutions in poly time
# Approximation ratio: ALG(I) / OPT(I) ≤ α (for minimization)
# α is the approximation factor (e.g., α=2 means at most 2x optimal)

# 2-approximation for Vertex Cover:
def vertex_cover_2approx(graph):
    covered = set()
    edges = set(graph.edges())
    result = set()
    while edges:
        u, v = next(iter(edges))  # pick any uncovered edge
        result.add(u)
        result.add(v)
        # remove all edges incident to u or v
        edges = {e for e in edges if u not in e and v not in e}
    return result
# Proof: OPT must pick at least one endpoint of each chosen edge
# We pick both => |result| <= 2 * OPT

# Greedy approximation for Set Cover: O(log n)-approximation`;

export const approximationModule: VisualizationModule<null> = {
  id: "theory-approximation",
  slug: "approximation",
  title: "Approximation Algorithms",
  category: ["theory", "complexity"],
  difficulty: "advanced",
  timeComplexity: "Polynomial",
  spaceComplexity: "Polynomial",
  description: "Polynomial-time algorithms with provable approximation guarantees for NP-Hard optimization problems.",
  relatedTopics: ["p-np", "np-completeness"],
  pythonCode: approximationCode,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    // 2-approx vertex cover on a small graph
    // Graph: 0-1, 1-2, 2-3, 3-4, 0-4
    const graph = { nodes: [0, 1, 2, 3, 4], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [0, 4]] };
    const result: number[] = [];
    let remaining = [...graph.edges];

    steps.push({
      stepNumber: 1,
      description: "2-approximation for Vertex Cover. Graph has 5 nodes and 5 edges.",
      highlightLines: [5],
      visualState: {
        type: "graph",
        nodes: [
          { id: 0, label: "0", x: 200, y: 100 },
          { id: 1, label: "1", x: 320, y: 60 },
          { id: 2, label: "2", x: 400, y: 160 },
          { id: 3, label: "3", x: 340, y: 270 },
          { id: 4, label: "4", x: 180, y: 250 },
        ],
        edges: graph.edges.map(([f, t]) => ({ from: f, to: t, weight: 0, directed: false })),
        visited: [],
        frontier: [],
        current: -1,
      },
      variables: { nodes: 5, edges: 5 },
    });

    while (remaining.length > 0) {
      const [u, v] = remaining[0];
      result.push(u, v);
      remaining = remaining.filter(([a, b]) => a !== u && b !== u && a !== v && b !== v);

      steps.push({
        stepNumber: steps.length + 1,
        description: `Pick edge (${u},${v}). Add both endpoints ${u} and ${v} to cover. Remove all incident edges.`,
        highlightLines: [7, 8, 9, 10, 11],
        visualState: {
          type: "graph",
          nodes: [
            { id: 0, label: "0", x: 200, y: 100 },
            { id: 1, label: "1", x: 320, y: 60 },
            { id: 2, label: "2", x: 400, y: 160 },
            { id: 3, label: "3", x: 340, y: 270 },
            { id: 4, label: "4", x: 180, y: 250 },
          ],
          edges: graph.edges.map(([f, t]) => ({ from: f, to: t, weight: 0, directed: false })),
          visited: [...result],
          frontier: [u, v],
          current: -1,
        },
        variables: { chosen: `(${u},${v})`, coverSoFar: JSON.stringify(result) },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `2-approx Vertex Cover: {${[...new Set(result)].join(",")}}. Guaranteed ≤ 2×OPT.`,
      highlightLines: [13, 14],
      visualState: {
        type: "array1d",
        cells: [...new Set(result)].map((v) => ({ val: `v${v}`, state: "computed" as const })),
        label: "Approximate Cover (≤ 2×OPT)",
      },
      variables: { cover: JSON.stringify([...new Set(result)]), ratio: "≤ 2" },
    });

    return steps;
  },
};
