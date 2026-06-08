import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = OrderedDict()

    def get(self, key):
        if key not in self.cache: return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key, val):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = val
        if len(self.cache) > self.cap:
            self.cache.popitem(last=False)`;

type LRUOp =
  | { type: "put"; key: number; val: number }
  | { type: "get"; key: number };

export const lruCacheModule: VisualizationModule<{
  capacity: number;
  operations: LRUOp[];
}> = {
  id: "data-structures-advanced-lru-cache",
  slug: "lru-cache",
  title: "LRU Cache",
  category: ["data-structures", "advanced"],
  difficulty: "advanced",
  timeComplexity: "O(1) get/put",
  spaceComplexity: "O(capacity)",
  description: "Least Recently Used cache evicts the least recently accessed item when full.",
  relatedTopics: ["lfu-cache", "hash-table-linear-probing"],
  pythonCode,
  codeSteps: [],
  defaultInput: {
    capacity: 3,
    operations: [
      { type: "put", key: 1, val: 1 },
      { type: "put", key: 2, val: 2 },
      { type: "get", key: 1 },
      { type: "put", key: 3, val: 3 },
      { type: "get", key: 2 },
      { type: "put", key: 4, val: 4 },
      { type: "get", key: 1 },
      { type: "get", key: 3 },
      { type: "get", key: 4 },
    ],
  },
  generateSteps(input) {
    const { capacity, operations } = input;
    // ordered map: key → val, most recent at end
    const cache = new Map<number, number>();
    const steps: AnimationStep[] = [];

    const snap = (desc: string, activeKey: number | null, lines: number[], vars: Record<string, unknown>) => {
      const entries = [...cache.entries()].reverse(); // most recent first
      steps.push({
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: lines,
        visualState: {
          type: "array1d",
          cells: entries.map(([k, v]) => ({
            val: `${k}:${v}`,
            state: k === activeKey ? "active" : "default",
          })),
          label: `LRU Cache (capacity=${capacity}) [MRU → LRU]`,
        },
        variables: { cacheSize: cache.size, capacity, ...vars },
      });
    };

    snap("Initialize empty LRU cache.", null, [3, 4, 5, 6], { capacity });

    for (const op of operations) {
      if (op.type === "put") {
        const { key, val } = op;
        if (cache.has(key)) {
          cache.delete(key);
          snap(`put(${key},${val}): key ${key} exists, move to front.`, key, [13, 14], { op: `put(${key},${val})` });
        }
        cache.set(key, val);
        snap(`put(${key},${val}): set key=${key} val=${val}.`, key, [15], { op: `put(${key},${val})` });

        if (cache.size > capacity) {
          const lruKey = cache.keys().next().value;
          cache.delete(lruKey!);
          snap(`Capacity exceeded! Evict LRU key=${lruKey}.`, lruKey ?? null, [16, 17], {
            evicted: lruKey,
          });
        }
      } else {
        const { key } = op;
        if (!cache.has(key)) {
          snap(`get(${key}): key not found → return -1.`, null, [8, 9], { op: `get(${key})`, result: -1 });
        } else {
          const val = cache.get(key)!;
          cache.delete(key);
          cache.set(key, val);
          snap(`get(${key}): found val=${val}. Move to front (MRU).`, key, [10, 11], {
            op: `get(${key})`,
            result: val,
          });
        }
      }
    }

    snap("All operations complete.", null, [], {
      cache: [...cache.entries()].map(([k, v]) => `${k}:${v}`),
    });

    return steps;
  },
};
