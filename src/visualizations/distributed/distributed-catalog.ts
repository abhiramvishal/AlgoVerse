import type { VisualizationModule, AnimationStep } from "@/types/visualization";

function arr(stepNumber: number, description: string, lines: number[], cells: {val: string|number, state: string}[], label: string, vars: Record<string,unknown>): AnimationStep {
  return { stepNumber, description, highlightLines: lines, visualState: { type: "array1d", cells, label }, variables: vars };
}
function flow(stepNumber: number, description: string, lines: number[], lanes: string[], steps_: {from:string,to:string,label:string,color?:string}[], activeStep: number, vars: Record<string,unknown>): AnimationStep {
  return { stepNumber, description, highlightLines: lines, visualState: { type: "flowdiagram", lanes, steps: steps_, activeStep, completedSteps: Array.from({length:activeStep},(_,i)=>i) }, variables: vars };
}

// ─── Raft Consensus ───────────────────────────────────────────────────────────
export const raftModule: VisualizationModule<number> = {
  id: "raft", slug: "raft", title: "Raft Consensus",
  category: ["distributed"], difficulty: "advanced",
  timeComplexity: "O(log n) per entry", spaceComplexity: "O(n)",
  description: "Leader-based consensus algorithm: elect a leader, replicate log, commit on majority.",
  relatedTopics: [],
  pythonCode: `# Raft roles: Leader, Follower, Candidate

class RaftNode:
    def __init__(self, id, peers):
        self.id = id; self.peers = peers
        self.role = "follower"
        self.current_term = 0
        self.voted_for = None
        self.log = []             # [(term, command)]
        self.commit_index = 0

    def start_election(self):
        self.current_term += 1
        self.role = "candidate"
        self.voted_for = self.id
        votes = 1
        for peer in self.peers:
            granted = peer.request_vote(self.current_term, self.id, ...)
            if granted: votes += 1
        if votes > len(self.peers) // 2:
            self.role = "leader"
            self.send_heartbeats()

    def append_entry(self, command):
        # Leader appends to log and replicates
        self.log.append((self.current_term, command))
        acks = sum(peer.append_entries(self.log) for peer in self.peers)
        if acks >= len(self.peers) // 2:
            self.commit_index = len(self.log) - 1`,
  codeSteps: [
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 15, highlightLines: [15] },
    { stepNumber: 17, highlightLines: [17] },
    { stepNumber: 21, highlightLines: [21] },
    { stepNumber: 23, highlightLines: [23] },
  ],
  defaultInput: 5,
  generateSteps(nodes) {
    const states = (leader: number) =>
      Array.from({length:nodes},(_,i)=>({val:`N${i}`,state:i===leader?"highlighted":i===0?"active":"default" as string}));
    const steps: AnimationStep[] = [];
    steps.push(arr(1,"All nodes start as followers",[6],states(-1),"Followers",{term:0}));
    steps.push(arr(2,"N0 times out → starts election (term=1)",[11,12,13,14],states(-1).map((n,i)=>({val:n.val,state:i===0?"active":"default" as string})),"Election",{term:1,candidate:"N0"}));
    steps.push(arr(3,"N0 requests votes from N1, N2, N3, N4",[15,16],states(-1),"RequestVote",{votes:1}));
    steps.push(arr(4,"N0 wins majority (3/5) → becomes leader",[17,18,19],states(0),"Leader elected",{leader:"N0",term:1,votes:3}));
    steps.push(arr(5,"Leader appends entry and replicates to followers",[21,22,23,24],states(0),"Log replication",{committed:true}));
    return steps;
  }
};

// ─── Paxos ────────────────────────────────────────────────────────────────────
export const paxosModule: VisualizationModule<number> = {
  id: "paxos", slug: "paxos", title: "Paxos Consensus",
  category: ["distributed"], difficulty: "advanced",
  timeComplexity: "O(1) rounds (2 phases)", spaceComplexity: "O(n)",
  description: "Two-phase consensus: Prepare/Promise then Accept/Accepted.",
  relatedTopics: [],
  pythonCode: `# Paxos: Proposer, Acceptors, Learners

class Proposer:
    def propose(self, value, quorum):
        n = self.next_proposal_number()
        # Phase 1: Prepare
        promises = []
        for acc in quorum:
            p = acc.prepare(n)
            if p: promises.append(p)
        if len(promises) < majority(quorum):
            return False  # retry
        # Use highest-numbered value from promises
        v = max((p.value for p in promises if p.value),
                default=value, key=lambda x: x.n)
        # Phase 2: Accept
        accepts = []
        for acc in quorum:
            a = acc.accept(n, v)
            if a: accepts.append(a)
        if len(accepts) >= majority(quorum):
            self.learn(v)
            return v`,
  codeSteps: [
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 15, highlightLines: [15] },
    { stepNumber: 18, highlightLines: [18] },
  ],
  defaultInput: 3,
  generateSteps(quorum) {
    const accs = Array.from({length:quorum},(_,i)=>({val:`A${i}`,state:"default" as string}));
    const steps: AnimationStep[] = [];
    steps.push(arr(1,"Proposer chooses n=1",[5],[{val:"P",state:"active"},...accs],"Proposer+Acceptors",{n:1}));
    steps.push(arr(2,"Phase 1: Prepare(n=1) → all acceptors",[7,8],[{val:"P→Prepare(1)",state:"active"},...accs.map(a=>({...a,state:"computed" as string}))],"Prepare",{phase:1}));
    steps.push(arr(3,"Acceptors reply Promise(1, null)",[8,9],[...accs.map(a=>({...a,state:"highlighted" as string})),{val:"promises=3",state:"active"}],"Promises",{majority:true}));
    steps.push(arr(4,"Phase 2: Accept(n=1, v=42) → acceptors",[15,16],[{val:"Accept(1,42)",state:"active"},...accs.map(a=>({...a,state:"computed" as string}))],"Accept",{phase:2,v:42}));
    steps.push(arr(5,"Majority accepts → value 42 committed!",[18,19,20],[...accs.map(a=>({...a,state:"highlighted" as string})),{val:"✓ v=42",state:"highlighted"}],"Committed",{value:42}));
    return steps;
  }
};

