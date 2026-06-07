import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type RRInput = { name: string; burst: number; arrival: number }[];

const PROCESS_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"];
const QUANTUM = 2;

const DEFAULT_PROCESSES = [
  { name: "P1", burst: 5, arrival: 0 },
  { name: "P2", burst: 4, arrival: 1 },
  { name: "P3", burst: 2, arrival: 2 },
  { name: "P4", burst: 3, arrival: 3 },
];

const pythonCode = `def round_robin(processes, quantum=2):
    time = 0
    timeline = []
    queue = []
    remaining = {p['name']: p['burst'] for p in processes}
    arrived = set()
    procs = sorted(processes, key=lambda p: p['arrival'])
    i = 0
    while any(r > 0 for r in remaining.values()):
        # Enqueue newly arrived
        while i < len(procs) and procs[i]['arrival'] <= time:
            queue.append(procs[i]['name'])
            arrived.add(procs[i]['name'])
            i += 1
        if not queue:
            time += 1; continue
        p = queue.pop(0)
        run = min(quantum, remaining[p])
        timeline.append({'name': p, 'start': time, 'end': time+run})
        time += run
        remaining[p] -= run
        if remaining[p] > 0:
            queue.append(p)
    return timeline`;

export const roundRobinModule: VisualizationModule<RRInput> = {
  id: "os-round-robin",
  slug: "round-robin",
  title: "Round Robin Scheduling",
  category: ["os", "scheduling"],
  difficulty: "intermediate",
  timeComplexity: "O(n·⌈burst/Q⌉)",
  spaceComplexity: "O(n)",
  description: `Round Robin CPU scheduling with time quantum=${QUANTUM}. Each process gets a fixed time slice.`,
  relatedTopics: ["fcfs", "sjf"],
  pythonCode,
  codeSteps: [],
  defaultInput: DEFAULT_PROCESSES,
  generateSteps(input) {
    const procs = input ?? DEFAULT_PROCESSES;
    const steps: AnimationStep[] = [];
    const processes = procs.map((p, i) => ({ name: p.name, color: PROCESS_COLORS[i % PROCESS_COLORS.length] }));
    const timeline: { processName: string; start: number; end: number }[] = [];
    const remaining: Record<string, number> = {};
    for (const p of procs) remaining[p.name] = p.burst;
    const sorted = [...procs].sort((a, b) => a.arrival - b.arrival);
    const queue: string[] = [];
    let time = 0;
    let i = 0;
    const maxTime = procs.reduce((a, p) => a + p.burst, 0) + 2;

    steps.push({
      stepNumber: steps.length + 1,
      description: `Round Robin (Q=${QUANTUM}): processes get ${QUANTUM}-unit time slices in circular order.`,
      highlightLines: [1, 2, 3],
      visualState: { type: "gantt", processes, timeline: [], currentTime: 0, maxTime },
      variables: { quantum: QUANTUM, n: procs.length },
    });

    let iterations = 0;
    while (Object.values(remaining).some((r) => r > 0)) {
      iterations++;
      if (iterations > 200) break;

      while (i < sorted.length && sorted[i].arrival <= time) {
        queue.push(sorted[i].name);
        i++;
      }

      if (queue.length === 0) {
        time++;
        continue;
      }

      const pName = queue.shift()!;
      if (remaining[pName] <= 0) continue;

      const run = Math.min(QUANTUM, remaining[pName]);
      const start = time;

      while (i < sorted.length && sorted[i].arrival <= time + run) {
        queue.push(sorted[i].name);
        i++;
      }

      steps.push({
        stepNumber: steps.length + 1,
        description: `Run ${pName} for ${run} units [${start}..${start + run}]. Remaining after: ${remaining[pName] - run}.`,
        highlightLines: [14, 15, 16, 17],
        visualState: { type: "gantt", processes, timeline: [...timeline], currentTime: start, maxTime },
        variables: { process: pName, run, start, end: start + run, queueAfter: [...queue].join("→") },
      });

      time += run;
      remaining[pName] -= run;
      timeline.push({ processName: pName, start, end: time });

      if (remaining[pName] > 0) {
        queue.push(pName);
      } else {
        steps.push({
          stepNumber: steps.length + 1,
          description: `${pName} finished at t=${time}!`,
          highlightLines: [18],
          visualState: { type: "gantt", processes, timeline: [...timeline], currentTime: time, maxTime },
          variables: { finished: pName, time },
        });
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Round Robin complete at t=${time}.`,
      highlightLines: [22],
      visualState: { type: "gantt", processes, timeline: [...timeline], currentTime: time, maxTime },
      variables: { done: true, time },
    });

    return steps;
  },
};
