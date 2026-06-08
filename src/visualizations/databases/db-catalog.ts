import type { AnimationStep, VisualizationModule } from "@/types/visualization";

// ── B-Tree Index ──────────────────────────────────────────────────────────────
export const btreeIndexModule: VisualizationModule<null> = {
  id: "db-btree-index", slug: "btree-index", title: "B-Tree Index",
  category: ["databases", "indexing"], difficulty: "intermediate",
  timeComplexity: "O(log n)", spaceComplexity: "O(n)",
  description: "PostgreSQL/MySQL default index: B-Tree supports range queries, ORDER BY, equality. Keeps data sorted on disk pages.",
  relatedTopics: [],
  pythonCode: `# B-Tree Index (database style)
# Used by: PostgreSQL, MySQL InnoDB

# Create index
CREATE INDEX idx_age ON users(age);

# B-Tree structure: sorted keys in leaf pages
# Internal pages guide search, leaf pages store (key → row_ptr)

# Equality search: WHERE age = 25
# Start at root, follow child pointers → O(log n)

# Range search: WHERE age BETWEEN 20 AND 30
# Find leftmost leaf (age=20), scan right → O(log n + k)

# Composite index: CREATE INDEX ON orders(user_id, created_at)
# Can use for: WHERE user_id=5 AND created_at > '2024-01-01'
# Cannot use for: WHERE created_at > '2024-01-01' (leftmost prefix rule)`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const keys = [10, 20, 30, 40, 50, 60, 70, 80];

    steps.push({
      stepNumber: 1,
      description: "B-Tree Index: sorted keys in leaf pages, internal nodes guide search. O(log n) equality + range queries. Used by PostgreSQL, MySQL InnoDB.",
      highlightLines: [4, 5],
      visualState: {
        type: "tree",
        nodes: [{ id: 40, label: "Root:[40]", x: 250, y: 50, left: 1, right: 2 },
          { id: 1, label: "[10,20,30]", x: 120, y: 150 },
          { id: 2, label: "[50,60,70,80]", x: 380, y: 150 }],
        highlighted: [40], comparing: [], inserted: [40, 1, 2], found: [],
      },
      variables: { type: "B-Tree", order: 4, height: 2 },
    });

    steps.push({
      stepNumber: 2,
      description: "Equality search: WHERE age = 25. Start at root (40), 25 < 40 → go left. Leaf [10,20,30] → scan for 25. O(log n) = 2 comparisons.",
      highlightLines: [9, 10],
      visualState: {
        type: "tree",
        nodes: [{ id: 40, label: "Root:[40]", x: 250, y: 50, left: 1, right: 2 },
          { id: 1, label: "[10,20,30]", x: 120, y: 150 },
          { id: 2, label: "[50,60,70,80]", x: 380, y: 150 }],
        highlighted: [1], comparing: [40], inserted: [40, 1, 2], found: [],
      },
      variables: { query: "age=25", path: "root→left-leaf", comparisons: 2 },
    });

    steps.push({
      stepNumber: 3,
      description: "Range query: WHERE age BETWEEN 20 AND 50. Find key=20 in left leaf, scan right across leaf pages. O(log n + k) where k=result count.",
      highlightLines: [12, 13],
      visualState: {
        type: "array1d",
        cells: keys.map((k) => ({
          val: k,
          state: k >= 20 && k <= 50 ? "computed" as const : "default" as const,
        })),
        label: "Leaf pages (sorted) — range scan",
      },
      variables: { range: "20-50", matches: 4, scan: "sequential leaf scan after finding 20" },
    });

    steps.push({
      stepNumber: 4,
      description: "Composite index (user_id, created_at): leftmost prefix rule. Can query by user_id alone or user_id+created_at. Cannot skip user_id.",
      highlightLines: [15, 16, 17],
      visualState: {
        type: "array1d",
        cells: [
          { val: "user_id=5 ✓", state: "computed" as const },
          { val: "user_id=5+date ✓", state: "computed" as const },
          { val: "date only ✗", state: "highlighted" as const },
        ],
        label: "Composite index: leftmost prefix rule",
      },
      variables: { index: "(user_id, created_at)", rule: "leftmost prefix must be present" },
    });

    return steps;
  },
};

// ── Hash Index ────────────────────────────────────────────────────────────────
export const hashIndexModule: VisualizationModule<null> = {
  id: "db-hash-index", slug: "hash-index", title: "Hash Index",
  category: ["databases", "indexing"], difficulty: "intermediate",
  timeComplexity: "O(1) equality", spaceComplexity: "O(n)",
  description: "Hash index: O(1) equality lookups. No range queries. Used by PostgreSQL HASH indexes and MySQL MEMORY engine.",
  relatedTopics: [],
  pythonCode: `# Hash Index — database internals

# Hash function maps key → bucket
def hash_index(key, num_buckets=8):
    return hash(key) % num_buckets

# Insert: hash(key) → bucket → store (key, rowptr)
# Lookup: hash(key) → bucket → linear scan for key
# Limitation: NO range queries, NO ORDER BY benefit

# Extendible Hashing (dynamic resize)
class ExtendibleHashIndex:
    def __init__(self):
        self.global_depth = 1
        self.directory = [Bucket(), Bucket()]  # 2^1 = 2 buckets

    def lookup(self, key):            # O(1) average
        h = hash(key)
        bucket_idx = h & ((1 << self.global_depth) - 1)
        return self.directory[bucket_idx].find(key)

    def insert(self, key, ptr):
        bucket_idx = hash(key) & ((1 << self.global_depth) - 1)
        bucket = self.directory[bucket_idx]
        if bucket.is_full():
            self.split_bucket(bucket_idx)  # double directory if needed
        self.directory[bucket_idx].insert(key, ptr)`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const keys = [12, 25, 37, 18, 55, 6, 42, 31];
    const buckets = 8;

    steps.push({
      stepNumber: 1,
      description: "Hash Index: hash(key) % buckets → bucket. O(1) equality. No range support. PostgreSQL: CREATE INDEX USING HASH.",
      highlightLines: [3, 4],
      visualState: {
        type: "array1d",
        cells: Array(buckets).fill(null).map((_, i) => ({ val: `B[${i}]`, state: "default" as const })),
        label: `Hash Index (${buckets} buckets)`,
      },
      variables: { buckets, hashFn: "key % 8" },
    });

    const bucketContents: string[][] = Array(buckets).fill(null).map(() => []);
    for (const k of keys) {
      const b = k % buckets;
      bucketContents[b].push(`${k}`);
      steps.push({
        stepNumber: steps.length + 1,
        description: `Insert key=${k}: hash(${k}) % ${buckets} = ${b}. Stored in bucket[${b}].`,
        highlightLines: [6, 7],
        visualState: {
          type: "array1d",
          cells: bucketContents.map((bc, i) => ({
            val: bc.length ? `B[${i}]:[${bc.join(",")}]` : `B[${i}]:∅`,
            state: i === b ? "active" as const : bc.length ? "computed" as const : "default" as const,
          })),
          label: "Hash Index after inserts",
        },
        variables: { key: k, bucket: b, contents: JSON.stringify(bucketContents[b]) },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: "Lookup key=37: hash(37) % 8 = 5. Jump directly to bucket[5]. Scan for 37. O(1) average (O(n) worst with collisions).",
      highlightLines: [6, 7, 8],
      visualState: {
        type: "array1d",
        cells: bucketContents.map((bc, i) => ({
          val: bc.length ? `B[${i}]:[${bc.join(",")}]` : `B[${i}]:∅`,
          state: i === 37 % buckets ? "highlighted" as const : "default" as const,
        })),
        label: "O(1) lookup",
      },
      variables: { lookup: 37, bucket: 37 % buckets, found: true },
    });

    return steps;
  },
};

