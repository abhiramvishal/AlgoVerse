import type { AnimationStep, VisualizationModule } from "@/types/visualization";

// Helper: push a table2d step
function tableStep(
  steps: AnimationStep[], desc: string, lines: number[],
  matrix: (number|string)[][], rowLabels: string[], colLabels: string[],
  title: string, activeCell?: [number,number], filledCells?: [number,number][],
  vars?: Record<string,unknown>
): void {
  steps.push({
    stepNumber: steps.length + 1,
    description: desc,
    highlightLines: lines,
    visualState: { type: "table2d", matrix, rowLabels, colLabels, title, activeCell, filledCells },
    variables: vars ?? {},
  });
}

// Helper: push an array1d step
function arrStep(
  steps: AnimationStep[], desc: string, lines: number[],
  cells: Array<{ val: number|string; state: "default"|"active"|"computed"|"highlighted"|"min" }>,
  label: string, vars?: Record<string,unknown>
): void {
  steps.push({
    stepNumber: steps.length + 1,
    description: desc,
    highlightLines: lines,
    visualState: { type: "array1d", cells, label },
    variables: vars ?? {},
  });
}

// ── Unbounded Knapsack ────────────────────────────────────────────────────────
export const unboundedKnapsackModule: VisualizationModule<{ weights: number[]; values: number[]; capacity: number }> = {
  id: "dp-unbounded-knapsack",
  slug: "unbounded-knapsack",
  title: "Unbounded Knapsack",
  category: ["algorithms", "dynamic-programming"],
  difficulty: "intermediate",
  timeComplexity: "O(n·W)",
  spaceComplexity: "O(W)",
  description: "Maximize total value where each item can be taken any number of times.",
  relatedTopics: ["knapsack-01", "coin-change"],
  pythonCode: `def unbounded_knapsack(weights, values, W):
    dp = [0] * (W + 1)
    for w in range(1, W + 1):
        for i in range(len(weights)):
            if weights[i] <= w:
                dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
    return dp[W]`,
  codeSteps: [],
  defaultInput: { weights: [1, 3, 4, 5], values: [1, 4, 5, 7], capacity: 8 },
  generateSteps(input) {
    const { weights, values, capacity: W } = input ?? { weights: [1, 3, 4, 5], values: [1, 4, 5, 7], capacity: 8 };
    const steps: AnimationStep[] = [];
    const dp = new Array(W + 1).fill(0);

    arrStep(steps, `Unbounded Knapsack W=${W}. dp[w]=max value using capacity w.`, [1, 2],
      dp.map((v, i) => ({ val: v, state: i === 0 ? "computed" : "default" } as { val: number; state: "default"|"computed" })),
      "dp[0..W]", { weights: JSON.stringify(weights), values: JSON.stringify(values) });

    for (let w = 1; w <= W; w++) {
      for (let i = 0; i < weights.length; i++) {
        if (weights[i] <= w) {
          const candidate = dp[w - weights[i]] + values[i];
          if (candidate > dp[w]) {
            dp[w] = candidate;
          }
        }
      }
      arrStep(steps, `w=${w}: dp[${w}]=${dp[w]}`, [3, 4, 5, 6],
        dp.map((v, j) => ({ val: v, state: j === w ? "active" : j < w ? "computed" : "default" } as { val: number; state: "default"|"active"|"computed" })),
        "dp[0..W]", { w, dp_w: dp[w] });
    }

    arrStep(steps, `Unbounded Knapsack result: ${dp[W]}`, [7],
      dp.map((v, i) => ({ val: v, state: i === W ? "highlighted" : "computed" } as { val: number; state: "computed"|"highlighted" })),
      "dp[0..W]", { result: dp[W] });
    return steps;
  },
};

