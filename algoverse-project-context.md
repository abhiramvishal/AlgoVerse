# AlgoVerse - Project Context Document
# The One-Stop CS Visualization Platform
# Use this file as context when working in Cursor or Claude Code

---

## Project Vision

AlgoVerse is an interactive visualization platform that covers ALL of computer science.
Every concept has: an animated visualization (center/left panel) + synced Python code
with line-by-line highlighting (right panel) that steps through as the animation plays.

Think: VisuAlgo scope x10, covering not just DSA but OS, compilers, networks, ML, AI systems,
cloud architecture, IoT, cybersecurity, blockchain, data analytics, and more.

The goal: become THE one-stop reference for understanding any CS concept visually.

---

## Core UI Layout

```
+------------------------------------------------------------------+
|  AlgoVerse                                    [Search] [Login]   |
+------------------------------------------------------------------+
|         |                              |                          |
| SIDEBAR |    VISUALIZATION PANEL       |    CODE PANEL             |
| (tree   |    (center)                  |    (right)                |
|  nav)   |                              |                          |
|         |    Interactive animation     |    Python code with      |
| Fields  |    plays here.               |    line highlighter      |
|  > DSA  |    Controls:                 |    that walks through    |
|  > OS   |    [Play] [Pause] [Step]     |    each line as the      |
|  > ML   |    [Speed: ---o---]          |    visualization runs.   |
|  > Net  |    [Reset]                   |                          |
|  > ...  |                              |    Variables panel       |
|         |                              |    below code showing    |
|         |                              |    current state of      |
|         |                              |    all variables.        |
|         |                              |                          |
+------------------------------------------------------------------+
|  Step 3/12 | Comparing arr[2] with arr[5]    | Complexity: O(nlogn)|
+------------------------------------------------------------------+
```

### Key UI Elements

1. LEFT SIDEBAR: Tree navigation organized by CS field > subcategory > topic
   - Collapsible tree structure
   - Search/filter across all topics
   - Tags: difficulty level (beginner/intermediate/advanced)
   - Progress tracking (for logged-in users)

2. CENTER PANEL: The visualization
   - Canvas-based animation (D3.js for 2D, Three.js for 3D where needed)
   - Transport controls: Play, Pause, Step Forward, Step Back, Reset
   - Speed slider (0.25x to 4x)
   - Custom input panel (let users enter their own arrays, graphs, etc.)
   - Step counter showing current step and description

3. RIGHT PANEL: Code + State
   - Monaco Editor (read-only) showing Python implementation
   - Active line highlighted in sync with visualization
   - Below code: variable state panel showing current values
   - Toggle between Python / pseudocode / other languages (future)

4. BOTTOM BAR: Context info
   - Current step description in plain English
   - Time complexity
   - Space complexity
   - Related topics links

---

## Complete Category Taxonomy

This is the full organized tree structure for the sidebar navigation.
Based on ACM CS2023 knowledge areas + industry-relevant modern topics.

### 1. Data Structures
  1.1 Linear Structures
    - Array (static, dynamic, circular)
    - Linked List (singly, doubly, circular, skip list)
    - Stack (array-based, linked-list-based)
    - Queue (simple, circular, priority, deque)
  1.2 Trees
    - Binary Tree (traversals: inorder, preorder, postorder, level-order)
    - Binary Search Tree (insert, delete, search)
    - AVL Tree (rotations: LL, RR, LR, RL)
    - Red-Black Tree (insert with recoloring and rotations)
    - B-Tree / B+ Tree (splitting, merging)
    - Trie (prefix tree)
    - Segment Tree (range queries, lazy propagation)
    - Fenwick Tree (Binary Indexed Tree)
    - Suffix Tree / Suffix Array
    - Heap (min-heap, max-heap, heapify)
    - Fibonacci Heap
  1.3 Hashing
    - Hash Table (chaining)
    - Hash Table (open addressing: linear, quadratic, double hashing)
    - Bloom Filter
    - Consistent Hashing
    - Cuckoo Hashing
  1.4 Graphs
    - Adjacency Matrix vs Adjacency List
    - Directed vs Undirected
    - Weighted Graph representation
    - DAG (Directed Acyclic Graph)
  1.5 Advanced Structures
    - Disjoint Set / Union-Find
    - LRU Cache
    - K-D Tree
    - Quadtree / Octree
    - Interval Tree
    - Rope (string manipulation)