// ─── Byzantine Fault Tolerance ────────────────────────────────────────────────
export const byzantineFtModule: VisualizationModule<number> = {
  id: "byzantine-ft", slug: "byzantine-ft", title: "Byzantine Fault Tolerance",
  category: ["distributed"], difficulty: "advanced",
  timeComplexity: "O(n²)", spaceComplexity: "O(n)",
  description: "Tolerates up to f Byzantine faults with n ≥ 3f+1 nodes (PBFT algorithm).",
  relatedTopics: [],
  pythonCode: `# PBFT: Practical Byzantine Fault Tolerance
# Tolerates f faults with n >= 3f+1 replicas

class PBFTReplica:
    def pre_prepare(self, request, primary):
        # Primary broadcasts pre-prepare
        msg = (VIEW, SEQ, digest(request))
        broadcast(PRE_PREPARE, msg)

    def prepare(self, pre_prepare_msg):
        # Backups send prepare to all
        broadcast(PREPARE, pre_prepare_msg)
        # Wait for 2f prepare messages
        if count_prepares >= 2*f:
            self.prepared = True

    def commit(self):
        broadcast(COMMIT)
        # Wait for 2f+1 commit messages
        if count_commits >= 2*f + 1:
            self.execute_request()

# 3 phases: PRE-PREPARE → PREPARE → COMMIT
# f = (n-1)//3  max Byzantine faults`,
  codeSteps: [
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 14, highlightLines: [14] },
    { stepNumber: 16, highlightLines: [16] },
  ],
  defaultInput: 4,
  generateSteps(n) {
    const f = Math.floor((n-1)/3);
    const nodes = Array.from({length:n},(_,i)=>({val:i===n-1?"BYZ":"N"+i,state:i===n-1?"active":"default" as string}));
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`n=${n} replicas, f=${f} Byzantine tolerated (n≥3f+1)`,[1,2],nodes,"Replicas",{n,f,maxFaults:f}));
    steps.push(arr(2,"Primary→all: PRE-PREPARE(v, seq, digest)",[5,6,7],nodes.map((nd,i)=>({...nd,state:i===0?"highlighted":i===n-1?"active":"computed" as string})),"Pre-prepare",{phase:1}));
    steps.push(arr(3,"Honest nodes broadcast PREPARE",[9,10],nodes.map((nd,i)=>({...nd,state:i===n-1?"active":"computed" as string})),"Prepare phase",{phase:2,need:`2f=${2*f}`}));
    steps.push(arr(4,`Collected 2f PREPARE msgs → prepared`,[11,12],nodes.map((nd,i)=>({...nd,state:i===n-1?"active":"highlighted" as string})),"Prepared",{count:2*f}));
    steps.push(arr(5,`2f+1 COMMIT msgs → execute (Byzantine node ignored)`,[16],nodes.map((nd,i)=>({...nd,state:i===n-1?"active":"highlighted" as string})),"Committed",{executed:true,byzantine:"N"+(n-1)+" ignored"}));
    return steps;
  }
};

