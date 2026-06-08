import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type FCFSInput = { name: string; burst: number; arrival: number }[];

const PROCESS_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"];

const DEFAULT_PROCESSES = [
  { name: "P1", burst: 4, arrival: 0 },
  { name: "P2", burst: 3, arrival: 1 },
  { name: "P3", burst: 2, arrival: 2 },
  { name: "P4", burst: 5, arrival: 3 },
];

const pythonCode = `def fcfs(processes):
    time = 0
    timeline = []
    for p in sorted(processes, key=lambda x: x['arrival']):
        if time < p['arrival']:
            time = p['arrival']
        start = time
        time += p['burst']
        timeline.append({'name': p['name'], 'start': start, 'end': time})
    return timeline`;

export const fcfsModule: VisualizationModule<FCFSInput> = {
  id: "os-fcfs",
  slug: "fcfs",
  title: "FCFS Scheduling",
  category: ["os", "scheduling"],
  difficulty: "beginner",
  timeComplexity: "O(n log n)",
  spaceComplexity: "O(n)",
  description: "First-Come First-Served CPU scheduling: processes execute in arrival order.",
  relatedTopics: ["sjf", "round-robin"],
  pythonCode,
  codeSteps: [],
  defaultInput: DEFAULT_PROCESSES,
  generateSteps(input) {
    const procs = input ?? DEFAULT_PROCESSES;
    const steps: AnimationStep[] = [];
    const sorted = [...procs].sort((a, b) => a.arrival - b.arrival);
    const processes = sorted.map((p, i) => ({ name: p.name, color: PROCESS_COLORS[i % PROCESS_COLORS.length] }));
    const timeline: { processName: string; start: number; end: number }[] = [];
    let time = 0;
    const maxTime = sorted.reduce((acc, p) => Math.max(acc, p.arrival) + p.burst, 0);

    steps.push({
      stepNumber: steps.length + 1,
      description: `FCFS: execute processes in arrival order. ${sorted.map((p) => `${p.name}(arr=${p.arrival},burst=${p.burst})`).join(", ")}.`,
      highlightLines: [1, 2, 3],
      visualState: { type: "gantt", processes, timeline: [], currentTime: 0, maxTime },
      variables: { time: 0, queue: sorted.map((p) => p.name).join("→") },
    });

    for (const p of sorted) {
      if (time < p.arrival) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `CPU idle: waiting for ${p.name} to arrive at t=${p.arrival}.`,
          highlightLines: [4, 5],
          visualState: { type: "gantt", processes, timeline: [...timeline], currentTime: time, maxTime },
          variables: { time, waiting: p.name },
        });
        time = p.arrival;
      }

      const start = time;
      steps.push({
        stepNumber: steps.length + 1,
        description: `Start ${p.name} at t=${start}. Burst=${p.burst}. Will finish at t=${start + p.burst}.`,
        highlightLines: [6, 7],
        visualState: { type: "gantt", processes, timeline: [...timeline], currentTime: start, maxTime },
        variables: { process: p.name, start, burst: p.burst, end: start + p.burst },
      });

      time += p.burst;
      timeline.push({ processName: p.name, start, end: time });

      steps.push({
        stepNumber: steps.length + 1,
        description: `${p.name} completes at t=${time}. Turnaround=${time - p.arrival}.`,
        highlightLines: [7, 8],
        visualState: { type: "gantt", processes, timeline: [...timeline], currentTime: time, maxTime },
        variables: { process: p.name, finishTime: time, turnaround: time - p.arrival },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `FCFS complete at t=${time}.`,
      highlightLines: [9],
      visualState: { type: "gantt", processes, timeline: [...timeline], currentTime: time, maxTime },
      variables: { done: true, totalTime: time },
    });

    return steps;
  },
};