// ── LSM Index ─────────────────────────────────────────────────────────────────
export const lsmIndexModule: VisualizationModule<null> = {
  id: "db-lsm-index", slug: "lsm-index", title: "LSM Tree Index",
  category: ["databases", "indexing"], difficulty: "advanced",
  timeComplexity: "O(1) write, O(log n) read", spaceComplexity: "O(n)",
  description: "Log-Structured Merge Tree index: fast writes to MemTable, compaction merges SSTables. Used in Cassandra, RocksDB, LevelDB.",
  relatedTopics: [],
  pythonCode: `# LSM Tree Index — Write-Optimized

# Write path: O(1) amortized
def write(key, value):
    memtable[key] = value       # in-memory sorted tree
    wal.append(key, value)      # Write-Ahead Log for durability
    if memtable.size > threshold:
        flush_to_sstable()      # sorted immutable file on disk

# Read path: O(log n) per level
def read(key):
    val = memtable.get(key)     # check MemTable first
    if val: return val
    for level in [L0, L1, L2, ...]:   # newest → oldest
        for sstable in level:
            val = sstable.binary_search(key)
            if val: return val

# Compaction: merge SSTables, remove old versions
def compact():
    # Major compaction: merge all SSTables
    sorted_merge(sstables)      # O(n log k) merge
    remove_old_versions()       # keep only latest value per key`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    steps.push({
      stepNumber: 1,
      description: "LSM Index: writes go to MemTable (RAM) then flush to SSTable (disk). Compaction merges SSTables to reduce read amplification.",
      highlightLines: [3, 4, 5],
      visualState: {
        type: "array1d",
        cells: [{ val: "MemTable:{}(RAM)", state: "active" as const }, { val: "L0:∅", state: "default" as const }, { val: "L1:∅", state: "default" as const }],
        label: "LSM Tree Index",
      },
      variables: { writeAmplification: "low", readAmplification: "high" },
    });

    const writes = [{ k: "a", v: 1 }, { k: "c", v: 3 }, { k: "b", v: 2 }, { k: "e", v: 5 }, { k: "d", v: 4 }];
    const mem: Record<string, number> = {};

    for (const { k, v } of writes) {
      mem[k] = v;
      steps.push({
        stepNumber: steps.length + 1,
        description: `Write (${k}=${v}): append to WAL + insert into MemTable. O(1).`,
        highlightLines: [3, 4, 5],
        visualState: {
          type: "array1d",
          cells: [
            ...Object.entries(mem).sort(([a], [b]) => a.localeCompare(b)).map(([key, val]) => ({
              val: `${key}:${val}`,
              state: key === k ? "active" as const : "default" as const,
            })),
          ],
          label: "MemTable (sorted)",
        },
        variables: { key: k, value: v, memSize: Object.keys(mem).length },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: "MemTable full → flush to L0 SSTable (sorted). L0 may overlap. Compaction merges L0→L1 (non-overlapping ranges).",
      highlightLines: [7],
      visualState: {
        type: "array1d",
        cells: [
          { val: "MemTable:{}(empty)", state: "active" as const },
          { val: `L0 SSTable:[${Object.entries(mem).sort(([a], [b]) => a.localeCompare(b)).map(([k2, v2]) => `${k2}:${v2}`).join(",")}]`, state: "computed" as const },
        ],
        label: "After flush",
      },
      variables: { l0SSTables: 1, compact: "triggered when L0 ≥ threshold" },
    });

    return steps;
  },
};

// ── Bitmap Index ──────────────────────────────────────────────────────────────
export const bitmapIndexModule: VisualizationModule<null> = {
  id: "db-bitmap-index", slug: "bitmap-index", title: "Bitmap Index",
  category: ["databases", "indexing"], difficulty: "intermediate",
  timeComplexity: "O(n/64) AND/OR", spaceComplexity: "O(n × cardinality)",
  description: "Bitmap index: one bit per row per value. Fast bitwise AND/OR for multi-condition queries. Best for low-cardinality columns.",
  relatedTopics: [],
  pythonCode: `# Bitmap Index — Low Cardinality Columns

# Example: gender column with 2 values (M/F)
# 8 rows: [M, F, M, M, F, F, M, F]

# Bitmap per value:
gender_M = 0b10110010  # rows 1,3,4,7 are M (bit 1 = row is M)
gender_F = 0b01001101  # rows 2,5,6,8 are F

# AND query: WHERE gender='M' AND age_group='25-30'
# age_25_30 = 0b10100011
result = gender_M & age_25_30   # bitwise AND — O(n/64)

# OR query: WHERE gender='M' OR department='Sales'
# dept_sales = 0b01010100
result = gender_M | dept_sales   # bitwise OR

# NOT query: WHERE NOT gender='M'
result = ~gender_M & all_rows

# Update problem: insert/update is expensive (recompute bitmaps)
# Best for: read-heavy, low-cardinality (< 100 distinct values)
# Used by: Oracle, PostgreSQL extensions, data warehouses`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const genderM = [1, 0, 1, 1, 0, 0, 1, 0];
    const genderF = [0, 1, 0, 0, 1, 1, 0, 1];
    const age2530 = [1, 1, 0, 0, 1, 0, 1, 0];

    steps.push({
      stepNumber: 1,
      description: "Bitmap Index: one bit per row per value. gender='M' → bitmap where 1=row is Male. Low cardinality columns (few distinct values) ideal.",
      highlightLines: [3, 4, 5, 6],
      visualState: {
        type: "bits",
        number: parseInt(genderM.join(""), 2),
        bits: genderM,
        activeBits: genderM.map((b, i) => b === 1 ? i : -1).filter((i) => i >= 0),
        label: "gender='M' bitmap",
      },
      variables: { column: "gender", value: "M", rows: genderM.filter((b) => b).length },
    });

    steps.push({
      stepNumber: 2,
      description: "gender='F' bitmap: complement of gender='M' (for binary column).",
      highlightLines: [7],
      visualState: {
        type: "bits",
        number: parseInt(genderF.join(""), 2),
        bits: genderF,
        activeBits: genderF.map((b, i) => b === 1 ? i : -1).filter((i) => i >= 0),
        label: "gender='F' bitmap",
      },
      variables: { column: "gender", value: "F" },
    });

    const andResult = genderM.map((b, i) => b & age2530[i]);
    steps.push({
      stepNumber: 3,
      description: "AND query: WHERE gender='M' AND age_group='25-30'. Bitwise AND: O(n/64) using 64-bit words.",
      highlightLines: [10, 11],
      visualState: {
        type: "bits",
        number: parseInt(andResult.join(""), 2),
        bits: andResult,
        activeBits: andResult.map((b, i) => b === 1 ? i : -1).filter((i) => i >= 0),
        label: "gender='M' AND age='25-30'",
        operandB: { bits: age2530, number: parseInt(age2530.join(""), 2) },
      },
      variables: { op: "AND", matchedRows: andResult.filter((b) => b).length },
    });

    return steps;
  },
};

