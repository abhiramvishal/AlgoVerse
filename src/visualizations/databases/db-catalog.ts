import { createPlaceholderModule } from "@/visualizations/placeholder";

// Indexing
export const btreeIndexModule = createPlaceholderModule(
  "btree-index", "btree-index", "B-Tree Index",
  ["databases", "indexing"], "intermediate",
);
export const hashIndexModule = createPlaceholderModule(
  "hash-index", "hash-index", "Hash Index",
  ["databases", "indexing"], "intermediate",
);
export const lsmIndexModule = createPlaceholderModule(
  "lsm-index", "lsm-index", "LSM Tree Index",
  ["databases", "indexing"], "advanced",
);
export const bitmapIndexModule = createPlaceholderModule(
  "bitmap-index", "bitmap-index", "Bitmap Index",
  ["databases", "indexing"], "intermediate",
);

// Query Processing
export const nestedLoopJoinModule = createPlaceholderModule(
  "nested-loop-join", "nested-loop-join", "Nested Loop Join",
  ["databases", "query-processing"], "intermediate",
);
export const hashJoinModule = createPlaceholderModule(
  "hash-join", "hash-join", "Hash Join",
  ["databases", "query-processing"], "intermediate",
);
export const sortMergeJoinModule = createPlaceholderModule(
  "sort-merge-join", "sort-merge-join", "Sort-Merge Join",
  ["databases", "query-processing"], "intermediate",
);
export const queryOptimizationModule = createPlaceholderModule(
  "query-optimization", "query-optimization", "Query Optimization",
  ["databases", "query-processing"], "advanced",
);

// Transactions
export const twoPhaseLockingModule = createPlaceholderModule(
  "two-phase-locking", "two-phase-locking", "Two-Phase Locking",
  ["databases", "transactions"], "intermediate",
);
export const mvccModule = createPlaceholderModule(
  "mvcc", "mvcc", "MVCC",
  ["databases", "transactions"], "advanced",
);
export const acidModule = createPlaceholderModule(
  "acid", "acid", "ACID Properties",
  ["databases", "transactions"], "beginner",
);

// Storage
export const heapFileModule = createPlaceholderModule(
  "heap-file", "heap-file", "Heap File Storage",
  ["databases", "storage"], "beginner",
);
export const rowVsColumnModule = createPlaceholderModule(
  "row-vs-column", "row-vs-column", "Row vs Column Storage",
  ["databases", "storage"], "intermediate",
);
export const walModule = createPlaceholderModule(
  "wal", "wal", "Write-Ahead Log",
  ["databases", "storage"], "intermediate",
);