// ─── Two-Phase Commit ─────────────────────────────────────────────────────────
export const twoPhaseCommitModule: VisualizationModule<number> = {
  id: "two-phase-commit", slug: "two-phase-commit", title: "Two-Phase Commit",
  category: ["distributed"], difficulty: "intermediate",
  timeComplexity: "O(n)", spaceComplexity: "O(n)",
  description: "Coordinator ensures all-or-nothing commit across distributed participants.",
  relatedTopics: [],
  pythonCode: `class Coordinator:
    def two_phase_commit(self, transaction, participants):
        # Phase 1: Prepare
        votes = []
        for p in participants:
            vote = p.prepare(transaction)   # can_commit?
            votes.append(vote)
        # Global decision
        if all(v == 'YES' for v in votes):
            # Phase 2: Commit
            for p in participants:
                p.commit()
            return 'COMMITTED'
        else:
            # Phase 2: Abort
            for p in participants:
                p.abort()
            return 'ABORTED'`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 14, highlightLines: [14] },
  ],
  defaultInput: 3,
  generateSteps(participants) {
    const parts = Array.from({length:participants},(_,i)=>({val:`P${i}`,state:"default" as string}));
    const steps: AnimationStep[] = [];
    steps.push(arr(1,"Coordinator starts transaction",[1],[{val:"COORD",state:"active"},...parts],"Coordinator+Participants",{}));
    steps.push(arr(2,"Phase 1: send PREPARE to all participants",[3,4,5],parts.map(p=>({...p,state:"computed" as string})),"PREPARE sent",{phase:1}));
    steps.push(arr(3,"All participants vote YES (resources locked)",[6,7,8],parts.map(p=>({...p,state:"highlighted" as string})),"All YES",{decision:"COMMIT"}));
    steps.push(arr(4,"Phase 2: send COMMIT to all",[9,10,11],parts.map(p=>({...p,state:"active" as string})),"COMMIT sent",{phase:2}));
    steps.push(arr(5,"All commit → transaction complete",[11],parts.map(p=>({...p,state:"highlighted" as string})),"COMMITTED",{atomicity:true}));
    return steps;
  }
};

// ─── Leader-Follower Replication ─────────────────────────────────────────────
export const leaderFollowerModule: VisualizationModule<number> = {
  id: "leader-follower", slug: "leader-follower", title: "Leader-Follower Replication",
  category: ["distributed"], difficulty: "intermediate",
  timeComplexity: "O(1) write, O(1) read", spaceComplexity: "O(n)",
  description: "Single leader handles writes; followers replicate and serve reads.",
  relatedTopics: [],
  pythonCode: `class LeaderFollower:
    def write(self, key, value):
        # Only leader handles writes
        self.log.append((key, value))
        # Replicate to followers
        for follower in self.followers:
            follower.replicate(key, value)
        # Acknowledge client
        return 'OK'

    def read(self, key, consistency='eventual'):
        if consistency == 'strong':
            return self.data[key]     # read from leader
        else:
            follower = random.choice(self.followers)
            return follower.data[key] # may be stale

    def failover(self):
        # Promote follower with most recent log
        new_leader = max(self.followers, key=lambda f: f.log_index)
        new_leader.become_leader()`,
  codeSteps: [
    { stepNumber: 2, highlightLines: [2] },
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 13, highlightLines: [13] },
    { stepNumber: 17, highlightLines: [17] },
  ],
  defaultInput: 3,
  generateSteps(followers) {
    const nodes = [{val:"Leader",state:"highlighted" as string},...Array.from({length:followers},(_,i)=>({val:`F${i}`,state:"default" as string}))];
    const steps: AnimationStep[] = [];
    steps.push(arr(1,"Cluster: 1 leader + "+followers+" followers",[1],nodes,"Topology",{writes:"leader only"}));
    steps.push(arr(2,"Client writes key=42 to leader",[2,3,4],[{val:"write(42)",state:"active"},...nodes.slice(1)],"Write",{key:"x",val:42}));
    steps.push(arr(3,"Leader replicates to followers asynchronously",[5,6,7],nodes.map(n=>({...n,state:"computed" as string})),"Replication",{lag:"<1ms"}));
    steps.push(arr(4,"Client reads from follower F1 (eventual)",[13,14],[{val:"F1.read(x)",state:"active"},{val:"42",state:"highlighted"}],"Read (eventual)",{stale:false}));
    steps.push(arr(5,"Leader fails → F0 promoted (most recent log)",[17,18,19],[{val:"F0→Leader",state:"highlighted"},...nodes.slice(2)],"Failover",{rpo:"~0"}));
    return steps;
  }
};

