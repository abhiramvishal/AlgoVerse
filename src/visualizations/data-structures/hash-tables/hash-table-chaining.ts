import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const TABLE_SIZE = 7;

function hashFn(key: number): number {
  return ((key % TABLE_SIZE) + TABLE_SIZE) % TABLE_SIZE;
}

/* ── Python code ───────────────────────────────────────────────────────────── */
const pythonCode = `class HashTableChaining:
    def __init__(self, size=7):
        self.size = size
        self.table = [[] for _ in range(size)]

    def hash(self, key):
        return key % self.size

    def insert(self, key):
        index = self.hash(key)
        chain = self.table[index]
        if key not in chain:
            chain.append(key)

    def search(self, key):
        index = self.hash(key)
        chain = self.table[index]
        for item in chain:
            if item == key:
                return True
        return False

    def delete(self, key):
        index = self.hash(key)
        chain = self.table[index]
        if key in chain:
            chain.remove(key)`;

/* ── Types ──────────────────────────────────────────────────────────────────── */
interface Bucket {
  index: number;
  chain: { key: number }[];
}

/* ── Step generator ─────────────────────────────────────────────────────────── */
function generateHashTableSteps(inputKeys: number[]): AnimationStep[] {
  const steps: AnimationStep[] = [];

  // Initialize empty table
  const table: number[][] = Array.from({ length: TABLE_SIZE }, () => []);

  function getBuckets(): Bucket[] {
    return table.map((chain, i) => ({
      index: i,
      chain: chain.map((k) => ({ key: k })),
    }));
  }

  function snap(
    desc: string,
    lines: number[],
    highlightedBucket?: number,
    highlightedKey?: number,
    operation?: string,
  ) {
    steps.push({
      stepNumber: steps.length + 1,
      description: desc,
      highlightLines: lines,
      visualState: {
        type: "hashtable",
        buckets: getBuckets(),
        highlightedBucket,
        highlightedKey,
        operation: operation ?? "",
      },
      variables: {
        tableSize: TABLE_SIZE,
        totalKeys: table.reduce((s, c) => s + c.length, 0),
        loadFactor: (
          table.reduce((s, c) => s + c.length, 0) / TABLE_SIZE
        ).toFixed(2),
      },
    });
  }

  snap("Hash Table initialized — 7 empty buckets.", [1, 2, 3, 4]);

  // Insert all keys
  for (const key of inputKeys) {
    const idx = hashFn(key);

    snap(
      `INSERT ${key}: compute hash(${key}) = ${key} % ${TABLE_SIZE} = ${idx}.`,
      [6, 7, 8, 9],
      idx,
      key,
      "insert",
    );

    if (table[idx].includes(key)) {
      snap(`Key ${key} already in bucket [${idx}] — skip duplicate.`, [10, 11], idx, key, "insert");
    } else {
      table[idx].push(key);
      snap(
        `Insert ${key} into bucket [${idx}]. Bucket chain: [${table[idx].join(", ")}].`,
        [11, 12],
        idx,
        key,
        "insert",
      );
    }
  }

  // Search for a key
  const searchKey = inputKeys[1] ?? inputKeys[0];
  const searchIdx = hashFn(searchKey);

  snap(
    `SEARCH ${searchKey}: hash(${searchKey}) = ${searchIdx}. Check bucket [${searchIdx}].`,
    [14, 15, 16, 17],
    searchIdx,
    searchKey,
    "search",
  );

  const chain = table[searchIdx];
  for (const item of chain) {
    snap(
      `Check chain element ${item} — ${item === searchKey ? "MATCH FOUND!" : "not a match."}`,
      [17, 18],
      searchIdx,
      item,
      "search",
    );
    if (item === searchKey) break;
  }

  // Delete a key
  const deleteKey = inputKeys[inputKeys.length - 1];
  const deleteIdx = hashFn(deleteKey);

  snap(
    `DELETE ${deleteKey}: hash = ${deleteIdx}. Locate in bucket [${deleteIdx}].`,
    [21, 22, 23],
    deleteIdx,
    deleteKey,
    "delete",
  );
  table[deleteIdx] = table[deleteIdx].filter((k) => k !== deleteKey);
  snap(
    `Deleted ${deleteKey} from bucket [${deleteIdx}]. Bucket chain: [${table[deleteIdx].join(", ") || "empty"}].`,
    [23, 24],
    deleteIdx,
    undefined,
    "delete",
  );

  snap("Hash Table operations complete.", [25]);

  return steps;
}

/* ── Module ────────────────────────────────────────────────────────────────── */
export const hashTableChainingModule: VisualizationModule<number[]> = {
  id: "hash-table-chaining",
  slug: "hash-table-chaining",
  title: "Hash Table (Chaining)",
  category: ["data-structures", "hash-tables"],
  difficulty: "beginner",
  timeComplexity: "O(1) average, O(n) worst case",
  spaceComplexity: "O(n + m) — n keys, m buckets",
  description:
    "Hash table with separate chaining for collision resolution. Demonstrates insert, search, and delete with the hash function h(k) = k mod m.",
  relatedTopics: ["hash-table-linear-probing", "hash-table-double-hashing", "bloom-filter"],
  pythonCode,
  codeSteps: [],
  defaultInput: [14, 17, 21, 28, 9, 3, 35, 42],
  generateSteps(input) {
    return generateHashTableSteps(input ?? [14, 17, 21, 28, 9, 3]);
  },
};
