import { createPlaceholderModule } from "@/visualizations/placeholder";

// CPU
export const instructionPipelineModule = createPlaceholderModule(
  "instruction-pipeline", "instruction-pipeline", "Instruction Pipeline",
  ["computer-architecture", "cpu"], "intermediate",
);
export const branchPredictionModule = createPlaceholderModule(
  "branch-prediction", "branch-prediction", "Branch Prediction",
  ["computer-architecture", "cpu"], "advanced",
);
export const outOfOrderModule = createPlaceholderModule(
  "out-of-order", "out-of-order", "Out-of-Order Execution",
  ["computer-architecture", "cpu"], "advanced",
);
export const superscalarModule = createPlaceholderModule(
  "superscalar", "superscalar", "Superscalar Processor",
  ["computer-architecture", "cpu"], "advanced",
);

// Cache Memory
export const directMappedCacheModule = createPlaceholderModule(
  "direct-mapped-cache", "direct-mapped-cache", "Direct Mapped Cache",
  ["computer-architecture", "cache"], "intermediate",
);
export const setAssociativeCacheModule = createPlaceholderModule(
  "set-associative-cache", "set-associative-cache", "Set-Associative Cache",
  ["computer-architecture", "cache"], "intermediate",
);
export const fullyAssociativeCacheModule = createPlaceholderModule(
  "fully-associative-cache", "fully-associative-cache", "Fully Associative Cache",
  ["computer-architecture", "cache"], "intermediate",
);
export const cacheReplacementModule = createPlaceholderModule(
  "cache-replacement", "cache-replacement", "Cache Replacement Policies",
  ["computer-architecture", "cache"], "intermediate",
);
export const cacheCoherenceModule = createPlaceholderModule(
  "cache-coherence", "cache-coherence", "Cache Coherence (MESI)",
  ["computer-architecture", "cache"], "advanced",
);

// Memory Hierarchy
export const memoryHierarchyVizModule = createPlaceholderModule(
  "memory-hierarchy-viz", "memory-hierarchy-viz", "Memory Hierarchy",
  ["computer-architecture", "memory-hierarchy"], "beginner",
);
export const virtualMemoryArchModule = createPlaceholderModule(
  "virtual-memory-arch", "virtual-memory-arch", "Virtual Memory",
  ["computer-architecture", "memory-hierarchy"], "intermediate",
);
export const tlbModule = createPlaceholderModule(
  "tlb", "tlb", "TLB",
  ["computer-architecture", "memory-hierarchy"], "intermediate",
);

// I/O Systems
export const dmaModule = createPlaceholderModule(
  "dma", "dma", "DMA",
  ["computer-architecture", "io-systems"], "intermediate",
);
export const interruptsModule = createPlaceholderModule(
  "interrupts", "interrupts", "Interrupts",
  ["computer-architecture", "io-systems"], "intermediate",
);
export const busesModule = createPlaceholderModule(
  "buses", "buses", "Bus Architecture",
  ["computer-architecture", "io-systems"], "beginner",
);
