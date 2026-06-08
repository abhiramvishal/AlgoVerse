import type { AnimationStep, VisualizationModule } from "@/types/visualization";

// PDA for balanced parentheses
// States: q0 (reading), q1 (accepting)
// Push '(' onto stack, pop on ')'

export const pdaModule: VisualizationModule<{ input: string }> = {
  id: "pda",
  slug: "pda",
  title: "Pushdown Automaton",
  category: ["theory", "automata"],
  difficulty: "advanced",
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)",
  description: "PDA for balanced parentheses. Pushes '(' onto stack, pops on ')'. Accepts when stack is empty at end.",
  relatedTopics: ["cfg", "turing-machine"],
  pythonCode: `def pda_balanced(input_str):
    stack = []
    for ch in input_str:
        if ch == '(':
            stack.append('(')
        elif ch == ')':
            if not stack:
                return False
            stack.pop()
    return len(stack) == 0`,
  codeSteps: [],
  defaultInput: { input: "((()))" },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const str = input?.input ?? "((()))";
    const stack: string[] = [];
    let state = "q0";
    let accepted = false;

    const lanes = ["Input", "PDA State", "Stack"];

    function push(desc: string, highlight: number[], inputRemaining: string, activeStep: number, completedSteps: number[]) {
      steps.push({
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: highlight,
        visualState: {
          type: "flowdiagram",
          lanes,
          steps: [
            { from: "Input", to: "PDA State", label: inputRemaining || "ε", color: "#6366f1" },
            { from: "PDA State", to: "Stack", label: [...stack].reverse().join("") || "∅", color: "#10b981" },
          ],
          activeStep,
          completedSteps,
        },
        variables: { state, stack: `[${stack.join(",")}]`, remaining: inputRemaining },
      });
    }

    push(`Initialize PDA. Input: "${str}". Stack: empty.`, [1], str, 0, []);

    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const remaining = str.slice(i + 1);
      if (ch === "(") {
        stack.push("(");
        push(`Read '(': push onto stack. Stack: [${stack.join("")}].`, [4, 5], remaining, i + 1, Array.from({ length: i + 1 }, (_, k) => k));
      } else if (ch === ")") {
        if (stack.length === 0) {
          state = "reject";
          push(`Read ')': stack empty — REJECT.`, [7, 8], remaining, i + 1, []);
          break;
        }
        stack.pop();
        push(`Read ')': pop from stack. Stack: [${stack.join("") || "∅"}].`, [7, 8, 9], remaining, i + 1, Array.from({ length: i + 1 }, (_, k) => k));
      }
    }

    accepted = state !== "reject" && stack.length === 0;
    if (state !== "reject") {
      state = accepted ? "q_accept" : "q_reject";
    }

    push(
      `Input consumed. Stack: ${stack.length === 0 ? "empty" : `[${stack.join("")}]`}. ${accepted ? "ACCEPTED" : "REJECTED"}.`,
      [10],
      "",
      str.length,
      Array.from({ length: str.length }, (_, k) => k),
    );

    return steps;
  },
};
