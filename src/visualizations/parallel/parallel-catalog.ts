import type { VisualizationModule, AnimationStep } from "@/types/visualization";

function arr(stepNumber: number, description: string, lines: number[], cells: {val: string|number, state: string}[], label: string, vars: Record<string,unknown>): AnimationStep {
  return { stepNumber, description, highlightLines: lines, visualState: { type: "array1d", cells, label }, variables: vars };
}

// ─── Parallel Merge Sort ──────────────────────────────────────────────────────
export const parallelMergeSortModule: VisualizationModule<number[]> = {
  id: "parallel-merge-sort", slug: "parallel-merge-sort", title: "Parallel Merge Sort",
  category: ["parallel"], difficulty: "intermediate",
  timeComplexity: "O(n log n / p + log²n)", spaceComplexity: "O(n)",
  description: "Recursively split array across p processors; each sorts its chunk then merge.",
  relatedTopics: [],
  pythonCode: `from concurrent.futures import ThreadPoolExecutor
import math

def parallel_merge_sort(arr, p=4):
    n = len(arr)
    chunk_size = math.ceil(n / p)
    chunks = [arr[i:i+chunk_size] for i in range(0, n, chunk_size)]
    # Sort each chunk in parallel
    with ThreadPoolExecutor(max_workers=p) as ex:
        sorted_chunks = list(ex.map(sorted, chunks))
    # k-way merge (sequential)
    return k_way_merge(sorted_chunks)

def k_way_merge(chunks):
    import heapq
    heap = [(c[0], i, 0) for i,c in enumerate(chunks) if c]
    heapq.heapify(heap)
    result = []
    while heap:
        val, ci, idx = heapq.heappop(heap)
        result.append(val)
        if idx+1 < len(chunks[ci]):
            heapq.heappush(heap, (chunks[ci][idx+1], ci, idx+1))
    return result`,
  codeSteps: [
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 14, highlightLines: [14] },
  ],
  defaultInput: [8,3,1,7,5,2,9,4,6,0],
  generateSteps(input) {
    const p=2, n=input.length, cs=Math.ceil(n/p);
    const chunks=Array.from({length:p},(_,i)=>input.slice(i*cs,(i+1)*cs));
    const steps: AnimationStep[] = [];
    steps.push(arr(1,"Original array — split across "+p+" processors",[5,6],input.map(v=>({val:v,state:"default" as string})),"Input",{p}));
    chunks.forEach((c,i)=>{
      const sorted=[...c].sort((a,b)=>a-b);
      steps.push(arr(i+2,`Thread ${i}: sort chunk [${c.join(",")}] → [${sorted.join(",")}]`,[8,9],sorted.map(v=>({val:v,state:"highlighted" as string})),`Thread ${i} (sorted)`,{chunk:i}));
    });
    const result=[...input].sort((a,b)=>a-b);
    steps.push(arr(p+2,"k-way merge: use min-heap to merge sorted chunks",[12,13,14,15,16,17],result.map(v=>({val:v,state:"computed" as string})),"Merged result",{complexity:"O(n log p)"}));
    return steps;
  }
};