// ─── Multi-Leader Replication ─────────────────────────────────────────────────
export const multiLeaderModule: VisualizationModule<number> = {
  id: "multi-leader", slug: "multi-leader", title: "Multi-Leader Replication",
  category: ["distributed"], difficulty: "advanced",
  timeComplexity: "O(1) write", spaceComplexity: "O(n)",
  description: "Multiple nodes accept writes; conflicts resolved via LWW or CRDTs.",
  relatedTopics: [],
  pythonCode: `# Multi-leader replication with Last-Write-Wins conflict resolution
import time

class MultiLeader:
    def write(self, key, value, leader_id):
        ts = time.time()
        self.local_log.append((ts, key, value, leader_id))
        # Async replication to other leaders
        for peer_leader in self.peers:
            peer_leader.receive_remote_write(ts, key, value, leader_id)

    def receive_remote_write(self, ts, key, value, origin):
        existing = self.data.get(key, {})
        # Last-Write-Wins: higher timestamp wins
        if ts > existing.get('ts', 0):
            self.data[key] = {'value': value, 'ts': ts}

    # Alternative: CRDT (Conflict-free Replicated Data Type)
    def crdt_merge(self, remote_state):
        # G-Counter: take max of each counter
        for node, cnt in remote_state.items():
            self.counters[node] = max(self.counters[node], cnt)`,
  codeSteps: [
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 16, highlightLines: [16] },
    { stepNumber: 18, highlightLines: [18] },
  ],
  defaultInput: 2,
  generateSteps(leaders) {
    const nodes = Array.from({length:leaders},(_,i)=>({val:`L${i}`,state:"highlighted" as string}));
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`${leaders} leaders each accept writes`,[5],nodes,"Multi-Leader",{leaders}));
    steps.push(arr(2,"L0 writes x=10 (t=100), L1 writes x=20 (t=101)",[5,6,7],nodes.map((n,i)=>({...n,state:i===0?"active":"computed" as string})),"Concurrent writes",{L0:"x=10",L1:"x=20"}));
    steps.push(arr(3,"Async replication: L0 and L1 exchange writes",[8,9],nodes.map(n=>({...n,state:"computed" as string})),"Replication",{async:true}));
    steps.push(arr(4,"Conflict detected: both wrote x",[11,12],nodes.map(n=>({...n,state:"active" as string})),"Conflict!",{lww:true}));
    steps.push(arr(5,"LWW: t=101 > t=100 → x=20 wins",[13,14],nodes.map(n=>({...n,state:"highlighted" as string})),"Resolved",{x:20,method:"LWW"}));
    return steps;
  }
};

// ─── Quorum ───────────────────────────────────────────────────────────────────
export const quorumModule: VisualizationModule<{n:number,r:number,w:number}> = {
  id: "quorum", slug: "quorum", title: "Quorum (R+W > N)",
  category: ["distributed"], difficulty: "intermediate",
  timeComplexity: "O(1)", spaceComplexity: "O(n)",
  description: "Ensure overlap between read and write sets: R + W > N guarantees consistency.",
  relatedTopics: [],
  pythonCode: `# Quorum-based replication
# N = total replicas, W = write quorum, R = read quorum

class QuorumSystem:
    N, W, R = 5, 3, 3  # R + W > N ensures overlap

    def write(self, key, value):
        version = self.next_version()
        # Write to W replicas
        acks = [r.write(key, value, version)
                for r in random.sample(self.replicas, self.W)]
        return all(acks)

    def read(self, key):
        # Read from R replicas
        responses = [r.read(key)
                     for r in random.sample(self.replicas, self.R)]
        # Return version with highest version number
        return max(responses, key=lambda x: x.version)`,
  codeSteps: [
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 14, highlightLines: [14] },
  ],
  defaultInput: {n:5, r:3, w:3},
  generateSteps({n, r, w}) {
    const reps = Array.from({length:n},(_,i)=>({val:`R${i}`,state:"default" as string}));
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`N=${n}, W=${w}, R=${r}, R+W=${r+w} > N=${n} ✓`,[4],reps,"N replicas",{overlap:r+w-n}));
    const wSet = reps.map((r,i)=>({...r,state:i<w?"active":"default" as string}));
    steps.push(arr(2,`Write to W=${w} replicas (quorum)`,[7,8,9,10],wSet,"Write quorum",{W:w}));
    const rSet = reps.map((r,i)=>({...r,state:i>=n-3?"highlighted":"default" as string}));
    steps.push(arr(3,`Read from R=${r} replicas (overlap with write set)`,[12,13,14],rSet,"Read quorum",{R:r,overlap:r+w-n}));
    steps.push(arr(4,"At least 1 replica in both sets → consistency",[15],reps.map((r,i)=>({...r,state:i===n-3?"highlighted":"default" as string})),"Overlap node",{overlap:r+w-n+" node(s)"}));
    steps.push(arr(5,"Return highest-version response from read set",[15],reps,"Latest value",{consistency:"guaranteed"}));
    return steps;
  }
};

