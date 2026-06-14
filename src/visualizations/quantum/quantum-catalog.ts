import type { VisualizationModule, AnimationStep } from "@/types/visualization";

function arr(stepNumber: number, description: string, lines: number[], cells: {val: string|number, state: string}[], label: string, vars: Record<string,unknown>): AnimationStep {
  return { stepNumber, description, highlightLines: lines, visualState: { type: "array1d", cells, label }, variables: vars };
}
function mat(stepNumber: number, description: string, lines: number[], matrix: (string|number)[][], rowLabels: string[], colLabels: string[], active: [number,number] | null, title: string, vars: Record<string,unknown>): AnimationStep {
  return { stepNumber, description, highlightLines: lines, visualState: { type: "matrix", matrix, rowLabels, colLabels, active, highlighted: active ? [active] : [], title }, variables: vars };
}

// ─── Hadamard Gate ────────────────────────────────────────────────────────────
export const hadamardGateModule: VisualizationModule<number> = {
  id: "hadamard-gate", slug: "hadamard-gate", title: "Hadamard Gate",
  category: ["quantum"], difficulty: "beginner",
  timeComplexity: "O(1)", spaceComplexity: "O(1)",
  description: "Creates equal superposition: H|0⟩ = (|0⟩+|1⟩)/√2, H|1⟩ = (|0⟩-|1⟩)/√2.",
  relatedTopics: [],
  pythonCode: `import numpy as np

# Hadamard gate matrix
H = np.array([[1, 1],
              [1,-1]]) / np.sqrt(2)

# Qubit states
ket_0 = np.array([1, 0])
ket_1 = np.array([0, 1])

# Apply Hadamard
plus  = H @ ket_0  # |+⟩ = (|0⟩+|1⟩)/√2
minus = H @ ket_1  # |-⟩ = (|0⟩-|1⟩)/√2

print(plus)   # [0.707, 0.707]
print(minus)  # [0.707,-0.707]

# Measurement probabilities
prob_0_given_plus = abs(plus[0])**2    # 0.5
prob_1_given_plus = abs(plus[1])**2    # 0.5`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 16, highlightLines: [16] },
  ],
  defaultInput: 0,
  generateSteps(initial) {
    const steps: AnimationStep[] = [];
    const s=1/Math.sqrt(2);
    steps.push(arr(1,`Input: |${initial}⟩`,[7,8],[{val:`|${initial}⟩`,state:"active"},{val:initial===0?"[1,0]":"[0,1]",state:"computed"}],"Initial qubit",{state:`|${initial}⟩`}));
    steps.push(mat(2,"Hadamard matrix H = [[1,1],[1,-1]]/√2",[3,4,5],[[`${s.toFixed(3)}`,`${s.toFixed(3)}`],[`${s.toFixed(3)}`,`${(-s).toFixed(3)}`]],["row 0","row 1"],["col 0","col 1"],null,"Hadamard Gate H",{}));
    const out=initial===0?[s,s]:[s,-s];
    steps.push(arr(3,`H|${initial}⟩ = [${out.map(v=>v.toFixed(3)).join(",")}] (superposition!)`,[11,12],[{val:out[0].toFixed(3),state:"highlighted"},{val:out[1].toFixed(3),state:"highlighted"}],"Superposition",{amp0:out[0].toFixed(3),amp1:out[1].toFixed(3)}));
    steps.push(arr(4,"Measure: P(0) = |amp0|² = 0.5, P(1) = |amp1|² = 0.5",[16,17,18],[{val:"P(0)=0.5",state:"computed"},{val:"P(1)=0.5",state:"computed"}],"Probabilities",{equal:true}));
    steps.push(arr(5,"H is its own inverse: H·H = I",[11],[{val:"H²=I",state:"highlighted"},{val:"self-inverse",state:"active"}],"Property",{unitary:true,selfInverse:true}));
    return steps;
  }
};

