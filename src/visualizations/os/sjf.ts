import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type SJFInput = { name: string; burst: number; arrival: number }[];

const PROCESS_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"];

const DEFAULT_PROCESSES = [
  { name: "P1", burst: 6, arrival: 0 },
  { name: "P2", burst: 2, arrival: 1 },
  { name: "P3", burst: 8, arrival: 2 },
  { name: "P4", burst: 3, arrival: 3 },
];

const pythonCode = `def sjf_non_preemptive(processes):
    time = 0
    timeline = []
    remaining = list(processes)
    while remaining:
        available = [p for p in remaining if p['arrival'] <= time]
        if not available:
            time = min(p['arrival'] for p in remaining)
            continue
        p = min(available, key=lambda x: x['burst'])
        remaining.remove(p)
        start = time
        time += p['burst']
        timeline.append({'name': p['name'], 'start': start, 'end': time})
    return timeline`;

export const sjfModule: VisualizationModule<SJFInput> = {
  id: "os-sjf",
  slug: "sjf",
  title: "SJF Scheduling",
  category: ["os", "scheduling"],
  difficulty: "intermediate",
  timeComplexity: "O(n²)",
  spaceComplexity: "O(n)",
  description: "Shortest Job First (non-preemptive): always picks the shortest available job.",
  relatedTopics: ["fcfs", "srtf"],
  pythonCode,
  codeSteps: [],
  defaultInput: DEFAULT_PROCESSES,
  generateSteps(input) {
    const procs = input ?? DEFAULT_PROCESSES;
    const steps: AnimationStep[] = [];
    const processes = procs.map((p, i) => ({ name: p.name, color: PROCESS_COLORS[i % PROCESS_COLORS.length] }));
    const timeline: { processName: string; start: number; end: number }[] = [];
    const remaining = [...procs];
    let time = 0;
    const maxTime = procs.reduce((acc, p) => acc + p.burst, 0) + 2;

    steps.push({
      stepNumber: steps.length + 1,
      description: `SJF (non-preemptive): always pick shortest available job. Processes: ${procs.map((p) => `${p.name}(burst=${p.burst},arr=${p.arrival})`).join(", ")}.`,
      highlightLines: [1, 2, 3],
      visualState: { type: "gantt", processes, timeline: [], currentTime: 0, maxTime },
      variables: { time: 0 },
    });

    while (remaining.length > 0) {
      const available = remaining.filter((p) => p.arrival <= time);

      if (available.length === 0) {
        const nextArrival = Math.min(...remaining.map((p) => p.arrival));
        steps.push({
          stepNumber: steps.length + 1,
          description: `No available processes at t=${time}. Idle until t=${nextArrival}.`,
          highlightLines: [6, 7],
          visualState: { type: "gantt", processes, timeline: [...timeline], currentTime: time, maxTime },
          variables: { time, nextArrival },
        });
        time = nextArrival;
        continue;
      }

      const p = available.reduce((shortest, curr) => curr.burst < shortest.burst ? curr : shortest);
      remaining.splice(remaining.indexOf(p), 1);

      const start = time;
      steps.push({
        stepNumber: steps.length + 1,
        description: `Available: ${available.map((x) => `${x.name}(burst=${x.burst})`).join(",")}. Pick shortest: ${p.name} (burst=${p.burst}).`,
        highlightLines: [9, 10, 11],
        visualState: { type: "gantt", processes, timeline: [...timeline], currentTime: start, maxTime },
        variables: { selected: p.name, burst: p.burst, start },
      });

      time += p.burst;
      timeline.push({ processName: p.name, start, end: time });

      steps.push({
        stepNumber: steps.length + 1,
        description: `${p.name} executes [${start}..${time}]. Turnaround=${time - p.arrival}.`,
        highlightLines: [11, 12, 13],
        visualState: { type: "gantt", processes, timeline: [...timeline], currentTime: time, maxTime },
        variables: { process: p.name, finishTime: time, turnaround: time - p.arrival },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `SJF complete at t=${time}.`,
      highlightLines: [14],
      visualState: { type: "gantt", processes, timeline: [...timeline], currentTime: time, maxTime },
      variables: { done: true },
    });

    return steps;
  },
};