// ── Edit Distance ─────────────────────────────────────────────────────────────
export const editDistanceModule: VisualizationModule<{ s1: string; s2: string }> = {
  id: "dp-edit-distance",
  slug: "edit-distance",
  title: "Edit Distance",
  category: ["algorithms", "dynamic-programming"],
  difficulty: "intermediate",
  timeComplexity: "O(m·n)",
  spaceComplexity: "O(m·n)",
  description: "Minimum insert/delete/replace operations to transform one string to another (Levenshtein).",
  relatedTopics: ["lcs", "dp-string"],
  pythonCode: `def edit_distance(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(m+1): dp[i][0] = i
    for j in range(n+1): dp[0][j] = j
    for i in range(1, m+1):
        for j in range(1, n+1):
            if s1[i-1]==s2[j-1]: dp[i][j]=dp[i-1][j-1]
            else: dp[i][j]=1+min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1])
    return dp[m][n]`,
  codeSteps: [],
  defaultInput: { s1: "kitten", s2: "sitting" },
  generateSteps(input) {
    const { s1, s2 } = input ?? { s1: "kitten", s2: "sitting" };
    const steps: AnimationStep[] = [];
    const m = s1.length, n = s2.length;
    const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
    const rowLabels = ["", ...s1.split("")];
    const colLabels = ["", ...s2.split("")];
    const filledCells: [number,number][] = [];

    tableStep(steps, `Edit Distance: "${s1}" → "${s2}". Initialize base cases.`, [3,4,5],
      dp.map(r=>[...r]), rowLabels, colLabels, "dp[i][j]");

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = s1[i-1] === s2[j-1] ? dp[i-1][j-1]
          : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
        filledCells.push([i,j]);
        if ((i-1)*n+j <= 20) { // limit steps
          tableStep(steps, `dp[${i}][${j}]: '${s1[i-1]}'${s1[i-1]===s2[j-1]?"=":'≠'}'${s2[j-1]}' → ${dp[i][j]}`, [6,7,8],
            dp.map(r=>[...r]), rowLabels, colLabels, "Edit Distance", [i,j], [...filledCells], { val: dp[i][j] });
        }
      }
    }
    tableStep(steps, `Edit Distance "${s1}"→"${s2}" = ${dp[m][n]}`, [9],
      dp.map(r=>[...r]), rowLabels, colLabels, "Final", [m,n], filledCells, { result: dp[m][n] });
    return steps;
  },
};

// ── Matrix Chain Multiplication ───────────────────────────────────────────────
export const matrixChainModule: VisualizationModule<{ dims: number[] }> = {
  id: "dp-matrix-chain",
  slug: "matrix-chain",
  title: "Matrix Chain Multiplication",
  category: ["algorithms", "dynamic-programming"],
  difficulty: "advanced",
  timeComplexity: "O(n³)",
  spaceComplexity: "O(n²)",
  description: "Find optimal parenthesization to minimize scalar multiplications.",
  relatedTopics: ["dp-interval"],
  pythonCode: `def matrix_chain(dims):
    n = len(dims) - 1
    dp = [[0]*n for _ in range(n)]
    for length in range(2, n+1):
        for i in range(n-length+1):
            j = i + length - 1
            dp[i][j] = float('inf')
            for k in range(i, j):
                cost = dp[i][k] + dp[k+1][j] + dims[i]*dims[k+1]*dims[j+1]
                dp[i][j] = min(dp[i][j], cost)
    return dp[0][n-1]`,
  codeSteps: [],
  defaultInput: { dims: [30, 35, 15, 5, 10, 20, 25] },
  generateSteps(input) {
    const { dims } = input ?? { dims: [30, 35, 15, 5, 10, 20, 25] };
    const steps: AnimationStep[] = [];
    const n = dims.length - 1;
    const dp: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
    const labels = Array.from({ length: n }, (_, i) => `M${i+1}`);
    const filledCells: [number,number][] = [];

    tableStep(steps, `Matrix Chain: ${n} matrices. dims=[${dims.join(",")}]`, [1,2],
      dp.map(r=>[...r]), labels, labels, "dp[i][j]=min cost");

    for (let len = 2; len <= n; len++) {
      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1;
        dp[i][j] = Infinity;
        for (let k = i; k < j; k++) {
          const cost = dp[i][k] + dp[k+1][j] + dims[i]*dims[k+1]*dims[j+1];
          if (cost < dp[i][j]) dp[i][j] = cost;
        }
        filledCells.push([i,j]);
        tableStep(steps, `dp[${i}][${j}]=min cost to multiply M${i+1}..M${j+1} = ${dp[i][j]}`, [7,8,9],
          dp.map(r=>r.map(v=>v===Infinity?"∞":v)), labels, labels, "Matrix Chain", [i,j], [...filledCells], { optimal: dp[i][j] });
      }
    }
    return steps;
  },
};

