import { createPlaceholderModule } from "@/visualizations/placeholder";

// Quantum Gates
export const hadamardGateModule = createPlaceholderModule(
  "hadamard-gate", "hadamard-gate", "Hadamard Gate",
  ["quantum", "quantum-gates"], "intermediate",
);
export const cnotGateModule = createPlaceholderModule(
  "cnot-gate", "cnot-gate", "CNOT Gate",
  ["quantum", "quantum-gates"], "intermediate",
);
export const toffoliGateModule = createPlaceholderModule(
  "toffoli-gate", "toffoli-gate", "Toffoli Gate",
  ["quantum", "quantum-gates"], "advanced",
);
export const pauliGatesModule = createPlaceholderModule(
  "pauli-gates", "pauli-gates", "Pauli Gates",
  ["quantum", "quantum-gates"], "intermediate",
);

// Quantum Algorithms
export const groverSearchModule = createPlaceholderModule(
  "grover-search", "grover-search", "Grover's Search",
  ["quantum", "quantum-algorithms"], "advanced",
);
export const shorFactoringModule = createPlaceholderModule(
  "shor-factoring", "shor-factoring", "Shor's Factoring Algorithm",
  ["quantum", "quantum-algorithms"], "advanced",
);
export const quantumTeleportationModule = createPlaceholderModule(
  "quantum-teleportation", "quantum-teleportation", "Quantum Teleportation",
  ["quantum", "quantum-algorithms"], "advanced",
);
export const deutschJozsaModule = createPlaceholderModule(
  "deutsch-jozsa", "deutsch-jozsa", "Deutsch-Jozsa Algorithm",
  ["quantum", "quantum-algorithms"], "advanced",
);

// Concepts
export const superpositionModule = createPlaceholderModule(
  "superposition", "superposition", "Superposition",
  ["quantum", "quantum-concepts"], "beginner",
);
export const entanglementModule = createPlaceholderModule(
  "entanglement", "entanglement", "Quantum Entanglement",
  ["quantum", "quantum-concepts"], "intermediate",
);
export const quantumErrorModule = createPlaceholderModule(
  "quantum-error", "quantum-error", "Quantum Error Correction",
  ["quantum", "quantum-concepts"], "advanced",
);
