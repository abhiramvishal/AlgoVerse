import type { AnimationStep, VisualizationModule } from "@/types/visualization";

const pythonCode = `def solve_n_queens(n):
    solutions = []
    queens = []

    def is_safe(row, col):
        for r, c in queens:
            if c == col or abs(r-row) == abs(c-col):
                return False
        return True

    def backtrack(row):
        if row == n:
            solutions.append(list(queens))
            return
        for col in range(n):
            if is_safe(row, col):
                queens.append((row, col))
                backtrack(row + 1)
                queens.pop()

    backtrack(0)
    return solutions`;

export const nQueensModule: VisualizationModule<number> = {
  id: "backtracking-n-queens",
  slug: "n-queens",
  title: "N-Queens Problem",
  category: ["algorithms", "backtracking"],
  difficulty: "intermediate",
  timeComplexity: "O(n!)",
  spaceComplexity: "O(n)",
  description: "Places N queens on an N×N board so no two queens threaten each other using backtracking.",
  relatedTopics: ["sudoku-solver", "graph-coloring"],
  pythonCode,
  codeSteps: [],
  defaultInput: 4,
  generateSteps(input) {
    const n = input ?? 4;
    const steps: AnimationStep[] = [];
    const queens: [number, number][] = [];

    function isSafe(row: number, col: number): boolean {
      for (const [r, c] of queens) {
        if (c === col || Math.abs(r - row) === Math.abs(c - col)) return false;
      }
      return true;
    }

    function getConflicted(row: number, col: number): [number, number][] {
      const conflicts: [number, number][] = [];
      for (const [r, c] of queens) {
        if (c === col || Math.abs(r - row) === Math.abs(c - col)) {
          conflicts.push([r, c]);
        }
      }
      return conflicts;
    }

    let solved = false;

    function backtrack(row: number): boolean {
      if (solved) return true;
      if (row === n) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Solution found! All ${n} queens placed safely.`,
          highlightLines: [10, 11],
          visualState: { type: "nqueens", n, queens: [...queens], current: undefined, conflicted: [] },
          variables: { queens: queens.map(([r, c]) => `(${r},${c})`).join(", "), solution: true },
        });
        solved = true;
        return true;
      }

      for (let col = 0; col < n; col++) {
        steps.push({
          stepNumber: steps.length + 1,
          description: `Try row=${row}, col=${col}.`,
          highlightLines: [13, 14],
          visualState: { type: "nqueens", n, queens: [...queens], current: [row, col] as [number, number], conflicted: [] },
          variables: { row, col, queens: queens.length },
        });

        if (isSafe(row, col)) {
          queens.push([row, col]);
          steps.push({
            stepNumber: steps.length + 1,
            description: `Place queen at (${row}, ${col}). Safe!`,
            highlightLines: [15],
            visualState: { type: "nqueens", n, queens: [...queens], current: undefined, conflicted: [] },
            variables: { row, col, queens: queens.length },
          });

          if (backtrack(row + 1)) return true;

          if (!solved) {
            queens.pop();
            steps.push({
              stepNumber: steps.length + 1,
              description: `Backtrack from row ${row + 1}. Remove queen at (${row}, ${col}).`,
              highlightLines: [17],
              visualState: { type: "nqueens", n, queens: [...queens], current: undefined, conflicted: [] },
              variables: { row, col, backtrack: true },
            });
          }
        } else {
          const conflicts = getConflicted(row, col);
          steps.push({
            stepNumber: steps.length + 1,
            description: `(${row}, ${col}) is unsafe! Conflict with ${conflicts.map(([r, c]) => `(${r},${c})`).join(", ")}.`,
            highlightLines: [5, 6, 7],
            visualState: { type: "nqueens", n, queens: [...queens], current: [row, col] as [number, number], conflicted: conflicts },
            variables: { row, col, conflictCount: conflicts.length },
          });
        }

        if (steps.length > 80) break;
      }

      return false;
    }

    backtrack(0);

    return steps;
  },
};
