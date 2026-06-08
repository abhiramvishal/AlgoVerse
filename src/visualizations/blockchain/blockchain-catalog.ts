import type { VisualizationModule, AnimationStep } from "@/types/visualization";

function arr(stepNumber: number, description: string, lines: number[], cells: {val: string|number, state: string}[], label: string, vars: Record<string,unknown>): AnimationStep {
  return { stepNumber, description, highlightLines: lines, visualState: { type: "array1d", cells, label }, variables: vars };
}

// ─── Blockchain Structure ─────────────────────────────────────────────────────
export const blockchainStructureModule: VisualizationModule<number> = {
  id: "blockchain-structure", slug: "blockchain-structure", title: "Blockchain Structure",
  category: ["blockchain"], difficulty: "beginner",
  timeComplexity: "O(1) per block append", spaceComplexity: "O(n)",
  description: "Linked chain of blocks: each block contains data, timestamp, and hash of previous block.",
  relatedTopics: [],
  pythonCode: `import hashlib, json, time

class Block:
    def __init__(self, index, data, prev_hash):
        self.index     = index
        self.timestamp = time.time()
        self.data      = data
        self.prev_hash = prev_hash
        self.nonce     = 0
        self.hash      = self.compute_hash()

    def compute_hash(self):
        content = json.dumps({
            'index':     self.index,
            'timestamp': self.timestamp,
            'data':      self.data,
            'prev_hash': self.prev_hash,
            'nonce':     self.nonce,
        }, sort_keys=True)
        return hashlib.sha256(content.encode()).hexdigest()

class Blockchain:
    def __init__(self):
        genesis = Block(0, "Genesis", "0" * 64)
        self.chain = [genesis]

    def add_block(self, data):
        prev = self.chain[-1]
        block = Block(len(self.chain), data, prev.hash)
        self.chain.append(block)`,
  codeSteps: [
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 21, highlightLines: [21] },
    { stepNumber: 25, highlightLines: [25] },
  ],
  defaultInput: 4,
  generateSteps(n) {
    const hashes = Array.from({length:n}, (_,i) => `${i===0?"000":"abc"}${i}f2e…`);
    const steps: AnimationStep[] = [];
    steps.push(arr(1,"Genesis block: index=0, prev_hash=000…0",[21,22,23],
      [{val:"Block 0",state:"active"},{val:"data:Genesis",state:"default"},{val:"prev:000…0",state:"default"},{val:`hash:${hashes[0]}`,state:"computed"}],
      "Genesis", {index:0}));
    for (let i = 1; i < n; i++) {
      steps.push(arr(i+1,`Add Block ${i}: prev_hash = hash of Block ${i-1}`,[25,26,27],
        [{val:`Block ${i}`,state:"active"},{val:`data:Tx${i}`,state:"default"},{val:`prev:${hashes[i-1]}`,state:"highlighted"},{val:`hash:${hashes[i]}`,state:"computed"}],
        `Block ${i}`, {linkedTo:i-1}));
    }
    steps.push(arr(n+1,"Tamper Block 1: hash changes → breaks all subsequent blocks",[9,10,11,12,13,14,15,16,17,18],
      hashes.map((_,i)=>({val:`Block ${i}`,state:i===0?"default":i===1?"active":"highlighted" as string})),
      "Tamper detection", {tampered:1, broken:n-1}));
    return steps;
  }
};