// ── Unique Paths ──────────────────────────────────────────────────────────────
export const uniquePathsModule: VisualizationModule<{ m: number; n: number }> = {
  id: "dp-unique-paths",
  slug: "unique-paths",
  title: "Unique Paths",
  category: ["algorithms", "dynamic-programming"],
  difficulty: "beginner",
  timeComplexity: "O(m·n)",
  spaceComplexity: "O(m·n)",
  description: "Count paths from top-left to bottom-right in m×n grid (only right/down moves).",
  relatedTopics: ["min-path-sum"],
  pythonCode: `def unique_paths(m, n):
    dp = [[1]*n for _ in range(m)]
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
    return dp[m-1][n-1]`,
  codeSteps: [],
  defaultInput: { m: 4, n: 4 },
  generateSteps(input) {
    const { m, n } = input ?? { m: 4, n: 4 };
    const steps: AnimationStep[] = [];
    const dp: number[][] = Array.from({ length: m }, () => new Array(n).fill(1));
    const rows = Array.from({ length: m }, (_, i) => `r${i}`);
    const cols = Array.from({ length: n }, (_, i) => `c${i}`);
    const filledCells: [number,number][] = [];

    tableStep(steps, `Unique Paths ${m}×${n}. Base: first row/col all 1s.`, [1,2],
      dp.map(r=>[...r]), rows, cols, "dp[i][j]");

    for (let i = 1; i < m; i++) {
      for (let j = 1; j < n; j++) {
        dp[i][j] = dp[i-1][j] + dp[i][j-1];
        filledCells.push([i,j]);
        tableStep(steps, `dp[${i}][${j}]=${dp[i-1][j]}+${dp[i][j-1]}=${dp[i][j]}`, [3,4],
          dp.map(r=>[...r]), rows, cols, "Unique Paths", [i,j], [...filledCells], { val: dp[i][j] });
      }
    }
    tableStep(steps, `Total unique paths = ${dp[m-1][n-1]}`, [5],
      dp.map(r=>[...r]), rows, cols, "Final", [m-1,n-1], filledCells, { result: dp[m-1][n-1] });
    return steps;
  },
};

// ── Minimum Path Sum ──────────────────────────────────────────────────────────
export const minPathSumModule: VisualizationModule<{ grid: number[][] }> = {
  id: "dp-min-path-sum",
  slug: "min-path-sum",
  title: "Minimum Path Sum",
  category: ["algorithms", "dynamic-programming"],
  difficulty: "intermediate",
  timeComplexity: "O(m·n)",
  spaceComplexity: "O(m·n)",
  description: "Find the path from top-left to bottom-right with minimum sum of grid values.",
  relatedTopics: ["unique-paths"],
  pythonCode: `def min_path_sum(grid):
    m, n = len(grid), len(grid[0])
    dp = [[0]*n for _ in range(m)]
    dp[0][0] = grid[0][0]
    for j in range(1,n): dp[0][j]=dp[0][j-1]+grid[0][j]
    for i in range(1,m): dp[i][0]=dp[i-1][0]+grid[i][0]
    for i in range(1,m):
        for j in range(1,n):
            dp[i][j]=grid[i][j]+min(dp[i-1][j],dp[i][j-1])
    return dp[m-1][n-1]`,
  codeSteps: [],
  defaultInput: { grid: [[1,3,1],[1,5,1],[4,2,1]] },
  generateSteps(input) {
    const { grid } = input ?? { grid: [[1,3,1],[1,5,1],[4,2,1]] };
    const steps: AnimationStep[] = [];
    const m = grid.length, n = grid[0].length;
    const dp: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
    dp[0][0] = grid[0][0];
    for (let j = 1; j < n; j++) dp[0][j] = dp[0][j-1] + grid[0][j];
    for (let i = 1; i < m; i++) dp[i][0] = dp[i-1][0] + grid[i][0];
    const rows = Array.from({ length: m }, (_, i) => `r${i}`);
    const cols = Array.from({ length: n }, (_, i) => `c${i}`);
    const filledCells: [number,number][] = [];

    tableStep(steps, `Min Path Sum. Grid shown. Initialize borders.`, [3,4,5],
      dp.map(r=>[...r]), rows, cols, "dp[i][j]");

    for (let i = 1; i < m; i++) {
      for (let j = 1; j < n; j++) {
        dp[i][j] = grid[i][j] + Math.min(dp[i-1][j], dp[i][j-1]);
        filledCells.push([i,j]);
        tableStep(steps, `dp[${i}][${j}]=${grid[i][j]}+min(${dp[i-1][j]},${dp[i][j-1]})=${dp[i][j]}`, [8,9],
          dp.map(r=>[...r]), rows, cols, "Min Path Sum", [i,j], [...filledCells], { val: dp[i][j] });
      }
    }
    tableStep(steps, `Minimum path sum = ${dp[m-1][n-1]}`, [10],
      dp.map(r=>[...r]), rows, cols, "Final", [m-1,n-1], filledCells, { result: dp[m-1][n-1] });
    return steps;
  },
};

