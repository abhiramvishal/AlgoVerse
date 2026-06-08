import type { AnimationStep, VisualizationModule } from "@/types/visualization";

function step(
  steps: AnimationStep[],
  description: string,
  visualState: Record<string, unknown>,
  variables: Record<string, unknown> = {},
) {
  steps.push({ stepNumber: steps.length + 1, description, highlightLines: [], visualState, variables });
}

// ─── Instruction Pipeline ───────────────────────────────────────────────────
export const instructionPipelineModule: VisualizationModule<null> = {
  id: "instruction-pipeline",
  slug: "instruction-pipeline",
  title: "Instruction Pipeline",
  category: ["computer-architecture", "cpu"],
  difficulty: "intermediate",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description: "5-stage RISC pipeline: IF, ID, EX, MEM, WB. Shows instructions flowing through each stage.",
  relatedTopics: ["superscalar", "out-of-order", "branch-prediction"],
  pythonCode: `# 5-stage RISC pipeline simulation
stages = ["IF", "ID", "EX", "MEM", "WB"]
instructions = ["ADD", "SUB", "LOAD", "STORE", "AND"]

for cycle in range(1, len(instructions) + len(stages)):
    print(f"Cycle {cycle}:")
    for i, instr in enumerate(instructions):
        stage_idx = cycle - 1 - i
        if 0 <= stage_idx < len(stages):
            print(f"  {instr}: {stages[stage_idx]}")`,
  codeSteps: [],
  defaultInput: null,
  generateSteps(_input) {
    const steps: AnimationStep[] = [];
    const stages = ["IF", "ID", "EX", "MEM", "WB"];
    const instructions = ["ADD", "SUB", "LOAD", "STORE", "AND"];
    const totalCycles = instructions.length + stages.length - 1;

    step(steps, "5-stage RISC pipeline: IF→ID→EX→MEM→WB. Each instruction takes 5 cycles but overlap saves time.", {
      type: "pipeline",
      stages,
      instructions: instructions.map((name) => ({ name, stages: {} as Record<string, number> })),
      currentCycle: 0,
      stalls: 0,
      hazards: [],
    }, { cycle: 0 });

    for (let cycle = 1; cycle <= totalCycles; cycle++) {
      const instrStages: { name: string; stages: Record<string, number> }[] = instructions.map((name, i) => {
        const stageIdx = cycle - 1 - i;
        const stageMap: Record<string, number> = {};
        if (stageIdx >= 0 && stageIdx < stages.length) {
          stageMap[stages[stageIdx]] = 1;
        }
        return { name, stages: stageMap };
      });

      const active = instructions
        .map((name, i) => {
          const si = cycle - 1 - i;
          return si >= 0 && si < stages.length ? `${name}@${stages[si]}` : null;
        })
        .filter(Boolean)
        .join(", ");

      step(steps, `Cycle ${cycle}: ${active || "pipeline draining"}.`, {
        type: "pipeline",
        stages,
        instructions: instrStages,
        currentCycle: cycle,
        stalls: 0,
        hazards: [],
      }, { cycle, throughput: Math.min(cycle, instructions.length) });
    }

    step(steps, "Pipeline complete. All 5 instructions finished in 9 cycles (vs 25 sequential).", {
      type: "pipeline",
      stages,
      instructions: instructions.map((name) => ({ name, stages: { WB: 1 } })),
      currentCycle: totalCycles,
      stalls: 0,
      hazards: [],
    }, { totalCycles, speedup: "2.78x" });

    return steps;
  },
};

// ─── Branch Prediction ──────────────────────────────────────────────────────
export const branchPredictionModule: VisualizationModule<{ sequence: boolean[] }> = {
  id: "branch-prediction",
  slug: "branch-prediction",
  title: "Branch Prediction",
  category: ["computer-architecture", "cpu"],
  difficulty: "advanced",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description: "2-bit branch predictor state machine. Tracks prediction accuracy over a sequence of branch outcomes.",
  relatedTopics: ["instruction-pipeline", "out-of-order"],
  pythonCode: `# 2-bit branch predictor
# States: 00=StronglyNotTaken, 01=WeaklyNotTaken, 10=WeaklyTaken, 11=StronglyTaken
state = 0b10  # start WeaklyTaken
correct = 0
for taken in sequence:
    predict = state >= 2
    if predict == taken:
        correct += 1
    if taken and state < 3: state += 1
    elif not taken and state > 0: state -= 1`,
  codeSteps: [],
  defaultInput: { sequence: [true, true, false, true, true, false, false, true] },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const stateNames = ["Strongly Not Taken", "Weakly Not Taken", "Weakly Taken", "Strongly Taken"];
    let state = 2; // WeaklyTaken
    let correct = 0;
    const lanes = ["PC", "Predictor", "Branch Unit", "Pipeline"];

    step(steps, "2-bit branch predictor initialized to 'Weakly Taken' state.", {
      type: "flowdiagram",
      lanes,
      steps: [],
      activeStep: -1,
      completedSteps: [],
    }, { state: stateNames[state], correct: 0, total: 0 });

    input.sequence.forEach((taken, idx) => {
      const predict = state >= 2;
      const isCorrect = predict === taken;
      if (isCorrect) correct++;

      const flowSteps = [
        { from: "PC", to: "Predictor", label: `Branch #${idx + 1}`, color: "#6366f1" },
        { from: "Predictor", to: "Branch Unit", label: `Predict: ${predict ? "Taken" : "Not Taken"}`, color: predict ? "#22c55e" : "#ef4444" },
        { from: "Branch Unit", to: "Pipeline", label: `Actual: ${taken ? "Taken" : "Not Taken"}`, color: taken ? "#22c55e" : "#ef4444" },
        { from: "Pipeline", to: "Predictor", label: isCorrect ? "Correct ✓" : "Mispredicted ✗", color: isCorrect ? "#22c55e" : "#ef4444" },
      ];

      if (taken && state < 3) state++;
      else if (!taken && state > 0) state--;

      step(steps, `Branch #${idx + 1}: predicted ${predict ? "Taken" : "Not Taken"}, actual ${taken ? "Taken" : "Not Taken"} → ${isCorrect ? "Correct" : "Misprediction! Flush pipeline"}.`, {
        type: "flowdiagram",
        lanes,
        steps: flowSteps,
        activeStep: 3,
        completedSteps: [0, 1, 2],
      }, { branch: idx + 1, predicted: predict ? "Taken" : "Not Taken", actual: taken ? "Taken" : "Not Taken", correct, accuracy: `${Math.round(correct / (idx + 1) * 100)}%`, newState: stateNames[state] });
    });

    step(steps, `Prediction complete. Accuracy: ${correct}/${input.sequence.length} = ${Math.round(correct / input.sequence.length * 100)}%.`, {
      type: "flowdiagram",
      lanes,
      steps: [{ from: "Predictor", to: "Pipeline", label: `Final accuracy: ${Math.round(correct / input.sequence.length * 100)}%`, color: "#22c55e" }],
      activeStep: 0,
      completedSteps: [],
    }, { correct, total: input.sequence.length, accuracy: `${Math.round(correct / input.sequence.length * 100)}%` });

    return steps;
  },
};

