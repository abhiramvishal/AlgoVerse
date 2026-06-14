import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `class HashTableDoubleHashing:
    def __init__(self, size):
        self.size = size
        self.table = [None] * size

    def h1(self, key):
        return key % self.size

    def h2(self, key):
        return 1 + (key % (self.size - 1))

    def insert(self, key):
        slot = self.h1(key)
        step = self.h2(key)
        i = 0
        while self.table[(slot + i * step) % self.size] is not None:
            i += 1
        self.table[(slot + i * step) % self.size] = key`;

export const hashTableDoubleHashingModule: VisualizationModule<{ keys: number[]; tableSize: number }> = {
  id: "data-structures-hash-tables-double-hashing",
  slug: "hash-table-double-hashing",
  title: "Hash Table: Double Hashing",
  category: ["data-structures", "hash-tables"],
  difficulty: "advanced",
  timeComplexity: "O(1) average, O(n) worst",
  spaceComplexity: "O(n)",
  description: "Open-addressing with two hash functions: h1(k) + i·h2(k) to reduce clustering.",
  relatedTopics: ["hash-table-linear-probing", "hash-table-quadratic-probing"],
  pythonCode,
  codeSteps: [],
  defaultInput: { keys: [7, 14, 21, 28, 35], tableSize: 7 },
  generateSteps(input) {
    const { keys, tableSize } = input;
    const table: (number | null)[] = new Array(tableSize).fill(null);
    const steps: AnimationStep[] = [];

    const h1 = (k: number) => k % tableSize;
    const h2 = (k: number) => 1 + (k % (tableSize - 1));

    steps.push({
      stepNumber: steps.length + 1,
      description: `Double hashing: h1(k)=k%${tableSize}, h2(k)=1+(k%(${tableSize}-1)).`,
      highlightLines: [1, 2, 3, 4],
      visualState: {
        type: "array1d",
        cells: table.map(() => ({ val: "_", state: "default" })),
        label: `Hash Table (size=${tableSize})`,
      },
      variables: { tableSize },
    });

    for (const key of keys) {
      const s1 = h1(key);
      const s2 = h2(key);

      steps.push({
        stepNumber: steps.length + 1,
        description: `Insert ${key}: h1=${s1}, h2=${s2}. Probe sequence: ${s1}, ${(s1 + s2) % tableSize}, ${(s1 + 2 * s2) % tableSize}...`,
        highlightLines: [12, 13, 14],
        visualState: {
          type: "array1d",
          cells: table.map((v, i) => ({
            val: v === null ? "_" : v,
            state: i === s1 ? "active" : v !== null ? "highlighted" : "default",
          })),
          label: `Hash Table (size=${tableSize})`,
          pointer: [{ index: s1, label: `h1(${key})` }],
        },
        variables: { key, h1: s1, h2: s2 },
      });

      let probe = 0;
      let slot = s1;
      // Guard: stop after tableSize probes (table full / cycle).
      while (table[slot] !== null && probe < tableSize) {
        probe++;
        const nextSlot = (s1 + probe * s2) % tableSize;
        steps.push({
          stepNumber: steps.length + 1,
          description: `Collision at ${slot}. Double-hash probe ${probe}: (${s1}+${probe}×${s2})%${tableSize}=${nextSlot}.`,
          highlightLines: [15, 16],
          visualState: {
            type: "array1d",
            cells: table.map((v, i) => ({
              val: v === null ? "_" : v,
              state: i === slot ? "highlighted" : i === nextSlot ? "active" : v !== null ? "computed" : "default",
            })),
            label: `Hash Table (size=${tableSize})`,
            pointer: [{ index: nextSlot, label: `probe ${probe}` }],
          },
          variables: { key, probe, slot: nextSlot },
        });
        slot = nextSlot;
      }

      if (table[slot] !== null) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Table is full — cannot insert ${key}.`,
          highlightLines: [],
          visualState: {
            type: "array1d",
            cells: table.map((v) => ({ val: v === null ? "_" : v, state: v !== null ? "highlighted" : "default" })),
            label: `Hash Table (size=${tableSize})`,
          },
          variables: { key, status: "table full" },
        });
        break;
      }

      table[slot] = key;
      steps.push({
        stepNumber: steps.length + 1,
        description: `Inserted ${key} at slot ${slot} (after ${probe} collision(s)).`,
        highlightLines: [17],
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

    steps.push({
      stepNumber: steps.length + 1,
      description: `All keys inserted. Table: [${table.map((v) => (v === null ? "_" : v)).join(", ")}]`,
      highlightLines: [],
      visualState: {
        type: "array1d",
        cells: table.map((v) => ({ val: v === null ? "_" : v, state: v !== null ? "computed" : "default" })),
        label: `Hash Table (size=${tableSize})`,
      },
      variables: { table: [...table] },
    });

    return steps;
  },
};
