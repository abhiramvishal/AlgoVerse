import type { VisualizationModule } from "@/types/visualization";

// ── Fully implemented ────────────────────────────────────────────────────────
import { bubbleSortModule } from "@/visualizations/algorithms/sorting/bubble-sort";
import { mergeSortModule } from "@/visualizations/algorithms/sorting/merge-sort";
import { quickSortModule } from "@/visualizations/algorithms/sorting/quick-sort";
import { bfsModule } from "@/visualizations/algorithms/graph/bfs";
import { dfsModule } from "@/visualizations/algorithms/graph/dfs";
import { dijkstraModule } from "@/visualizations/algorithms/graph/dijkstra";
import { binarySearchModule } from "@/visualizations/data-structures/arrays/binary-search";
import { hashTableChainingModule } from "@/visualizations/data-structures/hash-tables/hash-table-chaining";
import { singlyLinkedListModule } from "@/visualizations/data-structures/linked-lists/singly-linked-list";
import { stackQueueModule } from "@/visualizations/data-structures/stacks-queues/stack-queue";
import { binarySearchTreeModule } from "@/visualizations/data-structures/trees/binary-search-tree";

// ── Sorting (individual implementations) ─────────────────────────────────────
import { selectionSortModule } from "@/visualizations/algorithms/sorting/selection-sort";
import { insertionSortModule } from "@/visualizations/algorithms/sorting/insertion-sort";
import { shellSortModule } from "@/visualizations/algorithms/sorting/shell-sort";
import { heapSortModule } from "@/visualizations/algorithms/sorting/heap-sort";
import { countingSortModule } from "@/visualizations/algorithms/sorting/counting-sort";
import { radixSortModule } from "@/visualizations/algorithms/sorting/radix-sort";
import { bucketSortModule } from "@/visualizations/algorithms/sorting/bucket-sort";
import { cycleSortModule } from "@/visualizations/algorithms/sorting/cycle-sort";
import { timSortModule } from "@/visualizations/algorithms/sorting/tim-sort";
import { introSortModule } from "@/visualizations/algorithms/sorting/intro-sort";

// ── Searching (individual implementations) ────────────────────────────────────
import { linearSearchAlgModule } from "@/visualizations/algorithms/searching/linear-search-alg";
import { binarySearchAlgModule } from "@/visualizations/algorithms/searching/binary-search-alg";
import { jumpSearchModule } from "@/visualizations/algorithms/searching/jump-search";
import { interpolationSearchModule } from "@/visualizations/algorithms/searching/interpolation-search";
import { exponentialSearchModule } from "@/visualizations/algorithms/searching/exponential-search";
import { ternarySearchModule } from "@/visualizations/algorithms/searching/ternary-search";
import { fibonacciSearchModule } from "@/visualizations/algorithms/searching/fibonacci-search";

// ── Graph (individual implementations) ───────────────────────────────────────
import { bellmanFordModule } from "@/visualizations/algorithms/graph/bellman-ford";
import { kruskalModule } from "@/visualizations/algorithms/graph/kruskal";
import { primModule } from "@/visualizations/algorithms/graph/prim";
import { topologicalSortModule } from "@/visualizations/algorithms/graph/topological-sort";
import {
  floydWarshallModule, aStarModule, johnsonsModule,
  boruvkaModule,
  kahnsAlgorithmModule, tarjanSccModule, kosarajuSccModule, fordFulkersonModule,
  edmondsKarpModule, bipartiteCheckModule, cycleDetectionGraphModule,
  eulerPathModule, articulationPointsModule, bridgesGraphModule,
} from "@/visualizations/algorithms/graph/graph-catalog";

// ── DP (individual implementations) ──────────────────────────────────────────
import { fibonacciDpModule } from "@/visualizations/algorithms/dp/fibonacci-dp";
import { coinChangeModule } from "@/visualizations/algorithms/dp/coin-change";
import { lcsModule } from "@/visualizations/algorithms/dp/lcs";
import { knapsack01Module } from "@/visualizations/algorithms/dp/knapsack-01";
import { lisModule } from "@/visualizations/algorithms/dp/lis";
import {
  unboundedKnapsackModule, editDistanceModule, matrixChainModule, uniquePathsModule,
  minPathSumModule, wordBreakDpModule, palindromePartitionDpModule, rodCuttingModule,
  eggDropModule, tspDpModule, sosDpModule,
} from "@/visualizations/algorithms/dp/dp-catalog";