// ─── CNOT Gate ────────────────────────────────────────────────────────────────
export const cnotGateModule: VisualizationModule<string> = {
  id: "cnot-gate", slug: "cnot-gate", title: "CNOT Gate",
  category: ["quantum"], difficulty: "beginner",
  timeComplexity: "O(1)", spaceComplexity: "O(1)",
  description: "Controlled-NOT: flips target qubit iff control is |1⟩. Entangles qubits.",
  relatedTopics: [],
  pythonCode: `import numpy as np

# CNOT gate (controlled-X) — 4×4 matrix for 2 qubits
CNOT = np.array([
    [1,0,0,0],
    [0,1,0,0],
    [0,0,0,1],
    [0,0,1,0]
])

# 2-qubit states: |00⟩=e0, |01⟩=e1, |10⟩=e2, |11⟩=e3
ket_00 = np.array([1,0,0,0])
ket_01 = np.array([0,1,0,0])
ket_10 = np.array([0,0,1,0])
ket_11 = np.array([0,0,0,1])

print(CNOT @ ket_00)  # |00⟩ → |00⟩
print(CNOT @ ket_01)  # |01⟩ → |01⟩
print(CNOT @ ket_10)  # |10⟩ → |11⟩ ← flip!
print(CNOT @ ket_11)  # |11⟩ → |10⟩ ← flip!`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 16, highlightLines: [16] },
    { stepNumber: 18, highlightLines: [18] },
  ],
  defaultInput: "10",
  generateSteps(state) {
    const map: Record<string,[string,string]>={"00":["00","unchanged"],"01":["01","unchanged"],"10":["11","FLIPPED!"],"11":["10","FLIPPED!"]};
    const [out,note]=map[state]||["??","?"];
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`Input: |${state}⟩ (control=|${state[0]}⟩, target=|${state[1]}⟩)`,[11,12,13,14,15],[{val:`|${state}⟩`,state:"active"},{val:`ctrl=${state[0]}`,state:"default"},{val:`tgt=${state[1]}`,state:"default"}],"Input",{state}));
    steps.push(mat(2,"CNOT: identity on top 2 rows, swap bottom 2",[3,4,5,6,7,8,9],[[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]],["|00⟩","|01⟩","|10⟩","|11⟩"],["|00⟩","|01⟩","|10⟩","|11⟩"],null,"CNOT Matrix",{}));
    steps.push(arr(3,`Control=${state[0]}: ${state[0]==="1"?"flip target!":"no flip"}`,[16,17,18,19],[{val:`|${out}⟩`,state:"highlighted"},{val:note,state:"active"}],"Output",{control:state[0],flipped:state[0]==="1"}));
    steps.push(arr(4,"CNOT + Hadamard creates Bell state (entanglement)",[11],[{val:"H⊗I → CNOT",state:"computed"},{val:"|Φ⁺⟩",state:"highlighted"}],"Bell state",{entangled:true}));
    return steps;
  }
};

// ─── Toffoli Gate ─────────────────────────────────────────────────────────────
export const toffoliGateModule: VisualizationModule<string> = {
  id: "toffoli-gate", slug: "toffoli-gate", title: "Toffoli Gate (CCNOT)",
  category: ["quantum"], difficulty: "intermediate",
  timeComplexity: "O(1)", spaceComplexity: "O(1)",
  description: "Controlled-Controlled-NOT: universal gate for reversible classical computation.",
  relatedTopics: [],
  pythonCode: `import numpy as np

# Toffoli gate: 3-qubit, 8×8 matrix
# Flips target qubit iff BOTH control qubits are |1⟩

def toffoli(c1, c2, target):
    """Returns new target = target XOR (c1 AND c2)"""
    return target ^ (c1 & c2)

# Truth table:
# |c1 c2 t⟩ → |c1 c2 t ⊕ c1·c2⟩
# |000⟩ → |000⟩
# |001⟩ → |001⟩
# |010⟩ → |010⟩
# |011⟩ → |011⟩
# |100⟩ → |100⟩
# |101⟩ → |101⟩
# |110⟩ → |111⟩  ← both controls=1: flip!
# |111⟩ → |110⟩  ← both controls=1: flip!

# Universality: NAND gate = Toffoli(c1,c2,1)`,
  codeSteps: [
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 18, highlightLines: [18] },
    { stepNumber: 20, highlightLines: [20] },
  ],
  defaultInput: "110",
  generateSteps(state) {
    const c1=parseInt(state[0]),c2=parseInt(state[1]),t=parseInt(state[2]);
    const newT=t^(c1&c2);
    const out=`${c1}${c2}${newT}`;
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`Input: |${state}⟩ (c1=|${c1}⟩, c2=|${c2}⟩, target=|${t}⟩)`,[6],[{val:`c1=${c1}`,state:"active"},{val:`c2=${c2}`,state:"active"},{val:`tgt=${t}`,state:"active"}],"Input",{state}));
    steps.push(arr(2,`AND gate: c1·c2 = ${c1}&${c2} = ${c1&c2}`,[6],[{val:`c1·c2=${c1&c2}`,state:(c1&c2)===1?"highlighted":"computed"}],"AND",{and:c1&c2}));
    steps.push(arr(3,`XOR: target ⊕ AND = ${t} ⊕ ${c1&c2} = ${newT}`,[6],[{val:`${t}⊕${c1&c2}=${newT}`,state:"highlighted"},{val:`|${out}⟩`,state:"highlighted"}],"Output",{flipped:newT!==t}));
    steps.push(arr(4,"Toffoli realizes NAND: Toffoli(a,b,1) = NOT(a AND b)",[20],[{val:"NAND=Toffoli(a,b,1)",state:"computed"},{val:"universal",state:"highlighted"}],"Universality",{classical:true}));
    return steps;
  }
};

