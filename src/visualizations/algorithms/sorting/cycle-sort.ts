import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def cycle_sort(arr):
    writes = 0
    for cycle_start in range(len(arr) - 1):
        item = arr[cycle_start]
        pos = cycle_start
        for i in range(cycle_start + 1, len(arr)):
            if arr[i] < item:
                pos += 1
        if pos == cycle_start:
            continue
        while item == arr[pos]:
            pos += 1
        arr[pos], item = item, arr[pos]
        writes += 1
        while pos != cycle_start:
            pos = cycle_start
            for i in range(cycle_start + 1, len(arr)):
                if arr[i] < item:
                    pos += 1
            while item == arr[pos]:
                pos += 1
            arr[pos], item = item, arr[pos]
            writes += 1
    return arr`;

export const cycleSortModule: VisualizationModule<number[]> = {
  id: "sorting-cycle-sort",
  slug: "cycle-sort",
  title: "Cycle Sort",
  category: ["algorithms", "sorting"],
  difficulty: "advanced",
  timeComplexity: "O(n²)",
  spaceComplexity: "O(1)",
  description: "In-place sort that minimizes the number of writes, useful for memory with limited write cycles.",
  relatedTopics: ["selection-sort", "in-place-algorithms"],
  pythonCode,
  codeSteps: [],
  defaultInput: [1, 8, 3, 9, 10, 2, 4],
  generateSteps(input) {
    const arr = [...input];
    const steps: AnimationStep[] = [];
    const n = arr.length;
    const sorted: number[] = [];
    let writes = 0;

    steps.push({
      stepNumber: steps.length + 1,
      description: "Starting Cycle Sort.",
      highlightLines: [1, 2],
      visualState: { array: [...arr], active: [], sorted: [] },
      variables: { n, writes },
    });

    for (let cycleStart = 0; cycleStart < n - 1; cycleStart++) {
      let item = arr[cycleStart];

      steps.push({
        stepNumber: steps.length + 1,
        description: `Cycle start at index ${cycleStart}, item=${item}. Count elements smaller than item.`,
        highlightLines: [3, 4, 5],
        visualState: { array: [...arr], active: [cycleStart], sorted: [...sorted] },
        variables: { cycleStart, item, writes },
      });

      let pos = cycleStart;
      for (let i = cycleStart + 1; i < n; i++) {
        if (arr[i] < item) pos++;
      }

      if (pos === cycleStart) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Item ${item} is already in correct position ${pos}. Skip.`,
          highlightLines: [8, 9],
          visualState: { array: [...arr], active: [cycleStart], sorted: [...sorted] },
          variables: { cycleStart, item, pos, writes },
        });
        sorted.push(cycleStart);
        continue;
      }

      while (arr[pos] === item) pos++;

      steps.push({
        stepNumber: steps.length + 1,
        description: `Place item=${item} at position ${pos} (value ${arr[pos]} goes to temp).`,
        highlightLines: [11, 12, 13],
        visualState: { array: [...arr], active: [cycleStart, pos], sorted: [...sorted] },
        variables: { cycleStart, item, pos, writes },
      });

      [arr[pos], item] = [item, arr[pos]];
      writes++;

      steps.push({
        stepNumber: steps.length + 1,
        description: `Swapped. arr[${pos}]=${arr[pos]}, item now=${item}. Writes: ${writes}.`,
        highlightLines: [12, 13, 14],
        visualState: { array: [...arr], active: [pos], sorted: [...sorted] },
        variables: { cycleStart, item, pos, writes },
      });

      while (pos !== cycleStart) {
        pos = cycleStart;
        for (let i = cycleStart + 1; i < n; i++) {
          if (arr[i] < item) pos++;
        }
        while (arr[pos] === item) pos++;

        steps.push({
          stepNumber: steps.length + 1,
          description: `Continue cycle: place item=${item} at position ${pos}.`,
          highlightLines: [15, 16, 17, 18, 19],
          visualState: { array: [...arr], active: [cycleStart, pos], sorted: [...sorted] },
          variables: { cycleStart, item, pos, writes },
        });

        [arr[pos], item] = [item, arr[pos]];
        writes++;
      }

      sorted.push(cycleStart);
    }

    sorted.push(n - 1);
    steps.push({
      stepNumber: steps.length + 1,
      description: `Cycle Sort complete. Total writes: ${writes}.`,
      highlightLines: [22],
      visualState: { array: [...arr], active: [], sorted: Array.from({ length: n }, (_, k) => k) },
      variables: { sorted: true, writes },
    });

    return steps;
  },
};
