import type { AnimationStep, VisualizationModule } from "@/types/visualization";

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════ */

interface Process {
  name: string;
  arrival: number;
  burst: number;
  priority?: number;
  color?: string;
}

const COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6"];

function ganttStep(
  steps: AnimationStep[],
  desc: string,
  processes: {name:string;color:string}[],
  timeline: {processName:string;start:number;end:number}[],
  currentTime: number,
  maxTime: number,
  vars: Record<string,unknown> = {},
): void {
  steps.push({
    stepNumber: steps.length + 1,
    description: desc,
    highlightLines: [],
    visualState: { type:"gantt", processes, timeline, currentTime, maxTime },
    variables: vars,
  });
}

function array1dStep(
  steps: AnimationStep[],
  desc: string,
  cells: {val:string|number;state:string}[],
  label: string,
  vars: Record<string,unknown> = {},
  pointers: {index:number;label:string}[] = [],
): void {
  steps.push({
    stepNumber: steps.length + 1,
    description: desc,
    highlightLines: [],
    visualState: { type:"array1d", cells, label, pointer: pointers },
    variables: vars,
  });
}

function table2dStep(
  steps: AnimationStep[],
  desc: string,
  matrix: unknown[][],
  rowLabels: string[],
  colLabels: string[],
  title: string,
  activeCell: [number,number]|null = null,
  filledCells: [number,number][] = [],
  vars: Record<string,unknown> = {},
): void {
  steps.push({
    stepNumber: steps.length + 1,
    description: desc,
    highlightLines: [],
    visualState: { type:"table2d", matrix, rowLabels, colLabels, title, activeCell, filledCells },
    variables: vars,
  });
}

interface FlowStepDef {
  from: string; to: string; label: string; color?: string;
  description: string; lines: number[]; variables?: Record<string,unknown>;
}

function buildFlowSteps(lanes: string[], defs: FlowStepDef[]): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const completed: number[] = [];
  const allSteps = defs.map(s => ({ from: s.from, to: s.to, label: s.label, color: s.color }));

  steps.push({
    stepNumber: 1, description: `Ready. Lanes: ${lanes.join(" | ")}`,
    highlightLines: [],
    visualState: { type:"flowdiagram", lanes, steps: allSteps, activeStep: -1, completedSteps: [] },
    variables: {},
  });

  for (let i = 0; i < defs.length; i++) {
    const d = defs[i];
    steps.push({
      stepNumber: steps.length + 1, description: d.description,
      highlightLines: d.lines,
      visualState: { type:"flowdiagram", lanes, steps: allSteps, activeStep: i, completedSteps: [...completed] },
      variables: d.variables ?? {},
    });
    completed.push(i);
    steps.push({
      stepNumber: steps.length + 1, description: `${d.label} — done.`,
      highlightLines: d.lines,
      visualState: { type:"flowdiagram", lanes, steps: allSteps, activeStep: -1, completedSteps: [...completed] },
      variables: d.variables ?? {},
    });
  }
  return steps;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SRTF
═══════════════════════════════════════════════════════════════════════════ */

const srtfCode = `def srtf(processes):
    time = 0
    remaining = {p['name']: p['burst'] for p in processes}
    done = set()
    prev = None
    while len(done) < len(processes):
        available = [p for p in processes
                     if p['arrival'] <= time and p['name'] not in done]
        if not available:
            time += 1; continue
        cur = min(available, key=lambda p: remaining[p['name']])
        remaining[cur['name']] -= 1
        time += 1
        if remaining[cur['name']] == 0:
            done.add(cur['name'])`;

type SrtfInput = {name:string;arrival:number;burst:number}[];