// ─── Pauli Gates ──────────────────────────────────────────────────────────────
export const pauliGatesModule: VisualizationModule<string> = {
  id: "pauli-gates", slug: "pauli-gates", title: "Pauli Gates (X, Y, Z)",
  category: ["quantum"], difficulty: "beginner",
  timeComplexity: "O(1)", spaceComplexity: "O(1)",
  description: "Fundamental single-qubit gates: X (NOT), Y (rotate), Z (phase flip).",
  relatedTopics: [],
  pythonCode: `import numpy as np

# Pauli matrices
X = np.array([[0,1],[1,0]])   # bit flip (NOT)
Y = np.array([[0,-1j],[1j,0]])  # bit+phase flip
Z = np.array([[1,0],[0,-1]])  # phase flip

ket_0 = np.array([1, 0])
ket_1 = np.array([0, 1])

# X gate: bit flip
print(X @ ket_0)  # [0,1] = |1⟩
print(X @ ket_1)  # [1,0] = |0⟩

# Z gate: phase flip
print(Z @ ket_0)  # [1, 0] = |0⟩ (unchanged)
print(Z @ ket_1)  # [0,-1] = -|1⟩ (phase flip)

# Y = iXZ
# All Pauli gates are their own inverses (unitary & Hermitian)`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 15, highlightLines: [15] },
  ],
  defaultInput: "X",
  generateSteps(gate) {
    const steps: AnimationStep[] = [];
    const gates: Record<string,{mat:string,action:string,ket0:string,ket1:string}> = {
      "X":{mat:"[[0,1],[1,0]]",action:"bit flip",ket0:"|1⟩",ket1:"|0⟩"},
      "Y":{mat:"[[0,-i],[i,0]]",action:"bit+phase flip",ket0:"i|1⟩",ket1:"-i|0⟩"},
      "Z":{mat:"[[1,0],[0,-1]]",action:"phase flip",ket0:"|0⟩",ket1:"-|1⟩"},
    };
    const g=gates[gate]||gates["X"];
    steps.push(arr(1,`${gate} gate: ${g.action}`,[3,4,5],[{val:`${gate}=${g.mat}`,state:"active"}],"Gate matrix",{gate}));
    steps.push(arr(2,`${gate}|0⟩ = ${g.ket0}`,[11,15],[{val:"|0⟩",state:"active"},{val:`→${g.ket0}`,state:"highlighted"}],`${gate}|0⟩`,{}));
    steps.push(arr(3,`${gate}|1⟩ = ${g.ket1}`,[12,16],[{val:"|1⟩",state:"active"},{val:`→${g.ket1}`,state:"highlighted"}],`${gate}|1⟩`,{}));
    steps.push(arr(4,"All Pauli gates: unitary, Hermitian, self-inverse",[19],[{val:"P²=I",state:"computed"},{val:"P†=P",state:"computed"}],"Properties",{unitary:true}));
    return steps;
  }
};

// ─── Grover's Search ──────────────────────────────────────────────────────────
export const groverSearchModule: VisualizationModule<{n:number,target:number}> = {
  id: "grover-search", slug: "grover-search", title: "Grover's Search",
  category: ["quantum"], difficulty: "advanced",
  timeComplexity: "O(√N)", spaceComplexity: "O(log N) qubits",
  description: "Quantum search algorithm: find target in unsorted N-element database in O(√N) steps.",
  relatedTopics: [],
  pythonCode: `import numpy as np, math

def grover(N, target):
    # Initialize uniform superposition
    state = np.ones(N) / np.sqrt(N)
    n_iters = int(math.pi/4 * math.sqrt(N))
    for iteration in range(n_iters):
        # Oracle: flip amplitude of target state
        state[target] *= -1
        # Diffusion (Grover's operator): reflect about mean
        mean = np.mean(state)
        state = 2 * mean - state  # inversion about average
    # Measure: highest amplitude = target
    return np.argmax(np.abs(state)**2)

# Classical: O(N) avg, Quantum: O(√N) = quadratic speedup
# Example: N=16, √16=4 iterations needed`,
  codeSteps: [
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 12, highlightLines: [12] },
  ],
  defaultInput: {n:8, target:3},
  generateSteps({n, target}) {
    const iters=Math.round(Math.PI/4*Math.sqrt(n));
    let state=Array(n).fill(1/Math.sqrt(n));
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`N=${n}: uniform superposition, each amp=${(1/Math.sqrt(n)).toFixed(3)}`,[4,5],state.map((v,i)=>({val:v.toFixed(3),state:i===target?"highlighted":"default" as string})),"Initial state",{iters}));
    for(let it=1;it<=Math.min(iters,4);it++){
      state[target]*=-1;
      const mean=state.reduce((a,b)=>a+b,0)/n;
      state=state.map(v=>2*mean-v);
      steps.push(arr(it+1,`Iter ${it}: oracle+diffusion → target amp=${state[target].toFixed(3)}`,[8,9,10,11],state.map((v,i)=>({val:v.toFixed(3),state:i===target?"highlighted":Math.abs(v)>1/Math.sqrt(n)?"active":"default" as string})),`After iter ${it}`,{targetAmp:state[target].toFixed(3)}));
    }
    const prob=state.map(v=>v**2);
    steps.push(arr(iters+2,`Measure: P(target=${target}) ≈ ${prob[target].toFixed(3)}`,[12],prob.map((p,i)=>({val:p.toFixed(3),state:i===target?"highlighted":"default" as string})),"Probabilities",{speedup:"O(√N) vs O(N)"}));
    return steps;
  }
};