// ─── Out-of-Order Execution ─────────────────────────────────────────────────
export const outOfOrderModule: VisualizationModule<null> = {
  id: "out-of-order",
  slug: "out-of-order",
  title: "Out-of-Order Execution",
  category: ["computer-architecture", "cpu"],
  difficulty: "advanced",
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)",
  description: "Out-of-order execution using a Reorder Buffer (ROB). Instructions issue in order but execute and complete out of order.",
  relatedTopics: ["instruction-pipeline", "superscalar", "branch-prediction"],
  pythonCode: `# Out-of-order execution with Reorder Buffer
instructions = [
    ("ADD", "R1", "R2", "R3"),   # R1 = R2 + R3
    ("LOAD", "R4", "MEM[R1]"),   # R4 = MEM[R1] - depends on R1
    ("SUB", "R5", "R6", "R7"),   # R5 = R6 - R7 - independent
    ("MUL", "R8", "R5", "R9"),   # R8 = R5 * R9 - depends on R5
]
rob = []  # reorder buffer`,
  codeSteps: [],
  defaultInput: null,
  generateSteps(_input) {
    const steps: AnimationStep[] = [];
    const instructions = ["ADD R1,R2,R3", "LOAD R4,[R1]", "SUB R5,R6,R7", "MUL R8,R5,R9"];
    const robStatuses = ["Issue", "Execute", "Write", "Commit"];
    const matrix = [
      ["ROB#", "Instruction", "Status", "Ready", "Result"],
      ...instructions.map((instr, i) => [String(i + 1), instr, "Issue", "No", "-"]),
    ];

    step(steps, "4 instructions enter the Reorder Buffer (ROB) in program order.", {
      type: "table2d",
      matrix,
      rowLabels: ["Header", "ROB1", "ROB2", "ROB3", "ROB4"],
      colLabels: ["ROB#", "Instruction", "Status", "Ready", "Result"],
      activeCell: null,
      filledCells: [[1, 0], [2, 0], [3, 0], [4, 0]],
      title: "Reorder Buffer",
    }, { rob_entries: 4 });

    // Issue
    const afterIssue = [
      ["ROB#", "Instruction", "Status", "Ready", "Result"],
      ["1", "ADD R1,R2,R3", "Execute", "Yes", "-"],
      ["2", "LOAD R4,[R1]", "Issue", "No", "-"],
      ["3", "SUB R5,R6,R7", "Execute", "Yes", "-"],
      ["4", "MUL R8,R5,R9", "Issue", "No", "-"],
    ];
    step(steps, "ADD and SUB have no dependencies — they issue to execution units immediately. LOAD waits for R1. MUL waits for R5.", {
      type: "table2d",
      matrix: afterIssue,
      rowLabels: ["Header", "ROB1", "ROB2", "ROB3", "ROB4"],
      colLabels: ["ROB#", "Instruction", "Status", "Ready", "Result"],
      activeCell: [1, 2],
      filledCells: [[1, 2], [3, 2]],
      title: "Reorder Buffer — Out-of-order issue",
    }, { executing: ["ADD", "SUB"], waiting: ["LOAD", "MUL"] });

    // ADD completes
    const afterAdd = [
      ["ROB#", "Instruction", "Status", "Ready", "Result"],
      ["1", "ADD R1,R2,R3", "Write", "Yes", "R1=15"],
      ["2", "LOAD R4,[R1]", "Execute", "Yes", "-"],
      ["3", "SUB R5,R6,R7", "Execute", "Yes", "-"],
      ["4", "MUL R8,R5,R9", "Issue", "No", "-"],
    ];
    step(steps, "ADD completes: R1=15. LOAD now has its operand — issues out of order (before ROB1 commits).", {
      type: "table2d",
      matrix: afterAdd,
      rowLabels: ["Header", "ROB1", "ROB2", "ROB3", "ROB4"],
      colLabels: ["ROB#", "Instruction", "Status", "Ready", "Result"],
      activeCell: [2, 2],
      filledCells: [[1, 4]],
      title: "Reorder Buffer — ADD done",
    }, { R1: 15 });

    // SUB completes
    const afterSub = [
      ["ROB#", "Instruction", "Status", "Ready", "Result"],
      ["1", "ADD R1,R2,R3", "Commit", "Yes", "R1=15"],
      ["2", "LOAD R4,[R1]", "Execute", "Yes", "-"],
      ["3", "SUB R5,R6,R7", "Write", "Yes", "R5=7"],
      ["4", "MUL R8,R5,R9", "Execute", "Yes", "-"],
    ];
    step(steps, "SUB completes: R5=7. MUL now has its operand and issues. ADD commits in order.", {
      type: "table2d",
      matrix: afterSub,
      rowLabels: ["Header", "ROB1", "ROB2", "ROB3", "ROB4"],
      colLabels: ["ROB#", "Instruction", "Status", "Ready", "Result"],
      activeCell: [4, 2],
      filledCells: [[3, 4]],
      title: "Reorder Buffer — SUB done, out-of-order",
    }, { R5: 7, committed: ["ADD"] });

    // All done
    const allDone = [
      ["ROB#", "Instruction", "Status", "Ready", "Result"],
      ["1", "ADD R1,R2,R3", "Commit", "Yes", "R1=15"],
      ["2", "LOAD R4,[R1]", "Commit", "Yes", "R4=42"],
      ["3", "SUB R5,R6,R7", "Commit", "Yes", "R5=7"],
      ["4", "MUL R8,R5,R9", "Commit", "Yes", "R8=63"],
    ];
    step(steps, "All instructions commit in program order. Out-of-order execution improved throughput.", {
      type: "table2d",
      matrix: allDone,
      rowLabels: ["Header", "ROB1", "ROB2", "ROB3", "ROB4"],
      colLabels: ["ROB#", "Instruction", "Status", "Ready", "Result"],
      activeCell: null,
      filledCells: [[1, 2], [2, 2], [3, 2], [4, 2]],
      title: "Reorder Buffer — All committed",
    }, { allCommitted: true });

    return steps;
  },
};