// ─── Merkle Tree (Blockchain) ─────────────────────────────────────────────────
export const merkleTreeBlockchainModule: VisualizationModule<string[]> = {
  id: "merkle-tree-blockchain", slug: "merkle-tree-blockchain", title: "Merkle Tree (Blockchain)",
  category: ["blockchain"], difficulty: "intermediate",
  timeComplexity: "O(n log n)", spaceComplexity: "O(n)",
  description: "Binary hash tree of all transactions in a block — enables SPV light-client proofs.",
  relatedTopics: [],
  pythonCode: `import hashlib

def sha256d(data: str) -> str:
    """Double SHA-256 (Bitcoin standard)"""
    h = hashlib.sha256(data.encode()).digest()
    return hashlib.sha256(h).hexdigest()[:8]

def merkle_root(txids: list[str]) -> str:
    if len(txids) == 1:
        return txids[0]
    if len(txids) % 2 == 1:
        txids.append(txids[-1])   # duplicate last tx if odd
    level = [sha256d(txids[i]+txids[i+1]) for i in range(0,len(txids),2)]
    return merkle_root(level)

def spv_proof(txids, target_idx):
    """Minimal proof path: O(log n) hashes"""
    proof = []
    level = list(txids)
    while len(level) > 1:
        if len(level) % 2 == 1: level.append(level[-1])
        sibling = target_idx ^ 1
        proof.append(level[sibling])
        target_idx //= 2
        level = [sha256d(level[i]+level[i+1]) for i in range(0,len(level),2)]
    return proof`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 16, highlightLines: [16] },
  ],
  defaultInput: ["Tx0","Tx1","Tx2","Tx3","Tx4","Tx5","Tx6","Tx7"],
  generateSteps(txids) {
    const n = txids.length;
    const h = (s:string) => s.slice(0,3)+"…";
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`${n} transactions — leaf nodes`,[8],txids.map(t=>({val:t,state:"active" as string})),"Transactions",{n}));
    const l1 = Array.from({length:n/2},(_,i)=>({val:`H(${h(txids[i*2])}+${h(txids[i*2+1])})`,state:"computed" as string}));
    steps.push(arr(2,"Level 1: hash adjacent pairs",[12],l1,"Level 1",{nodes:l1.length}));
    const l2 = Array.from({length:n/4},(_,i)=>({val:`H(L1_${i*2}+L1_${i*2+1})`,state:"computed" as string}));
    steps.push(arr(3,"Level 2: hash level-1 pairs",[12],l2,"Level 2",{nodes:l2.length}));
    steps.push(arr(4,"Merkle root: single 32-byte hash of all txs",[13],[{val:"MerkleRoot",state:"highlighted"},{val:"32 bytes",state:"computed"}],"Root",{commits:n+" txs"}));
    steps.push(arr(5,"SPV proof for Tx0: only log₂(8)=3 hashes needed",[16,17,18,19,20,21,22],
      [{val:"H(Tx1)",state:"active"},{val:"H(L1_2+L1_3)",state:"active"},{val:"H(L2_1)",state:"active"}],
      "SPV Proof",{size:3,fullTxCount:n}));
    return steps;
  }
};

// ─── Hash Chain ───────────────────────────────────────────────────────────────
export const hashChainModule: VisualizationModule<number> = {
  id: "hash-chain", slug: "hash-chain", title: "Hash Chain",
  category: ["blockchain"], difficulty: "beginner",
  timeComplexity: "O(n)", spaceComplexity: "O(n)",
  description: "Sequential SHA-256 hashes link data immutably — basis of blockchain tamper-evidence.",
  relatedTopics: [],
  pythonCode: `import hashlib

def build_hash_chain(data_list):
    chain = []
    prev_hash = "0" * 64          # genesis: all zeros
    for data in data_list:
        content = prev_hash + data
        current_hash = hashlib.sha256(content.encode()).hexdigest()
        chain.append({
            'data':      data,
            'prev_hash': prev_hash,
            'hash':      current_hash
        })
        prev_hash = current_hash
    return chain

def verify_chain(chain):
    for i in range(1, len(chain)):
        expected = sha256(chain[i-1]['hash'] + chain[i]['data'])
        if expected != chain[i]['hash']:
            return False, i   # tampered at index i
    return True, -1`,
  codeSteps: [
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 13, highlightLines: [13] },
    { stepNumber: 16, highlightLines: [16] },
  ],
  defaultInput: 5,
  generateSteps(n) {
    const data = Array.from({length:n},(_,i)=>`Block${i}`);
    let prev = "0".repeat(8);
    const steps: AnimationStep[] = [];
    steps.push(arr(1,"Genesis: prev_hash = 000…0",[4,5],[{val:"prev=000…0",state:"active"}],"Genesis",{}));
    data.forEach((d,i) => {
      const hash = `h${i}${(i*37+13).toString(16)}…`;
      steps.push(arr(i+2,`Block ${i}: SHA256(${prev.slice(0,6)}…+${d}) = ${hash}`,[6,7,8,9,10,11,12],
        [{val:d,state:"active"},{val:`prev:${prev}`,state:"computed"},{val:`hash:${hash}`,state:"highlighted"}],
        `Block ${i}`, {i, hash}));
      prev = hash.slice(0,8);
    });
    steps.push(arr(n+2,"Verify: recompute each hash — any mismatch → tampered",[16,17,18,19,20],
      data.map(d=>({val:d,state:"computed" as string})),
      "Verification",{valid:true}));
    return steps;
  }
};

