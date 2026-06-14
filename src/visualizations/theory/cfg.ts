import type { AnimationStep, VisualizationModule } from "@/types/visualization";

// CFG derivation for S→aSb|ε, input "aabb"
// Parse tree: S -> a S b -> a a S b b -> a a ε b b = aabb

export const cfgModule: VisualizationModule<{ grammar: string; input: string }> = {
  id: "cfg",
  slug: "cfg",
  title: "Context-Free Grammar",
  category: ["theory", "formal-languages"],
  difficulty: "intermediate",
  timeComplexity: "O(n^3)",
  spaceComplexity: "O(n^2)",
  description: "Context-Free Grammar derivation. Shows parse tree for S→aSb|ε applied to 'aabb'.",
  relatedTopics: ["cyk-algorithm", "pda"],
  pythonCode: `# Grammar: S -> aSb | eps
# Leftmost derivation of 'aabb':
# S => aSb => aaSbb => aaebb => aabb`,
  codeSteps: [],
  defaultInput: { grammar: "S→aSb|ε", input: "aabb" },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const str = String(input?.input ?? "").trim();

    // This module models the canonical balanced grammar S → aSb | ε,
    // whose language is { aⁿbⁿ | n ≥ 0 }. Derive the supplied input string.
    const m = /^(a*)(b*)$/.exec(str);
    const na = m ? m[1].length : -1;
    const nb = m ? m[2].length : -1;
    const inLanguage = !!m && na === nb;

    // Rejection case — show why the string isn't derivable.
    if (!inLanguage) {
      steps.push({
        stepNumber: 1,
        description: `"${str}" is NOT in L(S→aSb|ε) = { aⁿbⁿ }. ${
          !m ? "Must be some a's followed by some b's." : `Counts differ: ${na} a's vs ${nb} b's.`
        }`,
        highlightLines: [1],
        visualState: { type: "tree", nodes: [{ id: "0", label: "S", x: 260, y: 40 }], highlighted: ["0"], comparing: [], inserted: [], found: [] },
        variables: { input: str, inLanguage: false, aCount: na, bCount: nb },
      });
      return steps;
    }

    const n = na; // number of S→aSb expansions
    // Build the parse tree dynamically. Each level d (0..n-1) expands an S
    // into a, S, b; the final center S becomes ε.
    const nodes: { id: string; label: string; x: number; y: number }[] = [];
    const cx = 260;
    const topY = 40;
    const dy = Math.max(40, Math.min(70, 300 / (n + 1)));
    let nodeOrder: string[] = []; // ids in derivation reveal order

    // node id scheme: level prefix
    for (let d = 0; d <= n; d++) {
      const y = topY + d * dy;
      const spread = Math.max(26, (n - d) * 46);
      // center S (or ε at the bottom)
      nodes.push({ id: `S${d}`, label: d === n ? "ε" : "S", x: cx, y });
      if (d < n) {
        nodes.push({ id: `a${d}`, label: "a", x: cx - spread, y: y + dy });
        nodes.push({ id: `b${d}`, label: "b", x: cx + spread, y: y + dy });
      }
    }

    // Derivation snapshots: reveal level by level
    const sentential = (d: number) =>
      d >= n ? "a".repeat(n) + "b".repeat(n)
             : "a".repeat(d) + "S" + "b".repeat(d);

    nodeOrder = ["S0"];
    steps.push(snap(0));
    for (let d = 0; d < n; d++) {
      nodeOrder.push(`a${d}`, `S${d + 1}`, `b${d}`);
      steps.push(snap(d + 1));
    }

    function snap(d: number): AnimationStep {
      const visible = new Set(nodeOrder);
      const current = d >= n ? `S${n}` : `S${d}`;
      const desc =
        d === 0 ? `Start symbol S. Grammar S → aSb | ε. Deriving "${str}".`
        : d < n ? `Apply S → aSb (${d}/${n}): sentential form = ${sentential(d)}.`
        : `Apply S → ε: final string = "${str}". Accepted ✓`;
      return {
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: [1],
        visualState: {
          type: "tree",
          nodes: nodes.filter((nd) => visible.has(nd.id)),
          highlighted: [current],
          comparing: [], inserted: [], found: [],
        },
        variables: { sentential: sentential(d), n, input: str },
      };
    }

    return steps;
  },
};