// ── Nested Loop Join ──────────────────────────────────────────────────────────
export const nestedLoopJoinModule: VisualizationModule<null> = {
  id: "db-nested-loop-join", slug: "nested-loop-join", title: "Nested Loop Join",
  category: ["databases", "query-processing"], difficulty: "intermediate",
  timeComplexity: "O(n×m)", spaceComplexity: "O(1)",
  description: "Simplest join: for each row in outer table, scan all rows in inner table. O(n×m) but works for any join condition.",
  relatedTopics: [],
  pythonCode: `# Nested Loop Join

def nested_loop_join(outer, inner, predicate):
    result = []
    for outer_row in outer:          # n iterations
        for inner_row in inner:       # m iterations each
            if predicate(outer_row, inner_row):
                result.append((outer_row, inner_row))
    return result  # O(n × m)

# Example: JOIN orders ON orders.user_id = users.id
users = [(1,"Alice"), (2,"Bob"), (3,"Carol")]
orders = [(101,1,"Book"), (102,2,"Pen"), (103,1,"Lamp")]

result = nested_loop_join(
    users, orders,
    lambda u, o: u[0] == o[1]  # user_id match
)

# Index Nested Loop Join (with index on inner table)
# For each outer row, use index to find matching inner rows
# O(n × log m) — much better than O(n × m)`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const outer = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }, { id: 3, name: "Carol" }];
    const inner = [{ ordId: 101, uid: 1, item: "Book" }, { ordId: 102, uid: 2, item: "Pen" }, { ordId: 103, uid: 1, item: "Lamp" }];

    steps.push({
      stepNumber: 1,
      description: "Nested Loop Join: for each outer row, scan all inner rows checking join condition. O(n×m). Simple but expensive.",
      highlightLines: [3, 4, 5],
      visualState: {
        type: "table2d",
        matrix: outer.map((u) => [String(u.id), u.name, ""]),
        rowLabels: outer.map((_, i) => `U${i + 1}`),
        colLabels: ["user_id", "name", "matched_orders"],
        activeCell: [0, 0],
        filledCells: [],
        title: "Outer: users",
      },
      variables: { outerSize: outer.length, innerSize: inner.length, complexity: `O(${outer.length}×${inner.length})=${outer.length * inner.length}` },
    });

    const results: Array<{ user: typeof outer[0]; order: typeof inner[0] }> = [];
    for (let i = 0; i < outer.length; i++) {
      for (let j = 0; j < inner.length; j++) {
        const match = outer[i].id === inner[j].uid;
        if (match) results.push({ user: outer[i], order: inner[j] });
        steps.push({
          stepNumber: steps.length + 1,
          description: `Outer[${i}]=${outer[i].name}, Inner[${j}]=${inner[j].item}: ${outer[i].id}==${inner[j].uid}? ${match ? "YES — match!" : "no"}`,
          highlightLines: [6, 7, 8],
          visualState: {
            type: "table2d",
            matrix: results.map((r) => [String(r.user.id), r.user.name, `ord#${r.order.ordId}(${r.order.item})`]),
            rowLabels: results.map((_, ri) => `R${ri + 1}`),
            colLabels: ["user_id", "name", "order"],
            activeCell: match ? [results.length - 1, 0] : null,
            filledCells: results.map((_, ri) => [ri, 0]),
            title: `Results (${results.length} so far)`,
          },
          variables: { outerRow: outer[i].name, innerRow: inner[j].item, match, totalResults: results.length },
        });
      }
    }

    return steps;
  },
};

// ── Hash Join ─────────────────────────────────────────────────────────────────
export const hashJoinModule: VisualizationModule<null> = {
  id: "db-hash-join", slug: "hash-join", title: "Hash Join",
  category: ["databases", "query-processing"], difficulty: "intermediate",
  timeComplexity: "O(n+m)", spaceComplexity: "O(min(n,m))",
  description: "Build hash table on smaller relation, probe with larger. O(n+m) but requires memory for hash table.",
  relatedTopics: [],
  pythonCode: `# Hash Join — O(n + m)

def hash_join(build_rel, probe_rel, key_fn):
    # Phase 1: Build — hash smaller relation
    hash_table = {}
    for row in build_rel:     # O(n)
        key = key_fn(row)
        if key not in hash_table:
            hash_table[key] = []
        hash_table[key].append(row)

    # Phase 2: Probe — scan larger relation
    result = []
    for row in probe_rel:     # O(m)
        key = key_fn(row)
        if key in hash_table:
            for match in hash_table[key]:
                result.append((row, match))

    return result  # O(n + m) total

# Grace Hash Join: for when hash table doesn't fit in memory
# Partition both relations by hash(key) → each partition fits in memory`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const users = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }, { id: 3, name: "Carol" }];
    const orders = [{ ordId: 101, uid: 1, item: "Book" }, { ordId: 102, uid: 2, item: "Pen" }, { ordId: 103, uid: 1, item: "Lamp" }];

    steps.push({
      stepNumber: 1,
      description: "Hash Join Phase 1 — Build: hash the SMALLER relation (users) into a hash table keyed on join column (user_id).",
      highlightLines: [4, 5, 6, 7, 8, 9],
      visualState: {
        type: "array1d",
        cells: [{ val: "hash_table:{}", state: "default" as const }],
        label: "Build phase: hash table empty",
      },
      variables: { buildSize: users.length, probeSize: orders.length },
    });

    const ht: Record<number, string[]> = {};
    for (const u of users) {
      ht[u.id] = [...(ht[u.id] ?? []), u.name];
      steps.push({
        stepNumber: steps.length + 1,
        description: `Build: hash(user_id=${u.id}) → bucket ${u.id}. Store "${u.name}".`,
        highlightLines: [6, 7, 8, 9],
        visualState: {
          type: "array1d",
          cells: Object.entries(ht).map(([k, v]) => ({
            val: `[${k}]:${v.join(",")}`,
            state: Number(k) === u.id ? "active" as const : "computed" as const,
          })),
          label: "Hash Table (user_id → name)",
        },
        variables: { inserted: u.name, key: u.id },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: "Phase 2 — Probe: scan orders table, hash each uid, look up in hash table. O(m) with O(1) hash lookup.",
      highlightLines: [12, 13, 14, 15, 16, 17],
      visualState: {
        type: "array1d",
        cells: [{ val: "Probing orders...", state: "active" as const }],
        label: "Probe phase starts",
      },
      variables: { phase: "probe", scanSize: orders.length },
    });

    const results: string[] = [];
    for (const o of orders) {
      const match = ht[o.uid];
      if (match) {
        results.push(`${match[0]}→ord#${o.ordId}(${o.item})`);
      }
      steps.push({
        stepNumber: steps.length + 1,
        description: `Probe ord#${o.ordId}(uid=${o.uid}): lookup hash_table[${o.uid}] = "${match ? match[0] : "miss"}". ${match ? "MATCH!" : "no match"}`,
        highlightLines: [13, 14, 15, 16],
        visualState: {
          type: "array1d",
          cells: results.map((r) => ({ val: r, state: "computed" as const })),
          label: `Results (${results.length})`,
        },
        variables: { probing: `uid=${o.uid}`, match: match ? match[0] : null },
      });
    }

    return steps;
  },
};

