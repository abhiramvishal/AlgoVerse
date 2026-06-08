import type { AnimationStep, VisualizationModule } from "@/types/visualization";

interface Job {
  id: string;
  deadline: number;
  profit: number;
}

type JobSchedulingInput = { jobs: Job[] };

const pythonCode = `def job_scheduling(jobs):
    jobs.sort(key=lambda x: x[2], reverse=True)  # sort by profit desc
    n = len(jobs)
    max_deadline = max(j[1] for j in jobs)
    slots = [None] * (max_deadline + 1)
    total_profit = 0
    scheduled = []
    for job in jobs:
        jid, deadline, profit = job
        for t in range(min(deadline, max_deadline), 0, -1):
            if slots[t] is None:
                slots[t] = jid
                total_profit += profit
                scheduled.append((t, jid, profit))
                break
    return scheduled, total_profit`;

export const jobSchedulingModule: VisualizationModule<JobSchedulingInput> = {
  id: "greedy-job-scheduling",
  slug: "job-scheduling",
  title: "Job Scheduling",
  category: ["algorithms", "greedy"],
  difficulty: "intermediate",
  timeComplexity: "O(n^2)",
  spaceComplexity: "O(n)",
  description:
    "Greedy job scheduling: sort jobs by profit, assign each to the latest available slot before its deadline.",
  relatedTopics: ["activity-selection", "fractional-knapsack"],
  pythonCode,
  codeSteps: [],
  defaultInput: {
    jobs: [
      { id: "J1", deadline: 2, profit: 100 },
      { id: "J2", deadline: 1, profit: 19 },
      { id: "J3", deadline: 2, profit: 27 },
      { id: "J4", deadline: 1, profit: 25 },
      { id: "J5", deadline: 3, profit: 15 },
    ],
  },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const jobs = [...input.jobs].sort((a, b) => b.profit - a.profit);
    const maxDeadline = Math.max(...jobs.map((j) => j.deadline));
    const slots: (string | null)[] = new Array(maxDeadline + 1).fill(null);
    const timeline: { processName: string; start: number; end: number }[] = [];
    const processes = jobs.map((j, i) => ({
      name: j.id,
      color: `hsl(${(i * 47) % 360},70%,55%)`,
    }));
    let totalProfit = 0;

    steps.push({
      stepNumber: steps.length + 1,
      description: `Sort jobs by profit descending. Jobs: ${jobs.map((j) => `${j.id}(d=${j.deadline},p=${j.profit})`).join(", ")}`,
      highlightLines: [1],
      visualState: {
        type: "gantt",
        processes,
        timeline: [],
        currentTime: 0,
        maxTime: maxDeadline,
      },
      variables: { totalProfit: 0, slotsUsed: 0 },
    });

    for (const job of jobs) {
      let scheduled = false;
      for (let t = Math.min(job.deadline, maxDeadline); t >= 1; t--) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Job ${job.id} (profit=${job.profit}): trying slot ${t}...`,
          highlightLines: [7, 8, 9],
          visualState: {
            type: "gantt",
            processes,
            timeline: [...timeline],
            currentTime: t,
            maxTime: maxDeadline,
          },
          variables: { currentJob: job.id, tryingSlot: t, totalProfit },
        });
        if (slots[t] === null) {
          slots[t] = job.id;
          totalProfit += job.profit;
          timeline.push({ processName: job.id, start: t - 1, end: t });
          scheduled = true;
          steps.push({
            stepNumber: steps.length + 1,
            description: `Assigned ${job.id} to slot ${t}. Total profit = ${totalProfit}.`,
            highlightLines: [10, 11, 12],
            visualState: {
              type: "gantt",
              processes,
              timeline: [...timeline],
              currentTime: t,
              maxTime: maxDeadline,
            },
            variables: { currentJob: job.id, assignedSlot: t, totalProfit },
          });
          break;
        }
      }
      if (!scheduled) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Job ${job.id} could not be scheduled (all slots before deadline taken).`,
          highlightLines: [13],
          visualState: {
            type: "gantt",
            processes,
            timeline: [...timeline],
            currentTime: 0,
            maxTime: maxDeadline,
          },
          variables: { currentJob: job.id, scheduled: false, totalProfit },
        });
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Job scheduling complete. Total profit = ${totalProfit}.`,
      highlightLines: [14],
      visualState: {
        type: "gantt",
        processes,
        timeline: [...timeline],
        currentTime: 0,
        maxTime: maxDeadline,
      },
      variables: { totalProfit, scheduledJobs: timeline.length },
    });

    return steps;
  },
};