// ─── Bitonic Sort ─────────────────────────────────────────────────────────────
export const bitonicSortModule: VisualizationModule<number[]> = {
  id: "bitonic-sort", slug: "bitonic-sort", title: "Bitonic Sort",
  category: ["parallel"], difficulty: "advanced",
  timeComplexity: "O(log²n) parallel steps", spaceComplexity: "O(n log²n)",
  description: "Sorting network: all comparisons known in advance — fully parallelizable.",
  relatedTopics: [],
  pythonCode: `def bitonic_sort(arr, lo=0, cnt=None, direction=True):
    if cnt is None: cnt = len(arr)
    if cnt > 1:
        k = cnt // 2
        # Sort first half ascending
        bitonic_sort(arr, lo, k, True)
        # Sort second half descending
        bitonic_sort(arr, lo+k, cnt-k, False)
        # Merge into bitonic sequence
        bitonic_merge(arr, lo, cnt, direction)

def bitonic_merge(arr, lo, cnt, direction):
    if cnt > 1:
        k = greatest_power_of_2_less_than(cnt)
        for i in range(lo, lo+cnt-k):
            if (arr[i] > arr[i+k]) == direction:
                arr[i], arr[i+k] = arr[i+k], arr[i]
        bitonic_merge(arr, lo, k, direction)
        bitonic_merge(arr, lo+k, cnt-k, direction)`,
  codeSteps: [
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 14, highlightLines: [14] },
  ],
  defaultInput: [3,7,4,8,6,2,1,5],
  generateSteps(input) {
    const a=[...input];
    const steps: AnimationStep[] = [];
    steps.push(arr(1,"Initial array — all comparators known in advance",[1],a.map(v=>({val:v,state:"default" as string})),"Input",{n:a.length}));
    // Step 1: pairs
    const step1=[...a];
    for(let i=0;i<step1.length;i+=2){if(step1[i]>step1[i+1])[step1[i],step1[i+1]]=[step1[i+1],step1[i]];}
    steps.push(arr(2,"Step 1: compare adjacent pairs (all in parallel)",[14,15],step1.map((v,i)=>({val:v,state:i<2||i>=step1.length-2?"highlighted":"computed" as string})),"After step 1",{parallel:true}));
    const step2=[...step1];
    for(let i=0;i<step2.length;i+=4){
      const s=step2.slice(i,i+4).sort((a,b)=>a-b);
      s.forEach((v,j)=>step2[i+j]=v);
    }
    steps.push(arr(3,"Step 2: 4-element bitonic merge (parallel)",[12,13,14],step2.map(v=>({val:v,state:"computed" as string})),"After step 2",{}));
    const sorted=[...a].sort((x,y)=>x-y);
    steps.push(arr(4,"Final: fully sorted (O(log²n) parallel steps)",[9,10],sorted.map(v=>({val:v,state:"highlighted" as string})),"Sorted",{steps:Math.log2(a.length)**2}));
    return steps;
  }
};

// ─── Odd-Even Sort ────────────────────────────────────────────────────────────
export const oddEvenSortModule: VisualizationModule<number[]> = {
  id: "odd-even-sort", slug: "odd-even-sort", title: "Odd-Even Transposition Sort",
  category: ["parallel"], difficulty: "intermediate",
  timeComplexity: "O(n) parallel phases", spaceComplexity: "O(n)",
  description: "Parallel bubble sort: alternating odd and even phase compare-swaps.",
  relatedTopics: [],
  pythonCode: `def odd_even_sort(arr):
    n = len(arr)
    sorted = False
    phase = 0
    while not sorted:
        sorted = True
        # Odd phase: compare (0,1),(2,3),(4,5),...
        if phase % 2 == 0:
            for i in range(0, n-1, 2):
                if arr[i] > arr[i+1]:
                    arr[i], arr[i+1] = arr[i+1], arr[i]
                    sorted = False
        # Even phase: compare (1,2),(3,4),(5,6),...
        else:
            for i in range(1, n-1, 2):
                if arr[i] > arr[i+1]:
                    arr[i], arr[i+1] = arr[i+1], arr[i]
                    sorted = False
        phase += 1
    return arr`,
  codeSteps: [
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 13, highlightLines: [13] },
    { stepNumber: 9, highlightLines: [9] },
  ],
  defaultInput: [5,3,8,1,6,2,7,4],
  generateSteps(input) {
    const a=[...input];
    const steps: AnimationStep[] = [];
    steps.push(arr(1,"Initial array",[1],a.map(v=>({val:v,state:"default" as string})),"Input",{}));
    for(let phase=0;phase<Math.min(6,a.length);phase++){
      const start=phase%2===0?0:1;
      const swapped: number[]=[];
      for(let i=start;i<a.length-1;i+=2){
        if(a[i]>a[i+1]){[a[i],a[i+1]]=[a[i+1],a[i]];swapped.push(i,i+1);}
      }
      steps.push(arr(phase+2,`Phase ${phase+1} (${phase%2===0?"odd":"even"}): ${swapped.length/2} swap(s)`,[phase%2===0?7:13],a.map((v,i)=>({val:v,state:swapped.includes(i)?"highlighted":"default" as string})),`Phase ${phase+1}`,{swaps:swapped.length/2}));
      if(!swapped.length) break;
    }
    return steps;
  }
};