// ─── Shor's Factoring ────────────────────────────────────────────────────────
export const shorFactoringModule: VisualizationModule<number> = {
  id: "shor-factoring", slug: "shor-factoring", title: "Shor's Algorithm",
  category: ["quantum"], difficulty: "advanced",
  timeComplexity: "O((log N)³)", spaceComplexity: "O(log N) qubits",
  description: "Factor large integers exponentially faster than classical algorithms via quantum period-finding.",
  relatedTopics: [],
  pythonCode: `import math, random

def shor_factor(N):
    # 1. Choose random a coprime to N
    a = random.randint(2, N-1)
    if math.gcd(a, N) != 1:
        return math.gcd(a, N)  # lucky: direct factor
    # 2. Quantum period-finding (QPE + QFT)
    r = quantum_period_find(a, N)  # r: period of a^x mod N
    if r % 2 != 0: return None     # retry if odd period
    # 3. Classical post-processing
    candidate1 = math.gcd(a**(r//2) + 1, N)
    candidate2 = math.gcd(a**(r//2) - 1, N)
    for f in [candidate1, candidate2]:
        if 1 < f < N: return f
    return None

# Quantum period-finding uses:
# - Quantum phase estimation (QPE)
# - Quantum Fourier Transform (QFT)
# Complexity: O((log N)^3) — exponential speedup over classical`,
  codeSteps: [
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 18, highlightLines: [18] },
  ],
  defaultInput: 15,
  generateSteps(N) {
    const a=7;
    const r=4; // period of 7^x mod 15
    const g1=Math.abs((Math.pow(a,r/2)+1)%N);
    const g2=Math.abs((Math.pow(a,r/2)-1)%N);
    const gcd=(a:number,b:number):number=>b===0?a:gcd(b,a%b);
    const f1=gcd(g1,N), f2=gcd(g2,N);
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`Factor N=${N}: choose a=${a} (gcd(${a},${N})=1)`,[4,5,6],[{val:`N=${N}`,state:"active"},{val:`a=${a}`,state:"computed"}],"Setup",{N,a,gcd1:1}));
    steps.push(arr(2,`Quantum period-finding: find r s.t. ${a}^r ≡ 1 mod ${N}`,[7,8],[{val:`f(x)=${a}^x mod ${N}`,state:"active"},{val:"QPE+QFT",state:"computed"}],"Quantum step",{qubits:Math.ceil(Math.log2(N))*2}));
    steps.push(arr(3,`Period r=${r} found (${a}^${r} mod ${N} = ${Math.pow(a,r)%N})`,[7],[{val:`r=${r}`,state:"highlighted"},{val:`${a}^${r}%${N}=1`,state:"computed"}],"Period found",{r,even:r%2===0}));
    steps.push(arr(4,`GCD(${a}^${r/2}+1, ${N}) = GCD(${g1},${N}) = ${f1}`,[11,12],[{val:`f1=${f1}`,state:"highlighted"},{val:`f2=${f2}`,state:"highlighted"}],"Factors",{f1,f2}));
    steps.push(arr(5,`${N} = ${f1} × ${Math.floor(N/f1)}`,[13,14],[{val:`${N}=${f1}×${Math.floor(N/f1)}`,state:"highlighted"}],"Factored!",{speedup:"exponential over classical"}));
    return steps;
  }
};