// ── Sort-Merge Join ───────────────────────────────────────────────────────────
export const sortMergeJoinModule: VisualizationModule<null> = {
  id: "db-sort-merge-join", slug: "sort-merge-join", title: "Sort-Merge Join",
  category: ["databases", "query-processing"], difficulty: "intermediate",
  timeComplexity: "O(n log n + m log m)", spaceComplexity: "O(1) merge",
  description: "Sort both relations on join key, then merge. Excellent for pre-sorted data or when result needs sorting. Used in analytics.",
  relatedTopics: [],
  pythonCode: `# Sort-Merge Join

def sort_merge_join(rel_a, rel_b, key_fn):
    # Phase 1: Sort both relations
    sorted_a = sorted(rel_a, key=key_fn)  # O(n log n)
    sorted_b = sorted(rel_b, key=key_fn)  # O(m log m)

    # Phase 2: Merge — two-pointer scan
    result = []
    i, j = 0, 0
    while i < len(sorted_a) and j < len(sorted_b):
        ka, kb = key_fn(sorted_a[i]), key_fn(sorted_b[j])
        if ka == kb:
            # Handle duplicates: nested loop within equal range
            j0 = j
            while j < len(sorted_b) and key_fn(sorted_b[j]) == ka:
                result.append((sorted_a[i], sorted_b[j]))
                j += 1
            i += 1; j = j0  # reset j for next outer row
        elif ka < kb:
            i += 1
        else:
            j += 1
    return result`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const usersUnsorted = [{ id: 3, name: "Carol" }, { id: 1, name: "Alice" }, { id: 2, name: "Bob" }];
    const ordersUnsorted = [{ uid: 2, item: "Pen" }, { uid: 1, item: "Book" }, { uid: 1, item: "Lamp" }];

    const usersS = [...usersUnsorted].sort((a, b) => a.id - b.id);
    const ordersS = [...ordersUnsorted].sort((a, b) => a.uid - b.uid);

    steps.push({
      stepNumber: 1,
      description: "Sort-Merge Join Phase 1: sort both relations on join key. O(n log n + m log m).",
      highlightLines: [4, 5],
      visualState: {
        type: "array1d",
        cells: [
          ...usersUnsorted.map((u) => ({ val: `U:${u.id}`, state: "default" as const })),
          { val: "→sort→", state: "highlighted" as const },
          ...usersS.map((u) => ({ val: `U:${u.id}`, state: "computed" as const })),
        ],
        label: "Sort users by id",
      },
      variables: { sortedUsers: usersS.map((u) => u.id).join(","), sortedOrders: ordersS.map((o) => o.uid).join(",") },
    });

    steps.push({
      stepNumber: 2,
      description: "Phase 2 — Merge: two pointers scan sorted relations simultaneously. Advance smaller key pointer.",
      highlightLines: [9, 10, 11],
      visualState: {
        type: "array1d",
        cells: [
          ...usersS.map((u) => ({ val: `U${u.id}:${u.name}`, state: "default" as const })),
          { val: "⟺", state: "highlighted" as const },
          ...ordersS.map((o) => ({ val: `O:uid=${o.uid}(${o.item})`, state: "default" as const })),
        ],
        label: "Two-pointer merge",
      },
      variables: { i: 0, j: 0, phaseSize: "O(n+m)" },
    });

    const results: string[] = [];
    let i = 0, j = 0;
    while (i < usersS.length && j < ordersS.length) {
      const u = usersS[i], o = ordersS[j];
      if (u.id === o.uid) {
        results.push(`${u.name}→${o.item}`);
        steps.push({
          stepNumber: steps.length + 1,
          description: `Match! U[${i}].id=${u.id} = O[${j}].uid. Emit (${u.name}, ${o.item}).`,
          highlightLines: [13, 14, 15],
          visualState: {
            type: "array1d",
            cells: results.map((r) => ({ val: r, state: "computed" as const })),
            label: `Results (${results.length})`,
          },
          variables: { i, j, matched: `${u.name}→${o.item}` },
        });
        j++;
      } else if (u.id < o.uid) {
        i++;
      } else {
        j++;
      }
    }

    return steps;
  },
};