// ─── Parallel Prefix Sum ──────────────────────────────────────────────────────
export const parallelPrefixModule: VisualizationModule<number[]> = {
  id: "parallel-prefix", slug: "parallel-prefix", title: "Parallel Prefix Sum",
  category: ["parallel"], difficulty: "intermediate",
  timeComplexity: "O(log n) parallel steps", spaceComplexity: "O(n)",
  description: "Compute all prefix sums in O(log n) parallel steps using up-sweep and down-sweep.",
  relatedTopics: [],
  pythonCode: `def parallel_prefix_sum(arr):
    n = len(arr)
    # Up-sweep (reduce) phase
    step = 1
    while step < n:
        for i in range(step-1, n-1, 2*step):  # in parallel
            arr[i + step] += arr[i]
        step *= 2
    arr[-1] = 0  # set identity for down-sweep
    # Down-sweep phase
    step = n // 2
    while step >= 1:
        for i in range(step-1, n-1, 2*step):  # in parallel
            temp = arr[i + step]
            arr[i + step] += arr[i]
            arr[i] = temp
        step //= 2
    return arr`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 13, highlightLines: [13] },
  ],
  defaultInput: [1,3,2,5,4,2,3,1],
  generateSteps(input) {
    const a=[...input];
    const steps: AnimationStep[] = [];
    steps.push(arr(1,"Input array — compute prefix sums in O(log n) steps",[1],a.map(v=>({val:v,state:"default" as string})),"Input",{n:a.length}));
    // Up-sweep
    let step=1;
    let phase=1;
    while(step<a.length){
      const b=[...a];
      for(let i=step-1;i<a.length-1;i+=2*step) b[i+step]+=b[i];
      Object.assign(a,b);
      steps.push(arr(phase+1,`Up-sweep stride=${step}: add at distance ${step}`,[5,6,7],a.map((v,i)=>({val:v,state:i%step===step-1?"highlighted":"default" as string})),`Up-sweep step ${phase}`,{stride:step}));
      step*=2; phase++;
    }
    a[a.length-1]=0;
    steps.push(arr(phase+1,"Set last element to 0 (down-sweep init)",[8],a.map(v=>({val:v,state:"default" as string})),"Down-sweep init",{}));
    // show final
    const prefix=[...input].map((_,i,ar)=>ar.slice(0,i).reduce((s,v)=>s+v,0));
    steps.push(arr(phase+2,"Result: all prefix sums computed in parallel",[10,11,12,13,14,15],prefix.map(v=>({val:v,state:"highlighted" as string})),"Prefix sums",{parallelSteps:Math.log2(input.length)}));
    return steps;
  }
};

