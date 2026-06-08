import type { AnimationStep, VisualizationModule } from "@/types/visualization";

// NFA for (a|b)*b  — accepts strings ending in 'b'
// States: q0 (start), q1 (accepting*)
// Transitions: q0 --a--> {q0}, q0 --b--> {q0, q1}, q1 -- (none)

const NODES = [
  { id: "q0", label: "q0", x: 150, y: 160 },
  { id: "q1", label: "q1*", x: 380, y: 160 },
];

const EDGES = [
  { from: "q0", to: "q0", weight: 0, directed: true, label: "a,b" },
  { from: "q0", to: "q1", weight: 0, directed: true, label: "b" },
];

// NFA transition function: state -> symbol -> set of states
const DELTA: Record<string, Record<string, string[]>> = {
  q0: { a: ["q0"], b: ["q0", "q1"] },
  q1: { a: [], b: [] },
};

const ACCEPTING = new Set(["q1"]);

function nfaMove(states: string[], symbol: string): string[] {
  const result = new Set<string>();
  for (const s of states) {
    for (const ns of (DELTA[s]?.[symbol] ?? [])) {
      result.add(ns);
    }
  }
  return Array.from(result);
}

export const nfaAutomataModule: VisualizationModule<{ input: string }> = {
  id: "nfa-automata",
  slug: "nfa-automata",
  title: "NFA Simulation",
  category: ["theory", "automata"],
  difficulty: "intermediate",
  timeComplexity: "O(n·2^|Q|)",
  spaceComplexity: "O(2^|Q|)",
  description: "Non-deterministic Finite Automaton: multiple active states simultaneously. Simulates (a|b)*b — accepts strings ending in 'b'.",
  relatedTopics: ["dfa-automata", "epsilon-nfa"],
  pythonCode: `def nfa_simulate(delta, accepting, start, input_str):
    current = {start}
    for symbol in input_str:
        nxt = set()
        for s in current:
            nxt |= set(delta.get(s, {}).get(symbol, []))
        current = nxt
    return bool(current & accepting)`,
  codeSteps: [],
  defaultInput: { input: "ab" },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const str = input?.input ?? "ab";
    let activeStates = ["q0"];

    steps.push({
      stepNumber: steps.length + 1,
      description: `NFA starts with active states: {${activeStates.join(", ")}}. Input: "${str}". Accepts strings ending in 'b'.`,
      highlightLines: [1],
      visualState: {
        type: "graph",
        nodes: NODES,
        edges: EDGES,
        visited: [],
        frontier: activeStates,
        current: undefined,
        distances: {},
      },
      variables: { activeStates: `{${activeStates.join(", ")}}`, remaining: str },
    });

    for (let i = 0; i < str.length; i++) {
      const symbol = str[i];
      const nextStates = nfaMove(activeStates, symbol);
      steps.push({
        stepNumber: steps.length + 1,
        description: `Read '${symbol}': {${activeStates.join(", ")}} → {${nextStates.length ? nextStates.join(", ") : "∅"}}.`,
        highlightLines: [3, 4, 5],
        visualState: {
          type: "graph",
          nodes: NODES,
          edges: EDGES,
          visited: activeStates,
          frontier: nextStates,
          current: undefined,
          distances: {},
        },
        variables: { symbol, from: `{${activeStates.join(", ")}}`, to: `{${nextStates.join(", ")}}` },
      });
      activeStates = nextStates;
    }

    const accepted = activeStates.some(s => ACCEPTING.has(s));
    steps.push({
      stepNumber: steps.length + 1,
      description: `Input done. Active states: {${activeStates.join(", ")}}. ${accepted ? "ACCEPTED" : "REJECTED"} (${accepted ? "accepting state reachable" : "no accepting state active"}).`,
      highlightLines: [6],
      visualState: {
        type: "graph",
        nodes: NODES,
        edges: EDGES,
        visited: activeStates.filter(s => ACCEPTING.has(s)),
        frontier: activeStates.filter(s => !ACCEPTING.has(s)),
        current: undefined,
        distances: {},
      },
      variables: { activeStates: `{${activeStates.join(", ")}}`, accepted },
    });

    return steps;
  },
};