// ─── Proof of Work ────────────────────────────────────────────────────────────
export const proofOfWorkModule: VisualizationModule<number> = {
  id: "proof-of-work", slug: "proof-of-work", title: "Proof of Work (Mining)",
  category: ["blockchain"], difficulty: "intermediate",
  timeComplexity: "O(2^difficulty) expected", spaceComplexity: "O(1)",
  description: "Find a nonce such that SHA-256(block+nonce) starts with N leading zeros.",
  relatedTopics: [],
  pythonCode: `import hashlib

def mine_block(block_header: str, difficulty: int) -> tuple[int, str]:
    target = '0' * difficulty          # e.g. '0000' for difficulty 4
    nonce = 0
    while True:
        candidate = block_header + str(nonce)
        hash_val  = hashlib.sha256(candidate.encode()).hexdigest()
        if hash_val.startswith(target):
            return nonce, hash_val     # found valid nonce!
        nonce += 1                     # try next nonce

# Bitcoin: ~4.3 billion hashes/second per ASIC
# Difficulty adjusts every 2016 blocks to target 10-min block time
# Expected hashes to find: 16^difficulty (16 = hex chars)`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 10, highlightLines: [10] },
  ],
  defaultInput: 4,
  generateSteps(difficulty) {
    const target = "0".repeat(difficulty);
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`Mine: find nonce where hash starts with "${target}"`,[3,4],
      [{val:`target: ${"0".repeat(difficulty)}${"?".repeat(8-difficulty)}`,state:"active"},{val:`difficulty=${difficulty}`,state:"default"}],
      "Mining target",{expected:Math.pow(16,difficulty)}));
    const nonces = [0,17,42,199,1337];
    nonces.slice(0,-1).forEach((nc,i) => {
      const h = `${(i+1).toString(16).padStart(difficulty-1,"a")}f3c2…`;
      steps.push(arr(i+2,`nonce=${nc}: hash=${h} ✗ (no leading zeros)`,[5,6,7,8,10],
        [{val:`nonce=${nc}`,state:"active"},{val:h,state:"computed"},{val:"✗",state:"default"}],
        `Attempt ${i+1}`,{nonce:nc}));
    });
    const winNonce = nonces[nonces.length-1];
    const winHash = target+"a3f2c9b1e4d7…";
    steps.push(arr(nonces.length+1,`nonce=${winNonce}: hash=${winHash} ✓ FOUND!`,[8,9],
      [{val:`nonce=${winNonce}`,state:"highlighted"},{val:winHash,state:"highlighted"},{val:"✓",state:"highlighted"}],
      "Block mined!",{nonce:winNonce,difficulty}));
    return steps;
  }
};