// ─── Round Robin LB ───────────────────────────────────────────────────────────
export const roundRobinLbModule: VisualizationModule<number> = {
  id: "round-robin-lb", slug: "round-robin-lb", title: "Round Robin Load Balancing",
  category: ["distributed"], difficulty: "beginner",
  timeComplexity: "O(1)", spaceComplexity: "O(n)",
  description: "Distributes requests cyclically across servers regardless of load.",
  relatedTopics: [],
  pythonCode: `class RoundRobinLB:
    def __init__(self, servers):
        self.servers = servers
        self.index = 0

    def next_server(self):
        server = self.servers[self.index]
        self.index = (self.index + 1) % len(self.servers)
        return server

    def handle_request(self, request):
        server = self.next_server()
        return server.process(request)

servers = ['S0', 'S1', 'S2']
lb = RoundRobinLB(servers)
# Requests: R0→S0, R1→S1, R2→S2, R3→S0, ...`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 11, highlightLines: [11] },
  ],
  defaultInput: 3,
  generateSteps(servers) {
    const srv = Array.from({length:servers},(_,i)=>({val:`S${i}`,state:"default" as string}));
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`${servers} servers, index=0`,[1,2,3],srv,"Servers",{index:0}));
    for (let req = 0; req < servers+1; req++) {
      const idx = req%servers;
      steps.push(arr(req+2,`Request R${req} → S${idx} (index=${idx})`,[6,7],srv.map((s,i)=>({...s,state:i===idx?"highlighted":"default" as string})),`R${req} → S${idx}`,{index:idx}));
    }
    return steps;
  }
};

// ─── Consistent Hashing ───────────────────────────────────────────────────────
export const consistentHashingModule: VisualizationModule<number> = {
  id: "consistent-hashing", slug: "consistent-hashing", title: "Consistent Hashing",
  category: ["distributed"], difficulty: "intermediate",
  timeComplexity: "O(log n)", spaceComplexity: "O(n)",
  description: "Map nodes and keys to a ring; adding/removing nodes remaps only ~k/n keys.",
  relatedTopics: [],
  pythonCode: `import hashlib, bisect

class ConsistentHash:
    def __init__(self, replicas=100):
        self.replicas = replicas
        self.ring = {}          # hash_position → node
        self.sorted_keys = []

    def add_node(self, node):
        for i in range(self.replicas):
            h = self.hash(f"{node}-{i}")
            self.ring[h] = node
            bisect.insort(self.sorted_keys, h)

    def remove_node(self, node):
        for i in range(self.replicas):
            h = self.hash(f"{node}-{i}")
            del self.ring[h]
            self.sorted_keys.remove(h)

    def get_node(self, key):
        h = self.hash(key)
        idx = bisect.bisect_right(self.sorted_keys, h)
        idx = idx % len(self.sorted_keys)  # wrap around
        return self.ring[self.sorted_keys[idx]]

    def hash(self, key):
        return int(hashlib.md5(key.encode()).hexdigest(), 16) % (2**32)`,
  codeSteps: [
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 14, highlightLines: [14] },
    { stepNumber: 18, highlightLines: [18] },
    { stepNumber: 21, highlightLines: [21] },
  ],
  defaultInput: 3,
  generateSteps(nodeCount) {
    const positions = Array.from({length:8},(_,i)=>({val:`${i*360/8}°`,state:"default" as string}));
    const steps: AnimationStep[] = [];
    steps.push(arr(1,"Empty hash ring (0-360°)",[5,6],positions,"Hash ring",{ring:"circular"}));
    const nodes = Array.from({length:nodeCount},(_,i)=>`N${i}`);
    nodes.forEach((n,ni) => {
      const pos = Math.floor(360*ni/nodeCount);
      steps.push(arr(ni+2,`Add ${n}: hashes to ~${pos}° (+ virtual nodes)`,[8,9,10,11],positions.map((p,i)=>({...p,state:i===Math.floor(8*ni/nodeCount)?"highlighted":"default" as string})),`After adding ${n}`,{node:n}));
    });
    steps.push(arr(nodeCount+2,"Key 'foo' hashes to 145° → routed to N1",[18,19,20,21],positions.map((p,i)=>({...p,state:i===3?"active":"default" as string})),"Key routing",{key:"foo",node:"N1"}));
    steps.push(arr(nodeCount+3,"Add N3: only 1/4 of N1's keys remapped",[8],positions.map(p=>({...p,state:"computed" as string})),"After N3 added",{remapped:"~25% of N1"}));
    return steps;
  }
};

// ─── Least Connections LB ─────────────────────────────────────────────────────
export const leastConnectionsModule: VisualizationModule<number> = {
  id: "least-connections", slug: "least-connections", title: "Least Connections LB",
  category: ["distributed"], difficulty: "beginner",
  timeComplexity: "O(n)", spaceComplexity: "O(n)",
  description: "Routes each request to the server with the fewest active connections.",
  relatedTopics: [],
  pythonCode: `import heapq

class LeastConnectionsLB:
    def __init__(self, servers):
        # Min-heap: (connections, server_id)
        self.heap = [(0, s) for s in servers]
        heapq.heapify(self.heap)

    def get_server(self):
        conns, server = heapq.heappop(self.heap)
        heapq.heappush(self.heap, (conns + 1, server))
        return server

    def release(self, server):
        # When request completes, decrement connection count
        for i, (c, s) in enumerate(self.heap):
            if s == server:
                self.heap[i] = (c - 1, s)
                heapq.heapify(self.heap)
                break`,
  codeSteps: [
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 12, highlightLines: [12] },
  ],
  defaultInput: 3,
  generateSteps(servers) {
    let conns = Array(servers).fill(0);
    const cells = () => conns.map((c,i)=>({val:`S${i}(${c})`,state:"default" as string}));
    const steps: AnimationStep[] = [];
    steps.push(arr(1,"All servers: 0 active connections",[5,6],cells(),"Connections",{}));
    const requests = [0,1,0,2,1];
    requests.forEach((s,r) => {
      conns[s]++;
      steps.push(arr(r+2,`R${r}: route to S${s} (fewest connections)`,[8,9],cells().map((c,i)=>({...c,state:i===s?"highlighted":"default" as string})),`After R${r}`,{routed:`S${s}`}));
    });
    conns[0]--;
    steps.push(arr(requests.length+2,"S0 completes request: decrement",[12,13,14,15,16],cells(),"After release",{}));
    return steps;
  }
};