// ── Query Optimization ────────────────────────────────────────────────────────
export const queryOptimizationModule: VisualizationModule<null> = {
  id: "db-query-optimization", slug: "query-optimization", title: "Query Optimization",
  category: ["databases", "query-processing"], difficulty: "advanced",
  timeComplexity: "O(2^n) plan enumeration", spaceComplexity: "O(plans)",
  description: "Query optimizer: parse SQL → logical plan → physical plan. Uses statistics, cost model, and plan enumeration to find cheapest execution.",
  relatedTopics: [],
  pythonCode: `# Query Optimization Pipeline

# 1. Parse SQL → AST
sql = "SELECT * FROM orders o JOIN users u ON o.user_id = u.id WHERE u.age > 25"
ast = parse(sql)

# 2. Logical Plan (relational algebra)
# σ(age>25)(orders ⋈ users)

# 3. Apply rewrite rules
# Rule: Push selections down (before join)
# Better: σ(age>25)(users) ⋈ orders
# Reduces join input size!

# 4. Generate physical plans
physical_plans = [
    Plan(NLJ, σ(users), orders),      # Nested Loop Join
    Plan(HashJoin, σ(users), orders),  # Hash Join
    Plan(SMJ, σ(users), orders),       # Sort-Merge Join
]

# 5. Cost estimation using statistics
for plan in physical_plans:
    cost = estimate_cost(plan)  # pages I/O + CPU
    # Uses: table stats, index stats, selectivity

# 6. Choose cheapest plan
best_plan = min(physical_plans, key=lambda p: p.cost)`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const pipeline = [
      { stage: "Parse", desc: "SQL text → AST (Abstract Syntax Tree). Syntax check, resolve column names." },
      { stage: "Logical Plan", desc: "AST → relational algebra: σ (select), π (project), ⋈ (join), γ (aggregate)." },
      { stage: "Rewrite Rules", desc: "Push predicates down (before joins), eliminate redundancy. Reduce intermediate set sizes." },
      { stage: "Physical Plans", desc: "Enumerate join orders and algorithms: NLJ, Hash Join, Sort-Merge. Index scan vs seq scan." },
      { stage: "Cost Model", desc: "Estimate each plan's I/O + CPU cost using table statistics, cardinality estimates, selectivity." },
      { stage: "Best Plan", desc: "Choose minimum-cost plan. Execute. Dynamic programming for join ordering (Selinger algorithm)." },
    ];

    steps.push({
      stepNumber: 1,
      description: "Query optimization: turn SQL into an efficient execution plan. Multiple valid plans; find cheapest using statistics + cost model.",
      highlightLines: [3, 4],
      visualState: {
        type: "array1d",
        cells: pipeline.map((p) => ({ val: p.stage, state: "default" as const })),
        label: "Query Optimization Pipeline",
      },
      variables: { query: "SELECT * FROM orders JOIN users WHERE age>25" },
    });

    for (let i = 0; i < pipeline.length; i++) {
      steps.push({
        stepNumber: steps.length + 1,
        description: `${pipeline[i].stage}: ${pipeline[i].desc}`,
        highlightLines: [i * 4 + 4],
        visualState: {
          type: "array1d",
          cells: pipeline.map((p, j) => ({
            val: p.stage,
            state: j === i ? "active" as const : j < i ? "computed" as const : "default" as const,
          })),
          label: "Optimization Pipeline",
        },
        variables: { stage: pipeline[i].stage },
      });
    }

    return steps;
  },
};

// ── Two-Phase Locking ─────────────────────────────────────────────────────────
export const twoPhaseLockingModule: VisualizationModule<null> = {
  id: "db-two-phase-locking", slug: "two-phase-locking", title: "Two-Phase Locking",
  category: ["databases", "concurrency"], difficulty: "intermediate",
  timeComplexity: "O(1) per lock op", spaceComplexity: "O(locks held)",
  description: "2PL ensures serializability: growing phase (acquire locks), shrinking phase (release locks). Strict 2PL holds locks until commit.",
  relatedTopics: [],
  pythonCode: `# Two-Phase Locking (2PL)

class Transaction:
    def __init__(self, tid):
        self.tid = tid
        self.phase = "GROWING"
        self.locks = set()

    def lock_shared(self, item):     # for READ
        if self.phase == "SHRINKING":
            raise LockError("Cannot acquire lock in shrinking phase")
        acquire_shared_lock(item, self.tid)
        self.locks.add(item)

    def lock_exclusive(self, item):  # for WRITE
        if self.phase == "SHRINKING":
            raise LockError("Cannot acquire lock in shrinking phase")
        acquire_exclusive_lock(item, self.tid)
        self.locks.add(item)

    def unlock(self, item):
        release_lock(item, self.tid)
        self.locks.discard(item)
        self.phase = "SHRINKING"  # cannot acquire new locks after first release

    def commit(self):
        # Strict 2PL: release ALL locks at commit
        for item in self.locks:
            release_lock(item, self.tid)
        self.locks.clear()`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const t1ops = [
      { op: "lock_S(A)", phase: "GROWING", desc: "T1 acquires shared lock on A (read)." },
      { op: "lock_X(B)", phase: "GROWING", desc: "T1 acquires exclusive lock on B (write)." },
      { op: "read(A)", phase: "GROWING", desc: "T1 reads A. S-lock held." },
      { op: "write(B)", phase: "GROWING", desc: "T1 writes B. X-lock held." },
      { op: "unlock(A)", phase: "SHRINKING", desc: "T1 releases lock on A. Enters SHRINKING phase — cannot acquire new locks!" },
      { op: "unlock(B)", phase: "SHRINKING", desc: "T1 releases lock on B." },
      { op: "commit", phase: "DONE", desc: "T1 commits. Strict 2PL: all locks released at commit." },
    ];

    steps.push({
      stepNumber: 1,
      description: "2PL: Growing phase → acquire locks. Shrinking phase → release locks. Guarantees serializability. Strict 2PL holds all locks until commit.",
      highlightLines: [3, 4, 5, 6],
      visualState: {
        type: "array1d",
        cells: [{ val: "T1: GROWING", state: "active" as const }, { val: "locks:∅", state: "default" as const }],
        label: "Transaction T1",
      },
      variables: { phase: "GROWING", locks: "none" },
    });

    const heldLocks: string[] = [];
    for (const op of t1ops) {
      if (op.op.startsWith("lock")) {
        const item = op.op.match(/\((.)\)/)?.[1] ?? "";
        heldLocks.push(item);
      } else if (op.op.startsWith("unlock")) {
        const item = op.op.match(/\((.)\)/)?.[1] ?? "";
        heldLocks.splice(heldLocks.indexOf(item), 1);
      }
      steps.push({
        stepNumber: steps.length + 1,
        description: `${op.op}: ${op.desc} Phase: ${op.phase}.`,
        highlightLines: op.op.startsWith("lock_S") ? [8, 9, 10, 11, 12] : op.op.startsWith("lock_X") ? [14, 15, 16, 17, 18] : [20, 21, 22, 23],
        visualState: {
          type: "array1d",
          cells: [
            { val: `T1: ${op.phase}`, state: op.phase === "GROWING" ? "active" as const : op.phase === "SHRINKING" ? "highlighted" as const : "computed" as const },
            ...heldLocks.map((l) => ({ val: `lock(${l})`, state: "default" as const })),
          ],
          label: `T1 (${heldLocks.length} locks held)`,
        },
        variables: { operation: op.op, phase: op.phase, locksHeld: JSON.stringify(heldLocks) },
      });
    }

    return steps;
  },
};