// ─── Superscalar ────────────────────────────────────────────────────────────
export const superscalarModule: VisualizationModule<null> = {
  id: "superscalar",
  slug: "superscalar",
  title: "Superscalar Processor",
  category: ["computer-architecture", "cpu"],
  difficulty: "advanced",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description: "2-way in-order superscalar processor issues 2 independent instructions per cycle.",
  relatedTopics: ["instruction-pipeline", "out-of-order"],
  pythonCode: `# 2-way superscalar: issue pairs of independent instructions
instructions = ["ADD","SUB","MUL","LOAD","AND","OR","XOR","SHL"]
stages = ["IF","ID","EX","MEM","WB"]
# Pairs that are independent issue together
for cycle in range(0, len(instructions), 2):
    print(f"Issue {instructions[cycle]} + {instructions[cycle+1]}")`,
  codeSteps: [],
  defaultInput: null,
  generateSteps(_input) {
    const steps: AnimationStep[] = [];
    const stages = ["IF", "ID", "EX", "MEM", "WB"];
    const instrPairs = [
      ["ADD R1,R2,R3", "SUB R4,R5,R6"],
      ["MUL R7,R8,R9", "LOAD R10,[R0]"],
      ["AND R11,R1,R4", "OR R12,R7,R10"],
      ["XOR R13,R11,R12", "SHL R14,R13,2"],
    ];

    step(steps, "2-way superscalar: processor has 2 parallel pipelines to issue 2 instructions per cycle.", {
      type: "pipeline",
      stages,
      instructions: [
        { name: "Pipeline 1", stages: {} },
        { name: "Pipeline 2", stages: {} },
      ],
      currentCycle: 0,
      stalls: 0,
      hazards: [],
    }, { width: 2, pipelines: 2 });

    instrPairs.forEach(([i1, i2], cycle) => {
      const stageMap1: Record<string, number> = { IF: 1 };
      const stageMap2: Record<string, number> = { IF: 1 };

      step(steps, `Cycle ${cycle + 1}: Issue pair — [${i1}] and [${i2}] simultaneously.`, {
        type: "pipeline",
        stages,
        instructions: [
          { name: i1, stages: stageMap1 },
          { name: i2, stages: stageMap2 },
        ],
        currentCycle: cycle + 1,
        stalls: 0,
        hazards: [],
      }, { cycle: cycle + 1, issued: 2 * (cycle + 1), ipc: 2 });
    });

    step(steps, "Superscalar complete. 8 instructions issued in 4 cycles — IPC=2 (vs scalar IPC=1).", {
      type: "pipeline",
      stages,
      instructions: [
        { name: "Total: 8 instructions", stages: { WB: 1 } },
        { name: "Cycles: 4 + drain", stages: { WB: 1 } },
      ],
      currentCycle: 8,
      stalls: 0,
      hazards: [],
    }, { ipc: 2, speedup: "2x" });

    return steps;
  },
};

// ─── Direct Mapped Cache ────────────────────────────────────────────────────
export const directMappedCacheModule: VisualizationModule<{ cacheSize: number; blockSize: number; accesses: number[] }> = {
  id: "direct-mapped-cache",
  slug: "direct-mapped-cache",
  title: "Direct Mapped Cache",
  category: ["computer-architecture", "cache"],
  difficulty: "intermediate",
  timeComplexity: "O(1)",
  spaceComplexity: "O(n)",
  description: "Direct-mapped cache: each memory address maps to exactly one cache line. Shows tag/index/offset breakdown, hits, and misses.",
  relatedTopics: ["set-associative-cache", "fully-associative-cache", "cache-replacement"],
  pythonCode: `def direct_mapped_cache(cache_size, accesses):
    cache = [None] * cache_size
    hits, misses = 0, 0
    for addr in accesses:
        index = addr % cache_size
        if cache[index] == addr:
            hits += 1
        else:
            cache[index] = addr
            misses += 1
    return hits, misses`,
  codeSteps: [],
  defaultInput: { cacheSize: 8, blockSize: 1, accesses: [0, 4, 0, 1, 4, 2, 5, 3, 6, 3, 0] },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { cacheSize, accesses } = input;
    const cache: (number | null)[] = new Array(cacheSize).fill(null);
    let hits = 0;
    let misses = 0;

    const buildMatrix = () => {
      const header = ["Index", "Valid", "Tag", "Data"];
      const rows = cache.map((v, i) => [
        String(i),
        v !== null ? "1" : "0",
        v !== null ? String(Math.floor(v / cacheSize)) : "-",
        v !== null ? `Addr ${v}` : "-",
      ]);
      return [header, ...rows];
    };

    step(steps, `Direct-mapped cache with ${cacheSize} lines. index = addr % ${cacheSize}.`, {
      type: "table2d",
      matrix: buildMatrix(),
      rowLabels: ["Header", ...cache.map((_, i) => `Line ${i}`)],
      colLabels: ["Index", "Valid", "Tag", "Data"],
      activeCell: null,
      filledCells: [],
      title: "Direct Mapped Cache",
    }, { hits: 0, misses: 0 });

    accesses.forEach((addr, i) => {
      const index = addr % cacheSize;
      const isHit = cache[index] === addr;
      if (isHit) hits++;
      else { misses++; cache[index] = addr; }

      step(steps, `Access addr ${addr}: index=${index}, ${isHit ? "HIT ✓" : "MISS ✗ — load into line " + index}.`, {
        type: "table2d",
        matrix: buildMatrix(),
        rowLabels: ["Header", ...cache.map((_, j) => `Line ${j}`)],
        colLabels: ["Index", "Valid", "Tag", "Data"],
        activeCell: [index + 1, 3],
        filledCells: cache.map((v, j) => v !== null ? [j + 1, 1] : null).filter(Boolean) as number[][],
        title: `Access #${i + 1}: addr=${addr} → ${isHit ? "HIT" : "MISS"}`,
      }, { addr, index, hit: isHit, hits, misses, hitRate: `${Math.round(hits / (i + 1) * 100)}%` });
    });

    return steps;
  },
};