// ── Word Break ────────────────────────────────────────────────────────────────
export const wordBreakDpModule: VisualizationModule<{ s: string; wordDict: string[] }> = {
  id: "dp-word-break",
  slug: "word-break-dp",
  title: "Word Break",
  category: ["algorithms", "dynamic-programming"],
  difficulty: "intermediate",
  timeComplexity: "O(n²)",
  spaceComplexity: "O(n)",
  description: "Determine if a string can be segmented into dictionary words using 1D DP.",
  relatedTopics: ["dp-string"],
  pythonCode: `def word_break(s, wordDict):
    words = set(wordDict)
    dp = [False] * (len(s) + 1)
    dp[0] = True
    for i in range(1, len(s)+1):
        for j in range(i):
            if dp[j] and s[j:i] in words:
                dp[i] = True; break
    return dp[len(s)]`,
  codeSteps: [],
  defaultInput: { s: "leetcode", wordDict: ["leet", "code"] },
  generateSteps(input) {
    const { s, wordDict } = input ?? { s: "leetcode", wordDict: ["leet", "code"] };
    const steps: AnimationStep[] = [];
    const words = new Set(wordDict);
    const dp = new Array(s.length + 1).fill(false);
    dp[0] = true;

    arrStep(steps, `Word Break: "${s}", dict=[${wordDict.join(",")}]. dp[0]=true.`, [3,4],
      dp.map((v,i)=>({ val: i===0?"T":"F", state: i===0?"computed":"default" } as { val: string; state: "default"|"computed" })),
      "dp[0..n]", { s, wordDict: JSON.stringify(wordDict) });

    for (let i = 1; i <= s.length; i++) {
      for (let j = 0; j < i; j++) {
        const sub = s.slice(j, i);
        if (dp[j] && words.has(sub)) {
          dp[i] = true;
          break;
        }
      }
      arrStep(steps, `dp[${i}]: dp[${i}]=${dp[i]} (checking substrings ending at ${i})`, [5,6,7],
        dp.map((v,k)=>({ val: v?"T":"F", state: k===i?"active":k<i?"computed":"default" } as { val: string; state: "default"|"active"|"computed" })),
        "dp[0..n]", { i, result: dp[i] });
    }

    arrStep(steps, `Word Break result: ${dp[s.length] ? "YES" : "NO"}`, [8],
      dp.map((v,k)=>({ val: v?"T":"F", state: k===s.length?"highlighted":"computed" } as { val: string; state: "computed"|"highlighted" })),
      "dp[0..n]", { answer: dp[s.length] });
    return steps;
  },
};