// ── MVCC ──────────────────────────────────────────────────────────────────────
export const mvccModule: VisualizationModule<null> = {
  id: "db-mvcc", slug: "mvcc", title: "MVCC",
  category: ["databases", "concurrency"], difficulty: "advanced",
  timeComplexity: "O(1) read (no locks)", spaceComplexity: "O(versions)",
  description: "Multi-Version Concurrency Control: readers don't block writers. Each transaction sees a snapshot. Used in PostgreSQL, MySQL InnoDB.",
  relatedTopics: [],
  pythonCode: `# MVCC — Multi-Version Concurrency Control

# Each row has multiple versions with timestamps
row_versions = {
    "account_A": [
        {"value": 1000, "xmin": 1, "xmax": 3},  # created by T1, deleted by T3
        {"value": 1200, "xmin": 3, "xmax": None}, # created by T3, current
    ]
}

# Transaction sees a row version if:
# xmin <= txn_id < xmax  (created before txn, not yet deleted)
def visible(version, txn_id):
    return version["xmin"] <= txn_id and (
        version["xmax"] is None or txn_id < version["xmax"]
    )

# T2 (txn_id=2) reads account_A:
# Version 1: xmin=1 <= 2 < xmax=3 → VISIBLE → reads 1000
# Version 2: xmin=3 > 2 → NOT VISIBLE

# Write creates new version, doesn't modify old
def update(key, new_value, txn_id):
    old = get_current_version(key)
    old["xmax"] = txn_id       # mark old version as deleted
    new_ver = {"value": new_value, "xmin": txn_id, "xmax": None}
    row_versions[key].append(new_ver)`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];

    steps.push({
      stepNumber: 1,
      description: "MVCC: each row has multiple versions (xmin=created_by, xmax=deleted_by). Readers see their snapshot, never blocked by writers.",
      highlightLines: [3, 4, 5, 6, 7, 8],
      visualState: {
        type: "table2d",
        matrix: [["1000", "1", "3"], ["1200", "3", "∞"]],
        rowLabels: ["v1", "v2"],
        colLabels: ["value", "xmin", "xmax"],
        activeCell: [0, 0],
        filledCells: [[0, 0], [1, 0]],
        title: "account_A versions",
      },
      variables: { versions: 2, current: "v2 (xmax=∞)" },
    });

    const txns = [
      { id: 2, sees: "v1 (xmin=1≤2<xmax=3)", value: 1000, desc: "T2 (started before T3): sees version with xmin=1,xmax=3. Reads 1000." },
      { id: 4, sees: "v2 (xmin=3≤4,xmax=∞)", value: 1200, desc: "T4 (started after T3): sees version with xmin=3,xmax=∞. Reads 1200." },
    ];

    for (const txn of txns) {
      steps.push({
        stepNumber: steps.length + 1,
        description: txn.desc,
        highlightLines: [10, 11, 12, 13, 14, 15],
        visualState: {
          type: "table2d",
          matrix: [["1000", "1", "3", txn.id === 2 ? "✓ VISIBLE" : "✗ hidden"],
            ["1200", "3", "∞", txn.id === 4 ? "✓ VISIBLE" : "✗ hidden"]],
          rowLabels: ["v1", "v2"],
          colLabels: ["value", "xmin", "xmax", `T${txn.id} sees`],
          activeCell: [txn.id === 2 ? 0 : 1, 3],
          filledCells: [[txn.id === 2 ? 0 : 1, 3]],
          title: `T${txn.id} snapshot read`,
        },
        variables: { txnId: txn.id, visible: txn.sees, value: txn.value },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: "Write (T5 updates to 1500): mark v2.xmax=5, create v3 with xmin=5. Old version preserved for ongoing transactions.",
      highlightLines: [20, 21, 22, 23, 24],
      visualState: {
        type: "table2d",
        matrix: [["1000", "1", "3", "T≤2"], ["1200", "3", "5", "T3,T4"], ["1500", "5", "∞", "T5+"]],
        rowLabels: ["v1", "v2", "v3"],
        colLabels: ["value", "xmin", "xmax", "visible_to"],
        activeCell: [2, 0],
        filledCells: [[2, 0], [2, 1], [2, 2]],
        title: "After T5 update",
      },
      variables: { newValue: 1500, newVersion: "v3", oldVersionsRetained: true },
    });

    return steps;
  },
};

// ── ACID ──────────────────────────────────────────────────────────────────────
export const acidModule: VisualizationModule<null> = {
  id: "db-acid", slug: "acid", title: "ACID Properties",
  category: ["databases", "concurrency"], difficulty: "beginner",
  timeComplexity: "O(1) per property check", spaceComplexity: "O(1)",
  description: "ACID: Atomicity, Consistency, Isolation, Durability. Four properties that guarantee reliable database transactions.",
  relatedTopics: [],
  pythonCode: `# ACID Properties in Practice

# Atomicity: all-or-nothing
try:
    db.begin()
    debit(account_A, 100)   # A: 1000 → 900
    credit(account_B, 100)  # B: 500 → 600
    db.commit()             # both succeed
except Exception:
    db.rollback()           # both rolled back — no partial state

# Consistency: DB invariants maintained
assert balance_A + balance_B == original_total  # always holds

# Isolation: concurrent txns don't interfere
# T1 sees snapshot; T2's uncommitted writes invisible to T1
# Levels: READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE

# Durability: committed data survives crash
# Achieved via Write-Ahead Log (WAL):
wal.append(txn_id, operation)  # log before applying
checkpoint()                    # periodically flush to disk
# On crash: replay WAL to recover committed state`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const props = [
      { name: "Atomicity", icon: "⚛", desc: "All-or-nothing. Either all operations in a transaction succeed, or all are rolled back. No partial updates.", example: "Bank transfer: debit+credit both succeed or both fail." },
      { name: "Consistency", icon: "✓", desc: "Transaction brings DB from one valid state to another. All constraints, rules, and invariants maintained.", example: "Foreign key constraints, balance ≥ 0, referential integrity." },
      { name: "Isolation", icon: "🔒", desc: "Concurrent transactions execute as if serial. Levels: READ UNCOMMITTED < READ COMMITTED < REPEATABLE READ < SERIALIZABLE.", example: "T1 reading doesn't see T2's uncommitted writes (at READ COMMITTED)." },
      { name: "Durability", icon: "💾", desc: "Once committed, data survives crashes. Achieved via Write-Ahead Log (WAL) — log before applying changes.", example: "Power cut after COMMIT: data recoverable from WAL replay." },
    ];

    steps.push({
      stepNumber: 1,
      description: "ACID: four properties ensuring reliable transactions. Foundation of relational databases.",
      highlightLines: [1],
      visualState: {
        type: "array1d",
        cells: props.map((p) => ({ val: p.name, state: "default" as const })),
        label: "ACID Properties",
      },
      variables: { properties: "Atomicity, Consistency, Isolation, Durability" },
    });

    for (let i = 0; i < props.length; i++) {
      const p = props[i];
      steps.push({
        stepNumber: steps.length + 1,
        description: `${p.name}: ${p.desc} Example: ${p.example}`,
        highlightLines: [i * 5 + 3],
        visualState: {
          type: "array1d",
          cells: props.map((pp, j) => ({
            val: pp.name,
            state: j === i ? "highlighted" as const : j < i ? "computed" as const : "default" as const,
          })),
          label: `${p.name} ${p.icon}`,
        },
        variables: { property: p.name, example: p.example },
      });
    }

    return steps;
  },
};