// ─── Set-Associative Cache ──────────────────────────────────────────────────
export const setAssociativeCacheModule: VisualizationModule<{ sets: number; ways: number; accesses: number[] }> = {
  id: "set-associative-cache",
  slug: "set-associative-cache",
  title: "Set-Associative Cache",
  category: ["computer-architecture", "cache"],
  difficulty: "intermediate",
  timeComplexity: "O(ways)",
  spaceComplexity: "O(sets * ways)",
  description: "2-way set-associative cache reduces conflict misses by allowing each address to map to one of 2 ways in a set.",
  relatedTopics: ["direct-mapped-cache", "fully-associative-cache"],
  pythonCode: `def set_associative_cache(sets, ways, accesses):
    cache = [[None]*ways for _ in range(sets)]
    lru = [[0]*ways for _ in range(sets)]
    hits, misses = 0, 0
    for addr in accesses:
        s = addr % sets
        if addr in cache[s]:
            hits += 1
        else:
            misses += 1
            replace = lru[s].index(min(lru[s]))
            cache[s][replace] = addr
    return hits, misses`,
  codeSteps: [],
  defaultInput: { sets: 4, ways: 2, accesses: [0, 4, 0, 2, 4, 1, 5, 3, 4, 1] },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { sets, ways, accesses } = input;
    const cache: (number | null)[][] = Array.from({ length: sets }, () => new Array(ways).fill(null));
    const lruCounter: number[][] = Array.from({ length: sets }, () => new Array(ways).fill(0));
    let hits = 0;
    let misses = 0;
    let time = 0;

    const buildMatrix = () => {
      const header = ["Set", ...Array.from({ length: ways }, (_, w) => `Way ${w}`)];
      const rows = cache.map((row, s) => [String(s), ...row.map((v) => v !== null ? `Addr ${v}` : "-")]);
      return [header, ...rows];
    };

    step(steps, `${ways}-way set-associative cache, ${sets} sets. set = addr % ${sets}.`, {
      type: "table2d",
      matrix: buildMatrix(),
      rowLabels: ["Header", ...Array.from({ length: sets }, (_, i) => `Set ${i}`)],
      colLabels: ["Set", ...Array.from({ length: ways }, (_, w) => `Way ${w}`)],
      activeCell: null,
      filledCells: [],
      title: `${ways}-Way Set-Associative Cache`,
    }, { hits: 0, misses: 0 });

    accesses.forEach((addr, i) => {
      const setIdx = addr % sets;
      time++;
      const wayIdx = cache[setIdx].indexOf(addr);
      const isHit = wayIdx !== -1;

      if (isHit) {
        hits++;
        lruCounter[setIdx][wayIdx] = time;
      } else {
        misses++;
        const replaceWay = lruCounter[setIdx].indexOf(Math.min(...lruCounter[setIdx]));
        cache[setIdx][replaceWay] = addr;
        lruCounter[setIdx][replaceWay] = time;
      }

      step(steps, `Access addr ${addr}: set=${setIdx}, ${isHit ? `HIT in way ${wayIdx} ✓` : `MISS ✗ — LRU replacement in set ${setIdx}`}.`, {
        type: "table2d",
        matrix: buildMatrix(),
        rowLabels: ["Header", ...Array.from({ length: sets }, (_, j) => `Set ${j}`)],
        colLabels: ["Set", ...Array.from({ length: ways }, (_, w) => `Way ${w}`)],
        activeCell: [setIdx + 1, 1],
        filledCells: [],
        title: `Access #${i + 1}: addr=${addr} → ${isHit ? "HIT" : "MISS"}`,
      }, { addr, set: setIdx, hit: isHit, hits, misses, hitRate: `${Math.round(hits / (i + 1) * 100)}%` });
    });

    return steps;
  },
};

// ─── Fully Associative Cache ─────────────────────────────────────────────────
export const fullyAssociativeCacheModule: VisualizationModule<{ capacity: number; accesses: number[] }> = {
  id: "fully-associative-cache",
  slug: "fully-associative-cache",
  title: "Fully Associative Cache",
  category: ["computer-architecture", "cache"],
  difficulty: "intermediate",
  timeComplexity: "O(n)",
  spaceComplexity: "O(capacity)",
  description: "Fully associative cache with LRU replacement. Any address can map to any cache line — no conflict misses.",
  relatedTopics: ["direct-mapped-cache", "set-associative-cache", "cache-replacement"],
  pythonCode: `from collections import OrderedDict
def fully_associative_lru(capacity, accesses):
    cache = OrderedDict()
    hits = 0
    for addr in accesses:
        if addr in cache:
            cache.move_to_end(addr)
            hits += 1
        else:
            if len(cache) == capacity:
                cache.popitem(last=False)
            cache[addr] = True
    return hits`,
  codeSteps: [],
  defaultInput: { capacity: 4, accesses: [1, 2, 3, 4, 1, 5, 2, 6, 3, 1] },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { capacity, accesses } = input;
    const cache: number[] = [];
    let hits = 0;

    const buildCells = () =>
      Array.from({ length: capacity }, (_, i) => ({
        val: cache[i] !== undefined ? cache[i] : "-",
        state: cache[i] !== undefined ? "filled" : "empty",
      }));

    step(steps, `Fully associative LRU cache, capacity=${capacity}. Any address fits any slot.`, {
      type: "array1d",
      cells: buildCells(),
      label: "Cache Lines (LRU order: leftmost = least recently used)",
    }, { hits: 0, misses: 0 });

    accesses.forEach((addr, i) => {
      const idx = cache.indexOf(addr);
      const isHit = idx !== -1;

      if (isHit) {
        hits++;
        cache.splice(idx, 1);
        cache.push(addr);
      } else {
        if (cache.length >= capacity) {
          cache.shift(); // remove LRU
        }
        cache.push(addr);
      }

      step(steps, `Access ${addr}: ${isHit ? "HIT ✓ (move to MRU)" : cache.length > 1 && !isHit && i >= capacity ? `MISS ✗ (evict LRU)` : "MISS ✗ (load)"}. Cache: [${cache.join(", ")}].`, {
        type: "array1d",
        cells: buildCells(),
        label: `After access ${addr} — ${isHit ? "HIT" : "MISS"}`,
      }, { addr, hit: isHit, hits, misses: i + 1 - hits, hitRate: `${Math.round(hits / (i + 1) * 100)}%` });
    });

    return steps;
  },
};

