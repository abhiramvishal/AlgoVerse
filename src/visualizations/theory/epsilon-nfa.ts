import type { AnimationStep, VisualizationModule } from "@/types/visualization";

// ε-NFA for a?b  (optionally 'a' then 'b')
// States: q0 --(ε)--> q1 --(a)--> q2, q0 --(ε)--> q2; q2 --(b)--> q3*
// Simplified: q0 --ε--> q1, q0 --ε--> q2, q1 --a--> q2, q2 --b--> q3

const NODES = [
  { id: "q0", label: "q0", x: 80,  y: 160 },
  { id: "q1", label: "q1", x: 220, y: 80  },
  { id: "q2", label: "q2", x: 360, y: 160 },
  { id: "q3", label: "q3*", x: 500, y: 160 },
];

const EDGES = [
  { from: "q0", to: "q1", weight: 0, directed: true, label: "ε" },
  { from: "q0", to: "q2", weight: 0, directed: true, label: "ε" },
  { from: "q1", to: "q2", weight: 0, directed: true, label: "a" },
  { from: "q2", to: "q3", weight: 0, directed: true, label: "b" },
];

const EPSILON_MOVES: Record<string, string[]> = {
  q0: ["q1", "q2"],
  q1: [],
  q2: [],
  q3: [],
};

const DELTA: Record<string, Record<string, string[]>> = {
  q0: {},
  q1: { a: ["q2"] },
  q2: { b: ["q3"] },
  q3: {},
};

const ACCEPTING = new Set(["q3"]);

function epsilonClosure(states: string[]): string[] {
  const result = new Set(states);
  const queue = [...states];
  while (queue.length > 0) {
    const s = queue.shift()!;
    for (const ns of (EPSILON_MOVES[s] ?? [])) {
      if (!result.has(ns)) {
        result.add(ns);
        queue.push(ns);
      }
    }
  }
  return Array.from(result);
}

function move(states: string[], symbol: string): string[] {
  const result = new Set<string>();
  for (const s of states) {
    for (const ns of (DELTA[s]?.[symbol] ?? [])) {
      result.add(ns);
    }
  }
  return Array.from(result);
}

export const epsilonNfaModule: VisualizationModule<{ input: string }> = {
  id: "epsilon-nfa",
  slug: "epsilon-nfa",
  title: "ε-NFA Simulation",
  category: ["theory", "automata"],
  difficulty: "intermediate",
  timeComplexity: "O(n·|Q|²)",
  spaceComplexity: "O(|Q|)",
  description: "ε-NFA with epsilon-closure computation. Models a?b — accepts 'b' or 'ab'. ε-transitions are taken for free.",
  relatedTopics: ["nfa-automata", "dfa-automata"],
  pythonCode: `def epsilon_closure(states, epsilon_moves):
    result = set(states)
    queue = list(states)
    while queue:
        s = queue.pop()
        for ns in epsilon_moves.get(s, []):
            if ns not in result:
                result.add(ns)
                queue.append(ns)
    return result`,
  codeSteps: [],
  defaultInput: { input: "a" },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const str = input?.input ?? "a";

    // Initial epsilon-closure of {q0}
    let activeStates = epsilonClosure(["q0"]);

    steps.push({
      stepNumber: steps.length + 1,
      description: `ε-closure({q0}) = {${activeStates.join(", ")}}. These are all states reachable via ε from q0.`,
      highlightLines: [1, 2, 3, 4, 5],
      visualState: {
        type: "graph",
        nodes: NODES,
        edges: EDGES,
        visited: [],
        frontier: activeStates,
        current: undefined,
        distances: {},
      },
      variables: { activeStates: `{${activeStates.join(", ")}}`, input: str },
    });

    for (let i = 0; i < str.length; i++) {
      const symbol = str[i];
      const moved = move(activeStates, symbol);
      const closure = epsilonClosure(moved);

      steps.push({
        stepNumber: steps.length + 1,
        description: `Read '${symbol}': move({${activeStates.join(", ")}}, '${symbol}') = {${moved.join(", ") || "∅"}}.`,
        highlightLines: [2],
        visualState: {
          type: "graph",
          nodes: NODES,
          edges: EDGES,
          visited: activeStates,
          frontier: moved,
          current: undefined,
          distances: {},
        },
        variables: { symbol, after_move: `{${moved.join(", ")}}` },
      });

      if (moved.length > 0) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `ε-closure({${moved.join(", ")}}) = {${closure.join(", ")}}.`,
          highlightLines: [3, 4, 5],
          visualState: {
            type: "graph",
            nodes: NODES,
            edges: EDGES,
            visited: [],
            frontier: closure,
            current: undefined,
            distances: {},
          },
          variables: { after_closure: `{${closure.join(", ")}}` },
        });
      }

      activeStates = closure;
    }

    const accepted = activeStates.some(s => ACCEPTING.has(s));
    steps.push({
      stepNumber: steps.length + 1,
      description: `Done. Active states: {${activeStates.join(", ")}}. ${accepted ? "ACCEPTED" : "REJECTED"}.`,
      highlightLines: [6],
      visualState: {
        type: "graph",
        nodes: NODES,
        edges: EDGES,
        visited: activeStates.filter(s => ACCEPTING.has(s)),
        frontier: [],
        current: undefined,
        distances: {},
      },
      variables: { activeStates: `{${activeStates.join(", ")}}`, accepted },
    });

    return steps;
  },
};