// ─── Weighted Round Robin ─────────────────────────────────────────────────────
export const weightedRoundRobinModule: VisualizationModule<number[]> = {
  id: "weighted-round-robin", slug: "weighted-round-robin", title: "Weighted Round Robin",
  category: ["distributed"], difficulty: "intermediate",
  timeComplexity: "O(W) per cycle", spaceComplexity: "O(n·W)",
  description: "Routes more requests to higher-capacity servers based on assigned weights.",
  relatedTopics: [],
  pythonCode: `def weighted_round_robin(servers, weights):
    # Expand: each server repeated by weight
    pool = []
    for server, weight in zip(servers, weights):
        pool.extend([server] * weight)
    # Shuffle for smooth distribution (optional)
    index = 0

    def next_server():
        nonlocal index
        server = pool[index]
        index = (index + 1) % len(pool)
        return server

    return next_server

# Example: S0 weight=3, S1 weight=1, S2 weight=2
# Pool: [S0,S0,S0, S1, S2,S2]`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 14, highlightLines: [14] },
  ],
  defaultInput: [3,1,2],
  generateSteps(weights) {
    const total = weights.reduce((a,b)=>a+b,0);
    const pool = weights.flatMap((w,i)=>Array(w).fill(`S${i}`));
    const cells = pool.map(s=>({val:s,state:"default" as string}));
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`Weights: ${weights.join(",")} → pool size=${total}`,[3,4,5],cells,"Expanded pool",{weights,total}));
    for (let r = 0; r < Math.min(6,total); r++) {
      steps.push(arr(r+2,`Request R${r} → ${pool[r]}`,[10,11,12],cells.map((c,i)=>({...c,state:i===r?"highlighted":"default" as string})),`R${r} → ${pool[r]}`,{idx:r}));
    }
    return steps;
  }
};

// ─── MapReduce ────────────────────────────────────────────────────────────────
export const mapreduceModule: VisualizationModule<string[]> = {
  id: "mapreduce", slug: "mapreduce", title: "MapReduce",
  category: ["distributed"], difficulty: "intermediate",
  timeComplexity: "O(n/p + k log k)", spaceComplexity: "O(n/p)",
  description: "Parallel computation: Map emits (key,val) pairs; Reduce aggregates by key.",
  relatedTopics: [],
  pythonCode: `# Word count with MapReduce

def mapper(document):
    """Emit (word, 1) for each word"""
    for word in document.split():
        yield (word.lower(), 1)

def reducer(key, values):
    """Sum all counts for a word"""
    return (key, sum(values))

# Framework orchestration:
# 1. Split input into chunks → distribute to mappers
# 2. Each mapper calls map(chunk)
# 3. Shuffle: group (k,v) pairs by key → reducers
# 4. Each reducer calls reduce(key, [v1,v2,...])
# 5. Collect results

def word_count(documents):
    mapped = [pair for doc in documents for pair in mapper(doc)]
    grouped = {}
    for k, v in mapped:
        grouped.setdefault(k, []).append(v)
    return [reducer(k, vs) for k, vs in grouped.items()]`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 14, highlightLines: [14] },
    { stepNumber: 16, highlightLines: [16] },
  ],
  defaultInput: ["hello world","hello spark","world of maps"],
  generateSteps(docs) {
    const steps: AnimationStep[] = [];
    steps.push(arr(1,"Input: split documents across mappers",[12,13],docs.map(d=>({val:d.slice(0,8),state:"active" as string})),"Input chunks",{docs:docs.length}));
    const pairs: [string,number][] = docs.flatMap(d=>d.split(" ").map(w=>[w.toLowerCase(),1] as [string,number]));
    steps.push(arr(2,"Map phase: emit (word, 1) pairs",[3,4,5],pairs.slice(0,6).map(([k,v])=>({val:`(${k},${v})`,state:"computed" as string})),"Map output",{pairs:pairs.length}));
    const grouped: Record<string,number> = {};
    pairs.forEach(([k,v])=>{ grouped[k]=(grouped[k]||0)+v; });
    const keys = Object.keys(grouped);
    steps.push(arr(3,"Shuffle: group pairs by key",[14],keys.map(k=>({val:k,state:"active" as string})),"Grouped by key",{uniqueKeys:keys.length}));
    steps.push(arr(4,"Reduce phase: sum counts per word",[8,9],keys.map(k=>({val:`(${k},${grouped[k]})`,state:"highlighted" as string})),"Reduce output",{}));
    steps.push(arr(5,"Final word counts collected",[16],Object.entries(grouped).map(([k,v])=>({val:`${k}:${v}`,state:"highlighted" as string})),"Result",{words:Object.keys(grouped).length}));
    return steps;
  }
};

