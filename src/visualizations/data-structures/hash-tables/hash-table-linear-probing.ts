import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `class HashTableLinearProbing:
    def __init__(self, size):
        self.size = size
        self.table = [None] * size

    def hash(self, key):
        return key % self.size

    def insert(self, key):
        i = self.hash(key)
        while self.table[i] is not None:
            i = (i + 1) % self.size  # linear probe
        self.table[i] = key

    def search(self, key):
        i = self.hash(key)
        while self.table[i] is not None:
            if self.table[i] == key:
                return i
            i = (i + 1) % self.size
        return -1`;

export const hashTableLinearProbingModule: VisualizationModule<{ keys: number[]; tableSize: number }> = {
  id: "data-structures-hash-tables-linear-probing",
  slug: "hash-table-linear-probing",
  title: "Hash Table: Linear Probing",
  category: ["data-structures", "hash-tables"],
  difficulty: "intermediate",
  timeComplexity: "O(1) average, O(n) worst",
  spaceComplexity: "O(n)",
  description: "Open-addressing hash table that resolves collisions by probing linearly.",
  relatedTopics: ["hash-table-quadratic-probing", "hash-table-double-hashing"],
  pythonCode,
  codeSteps: [],
  defaultInput: { keys: [5, 25, 15, 6, 10], tableSize: 7 },
  generateSteps(input) {
    const { keys, tableSize } = input;
    const table: (number | null)[] = new Array(tableSize).fill(null);
    const steps: AnimationStep[] = [];

    const snap = (desc: string, probe: number, inserted: number, lines: number[], vars: Record<string, unknown>) => {
      steps.push({
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: lines,
        visualState: {
          type: "array1d",
          cells: table.map((v, i) => ({
            val: v === null ? "_" : v,
            state: i === probe ? "active" : i === inserted ? "computed" : v !== null ? "highlighted" : "default",
          })),
          label: `Hash Table (size=${tableSize})`,
          pointer: probe >= 0 ? [{ index: probe, label: "probe" }] : [],
        },
        variables: { ...vars },
      });
    };

    snap("Initialize empty hash table.", -1, -1, [1, 2, 3, 4], { tableSize, keys });

    for (const key of keys) {
      const h = key % tableSize;
      steps.push({
        stepNumber: steps.length + 1,
        description: `Insert ${key}: hash(${key}) = ${key} % ${tableSize} = ${h}.`,
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

      let i = h;
      let probeCount = 0;
      // Guard: at most tableSize probes — if the table is full, open
      // addressing can't place the key (load factor = 1).
      while (table[i] !== null && probeCount < tableSize) {
        probeCount++;
        snap(
          `Collision at slot ${i} (occupied by ${table[i]}). Probe ${probeCount}: try slot ${(i + 1) % tableSize}.`,
          i,
          -1,
          [10, 11],
          { key, collisionAt: i, probe: probeCount },
        );
        i = (i + 1) % tableSize;
      }

      if (table[i] !== null) {
        snap(`Table is full — cannot insert ${key} (load factor = 1).`, -1, -1, [], {
          key,
          status: "table full",
        });
        break;
      }

      table[i] = key;
      snap(`Inserted ${key} at slot ${i}.`, i, i, [12], { key, slot: i, probes: probeCount });
    }

    snap(`All keys inserted: [${table.map((v) => (v === null ? "_" : v)).join(", ")}]`, -1, -1, [], {
      table: [...table],
    });

    return steps;
  },
};
