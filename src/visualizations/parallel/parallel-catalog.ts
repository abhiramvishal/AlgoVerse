import { createPlaceholderModule } from "@/visualizations/placeholder";

// Parallel Algorithms
export const parallelMergeSortModule = createPlaceholderModule(
  "parallel-merge-sort", "parallel-merge-sort", "Parallel Merge Sort",
  ["parallel", "parallel-algorithms"], "advanced",
);
export const bitonicSortModule = createPlaceholderModule(
  "bitonic-sort", "bitonic-sort", "Bitonic Sort",
  ["parallel", "parallel-algorithms"], "advanced",
);
export const oddEvenSortModule = createPlaceholderModule(
  "odd-even-sort", "odd-even-sort", "Odd-Even Sort",
  ["parallel", "parallel-algorithms"], "intermediate",
);
export const parallelPrefixModule = createPlaceholderModule(
  "parallel-prefix", "parallel-prefix", "Parallel Prefix Sum",
  ["parallel", "parallel-algorithms"], "intermediate",
);

// Concurrency Models
export const forkJoinModule = createPlaceholderModule(
  "fork-join", "fork-join", "Fork-Join Model",
  ["parallel", "concurrency-models"], "intermediate",
);
export const actorModelModule = createPlaceholderModule(
  "actor-model", "actor-model", "Actor Model",
  ["parallel", "concurrency-models"], "intermediate",
);
export const pipelineParallelModule = createPlaceholderModule(
  "pipeline-parallel", "pipeline-parallel", "Pipeline Parallelism",
  ["parallel", "concurrency-models"], "intermediate",
);

// GPU Computing
export const simdModule = createPlaceholderModule(
  "simd", "simd", "SIMD Operations",
  ["parallel", "gpu-computing"], "intermediate",
);
export const warpExecutionModule = createPlaceholderModule(
  "warp-execution", "warp-execution", "Warp Execution",
  ["parallel", "gpu-computing"], "advanced",
);
export const cudaMemoryModule = createPlaceholderModule(
  "cuda-memory", "cuda-memory", "CUDA Memory Hierarchy",
  ["parallel", "gpu-computing"], "advanced",
);