// ─── Saga Pattern ─────────────────────────────────────────────────────────────
export const sagaPatternModule: VisualizationModule<number> = {
  id: "saga-pattern", slug: "saga-pattern", title: "Saga Pattern",
  category: ["distributed"], difficulty: "advanced",
  timeComplexity: "O(n)", spaceComplexity: "O(n)",
  description: "Manage distributed transactions via a sequence of local transactions with compensating rollbacks.",
  relatedTopics: [],
  pythonCode: `class OrderSaga:
    steps = [
        ('reserve_inventory', 'cancel_inventory'),
        ('charge_payment',    'refund_payment'),
        ('schedule_delivery', 'cancel_delivery'),
    ]

    def execute(self, order):
        completed = []
        for action, compensate in self.steps:
            try:
                getattr(self, action)(order)
                completed.append(compensate)
            except Exception:
                # Rollback: execute compensating transactions
                for comp in reversed(completed):
                    getattr(self, comp)(order)
                raise

    def reserve_inventory(self, o): ...
    def cancel_inventory(self, o):  ...
    def charge_payment(self, o):    ...
    def refund_payment(self, o):    ...`,
  codeSteps: [
    { stepNumber: 2, highlightLines: [2] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 18, highlightLines: [18] },
  ],
  defaultInput: 3,
  generateSteps(steps) {
    const stepNames = ["ReserveInv","ChargePayment","ScheduleDelivery"].slice(0,steps);
    const compNames = ["CancelInv","RefundPayment","CancelDelivery"].slice(0,steps);
    const stepCells = stepNames.map(s=>({val:s,state:"default" as string}));
    const stepList: AnimationStep[] = [];
    stepList.push(arr(1,"Saga starts: execute local transactions in order",[9],stepCells,"Saga steps",{steps}));
    for (let i = 0; i < steps-1; i++) {
      stepList.push(arr(i+2,`Step ${i+1}: ${stepNames[i]} → SUCCESS`,[10,11,12],stepCells.map((s,j)=>({...s,state:j<=i?"highlighted":j===i+1?"active":"default" as string})),`Step ${i+1}`,{completed:stepNames.slice(0,i+1)}));
    }
    stepList.push(arr(steps+1,`Step ${steps}: ${stepNames[steps-1]} FAILS → rollback`,[14,15,16],stepCells.map(s=>({...s,state:"active" as string})),"Failure!",{failing:stepNames[steps-1]}));
    for (let i = steps-2; i >= 0; i--) {
      stepList.push(arr(steps+2+(steps-2-i),`Compensate: ${compNames[i]}`,[13,14,15],stepCells.map((s,j)=>({...s,state:j===i?"active":"default" as string})),`Compensating`,{action:compNames[i]}));
    }
    return stepList;
  }
};

// ─── Event Sourcing ───────────────────────────────────────────────────────────
export const eventSourcingModule: VisualizationModule<string[]> = {
  id: "event-sourcing", slug: "event-sourcing", title: "Event Sourcing",
  category: ["distributed"], difficulty: "intermediate",
  timeComplexity: "O(n) replay", spaceComplexity: "O(n)",
  description: "Store all state changes as immutable events; current state = replay of all events.",
  relatedTopics: [],
  pythonCode: `from dataclasses import dataclass, field
from typing import List
import time

@dataclass
class Event:
    type: str; data: dict; timestamp: float = field(default_factory=time.time)

class EventStore:
    def __init__(self):
        self.events: List[Event] = []

    def append(self, event: Event):
        self.events.append(event)   # immutable log

    def replay(self, aggregate_id, up_to=None):
        state = {}
        for event in self.events:
            if event.data.get('id') == aggregate_id:
                state = apply_event(state, event)  # fold
            if up_to and event.timestamp > up_to:
                break
        return state

# Example: account events
events = [
    Event('AccountOpened', {'id':1, 'balance':0}),
    Event('MoneyDeposited', {'id':1, 'amount':100}),
    Event('MoneyWithdrawn', {'id':1, 'amount':30}),
]`,
  codeSteps: [
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 15, highlightLines: [15] },
    { stepNumber: 17, highlightLines: [17] },
    { stepNumber: 22, highlightLines: [22] },
  ],
  defaultInput: ["AccountOpened:bal=0","Deposit:+100","Deposit:+50","Withdraw:-30"],
  generateSteps(events) {
    const cells = events.map(e=>({val:e.slice(0,14),state:"default" as string}));
    let bal = 0;
    const stepList: AnimationStep[] = [];
    stepList.push(arr(1,"Event log (append-only, immutable)",[12],cells,"Event Store",{events:events.length}));
    events.forEach((e,i) => {
      if (e.includes("Deposit")) { const amt=parseInt(e.split("+")[1]); bal+=amt; }
      else if (e.includes("Withdraw")) { const amt=parseInt(e.split("-")[1]); bal-=amt; }
      stepList.push(arr(i+2,`Replay event ${i+1}: ${e} → balance=${bal}`,[15,17],cells.map((c,j)=>({...c,state:j<=i?"highlighted":"default" as string})),`State at event ${i+1}`,{balance:bal}));
    });
    stepList.push(arr(events.length+2,"Time-travel: replay up to any past event",[19],cells.map(c=>({...c,state:"computed" as string})),"Time travel",{capability:"point-in-time"}));
    return stepList;
  }
};

