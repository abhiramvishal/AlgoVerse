import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type GasStationInput = { gas: number[]; cost: number[] };

const pythonCode = `def can_complete_circuit(gas, cost):
    total_gas = 0
    total_cost = 0
    tank = 0
    start = 0
    for i in range(len(gas)):
        total_gas += gas[i]
        total_cost += cost[i]
        tank += gas[i] - cost[i]
        if tank < 0:
            start = i + 1
            tank = 0
    if total_gas >= total_cost:
        return start
    return -1`;

export const gasStationModule: VisualizationModule<GasStationInput> = {
  id: "greedy-gas-station",
  slug: "gas-station",
  title: "Gas Station",
  category: ["algorithms", "greedy"],
  difficulty: "intermediate",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description:
    "Find the starting gas station from which you can complete the circular tour.",
  relatedTopics: ["activity-selection", "minimum-platforms"],
  pythonCode,
  codeSteps: [],
  defaultInput: { gas: [1, 2, 3, 4, 5], cost: [3, 4, 5, 1, 2] },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { gas, cost } = input;
    const n = gas.length;

    steps.push({
      stepNumber: steps.length + 1,
      description: "Start scanning stations. Track current tank level and candidate start.",
      highlightLines: [1, 2, 3, 4],
      visualState: {
        type: "array1d",
        cells: gas.map((g, i) => ({ val: `g${g}/c${cost[i]}`, state: "default" as const })),
        label: "Stations (gas/cost)",
        pointers: [{ index: 0, label: "start=0" }],
      },
      variables: { tank: 0, start: 0, totalGas: 0, totalCost: 0 },
    });

    let tank = 0;
    let start = 0;
    let totalGas = 0;
    let totalCost = 0;

    for (let i = 0; i < n; i++) {
      totalGas += gas[i];
      totalCost += cost[i];
      const net = gas[i] - cost[i];
      tank += net;

      steps.push({
        stepNumber: steps.length + 1,
        description: `Station ${i}: gas=${gas[i]}, cost=${cost[i]}, net=${net}. Tank=${tank}.${tank < 0 ? ` Tank negative! Reset start to ${i + 1}.` : ""}`,
        highlightLines: tank < 0 ? [9, 10, 11] : [8, 9],
        visualState: {
          type: "array1d",
          cells: gas.map((g, idx) => ({
            val: `g${g}/c${cost[idx]}`,
            state: (
              idx === i
                ? "active"
                : idx < start
                ? "default"
                : idx < i
                ? "computed"
                : "default"
            ) as "active" | "computed" | "default",
          })),
          label: `Tank: ${tank < 0 ? "reset!" : tank}  start=${start}`,
          pointers: [{ index: i, label: `i=${i}` }, { index: start, label: "start" }],
        },
        variables: { i, tank: Math.max(tank, 0), start: tank < 0 ? i + 1 : start, totalGas, totalCost },
      });

      if (tank < 0) {
        start = i + 1;
        tank = 0;
      }
    }

    const result = totalGas >= totalCost ? start : -1;
    steps.push({
      stepNumber: steps.length + 1,
      description:
        result === -1
          ? "No valid starting station exists (total gas < total cost)."
          : `Valid starting station: index ${result}.`,
      highlightLines: [12, 13, 14],
      visualState: {
        type: "array1d",
        cells: gas.map((g, idx) => ({
          val: `g${g}/c${cost[idx]}`,
          state: (idx === result ? "computed" : "default") as "computed" | "default",
        })),
        label: result === -1 ? "No solution" : `Start at station ${result}`,
        pointers: result >= 0 ? [{ index: result, label: "START" }] : [],
      },
      variables: { result, totalGas, totalCost },
    });

    return steps;
  },
};
