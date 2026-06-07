import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type Activity = { name: string; start: number; end: number };

const PROCESS_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#a855f7"];

const DEFAULT_ACTIVITIES: Activity[] = [
  { name: "A1", start: 1, end: 3 },
  { name: "A2", start: 2, end: 5 },
  { name: "A3", start: 4, end: 7 },
  { name: "A4", start: 1, end: 8 },
  { name: "A5", start: 6, end: 9 },
  { name: "A6", start: 5, end: 9 },
];

const pythonCode = `def activity_selection(activities):
    # Sort by end time
    sorted_acts = sorted(activities, key=lambda a: a['end'])
    selected = [sorted_acts[0]]
    last_end = sorted_acts[0]['end']

    for act in sorted_acts[1:]:
        if act['start'] >= last_end:
            selected.append(act)
            last_end = act['end']

    return selected`;

export const activitySelectionModule: VisualizationModule<Activity[]> = {
  id: "greedy-activity-selection",
  slug: "activity-selection",
  title: "Activity Selection",
  category: ["algorithms", "greedy"],
  difficulty: "beginner",
  timeComplexity: "O(n log n)",
  spaceComplexity: "O(n)",
  description: "Selects maximum number of non-overlapping activities by greedily choosing earliest-finishing.",
  relatedTopics: ["job-scheduling", "interval-scheduling"],
  pythonCode,
  codeSteps: [],
  defaultInput: DEFAULT_ACTIVITIES,
  generateSteps(input) {
    const activities = input ?? DEFAULT_ACTIVITIES;
    const steps: AnimationStep[] = [];
    const sorted = [...activities].sort((a, b) => a.end - b.end);
    const maxTime = Math.max(...activities.map((a) => a.end)) + 1;
    const allProcesses = activities.map((a, i) => ({ name: a.name, color: PROCESS_COLORS[i % PROCESS_COLORS.length] }));
    const selected: Activity[] = [];
    const selectedTimeline: { processName: string; start: number; end: number }[] = [];

    steps.push({
      stepNumber: steps.length + 1,
      description: `Activity Selection: sort by end time. Sorted: ${sorted.map((a) => `${a.name}[${a.start},${a.end}]`).join(", ")}.`,
      highlightLines: [1, 2],
      visualState: { type: "gantt", processes: allProcesses, timeline: [], currentTime: 0, maxTime },
      variables: { sorted: sorted.map((a) => a.name).join("→") },
    });

    selected.push(sorted[0]);
    selectedTimeline.push({ processName: sorted[0].name, start: sorted[0].start, end: sorted[0].end });
    let lastEnd = sorted[0].end;

    steps.push({
      stepNumber: steps.length + 1,
      description: `Select first activity ${sorted[0].name} [${sorted[0].start}, ${sorted[0].end}]. lastEnd=${lastEnd}.`,
      highlightLines: [3, 4],
      visualState: { type: "gantt", processes: allProcesses, timeline: [...selectedTimeline], currentTime: lastEnd, maxTime },
      variables: { selected: selected.map((a) => a.name).join(","), lastEnd },
    });

    for (let i = 1; i < sorted.length; i++) {
      const act = sorted[i];
      steps.push({
        stepNumber: steps.length + 1,
        description: `Consider ${act.name} [${act.start}, ${act.end}]. start=${act.start} >= lastEnd=${lastEnd}? ${act.start >= lastEnd ? "YES" : "NO"}.`,
        highlightLines: [6, 7],
        visualState: { type: "gantt", processes: allProcesses, timeline: [...selectedTimeline], currentTime: lastEnd, maxTime },
        variables: { checking: act.name, actStart: act.start, lastEnd },
      });

      if (act.start >= lastEnd) {
        selected.push(act);
        selectedTimeline.push({ processName: act.name, start: act.start, end: act.end });
        lastEnd = act.end;
        steps.push({
          stepNumber: steps.length + 1,
          description: `Select ${act.name}! No overlap. lastEnd → ${lastEnd}.`,
          highlightLines: [8, 9],
          visualState: { type: "gantt", processes: allProcesses, timeline: [...selectedTimeline], currentTime: lastEnd, maxTime },
          variables: { selected: selected.map((a) => a.name).join(","), lastEnd },
        });
      } else {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Skip ${act.name} — overlaps with last selected (${act.start} < ${lastEnd}).`,
          highlightLines: [6],
          visualState: { type: "gantt", processes: allProcesses, timeline: [...selectedTimeline], currentTime: lastEnd, maxTime },
          variables: { skipped: act.name },
        });
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Activity Selection complete. Selected ${selected.length} activities: ${selected.map((a) => a.name).join(", ")}.`,
      highlightLines: [11],
      visualState: { type: "gantt", processes: allProcesses, timeline: [...selectedTimeline], currentTime: lastEnd, maxTime },
      variables: { count: selected.length, selected: selected.map((a) => a.name).join(",") },
    });

    return steps;
  },
};