// ─── Quantum Teleportation ────────────────────────────────────────────────────
export const quantumTeleportationModule: VisualizationModule<string> = {
  id: "quantum-teleportation", slug: "quantum-teleportation", title: "Quantum Teleportation",
  category: ["quantum"], difficulty: "advanced",
  timeComplexity: "O(1) quantum ops + 2 classical bits", spaceComplexity: "O(3) qubits",
  description: "Transmit arbitrary qubit state using entanglement and 2 classical bits (no FTL).",
  relatedTopics: [],
  pythonCode: `# Quantum teleportation protocol
# Parties: Alice (has qubit |ψ⟩ to send), Bob

# Step 1: Create Bell pair (entangled qubits shared by Alice & Bob)
bell_pair = (H ⊗ I) * CNOT * |00⟩  # |Φ+⟩ = (|00⟩+|11⟩)/√2

# Step 2: Alice applies Bell measurement
# Alice has: |ψ⟩ ⊗ (her half of Bell pair)
# Apply CNOT on |ψ⟩ (control) and Bell qubit, then H on |ψ⟩
CNOT(psi_qubit, alice_bell)
H(psi_qubit)
# Measure both qubits → 2 classical bits (m1, m2)
m1, m2 = measure(psi_qubit), measure(alice_bell)

# Step 3: Alice sends m1, m2 to Bob via classical channel
# Bob applies corrections:
if m2 == 1: X(bob_qubit)   # bit flip
if m1 == 1: Z(bob_qubit)   # phase flip
# Bob's qubit now = |ψ⟩  (teleported!)`,
  codeSteps: [
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 13, highlightLines: [13] },
    { stepNumber: 15, highlightLines: [15] },
    { stepNumber: 17, highlightLines: [17] },
  ],
  defaultInput: "α|0⟩+β|1⟩",
  generateSteps(psi) {
    const steps: AnimationStep[] = [];
    steps.push(arr(1,"Alice has |ψ⟩ to teleport; prepare Bell pair",[4,5],[{val:`|ψ⟩=${psi}`,state:"active"},{val:"Bell pair shared",state:"computed"}],"Setup",{qubits:3}));
    steps.push(arr(2,"Step 1: H+CNOT creates |Φ+⟩=(|00⟩+|11⟩)/√2",[4],[{val:"Alice: bell_A",state:"active"},{val:"Bob: bell_B",state:"highlighted"},{val:"entangled",state:"computed"}],"Bell pair",{entangled:true}));
    steps.push(arr(3,"Step 2: Alice applies CNOT(ψ, bell_A) then H(ψ)",[8,9],[{val:"CNOT",state:"active"},{val:"H",state:"computed"}],"Bell measurement",{alice:true}));
    steps.push(arr(4,"Alice measures → m1=0, m2=1 (classical bits)",[10,11],[{val:"m1=0",state:"highlighted"},{val:"m2=1",state:"highlighted"},{val:"send to Bob",state:"computed"}],"Measure",{m1:0,m2:1}));
    steps.push(arr(5,"Bob: m2=1→X, m1=0→skip Z → Bob has |ψ⟩!",[15,16,17],[{val:"X applied",state:"active"},{val:`Bob: |ψ⟩=${psi}`,state:"highlighted"}],"Teleported!",{transferred:psi,classical:2}));
    return steps;
  }
};