// ── Palindrome Partitioning ───────────────────────────────────────────────────
export const palindromePartitionDpModule: VisualizationModule<{ s: string }> = {
  id: "dp-palindrome-partition",
  slug: "palindrome-partition-dp",
  title: "Palindrome Partitioning (Min Cuts)",
  category: ["algorithms", "dynamic-programming"],
  difficulty: "advanced",
  timeComplexity: "O(n²)",
  spaceComplexity: "O(n²)",
  description: "Find minimum number of cuts to partition string into palindromic substrings.",
  relatedTopics: ["manacher"],
  pythonCode: `def min_cut(s):
    n = len(s)
    is_pal = [[False]*n for _ in range(n)]
    for i in range(n): is_pal[i][i] = True
    for l in range(2, n+1):
        for i in range(n-l+1):
            j = i+l-1
            is_pal[i][j] = (s[i]==s[j]) and (l==2 or is_pal[i+1][j-1])
    dp = list(range(-1, n))  # dp[i] = min cuts for s[0..i]
    for i in range(n):
        for j in range(i+1):
            if is_pal[j][i]: dp[i+1] = min(dp[i+1], dp[j]+1)
    return dp[n]`,
  codeSteps: [],
  defaultInput: { s: "aab" },
  generateSteps(input) {
    const { s } = input ?? { s: "aab" };
    const steps: AnimationStep[] = [];
    const n = s.length;
    const isPal = Array.from({ length: n }, () => new Array(n).fill(false));
    for (let i = 0; i < n; i++) isPal[i][i] = true;
    for (let len = 2; len <= n; len++) {
      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1;
        isPal[i][j] = s[i] === s[j] && (len === 2 || isPal[i+1][j-1]);
      }
    }
    const dp = Array.from({ length: n+1 }, (_, i) => i - 1);
    const rows = s.split("").map((c, i) => `${i}:${c}`);
    const cols = s.split("").map((c, i) => `${i}:${c}`);

    tableStep(steps, `Palindrome Partition: "${s}". First build palindrome table.`, [1,2,3],
      isPal.map(r=>r.map(v=>v?"T":"-")), rows, cols, "isPal[i][j]");

    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= i; j++) {
        if (isPal[j][i]) dp[i+1] = Math.min(dp[i+1], dp[j]+1);
      }
      arrStep(steps, `dp[${i+1}]=${dp[i+1]} (min cuts for s[0..${i}]="${s.slice(0,i+1)}")`, [9,10],
        dp.map((v,k)=>({ val: v, state: k===i+1?"active":k<i+1?"computed":"default" } as { val: number; state: "default"|"active"|"computed" })),
        "dp[0..n]", { i, minCuts: dp[i+1] });
    }

    arrStep(steps, `Min cuts for "${s}" = ${dp[n]}`, [11],
      dp.map((v,k)=>({ val: v, state: k===n?"highlighted":"computed" } as { val: number; state: "computed"|"highlighted" })),
      "dp[0..n]", { result: dp[n] });
    return steps;
  },
};

// ── Rod Cutting ────────────────────────────────────────────────────────────────
export const rodCuttingModule: VisualizationModule<{ prices: number[]; length: number }> = {
  id: "dp-rod-cutting",
  slug: "rod-cutting",
  title: "Rod Cutting",
  category: ["algorithms", "dynamic-programming"],
  difficulty: "intermediate",
  timeComplexity: "O(n²)",
  spaceComplexity: "O(n)",
  description: "Maximize revenue by cutting rod of length n into pieces with given prices.",
  relatedTopics: ["unbounded-knapsack"],
  pythonCode: `def rod_cutting(prices, n):
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        for j in range(1, i + 1):
            dp[i] = max(dp[i], prices[j-1] + dp[i-j])
    return dp[n]`,
  codeSteps: [],
  defaultInput: { prices: [1,5,8,9,10,17,17,20], length: 8 },
  generateSteps(input) {
    const { prices, length: n } = input ?? { prices: [1,5,8,9,10,17,17,20], length: 8 };
    const steps: AnimationStep[] = [];
    const dp = new Array(n+1).fill(0);

    arrStep(steps, `Rod Cutting: n=${n}, prices=[${prices.join(",")}]`, [1,2],
      dp.map((v,i)=>({ val: v, state: "default" } as { val: number; state: "default" })),
      "dp[0..n]", { n, prices: JSON.stringify(prices) });

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= i; j++) {
        dp[i] = Math.max(dp[i], prices[j-1] + dp[i-j]);
      }
      arrStep(steps, `dp[${i}]=${dp[i]} (best revenue for rod length ${i})`, [3,4,5],
        dp.map((v,k)=>({ val: v, state: k===i?"active":k<i?"computed":"default" } as { val: number; state: "default"|"active"|"computed" })),
        "dp[0..n]", { i, maxRevenue: dp[i] });
    }

    arrStep(steps, `Max revenue for length ${n} = ${dp[n]}`, [6],
      dp.map((v,k)=>({ val: v, state: k===n?"highlighted":"computed" } as { val: number; state: "computed"|"highlighted" })),
      "dp[0..n]", { result: dp[n] });
    return steps;
  },
};