// ── Greedy (individual implementations) ──────────────────────────────────────
import { activitySelectionModule } from "@/visualizations/algorithms/greedy/activity-selection";
import { huffmanCodingModule } from "@/visualizations/algorithms/greedy/huffman-coding";
import {
  jobSchedulingModule,
  fractionalKnapsackModule, egyptianFractionModule, minimumPlatformsModule,
  gasStationModule,
} from "@/visualizations/algorithms/greedy/greedy-catalog";

// ── Backtracking (individual implementations) ─────────────────────────────────
import { nQueensModule } from "@/visualizations/algorithms/backtracking/n-queens";
import {
  sudokuSolverModule, permutationsBtModule, combinationsBtModule,
  subsetsBtModule, wordSearchBtModule, ratInMazeModule, graphColoringModule,
  hamiltonianPathModule,
} from "@/visualizations/algorithms/backtracking/backtracking-catalog";

// ── Divide & Conquer catalog ─────────────────────────────────────────────────
import {
  karatsubaModule, strassenModule, closestPairModule, medianOfMediansModule,
  fastFourierTransformModule,
} from "@/visualizations/algorithms/divide-conquer/dc-catalog";

// ── String (individual implementations) ──────────────────────────────────────
import { kmpModule } from "@/visualizations/algorithms/string/kmp";
import {
  rabinKarpModule, boyerMooreModule, zAlgorithmModule,
  ahoCorasickModule, manacherModule, suffixArrayModule, suffixTreeModule,
} from "@/visualizations/algorithms/string/string-catalog";

// ── Math (individual implementations) ────────────────────────────────────────
import { gcdEuclideanModule } from "@/visualizations/algorithms/math/gcd-euclidean";
import { sieveEratosthenesModule } from "@/visualizations/algorithms/math/sieve-eratosthenes";
import {
  extendedEuclideanModule,
  segmentedSieveModule, fastExponentiationModule, chineseRemainderModule,
  millerRabinModule, pollardRhoModule,
} from "@/visualizations/algorithms/math/math-catalog";

// ── Bit manipulation catalog ─────────────────────────────────────────────────
import {
  bitBasicsModule, brianKernighanModule, powerOfTwoModule,
  xorTricksModule, bitmaskBasicsModule,
} from "@/visualizations/algorithms/bit/bit-catalog";

// ── Geometry catalog ─────────────────────────────────────────────────────────
import {
  convexHullGrahamModule, convexHullJarvisModule,
  lineIntersectionModule, pointInPolygonModule,
} from "@/visualizations/algorithms/geometry/geometry-catalog";

// ── Randomized catalog ───────────────────────────────────────────────────────
import {
  randomizedQuicksortModule, reservoirSamplingModule,
  monteCarloPiModule, lasVegasModule,
} from "@/visualizations/algorithms/randomized/randomized-catalog";

// ── Data Structures (individual heap implementations) ────────────────────────
import { maxHeapModule } from "@/visualizations/data-structures/heaps/max-heap";
import { minHeapModule } from "@/visualizations/data-structures/heaps/min-heap";
// ── Data Structures catalog ──────────────────────────────────────────────────
import {
  linearSearchModule, twoPointersModule, slidingWindowModule, kadaneModule,
  doublyLinkedListModule, circularLinkedListModule, skipListModule,
  stackModule, monotonicStackModule,
  queueModule, dequeModule, priorityQueueModule, circularQueueModule,
  hashTableLinearProbingModule, hashTableQuadraticProbingModule, hashTableDoubleHashingModule,
  avlTreeModule, redBlackTreeModule, bTreeModule, trieModule,
  segmentTreeModule, fenwickTreeModule, splayTreeModule,
  fibonacciHeapModule,
  adjacencyListModule, adjacencyMatrixModule, edgeListModule,
  unionFindModule, lruCacheModule, lfuCacheModule,
  bloomFilterModule, lsmTreeModule, ropeDsModule,
} from "@/visualizations/data-structures/ds-catalog";