// ── Heap File ─────────────────────────────────────────────────────────────────
export const heapFileModule: VisualizationModule<null> = {
  id: "db-heap-file", slug: "heap-file", title: "Heap File Organization",
  category: ["databases", "storage"], difficulty: "beginner",
  timeComplexity: "O(n) scan, O(1) insert", spaceComplexity: "O(n)",
  description: "Unordered file: pages of tuples with no particular order. Simple O(1) insert, O(n) scan. Foundation of database storage.",
  relatedTopics: [],
  pythonCode: `# Heap File — Unordered Page Storage

class HeapFile:
    PAGE_SIZE = 8192  # 8KB pages (PostgreSQL default)

    def __init__(self):
        self.pages = []       # list of pages
        self.free_page = 0

    def insert(self, tuple_data):   # O(1) amortized
        page = self.pages[self.free_page]
        if page.has_space():
            page.insert(tuple_data)
        else:
            new_page = Page()
            new_page.insert(tuple_data)
            self.pages.append(new_page)
            self.free_page = len(self.pages) - 1

    def full_scan(self, predicate): # O(n) — must read ALL pages
        results = []
        for page in self.pages:
            for tuple in page.tuples:
                if predicate(tuple):
                    results.append(tuple)
        return results

    def free_space_map(self):       # tracks free space per page
        return {i: page.free_bytes for i, page in enumerate(self.pages)}`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const rows = [
      { id: 3, name: "Carol" }, { id: 1, name: "Alice" }, { id: 5, name: "Eve" },
      { id: 2, name: "Bob" }, { id: 4, name: "Dave" },
    ];

    steps.push({
      stepNumber: 1,
      description: "Heap File: rows stored in pages in insertion order (no sorting). Fast O(1) insert, O(n) full scan. 8KB pages in PostgreSQL.",
      highlightLines: [3, 4, 5],
      visualState: {
        type: "array1d",
        cells: [{ val: "Page 0: empty", state: "default" as const }],
        label: "Heap File (0 rows)",
      },
      variables: { pageSize: "8KB", organized: "none (heap = unordered)" },
    });

    const pages: string[][] = [[]];
    for (const row of rows) {
      const currentPage = pages[pages.length - 1];
      if (currentPage.length >= 2) {
        pages.push([]);
      }
      pages[pages.length - 1].push(`(${row.id},${row.name})`);

      steps.push({
        stepNumber: steps.length + 1,
        description: `INSERT (${row.id},${row.name}): appended to current page. O(1). Rows NOT sorted — heap order.`,
        highlightLines: [9, 10, 11, 12],
        visualState: {
          type: "array1d",
          cells: pages.map((pg, pi) => ({
            val: `P${pi}:[${pg.join(", ")}]`,
            state: pi === pages.length - 1 ? "active" as const : "default" as const,
          })),
          label: `Heap File (${rows.indexOf(row) + 1} rows, ${pages.length} pages)`,
        },
        variables: { inserted: `(${row.id},${row.name})`, pageCount: pages.length },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: "Full scan (SELECT * WHERE id=3): must read ALL pages in order. O(n) — no ordering helps. Index would make this O(log n).",
      highlightLines: [18, 19, 20, 21, 22],
      visualState: {
        type: "array1d",
        cells: pages.map((pg, pi) => ({
          val: `P${pi}:[${pg.join(", ")}]`,
          state: pg.some((r) => r.includes("3,")) ? "highlighted" as const : "active" as const,
        })),
        label: "Full scan for id=3 (must check all pages)",
      },
      variables: { query: "id=3", pagesRead: pages.length, result: "(3,Carol)" },
    });

    return steps;
  },
};

// ── Row vs Column Store ───────────────────────────────────────────────────────
export const rowVsColumnModule: VisualizationModule<null> = {
  id: "db-row-vs-column", slug: "row-vs-column", title: "Row vs Column Store",
  category: ["databases", "storage"], difficulty: "intermediate",
  timeComplexity: "O(n/cols) for column scan", spaceComplexity: "O(n)",
  description: "Row store (OLTP): fast single-row access. Column store (OLAP): fast aggregations, high compression. Trade-off for workload type.",
  relatedTopics: [],
  pythonCode: `# Row Store vs Column Store

# Same data: 3 rows × 4 columns
data = [
    {"id": 1, "age": 25, "salary": 50000, "dept": "Eng"},
    {"id": 2, "age": 30, "salary": 70000, "dept": "HR"},
    {"id": 3, "age": 28, "salary": 60000, "dept": "Eng"},
]

# Row Store (PostgreSQL, MySQL):
# Pages: [(1,25,50000,Eng), (2,30,70000,HR), (3,28,60000,Eng)]
# Good for: INSERT/UPDATE single row, SELECT * WHERE id=2
# Bad for:  SELECT AVG(salary) (reads all columns)

# Column Store (Parquet, ClickHouse, Redshift):
# age column:    [25, 30, 28]
# salary column: [50000, 70000, 60000]
# dept column:   ["Eng","HR","Eng"]
# Good for: SELECT AVG(salary), GROUP BY dept (reads only 2 cols)
# Compression:   dept column: run-length encode ["Eng"×2, "HR"×1]

# OLTP → Row Store (many point queries)
# OLAP → Column Store (few columns, many rows, aggregations)`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];

    steps.push({
      stepNumber: 1,
      description: "Row store (OLTP): each page stores complete rows. Great for point queries (SELECT * WHERE id=X). Poor for column aggregations.",
      highlightLines: [9, 10, 11, 12],
      visualState: {
        type: "table2d",
        matrix: [[1, 25, 50000, "Eng"], [2, 30, 70000, "HR"], [3, 28, 60000, "Eng"]].map((r) => r.map(String)),
        rowLabels: ["Row 1", "Row 2", "Row 3"],
        colLabels: ["id", "age", "salary", "dept"],
        activeCell: [1, 0],
        filledCells: [[1, 0], [1, 1], [1, 2], [1, 3]],
        title: "Row Store: fetch full row",
      },
      variables: { layout: "row-oriented", pages: "3 rows per page" },
    });

    steps.push({
      stepNumber: 2,
      description: "Column store (OLAP): each column stored separately. SELECT AVG(salary) reads ONLY salary column — avoids I/O for id, age, dept.",
      highlightLines: [14, 15, 16, 17, 18, 19],
      visualState: {
        type: "array1d",
        cells: [
          { val: "age:[25,30,28]", state: "default" as const },
          { val: "salary:[50K,70K,60K]", state: "active" as const },
          { val: "dept:[Eng,HR,Eng]", state: "default" as const },
        ],
        label: "Column Store: read only salary column",
      },
      variables: { query: "AVG(salary)", colsRead: 1, colsTotal: 4, saving: "75% less I/O" },
    });

    steps.push({
      stepNumber: 3,
      description: "Column compression: 'dept' column has low cardinality → Run-Length Encoding: [Eng×2, HR×1]. 10-100× compression vs row store.",
      highlightLines: [19],
      visualState: {
        type: "array1d",
        cells: [
          { val: "raw:[Eng,HR,Eng]", state: "default" as const },
          { val: "→RLE→", state: "highlighted" as const },
          { val: "[(Eng,2),(HR,1)]", state: "computed" as const },
        ],
        label: "Column compression (RLE)",
      },
      variables: { encoding: "RLE", ratio: "3 strings → 2 pairs", benefit: "vectorized SIMD operations" },
    });

    steps.push({
      stepNumber: 4,
      description: "OLTP vs OLAP: row store for transactional workloads (many short reads/writes). Column store for analytics (few large aggregation queries).",
      highlightLines: [20, 21],
      visualState: {
        type: "array1d",
        cells: [
          { val: "OLTP→Row", state: "computed" as const },
          { val: "fast: point query", state: "computed" as const },
          { val: "OLAP→Column", state: "active" as const },
          { val: "fast: aggregation", state: "active" as const },
        ],
        label: "Use-case guideline",
      },
      variables: { oltp: "PostgreSQL, MySQL", olap: "ClickHouse, Redshift, Parquet" },
    });

    return steps;
  },
};

