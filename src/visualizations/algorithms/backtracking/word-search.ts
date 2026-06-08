import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type WordSearchInput = { grid: string[][]; word: string };

const pythonCode = `def word_search(board, word):
    rows, cols = len(board), len(board[0])
    def dfs(r, c, idx, path):
        if idx == len(word):
            return True
        if r < 0 or r >= rows or c < 0 or c >= cols:
            return False
        if board[r][c] != word[idx]:
            return False
        temp = board[r][c]
        board[r][c] = '#'
        for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
            if dfs(r+dr, c+dc, idx+1, path+[(r,c)]):
                return True
        board[r][c] = temp
        return False
    for r in range(rows):
        for c in range(cols):
            if dfs(r, c, 0, []):
                return True
    return False`;

export const wordSearchBtModule: VisualizationModule<WordSearchInput> = {
  id: "backtracking-word-search",
  slug: "word-search",
  title: "Word Search",
  category: ["algorithms", "backtracking"],
  difficulty: "intermediate",
  timeComplexity: "O(m*n*4^L)",
  spaceComplexity: "O(L)",
  description:
    "Search for a word in a 2D grid using DFS with backtracking.",
  relatedTopics: ["n-queens", "rat-in-maze"],
  pythonCode,
  codeSteps: [],
  defaultInput: {
    grid: [
      ["A", "B", "C", "E"],
      ["S", "F", "C", "S"],
      ["A", "D", "E", "E"],
    ],
    word: "ABCCED",
  },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const grid = input.grid.map((row) => [...row]);
    const word = input.word;
    const rows = grid.length;
    const cols = grid[0].length;
    const rowLabels = grid.map((_, i) => `R${i}`);
    const colLabels = grid[0].map((_, i) => `C${i}`);
    let found = false;
    const foundPath: [number, number][] = [];

    function matrixSnapshot() {
      return grid.map((row) => [...row]);
    }

    steps.push({
      stepNumber: 1,
      description: `Search for word "${word}" in the grid.`,
      highlightLines: [1],
      visualState: {
        type: "table2d",
        matrix: matrixSnapshot(),
        rowLabels,
        colLabels,
        activeCell: null,
        filledCells: [],
        title: `Search: "${word}"`,
      },
      variables: { word, status: "start" },
    });

    function dfs(r: number, c: number, idx: number, path: [number, number][]): boolean {
      if (steps.length >= 76) return false;
      if (idx === word.length) return true;
      if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
      if (grid[r][c] !== word[idx]) return false;

      steps.push({
        stepNumber: steps.length + 1,
        description: `At (${r},${c})='${grid[r][c]}' matches word[${idx}]='${word[idx]}'. Path so far: ${path.length + 1}/${word.length}`,
        highlightLines: [3, 8, 9],
        visualState: {
          type: "table2d",
          matrix: matrixSnapshot(),
          rowLabels,
          colLabels,
          activeCell: [r, c] as [number, number],
          filledCells: [...path],
          title: `Matching: ${word.slice(0, idx + 1)}`,
        },
        variables: { r, c, matchedSoFar: word.slice(0, idx + 1) },
      });

      const temp = grid[r][c];
      grid[r][c] = "#";
      const newPath = [...path, [r, c] as [number, number]];

      for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        if (dfs(r + dr, c + dc, idx + 1, newPath)) {
          grid[r][c] = temp;
          return true;
        }
      }

      grid[r][c] = temp;
      steps.push({
        stepNumber: steps.length + 1,
        description: `Backtrack from (${r},${c}).`,
        highlightLines: [13],
        visualState: {
          type: "table2d",
          matrix: matrixSnapshot(),
          rowLabels,
          colLabels,
          activeCell: [r, c] as [number, number],
          filledCells: [...path],
          title: "Backtracking...",
        },
        variables: { r, c, backtrack: true },
      });
      return false;
    }

    outer: for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (dfs(r, c, 0, [])) {
          found = true;
          break outer;
        }
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: found ? `Word "${word}" found in grid!` : `Word "${word}" not found.`,
      highlightLines: [16, 17],
      visualState: {
        type: "table2d",
        matrix: matrixSnapshot(),
        rowLabels,
        colLabels,
        activeCell: null,
        filledCells: [],
        title: found ? `"${word}" FOUND` : `"${word}" NOT FOUND`,
      },
      variables: { found },
    });

    return steps;
  },
};