// ── OS (individual implementations) ──────────────────────────────────────────
import { fcfsModule } from "@/visualizations/os/fcfs";
import { sjfModule } from "@/visualizations/os/sjf";
import { roundRobinModule } from "@/visualizations/os/round-robin";
// ── OS catalog ───────────────────────────────────────────────────────────────
import {
  srtfModule, prioritySchedulingModule,
  multilevelQueueModule, multilevelFeedbackModule,
  pagingModule, segmentationModule, virtualMemoryModule, buddySystemModule,
  fifoPageModule, lruPageModule, optimalPageModule, clockPageModule, nfuPageModule,
  deadlockDetectionModule, bankersAlgorithmModule, deadlockPreventionModule, deadlockRecoveryModule,
  fcfsDiskModule, sstfModule, scanDiskModule, cScanModule, lookDiskModule,
  mutexModule, semaphoreModule, monitorModule, producerConsumerModule,
  readersWritersModule, diningPhilosophersModule,
} from "@/visualizations/os/os-catalog";

// ── Networks catalog ─────────────────────────────────────────────────────────
import {
  threeWayHandshakeModule, fourWayTerminationModule, tcpCongestionModule, tcpFlowControlModule,
  httpLifecycleModule, dnsResolutionModule, dhcpModule, smtpModule, websocketModule,
  ipAddressingModule, natModule, ospfModule, bgpModule, ripModule,
  arpModule, csmaCdModule, ethernetFrameModule,
  tlsHandshakeModule, oauth2Module, jwtModule, firewallModule,
} from "@/visualizations/networks/networks-catalog";

// ── Databases catalog ────────────────────────────────────────────────────────
import {
  btreeIndexModule, hashIndexModule, lsmIndexModule, bitmapIndexModule,
  nestedLoopJoinModule, hashJoinModule, sortMergeJoinModule, queryOptimizationModule,
  twoPhaseLockingModule, mvccModule, acidModule,
  heapFileModule, rowVsColumnModule, walModule,
} from "@/visualizations/databases/db-catalog";

// ── Compiler catalog ─────────────────────────────────────────────────────────
import {
  dfaLexerModule, nfaToDfaModule, regexToNfaModule, tokenizationModule,
  recursiveDescentModule, ll1ParserModule, lr0ParserModule, lalrParserModule, earleyParserModule,
  symbolTableModule, typeCheckingModule, astGenModule,
  threeAddressCodeModule, registerAllocationModule, constantFoldingModule, deadCodeEliminationModule,
} from "@/visualizations/compiler/compiler-catalog";

// ── Architecture catalog ─────────────────────────────────────────────────────
import {
  instructionPipelineModule, branchPredictionModule, outOfOrderModule, superscalarModule,
  directMappedCacheModule, setAssociativeCacheModule, fullyAssociativeCacheModule,
  cacheReplacementModule, cacheCoherenceModule,
  memoryHierarchyVizModule, virtualMemoryArchModule, tlbModule,
  dmaModule, interruptsModule, busesModule,
} from "@/visualizations/architecture/arch-catalog";

// ── ML/AI catalog ────────────────────────────────────────────────────────────
import {
  linearRegressionModule, logisticRegressionModule, decisionTreeMlModule,
  randomForestModule, svmModule, knnModule, naiveBayesModule,
  perceptronModule, mlpForwardModule, backpropagationModule, cnnModule, rnnModule, lstmModule,
  kmeansModule, dbscanModule, hierarchicalClusteringModule, pcaModule, autoencodersModule,
  gradientDescentModule, sgdModule, adamOptimizerModule, rmspropModule,
  transformerAttentionModule, ragPipelineModule, vectorEmbeddingsModule,
  beamSearchModule, mctsAiModule,
  qLearningModule, policyGradientModule, dqnModule,
} from "@/visualizations/ml-ai/ml-catalog";

