import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type MinimumPlatformsInput = { arrivals: number[]; departures: number[] };

const pythonCode = `def min_platforms(arrivals, departures):
    arrivals.sort()
    departures.sort()
    n = len(arrivals)
    platforms = 1
    max_platforms = 1
    i, j = 1, 0
    while i < n and j < n:
        if arrivals[i] <= departures[j]:
            platforms += 1
            i += 1
        else:
            platforms -= 1
            j += 1
        max_platforms = max(max_platforms, platforms)
    return max_platforms`;

export const minimumPlatformsModule: VisualizationModule<MinimumPlatformsInput> = {
  id: "greedy-minimum-platforms",
  slug: "minimum-platforms",
  title: "Minimum Platforms",
  category: ["algorithms", "greedy"],
  difficulty: "intermediate",
  timeComplexity: "O(n log n)",
  spaceComplexity: "O(1)",
  description:
    "Find the minimum number of platforms required at a railway station using sorted arrivals and departures.",
  relatedTopics: ["activity-selection", "job-scheduling"],
  pythonCode,
  codeSteps: [],
  defaultInput: {
    arrivals: [900, 940, 950, 1100, 1500, 1800],
    departures: [910, 1200, 1120, 1130, 1900, 2000],
  },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const arr = [...input.arrivals].sort((a, b) => a - b);
    const dep = [...input.departures].sort((a, b) => a - b);
    const n = arr.length;

    steps.push({
      stepNumber: steps.length + 1,
      description: `Sort arrivals: [${arr}] and departures: [${dep}].`,
      highlightLines: [1, 2],
      visualState: {
        type: "array1d",
        cells: [
          ...arr.map((v) => ({ val: `A:${v}`, state: "default" as const })),
          ...dep.map((v) => ({ val: `D:${v}`, state: "highlighted" as const })),
        ],
        label: "Arrivals (A) and Departures (D)",
        pointers: [],
      },
      variables: { platforms: 1, maxPlatforms: 1, i: 1, j: 0 },
    });

    let platforms = 1;
    let maxPlatforms = 1;
    let i = 1;
    let j = 0;

    while (i < n && j < n) {
      if (arr[i] <= dep[j]) {
        platforms++;
        steps.push({
          stepNumber: steps.length + 1,
          description: `Train arrives at ${arr[i]} before departure at ${dep[j]}. Need +1 platform. platforms=${platforms}.`,
          highlightLines: [8, 9, 10],
          visualState: {
            type: "array1d",
            cells: [
              ...arr.map((v, idx) => ({
                val: `A:${v}`,
                state: (idx === i ? "active" : idx < i ? "computed" : "default") as "active" | "computed" | "default",
              })),
              ...dep.map((v, idx) => ({
                val: `D:${v}`,
                state: (idx === j ? "highlighted" : idx < j ? "computed" : "default") as "highlighted" | "computed" | "default",
              })),
            ],
            label: `Current platforms: ${platforms}`,
            pointers: [{ index: i, label: `A[${i}]` }, { index: n + j, label: `D[${j}]` }],
          },
          variables: { platforms, maxPlatforms, i, j },
        });
        i++;
      } else {
        platforms--;
        steps.push({
          stepNumber: steps.length + 1,
          description: `Train departs at ${dep[j]} before arrival at ${arr[i]}. -1 platform. platforms=${platforms}.`,
          highlightLines: [11, 12, 13],
          visualState: {
            type: "array1d",
            cells: [
              ...arr.map((v, idx) => ({
                val: `A:${v}`,
                state: (idx === i ? "active" : idx < i ? "computed" : "default") as "active" | "computed" | "default",
              })),
              ...dep.map((v, idx) => ({
                val: `D:${v}`,
                state: (idx === j ? "highlighted" : idx < j ? "computed" : "default") as "highlighted" | "computed" | "default",
              })),
            ],
            label: `Current platforms: ${platforms}`,
            pointers: [{ index: i, label: `A[${i}]` }, { index: n + j, label: `D[${j}]` }],
          },
          variables: { platforms, maxPlatforms, i, j },
        });
        j++;
      }
      if (platforms > maxPlatforms) maxPlatforms = platforms;
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Minimum platforms required: ${maxPlatforms}.`,
      highlightLines: [14],
      visualState: {
        type: "array1d",
        cells: [{ val: String(maxPlatforms), state: "computed" }],
        label: "Minimum platforms needed",
        pointers: [],
      },
      variables: { maxPlatforms },
    });

    return steps;
  },
};
