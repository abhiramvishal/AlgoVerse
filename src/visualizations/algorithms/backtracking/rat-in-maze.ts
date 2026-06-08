import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type RatInMazeInput = number[][];

const pythonCode = `def rat_in_maze(maze):
    n = len(maze)
    path = [[0]*n for _ in range(n)]
    def solve(r, c):
        if r == n-1 and c == n-1:
            path[r][c] = 1
            return True
        if 0 <= r < n and 0 <= c < n and maze[r][c] == 1:
            path[r][c] = 1
            if solve(r+1, c) or solve(r, c+1):
                return True
            path[r][c] = 0  # backtrack
        return False
    return solve(0, 0), path`;

export const ratInMazeModule: VisualizationModule<RatInMazeInput> = {
  id: "backtracking-rat-in-maze",
  slug: "rat-in-maze",
  title: "Rat in a Maze",
  category: ["algorithms", "backtracking"],
  difficulty: "intermediate",
  timeComplexity: "O(2^(n^2))",
  spaceComplexity: "O(n^2)",
  description:
    "Find path from (0,0) to (n-1,n-1) in a 0/1 maze using backtracking.",
  relatedTopics: ["word-search", "n-queens"],
  pythonCode,
  codeSteps: [],
  defaultInput: [
    [1, 0, 0, 0],
    [1, 1, 0, 1],
    [0, 1, 0, 0],
    [0, 1, 1, 1],
  ],
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const maze = input;
    const n = maze.length;
    const rowLabels = maze.map((_, i) => `R${i}`);
    const colLabels = maze[0].map((_, i) => `C${i}`);
    const pathCells: [number, number][] = [];

    function matrixSnapshot() {
      return maze.map((row) => [...row]);
    }

    steps.push({
      stepNumber: 1,
      description: "Start at (0,0). 1=open, 0=blocked. Find path to bottom-right.",
      highlightLines: [1, 2],
      visualState: {
        type: "table2d",
        matrix: matrixSnapshot(),
        rowLabels,
        colLabels,
        activeCell: [0, 0] as [number, number],
        filledCells: [],
        title: "Rat in Maze",
      },
      variables: { ratAt: "(0,0)", goal: `(${n - 1},${n - 1})` },
    });

    function solve(r: number, c: number): boolean {
      if (steps.length >= 76) return false;
      if (r === n - 1 && c === n - 1) {
        pathCells.push([r, c]);
        steps.push({
          stepNumber: steps.length + 1,
          description: `Reached goal (${r},${c})! Path found.`,
          highlightLines: [4, 5],
          visualState: {
            type: "table2d",
            matrix: matrixSnapshot(),
            rowLabels,
            colLabels,
            activeCell: [r, c] as [number, number],
            filledCells: [...pathCells],
            title: "Goal reached!",
          },
          variables: { r, c, pathLength: pathCells.length },
        });
        return true;
      }

      if (r < 0 || r >= n || c < 0 || c >= n || maze[r][c] === 0) return false;

      pathCells.push([r, c]);
      steps.push({
        stepNumber: steps.length + 1,
        description: `Move to (${r},${c}). Path so far: ${pathCells.length} cells.`,
        highlightLines: [7, 8],
        visualState: {
          type: "table2d",
          matrix: matrixSnapshot(),
          rowLabels,
          colLabels,
          activeCell: [r, c] as [number, number],
          filledCells: [...pathCells],
          title: `Rat at (${r},${c})`,
        },
        variables: { r, c, pathLength: pathCells.length },
      });

      if (solve(r + 1, c) || solve(r, c + 1)) return true;

      pathCells.pop();
      steps.push({
        stepNumber: steps.length + 1,
        description: `Backtrack from (${r},${c}).`,
        highlightLines: [10],
        visualState: {
          type: "table2d",
          matrix: matrixSnapshot(),
          rowLabels,
          colLabels,
          activeCell: [r, c] as [number, number],
          filledCells: [...pathCells],
          title: `Backtrack at (${r},${c})`,
        },
        variables: { r, c, backtrack: true },
      });
      return false;
    }

    const success = solve(0, 0);

    steps.push({
      stepNumber: steps.length + 1,
      description: success ? `Path found with ${pathCells.length} steps!` : "No path exists.",
      highlightLines: [11],
      visualState: {
        type: "table2d",
        matrix: matrixSnapshot(),
        rowLabels,
        colLabels,
        activeCell: null,
        filledCells: success ? [...pathCells] : [],
        title: success ? "Path Found!" : "No Path",
      },
      variables: { success, pathLength: pathCells.length },
    });

    return steps;
  },
};