// ─── Fork-Join ────────────────────────────────────────────────────────────────
export const forkJoinModule: VisualizationModule<number> = {
  id: "fork-join", slug: "fork-join", title: "Fork-Join Model",
  category: ["parallel"], difficulty: "intermediate",
  timeComplexity: "O(n/p + log p)", spaceComplexity: "O(p·stack)",
  description: "Divide work into sub-tasks (fork), execute in parallel, then synchronize (join).",
  relatedTopics: [],
  pythonCode: `from concurrent.futures import ThreadPoolExecutor
import math

def parallel_sum(arr, threshold=4):
    if len(arr) <= threshold:
        return sum(arr)   # base case: sequential
    mid = len(arr) // 2
    with ThreadPoolExecutor() as ex:
        # Fork: submit two sub-tasks
        future_left  = ex.submit(parallel_sum, arr[:mid])
        future_right = ex.submit(parallel_sum, arr[mid:])
        # Join: wait for results
        return future_left.result() + future_right.result()

# Java ForkJoinPool equivalent:
# class SumTask extends RecursiveTask<Long>:
#   compute(): if small: return seq_sum() else: fork+join subtasks`,
  codeSteps: [
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 11, highlightLines: [11] },
  ],
  defaultInput: 8,
  generateSteps(n) {
    const data=Array.from({length:n},(_,i)=>i+1);
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`Parallel sum of [1..${n}]`,[3],data.map(v=>({val:v,state:"default" as string})),"Input",{n}));
    const half=Math.ceil(n/2);
    steps.push(arr(2,`Fork: left=[1..${half}], right=[${half+1}..${n}]`,[7,8,9,10],data.map((v,i)=>({val:v,state:i<half?"active":"computed" as string})),"Forked",{tasks:2}));
    const leftSum=data.slice(0,half).reduce((a,b)=>a+b,0);
    const rightSum=data.slice(half).reduce((a,b)=>a+b,0);
    steps.push(arr(3,`Sub-tasks computing in parallel: left=${leftSum}, right=${rightSum}`,[5,6],[{val:`L=${leftSum}`,state:"highlighted"},{val:`R=${rightSum}`,state:"highlighted"}],"Parallel",{concurrent:true}));
    steps.push(arr(4,`Join: total=${leftSum+rightSum}`,[11,12],[{val:`${leftSum}+${rightSum}`,state:"active"},{val:`=${leftSum+rightSum}`,state:"highlighted"}],"Joined",{total:leftSum+rightSum}));
    return steps;
  }
};

// ─── Actor Model ──────────────────────────────────────────────────────────────
export const actorModelModule: VisualizationModule<number> = {
  id: "actor-model", slug: "actor-model", title: "Actor Model",
  category: ["parallel"], difficulty: "advanced",
  timeComplexity: "O(messages)", spaceComplexity: "O(actors)",
  description: "Concurrency via message-passing actors — no shared state, no locks.",
  relatedTopics: [],
  pythonCode: `# Actor model using Python's asyncio
import asyncio
from dataclasses import dataclass

@dataclass
class Message:
    sender: str; content: any

class Actor:
    def __init__(self, name):
        self.name = name
        self.mailbox = asyncio.Queue()

    async def send(self, target, content):
        await target.mailbox.put(Message(self.name, content))

    async def run(self):
        while True:
            msg = await self.mailbox.get()
            await self.handle(msg)

    async def handle(self, msg):
        raise NotImplementedError  # subclass defines behavior`,
  codeSteps: [
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 13, highlightLines: [13] },
    { stepNumber: 15, highlightLines: [15] },
    { stepNumber: 18, highlightLines: [18] },
  ],
  defaultInput: 3,
  generateSteps(actors) {
    // Clamp to a sensible, displayable range and generate that many actors.
    const n = Math.max(2, Math.min(8, Math.floor(actors) || 3));
    const pool = ["Alice","Bob","Carol","Dave","Eve","Frank","Grace","Heidi"];
    const names = pool.slice(0, n);
    const steps: AnimationStep[] = [];

    steps.push(arr(1,`${n} actors, each with its own private mailbox.`,[9,10,11],
      names.map(nm=>({val:nm,state:"active" as string})),"Actors",{actors:n}));

    // Message ring: each actor sends to the next
    for (let i = 0; i < n; i++) {
      const from = names[i], to = names[(i+1)%n];
      steps.push(arr(2+i,`${from} sends a message to ${to} (async, no shared state).`,[13,14],
        names.map((nm,j)=>({
          val: j===(i+1)%n ? `${nm}[msg]` : nm,
          state: j===i ? "active" : j===(i+1)%n ? "highlighted" : "default" as string,
        })),"Message passing",{from,to,inFlight:1}));
    }

    steps.push(arr(2+n,`All ${n} actors process their mailboxes concurrently — no locks needed.`,[15,16,17],
      [...names.map(nm=>({val:nm,state:"computed" as string})),{val:"✓ lock-free",state:"highlighted"}],
      "Concurrent processing",{lockFree:true,actors:n}));
    return steps;
  }
};