// ── WAL ───────────────────────────────────────────────────────────────────────
export const walModule: VisualizationModule<null> = {
  id: "db-wal", slug: "wal", title: "Write-Ahead Log (WAL)",
  category: ["databases", "storage"], difficulty: "intermediate",
  timeComplexity: "O(1) write (sequential)", spaceComplexity: "O(log entries)",
  description: "WAL: log changes BEFORE applying to data pages. Sequential writes are fast. Enables crash recovery and replication.",
  relatedTopics: [],
  pythonCode: `# Write-Ahead Log (WAL)

# WAL Rule: write log record BEFORE modifying data page
# Ensures durability even if crash occurs mid-transaction

class WAL:
    def __init__(self):
        self.log = []         # append-only log (sequential writes)
        self.lsn = 0          # Log Sequence Number

    def log_record(self, txn_id, operation, before, after):
        record = {
            "lsn": self.lsn,
            "txn_id": txn_id,
            "op": operation,
            "before": before,   # for UNDO on rollback
            "after": after,     # for REDO on recovery
        }
        self.log.append(record)  # write to log (O(1) sequential)
        self.lsn += 1

    def flush_log(self):          # fsync — guarantee log on disk
        os.fsync(self.log_fd)

    def apply_to_page(self, record):  # write to data page (can be deferred)
        data_page[record["page_id"]] = record["after"]

# Crash Recovery (ARIES algorithm):
# 1. Analysis: scan log to find active txns at crash time
# 2. REDO: replay all logged operations (including uncommitted)
# 3. UNDO: rollback uncommitted transactions using before-images`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const txnOps = [
      { lsn: 1, txn: "T1", op: "BEGIN", before: null, after: null },
      { lsn: 2, txn: "T1", op: "UPDATE A", before: 100, after: 200 },
      { lsn: 3, txn: "T1", op: "UPDATE B", before: 50, after: 150 },
      { lsn: 4, txn: "T1", op: "COMMIT", before: null, after: null },
      { lsn: 5, txn: "T2", op: "BEGIN", before: null, after: null },
      { lsn: 6, txn: "T2", op: "UPDATE A", before: 200, after: 300 },
      { lsn: 7, txn: "T2", op: "CRASH!", before: null, after: null },
    ];

    steps.push({
      stepNumber: 1,
      description: "WAL: every change logged BEFORE applied to data pages. Sequential disk writes = fast. Enables REDO (crash recovery) and UNDO (rollback).",
      highlightLines: [2, 3, 4],
      visualState: {
        type: "array1d",
        cells: [{ val: "WAL: empty", state: "default" as const }],
        label: "Write-Ahead Log",
      },
      variables: { lsn: 0, principle: "log first, then apply" },
    });

    const logEntries: string[] = [];
    for (const op of txnOps) {
      logEntries.push(`LSN${op.lsn}:${op.txn}:${op.op}`);
      const isCrash = op.op === "CRASH!";
      steps.push({
        stepNumber: steps.length + 1,
        description: isCrash
          ? `CRASH at LSN ${op.lsn}! T2 has logged UPDATE but not COMMIT. Recovery: REDO T1 (committed), UNDO T2 (uncommitted).`
          : `Log LSN=${op.lsn}: ${op.txn} ${op.op}${op.before !== null ? ` (before=${op.before}, after=${op.after})` : ""}.`,
        highlightLines: isCrash ? [25, 26, 27, 28] : [10, 11, 12, 13, 14, 15, 16],
        visualState: {
          type: "array1d",
          cells: logEntries.map((e, i) => ({
            val: e,
            state: i === logEntries.length - 1 ? (isCrash ? "highlighted" as const : "active" as const)
              : e.includes("COMMIT") ? "computed" as const : "default" as const,
          })),
          label: isCrash ? "WAL at crash (T2 uncommitted)" : "WAL log",
        },
        variables: { lsn: op.lsn, txn: op.txn, op: op.op, ...(op.before !== null ? { before: op.before, after: op.after } : {}) },
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: "Recovery: 1) Analysis: find T1 committed, T2 not. 2) REDO: replay LSN1-6. 3) UNDO: rollback T2 (restore A=200). DB consistent.",
      highlightLines: [25, 26, 27, 28],
      visualState: {
        type: "array1d",
        cells: [
          { val: "REDO: T1(committed)", state: "computed" as const },
          { val: "UNDO: T2(rollback)", state: "highlighted" as const },
          { val: "A=200 (restored)", state: "active" as const },
        ],
        label: "ARIES Recovery",
      },
      variables: { recovered: true, T1: "committed (REDO)", T2: "aborted (UNDO)", A: 200 },
    });

    return steps;
  },
};