// ── Egg Drop ──────────────────────────────────────────────────────────────────
export const eggDropModule: VisualizationModule<{ eggs: number; floors: number }> = {
  id: "dp-egg-drop",
  slug: "egg-drop",
  title: "Egg Drop Problem",
  category: ["algorithms", "dynamic-programming"],
  difficulty: "advanced",
  timeComplexity: "O(n·k²)",
  spaceComplexity: "O(n·k)",
  description: "Find minimum trials to determine critical floor. dp[e][f]=min trials with e eggs and f floors.",
  relatedTopics: ["dp-optimization"],
  pythonCode: `def egg_drop(eggs, floors):
    dp = [[0]*(floors+1) for _ in range(eggs+1)]
    for f in range(1, floors+1): dp[1][f] = f
    for e in range(2, eggs+1):
        for f in range(1, floors+1):
            dp[e][f] = float('inf')
            for x in range(1, f+1):
                worst = max(dp[e-1][x-1], dp[e][f-x])
                dp[e][f] = min(dp[e][f], 1 + worst)
    return dp[eggs][floors]`,
  codeSteps: [],
  defaultInput: { eggs: 3, floors: 10 },
  generateSteps(input) {
    const { eggs: E, floors: F } = input ?? { eggs: 3, floors: 10 };
    const steps: AnimationStep[] = [];
    const dp = Array.from({ length: E+1 }, (_, e) =>
      Array.from({ length: F+1 }, (_, f) => e===0?0:f===0?0:e===1?f:0));
    const rowLabels = Array.from({ length: E+1 }, (_, i) => `${i}egg`);
    const colLabels = Array.from({ length: F+1 }, (_, i) => `${i}f`);
    const filledCells: [number,number][] = [];

    tableStep(steps, `Egg Drop: ${E} eggs, ${F} floors. Initialize: 1 egg needs f trials for f floors.`, [1,2,3],
      dp.map(r=>[...r]), rowLabels, colLabels, "dp[eggs][floors]");

    for (let e = 2; e <= E; e++) {
      for (let f = 1; f <= F; f++) {
        dp[e][f] = Infinity;
        for (let x = 1; x <= f; x++) {
          const worst = Math.max(dp[e-1][x-1], dp[e][f-x]);
          dp[e][f] = Math.min(dp[e][f], 1 + worst);
        }
        filledCells.push([e,f]);
        if (filledCells.length <= 20) {
          tableStep(steps, `dp[${e}][${f}]=${dp[e][f]} min trials with ${e} eggs, ${f} floors`, [5,6,7,8],
            dp.map(r=>[...r]), rowLabels, colLabels, "Egg Drop", [e,f], [...filledCells], { val: dp[e][f] });
        }
      }
    }
    tableStep(steps, `Answer: ${dp[E][F]} trials needed.`, [9],
      dp.map(r=>[...r]), rowLabels, colLabels, "Final", [E,F], filledCells, { result: dp[E][F] });
    return steps;
  },
};