// ─── Pipeline Parallelism ─────────────────────────────────────────────────────
export const pipelineParallelModule: VisualizationModule<number> = {
  id: "pipeline-parallel", slug: "pipeline-parallel", title: "Pipeline Parallelism",
  category: ["parallel"], difficulty: "intermediate",
  timeComplexity: "O(n + p - 1) cycles", spaceComplexity: "O(p)",
  description: "Overlap execution of multiple tasks across pipeline stages.",
  relatedTopics: [],
  pythonCode: `# Pipeline: stages execute on different items simultaneously
# Stage 1: Fetch → Stage 2: Decode → Stage 3: Execute → Stage 4: Write

class Pipeline:
    def __init__(self, stages):
        self.stages = stages   # list of callables

    def process(self, items):
        buffers = [None] * (len(self.stages) + 1)
        buffers[0] = iter(items)
        results = []
        # Each cycle advances all stages simultaneously
        while any(b is not None for b in buffers[1:]) or True:
            new_bufs = [None] * len(buffers)
            for i in range(len(self.stages)-1, -1, -1):
                if buffers[i] is not None:
                    new_bufs[i+1] = self.stages[i](buffers[i])
            try: new_bufs[0] = next(buffers[0])
            except StopIteration: new_bufs[0] = None
            buffers = new_bufs
        return results`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 14, highlightLines: [14] },
  ],
  defaultInput: 4,
  generateSteps(items) {
    const stages=["Fetch","Decode","Execute","Write"];
    const steps: AnimationStep[] = [];
    // Cycle 0: only stage 0 busy
    steps.push(arr(1,"Pipeline initialized — 4 stages",[3,4,5],stages.map(s=>({val:s,state:"default" as string})),"Pipeline stages",{items}));
    for(let cycle=1;cycle<=items+stages.length-1;cycle++){
      const busy=stages.map((_,si)=>{
        const itemIdx=cycle-1-si;
        return itemIdx>=0&&itemIdx<items?`I${itemIdx+1}`:"—";
      });
      steps.push(arr(cycle+1,`Cycle ${cycle}: ${busy.filter(b=>b!=="—").length} stage(s) active`,[9,10,11,12,13],busy.map((b,i)=>({val:`${stages[i]}\n${b}`,state:b!=="—"?"highlighted":"default" as string})),`Cycle ${cycle}`,{throughput:`${Math.min(cycle,items)}`}));
    }
    return steps;
  }
};

// ─── SIMD ─────────────────────────────────────────────────────────────────────
export const simdModule: VisualizationModule<number[]> = {
  id: "simd", slug: "simd", title: "SIMD (Single Instruction Multiple Data)",
  category: ["parallel"], difficulty: "advanced",
  timeComplexity: "O(n/w) vs O(n) scalar", spaceComplexity: "O(1)",
  description: "Execute one instruction on multiple data elements simultaneously using vector registers.",
  relatedTopics: [],
  pythonCode: `import numpy as np  # NumPy uses SIMD under the hood

# Scalar: process one element at a time
def scalar_add(a, b):
    result = []
    for i in range(len(a)):
        result.append(a[i] + b[i])   # one add per iteration
    return result

# SIMD: process 8 floats at once (AVX 256-bit)
def simd_add(a, b):
    # Compiler/numpy loads 8 floats into YMM register
    return np.array(a) + np.array(b)  # VADDPS instruction

# Manual SIMD with ctypes (conceptual):
# __m256 va = _mm256_load_ps(a)   # load 8 floats
# __m256 vb = _mm256_load_ps(b)
# __m256 vc = _mm256_add_ps(va, vb)  # add all 8 at once
# _mm256_store_ps(c, vc)`,
  codeSteps: [
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 14, highlightLines: [14] },
    { stepNumber: 16, highlightLines: [16] },
  ],
  defaultInput: [1,2,3,4,5,6,7,8],
  generateSteps(a) {
    const b=a.map((_,i)=>i+1);
    const w=4; // SIMD width
    const steps: AnimationStep[] = [];
    steps.push(arr(1,"Scalar: add each element one by one",[4,5,6],a.map(v=>({val:v,state:"default" as string})),"Array A",{n:a.length}));
    steps.push(arr(2,`SIMD: load ${w} elements into vector register`,[14],a.slice(0,w).map(v=>({val:v,state:"active" as string})).concat(a.slice(w).map(v=>({val:v,state:"default" as string}))),"Vector reg (A)",{width:w}));
    steps.push(arr(3,`SIMD: ${w} adds in 1 instruction (vs ${w} scalar ops)`,[16],a.slice(0,w).map((v,i)=>({val:v+b[i],state:"highlighted" as string})).concat(a.slice(w).map(v=>({val:v,state:"default" as string}))),"After VADDPS",{speedup:`${w}x`}));
    if(a.length>w) {
      steps.push(arr(4,`Next batch: elements ${w+1}..${Math.min(2*w,a.length)}`,[10,11,12],a.slice(w,2*w).map((v,i)=>({val:v+b[i+w],state:"highlighted" as string})),"Batch 2",{}));
    }
    steps.push(arr(5,`Speedup: O(n) → O(n/${w}) with ${w}-wide SIMD`,[10,11],a.map((v,i)=>({val:v+b[i],state:"computed" as string})),"Result",{speedup:`${w}x`,instructions:Math.ceil(a.length/w)}));
    return steps;
  }
};