// ─── Deutsch-Jozsa ────────────────────────────────────────────────────────────
export const deutschJozsaModule: VisualizationModule<string> = {
  id: "deutsch-jozsa", slug: "deutsch-jozsa", title: "Deutsch-Jozsa Algorithm",
  category: ["quantum"], difficulty: "intermediate",
  timeComplexity: "O(1) queries (classical: O(2^n/2))", spaceComplexity: "O(n) qubits",
  description: "Determine if f:{0,1}ⁿ→{0,1} is constant or balanced in a single query.",
  relatedTopics: [],
  pythonCode: `# Deutsch-Jozsa: is f constant or balanced?
# Constant: f(x) = 0 for all x, or f(x) = 1 for all x
# Balanced: f(x) = 0 for half, f(x) = 1 for other half

def deutsch_jozsa(oracle, n):
    # 1. Initialize n+1 qubits: |0⟩^n ⊗ |1⟩
    state = |0...0⟩ ⊗ |1⟩
    # 2. Apply H to all qubits
    state = H^(n+1) * state
    # 3. Apply oracle Uf
    state = oracle(state)
    # 4. Apply H to first n qubits
    state = H^n ⊗ I * state
    # 5. Measure first n qubits
    result = measure(state[:n])
    # If all zeros → CONSTANT
    # If any non-zero → BALANCED
    return 'constant' if result == 0 else 'balanced'`,
  codeSteps: [
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 11, highlightLines: [11] },
  ],
  defaultInput: "0,1,1,0",
  generateSteps(oracle) {
    const steps: AnimationStep[] = [];
    // Parse the oracle truth table: f(x) for x = 0..2ⁿ-1, e.g. "0,1,1,0".
    let f = String(oracle).split(/[,\s]+/).map(t => t.trim()).filter(Boolean).map(t => (t === "1" ? 1 : 0));
    // Pad/truncate to a power of two
    const n = Math.max(1, Math.floor(Math.log2(f.length || 1)));
    const size = 2 ** n;
    f = f.slice(0, size);
    while (f.length < size) f.push(0);

    const ones = f.filter(v => v === 1).length;
    const isConstant = ones === 0 || ones === size;
    const isBalanced = ones === size / 2;
    const verdict = isConstant ? "CONSTANT" : isBalanced ? "BALANCED" : "NEITHER (not a valid DJ oracle)";

    steps.push(arr(1,`Oracle truth table f(x) over ${size} inputs (n=${n} qubits).`,[5,6],
      f.map((v,x)=>({val:`f(${x.toString(2).padStart(n,"0")})=${v}`,state:v===1?"active":"default" as string})),
      "Oracle f(x)",{n,table:f}));

    steps.push(arr(2,"H^(n+1): uniform superposition over all 2ⁿ inputs.",[7],
      Array.from({length:size},(_,i)=>({val:`|${i.toString(2).padStart(n,"0")}⟩`,state:"computed" as string})),
      "Superposition",{amplitude:+(1/Math.sqrt(size)).toFixed(3)}));

    steps.push(arr(3,"Oracle Uf: phase kickback applies (-1)^f(x) to each amplitude.",[8],
      f.map((v,x)=>({val:`(-1)^${v}|${x.toString(2).padStart(n,"0")}⟩`,state:v===1?"highlighted":"computed" as string})),
      "Phase kickback",{flipped:ones}));

    steps.push(arr(4,"H^n on the first n qubits: amplitudes interfere.",[9],
      [{val:"H^n",state:"active"},{val:isConstant?"reinforce |0…0⟩":"cancel |0…0⟩",state:"computed"}],
      "Interference",{}));

    steps.push(arr(5,`Measure first n qubits → ${isConstant?"all zeros":"non-zero"} ⟹ ${verdict}.`,[11,12,13],
      isConstant
        ? [{val:`|${"0".repeat(n)}⟩`,state:"highlighted"},{val:"CONSTANT",state:"highlighted"}]
        : [{val:isBalanced?`|${"0".repeat(n-1)}1⟩`:"mixed",state:"highlighted"},{val:verdict,state:"highlighted"}],
      "Measurement",{result:verdict,ones,queries:1}));
    return steps;
  }
};

// ─── Superposition ────────────────────────────────────────────────────────────
export const superpositionModule: VisualizationModule<number[]> = {
  id: "superposition", slug: "superposition", title: "Quantum Superposition",
  category: ["quantum"], difficulty: "beginner",
  timeComplexity: "O(1)", spaceComplexity: "O(2ⁿ)",
  description: "A qubit can be in states |0⟩ and |1⟩ simultaneously until measured.",
  relatedTopics: [],
  pythonCode: `import numpy as np

# A qubit state: |ψ⟩ = α|0⟩ + β|1⟩
# Constraint: |α|² + |β|² = 1

class Qubit:
    def __init__(self, alpha, beta):
        assert abs(alpha**2 + beta**2 - 1) < 1e-9, "Must normalize!"
        self.state = np.array([alpha, beta])

    def prob_0(self): return abs(self.state[0])**2
    def prob_1(self): return abs(self.state[1])**2

    def measure(self):
        import random
        r = random.random()
        if r < self.prob_0():
            self.state = np.array([1, 0])  # collapse to |0⟩
            return 0
        else:
            self.state = np.array([0, 1])  # collapse to |1⟩
            return 1

# n-qubit system: 2^n dimensional vector
# Exponential state space!`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 16, highlightLines: [16] },
    { stepNumber: 21, highlightLines: [21] },
  ],
  defaultInput: [0.6, 0.8],
  generateSteps([alpha, beta]) {
    // Normalize
    const norm=Math.sqrt(alpha**2+beta**2);
    const a=alpha/norm, b=beta/norm;
    const p0=a**2, p1=b**2;
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`|ψ⟩ = ${a.toFixed(3)}|0⟩ + ${b.toFixed(3)}|1⟩`,[3],[{val:`α=${a.toFixed(3)}`,state:"active"},{val:`β=${b.toFixed(3)}`,state:"active"}],"Qubit state",{normalized:true}));
    steps.push(arr(2,`P(0) = |α|² = ${p0.toFixed(3)}, P(1) = |β|² = ${p1.toFixed(3)}`,[10,11],[{val:`P(0)=${p0.toFixed(3)}`,state:"computed"},{val:`P(1)=${p1.toFixed(3)}`,state:"computed"}],"Probabilities",{sum:(p0+p1).toFixed(3)}));
    steps.push(arr(3,"Bloch sphere: state as point on unit sphere",[3,4],[{val:`θ=2arccos(${a.toFixed(2)})`,state:"computed"},{val:"on Bloch sphere",state:"active"}],"Bloch sphere",{}));
    steps.push(arr(4,"Measure: wavefunction collapses to |0⟩ or |1⟩",[16,17,18,19,20],[{val:`50% → |0⟩`,state:"active"},{val:`50% → |1⟩`,state:"active"}],"Collapse",{irreversible:true}));
    steps.push(arr(5,"n=3 qubits: 2³=8 amplitudes (exponential!)",[21],Array.from({length:8},(_,i)=>({val:`|${i.toString(2).padStart(3,"0")}⟩`,state:i===0?"highlighted":"default" as string})),"3-qubit space",{states:8}));
    return steps;
  }
};