### 2. Algorithms
  2.1 Sorting
    - Bubble Sort
    - Selection Sort
    - Insertion Sort
    - Merge Sort
    - Quick Sort (Lomuto, Hoare)
    - Heap Sort
    - Counting Sort
    - Radix Sort
    - Bucket Sort
    - Tim Sort
    - Shell Sort
  2.2 Searching
    - Linear Search
    - Binary Search
    - Ternary Search
    - Interpolation Search
  2.3 Graph Algorithms
    - BFS (Breadth-First Search)
    - DFS (Depth-First Search)
    - Dijkstra's Shortest Path
    - Bellman-Ford
    - Floyd-Warshall
    - A* Search
    - Topological Sort
    - Kruskal's MST
    - Prim's MST
    - Tarjan's SCC
    - Kosaraju's SCC
    - Articulation Points and Bridges
    - Network Flow (Ford-Fulkerson)
    - Bipartite Matching
  2.4 Dynamic Programming
    - Fibonacci (memo vs tabulation)
    - 0/1 Knapsack
    - Longest Common Subsequence
    - Longest Increasing Subsequence
    - Edit Distance
    - Matrix Chain Multiplication
    - Coin Change
    - Rod Cutting
    - Subset Sum
  2.5 Greedy
    - Activity Selection
    - Huffman Coding
    - Fractional Knapsack
    - Job Sequencing
  2.6 Divide and Conquer
    - Merge Sort (recursive splitting)
    - Closest Pair of Points
    - Strassen's Matrix Multiplication
    - Karatsuba Multiplication
  2.7 Backtracking
    - N-Queens
    - Sudoku Solver
    - Graph Coloring
    - Maze Solving
    - Subset/Permutation Generation
  2.8 String Algorithms
    - KMP Pattern Matching
    - Rabin-Karp
    - Boyer-Moore
    - Z-Algorithm
    - Aho-Corasick
    - Manacher's (palindromes)
  2.9 Mathematical
    - Sieve of Eratosthenes
    - Euclidean GCD
    - Fast Exponentiation
    - FFT (Fast Fourier Transform)
    - Matrix Exponentiation
  2.10 Recursion Patterns
    - Call Stack visualization
    - Recursion Tree
    - Tail Recursion
    - Memoization overlay

### 3. Operating Systems
  3.1 Process Management
    - Process Lifecycle (states)
    - Process Control Block
    - Context Switching
    - Fork and Exec
    - Inter-Process Communication (pipes, shared memory, message queues)
  3.2 CPU Scheduling
    - FCFS
    - SJF (Shortest Job First)
    - Round Robin
    - Priority Scheduling
    - Multilevel Queue
    - Multilevel Feedback Queue
  3.3 Memory Management
    - Contiguous Allocation (first fit, best fit, worst fit)
    - Paging (page table, TLB)
    - Segmentation
    - Virtual Memory (demand paging)
    - Page Replacement (FIFO, LRU, Optimal, Clock)
    - Buddy System
  3.4 File Systems
    - File Allocation (contiguous, linked, indexed)
    - Inode structure
    - Directory structures
    - Journaling
  3.5 Synchronization
    - Race Conditions
    - Mutex and Locks
    - Semaphores
    - Producer-Consumer
    - Readers-Writers
    - Dining Philosophers
    - Deadlock Detection (resource allocation graph)
    - Banker's Algorithm
  3.6 Disk and I/O
    - Disk Scheduling (FCFS, SSTF, SCAN, C-SCAN, LOOK)
    - DMA
    - Interrupt Handling
  3.7 Kernel Concepts
    - System Call flow (user to kernel mode)
    - Monolithic vs Microkernel