// ─── Warp Execution (GPU) ─────────────────────────────────────────────────────
export const warpExecutionModule: VisualizationModule<number> = {
  id: "warp-execution", slug: "warp-execution", title: "GPU Warp Execution",
  category: ["parallel"], difficulty: "advanced",
  timeComplexity: "O(n/32) warps", spaceComplexity: "O(n)",
  description: "GPU executes 32 threads in lockstep (warp); branch divergence causes serialization.",
  relatedTopics: [],
  pythonCode: `# CUDA kernel: each thread processes one element
# Warp = 32 threads executing same instruction

__global__ void vector_add(float *a, float *b, float *c, int n):
    tid = blockIdx.x * blockDim.x + threadIdx.x
    if tid < n:
        c[tid] = a[tid] + b[tid]  # all 32 threads execute simultaneously

# Branch divergence (avoid!):
__global__ void divergent(float *a, int n):
    tid = blockIdx.x * blockDim.x + threadIdx.x
    if a[tid] > 0:           # threads may take different paths
        a[tid] = sqrt(a[tid])   # half the warp executes this
    else:
        a[tid] = 0              # other half executes this (serialized!)
# Both paths execute — threads not taking a path are MASKED OUT`,
  codeSteps: [
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 13, highlightLines: [13] },
  ],
  defaultInput: 64,
  generateSteps(n) {
    const warps=Math.ceil(n/32);
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`${n} threads = ${warps} warps of 32`,[4,5],Array.from({length:Math.min(8,warps)},(_,i)=>({val:`warp${i}`,state:"default" as string})),"Warps",{n,warps}));
    steps.push(arr(2,"Warp 0: all 32 threads execute a[tid]+b[tid]",[6],Array.from({length:4},(_,i)=>({val:`T${i*8}..${i*8+7}`,state:"highlighted" as string})),"Warp 0",{threads:32,cycles:1}));
    steps.push(arr(3,"Branch divergence: if(a[tid]>0) — some threads YES, some NO",[10,11],[{val:"YES threads",state:"active"},{val:"NO threads (masked)",state:"computed"}],"Divergence",{warning:"serialized"}));
    steps.push(arr(4,"Path 1 executes (NO threads masked) → then path 2 (YES masked)",[11,12,13,14],[{val:"sqrt path: 1 cycle",state:"active"},{val:"zero path: 1 more",state:"computed"},{val:"total: 2 cycles",state:"highlighted"}],"Serialized",{overhead:"2x"}));
    steps.push(arr(5,"Avoid divergence: predication or uniform control flow",[9],[{val:"best practice",state:"highlighted"},{val:"divergence→slow",state:"active"}],"Best practices",{warpSize:32}));
    return steps;
  }
};

