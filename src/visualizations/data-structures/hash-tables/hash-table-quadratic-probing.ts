import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `class HashTableQuadraticProbing:
    def __init__(self, size):
        self.size = size
        self.table = [None] * size

    def hash(self, key):
        return key % self.size

    def insert(self, key):
        h = self.hash(key)
        i = 0
        while self.table[(h + i*i) % self.size] is not None:
            i += 1
        self.table[(h + i*i) % self.size] = key`;

export const hashTableQuadraticProbingModule: VisualizationModule<{ keys: number[]; tableSize: number }> = {
  id: "data-structures-hash-tables-quadratic-probing",
  slug: "hash-table-quadratic-probing",
  title: "Hash Table: Quadratic Probing",
  category: ["data-structures", "hash-tables"],
  difficulty: "intermediate",
  timeComplexity: "O(1) average, O(n) worst",
  spaceComplexity: "O(n)",
  description: "Open-addressing hash table that resolves collisions using quadratic probe steps: h(k) + i².",
  relatedTopics: ["hash-table-linear-probing", "hash-table-double-hashing"],
  pythonCode,
  codeSteps: [],
  defaultInput: { keys: [18, 26, 35, 9, 64], tableSize: 7 },
  generateSteps(input) {
    const { keys, tableSize } = input;
    const table: (number | null)[] = new Array(tableSize).fill(null);
    const steps: AnimationStep[] = [];

    steps.push({
      stepNumber: steps.length + 1,
      description: "Initialize empty hash table for quadratic probing.",
      highlightLines: [1, 2, 3, 4],
      visualState: {
        type: "array1d",
        cells: table.map(() => ({ val: "_", state: "default" })),
        label: `Hash Table (size=${tableSize})`,
      },
      variables: { tableSize, keys },
    });

    for (const key of keys) {
      const h = key % tableSize;

      steps.push({
        stepNumber: steps.length + 1,
        description: `Insert ${key}: h(${key}) = ${key} % ${tableSize} = ${h}.`,
        highlightLines: [6, 7],
        visualState: {
          type: "array1d",
          cells: table.map((v, i) => ({
            val: v === null ? "_" : v,
            state: i === h ? "active" : v !== null ? "highlighted" : "default",
          })),
          label: `Hash Table (size=${tableSize})`,
          pointer: [{ index: h, label: `h(${key})` }],
        },
        variables: { key, hash: h },
      });

      let probe = 0;
      let slot = h;
      while (table[slot] !== null) {
        probe++;
        const nextSlot = (h + probe * probe) % tableSize;
        steps.push({
          stepNumber: steps.length + 1,
          description: `Collision at ${slot}. Quadratic probe ${probe}: slot = (${h} + ${probe}²) % ${tableSize} = ${nextSlot}.`,
          highlightLines: [11, 12],
          visualState: {
            type: "array1d",
            cells: table.map((v, i) => ({
              val: v === null ? "_" : v,
              state: i === slot ? "highlighted" : i === nextSlot ? "active" : v !== null ? "computed" : "default",
            })),
            label: `Hash Table (size=${tableSize})`,
            pointer: [{ index: nextSlot, label: `i=${probe}` }],
          },
          variables: { key, probe, slot: nextSlot, formula: `(${h}+${probe}²)%${tableSize}` },
        });
        slot = nextSlot;
      }

      table[slot] = key;
      steps.push({
        stepNumber: steps.length + 1,
        description: `Inserted ${key} at slot ${slot}.`,
        highlightLines: [13],
        visualState: {
          type: "array1d",
          cells: table.map((v, i) => ({
            val: v === null ? "_" : v,
            state: i === slot ? "computed" : v !== null ? "highlighted" : "default",
          })),
          label: `Hash Table (size=${tableSize})`,
        },
        variables: { key, slot, probes: probe },
      });
    }

    return steps;
  },
};