// ─── Proof of Stake ────────────────────────────────────────────────────────────
export const proofOfStakeModule: VisualizationModule<number[]> = {
  id: "proof-of-stake", slug: "proof-of-stake", title: "Proof of Stake",
  category: ["blockchain"], difficulty: "intermediate",
  timeComplexity: "O(n) validator selection", spaceComplexity: "O(n)",
  description: "Validators selected proportional to stake; no energy-wasting computation.",
  relatedTopics: [],
  pythonCode: `import random

class ProofOfStake:
    def __init__(self):
        self.validators = {}   # address → stake amount

    def stake(self, validator, amount):
        self.validators[validator] = self.validators.get(validator, 0) + amount

    def select_validator(self, seed):
        """Weighted random selection by stake"""
        total = sum(self.validators.values())
        r = (seed % total)       # deterministic from block seed
        cumulative = 0
        for validator, stake in self.validators.items():
            cumulative += stake
            if r < cumulative:
                return validator

    def slash(self, validator, amount):
        """Penalize malicious validators — lose stake"""
        self.validators[validator] -= amount

# Advantages over PoW:
# - No mining hardware or electricity waste
# - 99% less energy than Bitcoin PoW
# - Ethereum switched to PoS in 'The Merge' (2022)`,
  codeSteps: [
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 18, highlightLines: [18] },
  ],
  defaultInput: [400, 300, 200, 100],
  generateSteps(stakes) {
    const names = ["Alice","Bob","Carol","Dave"].slice(0,stakes.length);
    const total = stakes.reduce((a,b)=>a+b,0);
    const probs = stakes.map(s=>(s/total*100).toFixed(1));
    const steps: AnimationStep[] = [];
    steps.push(arr(1,"Validators and their stakes",[5,7,8],
      names.map((n,i)=>({val:`${n}: ${stakes[i]} ETH`,state:"active" as string})),
      "Validators",{total}));
    steps.push(arr(2,"Selection probability ∝ stake",[10,11],
      names.map((n,i)=>({val:`${n}: ${probs[i]}%`,state:"computed" as string})),
      "Probabilities",{total}));
    // Simulate 3 rounds
    [0,1,0].forEach((winner,round) => {
      steps.push(arr(round+3,`Round ${round+1}: seed selects ${names[winner]} (${probs[winner]}% chance)`,[12,13,14,15],
        names.map((n,i)=>({val:n,state:i===winner?"highlighted":"default" as string})),
        `Block proposer`,{proposer:names[winner]}));
    });
    steps.push(arr(6,"Slash: Carol double-signs → loses 50 ETH",[18],
      names.map((n,i)=>({val:`${n}: ${stakes[i]-(i===2?50:0)} ETH`,state:i===2?"active":"computed" as string})),
      "After slash",{slashed:"Carol"}));
    return steps;
  }
};

// ─── PBFT (Blockchain) ────────────────────────────────────────────────────────
export const pbftModule: VisualizationModule<number> = {
  id: "pbft", slug: "pbft", title: "PBFT Consensus (Blockchain)",
  category: ["blockchain"], difficulty: "advanced",
  timeComplexity: "O(n²) messages", spaceComplexity: "O(n)",
  description: "Practical BFT for permissioned blockchains: 3-phase protocol tolerates f < n/3 Byzantine nodes.",
  relatedTopics: [],
  pythonCode: `# PBFT for permissioned blockchain (Hyperledger Fabric style)
# n replicas, tolerates f = (n-1)//3 Byzantine faults

class PBFTNode:
    def pre_prepare(self, req, view, seq):
        """Primary broadcasts transaction to all replicas"""
        msg = (VIEW, SEQ, digest(req), req)
        self.broadcast(PRE_PREPARE, msg)

    def on_pre_prepare(self, msg):
        """Replica validates and broadcasts PREPARE"""
        if self.valid(msg):
            self.broadcast(PREPARE, (VIEW, SEQ, digest(msg)))

    def on_prepare(self, prepares):
        """After 2f PREPARE messages: enter prepared state"""
        if len(prepares) >= 2 * self.f:
            self.state = PREPARED
            self.broadcast(COMMIT, (VIEW, SEQ, self.id))

    def on_commit(self, commits):
        """After 2f+1 COMMIT messages: execute and reply"""
        if len(commits) >= 2 * self.f + 1:
            result = self.execute(self.request)
            self.reply(result)`,
  codeSteps: [
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 13, highlightLines: [13] },
    { stepNumber: 17, highlightLines: [17] },
    { stepNumber: 21, highlightLines: [21] },
  ],
  defaultInput: 4,
  generateSteps(n) {
    const f = Math.floor((n-1)/3);
    const nodes = Array.from({length:n},(_,i)=>({val:`N${i}`,state:i===n-1?"active":"default" as string}));
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`${n} nodes, f=${f} Byzantine tolerated`,[1,2],nodes,"Replicas",{n,f}));
    steps.push(arr(2,"Primary (N0) broadcasts PRE-PREPARE(v,seq,tx)",[5,6,7],
      nodes.map((nd,i)=>({...nd,state:i===0?"highlighted":"computed" as string})),
      "PRE-PREPARE",{from:"N0"}));
    steps.push(arr(3,"Replicas broadcast PREPARE(v,seq,digest)",[9,10,11],
      nodes.map((nd,i)=>({...nd,state:i===n-1?"active":"computed" as string})),
      "PREPARE phase",{need:`2f=${2*f}`}));
    steps.push(arr(4,`2f=${2*f} PREPARE msgs → PREPARED → broadcast COMMIT`,[13,14,15],
      nodes.map((nd,i)=>({...nd,state:"computed" as string})),
      "COMMIT phase",{prepared:true}));
    steps.push(arr(5,`2f+1=${2*f+1} COMMIT msgs → execute tx → reply`,[17,18,19,20,21],
      nodes.map((nd,i)=>({...nd,state:i===n-1?"active":"highlighted" as string})),
      "Committed",{executed:true}));
    return steps;
  }
};

