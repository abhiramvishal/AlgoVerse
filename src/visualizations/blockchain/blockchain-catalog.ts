import { createPlaceholderModule } from "@/visualizations/placeholder";

// Fundamentals
export const blockchainStructureModule = createPlaceholderModule(
  "blockchain-structure", "blockchain-structure", "Blockchain Structure",
  ["blockchain", "blockchain-fundamentals"], "beginner",
);
export const merkleTreeBlockchainModule = createPlaceholderModule(
  "merkle-tree-blockchain", "merkle-tree-blockchain", "Merkle Tree",
  ["blockchain", "blockchain-fundamentals"], "intermediate",
);
export const hashChainModule = createPlaceholderModule(
  "hash-chain", "hash-chain", "Hash Chain",
  ["blockchain", "blockchain-fundamentals"], "beginner",
);

// Consensus Mechanisms
export const proofOfWorkModule = createPlaceholderModule(
  "proof-of-work", "proof-of-work", "Proof of Work",
  ["blockchain", "consensus-blockchain"], "intermediate",
);
export const proofOfStakeModule = createPlaceholderModule(
  "proof-of-stake", "proof-of-stake", "Proof of Stake",
  ["blockchain", "consensus-blockchain"], "intermediate",
);
export const pbftModule = createPlaceholderModule(
  "pbft", "pbft", "PBFT",
  ["blockchain", "consensus-blockchain"], "advanced",
);

// Smart Contracts
export const evmModule = createPlaceholderModule(
  "evm", "evm", "EVM Execution",
  ["blockchain", "smart-contracts"], "advanced",
);
export const gasCalculationModule = createPlaceholderModule(
  "gas-calculation", "gas-calculation", "Gas Calculation",
  ["blockchain", "smart-contracts"], "intermediate",
);