// ─── CQRS ─────────────────────────────────────────────────────────────────────
export const cqrsModule: VisualizationModule<string> = {
  id: "cqrs", slug: "cqrs", title: "CQRS",
  category: ["distributed"], difficulty: "intermediate",
  timeComplexity: "O(1) write, O(1) read", spaceComplexity: "O(n)",
  description: "Command Query Responsibility Segregation: separate write model from read model.",
  relatedTopics: [],
  pythonCode: `# CQRS: separate command (write) and query (read) models

class CommandHandler:
    def handle(self, command):
        if isinstance(command, CreateOrder):
            order = Order(command.items)
            self.event_store.save(OrderCreated(order))
            self.event_bus.publish(OrderCreated(order))
        elif isinstance(command, UpdateOrder):
            self.event_store.save(OrderUpdated(command))

class QueryHandler:
    """Optimized read model (denormalized view)"""
    def get_order(self, order_id):
        return self.read_db.query('SELECT * FROM orders_view WHERE id=?', order_id)

class Projector:
    """Updates read model from events"""
    def on_event(self, event):
        if isinstance(event, OrderCreated):
            self.read_db.insert('orders_view', event.to_dict())
        elif isinstance(event, OrderUpdated):
            self.read_db.update('orders_view', event.to_dict())`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 13, highlightLines: [13] },
  ],
  defaultInput: "CreateOrder, UpdateOrder, GetOrder, GetOrder",
  generateSteps(commands) {
    const steps: AnimationStep[] = [];
    // Parse the custom command sequence. Read commands (Get/Query/Find/List)
    // go to the read model; everything else is a write command.
    const cmds = String(commands).split(/[,\n]/).map(c => c.trim()).filter(Boolean);
    const isRead = (c: string) => /^(get|query|find|list|read)/i.test(c);

    let writes = 0, reads = 0, events = 0;
    steps.push(arr(1, `CQRS: ${cmds.length} command(s) routed across separate write/read models.`,
      [3,9], [{val:"Write Model",state:"active"},{val:"Event Bus",state:"default"},{val:"Read Model",state:"computed"}],
      "CQRS pipeline", { commands: cmds }));

    cmds.forEach((cmd, i) => {
      if (isRead(cmd)) {
        reads++;
        steps.push(arr(2 + i, `Query: ${cmd} → QueryHandler reads the denormalized view.`,
          [13,14,15],
          [{val:"Write Model",state:"default"},{val:"Event Bus",state:"default"},{val:`${cmd}`,state:"highlighted"}],
          "Read path", { command: cmd, side: "query", reads }));
      } else {
        writes++; events++;
        steps.push(arr(2 + i, `Command: ${cmd} → CommandHandler saves + emits event ${cmd.replace(/^(Create|Update|Delete)/,"")}ed.`,
          [3,4,5,6],
          [{val:`${cmd}`,state:"active"},{val:"event emitted",state:"highlighted"},{val:"Read Model",state:"default"}],
          "Write path", { command: cmd, side: "command", writes, events }));
      }
    });

    steps.push(arr(2 + cmds.length, `Done: ${writes} write(s) emitted ${events} event(s); ${reads} read(s) served from the view.`,
      [9,10], [{val:`${writes} writes`,state:"active"},{val:`${events} events`,state:"highlighted"},{val:`${reads} reads`,state:"computed"}],
      "Summary", { writes, reads, events }));
    return steps;
  }
};

export const distributedModules = [
  raftModule, paxosModule, byzantineFtModule, twoPhaseCommitModule,
  leaderFollowerModule, multiLeaderModule, quorumModule,
  roundRobinLbModule, consistentHashingModule, leastConnectionsModule,
  weightedRoundRobinModule, mapreduceModule,
  sagaPatternModule, eventSourcingModule, cqrsModule,
];