// ─── EVM ──────────────────────────────────────────────────────────────────────
export const evmModule: VisualizationModule<string> = {
  id: "evm", slug: "evm", title: "Ethereum Virtual Machine (EVM)",
  category: ["blockchain"], difficulty: "advanced",
  timeComplexity: "O(gas_limit)", spaceComplexity: "O(stack+memory)",
  description: "Stack-based VM executes Solidity bytecode: each opcode costs gas.",
  relatedTopics: [],
  pythonCode: `# EVM: stack-based virtual machine
# Opcodes operate on a 256-bit word stack (max 1024 elements)

class EVM:
    def __init__(self, bytecode, calldata):
        self.stack   = []          # 256-bit words
        self.memory  = bytearray() # byte-addressed, grows on demand
        self.storage = {}          # persistent key→value (32-byte slots)
        self.pc      = 0           # program counter
        self.gas     = 30_000      # gas remaining

    def execute(self, bytecode):
        while self.pc < len(bytecode):
            op = bytecode[self.pc]
            self.gas -= OPCODE_GAS[op]
            if self.gas < 0: raise Exception("Out of gas")
            if   op == PUSH1:  self.stack.append(bytecode[self.pc+1]); self.pc+=2
            elif op == ADD:    self.stack.append(self.stack.pop()+self.stack.pop())
            elif op == MSTORE: addr,val=self.stack.pop(),self.stack.pop(); self.memory[addr:addr+32]=val
            elif op == SSTORE: key,val=self.stack.pop(),self.stack.pop(); self.storage[key]=val
            elif op == RETURN: return self.memory[self.stack.pop():self.stack.pop()]
            self.pc += 1`,
  codeSteps: [
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 14, highlightLines: [14] },
    { stepNumber: 15, highlightLines: [15] },
    { stepNumber: 16, highlightLines: [16] },
    { stepNumber: 17, highlightLines: [17] },
  ],
  defaultInput: "PUSH1 5 PUSH1 3 ADD",
  generateSteps(bytecode) {
    const ops = bytecode.split(" ");
    const steps: AnimationStep[] = [];
    let stack: number[] = [];
    let gas = 30000;
    steps.push(arr(1,"EVM initialized: empty stack, 30000 gas",[4,5,6,7,8,9],
      [{val:"stack:[]",state:"default"},{val:`gas:${gas}`,state:"active"}],
      "EVM init",{stack:[],gas}));
    ops.forEach((op,i) => {
      if (op === "PUSH1") return; // handled with next token
      if (!isNaN(+op) && i > 0 && ops[i-1] === "PUSH1") {
        stack.push(+op); gas -= 3;
        steps.push(arr(stack.length+1,`PUSH1 ${op}: push ${op} onto stack (3 gas)`,[14],
          ([...stack.map(v=>({val:v as string|number,state:"computed" as string})), {val:`gas:${gas}`,state:"default"}]),
          `Stack (PUSH)`,{op:`PUSH1 ${op}`,gas}));
      } else if (op === "ADD") {
        const b=stack.pop()!, a=stack.pop()!;
        stack.push(a+b); gas -= 3;
        steps.push(arr(stack.length+2,`ADD: pop ${a},${b} → push ${a+b} (3 gas)`,[15],
          ([...stack.map(v=>({val:v as string|number,state:"highlighted" as string})), {val:`gas:${gas}`,state:"default"}]),
          `Stack (ADD)`,{result:a+b,gas}));
      }
    });
    steps.push(arr(ops.length+1,`Execution complete. Stack: [${stack.join(",")}]`,[18],
      ([...stack.map(v=>({val:v as string|number,state:"highlighted" as string})), {val:`gas_used:${30000-gas}`,state:"computed"}]),
      "Done",{gasUsed:30000-gas}));
    return steps;
  }
};