export const srtfModule: VisualizationModule<SrtfInput> = {
  id: "srtf", slug: "srtf", title: "SRTF Scheduling",
  category: ["os","process-scheduling"], difficulty: "intermediate",
  timeComplexity: "O(n²)", spaceComplexity: "O(n)",
  description: "Shortest Remaining Time First — preemptive version of SJF. Always runs the process with the least remaining burst time.",
  relatedTopics: ["sjf","round-robin","priority-scheduling"],
  pythonCode: srtfCode, codeSteps: [],
  defaultInput: [
    {name:"P1",arrival:0,burst:8},{name:"P2",arrival:1,burst:4},
    {name:"P3",arrival:2,burst:9},{name:"P4",arrival:3,burst:5},
  ],
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const procs = input.map((p,i) => ({ ...p, color: COLORS[i % COLORS.length] }));
    const procMap = new Map(procs.map(p => [p.name,p]));
    const colors = procs.map(p => ({ name: p.name, color: p.color }));
    const remaining = new Map(procs.map(p => [p.name, p.burst]));
    const done = new Set<string>();
    const timeline: {processName:string;start:number;end:number}[] = [];
    let time = 0;
    const maxTime = procs.reduce((s,p) => s + p.burst, 0) + 2;

    ganttStep(steps, "SRTF: start. Will always pick process with shortest remaining time.", colors, [], 0, maxTime, { time: 0 });

    let prevName: string|null = null;
    let segStart = 0;

    while (done.size < procs.length && time < maxTime) {
      const available = procs.filter(p => p.arrival <= time && !done.has(p.name));
      if (available.length === 0) { time++; continue; }
      const cur = available.reduce((a,b) => (remaining.get(a.name)! <= remaining.get(b.name)! ? a : b));

      if (cur.name !== prevName) {
        if (prevName !== null) {
          timeline.push({ processName: prevName, start: segStart, end: time });
          ganttStep(steps, `Preempt ${prevName} → run ${cur.name} (remaining=${remaining.get(cur.name)}).`, colors, [...timeline], time, maxTime, { running: cur.name, remaining: Object.fromEntries(remaining) });
        } else {
          ganttStep(steps, `Start running ${cur.name} at t=${time} (remaining=${remaining.get(cur.name)}).`, colors, [...timeline], time, maxTime, { running: cur.name });
        }
        segStart = time;
        prevName = cur.name;
      }

      remaining.set(cur.name, remaining.get(cur.name)! - 1);
      time++;

      if (remaining.get(cur.name) === 0) {
        done.add(cur.name);
        timeline.push({ processName: cur.name, start: segStart, end: time });
        ganttStep(steps, `${cur.name} finished at t=${time}.`, colors, [...timeline], time, maxTime, { finished: cur.name, time });
        prevName = null;
        segStart = time;
      }
    }

    ganttStep(steps, "SRTF complete. All processes scheduled.", colors, [...timeline], time, maxTime, { done: true });
    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   PRIORITY SCHEDULING
═══════════════════════════════════════════════════════════════════════════ */

const priorityCode = `def priority_scheduling(processes):
    time = 0; done = []
    ready = []
    remaining = list(processes)
    while remaining or ready:
        # Move arrived processes to ready queue
        new = [p for p in remaining if p['arrival'] <= time]
        for p in new: remaining.remove(p); ready.append(p)
        if not ready:
            time += 1; continue
        # Pick highest priority (lowest number)
        cur = min(ready, key=lambda p: p['priority'])
        ready.remove(cur)
        time += cur['burst']
        done.append((cur['name'], time))
    return done`;

type PriorityInput = {name:string;arrival:number;burst:number;priority:number}[];

export const prioritySchedulingModule: VisualizationModule<PriorityInput> = {
  id: "priority-scheduling", slug: "priority-scheduling", title: "Priority Scheduling",
  category: ["os","process-scheduling"], difficulty: "intermediate",
  timeComplexity: "O(n²)", spaceComplexity: "O(n)",
  description: "Non-preemptive priority scheduling. Lower number = higher priority. Ready processes are sorted by priority; highest-priority runs to completion.",
  relatedTopics: ["srtf","round-robin","multilevel-queue"],
  pythonCode: priorityCode, codeSteps: [],
  defaultInput: [
    {name:"P1",arrival:0,burst:10,priority:3},{name:"P2",arrival:1,burst:1,priority:1},
    {name:"P3",arrival:2,burst:2,priority:4},{name:"P4",arrival:3,burst:1,priority:5},
    {name:"P5",arrival:4,burst:5,priority:2},
  ],
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const procs = input.map((p,i) => ({ ...p, color: COLORS[i % COLORS.length] }));
    const colors = procs.map(p => ({ name: p.name, color: p.color }));
    const maxTime = procs.reduce((s,p) => s + p.burst, 0) + 2;
    const timeline: {processName:string;start:number;end:number}[] = [];
    let remaining = [...procs];
    const ready: typeof procs = [];
    let time = 0;

    ganttStep(steps, "Priority Scheduling start. Lower priority number = higher priority.", colors, [], 0, maxTime);

    while (remaining.length > 0 || ready.length > 0) {
      const arrived = remaining.filter(p => p.arrival <= time);
      arrived.forEach(p => { remaining = remaining.filter(r => r.name !== p.name); ready.push(p); });

      if (ready.length === 0) { time++; continue; }

      ready.sort((a,b) => a.priority! - b.priority!);
      const cur = ready.shift()!;

      ganttStep(steps, `Pick ${cur.name} (priority=${cur.priority}, burst=${cur.burst}). Ready: [${ready.map(p=>p.name).join(",")}]`, colors, [...timeline], time, maxTime, { running: cur.name, priority: cur.priority });

      timeline.push({ processName: cur.name, start: time, end: time + cur.burst });
      time += cur.burst;

      ganttStep(steps, `${cur.name} completes at t=${time}.`, colors, [...timeline], time, maxTime, { finished: cur.name });
    }

    ganttStep(steps, "Priority scheduling complete.", colors, [...timeline], time, maxTime, { done: true });
    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   MULTILEVEL QUEUE
═══════════════════════════════════════════════════════════════════════════ */

const mlqCode = `# Multilevel Queue Scheduling
# Queue 0 (System): Round Robin, quantum=2
# Queue 1 (User): FCFS
# System queue always has priority over user queue

def mlq(system_procs, user_procs, quantum=2):
    time = 0
    gantt = []
    # Run system queue with RR
    sys_q = list(system_procs)
    while sys_q:
        p = sys_q.pop(0)
        run = min(p['remaining'], quantum)
        gantt.append((p['name'], time, time+run))
        time += run; p['remaining'] -= run
        if p['remaining'] > 0: sys_q.append(p)
    # Then run user queue FCFS
    for p in user_procs:
        gantt.append((p['name'], time, time+p['burst']))
        time += p['burst']
    return gantt`;

type MlqInput = { system: {name:string;burst:number}[]; user: {name:string;burst:number}[] };

export const multilevelQueueModule: VisualizationModule<MlqInput> = {
  id: "multilevel-queue", slug: "multilevel-queue", title: "Multilevel Queue",
  category: ["os","process-scheduling"], difficulty: "intermediate",
  timeComplexity: "O(n)", spaceComplexity: "O(n)",
  description: "Two-level queue: System processes (RR q=2) have absolute priority over User processes (FCFS).",
  relatedTopics: ["round-robin","multilevel-feedback","priority-scheduling"],
  pythonCode: mlqCode, codeSteps: [],
  defaultInput: {
    system: [{name:"S1",burst:4},{name:"S2",burst:3}],
    user: [{name:"U1",burst:5},{name:"U2",burst:6},{name:"U3",burst:2}],
  },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const allProcs = [
      ...input.system.map((p,i) => ({ ...p, color: COLORS[i % COLORS.length], queue: "System" })),
      ...input.user.map((p,i) => ({ ...p, color: COLORS[(i+2) % COLORS.length], queue: "User" })),
    ];
    const colors = allProcs.map(p => ({ name: p.name, color: p.color }));
    const maxTime = allProcs.reduce((s,p) => s + p.burst, 0) + 2;
    const timeline: {processName:string;start:number;end:number}[] = [];
    const quantum = 2;
    let time = 0;

    ganttStep(steps, "Multilevel Queue: System (RR q=2) runs first, then User (FCFS).", colors, [], 0, maxTime);

    // System queue RR
    const sysQ = input.system.map(p => ({ name: p.name, remaining: p.burst }));
    ganttStep(steps, "Phase 1: Running System queue with Round Robin (quantum=2).", colors, [...timeline], time, maxTime);
    while (sysQ.length > 0) {
      const p = sysQ.shift()!;
      const run = Math.min(p.remaining, quantum);
      timeline.push({ processName: p.name, start: time, end: time + run });
      ganttStep(steps, `System RR: run ${p.name} for ${run} units (remaining=${p.remaining-run}).`, colors, [...timeline], time + run, maxTime, { running: p.name, remaining: p.remaining - run });
      time += run;
      p.remaining -= run;
      if (p.remaining > 0) sysQ.push(p);
    }

    // User queue FCFS
    ganttStep(steps, "Phase 2: System queue empty. Running User queue (FCFS).", colors, [...timeline], time, maxTime);
    for (const p of input.user) {
      timeline.push({ processName: p.name, start: time, end: time + p.burst });
      ganttStep(steps, `User FCFS: run ${p.name} for ${p.burst} units.`, colors, [...timeline], time + p.burst, maxTime, { running: p.name });
      time += p.burst;
    }

    ganttStep(steps, "Multilevel Queue complete.", colors, [...timeline], time, maxTime, { done: true });
    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   MULTILEVEL FEEDBACK QUEUE
═══════════════════════════════════════════════════════════════════════════ */

const mlfqCode = `# MLFQ — 3 queues: Q0(q=2), Q1(q=4), Q2(FCFS)
# New process starts at Q0
# If uses full quantum → demote to next queue
# Q0 has highest priority

def mlfq(processes):
    queues = [[], [], []]  # Q0, Q1, Q2
    remaining = {p['name']: p['burst'] for p in processes}
    for p in processes: queues[0].append(p['name'])
    time = 0; gantt = []
    quantums = [2, 4, float('inf')]
    while any(queues):
        for qi, q in enumerate(queues):
            if not q: continue
            name = q.pop(0)
            run = min(remaining[name], quantums[qi])
            gantt.append((name, time, time+run))
            time += run; remaining[name] -= run
            if remaining[name] > 0 and qi < 2:
                queues[qi+1].append(name)  # demote
            break
    return gantt`;

type MlfqInput = {name:string;burst:number}[];

export const multilevelFeedbackModule: VisualizationModule<MlfqInput> = {
  id: "multilevel-feedback", slug: "multilevel-feedback", title: "MLFQ",
  category: ["os","process-scheduling"], difficulty: "advanced",
  timeComplexity: "O(n)", spaceComplexity: "O(n)",
  description: "Multilevel Feedback Queue with 3 levels (q=2, q=4, FCFS). Processes start in Q0 and are demoted if they use the full quantum.",
  relatedTopics: ["multilevel-queue","round-robin","priority-scheduling"],
  pythonCode: mlfqCode, codeSteps: [],
  defaultInput: [{name:"P1",burst:12},{name:"P2",burst:4},{name:"P3",burst:8}],
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const procs = input.map((p,i) => ({ ...p, color: COLORS[i % COLORS.length] }));
    const colors = procs.map(p => ({ name: p.name, color: p.color }));
    const maxTime = procs.reduce((s,p) => s + p.burst, 0) + 2;
    const timeline: {processName:string;start:number;end:number}[] = [];
    const quantums = [2, 4, Infinity];
    const queues: string[][] = [procs.map(p => p.name), [], []];
    const remaining = new Map(procs.map(p => [p.name, p.burst]));
    let time = 0;

    ganttStep(steps, "MLFQ start. All processes in Q0 (quantum=2). Q1=quantum=4, Q2=FCFS.", colors, [], 0, maxTime, { Q0: [...queues[0]], Q1: [], Q2: [] });

    let safetyLimit = 200;
    while ((queues[0].length + queues[1].length + queues[2].length) > 0 && safetyLimit-- > 0) {
      let ran = false;
      for (let qi = 0; qi < 3; qi++) {
        if (queues[qi].length === 0) continue;
        const name = queues[qi].shift()!;
        const rem = remaining.get(name)!;
        const run = Math.min(rem, quantums[qi] === Infinity ? rem : quantums[qi]);
        timeline.push({ processName: name, start: time, end: time + run });
        time += run;
        remaining.set(name, rem - run);

        if (rem - run > 0) {
          const nextQ = Math.min(qi + 1, 2);
          queues[nextQ].push(name);
          ganttStep(steps, `Q${qi}: run ${name} for ${run}u → demote to Q${nextQ} (rem=${rem-run}).`, colors, [...timeline], time, maxTime, { Q0: [...queues[0]], Q1: [...queues[1]], Q2: [...queues[2]] });
        } else {
          ganttStep(steps, `Q${qi}: ${name} completes at t=${time}.`, colors, [...timeline], time, maxTime, { Q0: [...queues[0]], Q1: [...queues[1]], Q2: [...queues[2]] });
        }
        ran = true;
        break;
      }
      if (!ran) break;
    }

    ganttStep(steps, "MLFQ scheduling complete.", colors, [...timeline], time, maxTime, { done: true });
    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   PAGING
═══════════════════════════════════════════════════════════════════════════ */

const pagingCode = `# Paging: Logical → Physical Address Translation
# logical_address = page_number * page_size + offset
# physical_address = frame_number * page_size + offset

def translate(logical_addr, page_table, page_size):
    page_num = logical_addr // page_size
    offset   = logical_addr %  page_size
    frame_num = page_table[page_num]
    physical_addr = frame_num * page_size + offset
    return physical_addr`;

type PagingInput = { pages: number; frameSize: number; pageTable: number[]; addresses: number[] };

export const pagingModule: VisualizationModule<PagingInput> = {
  id: "paging", slug: "paging", title: "Paging",
  category: ["os","memory-management"], difficulty: "intermediate",
  timeComplexity: "O(1) per access", spaceComplexity: "O(p) page table",
  description: "Page table translation: logical address → page number + offset → frame number → physical address.",
  relatedTopics: ["segmentation","virtual-memory","tlb"],
  pythonCode: pagingCode, codeSteps: [],
  defaultInput: { pages: 4, frameSize: 4, pageTable: [2,0,1,3], addresses: [0,5,11,15] },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { pageTable, frameSize, addresses } = input;

    // Show page table
    const ptMatrix = pageTable.map((frame, page) => [`Page ${page}`, `Frame ${frame}`, `0x${(frame * frameSize).toString(16).toUpperCase()}`]);
    table2dStep(steps, "Page table: maps logical pages → physical frames.", ptMatrix, pageTable.map((_,i) => `Page ${i}`), ["Page #","Frame #","Base Addr"], "Page Table");

    for (const addr of addresses) {
      const pageNum = Math.floor(addr / frameSize);
      const offset = addr % frameSize;
      const frameNum = pageTable[pageNum];
      const physAddr = frameNum * frameSize + offset;

      table2dStep(steps,
        `Translate logical ${addr}: page=${pageNum}, offset=${offset} → frame=${frameNum} → physical=${physAddr}.`,
        ptMatrix, pageTable.map((_,i) => `Page ${i}`), ["Page #","Frame #","Base Addr"], "Page Table",
        [pageNum, 0], [],
        { logicalAddr: addr, pageNum, offset, frameNum, physicalAddr: physAddr },
      );

      const cells = [
        { val: `LA=${addr}`, state: "active" },
        { val: `÷${frameSize}`, state: "default" },
        { val: `pg=${pageNum}`, state: "highlighted" },
        { val: `fr=${frameNum}`, state: "computed" },
        { val: `off=${offset}`, state: "highlighted" },
        { val: `PA=${physAddr}`, state: "sorted" },
      ];
      array1dStep(steps, `Logical ${addr} → Physical ${physAddr}`, cells, "Address Translation", { logicalAddr: addr, physicalAddr: physAddr });
    }

    table2dStep(steps, "Paging translation complete.", ptMatrix, pageTable.map((_,i) => `Page ${i}`), ["Page #","Frame #","Base Addr"], "Page Table");
    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   SEGMENTATION
═══════════════════════════════════════════════════════════════════════════ */

const segCode = `# Segmentation: Logical → Physical via Segment Table
# logical_address = (segment_num, offset)
# Check: offset < limit → physical = base + offset
# Else: SEGFAULT

def translate(seg_num, offset, seg_table):
    base, limit = seg_table[seg_num]
    if offset >= limit:
        raise SegmentationFault(seg_num, offset)
    return base + offset`;

type SegInput = { segments:{name:string;base:number;limit:number}[]; addresses:{seg:number;offset:number}[] };

export const segmentationModule: VisualizationModule<SegInput> = {
  id: "segmentation", slug: "segmentation", title: "Segmentation",
  category: ["os","memory-management"], difficulty: "intermediate",
  timeComplexity: "O(1) per access", spaceComplexity: "O(s) segment table",
  description: "Segmentation divides address space into named segments. Each segment has a base and limit; out-of-bounds triggers a SEGFAULT.",
  relatedTopics: ["paging","virtual-memory"],
  pythonCode: segCode, codeSteps: [],
  defaultInput: {
    segments: [{name:"code",base:4000,limit:1000},{name:"data",base:7000,limit:400},{name:"stack",base:9000,limit:2000}],
    addresses: [{seg:0,offset:100},{seg:1,offset:200}],
  },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { segments, addresses } = input;

    const matrix = segments.map(s => [s.name, s.base, s.limit, s.base + s.limit - 1]);
    table2dStep(steps, "Segment table: each segment has base address and limit.", matrix, segments.map((_,i) => `Seg ${i}`), ["Name","Base","Limit","Max Addr"], "Segment Table");

    for (const { seg, offset } of addresses) {
      const s = segments[seg];
      if (offset < s.limit) {
        const phys = s.base + offset;
        table2dStep(steps,
          `Seg ${seg} (${s.name}), offset=${offset}: valid (${offset} < ${s.limit}) → physical=${phys}.`,
          matrix, segments.map((_,i) => `Seg ${i}`), ["Name","Base","Limit","Max Addr"], "Segment Table",
          [seg, 0], [], { seg, offset, base: s.base, limit: s.limit, physical: phys },
        );
      } else {
        table2dStep(steps,
          `Seg ${seg} (${s.name}), offset=${offset}: SEGFAULT! ${offset} >= limit ${s.limit}.`,
          matrix, segments.map((_,i) => `Seg ${i}`), ["Name","Base","Limit","Max Addr"], "Segment Table",
          [seg, 2], [], { seg, offset, limit: s.limit, error: "SEGFAULT" },
        );
      }
    }
    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   BUDDY SYSTEM
═══════════════════════════════════════════════════════════════════════════ */

const buddyCode = `# Buddy System Memory Allocation
# Total memory = 2^k. Split into buddies.
# Allocate: find smallest 2^n >= requested; split if needed
# Free: if buddy also free, merge (coalesce)

def alloc(size, free_blocks):
    order = ceil(log2(size))
    while order <= MAX_ORDER:
        if free_blocks[order]:
            return free_blocks[order].pop()
        order += 1

def free(addr, size, free_blocks, used):
    order = ceil(log2(size))
    buddy = addr ^ (1 << order)
    if buddy in free_blocks[order]:
        free_blocks[order].remove(buddy)
        free(min(addr,buddy), size*2, ...)  # merge`;

type BuddyInput = { totalSize: number; requests: number[]; frees: number[] };

export const buddySystemModule: VisualizationModule<BuddyInput> = {
  id: "buddy-system", slug: "buddy-system", title: "Buddy System",
  category: ["os","memory-management"], difficulty: "advanced",
  timeComplexity: "O(log n)", spaceComplexity: "O(n)",
  description: "Buddy system allocator: memory is divided into power-of-2 blocks. Allocation splits blocks; freeing merges buddies.",
  relatedTopics: ["paging","segmentation","virtual-memory"],
  pythonCode: buddyCode, codeSteps: [],
  defaultInput: { totalSize: 64, requests: [8, 16, 4, 32], frees: [1, 0] },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { totalSize, requests, frees } = input;

    // Track blocks: [{start, size, state: "free"|"allocated", label}]
    type Block = { start: number; size: number; state: string; label: string };
    let blocks: Block[] = [{ start: 0, size: totalSize, state: "free", label: "FREE" }];
    const allocated: {start:number;size:number}[] = [];

    const toCell = (b: Block) => ({ val: `${b.label}\n[${b.start}-${b.start+b.size-1}]`, state: b.state === "free" ? "default" : "highlighted" });

    array1dStep(steps, `Buddy System: total ${totalSize} units. One free block.`, blocks.map(toCell), "Memory Blocks");

    for (const req of requests) {
      // Find smallest power-of-2 >= req
      let needed = 1;
      while (needed < req) needed *= 2;

      // Find smallest free block >= needed
      let allocated_block: Block | null = null;
      let splitLog = "";
      while (true) {
        const idx = blocks.findIndex(b => b.state === "free" && b.size >= needed);
        if (idx === -1) break;
        const b = blocks[idx];
        if (b.size === needed) {
          b.state = "allocated";
          b.label = `A(${req})`;
          allocated_block = b;
          allocated.push({ start: b.start, size: b.size });
          break;
        } else {
          // Split
          const half = b.size / 2;
          splitLog += `Split [${b.start}..${b.start+b.size-1}] into two ${half}-blocks. `;
          const left: Block = { start: b.start, size: half, state: "free", label: "FREE" };
          const right: Block = { start: b.start + half, size: half, state: "free", label: "FREE" };
          blocks.splice(idx, 1, left, right);
          array1dStep(steps, splitLog.trim(), blocks.map(toCell), "Memory Blocks");
        }
      }
      if (allocated_block) {
        array1dStep(steps, `Allocated ${req} units at [${allocated_block.start}..${allocated_block.start+allocated_block.size-1}].`, blocks.map(toCell), "Memory Blocks", { allocated: req, start: allocated_block.start });
      }
    }

    for (const freeIdx of frees) {
      if (freeIdx >= allocated.length) continue;
      const target = allocated[freeIdx];
      const idx = blocks.findIndex(b => b.start === target.start && b.size === target.size);
      if (idx === -1) continue;
      blocks[idx].state = "free";
      blocks[idx].label = "FREE";
      array1dStep(steps, `Freed block at [${target.start}..${target.start+target.size-1}]. Checking for buddy merge...`, blocks.map(toCell), "Memory Blocks");

      // Attempt merge
      let changed = true;
      while (changed) {
        changed = false;
        for (let i = 0; i < blocks.length - 1; i++) {
          const a = blocks[i], b = blocks[i+1];
          if (a.state === "free" && b.state === "free" && a.size === b.size && a.start + a.size === b.start && (a.start % (a.size * 2) === 0)) {
            const merged: Block = { start: a.start, size: a.size * 2, state: "free", label: "FREE" };
            blocks.splice(i, 2, merged);
            array1dStep(steps, `Merged buddy blocks → [${merged.start}..${merged.start+merged.size-1}] (${merged.size} units free).`, blocks.map(toCell), "Memory Blocks");
            changed = true;
            break;
          }
        }
      }
    }

    array1dStep(steps, "Buddy system simulation complete.", blocks.map(toCell), "Memory Blocks");
    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   VIRTUAL MEMORY / TLB
═══════════════════════════════════════════════════════════════════════════ */

const vmCode = `# Virtual Memory with TLB
# On memory access:
#   1. Check TLB for page
#   2. TLB hit  → get frame → access physical memory
#   3. TLB miss → walk page table
#                 if present: update TLB, access memory
#                 if not present: PAGE FAULT → load from disk

def access(page, tlb, page_table):
    if page in tlb:           # TLB hit
        return tlb[page]
    # TLB miss
    if page_table[page]['present']:
        tlb[page] = page_table[page]['frame']
        return tlb[page]
    else:                     # Page fault
        load_from_disk(page)
        page_table[page] = {'present': True, 'frame': allocate_frame()}
        tlb[page] = page_table[page]['frame']`;

type VMInput = { accesses: number[]; tlbSize: number };

export const virtualMemoryModule: VisualizationModule<VMInput> = {
  id: "virtual-memory", slug: "virtual-memory", title: "Virtual Memory & TLB",
  category: ["os","memory-management"], difficulty: "intermediate",
  timeComplexity: "O(1) TLB hit, O(n) fault", spaceComplexity: "O(frames)",
  description: "Virtual memory with TLB: TLB hit → fast access; TLB miss → page table walk; page fault → load from disk.",
  relatedTopics: ["paging","fifo-page","lru-page"],
  pythonCode: vmCode, codeSteps: [],
  defaultInput: { accesses: [0,1,2,3,0,1,4,5], tlbSize: 2 },
  generateSteps(input) {
    const lanes = ["CPU","TLB","Page Table","Disk"];
    const allSteps: {from:string;to:string;label:string;color?:string}[] = [
      {from:"CPU",to:"TLB",label:"Check TLB",color:"#6366f1"},
      {from:"TLB",to:"CPU",label:"TLB Hit → Frame",color:"#10b981"},
      {from:"TLB",to:"Page Table",label:"TLB Miss → Walk",color:"#f59e0b"},
      {from:"Page Table",to:"CPU",label:"Frame Found",color:"#10b981"},
      {from:"Page Table",to:"Disk",label:"Page Fault → Load",color:"#ef4444"},
      {from:"Disk",to:"Page Table",label:"Page Loaded",color:"#ef4444"},
      {from:"Page Table",to:"CPU",label:"Frame Allocated",color:"#10b981"},
    ];

    const steps: AnimationStep[] = [];
    steps.push({
      stepNumber: 1, description: "Virtual Memory: CPU accesses pages via TLB, then page table, then disk if needed.",
      highlightLines: [],
      visualState: { type:"flowdiagram", lanes, steps: allSteps, activeStep: -1, completedSteps: [] },
      variables: {},
    });

    const tlb = new Map<number,number>(); // page→frame
    const pageTable = new Map<number,number>(); // page→frame
    let nextFrame = 0;
    const tlbOrder: number[] = [];
    const { accesses, tlbSize } = input;

    for (const page of accesses) {
      // CPU → TLB check
      steps.push({
        stepNumber: steps.length + 1,
        description: `CPU accesses page ${page}. Checking TLB...`,
        highlightLines: [3],
        visualState: { type:"flowdiagram", lanes, steps: allSteps, activeStep: 0, completedSteps: [] },
        variables: { page, tlb: Object.fromEntries(tlb), tlbSize },
      });

      if (tlb.has(page)) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `TLB HIT for page ${page} → frame ${tlb.get(page)}. Fast access.`,
          highlightLines: [4],
          visualState: { type:"flowdiagram", lanes, steps: allSteps, activeStep: 1, completedSteps: [0] },
          variables: { page, frame: tlb.get(page), result: "TLB_HIT" },
        });
      } else {
        steps.push({
          stepNumber: steps.length + 1,
          description: `TLB MISS for page ${page}. Walk page table...`,
          highlightLines: [6, 7],
          visualState: { type:"flowdiagram", lanes, steps: allSteps, activeStep: 2, completedSteps: [0] },
          variables: { page, result: "TLB_MISS" },
        });

        if (pageTable.has(page)) {
          const frame = pageTable.get(page)!;
          steps.push({
            stepNumber: steps.length + 1,
            description: `Page ${page} found in page table → frame ${frame}. Update TLB.`,
            highlightLines: [8, 9],
            visualState: { type:"flowdiagram", lanes, steps: allSteps, activeStep: 3, completedSteps: [0,2] },
            variables: { page, frame, result: "PAGE_TABLE_HIT" },
          });
          // Update TLB (LRU eviction)
          if (tlbOrder.length >= tlbSize) { const evict = tlbOrder.shift()!; tlb.delete(evict); }
          tlb.set(page, frame); tlbOrder.push(page);
        } else {
          steps.push({
            stepNumber: steps.length + 1,
            description: `PAGE FAULT for page ${page}! Not in page table. Loading from disk...`,
            highlightLines: [11, 12],
            visualState: { type:"flowdiagram", lanes, steps: allSteps, activeStep: 4, completedSteps: [0,2] },
            variables: { page, result: "PAGE_FAULT" },
          });
          const frame = nextFrame++;
          pageTable.set(page, frame);
          steps.push({
            stepNumber: steps.length + 1,
            description: `Disk loaded page ${page} into frame ${frame}. Updated page table and TLB.`,
            highlightLines: [13, 14, 15],
            visualState: { type:"flowdiagram", lanes, steps: allSteps, activeStep: 5, completedSteps: [0,2,4] },
            variables: { page, frame, result: "LOADED" },
          });
          if (tlbOrder.length >= tlbSize) { const evict = tlbOrder.shift()!; tlb.delete(evict); }
          tlb.set(page, frame); tlbOrder.push(page);
        }
      }
    }

    steps.push({
      stepNumber: steps.length + 1, description: "Virtual memory simulation complete.",
      highlightLines: [],
      visualState: { type:"flowdiagram", lanes, steps: allSteps, activeStep: -1, completedSteps: [0,1,2,3,4,5,6] },
      variables: { done: true },
    });
    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE REPLACEMENT HELPERS
═══════════════════════════════════════════════════════════════════════════ */

function pageFrameCell(frame: number|null, active: boolean): { val: string|number; state: string } {
  return { val: frame === null ? "-" : frame, state: active ? "active" : "highlighted" };
}

/* ═══════════════════════════════════════════════════════════════════════════
   FIFO PAGE REPLACEMENT
═══════════════════════════════════════════════════════════════════════════ */

const fifoPageCode = `def fifo(pages, n_frames):
    frames = []; faults = 0
    for page in pages:
        if page not in frames:
            faults += 1
            if len(frames) == n_frames:
                frames.pop(0)  # evict oldest
            frames.append(page)
    return faults`;

type PageInput = { pages: number[]; frames: number };

export const fifoPageModule: VisualizationModule<PageInput> = {
  id: "fifo-page", slug: "fifo-page", title: "FIFO Page Replacement",
  category: ["os","page-replacement"], difficulty: "beginner",
  timeComplexity: "O(n·f)", spaceComplexity: "O(f)",
  description: "FIFO page replacement: the oldest page in memory is evicted when a new page must be loaded.",
  relatedTopics: ["lru-page","optimal-page","clock-page"],
  pythonCode: fifoPageCode, codeSteps: [],
  defaultInput: { pages: [7,0,1,2,0,3,0,4,2,3,0,3,2], frames: 3 },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { pages, frames: numFrames } = input;
    const frames: (number|null)[] = Array(numFrames).fill(null);
    let faults = 0;
    let fifoPtr = 0;

    array1dStep(steps, "FIFO Page Replacement start. Frames empty.", frames.map(f => ({ val: f === null ? "-" : f, state: "default" })), "Frames", { faults: 0 });

    for (const page of pages) {
      if (frames.includes(page)) {
        array1dStep(steps, `Page ${page}: HIT. No fault.`, frames.map((f,i) => ({ val: f === null ? "-" : f, state: f === page ? "sorted" : "default" })), "Frames", { page, faults, hit: true });
      } else {
        faults++;
        const evicted = frames[fifoPtr];
        frames[fifoPtr] = page;
        const msg = evicted === null ? `Page ${page}: FAULT. Load into empty frame ${fifoPtr}.` : `Page ${page}: FAULT. Evict ${evicted} (FIFO) → load ${page} into frame ${fifoPtr}.`;
        array1dStep(steps, msg, frames.map((f,i) => ({ val: f === null ? "-" : f, state: i === fifoPtr ? "active" : "default" })), "Frames", { page, faults, evicted, fault: true }, [{ index: fifoPtr, label: "FIFO ptr" }]);
        fifoPtr = (fifoPtr + 1) % numFrames;
      }
    }

    array1dStep(steps, `FIFO complete. Total page faults: ${faults}.`, frames.map(f => ({ val: f === null ? "-" : f, state: "sorted" })), "Frames", { faults, done: true });
    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   LRU PAGE REPLACEMENT
═══════════════════════════════════════════════════════════════════════════ */

const lruPageCode = `def lru(pages, n_frames):
    frames = []; faults = 0
    for page in pages:
        if page in frames:
            frames.remove(page)  # move to front (MRU)
            frames.append(page)
        else:
            faults += 1
            if len(frames) == n_frames:
                frames.pop(0)  # evict LRU (front)
            frames.append(page)
    return faults`;

export const lruPageModule: VisualizationModule<PageInput> = {
  id: "lru-page", slug: "lru-page", title: "LRU Page Replacement",
  category: ["os","page-replacement"], difficulty: "intermediate",
  timeComplexity: "O(n·f)", spaceComplexity: "O(f)",
  description: "LRU page replacement: evicts the least recently used page. Tracks usage order to make eviction decisions.",
  relatedTopics: ["fifo-page","optimal-page","clock-page"],
  pythonCode: lruPageCode, codeSteps: [],
  defaultInput: { pages: [7,0,1,2,0,3,0,4,2,3,0,3,2], frames: 3 },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { pages, frames: numFrames } = input;
    let frames: number[] = [];
    let faults = 0;

    array1dStep(steps, "LRU Page Replacement start. Frames empty.", Array(numFrames).fill({ val: "-", state: "default" }), "Frames (LRU←→MRU)", { faults: 0 });

    for (const page of pages) {
      if (frames.includes(page)) {
        frames = frames.filter(f => f !== page);
        frames.push(page);
        array1dStep(steps, `Page ${page}: HIT. Move to MRU position.`, frames.map((f,i) => ({ val: f, state: i === frames.length - 1 ? "sorted" : "default" })).concat(Array(numFrames - frames.length).fill({ val: "-", state: "default" })), "Frames (LRU←→MRU)", { page, faults, hit: true });
      } else {
        faults++;
        let evicted: number | null = null;
        if (frames.length >= numFrames) {
          evicted = frames.shift()!;
        }
        frames.push(page);
        const msg = evicted === null ? `Page ${page}: FAULT. Load into frame.` : `Page ${page}: FAULT. Evict ${evicted} (LRU) → load ${page}.`;
        array1dStep(steps, msg, frames.map((f,i) => ({ val: f, state: i === frames.length - 1 ? "active" : "default" })).concat(Array(numFrames - frames.length).fill({ val: "-", state: "default" })), "Frames (LRU←→MRU)", { page, faults, evicted, fault: true });
      }
    }

    array1dStep(steps, `LRU complete. Total faults: ${faults}.`, frames.map(f => ({ val: f, state: "sorted" })), "Frames", { faults, done: true });
    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   OPTIMAL PAGE REPLACEMENT
═══════════════════════════════════════════════════════════════════════════ */

const optimalPageCode = `def optimal(pages, n_frames):
    frames = []; faults = 0
    for i, page in enumerate(pages):
        if page not in frames:
            faults += 1
            if len(frames) == n_frames:
                # Evict page used furthest in future
                def next_use(p):
                    for j in range(i+1, len(pages)):
                        if pages[j] == p: return j
                    return float('inf')
                evict = max(frames, key=next_use)
                frames.remove(evict)
            frames.append(page)
    return faults`;

export const optimalPageModule: VisualizationModule<PageInput> = {
  id: "optimal-page", slug: "optimal-page", title: "Optimal Page Replacement",
  category: ["os","page-replacement"], difficulty: "intermediate",
  timeComplexity: "O(n²·f)", spaceComplexity: "O(f)",
  description: "Belady's optimal algorithm: evicts the page that won't be used for the longest time. Theoretical lower bound on page faults.",
  relatedTopics: ["fifo-page","lru-page","clock-page"],
  pythonCode: optimalPageCode, codeSteps: [],
  defaultInput: { pages: [7,0,1,2,0,3,0,4,2,3,0,3,2], frames: 3 },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { pages, frames: numFrames } = input;
    let frames: number[] = [];
    let faults = 0;

    array1dStep(steps, "Optimal Page Replacement: always evict page used furthest in future.", Array(numFrames).fill({ val: "-", state: "default" }), "Frames", { faults: 0 });

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (frames.includes(page)) {
        array1dStep(steps, `Page ${page}: HIT.`, frames.map(f => ({ val: f, state: f === page ? "sorted" : "default" })).concat(Array(numFrames - frames.length).fill({ val: "-", state: "default" })), "Frames", { page, faults, hit: true });
      } else {
        faults++;
        let evictIdx = -1;
        if (frames.length >= numFrames) {
          let farthest = -1;
          for (let fi = 0; fi < frames.length; fi++) {
            let nextUse = Infinity;
            for (let j = i + 1; j < pages.length; j++) {
              if (pages[j] === frames[fi]) { nextUse = j; break; }
            }
            if (nextUse > farthest) { farthest = nextUse; evictIdx = fi; }
          }
        }
        const evicted = evictIdx >= 0 ? frames[evictIdx] : null;
        if (evictIdx >= 0) frames.splice(evictIdx, 1);
        frames.push(page);
        const msg = evicted === null ? `Page ${page}: FAULT. Load.` : `Page ${page}: FAULT. Evict ${evicted} (farthest future) → load ${page}.`;
        array1dStep(steps, msg, frames.map((f,i2) => ({ val: f, state: i2 === frames.length - 1 ? "active" : "default" })).concat(Array(numFrames - frames.length).fill({ val: "-", state: "default" })), "Frames", { page, faults, evicted, fault: true });
      }
    }

    array1dStep(steps, `Optimal complete. Total faults: ${faults}. (Theoretical minimum)`, frames.map(f => ({ val: f, state: "sorted" })), "Frames", { faults, done: true });
    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   CLOCK PAGE REPLACEMENT
═══════════════════════════════════════════════════════════════════════════ */

const clockCode = `# Clock (Second-Chance) Algorithm
# Each frame has a reference bit (R)
# On access: R=1
# On fault: scan from clock hand
#   if R=0 → evict
#   if R=1 → R=0, advance hand (second chance)

def clock_replace(page, frames, ref_bits, hand):
    while True:
        if ref_bits[hand] == 0:
            frames[hand] = page
            ref_bits[hand] = 1
            hand = (hand + 1) % len(frames)
            return hand
        ref_bits[hand] = 0
        hand = (hand + 1) % len(frames)`;

export const clockPageModule: VisualizationModule<PageInput> = {
  id: "clock-page", slug: "clock-page", title: "Clock Algorithm",
  category: ["os","page-replacement"], difficulty: "intermediate",
  timeComplexity: "O(n·f)", spaceComplexity: "O(f)",
  description: "Clock (second-chance) algorithm: a circular list of frames with reference bits. Gives pages a second chance before eviction.",
  relatedTopics: ["fifo-page","lru-page","nfu-page"],
  pythonCode: clockCode, codeSteps: [],
  defaultInput: { pages: [1,2,3,4,1,2,5,1,2,3,4,5], frames: 3 },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { pages, frames: numFrames } = input;
    const frames: (number|null)[] = Array(numFrames).fill(null);
    const refBits: number[] = Array(numFrames).fill(0);
    let hand = 0;
    let faults = 0;

    const toCells = (activeFr?: number) => frames.map((f,i) => ({
      val: f === null ? "-" : `${f}(R=${refBits[i]})`,
      state: i === activeFr ? "active" : i === hand ? "highlighted" : "default",
    }));

    array1dStep(steps, "Clock Algorithm: frames with reference bits. Hand starts at 0.", toCells(), "Frames (R=reference bit)", { faults: 0, hand: 0 });

    for (const page of pages) {
      const hitIdx = frames.indexOf(page);
      if (hitIdx >= 0) {
        refBits[hitIdx] = 1;
        array1dStep(steps, `Page ${page}: HIT. Set R=1 for frame ${hitIdx}.`, toCells(hitIdx), "Frames", { page, faults, hit: true, hand });
      } else {
        faults++;
        // Find victim
        let scanned = 0;
        while (scanned < numFrames * 2) {
          if (frames[hand] === null || refBits[hand] === 0) break;
          refBits[hand] = 0;
          array1dStep(steps, `Clock: frame ${hand} has R=1 → give second chance (R=0), advance hand.`, toCells(), "Frames", { page, faults: faults - 1, hand });
          hand = (hand + 1) % numFrames;
          scanned++;
        }
        const evicted = frames[hand];
        frames[hand] = page;
        refBits[hand] = 1;
        const msg = evicted === null ? `Page ${page}: FAULT. Load into empty frame ${hand}.` : `Page ${page}: FAULT. Evict ${evicted} from frame ${hand} (R=0).`;
        array1dStep(steps, msg, toCells(hand), "Frames", { page, faults, evicted, fault: true, hand });
        hand = (hand + 1) % numFrames;
      }
    }

    array1dStep(steps, `Clock complete. Total faults: ${faults}.`, toCells(), "Frames", { faults, done: true });
    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   NFU PAGE REPLACEMENT
═══════════════════════════════════════════════════════════════════════════ */

const nfuCode = `# NFU (Not Frequently Used)
# Each frame has a counter
# On timer interrupt: counter += R (reference bit)
# On page fault: evict frame with lowest counter
# (Simple aging approximation)

def nfu_tick(frames, ref_bits, counters):
    for i in range(len(frames)):
        counters[i] += ref_bits[i]
        ref_bits[i] = 0

def nfu_replace(page, frames, counters):
    victim = min(range(len(frames)), key=lambda i: counters[i])
    frames[victim] = page; counters[victim] = 1`;

export const nfuPageModule: VisualizationModule<PageInput> = {
  id: "nfu-page", slug: "nfu-page", title: "NFU Page Replacement",
  category: ["os","page-replacement"], difficulty: "intermediate",
  timeComplexity: "O(n·f)", spaceComplexity: "O(f)",
  description: "NFU: Not Frequently Used — evicts the page with the lowest usage counter. Counter increments on each reference.",
  relatedTopics: ["clock-page","lru-page","fifo-page"],
  pythonCode: nfuCode, codeSteps: [],
  defaultInput: { pages: [1,2,3,4,1,2,5,1,2,3,4,5], frames: 3 },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { pages, frames: numFrames } = input;
    const frames: (number|null)[] = Array(numFrames).fill(null);
    const counters: number[] = Array(numFrames).fill(0);
    let faults = 0;

    const toCells = (active?: number) => frames.map((f,i) => ({
      val: f === null ? "-" : `${f}(c=${counters[i]})`,
      state: i === active ? "active" : "default",
    }));

    array1dStep(steps, "NFU Page Replacement: each frame tracks access count.", toCells(), "Frames (c=count)", { faults: 0 });

    for (const page of pages) {
      const hitIdx = frames.indexOf(page);
      if (hitIdx >= 0) {
        counters[hitIdx]++;
        array1dStep(steps, `Page ${page}: HIT. Increment counter → ${counters[hitIdx]}.`, toCells(hitIdx), "Frames", { page, faults, hit: true });
      } else {
        faults++;
        let victimIdx = 0;
        let minCount = Infinity;
        for (let i = 0; i < numFrames; i++) {
          if (frames[i] === null) { victimIdx = i; minCount = -1; break; }
          if (counters[i] < minCount) { minCount = counters[i]; victimIdx = i; }
        }
        const evicted = frames[victimIdx];
        frames[victimIdx] = page;
        counters[victimIdx] = 1;
        const msg = evicted === null ? `Page ${page}: FAULT. Load into frame ${victimIdx}.` : `Page ${page}: FAULT. Evict ${evicted} (count=${minCount}) → load ${page}.`;
        array1dStep(steps, msg, toCells(victimIdx), "Frames", { page, faults, evicted, fault: true });
      }
    }

    array1dStep(steps, `NFU complete. Total faults: ${faults}.`, toCells(), "Frames", { faults, done: true });
    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   DEADLOCK DETECTION
═══════════════════════════════════════════════════════════════════════════ */

const dlDetectCode = `# Resource Allocation Graph (RAG)
# Cycle in RAG with single-instance resources → deadlock
# P1 → R1 → P2 → R2 → P1  (deadlock!)

def detect_deadlock(rag):
    visited = set(); rec_stack = set()
    def dfs(node):
        visited.add(node); rec_stack.add(node)
        for neighbor in rag.get(node, []):
            if neighbor not in visited:
                if dfs(neighbor): return True
            elif neighbor in rec_stack:
                return True
        rec_stack.discard(node); return False
    return any(dfs(n) for n in rag if n not in visited)`;

export const deadlockDetectionModule: VisualizationModule<null> = {
  id: "deadlock-detection", slug: "deadlock-detection", title: "Deadlock Detection",
  category: ["os","deadlock"], difficulty: "intermediate",
  timeComplexity: "O(V+E)", spaceComplexity: "O(V)",
  description: "Resource Allocation Graph: P1→R1→P2→R2→P1 forms a cycle, indicating deadlock. DFS detects the cycle.",
  relatedTopics: ["bankers-algorithm","deadlock-prevention","deadlock-recovery"],
  pythonCode: dlDetectCode, codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    // RAG: P1 requests R1, R1 assigned to P2, P2 requests R2, R2 assigned to P1
    const nodes = [
      { id: "P1", label: "P1", x: 100, y: 200, type: "process" },
      { id: "P2", label: "P2", x: 400, y: 200, type: "process" },
      { id: "R1", label: "[R1]", x: 250, y: 100, type: "resource" },
      { id: "R2", label: "[R2]", x: 250, y: 300, type: "resource" },
    ];
    const edges = [
      { from: "P1", to: "R1", label: "requests", color: "#f59e0b" },
      { from: "R1", to: "P2", label: "assigned", color: "#10b981" },
      { from: "P2", to: "R2", label: "requests", color: "#f59e0b" },
      { from: "R2", to: "P1", label: "assigned", color: "#10b981" },
    ];

    steps.push({
      stepNumber: 1, description: "Resource Allocation Graph: circles=processes, [squares]=resources. Yellow=request, Green=assigned.",
      highlightLines: [1,2,3],
      visualState: { type:"graph", nodes, edges, directed: true },
      variables: { P1: "waiting for R1", P2: "waiting for R2", R1: "held by P2", R2: "held by P1" },
    });

    steps.push({
      stepNumber: 2, description: "Trace cycle: P1→R1→P2→R2→P1. This is a circular wait — DEADLOCK DETECTED.",
      highlightLines: [5,6,7,8,9,10,11,12],
      visualState: { type:"graph", nodes: nodes.map(n => ({ ...n, highlighted: true })), edges: edges.map(e => ({ ...e, highlighted: true, color: "#ef4444" })), directed: true },
      variables: { cycle: "P1→R1→P2→R2→P1", deadlock: true },
    });

    steps.push({
      stepNumber: 3, description: "DEADLOCK confirmed: P1 holds R2 and waits for R1; P2 holds R1 and waits for R2. Neither can proceed.",
      highlightLines: [],
      visualState: { type:"graph", nodes, edges, directed: true },
      variables: { deadlock: true, processes: ["P1","P2"], resources: ["R1","R2"] },
    });
    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   BANKER'S ALGORITHM
═══════════════════════════════════════════════════════════════════════════ */

const bankersCode = `# Banker's Algorithm — Safety Check
# Need = Max - Allocation
def is_safe(processes, allocation, max_need, available):
    n = len(processes); m = len(available)
    need = [[max_need[i][j] - allocation[i][j]
             for j in range(m)] for i in range(n)]
    finish = [False]*n; work = available[:]
    safe_seq = []
    while len(safe_seq) < n:
        found = False
        for i in range(n):
            if not finish[i] and all(need[i][j]<=work[j] for j in range(m)):
                work = [work[j]+allocation[i][j] for j in range(m)]
                finish[i] = True; safe_seq.append(i); found = True; break
        if not found: return None  # Unsafe
    return safe_seq`;

type BankersInput = { processes: number; resources: number; allocation: number[][]; max: number[][]; available: number[] };

export const bankersAlgorithmModule: VisualizationModule<BankersInput> = {
  id: "bankers-algorithm", slug: "bankers-algorithm", title: "Banker's Algorithm",
  category: ["os","deadlock"], difficulty: "intermediate",
  timeComplexity: "O(n²·m)", spaceComplexity: "O(n·m)",
  description: "Banker's algorithm for deadlock avoidance. Computes Need = Max - Allocation, then finds a safe sequence where each process can complete.",
  relatedTopics: ["deadlock-detection","deadlock-prevention"],
  pythonCode: bankersCode, codeSteps: [],
  defaultInput: {
    processes: 5, resources: 3,
    allocation: [[0,1,0],[2,0,0],[3,0,2],[2,1,1],[0,0,2]],
    max: [[7,5,3],[3,2,2],[9,0,2],[2,2,2],[4,3,3]],
    available: [3,3,2],
  },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { processes: n, resources: m, allocation, max, available } = input;
    const procLabels = Array.from({length: n}, (_,i) => `P${i}`);
    const resLabels = ["A","B","C"].slice(0, m);

    // Compute Need
    const need = allocation.map((row,i) => row.map((v,j) => max[i][j] - v));

    // Show tables
    table2dStep(steps, "Initial state: Allocation, Max matrices and Available resources.", allocation, procLabels, resLabels, "Allocation");
    table2dStep(steps, "Max resources each process may need.", max, procLabels, resLabels, "Max");
    table2dStep(steps, "Need = Max - Allocation. This is what each process still needs.", need, procLabels, resLabels, "Need");

    // Safety algorithm
    const work = [...available];
    const finish = Array(n).fill(false);
    const safeSeq: number[] = [];

    steps.push({
      stepNumber: steps.length + 1, description: `Available resources: [${available.join(",")}]. Running safety algorithm...`,
      highlightLines: [6,7], visualState: { type:"table2d", matrix: need, rowLabels: procLabels, colLabels: resLabels, title: "Need", activeCell: null, filledCells: [] },
      variables: { work: [...work], safeSeq: [] },
    });

    let found = true;
    while (safeSeq.length < n && found) {
      found = false;
      for (let i = 0; i < n; i++) {
        if (!finish[i] && need[i].every((v,j) => v <= work[j])) {
          const activeCell: [number,number] = [i, 0];
          table2dStep(steps,
            `P${i}: Need=[${need[i].join(",")}] ≤ Work=[${work.join(",")}] → P${i} can proceed.`,
            need, procLabels, resLabels, "Need", activeCell, safeSeq.map(p => [p,0] as [number,number]),
            { i, need_i: need[i], work: [...work], safeSeq: [...safeSeq, i] },
          );
          for (let j = 0; j < m; j++) work[j] += allocation[i][j];
          finish[i] = true;
          safeSeq.push(i);
          found = true;
          break;
        }
      }
    }

    if (safeSeq.length === n) {
      table2dStep(steps, `SAFE STATE. Safe sequence: ${safeSeq.map(i => `P${i}`).join(" → ")}.`, need, procLabels, resLabels, "Need", null, safeSeq.map(p => [p,0] as [number,number]), { safeSeq: safeSeq.map(i => `P${i}`) });
    } else {
      table2dStep(steps, "UNSAFE STATE! No safe sequence found — risk of deadlock.", need, procLabels, resLabels, "Need", null, [], { unsafe: true });
    }
    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   DEADLOCK PREVENTION
═══════════════════════════════════════════════════════════════════════════ */

const dlPrevCode = `# Deadlock requires ALL 4 conditions:
# 1. Mutual Exclusion  — at least one non-sharable resource
# 2. Hold and Wait     — process holds resource while waiting for more
# 3. No Preemption     — resources cannot be forcibly taken
# 4. Circular Wait     — circular chain of processes waiting

# Prevention strategies (break one condition):
# 1. Mutual Exclusion  → make resources sharable (e.g., read-only)
# 2. Hold and Wait     → request ALL resources at once; release before requesting more
# 3. No Preemption     → allow OS to preempt resources (timeout/rollback)
# 4. Circular Wait     → impose total ordering on resources; always request in order`;

export const deadlockPreventionModule: VisualizationModule<null> = {
  id: "deadlock-prevention", slug: "deadlock-prevention", title: "Deadlock Prevention",
  category: ["os","deadlock"], difficulty: "intermediate",
  timeComplexity: "N/A", spaceComplexity: "N/A",
  description: "Deadlock requires 4 conditions. Prevention breaks one. Shows each condition and its prevention strategy.",
  relatedTopics: ["deadlock-detection","bankers-algorithm","deadlock-recovery"],
  pythonCode: dlPrevCode, codeSteps: [],
  defaultInput: null,
  generateSteps() {
    return buildFlowSteps(
      ["Condition","Prevention Strategy"],
      [
        { from:"Condition", to:"Prevention Strategy", label:"1. Mutual Exclusion", color:"#ef4444",
          description:"Condition 1 — Mutual Exclusion: at least one resource must be non-sharable (e.g., printer, lock).", lines:[1,2],
          variables:{ condition:"Mutual Exclusion", prevention:"Make resources sharable (e.g., spooling for printer, read-only files)" } },
        { from:"Condition", to:"Prevention Strategy", label:"2. Hold and Wait", color:"#f59e0b",
          description:"Condition 2 — Hold and Wait: process holds a resource while waiting for another. Prevention: request all at start or release before requesting more.", lines:[3,4,9],
          variables:{ condition:"Hold and Wait", prevention:"Request all resources at once OR release all before requesting new ones" } },
        { from:"Condition", to:"Prevention Strategy", label:"3. No Preemption", color:"#6366f1",
          description:"Condition 3 — No Preemption: resources cannot be taken away. Prevention: allow OS to preempt (timeout, rollback, checkpointing).", lines:[5,6,10],
          variables:{ condition:"No Preemption", prevention:"Allow OS to preempt: timeout, rollback, or checkpoint/restore" } },
        { from:"Condition", to:"Prevention Strategy", label:"4. Circular Wait", color:"#10b981",
          description:"Condition 4 — Circular Wait: chain P1→R1→P2→R2→P1. Prevention: impose total ordering on resources — always request in increasing order.", lines:[7,8,11],
          variables:{ condition:"Circular Wait", prevention:"Total ordering of resources: always acquire in ascending order of resource number" } },
      ],
    );
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   DEADLOCK RECOVERY
═══════════════════════════════════════════════════════════════════════════ */

const dlRecoveryCode = `# Deadlock Recovery Strategies
#
# Method 1: Process Termination
#   a. Terminate all deadlocked processes (drastic)
#   b. Terminate one process at a time until cycle broken
#      — choose by: priority, progress, resources held, etc.
#
# Method 2: Resource Preemption
#   a. Select victim (cost-based: rollback minimal work)
#   b. Rollback victim to safe state (checkpoint)
#   c. Reallocate resource to break deadlock
#   d. Prevent starvation: track rollback count`;

export const deadlockRecoveryModule: VisualizationModule<null> = {
  id: "deadlock-recovery", slug: "deadlock-recovery", title: "Deadlock Recovery",
  category: ["os","deadlock"], difficulty: "intermediate",
  timeComplexity: "N/A", spaceComplexity: "N/A",
  description: "Recovery from deadlock: process termination (abort all or one-by-one) or resource preemption (rollback victim to safe state).",
  relatedTopics: ["deadlock-detection","deadlock-prevention","bankers-algorithm"],
  pythonCode: dlRecoveryCode, codeSteps: [],
  defaultInput: null,
  generateSteps() {
    return buildFlowSteps(
      ["Detection","Recovery Action","System"],
      [
        { from:"Detection", to:"Recovery Action", label:"Deadlock Detected", color:"#ef4444",
          description:"OS detects deadlock (via RAG cycle or Banker's algorithm violation). Must take recovery action.", lines:[1],
          variables:{ state:"deadlock_detected" } },
        { from:"Recovery Action", to:"System", label:"Method 1a: Terminate All", color:"#f59e0b",
          description:"Option 1a: Terminate ALL deadlocked processes. Simple but costly — all progress lost.", lines:[3,4],
          variables:{ method:"terminate_all", cost:"high", benefit:"immediate_resolution" } },
        { from:"Recovery Action", to:"System", label:"Method 1b: Terminate One-by-One", color:"#f59e0b",
          description:"Option 1b: Terminate processes one at a time. Re-check after each. Choose victim by priority, resources held, or least progress lost.", lines:[5,6,7],
          variables:{ method:"terminate_incremental", selection:"priority/progress/resources" } },
        { from:"Recovery Action", to:"System", label:"Method 2a: Select Victim", color:"#6366f1",
          description:"Option 2 — Resource Preemption: select victim process to rollback (minimize cost: prefer low-priority, minimal progress).", lines:[9,10],
          variables:{ method:"resource_preemption", victim_selection:"cost_based" } },
        { from:"Recovery Action", to:"System", label:"Method 2b: Rollback to Safe State", color:"#6366f1",
          description:"Rollback victim to a safe checkpoint state. Reallocate its resources to break deadlock. Track rollbacks to prevent starvation.", lines:[11,12,13],
          variables:{ action:"rollback_checkpoint", anti_starvation:"track_rollback_count" } },
        { from:"System", to:"Detection", label:"Verify Deadlock Resolved", color:"#10b981",
          description:"After recovery action, verify deadlock is resolved. If not, apply another action. System resumes normal operation.", lines:[],
          variables:{ state:"resolved_or_retry" } },
      ],
    );
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   DISK SCHEDULING HELPERS
═══════════════════════════════════════════════════════════════════════════ */

type DiskInput = { requests: number[]; initial: number; direction?: string };

function diskStep(steps: AnimationStep[], desc: string, positions: number[], head: number, highlight: number, totalSeek: number): void {
  const cells = positions.map(p => ({
    val: p,
    state: p === head ? "active" : p === highlight ? "highlighted" : "default",
  }));
  array1dStep(steps, desc, cells, "Disk Positions (sorted)", { head, totalSeek }, [{ index: positions.indexOf(head), label: "head" }]);
}

/* ═══════════════════════════════════════════════════════════════════════════
   FCFS DISK
═══════════════════════════════════════════════════════════════════════════ */

const fcfsDiskCode = `def fcfs(requests, initial):
    head = initial; total = 0
    order = [initial] + list(requests)
    for i in range(1, len(order)):
        total += abs(order[i] - order[i-1])
        head = order[i]
    return total`;

export const fcfsDiskModule: VisualizationModule<DiskInput> = {
  id: "fcfs-disk", slug: "fcfs-disk", title: "FCFS Disk Scheduling",
  category: ["os","disk-scheduling"], difficulty: "beginner",
  timeComplexity: "O(n)", spaceComplexity: "O(1)",
  description: "FCFS disk scheduling: serve requests in arrival order. Simple but can cause excessive seek times.",
  relatedTopics: ["sstf","scan-disk","look-disk"],
  pythonCode: fcfsDiskCode, codeSteps: [],
  defaultInput: { requests: [98,183,37,122,14,124,65,67], initial: 53 },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { requests, initial } = input;
    const allPos = [...new Set([initial, ...requests])].sort((a,b) => a-b);
    let head = initial;
    let totalSeek = 0;

    array1dStep(steps, `FCFS Disk Scheduling. Initial head: ${initial}. Requests: [${requests.join(",")}]`, allPos.map(p => ({ val: p, state: p === head ? "active" : "default" })), "Disk Positions", { head, totalSeek }, [{ index: allPos.indexOf(head), label: "head" }]);

    for (const req of requests) {
      const seek = Math.abs(req - head);
      totalSeek += seek;
      const prev = head;
      head = req;
      array1dStep(steps, `Move head from ${prev} → ${req} (seek=${seek}). Total seek=${totalSeek}.`, allPos.map(p => ({ val: p, state: p === head ? "active" : p === prev ? "sorted" : "default" })), "Disk Positions", { head, prev, seek, totalSeek }, [{ index: allPos.indexOf(head), label: "head" }]);
    }

    array1dStep(steps, `FCFS complete. Total seek distance: ${totalSeek}.`, allPos.map(p => ({ val: p, state: "default" })), "Disk Positions", { totalSeek, done: true });
    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   SSTF DISK
═══════════════════════════════════════════════════════════════════════════ */

const sstfCode = `def sstf(requests, initial):
    head = initial; total = 0
    remaining = list(requests)
    while remaining:
        # Pick closest request
        closest = min(remaining, key=lambda r: abs(r - head))
        total += abs(closest - head)
        head = closest; remaining.remove(closest)
    return total`;

export const sstfModule: VisualizationModule<DiskInput> = {
  id: "sstf", slug: "sstf", title: "SSTF Disk Scheduling",
  category: ["os","disk-scheduling"], difficulty: "beginner",
  timeComplexity: "O(n²)", spaceComplexity: "O(n)",
  description: "SSTF: Shortest Seek Time First. Always serves the request closest to the current head position. Reduces seek time but may cause starvation.",
  relatedTopics: ["fcfs-disk","scan-disk","look-disk"],
  pythonCode: sstfCode, codeSteps: [],
  defaultInput: { requests: [98,183,37,122,14,124,65,67], initial: 53 },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { requests, initial } = input;
    const allPos = [...new Set([initial, ...requests])].sort((a,b) => a-b);
    let head = initial;
    let remaining = [...requests];
    let totalSeek = 0;

    array1dStep(steps, `SSTF start. Head=${initial}. Always picks nearest request.`, allPos.map(p => ({ val: p, state: p === head ? "active" : remaining.includes(p) ? "highlighted" : "default" })), "Disk Positions", { head, totalSeek }, [{ index: allPos.indexOf(head), label: "head" }]);

    while (remaining.length > 0) {
      const closest = remaining.reduce((a,b) => Math.abs(a - head) <= Math.abs(b - head) ? a : b);
      const seek = Math.abs(closest - head);
      totalSeek += seek;
      const prev = head;
      head = closest;
      remaining = remaining.filter(r => r !== closest);
      array1dStep(steps, `SSTF: nearest is ${closest} (seek=${seek}). Move from ${prev}. Total=${totalSeek}.`, allPos.map(p => ({ val: p, state: p === head ? "active" : remaining.includes(p) ? "highlighted" : "sorted" })), "Disk Positions", { head, seek, totalSeek }, [{ index: allPos.indexOf(head), label: "head" }]);
    }

    array1dStep(steps, `SSTF complete. Total seek: ${totalSeek}.`, allPos.map(p => ({ val: p, state: "default" })), "Disk Positions", { totalSeek, done: true });
    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   SCAN (ELEVATOR) DISK
═══════════════════════════════════════════════════════════════════════════ */

const scanCode = `def scan(requests, initial, direction="up", max_cyl=199):
    head = initial; total = 0
    left = sorted([r for r in requests if r < head], reverse=True)
    right = sorted([r for r in requests if r >= head])
    order = (right + [max_cyl] + left) if direction=="up" else (left + [0] + right)
    prev = head
    for r in order:
        total += abs(r - prev); prev = r
    return total`;

export const scanDiskModule: VisualizationModule<DiskInput> = {
  id: "scan-disk", slug: "scan-disk", title: "SCAN (Elevator)",
  category: ["os","disk-scheduling"], difficulty: "intermediate",
  timeComplexity: "O(n log n)", spaceComplexity: "O(n)",
  description: "SCAN (elevator) algorithm: head moves in one direction serving requests, reaches end, then reverses. Like a building elevator.",
  relatedTopics: ["fcfs-disk","sstf","c-scan","look-disk"],
  pythonCode: scanCode, codeSteps: [],
  defaultInput: { requests: [98,183,37,122,14,124,65,67], initial: 53, direction: "up" },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { requests, initial, direction = "up" } = input;
    const maxCyl = 199;
    const allPos = [...new Set([initial, ...requests, 0, maxCyl])].sort((a,b) => a-b);
    let head = initial;
    let totalSeek = 0;

    const left = requests.filter(r => r < initial).sort((a,b) => b-a);
    const right = requests.filter(r => r >= initial).sort((a,b) => a-b);
    const serviced = new Set<number>();

    array1dStep(steps, `SCAN start. Head=${initial}, direction=${direction}. Will go to end then reverse.`, allPos.map(p => ({ val: p, state: p === head ? "active" : requests.includes(p) ? "highlighted" : "default" })), "Disk (0-199)", { head, direction, totalSeek });

    const order = direction === "up" ? [...right, maxCyl, ...left] : [...left, 0, ...right];

    for (const target of order) {
      const seek = Math.abs(target - head);
      totalSeek += seek;
      const prev = head;
      head = target;
      const isEnd = target === 0 || target === maxCyl;
      const msg = isEnd ? `Reach end (${target}). Reverse direction. Total seek=${totalSeek}.` : `Serve ${target} (seek=${seek} from ${prev}). Total=${totalSeek}.`;
      if (isEnd || requests.includes(target)) {
        if (!isEnd) serviced.add(target);
        array1dStep(steps, msg, allPos.map(p => ({ val: p, state: p === head ? "active" : serviced.has(p) ? "sorted" : requests.includes(p) ? "highlighted" : "default" })), "Disk (0-199)", { head, seek, totalSeek }, [{ index: allPos.indexOf(head), label: "head" }]);
      }
    }

    array1dStep(steps, `SCAN complete. Total seek distance: ${totalSeek}.`, allPos.map(p => ({ val: p, state: "default" })), "Disk", { totalSeek, done: true });
    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   C-SCAN DISK
═══════════════════════════════════════════════════════════════════════════ */

const cScanCode = `def c_scan(requests, initial, max_cyl=199):
    head = initial; total = 0
    left = sorted([r for r in requests if r < head])
    right = sorted([r for r in requests if r >= head])
    # Go up to max_cyl, jump to 0, continue upward
    order = right + [max_cyl, 0] + left
    prev = head
    for r in order:
        total += abs(r - prev); prev = r
    return total`;

export const cScanModule: VisualizationModule<DiskInput> = {
  id: "c-scan", slug: "c-scan", title: "C-SCAN Disk Scheduling",
  category: ["os","disk-scheduling"], difficulty: "intermediate",
  timeComplexity: "O(n log n)", spaceComplexity: "O(n)",
  description: "C-SCAN: moves head upward, jumps back to 0 at the end (without serving on the way back), providing more uniform wait times than SCAN.",
  relatedTopics: ["scan-disk","look-disk","sstf"],
  pythonCode: cScanCode, codeSteps: [],
  defaultInput: { requests: [98,183,37,122,14,124,65,67], initial: 53 },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { requests, initial } = input;
    const maxCyl = 199;
    const allPos = [...new Set([initial, ...requests, 0, maxCyl])].sort((a,b) => a-b);
    let head = initial;
    let totalSeek = 0;
    const serviced = new Set<number>();

    array1dStep(steps, `C-SCAN start. Head=${initial}. Move up, jump to 0, continue up.`, allPos.map(p => ({ val: p, state: p === head ? "active" : requests.includes(p) ? "highlighted" : "default" })), "Disk (0-199)", { head, totalSeek });

    const right = requests.filter(r => r >= initial).sort((a,b) => a-b);
    const left = requests.filter(r => r < initial).sort((a,b) => a-b);
    const order = [...right, maxCyl, 0, ...left];

    for (const target of order) {
      const seek = Math.abs(target - head);
      totalSeek += seek;
      const prev = head;
      head = target;
      const isJump = target === 0 || target === maxCyl;
      if (isJump) {
        array1dStep(steps, target === maxCyl ? `Reach max (${maxCyl}). Jump to 0 (circular). Total=${totalSeek}.` : `Jump to 0 — start upward scan again.`, allPos.map(p => ({ val: p, state: p === head ? "active" : serviced.has(p) ? "sorted" : requests.includes(p) ? "highlighted" : "default" })), "Disk (0-199)", { head, totalSeek });
      } else {
        serviced.add(target);
        array1dStep(steps, `Serve ${target} (seek=${seek} from ${prev}). Total=${totalSeek}.`, allPos.map(p => ({ val: p, state: p === head ? "active" : serviced.has(p) ? "sorted" : requests.includes(p) ? "highlighted" : "default" })), "Disk (0-199)", { head, seek, totalSeek }, [{ index: allPos.indexOf(head), label: "head" }]);
      }
    }

    array1dStep(steps, `C-SCAN complete. Total seek: ${totalSeek}.`, allPos.map(p => ({ val: p, state: "default" })), "Disk", { totalSeek, done: true });
    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   LOOK DISK
═══════════════════════════════════════════════════════════════════════════ */

const lookCode = `def look(requests, initial, direction="up"):
    head = initial; total = 0
    left = sorted([r for r in requests if r < head], reverse=True)
    right = sorted([r for r in requests if r >= head])
    # Unlike SCAN, doesn't go to physical end—stops at last request
    order = (right + left) if direction=="up" else (left + right)
    prev = head
    for r in order:
        total += abs(r - prev); prev = r
    return total`;

export const lookDiskModule: VisualizationModule<DiskInput> = {
  id: "look-disk", slug: "look-disk", title: "LOOK Disk Scheduling",
  category: ["os","disk-scheduling"], difficulty: "intermediate",
  timeComplexity: "O(n log n)", spaceComplexity: "O(n)",
  description: "LOOK: like SCAN but stops at the last request in each direction instead of going to the physical disk end. More efficient than SCAN.",
  relatedTopics: ["scan-disk","c-scan","sstf"],
  pythonCode: lookCode, codeSteps: [],
  defaultInput: { requests: [98,183,37,122,14,124,65,67], initial: 53, direction: "up" },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { requests, initial, direction = "up" } = input;
    const allPos = [...new Set([initial, ...requests])].sort((a,b) => a-b);
    let head = initial;
    let totalSeek = 0;
    const serviced = new Set<number>();

    array1dStep(steps, `LOOK start. Head=${initial}. Like SCAN but stops at last request, not disk end.`, allPos.map(p => ({ val: p, state: p === head ? "active" : requests.includes(p) ? "highlighted" : "default" })), "Disk Positions", { head, totalSeek });

    const right = requests.filter(r => r >= initial).sort((a,b) => a-b);
    const left = requests.filter(r => r < initial).sort((a,b) => b-a);
    const order = direction === "up" ? [...right, ...left] : [...left, ...right];

    let phase = direction === "up" ? "up" : "down";
    let switchedAt: number|null = null;

    for (const target of order) {
      const seek = Math.abs(target - head);
      totalSeek += seek;
      const prev = head;
      // Detect direction switch
      if (direction === "up" && target < prev && switchedAt === null) {
        switchedAt = prev;
        steps[steps.length-1] && array1dStep(steps, `Reached last up-request (${switchedAt}). Reversing direction.`, allPos.map(p => ({ val: p, state: p === head ? "active" : serviced.has(p) ? "sorted" : requests.includes(p) ? "highlighted" : "default" })), "Disk Positions", { head, totalSeek });
      }
      head = target;
      serviced.add(target);
      array1dStep(steps, `Serve ${target} (seek=${seek} from ${prev}). Total=${totalSeek}.`, allPos.map(p => ({ val: p, state: p === head ? "active" : serviced.has(p) ? "sorted" : requests.includes(p) ? "highlighted" : "default" })), "Disk Positions", { head, seek, totalSeek }, [{ index: allPos.indexOf(head), label: "head" }]);
    }

    array1dStep(steps, `LOOK complete. Total seek: ${totalSeek}. (Less than SCAN — no wasted travel to disk ends)`, allPos.map(p => ({ val: p, state: "default" })), "Disk", { totalSeek, done: true });
    return steps;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   MUTEX
═══════════════════════════════════════════════════════════════════════════ */

const mutexCode = `# Mutex (Mutual Exclusion Lock)
mutex = Mutex()  # locked=False initially

# Thread 1:
mutex.lock()    # acquire
  # --- critical section ---
  x += 1
mutex.unlock()  # release

# Thread 2:
mutex.lock()    # blocks if locked
  # --- critical section ---
  x += 1
mutex.unlock()`;

export const mutexModule: VisualizationModule<null> = {
  id: "mutex", slug: "mutex", title: "Mutex",
  category: ["os","synchronization"], difficulty: "beginner",
  timeComplexity: "O(1) per lock/unlock", spaceComplexity: "O(1)",
  description: "Mutex (mutual exclusion lock): only one thread can hold the lock at a time. Other threads block until the lock is released.",
  relatedTopics: ["semaphore","monitor","producer-consumer"],
  pythonCode: mutexCode, codeSteps: [],
  defaultInput: null,
  generateSteps() {
    return buildFlowSteps(
      ["Thread 1","Mutex","Thread 2"],
      [
        { from:"Thread 1", to:"Mutex", label:"lock()", color:"#6366f1",
          description:"Thread 1 calls mutex.lock(). Mutex is free → Thread 1 acquires lock (mutex.locked=true).", lines:[5],
          variables:{ mutex_state:"LOCKED", holder:"Thread 1", Thread2:"running (not in CS)" } },
        { from:"Thread 1", to:"Mutex", label:"→ Critical Section", color:"#10b981",
          description:"Thread 1 enters critical section (x += 1). Thread 2 cannot enter yet.", lines:[6,7],
          variables:{ mutex_state:"LOCKED", in_cs:"Thread 1", x:"being modified" } },
        { from:"Thread 2", to:"Mutex", label:"lock() → BLOCKS", color:"#ef4444",
          description:"Thread 2 calls mutex.lock(). Mutex is locked → Thread 2 BLOCKS (added to wait queue).", lines:[11],
          variables:{ mutex_state:"LOCKED", Thread2:"BLOCKED", wait_queue:["Thread 2"] } },
        { from:"Thread 1", to:"Mutex", label:"unlock()", color:"#6366f1",
          description:"Thread 1 exits critical section and calls unlock(). Mutex released, Thread 2 woken up.", lines:[8],
          variables:{ mutex_state:"UNLOCKED", Thread1:"done with CS" } },
        { from:"Mutex", to:"Thread 2", label:"wake up Thread 2", color:"#10b981",
          description:"Mutex wakes Thread 2 (from wait queue). Thread 2 acquires lock.", lines:[11,12],
          variables:{ mutex_state:"LOCKED", holder:"Thread 2" } },
        { from:"Thread 2", to:"Mutex", label:"→ Critical Section", color:"#10b981",
          description:"Thread 2 enters critical section (x += 1). Mutual exclusion maintained — only one at a time.", lines:[12,13],
          variables:{ mutex_state:"LOCKED", in_cs:"Thread 2", x:"being modified" } },
        { from:"Thread 2", to:"Mutex", label:"unlock()", color:"#6366f1",
          description:"Thread 2 finishes and unlocks. Mutex is free again.", lines:[14],
          variables:{ mutex_state:"UNLOCKED", done:true } },
      ],
    );
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   SEMAPHORE
═══════════════════════════════════════════════════════════════════════════ */

const semCode = `# Counting Semaphore
sem = Semaphore(3)  # allows 3 concurrent access

# Producer: signal (post/V)
def producer():
    item = produce()
    sem.signal()  # V(sem): sem.count += 1

# Consumer: wait (P)
def consumer():
    sem.wait()    # P(sem): if count>0: count-=1, else block
    item = consume()

# Binary Semaphore (mutex-like)
bin_sem = Semaphore(1)
bin_sem.wait()   # acquire
# critical section
bin_sem.signal() # release`;

export const semaphoreModule: VisualizationModule<null> = {
  id: "semaphore", slug: "semaphore", title: "Semaphore",
  category: ["os","synchronization"], difficulty: "intermediate",
  timeComplexity: "O(1) per op", spaceComplexity: "O(1)",
  description: "Semaphore: counting synchronization primitive. V(signal) increments; P(wait) decrements or blocks. Used for mutual exclusion and signaling.",
  relatedTopics: ["mutex","monitor","producer-consumer"],
  pythonCode: semCode, codeSteps: [],
  defaultInput: null,
  generateSteps() {
    return buildFlowSteps(
      ["Producer","Semaphore","Consumer"],
      [
        { from:"Producer", to:"Semaphore", label:"Initial: sem=0", color:"#6b7280",
          description:"Binary semaphore initialized to 0 (Producer-Consumer signaling pattern). Producer must signal before consumer can proceed.", lines:[2],
          variables:{ sem_count:0, type:"binary_signal" } },
        { from:"Producer", to:"Semaphore", label:"V(sem) — signal", color:"#10b981",
          description:"Producer produces item and calls V(sem)/signal. Increments sem count: 0→1. Wakes any waiting consumer.", lines:[6,7],
          variables:{ sem_count:1, action:"signal", item:"produced" } },
        { from:"Semaphore", to:"Consumer", label:"wake Consumer", color:"#10b981",
          description:"Semaphore > 0, so Consumer (if waiting) is woken. Consumer calls P(sem)/wait.", lines:[10],
          variables:{ sem_count:1, consumer:"awake" } },
        { from:"Consumer", to:"Semaphore", label:"P(sem) — wait", color:"#6366f1",
          description:"Consumer calls P(sem)/wait. Count > 0 → decrement: 1→0. Consumer proceeds to consume.", lines:[10,11],
          variables:{ sem_count:0, action:"wait/consume" } },
        { from:"Consumer", to:"Semaphore", label:"P(sem) — BLOCKS", color:"#ef4444",
          description:"Consumer tries P(sem) again but count=0. Consumer BLOCKS until Producer signals again.", lines:[10],
          variables:{ sem_count:0, consumer:"BLOCKED", waiting:true } },
        { from:"Producer", to:"Semaphore", label:"V(sem) — signal again", color:"#10b981",
          description:"Producer produces another item. V(sem) increments count, wakes blocked Consumer.", lines:[6,7],
          variables:{ sem_count:1, action:"signal_again" } },
        { from:"Semaphore", to:"Consumer", label:"unblock Consumer", color:"#10b981",
          description:"Consumer unblocked. Decrements semaphore and consumes item.", lines:[10,11],
          variables:{ sem_count:0, done:true } },
      ],
    );
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   MONITOR
═══════════════════════════════════════════════════════════════════════════ */

const monitorCode = `# Monitor — high-level synchronization
# Only ONE thread active inside monitor at a time
# Condition variables: wait() and signal()

monitor BoundedBuffer:
    buffer = []; capacity = 5
    not_full  = Condition()  # wait when full
    not_empty = Condition()  # wait when empty

    def produce(item):
        if len(buffer) == capacity:
            not_full.wait()   # release monitor, block
        buffer.append(item)
        not_empty.signal()    # wake a waiting consumer

    def consume():
        if not buffer:
            not_empty.wait()  # release monitor, block
        item = buffer.pop(0)
        not_full.signal()     # wake a waiting producer
        return item`;

export const monitorModule: VisualizationModule<null> = {
  id: "monitor", slug: "monitor", title: "Monitor",
  category: ["os","synchronization"], difficulty: "intermediate",
  timeComplexity: "O(1) per op", spaceComplexity: "O(buffer)",
  description: "Monitor: high-level synchronization construct with mutual exclusion built in. Condition variables let threads wait/signal within the monitor.",
  relatedTopics: ["semaphore","mutex","producer-consumer"],
  pythonCode: monitorCode, codeSteps: [],
  defaultInput: null,
  generateSteps() {
    return buildFlowSteps(
      ["Producer","Monitor","Consumer"],
      [
        { from:"Producer", to:"Monitor", label:"produce(item)", color:"#6366f1",
          description:"Producer enters monitor (auto-locked). Checks if buffer is full.", lines:[10,11],
          variables:{ monitor_lock:"Producer holds", buffer_size:0, capacity:5 } },
        { from:"Monitor", to:"Producer", label:"buffer not full → append", color:"#10b981",
          description:"Buffer not full → append item to buffer. Signal not_empty to wake any waiting consumer.", lines:[12,13],
          variables:{ action:"append", buffer_size:1 } },
        { from:"Monitor", to:"Consumer", label:"not_empty.signal()", color:"#10b981",
          description:"not_empty.signal() — if a consumer is waiting on not_empty, wake it.", lines:[13],
          variables:{ signaled:"not_empty", consumer:"woken" } },
        { from:"Consumer", to:"Monitor", label:"consume()", color:"#f59e0b",
          description:"Consumer enters monitor. Checks if buffer is empty.", lines:[16,17],
          variables:{ monitor_lock:"Consumer holds" } },
        { from:"Monitor", to:"Consumer", label:"buffer not empty → pop", color:"#10b981",
          description:"Buffer not empty → pop item. Signal not_full to wake any waiting producer.", lines:[18,19,20],
          variables:{ action:"pop", buffer_size:0 } },
        { from:"Producer", to:"Monitor", label:"produce (buffer full)", color:"#ef4444",
          description:"Producer enters monitor but buffer is full (capacity=5). Calls not_full.wait() — releases monitor and blocks.", lines:[10,11,12],
          variables:{ buffer_size:5, action:"not_full.wait()", producer:"BLOCKED" } },
        { from:"Monitor", to:"Producer", label:"not_full.signal() → unblock", color:"#10b981",
          description:"After consumer pops, it signals not_full. Producer wakes up, re-acquires monitor, appends item.", lines:[19],
          variables:{ producer:"UNBLOCKED", buffer_size:4 } },
      ],
    );
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   PRODUCER-CONSUMER
═══════════════════════════════════════════════════════════════════════════ */

const pcCode = `# Producer-Consumer with bounded buffer (semaphores)
empty = Semaphore(BUFFER_SIZE)  # empty slots
full  = Semaphore(0)             # filled slots
mutex = Semaphore(1)             # mutual exclusion

def producer():
    while True:
        item = produce()
        empty.wait()    # wait for empty slot
        mutex.wait()    # enter critical section
        buffer.append(item)
        mutex.signal()  # exit critical section
        full.signal()   # signal filled slot

def consumer():
    while True:
        full.wait()     # wait for filled slot
        mutex.wait()    # enter critical section
        item = buffer.pop(0)
        mutex.signal()  # exit critical section
        empty.signal()  # signal empty slot
        consume(item)`;

type PCInput = { bufferSize: number; produce: number; consume: number };

export const producerConsumerModule: VisualizationModule<PCInput> = {
  id: "producer-consumer", slug: "producer-consumer", title: "Producer-Consumer",
  category: ["os","synchronization"], difficulty: "intermediate",
  timeComplexity: "O(n)", spaceComplexity: "O(buffer)",
  description: "Classic producer-consumer with bounded buffer using three semaphores: empty, full, and mutex for correct synchronization.",
  relatedTopics: ["semaphore","mutex","readers-writers"],
  pythonCode: pcCode, codeSteps: [],
  defaultInput: { bufferSize: 3, produce: 5, consume: 4 },
  generateSteps(input) {
    const { bufferSize, produce, consume } = input;
    const defs: FlowStepDef[] = [];
    let buffer = 0;
    let produced = 0;
    let consumed = 0;
    let full = 0;
    let empty = bufferSize;

    defs.push({ from:"Producer", to:"Buffer", label:`Init: empty=${bufferSize}, full=0, buffer=[]`, color:"#6b7280",
      description:`Initialize: buffer size=${bufferSize}. empty sem=${bufferSize}, full sem=0.`, lines:[2,3,4],
      variables:{ empty, full, buffer:"[]", bufferSize } });

    let p = 0, c = 0;
    while (p < produce || c < consume) {
      if (p < produce) {
        if (empty > 0) {
          empty--; buffer++; full++; produced++;
          defs.push({ from:"Producer", to:"Buffer", label:`Produce item ${produced}`, color:"#6366f1",
            description:`Producer: empty.wait() (empty=${empty}) → add item to buffer. full.signal() (full=${full}).`, lines:[8,9,10,11,12],
            variables:{ produced, buffer, empty, full } });
        } else {
          defs.push({ from:"Producer", to:"Buffer", label:"Buffer full → Producer waits", color:"#ef4444",
            description:`Buffer full (empty=0). Producer blocks on empty.wait().`, lines:[9],
            variables:{ produced, buffer, empty:0, full, producer:"BLOCKED" } });
        }
        p++;
      }
      if (c < consume && buffer > 0) {
        full--; buffer--; empty++; consumed++;
        defs.push({ from:"Buffer", to:"Consumer", label:`Consume item ${consumed}`, color:"#10b981",
          description:`Consumer: full.wait() (full=${full}) → pop item from buffer. empty.signal() (empty=${empty}).`, lines:[16,17,18,19,20],
          variables:{ consumed, buffer, empty, full } });
        c++;
      }
      if (defs.length > 30) break;
    }

    return buildFlowSteps(["Producer","Buffer","Consumer"], defs);
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   READERS-WRITERS
═══════════════════════════════════════════════════════════════════════════ */

const rwCode = `# Readers-Writers Problem (First Readers Preference)
read_count = 0
mutex   = Semaphore(1)  # protects read_count
rw_lock = Semaphore(1)  # exclusive access for writers

def reader():
    mutex.wait()
    read_count += 1
    if read_count == 1:
        rw_lock.wait()  # first reader locks out writers
    mutex.signal()
    # --- read data ---
    mutex.wait()
    read_count -= 1
    if read_count == 0:
        rw_lock.signal()  # last reader releases for writers
    mutex.signal()

def writer():
    rw_lock.wait()   # exclusive access
    # --- write data ---
    rw_lock.signal()`;

export const readersWritersModule: VisualizationModule<null> = {
  id: "readers-writers", slug: "readers-writers", title: "Readers-Writers",
  category: ["os","synchronization"], difficulty: "intermediate",
  timeComplexity: "O(1) per op", spaceComplexity: "O(1)",
  description: "Readers-Writers: multiple concurrent readers allowed; writers need exclusive access. First readers preference — readers can starve writers.",
  relatedTopics: ["mutex","semaphore","dining-philosophers"],
  pythonCode: rwCode, codeSteps: [],
  defaultInput: null,
  generateSteps() {
    return buildFlowSteps(
      ["Reader 1","Reader 2","Writer","rw_lock"],
      [
        { from:"Reader 1", to:"rw_lock", label:"R1 enters (count=1→lock)", color:"#6366f1",
          description:"Reader 1: increment read_count to 1. First reader → acquire rw_lock to lock out writers.", lines:[7,8,9,10,11],
          variables:{ read_count:1, rw_lock:"LOCKED by Reader 1", writers:"blocked" } },
        { from:"Reader 2", to:"rw_lock", label:"R2 enters (count=2)", color:"#6366f1",
          description:"Reader 2: increment read_count to 2. Not first reader → no need to re-acquire rw_lock. Both readers read concurrently.", lines:[7,8,9,11],
          variables:{ read_count:2, rw_lock:"still locked", concurrent_readers:2 } },
        { from:"Writer", to:"rw_lock", label:"Writer → BLOCKS", color:"#ef4444",
          description:"Writer tries rw_lock.wait(). rw_lock is held by readers → Writer BLOCKS. Readers have preference.", lines:[18],
          variables:{ writer:"BLOCKED", read_count:2, rw_lock:"held by readers" } },
        { from:"Reader 1", to:"rw_lock", label:"R1 exits (count=1)", color:"#6366f1",
          description:"Reader 1 finishes. Decrement read_count to 1. Not last reader → don't release rw_lock yet.", lines:[13,14,15,16],
          variables:{ read_count:1, rw_lock:"still locked" } },
        { from:"Reader 2", to:"rw_lock", label:"R2 exits (count=0→unlock)", color:"#10b981",
          description:"Reader 2 finishes. Decrement read_count to 0. Last reader → release rw_lock. Writer can now proceed.", lines:[13,14,15,16],
          variables:{ read_count:0, rw_lock:"RELEASED" } },
        { from:"rw_lock", to:"Writer", label:"Wake Writer", color:"#10b981",
          description:"rw_lock released → Writer unblocked. Writer acquires exclusive access.", lines:[18,19,20],
          variables:{ writer:"WRITING", rw_lock:"LOCKED by Writer", readers:"blocked" } },
        { from:"Writer", to:"rw_lock", label:"Writer done → unlock", color:"#f59e0b",
          description:"Writer finishes and releases rw_lock. New readers/writers can proceed.", lines:[20],
          variables:{ writer:"done", rw_lock:"FREE" } },
      ],
    );
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   DINING PHILOSOPHERS
═══════════════════════════════════════════════════════════════════════════ */

const diningCode = `# Dining Philosophers — 5 philosophers, 5 forks
# Solution: allow at most 4 philosophers to sit (prevent circular wait)
forks = [Semaphore(1) for _ in range(5)]
room  = Semaphore(4)  # at most 4 in dining room

def philosopher(i):
    while True:
        think()
        room.wait()            # enter dining room
        forks[i].wait()        # pick up left fork
        forks[(i+1)%5].wait()  # pick up right fork
        eat()
        forks[i].signal()
        forks[(i+1)%5].signal()
        room.signal()`;

export const diningPhilosophersModule: VisualizationModule<null> = {
  id: "dining-philosophers", slug: "dining-philosophers", title: "Dining Philosophers",
  category: ["os","synchronization"], difficulty: "advanced",
  timeComplexity: "O(n)", spaceComplexity: "O(n)",
  description: "5 philosophers, 5 forks. Deadlock if all pick left fork simultaneously. Solution: limit to 4 in room (breaks circular wait).",
  relatedTopics: ["mutex","semaphore","deadlock-detection"],
  pythonCode: diningCode, codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const lanes = ["P0","P1","P2","P3","P4"];
    const defs: FlowStepDef[] = [
      { from:"P0", to:"P1", label:"All thinking", color:"#6b7280",
        description:"Initial state: all 5 philosophers thinking. All 5 forks available. Room semaphore=4.", lines:[7],
        variables:{ state:"thinking", forks:"all free", room:4 } },
      { from:"P0", to:"P2", label:"P0,P1 want to eat", color:"#6366f1",
        description:"P0 and P1 try to enter dining room. Room sem=4, both can enter. P0 picks fork 0 and 1; P1 picks fork 1 and 2.", lines:[8,9,10],
        variables:{ room:2, P0:"eating (forks 0,1)", P1:"eating (forks 1,2)" } },
      { from:"P2", to:"P3", label:"P2,P3 want to eat", color:"#f59e0b",
        description:"P2 and P3 enter room (room=0). P2 picks forks 2,3. P3 picks forks 3,4.", lines:[8,9,10],
        variables:{ room:0, P2:"eating (forks 2,3)", P3:"eating (forks 3,4)" } },
      { from:"P4", to:"P0", label:"P4 BLOCKED (room=0)", color:"#ef4444",
        description:"P4 wants to eat but room semaphore=0. P4 blocks. This prevents circular wait — no deadlock!", lines:[8],
        variables:{ P4:"BLOCKED at room", room:0, deadlock:"prevented" } },
      { from:"P0", to:"P1", label:"P0 eats → releases forks+room", color:"#10b981",
        description:"P0 finishes eating. Releases forks 0,1 and room semaphore. Room=1. P4 may now enter.", lines:[11,12,13],
        variables:{ P0:"thinking", room:1, forks:"0,1 free" } },
      { from:"P4", to:"P0", label:"P4 enters, picks forks 4,0", color:"#6366f1",
        description:"P4 unblocked. Enters room, picks forks 4 and 0, starts eating. Deadlock-free design works!", lines:[8,9,10],
        variables:{ P4:"eating (forks 4,0)", room:0, result:"deadlock-free" } },
    ];
    return buildFlowSteps(lanes, defs);
  },
};