// ─── Entanglement ─────────────────────────────────────────────────────────────
export const entanglementModule: VisualizationModule<string> = {
  id: "entanglement", slug: "entanglement", title: "Quantum Entanglement",
  category: ["quantum"], difficulty: "intermediate",
  timeComplexity: "O(1)", spaceComplexity: "O(4) for 2 qubits",
  description: "Bell states: maximally entangled 2-qubit states — measuring one instantly determines other.",
  relatedTopics: [],
  pythonCode: `import numpy as np

# Bell states (maximally entangled 2-qubit states)
Phi_plus  = np.array([1,0,0,1]) / np.sqrt(2)  # (|00⟩+|11⟩)/√2
Phi_minus = np.array([1,0,0,-1]) / np.sqrt(2) # (|00⟩-|11⟩)/√2
Psi_plus  = np.array([0,1,1,0]) / np.sqrt(2)  # (|01⟩+|10⟩)/√2
Psi_minus = np.array([0,1,-1,0]) / np.sqrt(2) # (|01⟩-|10⟩)/√2

# Non-separable: cannot be written as |a⟩⊗|b⟩
# Phi_plus ≠ |a0,a1⟩ ⊗ |b0,b1⟩ for any a,b

# EPR paradox: measure Alice's qubit
# If Alice measures |0⟩: Bob's qubit INSTANTLY = |0⟩
# If Alice measures |1⟩: Bob's qubit INSTANTLY = |1⟩
# (regardless of distance — but cannot send information FTL)

# Create Bell pair: H then CNOT
def create_bell_pair():
    state = np.array([1,0,0,0])  # |00⟩
    state = (H ⊗ I) @ state      # |+0⟩
    state = CNOT @ state          # |Φ+⟩`,
  codeSteps: [
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 14, highlightLines: [14] },
    { stepNumber: 17, highlightLines: [17] },
  ],
  defaultInput: "Φ+",
  generateSteps(bell) {
    const bells: Record<string,{state:string,measure0:string,measure1:string}> = {
      "Φ+":{state:"(|00⟩+|11⟩)/√2",measure0:"Bob gets |0⟩",measure1:"Bob gets |1⟩"},
      "Φ-":{state:"(|00⟩-|11⟩)/√2",measure0:"Bob gets |0⟩",measure1:"Bob gets -|1⟩"},
      "Ψ+":{state:"(|01⟩+|10⟩)/√2",measure0:"Bob gets |1⟩",measure1:"Bob gets |0⟩"},
    };
    const b=bells[bell]||bells["Φ+"];
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`Bell state |${bell}⟩ = ${b.state}`,[4,5,6,7],[{val:`|${bell}⟩`,state:"active"},{val:b.state,state:"computed"}],"Bell state",{entangled:true}));
    steps.push(arr(2,"P(|00⟩)=0.5, P(|11⟩)=0.5 — non-separable",[8,9],[{val:"P(00)=0.5",state:"computed"},{val:"P(11)=0.5",state:"computed"},{val:"P(01)=P(10)=0",state:"default"}],"Probabilities",{separable:false}));
    steps.push(arr(3,"Alice measures |0⟩ (p=0.5)",[11,12],[{val:"Alice: |0⟩",state:"highlighted"},{val:b.measure0,state:"highlighted"}],"EPR collapse",{instant:true}));
    steps.push(arr(4,"Alice measures |1⟩ (p=0.5)",[11,13],[{val:"Alice: |1⟩",state:"active"},{val:b.measure1,state:"active"}],"Alt collapse",{}));
    steps.push(arr(5,"Create: |00⟩ →H⊗I→ |+0⟩ →CNOT→ |"+bell+"⟩",[17,18,19,20],[{val:"|00⟩",state:"active"},{val:"H","state":"computed"},{val:"CNOT",state:"computed"},{val:`|${bell}⟩`,state:"highlighted"}],"Creation",{gates:"H,CNOT"}));
    return steps;
  }
};

