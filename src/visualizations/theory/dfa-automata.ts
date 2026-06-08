import type { AnimationStep, VisualizationModule } from "@/types/visualization";

// DFA that accepts strings ending in 'a'
// States: q0 (start, non-accepting), q1 (accepting*)
// Transitions: q0 --a--> q1, q0 --b--> q0, q1 --a--> q1, q1 --b--> q0

const NODES = [
  { id: "q0", label: "q0", x: 150, y: 160 },
  { id: "q1", label: "q1*", x: 380, y: 160 },
];

const EDGES = [
  { from: "q0", to: "q1", weight: 0, directed: true, label: "a" },
  { from: "q0", to: "q0", weight: 0, directed: true, label: "b" },
  { from: "q1", to: "q1", weight: 0, directed: true, label: "a" },
  { from: "q1", to: "q0", weight: 0, directed: true, label: "b" },
];

const TRANSITIONS: Record<string, Record<string, string>> = {
  q0: { a: "q1", b: "q0" },
  q1: { a: "q1", b: "q0" },
};

const ACCEPTING = new Set(["q1"]);

export const dfaAutomataModule: VisualizationModule<{ input: string }> = {
  id: "dfa-automata",
  slug: "dfa-automata",
  title: "DFA Simulation",
  category: ["theory", "automata"],
  difficulty: "intermediate",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description: "Deterministic Finite Automaton simulation. Reads input symbols one by one and transitions between states. Accepts strings ending in 'a'.",
  relatedTopics: ["nfa-automata", "epsilon-nfa"],
  pythonCode: `def dfa_simulate(transitions, accepting, start, input_str):
    state = start
    for symbol in input_str:
        state = transitions[state][symbol]
    return state in accepting`,
  codeSteps: [],
  defaultInput: { input: "aabba" },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const str = input?.input ?? "aabba";
    let state = "q0";

    steps.push({
      stepNumber: steps.length + 1,
      description: `DFA starts in state q0. Input: "${str}". This DFA accepts strings ending in 'a'.`,
      highlightLines: [1],
      visualState: {
        type: "graph",
        nodes: NODES,
        edges: EDGES,
        visited: [],
        frontier: [],
        current: state,
        distances: {},
      },
      variables: { state, remaining: str, accepted: "?" },
    });

    for (let i = 0; i < str.length; i++) {
      const symbol = str[i];
      const nextState = TRANSITIONS[state]?.[symbol] ?? state;
      steps.push({
        stepNumber: steps.length + 1,
        description: `Read '${symbol}': transition ${state} --${symbol}--> ${nextState}.`,
        highlightLines: [3, 4],
        visualState: {
          type: "graph",
          nodes: NODES,
          edges: EDGES,
          visited: [],
          frontier: [state],
          current: nextState,
          distances: {},
        },
        variables: { state: nextState, symbol, position: i, remaining: str.slice(i + 1) },
      });
      state = nextState;
    }

    const accepted = ACCEPTING.has(state);
    steps.push({
      stepNumber: steps.length + 1,
      description: `Input consumed. Final state: ${state}. ${accepted ? "ACCEPTED (accepting state)" : "REJECTED (non-accepting state)"}.`,
      highlightLines: [5],
      visualState: {
        type: "graph",
        nodes: NODES,
        edges: EDGES,
        visited: accepted ? [state] : [],
        frontier: [],
        current: state,
        distances: {},
      },
      variables: { state, accepted },
    });

    return steps;
  },
};