// ─── Gas Calculation ──────────────────────────────────────────────────────────
export const gasCalculationModule: VisualizationModule<string[]> = {
  id: "gas-calculation", slug: "gas-calculation", title: "Gas Calculation",
  category: ["blockchain"], difficulty: "intermediate",
  timeComplexity: "O(n) opcodes", spaceComplexity: "O(1)",
  description: "Every EVM opcode has a gas cost — total cost = Σ opcode_gas; fee = gas × gas_price.",
  relatedTopics: [],
  pythonCode: `# EVM Gas costs (EIP-3529 / London fork)
OPCODE_GAS = {
    'ADD':    3,    'MUL':    5,    'SUB':    3,
    'DIV':    5,    'PUSH1':  3,    'POP':    2,
    'MLOAD':  3,    'MSTORE': 3,    'JUMP':   8,
    'SLOAD':  2100, 'SSTORE': 20000,  # cold storage access
    'CALL':   2600, 'DELEGATECALL': 2600,
    'CREATE': 32000,'SELFDESTRUCT': 5000,
}

def estimate_gas(opcodes):
    total = 21000  # base tx cost
    for op in opcodes:
        total += OPCODE_GAS.get(op, 0)
    return total

def tx_fee(gas_used, base_fee, priority_fee):
    """EIP-1559 fee model"""
    total_fee = gas_used * (base_fee + priority_fee)
    burned    = gas_used * base_fee      # burned ETH
    miner_tip = gas_used * priority_fee  # to validator
    return total_fee, burned, miner_tip`,
  codeSteps: [
    { stepNumber: 2, highlightLines: [2] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 16, highlightLines: [16] },
    { stepNumber: 18, highlightLines: [18] },
  ],
  defaultInput: ["PUSH1","PUSH1","ADD","SSTORE"],
  generateSteps(ops) {
    const gasCosts: Record<string,number> = {PUSH1:3,ADD:3,MUL:5,SLOAD:2100,SSTORE:20000,CALL:2600,POP:2};
    let total = 21000;
    const steps: AnimationStep[] = [];
    steps.push(arr(1,"Base transaction cost: 21000 gas",[10,11],
      [{val:"base=21000",state:"active"}],"Base gas",{base:21000}));
    ops.forEach((op,i) => {
      const cost = gasCosts[op] ?? 3;
      total += cost;
      steps.push(arr(i+2,`${op}: +${cost} gas → total=${total}`,[12,13],
        [{val:op,state:"active"},{val:`+${cost}`,state:"computed"},{val:`total=${total}`,state:"highlighted"}],
        `After ${op}`,{op,cost,total}));
    });
    const baseFee = 15, priorityFee = 2;
    const fee = total*(baseFee+priorityFee);
    steps.push(arr(ops.length+2,`Fee: ${total} gas × (${baseFee}+${priorityFee}) gwei = ${fee} gwei`,[16,17,18,19],
      [{val:`gas=${total}`,state:"computed"},{val:`fee=${fee} gwei`,state:"highlighted"},{val:`burned=${total*baseFee} gwei`,state:"active"}],
      "EIP-1559 fee",{gasUsed:total,fee,burned:total*baseFee}));
    return steps;
  }
};

export const blockchainModules = [
  blockchainStructureModule, merkleTreeBlockchainModule, hashChainModule,
  proofOfWorkModule, proofOfStakeModule, pbftModule,
  evmModule, gasCalculationModule,
];