// ─── Cache Replacement ───────────────────────────────────────────────────────
export const cacheReplacementModule: VisualizationModule<{ capacity: number; accesses: number[] }> = {
  id: "cache-replacement",
  slug: "cache-replacement",
  title: "Cache Replacement Policies",
  category: ["computer-architecture", "cache"],
  difficulty: "intermediate",
  timeComplexity: "O(n)",
  spaceComplexity: "O(capacity)",
  description: "Compare LRU, FIFO, and optimal cache replacement policies on the same access sequence.",
  relatedTopics: ["fully-associative-cache", "lru-page", "fifo-page"],
  pythonCode: `def lru(capacity, accesses):
    cache, hits = [], 0
    for a in accesses:
        if a in cache: cache.remove(a); cache.append(a); hits += 1
        else:
            if len(cache) == capacity: cache.pop(0)
            cache.append(a)
    return hits

def fifo(capacity, accesses):
    cache, ptr, hits = [None]*capacity, 0, 0
    for a in accesses:
        if a in cache: hits += 1
        else: cache[ptr % capacity] = a; ptr += 1
    return hits`,
  codeSteps: [],
  defaultInput: { capacity: 3, accesses: [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5] },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { capacity, accesses } = input;

    // LRU simulation
    const lruCache: number[] = [];
    let lruHits = 0;

    // FIFO simulation
    const fifoCache: (number | null)[] = new Array(capacity).fill(null);
    let fifoPtr = 0;
    let fifoHits = 0;

    step(steps, `Comparing LRU vs FIFO replacement, capacity=${capacity}.`, {
      type: "array1d",
      cells: Array.from({ length: capacity }, () => ({ val: "-", state: "empty" })),
      label: "LRU Cache (leftmost=LRU)",
    }, { policy: "LRU vs FIFO", capacity });

    accesses.forEach((addr, i) => {
      // LRU
      const lruIdx = lruCache.indexOf(addr);
      const lruHit = lruIdx !== -1;
      if (lruHit) { lruHits++; lruCache.splice(lruIdx, 1); lruCache.push(addr); }
      else { if (lruCache.length >= capacity) lruCache.shift(); lruCache.push(addr); }

      // FIFO
      const fifoHit = fifoCache.includes(addr);
      if (fifoHit) fifoHits++;
      else { fifoCache[fifoPtr % capacity] = addr; fifoPtr++; }

      step(steps, `Access ${addr} (#${i + 1}): LRU ${lruHit ? "HIT ✓" : "MISS ✗"} → [${lruCache.join(",")}] | FIFO ${fifoHit ? "HIT ✓" : "MISS ✗"} → [${fifoCache.join(",")}].`, {
        type: "array1d",
        cells: Array.from({ length: capacity }, (_, j) => ({
          val: lruCache[j] !== undefined ? lruCache[j] : "-",
          state: lruCache[j] !== undefined ? (lruHit && lruCache[j] === addr ? "active" : "filled") : "empty",
        })),
        label: `LRU: [${lruCache.join(", ")}] | FIFO: [${fifoCache.join(", ")}]`,
      }, {
        addr,
        lruHit,
        fifoHit,
        lruHits,
        fifoHits,
        lruHitRate: `${Math.round(lruHits / (i + 1) * 100)}%`,
        fifoHitRate: `${Math.round(fifoHits / (i + 1) * 100)}%`,
      });
    });

    step(steps, `Final: LRU hits=${lruHits}/${accesses.length} (${Math.round(lruHits / accesses.length * 100)}%), FIFO hits=${fifoHits}/${accesses.length} (${Math.round(fifoHits / accesses.length * 100)}%). LRU typically outperforms FIFO.`, {
      type: "array1d",
      cells: lruCache.map((v) => ({ val: v, state: "sorted" })),
      label: "Final LRU Cache State",
    }, { lruHits, fifoHits, winner: lruHits >= fifoHits ? "LRU" : "FIFO" });

    return steps;
  },
};

// ─── Cache Coherence (MESI) ──────────────────────────────────────────────────
export const cacheCoherenceModule: VisualizationModule<null> = {
  id: "cache-coherence",
  slug: "cache-coherence",
  title: "Cache Coherence (MESI)",
  category: ["computer-architecture", "cache"],
  difficulty: "advanced",
  timeComplexity: "O(1)",
  spaceComplexity: "O(1)",
  description: "MESI cache coherence protocol: Modified, Exclusive, Shared, Invalid states ensure cache consistency in multi-processor systems.",
  relatedTopics: ["memory-hierarchy-viz", "virtual-memory-arch"],
  pythonCode: `# MESI states: M=Modified, E=Exclusive, S=Shared, I=Invalid
# Transitions on bus transactions
states = {"cpu1": "I", "cpu2": "I"}
def bus_read(requester, other):
    if states[other] == "M": writeback(); states[other] = "S"
    elif states[other] == "E": states[other] = "S"
    states[requester] = "S" if states[other] != "I" else "E"`,
  codeSteps: [],
  defaultInput: null,
  generateSteps(_input) {
    const steps: AnimationStep[] = [];
    const lanes = ["CPU1", "Cache1", "Bus", "Cache2", "CPU2"];

    const flowStep = (desc: string, from: string, to: string, label: string, color: string, vars: Record<string, unknown>) => {
      step(steps, desc, {
        type: "flowdiagram",
        lanes,
        steps: [{ from, to, label, color }],
        activeStep: 0,
        completedSteps: [],
      }, vars);
    };

    step(steps, "MESI Protocol: M=Modified, E=Exclusive, S=Shared, I=Invalid. Both caches start Invalid.", {
      type: "flowdiagram",
      lanes,
      steps: [],
      activeStep: -1,
      completedSteps: [],
    }, { cpu1: "I", cpu2: "I" });

    flowStep("CPU1 reads address X. Cache1 is Invalid → BusRead.", "CPU1", "Bus", "BusRead(X)", "#6366f1", { cpu1: "I→E", cpu2: "I" });
    flowStep("No other cache has X. Memory supplies data. Cache1 → Exclusive state.", "Bus", "Cache1", "Data(X)", "#22c55e", { cpu1: "E", cpu2: "I" });
    flowStep("CPU2 reads address X. Cache2 is Invalid → BusRead.", "CPU2", "Bus", "BusRead(X)", "#6366f1", { cpu1: "E", cpu2: "I" });
    flowStep("Cache1 sees BusRead: E→S (downgrade). Cache2 also → Shared.", "Cache1", "Bus", "Shared(X)", "#f59e0b", { cpu1: "E→S", cpu2: "I→S" });
    flowStep("Both caches now in Shared state. Both can read simultaneously.", "Bus", "Cache2", "Data(X)", "#22c55e", { cpu1: "S", cpu2: "S" });
    flowStep("CPU1 writes to X. BusUpgrade broadcast: other caches must invalidate.", "CPU1", "Bus", "BusUpgrade(X)", "#ef4444", { cpu1: "S→M", cpu2: "S" });
    flowStep("Cache2 sees BusUpgrade: S→Invalid. Cache1 → Modified.", "Bus", "Cache2", "Invalidate(X)", "#ef4444", { cpu1: "M", cpu2: "S→I" });
    flowStep("CPU1 has exclusive Modified copy. CPU2 reads X again → BusRead.", "CPU2", "Bus", "BusRead(X)", "#6366f1", { cpu1: "M", cpu2: "I" });
    flowStep("Cache1 (Modified) must write back to memory before sharing.", "Cache1", "Bus", "Writeback(X)", "#f59e0b", { cpu1: "M→S", cpu2: "I" });
    flowStep("After writeback, both caches re-enter Shared state. Memory is up to date.", "Bus", "Cache2", "Data(X)", "#22c55e", { cpu1: "S", cpu2: "S", memoryUpdated: true });

    return steps;
  },
};

