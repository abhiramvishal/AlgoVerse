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

    // Parse tree nodes built incrementally
    // Tree: root S (id:0) -> a(1), S(2), b(3)
    //       S(2) -> a(4), S(5), b(6)
    //       S(5) -> ε(7)

    const allNodes = [
      { id: "0", label: "S",  x: 260, y: 40  },
      { id: "1", label: "a",  x: 120, y: 130 },
      { id: "2", label: "S",  x: 260, y: 130 },
      { id: "3", label: "b",  x: 400, y: 130 },
      { id: "4", label: "a",  x: 200, y: 220 },
      { id: "5", label: "S",  x: 260, y: 220 },
      { id: "6", label: "b",  x: 320, y: 220 },
      { id: "7", label: "ε",  x: 260, y: 310 },
    ];

    const allEdges = [
      { from: "0", to: "1", weight: 0, directed: true },
      { from: "0", to: "2", weight: 0, directed: true },
      { from: "0", to: "3", weight: 0, directed: true },
      { from: "2", to: "4", weight: 0, directed: true },
      { from: "2", to: "5", weight: 0, directed: true },
      { from: "2", to: "6", weight: 0, directed: true },
      { from: "5", to: "7", weight: 0, directed: true },
    ];

    const snapshots = [
      { nodes: 1, edges: 0, current: "0", desc: `Start: S. Grammar: S → aSb | ε. Deriving "aabb".`, sentinel: "S" },
      { nodes: 4, edges: 3, current: "2", desc: `Apply S → aSb: sentential form = a S b.`, sentinel: "aSb" },
      { nodes: 7, edges: 6, current: "5", desc: `Apply S → aSb again: sentential form = a a S b b.`, sentinel: "aaSbb" },
      { nodes: 8, edges: 7, current: "7", desc: `Apply S → ε: sentential form = a a ε b b = "aabb". Derivation complete!`, sentinel: "aabb" },
    ];

    for (const snap of snapshots) {
      steps.push({
        stepNumber: steps.length + 1,
        description: snap.desc,
        highlightLines: [1],
        visualState: {
          type: "tree",
          nodes: allNodes.slice(0, snap.nodes),
          highlighted: [snap.current],
          comparing: [],
          inserted: [],
          found: [],
        },
        variables: { sentential: snap.sentinel, derivationStep: steps.length + 1 },
      });
    }

    return steps;
  },
};
