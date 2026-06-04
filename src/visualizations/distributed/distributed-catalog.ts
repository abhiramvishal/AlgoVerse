import { createPlaceholderModule } from "@/visualizations/placeholder";

// Consensus
export const raftModule = createPlaceholderModule(
  "raft", "raft", "Raft Consensus",
  ["distributed-systems", "consensus"], "advanced",
);
export const paxosModule = createPlaceholderModule(
  "paxos", "paxos", "Paxos",
  ["distributed-systems", "consensus"], "advanced",
);
export const byzantineFtModule = createPlaceholderModule(
  "byzantine-ft", "byzantine-ft", "Byzantine Fault Tolerance",
  ["distributed-systems", "consensus"], "advanced",
);
export const twoPhaseCommitModule = createPlaceholderModule(
  "two-phase-commit", "two-phase-commit", "Two-Phase Commit",
  ["distributed-systems", "consensus"], "intermediate",
);

// Replication
export const leaderFollowerModule = createPlaceholderModule(
  "leader-follower", "leader-follower", "Leader-Follower Replication",
  ["distributed-systems", "replication"], "intermediate",
);
export const multiLeaderModule = createPlaceholderModule(
  "multi-leader", "multi-leader", "Multi-Leader Replication",
  ["distributed-systems", "replication"], "advanced",
);
export const quorumModule = createPlaceholderModule(
  "quorum", "quorum", "Quorum-based Replication",
  ["distributed-systems", "replication"], "intermediate",
);

// Load Balancing
export const roundRobinLbModule = createPlaceholderModule(
  "round-robin-lb", "round-robin-lb", "Round Robin Load Balancing",
  ["distributed-systems", "load-balancing-dist"], "beginner",
);
export const consistentHashingModule = createPlaceholderModule(
  "consistent-hashing", "consistent-hashing", "Consistent Hashing",
  ["distributed-systems", "load-balancing-dist"], "intermediate",
);
export const leastConnectionsModule = createPlaceholderModule(
  "least-connections", "least-connections", "Least Connections",
  ["distributed-systems", "load-balancing-dist"], "beginner",
);
export const weightedRoundRobinModule = createPlaceholderModule(
  "weighted-round-robin", "weighted-round-robin", "Weighted Round Robin",
  ["distributed-systems", "load-balancing-dist"], "intermediate",
);

// Patterns
export const mapreduceModule = createPlaceholderModule(
  "mapreduce", "mapreduce", "MapReduce",
  ["distributed-systems", "distributed-patterns"], "intermediate",
);
export const sagaPatternModule = createPlaceholderModule(
  "saga-pattern", "saga-pattern", "Saga Pattern",
  ["distributed-systems", "distributed-patterns"], "advanced",
);
export const eventSourcingModule = createPlaceholderModule(
  "event-sourcing", "event-sourcing", "Event Sourcing",
  ["distributed-systems", "distributed-patterns"], "intermediate",
);
export const cqrsModule = createPlaceholderModule(
  "cqrs", "cqrs", "CQRS",
  ["distributed-systems", "distributed-patterns"], "intermediate",
);