// ─── CUDA Memory Hierarchy ────────────────────────────────────────────────────
export const cudaMemoryModule: VisualizationModule<number> = {
  id: "cuda-memory", slug: "cuda-memory", title: "CUDA Memory Coalescing",
  category: ["parallel"], difficulty: "advanced",
  timeComplexity: "varies by access pattern", spaceComplexity: "O(1)",
  description: "GPU global-memory coalescing: threads accessing a[tid*stride]. Stride 1 = coalesced (fast); larger strides = more memory transactions.",
  relatedTopics: [],
  pythonCode: `# CUDA memory types and usage

# 1. Registers (fastest, per-thread, ~4KB)
__global__ void kernel(float *a):
    float reg = a[0]  # stored in register if possible

# 2. Shared Memory (per-block, ~48KB, fast)
__global__ void tiled_matmul(float *A, float *B, float *C):
    __shared__ float tileA[TILE][TILE]  # declared in shared mem
    __shared__ float tileB[TILE][TILE]
    tileA[ty][tx] = A[row*N + k*TILE+tx]  # load global→shared
    __syncthreads()  # barrier: all threads must finish load
    # Compute using fast shared memory...

# 3. Global Memory (all threads, ~GB, slow ~400 cycles)
# 4. Constant Memory (read-only, cached ~10KB)
# 5. Texture Memory (spatial locality cache)

# Coalesced access: threads access consecutive addresses
# Bad: a[tid*stride]  Good: a[tid] (coalesced)`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 14, highlightLines: [14] },
    { stepNumber: 18, highlightLines: [18] },
  ],
  defaultInput: 1,
  generateSteps(strideInput) {
    const stride = Math.max(1, Math.min(8, Math.floor(strideInput) || 1));
    const THREADS = 8;        // a warp lane sample
    const WORDS_PER_LINE = 8; // 128-byte cache line / 4-byte word (scaled to 8)
    const steps: AnimationStep[] = [];

    // Addresses each thread touches
    const addrs = Array.from({length: THREADS}, (_, t) => t * stride);
    // Distinct cache lines (memory transactions) touched
    const lines = new Set(addrs.map(a => Math.floor(a / WORDS_PER_LINE)));
    const transactions = lines.size;
    const efficiency = Math.round((THREADS / (transactions * WORDS_PER_LINE)) * 100);

    steps.push(arr(1,`${THREADS} threads access a[tid×${stride}]. ${stride===1?"Coalesced pattern.":"Strided pattern."}`,[18],
      addrs.map((a,t)=>({val:`t${t}→a[${a}]`,state:t===0?"active":"default" as string})),
      `Access pattern (stride=${stride})`,{stride,addresses:addrs}));

    steps.push(arr(2,`Addresses span ${transactions} distinct 128-byte cache line(s).`,[10],
      Array.from({length: Math.max(...lines)+1},(_,L)=>({
        val:`line ${L}`, state: lines.has(L) ? "highlighted":"default" as string,
      })),"Cache lines touched",{transactions}));

    steps.push(arr(3,`Each cache line = 1 memory transaction → ${transactions} transaction(s) issued.`,[14],
      Array.from({length:transactions},(_,i)=>({val:`txn ${i+1}`,state:"active" as string})),
      "Memory transactions",{transactions,bytesFetched:transactions*WORDS_PER_LINE*4}));

    steps.push(arr(4,`Bus efficiency ≈ ${efficiency}% (${THREADS} useful words / ${transactions*WORDS_PER_LINE} fetched).`,[18],
      [{val:`${efficiency}%`,state:efficiency>=90?"highlighted":"active"}],
      efficiency>=90?"Efficient (coalesced)":"Wasted bandwidth",{efficiency:`${efficiency}%`}));

    steps.push(arr(5, stride===1
        ? "Stride 1 is optimal: one transaction serves the whole warp."
        : `Reduce stride toward 1 to coalesce: stride ${stride} wastes ${100-efficiency}% of each fetch.`,[18,19],
      [{val: stride===1?"OPTIMAL":"SUBOPTIMAL", state:"highlighted"}],"Takeaway",{stride,recommended:1}));
    return steps;
  }
};

export const parallelModules = [
  parallelMergeSortModule, bitonicSortModule, oddEvenSortModule,
  parallelPrefixModule, forkJoinModule, actorModelModule,
  pipelineParallelModule, simdModule, warpExecutionModule, cudaMemoryModule,
];