// ── Cryptography catalog ─────────────────────────────────────────────────────
import {
  aesModule, desModule, xorCipherModule, streamCipherModule,
  rsaModule, diffieHellmanModule, ecdhModule, elgamalModule,
  sha256Module, merkleCryptoModule, hmacModule, bcryptModule,
  tlsProtocolModule, pgpModule, kerberosModule,
} from "@/visualizations/cryptography/crypto-catalog";

// ── Distributed Systems catalog ──────────────────────────────────────────────
import {
  raftModule, paxosModule, byzantineFtModule, twoPhaseCommitModule,
  leaderFollowerModule, multiLeaderModule, quorumModule,
  roundRobinLbModule, consistentHashingModule, leastConnectionsModule, weightedRoundRobinModule,
  mapreduceModule, sagaPatternModule, eventSourcingModule, cqrsModule,
} from "@/visualizations/distributed/distributed-catalog";

// ── Theory of Computation catalog ────────────────────────────────────────────
import {
  dfaAutomataModule, nfaAutomataModule, epsilonNfaModule, pdaModule, turingMachineModule,
  cfgModule, cykAlgorithmModule, pumpingLemmaModule,
  pNpModule, npCompletenessModule, reductionModule, approximationModule,
} from "@/visualizations/theory/theory-catalog";

// ── Computer Graphics catalog ────────────────────────────────────────────────
import {
  bresenhamLineModule, bresenhamCircleModule, scanlineFillModule, floodFillModule,
  raySphereModule, rayTriangleModule, shadowRaysModule,
  twoDRotationModule, threeDRotationModule, affineTransformationsModule, homogeneousCoordsModule,
  cohenSutherlandModule, sutherlandHodgmanModule,
} from "@/visualizations/graphics/graphics-catalog";

// ── Parallel Computing catalog ───────────────────────────────────────────────
import {
  parallelMergeSortModule, bitonicSortModule, oddEvenSortModule, parallelPrefixModule,
  forkJoinModule, actorModelModule, pipelineParallelModule,
  simdModule, warpExecutionModule, cudaMemoryModule,
} from "@/visualizations/parallel/parallel-catalog";

// ── Quantum Computing catalog ────────────────────────────────────────────────
import {
  hadamardGateModule, cnotGateModule, toffoliGateModule, pauliGatesModule,
  groverSearchModule, shorFactoringModule, quantumTeleportationModule, deutschJozsaModule,
  superpositionModule, entanglementModule, quantumErrorModule,
} from "@/visualizations/quantum/quantum-catalog";

// ── Blockchain catalog ───────────────────────────────────────────────────────
import {
  blockchainStructureModule, merkleTreeBlockchainModule, hashChainModule,
  proofOfWorkModule, proofOfStakeModule, pbftModule,
  evmModule, gasCalculationModule,
} from "@/visualizations/blockchain/blockchain-catalog";

