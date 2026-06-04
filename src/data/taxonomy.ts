import type { VisualizationTaxonomyNode } from "@/types/visualization";

export const taxonomy: VisualizationTaxonomyNode[] = [
  {
    id: "data-structures",
    label: "Data Structures",
    children: [
      {
        id: "arrays",
        label: "Arrays & Strings",
        children: [
          { id: "binary-search", label: "Binary Search" },
          { id: "linear-search", label: "Linear Search" },
          { id: "two-pointers", label: "Two Pointers" },
          { id: "sliding-window", label: "Sliding Window" },
          { id: "kadane", label: "Kadane's Algorithm" },
        ],
      },
      {
        id: "linked-lists",
        label: "Linked Lists",
        children: [
          { id: "singly-linked-list", label: "Singly Linked List" },
          { id: "doubly-linked-list", label: "Doubly Linked List" },
          { id: "circular-linked-list", label: "Circular Linked List" },
          { id: "skip-list", label: "Skip List" },
        ],
      },
      {
        id: "stacks",
        label: "Stacks",
        children: [
          { id: "stack", label: "Stack Operations" },
          { id: "monotonic-stack", label: "Monotonic Stack" },
        ],
      },
      {
        id: "queues",
        label: "Queues",
        children: [
          { id: "queue", label: "Queue Operations" },
          { id: "deque", label: "Double-Ended Queue" },
          { id: "priority-queue", label: "Priority Queue" },
          { id: "circular-queue", label: "Circular Queue" },
        ],
      },
      {
        id: "hash-tables",
        label: "Hash Tables",
        children: [
          { id: "hash-table-chaining", label: "Chaining" },
          { id: "hash-table-linear-probing", label: "Linear Probing" },
          { id: "hash-table-quadratic-probing", label: "Quadratic Probing" },
          { id: "hash-table-double-hashing", label: "Double Hashing" },
        ],
      },
      {
        id: "trees",
        label: "Trees",
        children: [
          { id: "binary-search-tree", label: "Binary Search Tree" },
          { id: "avl-tree", label: "AVL Tree" },
          { id: "red-black-tree", label: "Red-Black Tree" },
          { id: "b-tree", label: "B-Tree" },
          { id: "trie", label: "Trie" },
          { id: "segment-tree", label: "Segment Tree" },
          { id: "fenwick-tree", label: "Fenwick Tree (BIT)" },
          { id: "splay-tree", label: "Splay Tree" },
        ],
      },
      {
        id: "heaps",
        label: "Heaps",
        children: [
          { id: "min-heap", label: "Min Heap" },
          { id: "max-heap", label: "Max Heap" },
          { id: "fibonacci-heap", label: "Fibonacci Heap" },
        ],
      },
      {
        id: "graphs-ds",
        label: "Graph Representations",
        children: [
          { id: "adjacency-list", label: "Adjacency List" },
          { id: "adjacency-matrix", label: "Adjacency Matrix" },
          { id: "edge-list", label: "Edge List" },
        ],
      },
      {
        id: "advanced-ds",
        label: "Advanced",
        children: [
          { id: "union-find", label: "Union-Find (DSU)" },
          { id: "lru-cache", label: "LRU Cache" },
          { id: "lfu-cache", label: "LFU Cache" },
          { id: "bloom-filter", label: "Bloom Filter" },
          { id: "lsm-tree", label: "LSM Tree" },
          { id: "rope-ds", label: "Rope (String DS)" },
        ],
      },
    ],
  },
  {
    id: "algorithms",
    label: "Algorithms",
    children: [
      {
        id: "sorting",
        label: "Sorting",
        children: [
          { id: "bubble-sort", label: "Bubble Sort" },
          { id: "selection-sort", label: "Selection Sort" },
          { id: "insertion-sort", label: "Insertion Sort" },
          { id: "shell-sort", label: "Shell Sort" },
          { id: "merge-sort", label: "Merge Sort" },
          { id: "quick-sort", label: "Quick Sort" },
          { id: "heap-sort", label: "Heap Sort" },
          { id: "counting-sort", label: "Counting Sort" },
          { id: "radix-sort", label: "Radix Sort" },
          { id: "bucket-sort", label: "Bucket Sort" },
          { id: "tim-sort", label: "Tim Sort" },
          { id: "intro-sort", label: "Intro Sort" },
          { id: "cycle-sort", label: "Cycle Sort" },
        ],
      },
      {
        id: "searching",
        label: "Searching",
        children: [
          { id: "linear-search-alg", label: "Linear Search" },
          { id: "binary-search-alg", label: "Binary Search" },
          { id: "jump-search", label: "Jump Search" },
          { id: "interpolation-search", label: "Interpolation Search" },
          { id: "exponential-search", label: "Exponential Search" },
          { id: "ternary-search", label: "Ternary Search" },
          { id: "fibonacci-search", label: "Fibonacci Search" },
        ],
      },
      {
        id: "graph-algorithms",
        label: "Graph Algorithms",
        children: [
          { id: "bfs", label: "BFS" },
          { id: "dfs", label: "DFS" },
          { id: "dijkstra", label: "Dijkstra's" },
          { id: "bellman-ford", label: "Bellman-Ford" },
          { id: "floyd-warshall", label: "Floyd-Warshall" },
          { id: "a-star", label: "A* Search" },
          { id: "johnsons", label: "Johnson's" },
          { id: "kruskal", label: "Kruskal's MST" },
          { id: "prim", label: "Prim's MST" },
          { id: "boruvka", label: "Borůvka's MST" },
          { id: "topological-sort", label: "Topological Sort" },
          { id: "kahns-algorithm", label: "Kahn's Algorithm" },
          { id: "tarjan-scc", label: "Tarjan's SCC" },
          { id: "kosaraju-scc", label: "Kosaraju's SCC" },
          { id: "ford-fulkerson", label: "Ford-Fulkerson" },
          { id: "edmonds-karp", label: "Edmonds-Karp" },
          { id: "bipartite-check", label: "Bipartite Check" },
          { id: "cycle-detection-graph", label: "Cycle Detection" },
          { id: "euler-path", label: "Euler Path / Circuit" },
          { id: "articulation-points", label: "Articulation Points" },
          { id: "bridges-graph", label: "Bridges in Graph" },
        ],
      },
      {
        id: "dynamic-programming",
        label: "Dynamic Programming",
        children: [
          { id: "fibonacci-dp", label: "Fibonacci (Memo/Tab)" },
          { id: "coin-change", label: "Coin Change" },
          { id: "knapsack-01", label: "0/1 Knapsack" },
          { id: "unbounded-knapsack", label: "Unbounded Knapsack" },
          { id: "lcs", label: "Longest Common Subsequence" },
          { id: "lis", label: "Longest Increasing Subsequence" },
          { id: "edit-distance", label: "Edit Distance" },
          { id: "matrix-chain", label: "Matrix Chain Multiplication" },
          { id: "unique-paths", label: "Unique Paths" },
          { id: "min-path-sum", label: "Minimum Path Sum" },
          { id: "word-break-dp", label: "Word Break" },
          { id: "palindrome-partition-dp", label: "Palindrome Partitioning" },
          { id: "rod-cutting", label: "Rod Cutting" },
          { id: "egg-drop", label: "Egg Drop Problem" },
          { id: "tsp-dp", label: "TSP (Bitmask DP)" },
          { id: "sos-dp", label: "Sum over Subsets DP" },
        ],
      },
      {
        id: "greedy",
        label: "Greedy",
        children: [
          { id: "activity-selection", label: "Activity Selection" },
          { id: "job-scheduling", label: "Job Scheduling" },
          { id: "huffman-coding", label: "Huffman Coding" },
          { id: "fractional-knapsack", label: "Fractional Knapsack" },
          { id: "egyptian-fraction", label: "Egyptian Fraction" },
          { id: "minimum-platforms", label: "Minimum Platforms" },
          { id: "gas-station", label: "Gas Station" },
        ],
      },
      {
        id: "backtracking",
        label: "Backtracking",
        children: [
          { id: "n-queens", label: "N-Queens" },
          { id: "sudoku-solver", label: "Sudoku Solver" },
          { id: "permutations-bt", label: "Permutations" },
          { id: "combinations-bt", label: "Combinations" },
          { id: "subsets-bt", label: "Subsets" },
          { id: "word-search-bt", label: "Word Search" },
          { id: "rat-in-maze", label: "Rat in a Maze" },
          { id: "graph-coloring", label: "Graph Coloring" },
          { id: "hamiltonian-path", label: "Hamiltonian Path" },
        ],
      },
      {
        id: "divide-conquer",
        label: "Divide & Conquer",
        children: [
          { id: "karatsuba", label: "Karatsuba Multiplication" },
          { id: "strassen", label: "Strassen's Matrix Mult" },
          { id: "closest-pair", label: "Closest Pair of Points" },
          { id: "median-of-medians", label: "Median of Medians" },
          { id: "fast-fourier-transform", label: "Fast Fourier Transform" },
        ],
      },
      {
        id: "string-algorithms",
        label: "String Algorithms",
        children: [
          { id: "kmp", label: "KMP Pattern Matching" },
          { id: "rabin-karp", label: "Rabin-Karp" },
          { id: "boyer-moore", label: "Boyer-Moore" },
          { id: "z-algorithm", label: "Z-Algorithm" },
          { id: "aho-corasick", label: "Aho-Corasick" },
          { id: "manacher", label: "Manacher's Algorithm" },
          { id: "suffix-array", label: "Suffix Array" },
          { id: "suffix-tree", label: "Suffix Tree" },
        ],
      },
      {
        id: "mathematical",
        label: "Mathematical",
        children: [
          { id: "gcd-euclidean", label: "GCD (Euclidean)" },
          { id: "extended-euclidean", label: "Extended Euclidean" },
          { id: "sieve-eratosthenes", label: "Sieve of Eratosthenes" },
          { id: "segmented-sieve", label: "Segmented Sieve" },
          { id: "fast-exponentiation", label: "Fast Exponentiation" },
          { id: "chinese-remainder", label: "Chinese Remainder Theorem" },
          { id: "miller-rabin", label: "Miller-Rabin Primality" },
          { id: "pollard-rho", label: "Pollard's Rho Factoring" },
        ],
      },
      {
        id: "bit-manipulation",
        label: "Bit Manipulation",
        children: [
          { id: "bit-basics", label: "Bitwise Operations" },
          { id: "brian-kernighan", label: "Brian Kernighan's Bit Count" },
          { id: "power-of-two", label: "Power of Two Check" },
          { id: "xor-tricks", label: "XOR Tricks" },
          { id: "bitmask-basics", label: "Bitmask Fundamentals" },
        ],
      },
      {
        id: "geometry",
        label: "Computational Geometry",
        children: [
          { id: "convex-hull-graham", label: "Convex Hull (Graham Scan)" },
          { id: "convex-hull-jarvis", label: "Convex Hull (Jarvis March)" },
          { id: "line-intersection", label: "Line Intersection" },
          { id: "point-in-polygon", label: "Point in Polygon" },
        ],
      },
      {
        id: "randomized",
        label: "Randomized Algorithms",
        children: [
          { id: "randomized-quicksort", label: "Randomized QuickSort" },
          { id: "reservoir-sampling", label: "Reservoir Sampling" },
          { id: "monte-carlo-pi", label: "Monte Carlo π" },
          { id: "las-vegas", label: "Las Vegas Algorithms" },
        ],
      },
    ],
  },
  {
    id: "os",
    label: "Operating Systems",
    children: [
      {
        id: "process-scheduling",
        label: "Process Scheduling",
        children: [
          { id: "fcfs", label: "FCFS" },
          { id: "sjf", label: "Shortest Job First" },
          { id: "srtf", label: "Shortest Remaining Time First" },
          { id: "round-robin", label: "Round Robin" },
          { id: "priority-scheduling", label: "Priority Scheduling" },
          { id: "multilevel-queue", label: "Multilevel Queue" },
          { id: "multilevel-feedback", label: "Multilevel Feedback Queue" },
        ],
      },
      {
        id: "memory-management",
        label: "Memory Management",
        children: [
          { id: "paging", label: "Paging" },
          { id: "segmentation", label: "Segmentation" },
          { id: "virtual-memory", label: "Virtual Memory" },
          { id: "buddy-system", label: "Buddy System" },
        ],
      },
      {
        id: "page-replacement",
        label: "Page Replacement",
        children: [
          { id: "fifo-page", label: "FIFO" },
          { id: "lru-page", label: "LRU" },
          { id: "optimal-page", label: "Optimal" },
          { id: "clock-page", label: "Clock Algorithm" },
          { id: "nfu-page", label: "NFU" },
        ],
      },
      {
        id: "deadlock",
        label: "Deadlock",
        children: [
          { id: "deadlock-detection", label: "Deadlock Detection" },
          { id: "bankers-algorithm", label: "Banker's Algorithm" },
          { id: "deadlock-prevention", label: "Prevention" },
          { id: "deadlock-recovery", label: "Recovery" },
        ],
      },
      {
        id: "disk-scheduling",
        label: "Disk Scheduling",
        children: [
          { id: "fcfs-disk", label: "FCFS" },
          { id: "sstf", label: "SSTF" },
          { id: "scan-disk", label: "SCAN (Elevator)" },
          { id: "c-scan", label: "C-SCAN" },
          { id: "look-disk", label: "LOOK" },
        ],
      },
      {
        id: "synchronization",
        label: "Synchronization",
        children: [
          { id: "mutex", label: "Mutex" },
          { id: "semaphore", label: "Semaphore" },
          { id: "monitor", label: "Monitor" },
          { id: "producer-consumer", label: "Producer-Consumer" },
          { id: "readers-writers", label: "Readers-Writers" },
          { id: "dining-philosophers", label: "Dining Philosophers" },
        ],
      },
    ],
  },
  {
    id: "networks",
    label: "Computer Networks",
    children: [
      {
        id: "tcp-ip",
        label: "TCP / IP",
        children: [
          { id: "three-way-handshake", label: "TCP 3-Way Handshake" },
          { id: "four-way-termination", label: "TCP 4-Way Termination" },
          { id: "tcp-congestion", label: "TCP Congestion Control" },
          { id: "tcp-flow-control", label: "TCP Flow Control" },
        ],
      },
      {
        id: "application-layer",
        label: "Application Layer",
        children: [
          { id: "http-lifecycle", label: "HTTP / HTTPS Lifecycle" },
          { id: "dns-resolution", label: "DNS Resolution" },
          { id: "dhcp", label: "DHCP" },
          { id: "smtp", label: "SMTP" },
          { id: "websocket", label: "WebSocket Handshake" },
        ],
      },
      {
        id: "network-layer",
        label: "Network Layer",
        children: [
          { id: "ip-addressing", label: "IP Addressing & Subnetting" },
          { id: "nat", label: "NAT" },
          { id: "ospf", label: "OSPF Routing" },
          { id: "bgp", label: "BGP" },
          { id: "rip", label: "RIP" },
        ],
      },
      {
        id: "data-link-layer",
        label: "Data Link Layer",
        children: [
          { id: "arp", label: "ARP" },
          { id: "csma-cd", label: "CSMA/CD" },
          { id: "ethernet-frame", label: "Ethernet Frame" },
        ],
      },
      {
        id: "network-security",
        label: "Network Security",
        children: [
          { id: "tls-handshake", label: "TLS/SSL Handshake" },
          { id: "oauth2", label: "OAuth 2.0 Flow" },
          { id: "jwt", label: "JWT Lifecycle" },
          { id: "firewall", label: "Firewall Rules" },
        ],
      },
    ],
  },
  {
    id: "databases",
    label: "Databases",
    children: [
      {
        id: "indexing",
        label: "Indexing",
        children: [
          { id: "btree-index", label: "B-Tree Index" },
          { id: "hash-index", label: "Hash Index" },
          { id: "lsm-index", label: "LSM Tree Index" },
          { id: "bitmap-index", label: "Bitmap Index" },
        ],
      },
      {
        id: "query-processing",
        label: "Query Processing",
        children: [
          { id: "nested-loop-join", label: "Nested Loop Join" },
          { id: "hash-join", label: "Hash Join" },
          { id: "sort-merge-join", label: "Sort-Merge Join" },
          { id: "query-optimization", label: "Query Optimization" },
        ],
      },
      {
        id: "transactions",
        label: "Transactions",
        children: [
          { id: "two-phase-locking", label: "Two-Phase Locking" },
          { id: "mvcc", label: "MVCC" },
          { id: "acid", label: "ACID Properties" },
        ],
      },
      {
        id: "storage",
        label: "Storage",
        children: [
          { id: "heap-file", label: "Heap File" },
          { id: "row-vs-column", label: "Row vs Column Storage" },
          { id: "wal", label: "Write-Ahead Log" },
        ],
      },
    ],
  },
  {
    id: "compiler",
    label: "Compiler Design",
    children: [
      {
        id: "lexical-analysis",
        label: "Lexical Analysis",
        children: [
          { id: "dfa-lexer", label: "DFA-based Lexer" },
          { id: "nfa-to-dfa", label: "NFA to DFA Conversion" },
          { id: "regex-to-nfa", label: "Regex to NFA" },
          { id: "tokenization", label: "Tokenization" },
        ],
      },
      {
        id: "parsing",
        label: "Parsing",
        children: [
          { id: "recursive-descent", label: "Recursive Descent" },
          { id: "ll1-parser", label: "LL(1) Parser" },
          { id: "lr0-parser", label: "LR(0) Parser" },
          { id: "lalr-parser", label: "LALR Parser" },
          { id: "earley-parser", label: "Earley Parser" },
        ],
      },
      {
        id: "semantic-analysis",
        label: "Semantic Analysis",
        children: [
          { id: "symbol-table", label: "Symbol Table" },
          { id: "type-checking", label: "Type Checking" },
          { id: "ast-gen", label: "AST Generation" },
        ],
      },
      {
        id: "code-generation",
        label: "Code Generation",
        children: [
          { id: "three-address-code", label: "Three-Address Code" },
          { id: "register-allocation", label: "Register Allocation" },
          { id: "constant-folding", label: "Constant Folding" },
          { id: "dead-code-elimination", label: "Dead Code Elimination" },
        ],
      },
    ],
  },
  {
    id: "computer-architecture",
    label: "Computer Architecture",
    children: [
      {
        id: "cpu",
        label: "CPU",
        children: [
          { id: "instruction-pipeline", label: "Instruction Pipeline" },
          { id: "branch-prediction", label: "Branch Prediction" },
          { id: "out-of-order", label: "Out-of-Order Execution" },
          { id: "superscalar", label: "Superscalar Processor" },
        ],
      },
      {
        id: "cache",
        label: "Cache Memory",
        children: [
          { id: "direct-mapped-cache", label: "Direct Mapped Cache" },
          { id: "set-associative-cache", label: "Set-Associative Cache" },
          { id: "fully-associative-cache", label: "Fully Associative Cache" },
          { id: "cache-replacement", label: "Cache Replacement Policies" },
          { id: "cache-coherence", label: "Cache Coherence (MESI)" },
        ],
      },
      {
        id: "memory-hierarchy",
        label: "Memory Hierarchy",
        children: [
          { id: "memory-hierarchy-viz", label: "Memory Hierarchy" },
          { id: "virtual-memory-arch", label: "Virtual Memory" },
          { id: "tlb", label: "TLB" },
        ],
      },
      {
        id: "io-systems",
        label: "I/O Systems",
        children: [
          { id: "dma", label: "DMA" },
          { id: "interrupts", label: "Interrupts" },
          { id: "buses", label: "Bus Architecture" },
        ],
      },
    ],
  },
  {
    id: "ml-ai",
    label: "ML / AI",
    children: [
      {
        id: "supervised",
        label: "Supervised Learning",
        children: [
          { id: "linear-regression", label: "Linear Regression" },
          { id: "logistic-regression", label: "Logistic Regression" },
          { id: "decision-tree-ml", label: "Decision Tree" },
          { id: "random-forest", label: "Random Forest" },
          { id: "svm", label: "Support Vector Machine" },
          { id: "knn", label: "K-Nearest Neighbors" },
          { id: "naive-bayes", label: "Naive Bayes" },
        ],
      },
      {
        id: "neural-networks",
        label: "Neural Networks",
        children: [
          { id: "perceptron", label: "Perceptron" },
          { id: "mlp-forward", label: "MLP Forward Pass" },
          { id: "backpropagation", label: "Backpropagation" },
          { id: "cnn", label: "Convolutional Neural Network" },
          { id: "rnn", label: "Recurrent Neural Network" },
          { id: "lstm", label: "LSTM" },
        ],
      },
      {
        id: "unsupervised",
        label: "Unsupervised Learning",
        children: [
          { id: "kmeans", label: "K-Means Clustering" },
          { id: "dbscan", label: "DBSCAN" },
          { id: "hierarchical-clustering", label: "Hierarchical Clustering" },
          { id: "pca", label: "PCA" },
          { id: "autoencoders", label: "Autoencoders" },
        ],
      },
      {
        id: "optimization-ml",
        label: "Optimization",
        children: [
          { id: "gradient-descent", label: "Gradient Descent" },
          { id: "sgd", label: "Stochastic Gradient Descent" },
          { id: "adam-optimizer", label: "Adam Optimizer" },
          { id: "rmsprop", label: "RMSprop" },
        ],
      },
      {
        id: "modern-ai",
        label: "Modern AI",
        children: [
          { id: "transformer-attention", label: "Transformer Self-Attention" },
          { id: "rag-pipeline", label: "RAG Pipeline" },
          { id: "vector-embeddings", label: "Vector Embeddings" },
          { id: "beam-search", label: "Beam Search" },
          { id: "mcts-ai", label: "Monte Carlo Tree Search" },
        ],
      },
      {
        id: "reinforcement",
        label: "Reinforcement Learning",
        children: [
          { id: "q-learning", label: "Q-Learning" },
          { id: "policy-gradient", label: "Policy Gradient" },
          { id: "dqn", label: "Deep Q-Network" },
        ],
      },
    ],
  },
  {
    id: "cryptography",
    label: "Cryptography & Security",
    children: [
      {
        id: "symmetric",
        label: "Symmetric Encryption",
        children: [
          { id: "aes", label: "AES" },
          { id: "des", label: "DES" },
          { id: "xor-cipher", label: "XOR Cipher" },
          { id: "stream-cipher", label: "Stream Cipher" },
        ],
      },
      {
        id: "asymmetric",
        label: "Asymmetric Encryption",
        children: [
          { id: "rsa", label: "RSA" },
          { id: "diffie-hellman", label: "Diffie-Hellman" },
          { id: "ecdh", label: "ECDH" },
          { id: "elgamal", label: "ElGamal" },
        ],
      },
      {
        id: "hash-functions",
        label: "Hash Functions",
        children: [
          { id: "sha-256", label: "SHA-256" },
          { id: "merkle-tree-crypto", label: "Merkle Tree" },
          { id: "hmac", label: "HMAC" },
          { id: "bcrypt", label: "Bcrypt" },
        ],
      },
      {
        id: "protocols",
        label: "Protocols",
        children: [
          { id: "tls-protocol", label: "TLS Protocol" },
          { id: "pgp", label: "PGP" },
          { id: "kerberos", label: "Kerberos" },
        ],
      },
    ],
  },
  {
    id: "distributed-systems",
    label: "Distributed Systems",
    children: [
      {
        id: "consensus",
        label: "Consensus",
        children: [
          { id: "raft", label: "Raft Consensus" },
          { id: "paxos", label: "Paxos" },
          { id: "byzantine-ft", label: "Byzantine Fault Tolerance" },
          { id: "two-phase-commit", label: "Two-Phase Commit" },
        ],
      },
      {
        id: "replication",
        label: "Replication",
        children: [
          { id: "leader-follower", label: "Leader-Follower Replication" },
          { id: "multi-leader", label: "Multi-Leader Replication" },
          { id: "quorum", label: "Quorum-based Replication" },
        ],
      },
      {
        id: "load-balancing-dist",
        label: "Load Balancing",
        children: [
          { id: "round-robin-lb", label: "Round Robin" },
          { id: "consistent-hashing", label: "Consistent Hashing" },
          { id: "least-connections", label: "Least Connections" },
          { id: "weighted-round-robin", label: "Weighted Round Robin" },
        ],
      },
      {
        id: "distributed-patterns",
        label: "Patterns",
        children: [
          { id: "mapreduce", label: "MapReduce" },
          { id: "saga-pattern", label: "Saga Pattern" },
          { id: "event-sourcing", label: "Event Sourcing" },
          { id: "cqrs", label: "CQRS" },
        ],
      },
    ],
  },
  {
    id: "theory",
    label: "Theory of Computation",
    children: [
      {
        id: "automata",
        label: "Automata Theory",
        children: [
          { id: "dfa-automata", label: "DFA" },
          { id: "nfa-automata", label: "NFA" },
          { id: "epsilon-nfa", label: "ε-NFA" },
          { id: "pda", label: "Pushdown Automaton" },
          { id: "turing-machine", label: "Turing Machine" },
        ],
      },
      {
        id: "formal-languages",
        label: "Formal Languages",
        children: [
          { id: "cfg", label: "Context-Free Grammar" },
          { id: "cyk-algorithm", label: "CYK Algorithm" },
          { id: "pumping-lemma", label: "Pumping Lemma" },
        ],
      },
      {
        id: "complexity",
        label: "Complexity Theory",
        children: [
          { id: "p-np", label: "P vs NP" },
          { id: "np-completeness", label: "NP-Completeness" },
          { id: "reduction", label: "Polynomial Reduction" },
          { id: "approximation", label: "Approximation Algorithms" },
        ],
      },
    ],
  },
  {
    id: "computer-graphics",
    label: "Computer Graphics",
    children: [
      {
        id: "rasterization",
        label: "Rasterization",
        children: [
          { id: "bresenham-line", label: "Bresenham's Line" },
          { id: "bresenham-circle", label: "Bresenham's Circle" },
          { id: "scanline-fill", label: "Scanline Fill" },
          { id: "flood-fill", label: "Flood Fill" },
        ],
      },
      {
        id: "ray-tracing",
        label: "Ray Tracing",
        children: [
          { id: "ray-sphere", label: "Ray-Sphere Intersection" },
          { id: "ray-triangle", label: "Ray-Triangle Intersection" },
          { id: "shadow-rays", label: "Shadow Rays" },
        ],
      },
      {
        id: "transformations",
        label: "Transformations",
        children: [
          { id: "2d-rotation", label: "2D Rotation" },
          { id: "3d-rotation", label: "3D Rotation" },
          { id: "affine-transformations", label: "Affine Transformations" },
          { id: "homogeneous-coords", label: "Homogeneous Coordinates" },
        ],
      },
      {
        id: "clipping",
        label: "Clipping",
        children: [
          { id: "cohen-sutherland", label: "Cohen-Sutherland" },
          { id: "sutherland-hodgman", label: "Sutherland-Hodgman" },
        ],
      },
    ],
  },
  {
    id: "parallel",
    label: "Parallel Computing",
    children: [
      {
        id: "parallel-algorithms",
        label: "Parallel Algorithms",
        children: [
          { id: "parallel-merge-sort", label: "Parallel Merge Sort" },
          { id: "bitonic-sort", label: "Bitonic Sort" },
          { id: "odd-even-sort", label: "Odd-Even Sort" },
          { id: "parallel-prefix", label: "Parallel Prefix Sum" },
        ],
      },
      {
        id: "concurrency-models",
        label: "Concurrency Models",
        children: [
          { id: "fork-join", label: "Fork-Join Model" },
          { id: "actor-model", label: "Actor Model" },
          { id: "pipeline-parallel", label: "Pipeline Parallelism" },
        ],
      },
      {
        id: "gpu-computing",
        label: "GPU Computing",
        children: [
          { id: "simd", label: "SIMD Operations" },
          { id: "warp-execution", label: "Warp Execution" },
          { id: "cuda-memory", label: "CUDA Memory Hierarchy" },
        ],
      },
    ],
  },
  {
    id: "quantum",
    label: "Quantum Computing",
    children: [
      {
        id: "quantum-gates",
        label: "Quantum Gates",
        children: [
          { id: "hadamard-gate", label: "Hadamard Gate" },
          { id: "cnot-gate", label: "CNOT Gate" },
          { id: "toffoli-gate", label: "Toffoli Gate" },
          { id: "pauli-gates", label: "Pauli Gates" },
        ],
      },
      {
        id: "quantum-algorithms",
        label: "Quantum Algorithms",
        children: [
          { id: "grover-search", label: "Grover's Search" },
          { id: "shor-factoring", label: "Shor's Factoring" },
          { id: "quantum-teleportation", label: "Quantum Teleportation" },
          { id: "deutsch-jozsa", label: "Deutsch-Jozsa" },
        ],
      },
      {
        id: "quantum-concepts",
        label: "Concepts",
        children: [
          { id: "superposition", label: "Superposition" },
          { id: "entanglement", label: "Quantum Entanglement" },
          { id: "quantum-error", label: "Quantum Error Correction" },
        ],
      },
    ],
  },
  {
    id: "blockchain",
    label: "Blockchain & Web3",
    children: [
      {
        id: "blockchain-fundamentals",
        label: "Fundamentals",
        children: [
          { id: "blockchain-structure", label: "Blockchain Structure" },
          { id: "merkle-tree-blockchain", label: "Merkle Tree" },
          { id: "hash-chain", label: "Hash Chain" },
        ],
      },
      {
        id: "consensus-blockchain",
        label: "Consensus Mechanisms",
        children: [
          { id: "proof-of-work", label: "Proof of Work" },
          { id: "proof-of-stake", label: "Proof of Stake" },
          { id: "pbft", label: "PBFT" },
        ],
      },
      {
        id: "smart-contracts",
        label: "Smart Contracts",
        children: [
          { id: "evm", label: "EVM Execution" },
          { id: "gas-calculation", label: "Gas Calculation" },
        ],
      },
    ],
  },
];