// ─── Quantum Error Correction ─────────────────────────────────────────────────
export const quantumErrorModule: VisualizationModule<number> = {
  id: "quantum-error", slug: "quantum-error", title: "Quantum Error Correction",
  category: ["quantum"], difficulty: "advanced",
  timeComplexity: "O(n²) for Steane [7,1,3]", spaceComplexity: "O(7) qubits per logical qubit",
  description: "Protect qubits from decoherence using redundancy and syndrome measurement.",
  relatedTopics: [],
  pythonCode: `# 3-qubit bit-flip code (simplest QEC)
# Encode: |0⟩ → |000⟩, |1⟩ → |111⟩

def encode(psi):
    # Use CNOT to copy: |ψ,0,0⟩ → |ψ,ψ,ψ⟩
    CNOT(psi, q1)
    CNOT(psi, q2)
    return (psi, q1, q2)

def detect_error(q0, q1, q2):
    # Measure syndromes (without disturbing logical qubit)
    s1 = measure(q0 XOR q1)  # parity of qubits 0,1
    s2 = measure(q1 XOR q2)  # parity of qubits 1,2
    return s1, s2

def correct(q0, q1, q2, s1, s2):
    if s1==1 and s2==0: X(q0)   # flip qubit 0
    if s1==1 and s2==1: X(q1)   # flip qubit 1
    if s1==0 and s2==1: X(q2)   # flip qubit 2
    # Now decode: majority vote`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 13, highlightLines: [13] },
    { stepNumber: 16, highlightLines: [16] },
  ],
  defaultInput: 1,
  generateSteps(errorQubitInput) {
    const steps: AnimationStep[] = [];
    // Which physical qubit (0,1,2) suffers a bit-flip. Anything else = no error.
    const e = [0,1,2].includes(errorQubitInput) ? errorQubitInput : -1;

    // 3-qubit code: encoded as |ψψψ⟩. A flip on qubit e gives that qubit X|ψ⟩.
    const flipped = [false,false,false];
    if (e >= 0) flipped[e] = true;

    // Syndrome: s1 = q0⊕q1, s2 = q1⊕q2
    const s1 = (flipped[0] !== flipped[1]) ? 1 : 0;
    const s2 = (flipped[1] !== flipped[2]) ? 1 : 0;
    // Syndrome → which qubit to correct
    const diagnosed = s1===1 && s2===0 ? 0 : s1===1 && s2===1 ? 1 : s1===0 && s2===1 ? 2 : -1;

    steps.push(arr(1,`Encode |ψ⟩ → |ψψψ⟩ across 3 physical qubits (CNOT×2).`,[3,4,5,6,7],
      [{val:"q0=|ψ⟩",state:"computed"},{val:"q1=|ψ⟩",state:"computed"},{val:"q2=|ψ⟩",state:"computed"}],
      "Encoding",{physicalQubits:3,logicalQubits:1}));

    steps.push(arr(2, e<0 ? "No error this round — all qubits intact." : `Noise: qubit ${e} suffers a bit-flip (X) error.`,[9],
      [0,1,2].map(q=>({val:flipped[q]?`q${q}=X|ψ⟩`:`q${q}=|ψ⟩`,state:flipped[q]?"active":"computed" as string})),
      e<0?"No error":"Error injected",{flipped: e<0?"none":`q${e}`}));

    steps.push(arr(3,`Syndrome measurement: s1=q0⊕q1=${s1}, s2=q1⊕q2=${s2}.`,[10,11,12],
      [{val:`s1=${s1}`,state:s1?"highlighted":"default"},{val:`s2=${s2}`,state:s2?"highlighted":"default"},
       {val: diagnosed<0?"no error detected":`→ q${diagnosed} flipped`,state:"computed"}],
      "Syndrome",{s1,s2}));

    steps.push(arr(4, diagnosed<0 ? "Syndrome 00 → nothing to correct." : `Correct: apply X(q${diagnosed}) to restore it.`,[15,16],
      diagnosed<0?[{val:"identity",state:"computed"}]:[{val:`X(q${diagnosed})`,state:"active"},{val:`q${diagnosed} restored`,state:"highlighted"}],
      "Correction",{corrected: diagnosed<0?"none":`q${diagnosed}`}));

    steps.push(arr(5,`Decode by majority vote → logical |ψ⟩ recovered${e>=0?` despite the error on q${e}`:""}.`,[17],
      [{val:"q0=q1=q2=|ψ⟩",state:"computed"},{val:"decoded: |ψ⟩",state:"highlighted"}],
      "Recovered",{distance:3,canCorrect:1,success:diagnosed===e}));
    return steps;
  }
};

export const quantumModules = [
  hadamardGateModule, cnotGateModule, toffoliGateModule, pauliGatesModule,
  groverSearchModule, shorFactoringModule, quantumTeleportationModule,
  deutschJozsaModule, superpositionModule, entanglementModule, quantumErrorModule,
];
