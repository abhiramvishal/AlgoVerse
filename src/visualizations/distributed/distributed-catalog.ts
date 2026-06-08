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
  category: "distributed", difficulty: "Advanced",
  timeComplexity: "O(log n) per entry", spaceComplexity: "O(n)",
  description: "Leader-based consensus algorithm: elect a leader, replicate log, commit on majority.",
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
    { line: 6, description: "All nodes start as followers" },
    { line: 11, description: "Election timeout → become candidate" },
    { line: 15, description: "Request votes from peers" },
    { line: 17, description: "Win majority → become leader" },
    { line: 21, description: "Leader replicates log to followers" },
    { line: 23, description: "Commit when majority acknowledges" },
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
  category: "distributed", difficulty: "Advanced",
  timeComplexity: "O(1) rounds (2 phases)", spaceComplexity: "O(n)",
  description: "Two-phase consensus: Prepare/Promise then Accept/Accepted.",
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
    { line: 5, description: "Proposer chooses unique proposal number n" },
    { line: 7, description: "Phase 1: send Prepare(n) to all acceptors" },
    { line: 8, description: "Acceptor promises not to accept n' < n" },
    { line: 12, description: "Use highest previously accepted value" },
    { line: 15, description: "Phase 2: send Accept(n, v) to acceptors" },
    { line: 18, description: "Commit if majority accepts" },
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
  category: "distributed", difficulty: "Advanced",
  timeComplexity: "O(n²)", spaceComplexity: "O(n)",
  description: "Tolerates up to f Byzantine faults with n ≥ 3f+1 nodes (PBFT algorithm).",
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
    { line: 5, description: "Primary broadcasts PRE-PREPARE with request digest" },
    { line: 9, description: "Backups broadcast PREPARE to all replicas" },
    { line: 11, description: "Wait for 2f PREPARE messages → prepared" },
    { line: 14, description: "Broadcast COMMIT to all" },
    { line: 16, description: "Execute after 2f+1 COMMIT messages" },
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
  category: "distributed", difficulty: "Intermediate",
  timeComplexity: "O(n)", spaceComplexity: "O(n)",
  description: "Coordinator ensures all-or-nothing commit across distributed participants.",
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
    { line: 3, description: "Phase 1: coordinator asks each participant to prepare" },
    { line: 5, description: "Participant locks resources and votes YES/NO" },
    { line: 8, description: "All YES → decide COMMIT" },
    { line: 10, description: "Phase 2: send COMMIT to all" },
    { line: 14, description: "Any NO → decide ABORT" },
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
  category: "distributed", difficulty: "Intermediate",
  timeComplexity: "O(1) write, O(1) read", spaceComplexity: "O(n)",
  description: "Single leader handles writes; followers replicate and serve reads.",
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
    { line: 2, description: "All writes go to leader" },
    { line: 5, description: "Leader replicates to all followers" },
    { line: 10, description: "Strong reads from leader (no stale data)" },
    { line: 13, description: "Eventual reads from any follower (may be stale)" },
    { line: 17, description: "Failover: follower with latest log becomes leader" },
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
  category: "distributed", difficulty: "Advanced",
  timeComplexity: "O(1) write", spaceComplexity: "O(n)",
  description: "Multiple nodes accept writes; conflicts resolved via LWW or CRDTs.",
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
    { line: 5, description: "Each write stamped with timestamp" },
    { line: 8, description: "Async replication to other leader nodes" },
    { line: 12, description: "Conflict: Last-Write-Wins resolution" },
    { line: 16, description: "Alternative: CRDTs guarantee convergence" },
    { line: 18, description: "G-Counter: merge by taking max" },
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
  category: "distributed", difficulty: "Intermediate",
  timeComplexity: "O(1)", spaceComplexity: "O(n)",
  description: "Ensure overlap between read and write sets: R + W > N guarantees consistency.",
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
    { line: 4, description: "R=3, W=3, N=5 → R+W=6 > N=5 ✓" },
    { line: 7, description: "Write to W replicas with version number" },
    { line: 12, description: "Read from R replicas" },
    { line: 14, description: "Return response with highest version" },
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
  category: "distributed", difficulty: "Beginner",
  timeComplexity: "O(1)", spaceComplexity: "O(n)",
  description: "Distributes requests cyclically across servers regardless of load.",
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
    { line: 3, description: "List of backend servers" },
    { line: 6, description: "Pick current server" },
    { line: 7, description: "Advance index cyclically" },
    { line: 11, description: "Route request to selected server" },
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
  category: "distributed", difficulty: "Intermediate",
  timeComplexity: "O(log n)", spaceComplexity: "O(n)",
  description: "Map nodes and keys to a ring; adding/removing nodes remaps only ~k/n keys.",
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
    { line: 5, description: "Hash ring: position → node mapping" },
    { line: 8, description: "Add node with virtual replicas (100 positions)" },
    { line: 14, description: "Remove node: only remaps ~k/n keys" },
    { line: 18, description: "Route key: walk clockwise to next node" },
    { line: 21, description: "Wrap around: ring is circular" },
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
  category: "distributed", difficulty: "Beginner",
  timeComplexity: "O(n)", spaceComplexity: "O(n)",
  description: "Routes each request to the server with the fewest active connections.",
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
    { line: 5, description: "Min-heap ordered by active connection count" },
    { line: 8, description: "Pop server with fewest connections" },
    { line: 9, description: "Increment count and push back" },
    { line: 12, description: "On completion: decrement and re-heapify" },
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
  category: "distributed", difficulty: "Intermediate",
  timeComplexity: "O(W) per cycle", spaceComplexity: "O(n·W)",
  description: "Routes more requests to higher-capacity servers based on assigned weights.",
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
    { line: 3, description: "Expand pool: each server repeated weight times" },
    { line: 10, description: "Pick from expanded pool cyclically" },
    { line: 14, description: "S0 w=3 gets 50% traffic, S2 w=2 gets 33%" },
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
  category: "distributed", difficulty: "Intermediate",
  timeComplexity: "O(n/p + k log k)", spaceComplexity: "O(n/p)",
  description: "Parallel computation: Map emits (key,val) pairs; Reduce aggregates by key.",
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
    { line: 3, description: "Mapper: emit (key, value) pairs from each chunk" },
    { line: 8, description: "Reducer: aggregate all values for a key" },
    { line: 12, description: "Framework splits input and distributes to mappers" },
    { line: 14, description: "Shuffle: sort and group by key" },
    { line: 16, description: "Reducer processes each key's values" },
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
  category: "distributed", difficulty: "Advanced",
  timeComplexity: "O(n)", spaceComplexity: "O(n)",
  description: "Manage distributed transactions via a sequence of local transactions with compensating rollbacks.",
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
    { line: 2, description: "Each step has a forward and compensating action" },
    { line: 9, description: "Execute steps sequentially, track completed" },
    { line: 12, description: "On failure: run compensating transactions in reverse" },
    { line: 18, description: "Each service has its own local transaction" },
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
  category: "distributed", difficulty: "Intermediate",
  timeComplexity: "O(n) replay", spaceComplexity: "O(n)",
  description: "Store all state changes as immutable events; current state = replay of all events.",
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
    { line: 12, description: "Append-only event log (never mutate)" },
    { line: 15, description: "Replay: fold events to compute current state" },
    { line: 17, description: "Apply each event to state (reduce)" },
    { line: 22, description: "Events are immutable facts about what happened" },
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
  category: "distributed", difficulty: "Intermediate",
  timeComplexity: "O(1) write, O(1) read", spaceComplexity: "O(n)",
  description: "Command Query Responsibility Segregation: separate write model from read model.",
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
    { line: 3, description: "CommandHandler: processes writes → emits events" },
    { line: 9, description: "QueryHandler: optimized read model (separate DB)" },
    { line: 13, description: "Projector: updates read model from event stream" },
  ],
  defaultInput: "Order Service",
  generateSteps(service) {
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`${service}: separate write and read paths`,[3,9],[{val:"Write Model",state:"active"},{val:"Read Model",state:"computed"}],"CQRS",{service}));
    steps.push(arr(2,"Command: CreateOrder → CommandHandler",[3,4],[{val:"CreateOrder",state:"active"},{val:"→ Handler",state:"computed"}],"Command side",{cmd:"CreateOrder"}));
    steps.push(arr(3,"Event emitted: OrderCreated → Event Bus",[5,6],[{val:"OrderCreated",state:"highlighted"},{val:"→ EventBus",state:"computed"}],"Event emitted",{}));
    steps.push(arr(4,"Projector updates read DB (denormalized)",[13,14,15],[{val:"orders_view",state:"computed"},{val:"updated",state:"highlighted"}],"Read model",{denormalized:true}));
    steps.push(arr(5,"Query: GetOrder → QueryHandler (fast read)",[9,10],[{val:"GetOrder",state:"active"},{val:"orders_view",state:"highlighted"}],"Query side",{latency:"<1ms",optimized:true}));
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