### 4. Compiler Design
  4.1 Lexical Analysis
    - DFA and NFA
    - NFA to DFA (subset construction)
    - Regex to NFA (Thompson's)
    - DFA Minimization
    - Token Generation
  4.2 Syntax Analysis
    - Parse Trees vs AST
    - Recursive Descent Parsing
    - LL(1) Parser (FIRST, FOLLOW, parse table)
    - LR Parsing (LR(0), SLR, CLR, LALR)
    - Shift-Reduce parsing
  4.3 Semantic Analysis
    - Type Checking
    - Symbol Table
    - Scope Resolution
  4.4 Intermediate Code
    - Three-Address Code
    - AST to IR
    - SSA Form
    - Control Flow Graph
  4.5 Optimization
    - Constant Folding
    - Dead Code Elimination
    - Loop Optimization
    - Register Allocation (graph coloring)
  4.6 Runtime Systems
    - Stack vs Heap
    - Garbage Collection (mark-sweep, generational, reference counting)
    - Call Stack frames
    - Virtual Method Tables

### 5. Computer Architecture
  5.1 Digital Logic
    - Logic Gates
    - Combinational Circuits (adders, mux, decoders)
    - Sequential Circuits (flip-flops, registers)
    - ALU operations
  5.2 CPU Design
    - Instruction Cycle (fetch, decode, execute)
    - 5-Stage Pipeline
    - Pipeline Hazards
    - Branch Prediction
    - Out-of-Order Execution
    - Superscalar
    - RISC vs CISC
  5.3 Memory Hierarchy
    - Cache (L1, L2, L3)
    - Cache Mapping (direct, set-associative, fully associative)
    - Cache Replacement
    - Cache Coherence (MESI)
    - TLB
  5.4 Instruction Set
    - RISC-V encoding
    - Addressing Modes

### 6. Computer Networks
  6.1 Network Models
    - OSI 7-Layer (data flow)
    - TCP/IP 4-Layer
    - Encapsulation / Decapsulation
  6.2 Data Link Layer
    - Ethernet Frame
    - ARP Protocol
    - CSMA/CD
    - Sliding Window (Go-Back-N, Selective Repeat)
    - Error Detection (CRC, checksum)
  6.3 Network Layer
    - IP Addressing (IPv4, IPv6)
    - Subnetting / CIDR
    - Routing (distance vector, link state)
    - NAT
    - ICMP
  6.4 Transport Layer
    - TCP 3-Way Handshake
    - TCP Flow Control
    - TCP Congestion Control (slow start, AIMD)
    - UDP
    - TCP vs UDP
  6.5 Application Layer
    - HTTP Request/Response lifecycle
    - HTTP/2 multiplexing
    - DNS Resolution
    - DHCP
    - WebSocket handshake
  6.6 Network Security
    - TLS/SSL Handshake
    - Diffie-Hellman Key Exchange
    - RSA
    - Certificate Chain

### 7. Database Systems
  7.1 Relational Model
    - Normalization (1NF, 2NF, 3NF, BCNF)
    - ER Diagrams to Schema
  7.2 Query Processing
    - SQL Query Pipeline (parse, optimize, execute)
    - Query Plan visualization
    - Join Algorithms (nested loop, hash, sort-merge)
    - Index Scan vs Full Scan
  7.3 Indexing
    - B-Tree Index
    - B+ Tree Index
    - Hash Index
    - Inverted Index
  7.4 Transactions
    - ACID Properties
    - Two-Phase Locking
    - MVCC
    - Isolation Levels
    - Write-Ahead Logging
    - Deadlock Detection
  7.5 Distributed DB
    - Sharding (hash, range)
    - Replication (leader-follower)
    - CAP Theorem
    - Raft Consensus
    - Two-Phase Commit
    - Vector Clocks
  7.6 NoSQL
    - Key-Value (Redis)
    - Document (MongoDB)
    - Column-Family (Cassandra)
    - Graph (Neo4j)
    - LSM Tree

### 8. Software Engineering
  8.1 Design Patterns
    - Creational (Singleton, Factory, Builder, Prototype)
    - Structural (Adapter, Decorator, Proxy, Facade)
    - Behavioral (Observer, Strategy, Command, State Machine)
    - MVC / MVVM
  8.2 System Design
    - Load Balancer (round robin, least connections, consistent hashing)
    - API Gateway
    - Message Queue flow
    - Circuit Breaker
    - Rate Limiter (token bucket, sliding window)
    - Caching (cache-aside, write-through, write-behind)
    - CDN Request Flow
    - Microservices Communication
    - Event-Driven Architecture
    - CQRS
    - Saga Pattern
  8.3 Version Control
    - Git internals (commit DAG, branches)
    - Rebase vs Merge
    - Three-way merge

### 9. Machine Learning and AI
  9.1 Classical ML
    - Linear Regression (gradient descent)
    - Logistic Regression (decision boundary)
    - K-Nearest Neighbors
    - K-Means Clustering
    - Decision Tree (splits, Gini, information gain)
    - Random Forest
    - SVM (hyperplane, margin)
    - PCA (dimensionality reduction)
    - Naive Bayes
  9.2 Neural Networks
    - Perceptron
    - Multi-Layer Perceptron (forward + backpropagation)
    - Activation Functions
    - Loss Functions
    - Gradient Descent variants (SGD, Adam)
    - Batch Normalization
    - Dropout
  9.3 Deep Learning
    - CNN (convolution, pooling, feature maps)
    - RNN (sequence, hidden state)
    - LSTM (gates, cell state)
    - GRU
    - Autoencoder
    - VAE
    - GAN (generator vs discriminator)
    - ResNet (skip connections)
    - U-Net
  9.4 Transformers and LLMs
    - Self-Attention (Q, K, V)
    - Multi-Head Attention
    - Positional Encoding
    - Transformer Architecture
    - Tokenization (BPE, WordPiece)
    - KV Cache
    - LoRA
    - Quantization
  9.5 Reinforcement Learning
    - Markov Decision Process
    - Q-Learning
    - DQN
    - Policy Gradient
    - PPO
    - Actor-Critic
    - Multi-Armed Bandit
  9.6 Optimization
    - Gradient Descent landscape
    - Learning Rate effects
    - Momentum
    - Hyperparameter Search

### 10. Modern AI Systems
  10.1 RAG
    - Document Ingestion (load, split, chunk)
    - Embedding Generation
    - Vector Store (indexing, similarity search)
    - Retrieval flow
    - Context Assembly
    - Generation with context
    - Hybrid Search
    - Reranking
  10.2 Agentic AI
    - ReAct Loop
    - Tool Calling / Function Calling
    - LangGraph State Machine
    - Multi-Agent systems
    - Planning and Task Decomposition
    - Memory Systems
    - Human-in-the-Loop
  10.3 Prompt Engineering
    - Chain-of-Thought
    - Few-Shot vs Zero-Shot
    - Token lifecycle
    - Temperature and Sampling
  10.4 MLOps
    - Training Pipeline
    - Cross-Validation
    - Model Serving (batch vs real-time)
    - A/B Testing
    - Feature Store
  10.5 Computer Vision
    - Image Classification Pipeline
    - Object Detection (anchors, NMS)
    - Stable Diffusion Pipeline
  10.6 NLP
    - Word Embeddings (Word2Vec)
    - Seq2Seq
    - Beam Search Decoding
    - Named Entity Recognition

### 11. Cloud and Distributed Systems
  11.1 Architecture Patterns
    - Monolith vs Microservices
    - Serverless (API Gateway, Lambda, DB)
    - 3-Tier Architecture
    - Event-Driven (event bus, consumers)
    - Pub/Sub (Kafka partitions, consumer groups)
  11.2 Containers and Orchestration
    - Docker container lifecycle
    - Docker image layering
    - Kubernetes Pod lifecycle
    - K8s Deployment (rolling update)
    - Service Discovery
    - Horizontal Pod Autoscaler
    - Ingress Controller
  11.3 CI/CD
    - Git Push to Production
    - Build, Test, Deploy
    - Blue-Green Deployment
    - Canary Deployment
    - Feature Flags
    - Infrastructure as Code
  11.4 Distributed Concepts
    - Raft (leader election, log replication)
    - Gossip Protocol
    - Consistent Hashing
    - MapReduce
    - Distributed Hash Table
    - Lamport / Vector Clocks
  11.5 Scaling
    - L4 vs L7 Load Balancing
    - Horizontal vs Vertical Scaling
    - Auto-Scaling
    - Database Sharding
    - Read Replicas
  11.6 Observability
    - Distributed Tracing
    - Metrics Pipeline (Prometheus, Grafana)
    - Health Checks

### 12. Cybersecurity
  12.1 Cryptography
    - AES (rounds, SubBytes, ShiftRows, MixColumns)
    - DES (Feistel network)
    - Block Cipher Modes (ECB, CBC, CTR, GCM)
    - RSA (key gen, encrypt, decrypt)
    - Diffie-Hellman
    - Elliptic Curve Crypto
    - Digital Signatures
    - SHA-256
    - HMAC
    - Bcrypt / Argon2
    - Merkle Tree
  12.2 Protocols
    - TLS 1.3 Handshake
    - PKI / Certificate Authority
    - Zero-Knowledge Proofs
    - Kerberos
    - OAuth 2.0 Flows
    - SAML / OpenID Connect
  12.3 Web Security
    - SQL Injection (attack + prevention)
    - XSS (reflected, stored)
    - CSRF
    - CORS (preflight flow)
    - JWT structure
    - Firewall Rules
    - WAF request flow
  12.4 Network Security
    - IDS/IPS flow
    - VPN tunneling
    - Packet Sniffing
    - Man-in-the-Middle attack flow
    - DNS Spoofing

### 13. Theory of Computation
  13.1 Automata
    - DFA state transitions
    - NFA
    - NFA to DFA conversion
    - Pushdown Automata
    - Turing Machine
  13.2 Formal Languages
    - Chomsky Hierarchy
    - Regex to Automata
    - Derivation Trees
  13.3 Computability
    - Halting Problem
    - Decidability
    - Reductions
  13.4 Complexity
    - P vs NP
    - Big-O Growth Curves comparison
    - NP-Complete Reductions

### 14. Computer Graphics
  14.1 2D Graphics
    - Bresenham's Line
    - Midpoint Circle
    - Scan-line Fill
    - 2D Transformations
    - Clipping (Cohen-Sutherland)
    - Bezier Curves
  14.2 3D Graphics
    - 3D Transformations (MVP matrices)
    - Perspective vs Orthographic
    - Z-Buffer
    - Ray Tracing
    - Rasterization Pipeline
    - Phong Shading
  14.3 Animation
    - Keyframe Interpolation
    - Skeletal Animation
    - Particle Systems

### 15. Parallel and Concurrent Programming
  15.1 Concurrency Models
    - Threads vs Processes
    - Thread Pool
    - Actor Model
    - CSP
    - Async/Await event loop
  15.2 Synchronization
    - Lock contention
    - Read-Write Locks
    - Lock-Free (CAS operations)
    - Barrier Synchronization
  15.3 Parallel Algorithms
    - Parallel Merge Sort
    - Parallel Prefix Sum
    - Fork-Join
    - GPU execution (CUDA grid)

### 16. Programming Language Concepts
  16.1 Type Systems
    - Static vs Dynamic
    - Type Inference
    - Generics
  16.2 Memory Models
    - Stack vs Heap
    - Ownership/Borrowing (Rust)
    - Garbage Collection
    - Reference Counting
  16.3 Execution Models
    - Interpreted vs Compiled vs JIT
    - Bytecode (JVM, Python VM)
    - Event Loop (Node.js)
  16.4 Functional Programming
    - Map/Filter/Reduce
    - Immutability
    - Lambda Calculus (beta reduction)
    - Currying

### 17. IoT (Internet of Things)
  17.1 Architecture
    - IoT Reference Architecture (device, gateway, cloud)
    - Edge Computing vs Cloud Computing
    - Fog Computing
  17.2 Protocols
    - MQTT (publish/subscribe, broker)
    - CoAP (request/response)
    - Zigbee mesh network
    - LoRaWAN
    - Bluetooth Low Energy
  17.3 Data Flow
    - Sensor data pipeline (collect, process, store, act)
    - Time-series data ingestion
    - Digital Twin concept
  17.4 Security
    - Device Authentication
    - Secure Boot
    - OTA (Over-the-Air) Update flow

### 18. Blockchain and Web3
  18.1 Core
    - Blockchain structure (blocks, hashes, chain)
    - Mining / Proof of Work
    - Proof of Stake
    - Merkle Tree verification
    - Transaction lifecycle (mempool to confirmation)
  18.2 Smart Contracts
    - EVM execution
    - Gas calculation
    - State transitions
  18.3 Consensus
    - Byzantine Fault Tolerance
    - Practical BFT
    - DPoS

### 19. Data Analytics and Engineering
  19.1 Data Pipelines
    - ETL (Extract, Transform, Load)
    - ELT pattern
    - Batch vs Stream processing
    - Apache Spark execution (RDD, DAG)
    - Apache Kafka stream processing
  19.2 Data Warehousing
    - Star Schema
    - Snowflake Schema
    - OLAP Cube operations (slice, dice, drill)
    - Data Lake architecture
  19.3 Statistics
    - Normal Distribution
    - Hypothesis Testing flow
    - A/B Testing statistics
    - Bayesian Inference
    - Regression analysis
  19.4 Visualization
    - Chart selection guide
    - Data-to-visual mapping

### 20. Quantum Computing
  20.1 Fundamentals
    - Qubit vs Classical Bit
    - Superposition
    - Entanglement
    - Quantum Gates (Hadamard, CNOT, Pauli)
    - Quantum Circuit
  20.2 Algorithms
    - Shor's Algorithm
    - Grover's Search
    - Quantum Teleportation

### 21. Robotics and Control
  21.1 Control Systems
    - PID Controller
    - Kalman Filter
    - Sensor Fusion
  21.2 Navigation
    - SLAM
    - Path Planning (RRT, PRM)
    - Inverse Kinematics

### 22. Game Development
  22.1 Core
    - Game Loop (input, update, render)
    - Collision Detection (AABB, SAT)
    - Spatial Partitioning (quadtree)
    - A* Pathfinding
    - Steering Behaviors
  22.2 AI
    - Finite State Machines (enemy AI)
    - Behavior Trees
    - Entity Component System
  22.3 Physics
    - Rigid Body simulation
    - Constraint solving

### 23. Human-Computer Interaction
  23.1 Interaction Models
    - Event-driven UI architecture
    - Accessibility tree
    - Responsive layout flow
  23.2 UX Patterns
    - Navigation patterns
    - Fitts's Law visualization
    - Hick's Law (decision time)

---

## Tech Stack

### Frontend
- Framework: Next.js 14+ (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- UI Components: shadcn/ui
- State Management: Zustand

### Visualization Engine
- 2D Animations: D3.js (bindable, data-driven)
- 3D Visualizations: Three.js via React Three Fiber (where needed)
- Canvas fallback: HTML5 Canvas for simple animations
- Animation library: Framer Motion for UI transitions

### Code Panel
- Editor: Monaco Editor (@monaco-editor/react)
- Syntax highlighting: built into Monaco
- Line highlighting: custom decoration API
- Language: Python displayed (primary), pseudocode toggle

### Code Execution (optional, future)
- In-browser Python: Pyodide (WebAssembly Python)
- Enables users to modify code and see visualization update

### Backend
- API: Next.js API routes (or FastAPI if separated)
- Auth: Clerk or NextAuth
- Payments: Stripe (for pro tier)
- Database: PostgreSQL via Prisma (user progress, bookmarks)

### AI Features (future)
- Claude API: "describe algorithm in English, get visualization"
- AI-generated step-by-step explanations
- Natural language to custom input

### Hosting
- Vercel (frontend + API)
- Supabase or PlanetScale (database)

---

## Visualization Component Architecture

Each visualization is a self-contained module following this interface:

```typescript
// types/visualization.ts

interface VisualizationModule {
  // Metadata
  id: string;                    // e.g., "sorting-merge-sort"
  title: string;                 // e.g., "Merge Sort"
  category: string[];            // e.g., ["Algorithms", "Sorting"]
  difficulty: "beginner" | "intermediate" | "advanced";
  timeComplexity: string;        // e.g., "O(n log n)"
  spaceComplexity: string;       // e.g., "O(n)"
  description: string;
  relatedTopics: string[];       // IDs of related visualizations

  // Code
  pythonCode: string;            // Full Python implementation
  codeSteps: CodeStep[];         // Line numbers mapped to animation steps

  // Animation
  defaultInput: any;             // Default data to visualize
  generateSteps: (input: any) => AnimationStep[];
}

interface AnimationStep {
  stepNumber: number;
  description: string;           // "Comparing arr[2]=5 with arr[5]=3"
  highlightLines: number[];      // Lines to highlight in code panel
  visualState: any;              // State to render in visualization
  variables: Record<string, any>; // Current variable values
}

interface CodeStep {
  lineNumber: number;
  explanation: string;
}
```

### File Structure

```
algoverse/
  src/
    app/
      page.tsx                   # Landing page
      explore/
        page.tsx                 # Main explore view with sidebar
        [category]/
          [topic]/
            page.tsx             # Individual visualization page
      api/
        ...
    components/
      layout/
        Sidebar.tsx              # Tree navigation
        SearchBar.tsx
        Header.tsx
      visualization/
        VisualizationCanvas.tsx  # Main canvas wrapper
        Controls.tsx             # Play, pause, step, speed
        InputPanel.tsx           # Custom input for users
      code/
        CodePanel.tsx            # Monaco editor wrapper
        VariableState.tsx        # Shows current variable values
        ComplexityBadge.tsx
      common/
        ...
    visualizations/              # All visualization modules
      data-structures/
        arrays/
          array-basics.ts
        linked-lists/
          singly-linked-list.ts
        trees/
          binary-search-tree.ts
          avl-tree.ts
        ...
      algorithms/
        sorting/
          bubble-sort.ts
          merge-sort.ts
          quick-sort.ts
          ...
        graph/
          bfs.ts
          dfs.ts
          dijkstra.ts
          ...
        ...
      operating-systems/
        scheduling/
          round-robin.ts
          ...
        memory/
          page-replacement-lru.ts
          ...
      networks/
        tcp-handshake.ts
        dns-resolution.ts
        ...
      ml-ai/
        gradient-descent.ts
        neural-network-forward.ts
        self-attention.ts
        ...
      ai-systems/
        rag-pipeline.ts
        react-agent-loop.ts
        ...
      cloud/
        docker-lifecycle.ts
        k8s-pod-lifecycle.ts
        ...
      cybersecurity/
        tls-handshake.ts
        sql-injection.ts
        ...
      compiler/
        nfa-to-dfa.ts
        ll1-parser.ts
        ...
      ... (other categories)
    lib/
      visualization-registry.ts  # Central registry of all modules
      animation-engine.ts        # Core step-through engine
      code-highlighter.ts        # Monaco line highlighting logic
    data/
      taxonomy.ts                # The full category tree structure
    hooks/
      useVisualization.ts        # Hook for managing viz state
      useAnimationPlayer.ts      # Hook for play/pause/step
    styles/
      ...
  public/
    ...
```

---

## MVP Scope (Phase 1: First 20 Visualizations)

Launch with these high-traffic, most-searched topics:

1. Binary Search
2. Bubble Sort
3. Merge Sort
4. Quick Sort
5. BFS (Breadth-First Search)
6. DFS (Depth-First Search)
7. Dijkstra's Shortest Path
8. Linked List Operations
9. Binary Search Tree (insert, search, delete)
10. Stack and Queue operations
11. Hash Table (chaining + open addressing)
12. TCP 3-Way Handshake
13. HTTP Request/Response Lifecycle
14. RAG Pipeline (document to answer)
15. Transformer Self-Attention
16. Gradient Descent (2D landscape)
17. Neural Network Forward Pass
18. DNS Resolution
19. OAuth 2.0 Flow
20. Docker Container Lifecycle

### Phase 2 (weeks 5-12): Expand to 50-60
Add OS scheduling, compiler phases, more ML, cybersecurity

### Phase 3 (months 4-6): Community and scale
Open contribution framework, contributor guidelines, quality review

### Phase 4 (months 6-12): AI features + monetization
Natural language to visualization, pro tier, education licenses

---

## Monetization

### Free Tier
- Access to all basic DSA visualizations (~50)
- Limited step-through (can view but not customize input)

### Pro Tier ($10-15/month)
- All 500+ visualizations
- Custom input for any algorithm
- Code in multiple languages (Python, Java, C++, JS)
- Download animations as GIF/MP4
- Bookmarks and progress tracking
- AI explanations

### Education Tier ($5/student/semester)
- Teacher dashboard
- Assignment integration
- Student progress tracking
- Custom visualization sets per course
- LMS integration (Canvas, Moodle)

### Enterprise
- Custom visualizations for onboarding
- API access
- White-label options

---

## Brand Identity

Name: AlgoVerse
Tagline: "See it. Understand it. Build it."
Tone: Clean, minimal, professional but approachable
Audience: CS students, self-learners, bootcamp students, developers, educators

### Design Principles
- Dark mode by default (easy on eyes for long study sessions)
- Minimal chrome, maximum visualization space
- Smooth animations (60fps target)
- Accessible (keyboard navigation, screen reader support)
- Mobile responsive (visualization adapts, code panel collapses)

---

## Development Priorities

1. Build the shell: sidebar nav + center canvas + right code panel layout
2. Build the animation engine (step-through, play/pause/speed)
3. Build the code highlighting sync system
4. Create first 5 sorting visualizations as proof of concept
5. Add graph visualizations (BFS, DFS, Dijkstra)
6. Deploy MVP on Vercel
7. Add remaining Phase 1 topics
8. Add auth + progress tracking
9. Add custom input support
10. Launch publicly

---

## Notes

- Every visualization MUST have synced code. No visualization without code.
- Every visualization MUST have step descriptions in plain English.
- Custom input support is critical (users enter own arrays, graphs, etc.)
- Variable state panel must update in real-time with each step.
- Speed control must be smooth (not just fast/slow toggle).
- Mobile: visualization takes full width, code panel accessible via swipe/tab.
- SEO: each visualization page should be individually indexable.
- Sharing: each visualization state should be shareable via URL.