// ─── Memory Hierarchy ────────────────────────────────────────────────────────
export const memoryHierarchyVizModule: VisualizationModule<null> = {
  id: "memory-hierarchy-viz",
  slug: "memory-hierarchy-viz",
  title: "Memory Hierarchy",
  category: ["computer-architecture", "memory-hierarchy"],
  difficulty: "beginner",
  timeComplexity: "O(1)",
  spaceComplexity: "O(1)",
  description: "Memory hierarchy from registers to disk. Each level trades capacity for speed.",
  relatedTopics: ["tlb", "virtual-memory-arch", "direct-mapped-cache"],
  pythonCode: `memory_hierarchy = [
    {"level": "Registers", "size": "~1KB", "latency": "1 cycle"},
    {"level": "L1 Cache",  "size": "32KB", "latency": "4 cycles"},
    {"level": "L2 Cache",  "size": "256KB","latency": "12 cycles"},
    {"level": "L3 Cache",  "size": "8MB",  "latency": "40 cycles"},
    {"level": "RAM",       "size": "16GB", "latency": "200 cycles"},
    {"level": "SSD",       "size": "1TB",  "latency": "100K cycles"},
    {"level": "HDD",       "size": "10TB", "latency": "10M cycles"},
]`,
  codeSteps: [],
  defaultInput: null,
  generateSteps(_input) {
    const steps: AnimationStep[] = [];
    const levels = [
      { name: "Registers", size: "~1 KB", latency: "1 cycle", bandwidth: "1 TB/s" },
      { name: "L1 Cache", size: "32 KB", latency: "4 cycles", bandwidth: "200 GB/s" },
      { name: "L2 Cache", size: "256 KB", latency: "12 cycles", bandwidth: "100 GB/s" },
      { name: "L3 Cache", size: "8 MB", latency: "40 cycles", bandwidth: "50 GB/s" },
      { name: "RAM", size: "16 GB", latency: "200 cycles", bandwidth: "25 GB/s" },
      { name: "SSD", size: "1 TB", latency: "100K cycles", bandwidth: "3 GB/s" },
      { name: "HDD", size: "10 TB", latency: "10M cycles", bandwidth: "0.1 GB/s" },
    ];

    step(steps, "Memory hierarchy: faster levels are smaller and closer to the CPU.", {
      type: "array1d",
      cells: levels.map((l) => ({ val: l.name, state: "empty" })),
      label: "Memory Hierarchy (fast → slow, small → large)",
    }, {});

    levels.forEach((level, i) => {
      step(steps, `${level.name}: size=${level.size}, latency=${level.latency}, bandwidth=${level.bandwidth}.`, {
        type: "array1d",
        cells: levels.map((l, j) => ({
          val: l.name,
          state: j < i ? "sorted" : j === i ? "active" : "empty",
        })),
        label: `${level.name} — ${level.size} @ ${level.latency}`,
      }, { level: level.name, size: level.size, latency: level.latency, bandwidth: level.bandwidth });
    });

    step(steps, "Principle of locality: temporal (reuse same data) and spatial (access nearby data) help caches work efficiently.", {
      type: "array1d",
      cells: levels.map((l) => ({ val: l.name, state: "sorted" })),
      label: "Full hierarchy — CPU accesses L1 first, falls through on miss",
    }, { principle: "locality", temporal: "reuse same addr", spatial: "nearby addrs" });

    return steps;
  },
};

// ─── Virtual Memory (Architecture) ──────────────────────────────────────────
export const virtualMemoryArchModule: VisualizationModule<{ virtualAddr: number; pageSize: number }> = {
  id: "virtual-memory-arch",
  slug: "virtual-memory-arch",
  title: "Virtual Memory",
  category: ["computer-architecture", "memory-hierarchy"],
  difficulty: "intermediate",
  timeComplexity: "O(1)",
  spaceComplexity: "O(n)",
  description: "Virtual memory page table walk: VA→TLB→Page Table→PA.",
  relatedTopics: ["tlb", "memory-hierarchy-viz"],
  pythonCode: `def translate(va, page_size, page_table, tlb):
    vpn = va // page_size
    offset = va % page_size
    if vpn in tlb:
        pfn = tlb[vpn]  # TLB hit
    else:
        pfn = page_table[vpn]  # TLB miss → page table walk
        tlb[vpn] = pfn
    return pfn * page_size + offset`,
  codeSteps: [],
  defaultInput: { virtualAddr: 0x1234, pageSize: 256 },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { virtualAddr, pageSize } = input;
    const vpn = Math.floor(virtualAddr / pageSize);
    const offset = virtualAddr % pageSize;
    const pfn = vpn + 0x10; // simulated mapping
    const pa = pfn * pageSize + offset;
    const lanes = ["VA", "TLB", "Page Table", "PA", "Physical RAM"];

    step(steps, `Virtual address 0x${virtualAddr.toString(16).toUpperCase()} needs translation. Page size = ${pageSize} bytes.`, {
      type: "flowdiagram",
      lanes,
      steps: [],
      activeStep: -1,
      completedSteps: [],
    }, { va: `0x${virtualAddr.toString(16).toUpperCase()}`, pageSize });

    step(steps, `Split VA: VPN = ${vpn} (addr / pageSize), offset = 0x${offset.toString(16)} (addr % pageSize).`, {
      type: "flowdiagram",
      lanes,
      steps: [{ from: "VA", to: "TLB", label: `VPN=${vpn}, offset=0x${offset.toString(16)}`, color: "#6366f1" }],
      activeStep: 0,
      completedSteps: [],
    }, { vpn, offset: `0x${offset.toString(16)}` });

    step(steps, `TLB lookup for VPN=${vpn}. Assume TLB miss (cold start).`, {
      type: "flowdiagram",
      lanes,
      steps: [
        { from: "VA", to: "TLB", label: `VPN=${vpn}`, color: "#6366f1" },
        { from: "TLB", to: "Page Table", label: "TLB Miss → walk", color: "#ef4444" },
      ],
      activeStep: 1,
      completedSteps: [0],
    }, { tlbMiss: true, vpn });

    step(steps, `Page Table walk: VPN=${vpn} → PFN=${pfn}. Load entry into TLB.`, {
      type: "flowdiagram",
      lanes,
      steps: [
        { from: "VA", to: "TLB", label: `VPN=${vpn}`, color: "#6366f1" },
        { from: "TLB", to: "Page Table", label: "TLB Miss", color: "#ef4444" },
        { from: "Page Table", to: "TLB", label: `PFN=${pfn}`, color: "#22c55e" },
      ],
      activeStep: 2,
      completedSteps: [0, 1],
    }, { vpn, pfn, tlbUpdated: true });

    step(steps, `Physical address = PFN * pageSize + offset = ${pfn} * ${pageSize} + ${offset} = 0x${pa.toString(16).toUpperCase()}.`, {
      type: "flowdiagram",
      lanes,
      steps: [
        { from: "VA", to: "TLB", label: `VPN=${vpn}`, color: "#6366f1" },
        { from: "TLB", to: "Page Table", label: "TLB Miss", color: "#ef4444" },
        { from: "Page Table", to: "PA", label: `PA=0x${pa.toString(16).toUpperCase()}`, color: "#22c55e" },
        { from: "PA", to: "Physical RAM", label: "Memory Access", color: "#22c55e" },
      ],
      activeStep: 3,
      completedSteps: [0, 1, 2],
    }, { pa: `0x${pa.toString(16).toUpperCase()}`, pfn, offset });

    step(steps, `On next access to same page: TLB hit! No page table walk needed — 1 cycle vs ~100 cycles.`, {
      type: "flowdiagram",
      lanes,
      steps: [
        { from: "VA", to: "TLB", label: `VPN=${vpn}`, color: "#6366f1" },
        { from: "TLB", to: "PA", label: `TLB Hit! PFN=${pfn}`, color: "#22c55e" },
        { from: "PA", to: "Physical RAM", label: "Fast access", color: "#22c55e" },
      ],
      activeStep: 1,
      completedSteps: [0],
    }, { tlbHit: true, speedup: "~100x faster" });

    return steps;
  },
};

