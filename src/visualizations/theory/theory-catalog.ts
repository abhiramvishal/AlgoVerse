import { createPlaceholderModule } from "@/visualizations/placeholder";

// Automata Theory
export const dfaAutomataModule = createPlaceholderModule(
  "dfa-automata", "dfa-automata", "DFA",
  ["theory", "automata"], "intermediate",
);
export const nfaAutomataModule = createPlaceholderModule(
  "nfa-automata", "nfa-automata", "NFA",
  ["theory", "automata"], "intermediate",
);
export const epsilonNfaModule = createPlaceholderModule(
  "epsilon-nfa", "epsilon-nfa", "ε-NFA",
  ["theory", "automata"], "intermediate",
);
export const pdaModule = createPlaceholderModule(
  "pda", "pda", "Pushdown Automaton",
  ["theory", "automata"], "advanced",
);
export const turingMachineModule = createPlaceholderModule(
  "turing-machine", "turing-machine", "Turing Machine",
  ["theory", "automata"], "advanced",
);

// Formal Languages
export const cfgModule = createPlaceholderModule(
  "cfg", "cfg", "Context-Free Grammar",
  ["theory", "formal-languages"], "intermediate",
);
export const cykAlgorithmModule = createPlaceholderModule(
  "cyk-algorithm", "cyk-algorithm", "CYK Algorithm",
  ["theory", "formal-languages"], "advanced",
);
export const pumpingLemmaModule = createPlaceholderModule(
  "pumping-lemma", "pumping-lemma", "Pumping Lemma",
  ["theory", "formal-languages"], "advanced",
);

// Complexity Theory
export const pNpModule = createPlaceholderModule(
  "p-np", "p-np", "P vs NP",
  ["theory", "complexity"], "advanced",
);
export const npCompletenessModule = createPlaceholderModule(
  "np-completeness", "np-completeness", "NP-Completeness",
  ["theory", "complexity"], "advanced",
);
export const reductionModule = createPlaceholderModule(
  "reduction", "reduction", "Polynomial Reduction",
  ["theory", "complexity"], "advanced",
);
export const approximationModule = createPlaceholderModule(
  "approximation", "approximation", "Approximation Algorithms",
  ["theory", "complexity"], "advanced",
);
