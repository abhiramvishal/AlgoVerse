import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type SudokuInput = number[][];

const pythonCode = `def solve_sudoku(board):
    empty = find_empty(board)
    if not empty:
        return True
    row, col = empty
    for num in range(1, len(board) + 1):
        if is_valid(board, row, col, num):
            board[row][col] = num
            if solve_sudoku(board):
                return True
            board[row][col] = 0  # backtrack
    return False

def is_valid(board, row, col, num):
    n = len(board)
    if num in board[row]:
        return False
    if num in [board[r][col] for r in range(n)]:
        return False
    return True

def find_empty(board):
    for r in range(len(board)):
        for c in range(len(board[0])):
            if board[r][c] == 0:
                return (r, c)
    return None`;

export const sudokuSolverModule: VisualizationModule<SudokuInput> = {
  id: "backtracking-sudoku-solver",
  slug: "sudoku-solver",
  title: "Sudoku Solver",
  category: ["algorithms", "backtracking"],
  difficulty: "advanced",
  timeComplexity: "O(n^(n*n))",
  spaceComplexity: "O(n*n)",
  description:
    "Solve a 4x4 Sudoku using backtracking: try each number, backtrack on conflict.",
  relatedTopics: ["n-queens", "graph-coloring"],
  pythonCode,
  codeSteps: [],
  defaultInput: [
    [1, 0, 0, 4],
    [0, 0, 2, 0],
    [0, 3, 0, 0],
    [4, 0, 0, 1],
  ],
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const board = input.map((row) => [...row]);
    const n = board.length;
    const rowLabels = ["R1", "R2", "R3", "R4"];
    const colLabels = ["C1", "C2", "C3", "C4"];

    function matrixSnapshot() {
      return board.map((row) => [...row]);
    }

    function isValid(r: number, c: number, num: number): boolean {
      for (let i = 0; i < n; i++) {
        if (board[r][i] === num) return false;
        if (board[i][c] === num) return false;
      }
      return true;
    }

    function findEmpty(): [number, number] | null {
      for (let r = 0; r < n; r++)
        for (let c = 0; c < n; c++)
          if (board[r][c] === 0) return [r, c];
      return null;
    }

    steps.push({
      stepNumber: 1,
      description: "Initial board. 0 = empty cell.",
      highlightLines: [1],
      visualState: {
        type: "table2d",
        matrix: matrixSnapshot(),
        rowLabels,
        colLabels,
        activeCell: null,
        filledCells: [],
        title: "4x4 Sudoku",
      },
      variables: { status: "start" },
    });

    const filledCells: [number, number][] = [];

    function solve(): boolean {
      if (steps.length >= 78) return true;
      const empty = findEmpty();
      if (!empty) return true;
      const [r, c] = empty;

      for (let num = 1; num <= n; num++) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Try placing ${num} at (${r + 1}, ${c + 1}).`,
          highlightLines: [6, 7],
          visualState: {
            type: "table2d",
            matrix: matrixSnapshot(),
            rowLabels,
            colLabels,
            activeCell: [r, c] as [number, number],
            filledCells: [...filledCells],
            title: `Trying ${num} at row=${r + 1}, col=${c + 1}`,
          },
          variables: { row: r + 1, col: c + 1, trying: num },
        });

        if (isValid(r, c, num)) {
          board[r][c] = num;
          filledCells.push([r, c]);
          steps.push({
            stepNumber: steps.length + 1,
            description: `Placed ${num} at (${r + 1}, ${c + 1}). Valid so far.`,
            highlightLines: [8, 9],
            visualState: {
              type: "table2d",
              matrix: matrixSnapshot(),
              rowLabels,
              colLabels,
              activeCell: [r, c] as [number, number],
              filledCells: [...filledCells],
              title: `Placed ${num} at (${r + 1}, ${c + 1})`,
            },
            variables: { row: r + 1, col: c + 1, placed: num },
          });

          if (solve()) return true;

          board[r][c] = 0;
          const idx = filledCells.findIndex(([fr, fc]) => fr === r && fc === c);
          if (idx >= 0) filledCells.splice(idx, 1);

          steps.push({
            stepNumber: steps.length + 1,
            description: `Backtrack: remove ${num} from (${r + 1}, ${c + 1}).`,
            highlightLines: [10],
            visualState: {
              type: "table2d",
              matrix: matrixSnapshot(),
              rowLabels,
              colLabels,
              activeCell: [r, c] as [number, number],
              filledCells: [...filledCells],
              title: `Backtrack at (${r + 1}, ${c + 1})`,
            },
            variables: { row: r + 1, col: c + 1, backtrack: num },
          });
        }
      }
      return false;
    }

    solve();

    steps.push({
      stepNumber: steps.length + 1,
      description: "Sudoku solved!",
      highlightLines: [2, 3],
      visualState: {
        type: "table2d",
        matrix: matrixSnapshot(),
        rowLabels,
        colLabels,
        activeCell: null,
        filledCells: [],
        title: "Solved!",
      },
      variables: { status: "solved" },
    });

    return steps;
  },
};