// ─── TLB ─────────────────────────────────────────────────────────────────────
export const tlbModule: VisualizationModule<{ accesses: number[] }> = {
  id: "tlb",
  slug: "tlb",
  title: "TLB",
  category: ["computer-architecture", "memory-hierarchy"],
  difficulty: "intermediate",
  timeComplexity: "O(1)",
  spaceComplexity: "O(n)",
  description: "Translation Lookaside Buffer: a fast cache for page table entries. Shows VPN→PFN mappings and hit/miss behavior.",
  relatedTopics: ["virtual-memory-arch", "memory-hierarchy-viz"],
  pythonCode: `class TLB:
    def __init__(self, size):
        self.entries = {}  # vpn -> pfn
        self.size = size
    def lookup(self, vpn):
        return self.entries.get(vpn)  # None = miss
    def insert(self, vpn, pfn):
        if len(self.entries) >= self.size:
            self.entries.pop(next(iter(self.entries)))
        self.entries[vpn] = pfn`,
  codeSteps: [],
  defaultInput: { accesses: [0x100, 0x200, 0x100, 0x300, 0x200, 0x400] },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const pageSize = 256;
    const tlbSize = 4;
    const tlb: { vpn: number; pfn: number; valid: boolean }[] = [];
    let hits = 0;

    const buildMatrix = () => {
      const header = ["Entry", "Valid", "VPN", "PFN"];
      const rows = Array.from({ length: tlbSize }, (_, i) => {
        const e = tlb[i];
        return e ? [String(i), "1", `0x${e.vpn.toString(16)}`, `0x${e.pfn.toString(16)}`] : [String(i), "0", "-", "-"];
      });
      return [header, ...rows];
    };

    step(steps, `TLB with ${tlbSize} entries. Maps VPN→PFN for fast address translation.`, {
      type: "table2d",
      matrix: buildMatrix(),
      rowLabels: ["Header", ...Array.from({ length: tlbSize }, (_, i) => `Entry ${i}`)],
      colLabels: ["Entry", "Valid", "VPN", "PFN"],
      activeCell: null,
      filledCells: [],
      title: "TLB — Translation Lookaside Buffer",
    }, { tlbSize, hits: 0, misses: 0 });

    input.accesses.forEach((addr, i) => {
      const vpn = Math.floor(addr / pageSize);
      const pfn = vpn + 0x10;
      const existing = tlb.find((e) => e.vpn === vpn);
      const isHit = !!existing;

      if (isHit) {
        hits++;
      } else {
        if (tlb.length >= tlbSize) tlb.shift();
        tlb.push({ vpn, pfn, valid: true });
      }

      step(steps, `Access 0x${addr.toString(16)}: VPN=0x${vpn.toString(16)}, ${isHit ? `TLB HIT ✓ → PFN=0x${pfn.toString(16)}` : `TLB MISS ✗ → load PFN=0x${pfn.toString(16)} into TLB`}.`, {
        type: "table2d",
        matrix: buildMatrix(),
        rowLabels: ["Header", ...Array.from({ length: tlbSize }, (_, j) => `Entry ${j}`)],
        colLabels: ["Entry", "Valid", "VPN", "PFN"],
        activeCell: isHit ? [tlb.findIndex((e) => e.vpn === vpn) + 1, 2] : [tlb.length, 2],
        filledCells: [],
        title: `Access 0x${addr.toString(16)} → ${isHit ? "TLB HIT" : "TLB MISS"}`,
      }, { addr: `0x${addr.toString(16)}`, vpn: `0x${vpn.toString(16)}`, pfn: `0x${pfn.toString(16)}`, hit: isHit, hits, misses: i + 1 - hits });
    });

    return steps;
  },
};

// ─── DMA ─────────────────────────────────────────────────────────────────────
export const dmaModule: VisualizationModule<null> = {
  id: "dma",
  slug: "dma",
  title: "DMA",
  category: ["computer-architecture", "io-systems"],
  difficulty: "intermediate",
  timeComplexity: "O(1)",
  spaceComplexity: "O(1)",
  description: "DMA transfer: CPU programs the DMA controller, then continues other work while DMA moves data between I/O device and memory.",
  relatedTopics: ["interrupts", "buses", "memory-hierarchy-viz"],
  pythonCode: `# DMA Transfer sequence
# 1. CPU programs DMA controller (source, dest, size)
# 2. CPU resumes other work
# 3. DMA controller handles data transfer
# 4. DMA raises interrupt when done
# 5. CPU processes interrupt, uses transferred data`,
  codeSteps: [],
  defaultInput: null,
  generateSteps(_input) {
    const steps: AnimationStep[] = [];
    const lanes = ["CPU", "DMA Controller", "Memory", "I/O Device"];

    const s = (desc: string, from: string, to: string, label: string, color: string, active: number, completed: number[], vars: Record<string, unknown>) => {
      step(steps, desc, {
        type: "flowdiagram",
        lanes,
        steps: [{ from, to, label, color }],
        activeStep: active,
        completedSteps: completed,
      }, vars);
    };

    step(steps, "DMA: Direct Memory Access lets I/O devices transfer data without CPU involvement.", {
      type: "flowdiagram", lanes, steps: [], activeStep: -1, completedSteps: [],
    }, { phase: "init" });

    s("CPU programs DMA controller: source address (I/O port), destination (memory), transfer size.", "CPU", "DMA Controller", "Program(src, dst, size)", "#6366f1", 0, [], { phase: "program", src: "I/O port 0x300", dst: "0x1000", size: "4KB" });
    s("CPU issues start command to DMA controller.", "CPU", "DMA Controller", "Start Transfer", "#22c55e", 0, [], { phase: "start" });
    s("CPU resumes normal execution (computation, etc.) — no busy-waiting.", "CPU", "DMA Controller", "CPU continues work →", "#94a3b8", 0, [], { phase: "cpu_working", cpuBusy: false });
    s("DMA controller requests bus from arbiter.", "DMA Controller", "Memory", "Bus Request", "#f59e0b", 0, [], { phase: "bus_req" });
    s("DMA controller reads data from I/O device.", "DMA Controller", "I/O Device", "Read Data", "#6366f1", 0, [], { phase: "io_read" });
    s("DMA writes data directly to memory — CPU not involved.", "DMA Controller", "Memory", "DMA Write(data)", "#22c55e", 0, [], { phase: "mem_write", bytes: "4KB transferred" });
    s("DMA transfer continues: cycle stealing — DMA borrows bus cycles from CPU.", "DMA Controller", "Memory", "Cycle Steal x4096", "#f59e0b", 0, [], { phase: "cycle_steal" });
    s("DMA transfer complete. DMA raises interrupt to notify CPU.", "DMA Controller", "CPU", "Interrupt (IRQ)", "#ef4444", 0, [], { phase: "interrupt" });
    s("CPU handles interrupt: acknowledges, processes transferred data.", "CPU", "Memory", "Read transferred data", "#22c55e", 0, [], { phase: "done", efficiency: "CPU free during transfer" });

    return steps;
  },
};