// ── Registry ─────────────────────────────────────────────────────────────────
export const visualizationModules: VisualizationModule[] = [
  // Implemented
  bubbleSortModule, mergeSortModule, quickSortModule,
  bfsModule, dfsModule, dijkstraModule,
  binarySearchModule, hashTableChainingModule, singlyLinkedListModule,
  stackQueueModule, binarySearchTreeModule,

  // Sorting
  selectionSortModule, insertionSortModule, shellSortModule, heapSortModule,
  countingSortModule, radixSortModule, bucketSortModule, timSortModule,
  introSortModule, cycleSortModule,

  // Searching
  linearSearchAlgModule, binarySearchAlgModule, jumpSearchModule,
  interpolationSearchModule, exponentialSearchModule, ternarySearchModule,
  fibonacciSearchModule,

  // Graph Algorithms
  bellmanFordModule, floydWarshallModule, aStarModule, johnsonsModule,
  kruskalModule, primModule, boruvkaModule, topologicalSortModule,
  kahnsAlgorithmModule, tarjanSccModule, kosarajuSccModule, fordFulkersonModule,
  edmondsKarpModule, bipartiteCheckModule, cycleDetectionGraphModule,
  eulerPathModule, articulationPointsModule, bridgesGraphModule,

  // Dynamic Programming
  fibonacciDpModule, coinChangeModule, knapsack01Module, unboundedKnapsackModule,
  lcsModule, lisModule, editDistanceModule, matrixChainModule, uniquePathsModule,
  minPathSumModule, wordBreakDpModule, palindromePartitionDpModule, rodCuttingModule,
  eggDropModule, tspDpModule, sosDpModule,

  // Greedy
  activitySelectionModule, jobSchedulingModule, huffmanCodingModule,
  fractionalKnapsackModule, egyptianFractionModule, minimumPlatformsModule,
  gasStationModule,

  // Backtracking
  nQueensModule, sudokuSolverModule, permutationsBtModule, combinationsBtModule,
  subsetsBtModule, wordSearchBtModule, ratInMazeModule, graphColoringModule,
  hamiltonianPathModule,

  // Divide & Conquer
  karatsubaModule, strassenModule, closestPairModule, medianOfMediansModule,
  fastFourierTransformModule,

  // String Algorithms
  kmpModule, rabinKarpModule, boyerMooreModule, zAlgorithmModule,
  ahoCorasickModule, manacherModule, suffixArrayModule, suffixTreeModule,

  // Mathematical
  gcdEuclideanModule, extendedEuclideanModule, sieveEratosthenesModule,
  segmentedSieveModule, fastExponentiationModule, chineseRemainderModule,
  millerRabinModule, pollardRhoModule,

  // Bit Manipulation
  bitBasicsModule, brianKernighanModule, powerOfTwoModule,
  xorTricksModule, bitmaskBasicsModule,

  // Geometry
  convexHullGrahamModule, convexHullJarvisModule,
  lineIntersectionModule, pointInPolygonModule,

  // Randomized
  randomizedQuicksortModule, reservoirSamplingModule,
  monteCarloPiModule, lasVegasModule,

  // Data Structures
  linearSearchModule, twoPointersModule, slidingWindowModule, kadaneModule,
  doublyLinkedListModule, circularLinkedListModule, skipListModule,
  stackModule, monotonicStackModule,
  queueModule, dequeModule, priorityQueueModule, circularQueueModule,
  hashTableLinearProbingModule, hashTableQuadraticProbingModule, hashTableDoubleHashingModule,
  avlTreeModule, redBlackTreeModule, bTreeModule, trieModule,
  segmentTreeModule, fenwickTreeModule, splayTreeModule,
  minHeapModule, maxHeapModule, fibonacciHeapModule,
  adjacencyListModule, adjacencyMatrixModule, edgeListModule,
  unionFindModule, lruCacheModule, lfuCacheModule,
  bloomFilterModule, lsmTreeModule, ropeDsModule,

  // Operating Systems
  fcfsModule, sjfModule, srtfModule, roundRobinModule, prioritySchedulingModule,
  multilevelQueueModule, multilevelFeedbackModule,
  pagingModule, segmentationModule, virtualMemoryModule, buddySystemModule,
  fifoPageModule, lruPageModule, optimalPageModule, clockPageModule, nfuPageModule,
  deadlockDetectionModule, bankersAlgorithmModule, deadlockPreventionModule, deadlockRecoveryModule,
  fcfsDiskModule, sstfModule, scanDiskModule, cScanModule, lookDiskModule,
  mutexModule, semaphoreModule, monitorModule, producerConsumerModule,
  readersWritersModule, diningPhilosophersModule,

  // Networks
  threeWayHandshakeModule, fourWayTerminationModule, tcpCongestionModule, tcpFlowControlModule,
  httpLifecycleModule, dnsResolutionModule, dhcpModule, smtpModule, websocketModule,
  ipAddressingModule, natModule, ospfModule, bgpModule, ripModule,
  arpModule, csmaCdModule, ethernetFrameModule,
  tlsHandshakeModule, oauth2Module, jwtModule, firewallModule,

  // Databases
  btreeIndexModule, hashIndexModule, lsmIndexModule, bitmapIndexModule,
  nestedLoopJoinModule, hashJoinModule, sortMergeJoinModule, queryOptimizationModule,
  twoPhaseLockingModule, mvccModule, acidModule,
  heapFileModule, rowVsColumnModule, walModule,

  // Compiler
  dfaLexerModule, nfaToDfaModule, regexToNfaModule, tokenizationModule,
  recursiveDescentModule, ll1ParserModule, lr0ParserModule, lalrParserModule, earleyParserModule,
  symbolTableModule, typeCheckingModule, astGenModule,
  threeAddressCodeModule, registerAllocationModule, constantFoldingModule, deadCodeEliminationModule,

  // Architecture
  instructionPipelineModule, branchPredictionModule, outOfOrderModule, superscalarModule,
  directMappedCacheModule, setAssociativeCacheModule, fullyAssociativeCacheModule,
  cacheReplacementModule, cacheCoherenceModule,
  memoryHierarchyVizModule, virtualMemoryArchModule, tlbModule,
  dmaModule, interruptsModule, busesModule,

  // ML/AI
  linearRegressionModule, logisticRegressionModule, decisionTreeMlModule,
  randomForestModule, svmModule, knnModule, naiveBayesModule,
  perceptronModule, mlpForwardModule, backpropagationModule, cnnModule, rnnModule, lstmModule,
  kmeansModule, dbscanModule, hierarchicalClusteringModule, pcaModule, autoencodersModule,
  gradientDescentModule, sgdModule, adamOptimizerModule, rmspropModule,
  transformerAttentionModule, ragPipelineModule, vectorEmbeddingsModule,
  beamSearchModule, mctsAiModule,
  qLearningModule, policyGradientModule, dqnModule,

  // Cryptography
  aesModule, desModule, xorCipherModule, streamCipherModule,
  rsaModule, diffieHellmanModule, ecdhModule, elgamalModule,
  sha256Module, merkleCryptoModule, hmacModule, bcryptModule,
  tlsProtocolModule, pgpModule, kerberosModule,

  // Distributed Systems
  raftModule, paxosModule, byzantineFtModule, twoPhaseCommitModule,
  leaderFollowerModule, multiLeaderModule, quorumModule,
  roundRobinLbModule, consistentHashingModule, leastConnectionsModule, weightedRoundRobinModule,
  mapreduceModule, sagaPatternModule, eventSourcingModule, cqrsModule,

  // Theory
  dfaAutomataModule, nfaAutomataModule, epsilonNfaModule, pdaModule, turingMachineModule,
  cfgModule, cykAlgorithmModule, pumpingLemmaModule,
  pNpModule, npCompletenessModule, reductionModule, approximationModule,

  // Graphics
  bresenhamLineModule, bresenhamCircleModule, scanlineFillModule, floodFillModule,
  raySphereModule, rayTriangleModule, shadowRaysModule,
  twoDRotationModule, threeDRotationModule, affineTransformationsModule, homogeneousCoordsModule,
  cohenSutherlandModule, sutherlandHodgmanModule,

  // Parallel
  parallelMergeSortModule, bitonicSortModule, oddEvenSortModule, parallelPrefixModule,
  forkJoinModule, actorModelModule, pipelineParallelModule,
  simdModule, warpExecutionModule, cudaMemoryModule,

  // Quantum
  hadamardGateModule, cnotGateModule, toffoliGateModule, pauliGatesModule,
  groverSearchModule, shorFactoringModule, quantumTeleportationModule, deutschJozsaModule,
  superpositionModule, entanglementModule, quantumErrorModule,

  // Blockchain
  blockchainStructureModule, merkleTreeBlockchainModule, hashChainModule,
  proofOfWorkModule, proofOfStakeModule, pbftModule,
  evmModule, gasCalculationModule,
];

export const visualizationRegistry = new Map(
  visualizationModules.map((m) => [m.slug, m]),
);

export function getVisualizationBySlug(slug: string) {
  return visualizationRegistry.get(slug);
}