// ── TSP with Bitmask DP ───────────────────────────────────────────────────────
export const tspDpModule: VisualizationModule<null> = {
  id: "dp-tsp",
  slug: "tsp-dp",
  title: "TSP (Bitmask DP)",
  category: ["algorithms", "dynamic-programming"],
  difficulty: "advanced",
  timeComplexity: "O(n²·2ⁿ)",
  spaceComplexity: "O(n·2ⁿ)",
  description: "Traveling Salesman Problem using bitmask DP. dp[mask][i] = min cost to visit cities in mask, ending at i.",
  relatedTopics: ["bitmask-basics", "dp-optimization"],
  pythonCode: `def tsp(dist, n):
    INF = float('inf')
    dp = [[INF]*n for _ in range(1<<n)]
    dp[1][0] = 0  # start at city 0
    for mask in range(1<<n):
        for u in range(n):
            if not (mask>>u&1): continue
            for v in range(n):
                if mask>>v&1: continue
                new_mask = mask|(1<<v)
                dp[new_mask][v]=min(dp[new_mask][v],dp[mask][u]+dist[u][v])
    full = (1<<n)-1
    return min(dp[full][i]+dist[i][0] for i in range(n))`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const n = 4;
    const dist = [
      [0, 10, 15, 20],
      [10, 0, 35, 25],
      [15, 35, 0, 30],
      [20, 25, 30, 0],
    ];
    const INF = 999;
    const dp: number[][] = Array.from({ length: 1<<n }, () => new Array(n).fill(INF));
    dp[1][0] = 0;

    const cities = ["A","B","C","D"];
    const rowLabels = Array.from({ length: 1<<n }, (_, i) => i.toString(2).padStart(n,"0"));
    const colLabels = cities;

    steps.push({
      stepNumber: 1,
      description: `TSP Bitmask DP: ${n} cities. dp[mask][i]=min cost to visit cities in mask ending at i.`,
      highlightLines: [1,2,3],
      visualState: {
        type: "table2d",
        matrix: dp.slice(0,8).map(r=>r.map(v=>v===INF?"∞":v)),
        rowLabels: rowLabels.slice(0,8),
        colLabels,
        title: "dp[mask][city]",
      },
      variables: { n, cities: JSON.stringify(cities) },
    });

    for (let mask = 1; mask < (1<<n); mask++) {
      for (let u = 0; u < n; u++) {
        if (!(mask >> u & 1)) continue;
        for (let v = 0; v < n; v++) {
          if (mask >> v & 1) continue;
          const newMask = mask | (1 << v);
          if (dp[mask][u] + dist[u][v] < dp[newMask][v]) {
            dp[newMask][v] = dp[mask][u] + dist[u][v];
          }
        }
      }
    }

    const full = (1<<n)-1;
    const minCost = Math.min(...dp[full].map((c, i) => c + dist[i][0]));

    steps.push({
      stepNumber: 2,
      description: `Fill all masks. Final: dp[1111][*] + return to 0.`,
      highlightLines: [4,5,6],
      visualState: {
        type: "table2d",
        matrix: dp.slice(0,8).map(r=>r.map(v=>v===INF?"∞":v)),
        rowLabels: rowLabels.slice(0,8),
        colLabels,
        title: "dp partial",
      },
      variables: {},
    });

    steps.push({
      stepNumber: 3,
      description: `Minimum TSP tour cost = ${minCost}.`,
      highlightLines: [11],
      visualState: {
        type: "array1d",
        cells: dp[full].map((v,i) => ({ val: `${cities[i]}:${v===INF?"∞":v+dist[i][0]}`, state: "computed" as const })),
        label: "Return costs (min tour)",
      },
      variables: { optimalCost: minCost },
    });

    return steps;
  },
};

// ── Sum Over Subsets DP ──────────────────────────────────────────────────────
export const sosDpModule: VisualizationModule<{ a: number[] }> = {
  id: "dp-sos",
  slug: "sos-dp",
  title: "Sum Over Subsets (SOS DP)",
  category: ["algorithms", "dynamic-programming"],
  difficulty: "advanced",
  timeComplexity: "O(n·2ⁿ)",
  spaceComplexity: "O(2ⁿ)",
  description: "Compute f[mask] = sum of a[submask] for all submasks of mask, in O(n·2ⁿ).",
  relatedTopics: ["bitmask-basics"],
  pythonCode: `def sos_dp(a, n):
    # f[mask] = sum of a[S] for all S subset of mask
    f = a[:]
    for i in range(n):        # iterate over bits
        for mask in range(1<<n):
            if mask>>i & 1:   # bit i is set
                f[mask] += f[mask ^ (1<<i)]
    return f`,
  codeSteps: [],
  defaultInput: { a: [1, 0, 0, 1, 1, 0, 0, 0] },
  generateSteps(input) {
    const { a } = input ?? { a: [1, 0, 0, 1, 1, 0, 0, 0] };
    const steps: AnimationStep[] = [];
    const n = Math.log2(a.length);
    const f = [...a];

    arrStep(steps, `SOS DP: f[mask]=sum of a[submask]. Initial f=a.`, [1,2],
      f.map((v,i)=>({ val: `${i.toString(2).padStart(n,"0")}:${v}`, state: "default" } as { val: string; state: "default" })),
      "f[mask]", { n, a: JSON.stringify(a) });

    for (let i = 0; i < n; i++) {
      for (let mask = 0; mask < (1<<n); mask++) {
        if ((mask >> i) & 1) {
          f[mask] += f[mask ^ (1 << i)];
        }
      }
      arrStep(steps, `After processing bit ${i}: f updated for masks with bit ${i} set.`, [4,5,6,7],
        f.map((v,k)=>({ val: `${k.toString(2).padStart(n,"0")}:${v}`, state: (k>>i&1)?("computed" as const):("default" as const) })),
        `f after bit ${i}`, { bit: i });
    }

    arrStep(steps, `SOS DP complete. f[mask] now contains sum over all subsets.`, [8],
      f.map((v,k)=>({ val: `${k.toString(2).padStart(n,"0")}:${v}`, state: "highlighted" as const })),
      "Final f[mask]", { result: JSON.stringify(f) });
    return steps;
  },
};