// ─── Interrupts ──────────────────────────────────────────────────────────────
export const interruptsModule: VisualizationModule<null> = {
  id: "interrupts",
  slug: "interrupts",
  title: "Interrupts",
  category: ["computer-architecture", "io-systems"],
  difficulty: "intermediate",
  timeComplexity: "O(1)",
  spaceComplexity: "O(1)",
  description: "Interrupt handling: device raises IRQ, CPU saves state, jumps to ISR, returns to interrupted program.",
  relatedTopics: ["dma", "buses"],
  pythonCode: `# Interrupt handling
def cpu_mainloop():
    while True:
        execute_current_instruction()
        if interrupt_pending():
            save_state()       # push PC, flags to stack
            pc = ivt[irq_num]  # jump to ISR via IVT
            execute_isr()
            restore_state()    # pop PC, flags`,
  codeSteps: [],
  defaultInput: null,
  generateSteps(_input) {
    const steps: AnimationStep[] = [];
    const lanes = ["CPU", "Interrupt Controller", "Device", "ISR"];

    const s = (desc: string, from: string, to: string, label: string, color: string, vars: Record<string, unknown>) => {
      step(steps, desc, {
        type: "flowdiagram",
        lanes,
        steps: [{ from, to, label, color }],
        activeStep: 0,
        completedSteps: [],
      }, vars);
    };

    step(steps, "Interrupt handling: devices signal CPU asynchronously via IRQ lines.", {
      type: "flowdiagram", lanes, steps: [], activeStep: -1, completedSteps: [],
    }, { phase: "normal execution" });

    s("Device completes I/O (e.g., disk read done). Raises IRQ on interrupt line.", "Device", "Interrupt Controller", "IRQ signal", "#ef4444", { phase: "irq_raised" });
    s("Interrupt controller prioritizes IRQs. Forwards highest-priority interrupt to CPU.", "Interrupt Controller", "CPU", "INT (IRQ 14)", "#ef4444", { irq: 14, priority: "high" });
    s("CPU finishes current instruction (atomic). Acknowledges interrupt.", "CPU", "Interrupt Controller", "INTA (acknowledge)", "#f59e0b", { phase: "ack" });
    s("CPU saves context: pushes PC, flags, registers onto stack.", "CPU", "ISR", "Save state (push stack)", "#6366f1", { phase: "save_state", savedPC: "0x4A30" });
    s("CPU looks up ISR address in Interrupt Vector Table (IVT).", "CPU", "ISR", "IVT lookup → ISR addr", "#6366f1", { phase: "ivt_lookup", isrAddr: "0xFF00" });
    s("CPU jumps to ISR. ISR handles device (e.g., reads data, clears IRQ).", "CPU", "ISR", "Jump to ISR", "#22c55e", { phase: "isr_executing" });
    s("ISR communicates with device to clear the interrupt.", "ISR", "Device", "Clear IRQ", "#22c55e", { phase: "clear_irq" });
    s("ISR completes. CPU restores saved context from stack.", "ISR", "CPU", "IRET (restore state)", "#6366f1", { phase: "restore_state" });
    s("CPU resumes interrupted program exactly where it left off.", "CPU", "ISR", "Resume at 0x4A30", "#22c55e", { phase: "resumed", transparency: "interrupt transparent to program" });

    return steps;
  },
};

// ─── Buses ───────────────────────────────────────────────────────────────────
export const busesModule: VisualizationModule<null> = {
  id: "buses",
  slug: "buses",
  title: "Bus Architecture",
  category: ["computer-architecture", "io-systems"],
  difficulty: "beginner",
  timeComplexity: "O(1)",
  spaceComplexity: "O(1)",
  description: "Bus arbitration: devices request the bus, arbiter grants access, data transfer occurs, bus released.",
  relatedTopics: ["dma", "interrupts"],
  pythonCode: `# Bus arbitration (daisy chain)
class BusArbiter:
    def arbitrate(self, requests):
        for device in requests:
            if device.request:
                device.grant = True
                yield device  # device gets bus
                device.grant = False`,
  codeSteps: [],
  defaultInput: null,
  generateSteps(_input) {
    const steps: AnimationStep[] = [];
    const lanes = ["Device A", "Bus Arbiter", "Device B", "Memory"];

    const s = (desc: string, from: string, to: string, label: string, color: string, vars: Record<string, unknown>) => {
      step(steps, desc, {
        type: "flowdiagram",
        lanes,
        steps: [{ from, to, label, color }],
        activeStep: 0,
        completedSteps: [],
      }, vars);
    };

    step(steps, "Bus: shared communication channel. Arbiter controls who gets access.", {
      type: "flowdiagram", lanes, steps: [], activeStep: -1, completedSteps: [],
    }, { phase: "idle" });

    s("Device A needs to transfer data — asserts BR (Bus Request) line.", "Device A", "Bus Arbiter", "BR (Bus Request)", "#6366f1", { requester: "Device A" });
    s("Device B also requests bus simultaneously.", "Device B", "Bus Arbiter", "BR (Bus Request)", "#6366f1", { requester: "Device B", conflict: true });
    s("Arbiter uses priority scheme: Device A has higher priority — grants BG to Device A.", "Bus Arbiter", "Device A", "BG (Bus Grant)", "#22c55e", { granted: "Device A", denied: "Device B" });
    s("Device A asserts BBSY (Bus Busy) — takes ownership of bus.", "Device A", "Bus Arbiter", "BBSY (Bus Busy)", "#f59e0b", { busOwner: "Device A" });
    s("Device A places address + data on bus lines.", "Device A", "Memory", "Address + Data", "#22c55e", { phase: "transfer", addr: "0x8000", data: "0xDEAD" });
    s("Memory acknowledges receipt. Transfer complete.", "Memory", "Device A", "ACK", "#22c55e", { phase: "ack" });
    s("Device A releases BBSY — bus is free again.", "Device A", "Bus Arbiter", "Release BBSY", "#94a3b8", { busOwner: null });
    s("Arbiter now grants bus to Device B (next in queue).", "Bus Arbiter", "Device B", "BG (Bus Grant)", "#22c55e", { granted: "Device B" });
    s("Device B completes its transfer to Memory.", "Device B", "Memory", "Address + Data", "#22c55e", { phase: "device_b_transfer" });
    s("Bus returns to idle. Both devices have completed transfers.", "Bus Arbiter", "Memory", "Bus Idle", "#94a3b8", { phase: "idle", completed: ["Device A", "Device B"] });

    return steps;
  },
};
