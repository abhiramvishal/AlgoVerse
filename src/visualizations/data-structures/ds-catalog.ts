import { createPlaceholderModule } from "@/visualizations/placeholder";

// Arrays & Strings
export const linearSearchModule = createPlaceholderModule(
  "linear-search", "linear-search", "Linear Search",
  ["data-structures", "arrays"], "beginner",
);
export const twoPointersModule = createPlaceholderModule(
  "two-pointers", "two-pointers", "Two Pointers",
  ["data-structures", "arrays"], "beginner",
);
export const slidingWindowModule = createPlaceholderModule(
  "sliding-window", "sliding-window", "Sliding Window",
  ["data-structures", "arrays"], "intermediate",
);
export const kadaneModule = createPlaceholderModule(
  "kadane", "kadane", "Kadane's Algorithm",
  ["data-structures", "arrays"], "intermediate",
);

// Linked Lists
export const doublyLinkedListModule = createPlaceholderModule(
  "doubly-linked-list", "doubly-linked-list", "Doubly Linked List",
  ["data-structures", "linked-lists"], "beginner",
);
export const circularLinkedListModule = createPlaceholderModule(
  "circular-linked-list", "circular-linked-list", "Circular Linked List",
  ["data-structures", "linked-lists"], "intermediate",
);
export const skipListModule = createPlaceholderModule(
  "skip-list", "skip-list", "Skip List",
  ["data-structures", "linked-lists"], "advanced",
);

// Stacks
export const stackModule = createPlaceholderModule(
  "stack", "stack", "Stack Operations",
  ["data-structures", "stacks"], "beginner",
);
export const monotonicStackModule = createPlaceholderModule(
  "monotonic-stack", "monotonic-stack", "Monotonic Stack",
  ["data-structures", "stacks"], "intermediate",
);

// Queues
export const queueModule = createPlaceholderModule(
  "queue", "queue", "Queue Operations",
  ["data-structures", "queues"], "beginner",
);
export const dequeModule = createPlaceholderModule(
  "deque", "deque", "Double-Ended Queue",
  ["data-structures", "queues"], "intermediate",
);
export const priorityQueueModule = createPlaceholderModule(
  "priority-queue", "priority-queue", "Priority Queue",
  ["data-structures", "queues"], "intermediate",
);
export const circularQueueModule = createPlaceholderModule(
  "circular-queue", "circular-queue", "Circular Queue",
  ["data-structures", "queues"], "beginner",
);

// Hash Tables (additional open addressing)
export const hashTableLinearProbingModule = createPlaceholderModule(
  "hash-table-linear-probing", "hash-table-linear-probing", "Hash Table (Linear Probing)",
  ["data-structures", "hash-tables"], "intermediate",
);
export const hashTableQuadraticProbingModule = createPlaceholderModule(
  "hash-table-quadratic-probing", "hash-table-quadratic-probing", "Hash Table (Quadratic Probing)",
  ["data-structures", "hash-tables"], "intermediate",
);
export const hashTableDoubleHashingModule = createPlaceholderModule(
  "hash-table-double-hashing", "hash-table-double-hashing", "Hash Table (Double Hashing)",
  ["data-structures", "hash-tables"], "intermediate",
);

// Trees (additional)
export const avlTreeModule = createPlaceholderModule(
  "avl-tree", "avl-tree", "AVL Tree",
  ["data-structures", "trees"], "advanced",
);
export const redBlackTreeModule = createPlaceholderModule(
  "red-black-tree", "red-black-tree", "Red-Black Tree",
  ["data-structures", "trees"], "advanced",
);
export const bTreeModule = createPlaceholderModule(
  "b-tree", "b-tree", "B-Tree",
  ["data-structures", "trees"], "advanced",
);
export const trieModule = createPlaceholderModule(
  "trie", "trie", "Trie",
  ["data-structures", "trees"], "intermediate",
);
export const segmentTreeModule = createPlaceholderModule(
  "segment-tree", "segment-tree", "Segment Tree",
  ["data-structures", "trees"], "advanced",
);
export const fenwickTreeModule = createPlaceholderModule(
  "fenwick-tree", "fenwick-tree", "Fenwick Tree (BIT)",
  ["data-structures", "trees"], "advanced",
);
export const splayTreeModule = createPlaceholderModule(
  "splay-tree", "splay-tree", "Splay Tree",
  ["data-structures", "trees"], "advanced",
);

// Heaps
export const minHeapModule = createPlaceholderModule(
  "min-heap", "min-heap", "Min Heap",
  ["data-structures", "heaps"], "intermediate",
);
export const maxHeapModule = createPlaceholderModule(
  "max-heap", "max-heap", "Max Heap",
  ["data-structures", "heaps"], "intermediate",
);
export const fibonacciHeapModule = createPlaceholderModule(
  "fibonacci-heap", "fibonacci-heap", "Fibonacci Heap",
  ["data-structures", "heaps"], "advanced",
);

// Graph Representations
export const adjacencyListModule = createPlaceholderModule(
  "adjacency-list", "adjacency-list", "Adjacency List",
  ["data-structures", "graphs-ds"], "beginner",
);
export const adjacencyMatrixModule = createPlaceholderModule(
  "adjacency-matrix", "adjacency-matrix", "Adjacency Matrix",
  ["data-structures", "graphs-ds"], "beginner",
);
export const edgeListModule = createPlaceholderModule(
  "edge-list", "edge-list", "Edge List",
  ["data-structures", "graphs-ds"], "beginner",
);

// Advanced Data Structures
export const unionFindModule = createPlaceholderModule(
  "union-find", "union-find", "Union-Find (DSU)",
  ["data-structures", "advanced-ds"], "intermediate",
);
export const lruCacheModule = createPlaceholderModule(
  "lru-cache", "lru-cache", "LRU Cache",
  ["data-structures", "advanced-ds"], "intermediate",
);
export const lfuCacheModule = createPlaceholderModule(
  "lfu-cache", "lfu-cache", "LFU Cache",
  ["data-structures", "advanced-ds"], "advanced",
);
export const bloomFilterModule = createPlaceholderModule(
  "bloom-filter", "bloom-filter", "Bloom Filter",
  ["data-structures", "advanced-ds"], "intermediate",
);
export const lsmTreeModule = createPlaceholderModule(
  "lsm-tree", "lsm-tree", "LSM Tree",
  ["data-structures", "advanced-ds"], "advanced",
);
export const ropeDsModule = createPlaceholderModule(
  "rope-ds", "rope-ds", "Rope (String DS)",
  ["data-structures", "advanced-ds"], "advanced",
);
