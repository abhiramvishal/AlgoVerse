import type { AnimationStep, VisualizationModule } from "@/types/visualization";

interface Item {
  weight: number;
  value: number;
}

type FractionalKnapsackInput = { items: Item[]; capacity: number };

const pythonCode = `def fractional_knapsack(items, capacity):
    # Sort by value/weight ratio descending
    items = sorted(items, key=lambda x: x[1]/x[0], reverse=True)
    total_value = 0
    remaining = capacity
    for item in items:
        if remaining <= 0:
            break
        if item[0] <= remaining:
            total_value += item[1]
            remaining -= item[0]
        else:
            fraction = remaining / item[0]
            total_value += item[1] * fraction
            remaining = 0
    return total_value`;

export const fractionalKnapsackModule: VisualizationModule<FractionalKnapsackInput> =
  {
    id: "greedy-fractional-knapsack",
    slug: "fractional-knapsack",
    title: "Fractional Knapsack",
    category: ["algorithms", "greedy"],
    difficulty: "intermediate",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    description:
      "Sort items by value/weight ratio, fill greedily, take fraction of last item if needed.",
    relatedTopics: ["job-scheduling", "activity-selection"],
    pythonCode,
    codeSteps: [],
    defaultInput: {
      items: [
        { weight: 10, value: 60 },
        { weight: 20, value: 100 },
        { weight: 30, value: 120 },
      ],
      capacity: 50,
    },
    generateSteps(input) {
      const steps: AnimationStep[] = [];
      const items = [...input.items].map((item, i) => ({
        ...item,
        ratio: item.value / item.weight,
        origIdx: i,
      }));
      items.sort((a, b) => b.ratio - a.ratio);

      const makeCells = (takenFlags: string[]) =>
        items.map((item, i) => ({
          val: `w${item.weight} v${item.value} r${item.ratio.toFixed(1)}`,
          state: takenFlags[i] ?? "default",
        }));

      steps.push({
        stepNumber: steps.length + 1,
        description: `Sort items by value/weight ratio. Sorted: ${items.map((it) => `(w=${it.weight},v=${it.value},r=${it.ratio.toFixed(2)})`).join(", ")}`,
        highlightLines: [2],
        visualState: {
          type: "array1d",
          cells: makeCells(items.map(() => "default")),
          label: "Items (sorted by ratio)",
          pointers: [],
        },
        variables: { capacity: input.capacity, remaining: input.capacity, totalValue: 0 },
      });

      const takenFlags = items.map(() => "default");
      let remaining = input.capacity;
      let totalValue = 0;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (remaining <= 0) {
          takenFlags[i] = "default";
          steps.push({
            stepNumber: steps.length + 1,
            description: `Knapsack full, skip item w=${item.weight}.`,
            highlightLines: [6, 7],
            visualState: {
              type: "array1d",
              cells: makeCells(takenFlags),
              label: "Items (sorted by ratio)",
              pointers: [{ index: i, label: "skip" }],
            },
            variables: { remaining, totalValue },
          });
          continue;
        }

        if (item.weight <= remaining) {
          totalValue += item.value;
          remaining -= item.weight;
          takenFlags[i] = "computed";
          steps.push({
            stepNumber: steps.length + 1,
            description: `Take full item: w=${item.weight}, v=${item.value}. Remaining capacity=${remaining}, total=${totalValue.toFixed(2)}.`,
            highlightLines: [8, 9, 10],
            visualState: {
              type: "array1d",
              cells: makeCells(takenFlags),
              label: "Items (sorted by ratio)",
              pointers: [{ index: i, label: "taken" }],
            },
            variables: { remaining, totalValue: +totalValue.toFixed(2) },
          });
        } else {
          const fraction = remaining / item.weight;
          totalValue += item.value * fraction;
          takenFlags[i] = "highlighted";
          const prevRemaining = remaining;
          remaining = 0;
          steps.push({
            stepNumber: steps.length + 1,
            description: `Take fraction ${fraction.toFixed(2)} of item w=${item.weight}: value added=${(item.value * fraction).toFixed(2)}. Total=${totalValue.toFixed(2)}.`,
            highlightLines: [11, 12, 13],
            visualState: {
              type: "array1d",
              cells: makeCells(takenFlags),
              label: "Items (sorted by ratio)",
              pointers: [{ index: i, label: `frac ${prevRemaining}/${item.weight}` }],
            },
            variables: { remaining, totalValue: +totalValue.toFixed(2), fraction: +fraction.toFixed(2) },
          });
        }
      }

      steps.push({
        stepNumber: steps.length + 1,
        description: `Fractional knapsack complete. Total value = ${totalValue.toFixed(2)}.`,
        highlightLines: [14],
        visualState: {
          type: "array1d",
          cells: makeCells(takenFlags),
          label: "Final items selected",
          pointers: [],
        },
        variables: { totalValue: +totalValue.toFixed(2) },
      });

      return steps;
    },
  };
