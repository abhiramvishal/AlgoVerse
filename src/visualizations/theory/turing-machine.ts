import type { AnimationStep, VisualizationModule } from "@/types/visualization";

// Turing Machine for unary addition: 1^m 0 1^n -> 1^(m+n)
// Strategy: replace first '0' with '1', then move to end of second block and erase last '1'

export const turingMachineModule: VisualizationModule<{ tape: string[] }> = {
  id: "turing-machine",
  slug: "turing-machine",
  title: "Turing Machine",
  category: ["theory", "automata"],
  difficulty: "advanced",
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)",
  description: "Turing machine for unary addition: 1^m 0 1^n → 1^(m+n). Replaces '0' with '1', then erases the last '1' to get the correct count.",
  relatedTopics: ["pda", "cfg"],
  pythonCode: `# Turing machine: unary addition
# Tape: 1..1 0 1..1
# Replace '0' with '1', then erase last '1'
def tm_unary_add(tape):
    tape = list(tape)
    # Replace 0 with 1
    for i, c in enumerate(tape):
        if c == '0':
            tape[i] = '1'
            break
    # Erase last 1 before blank
    for i in range(len(tape)-1, -1, -1):
        if tape[i] == '1':
            tape[i] = 'B'
            break
    return tape`,
  codeSteps: [],
  defaultInput: { tape: ["1", "1", "1", "0", "1", "1", "B", "B", "B"] },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const tape = [...(input?.tape ?? ["1", "1", "1", "0", "1", "1", "B", "B", "B"])];
    let head = 0;
    let state = "q0";

    function makeStep(desc: string, lines: number[]) {
      const cells = tape.map((val, i) => ({
        val,
        state: i === head ? "active" : val === "B" ? "empty" : "default",
      }));
      steps.push({
        stepNumber: steps.length + 1,
        description: desc,
        highlightLines: lines,
        visualState: {
          type: "array1d",
          cells,
          label: `TM State: ${state} | Head at position ${head}`,
          pointer: [{ index: head, label: "HEAD" }],
        },
        variables: { state, head, tape: tape.join("") },
      });
    }

    makeStep(`Initial tape: [${tape.join(",")}]. Head at position 0. State: q0.`, [1]);

    // Phase 1: scan right to find '0', replace with '1'
    state = "q_scan";
    while (head < tape.length && tape[head] !== "0") {
      makeStep(`State ${state}: read '${tape[head]}' at pos ${head}, move right.`, [4, 5, 6]);
      head++;
    }

    if (head < tape.length && tape[head] === "0") {
      tape[head] = "1";
      state = "q_replace";
      makeStep(`Found '0' at pos ${head}: replace with '1'. State → q_replace.`, [7, 8]);
      head++;
    }

    // Phase 2: continue right to end of second block of 1s
    state = "q_find_end";
    while (head < tape.length && tape[head] === "1") {
      makeStep(`State ${state}: read '1' at pos ${head}, move right.`, [10, 11]);
      head++;
    }

    // head is now at first 'B' after the second block — go back one to last '1'
    head--;
    state = "q_erase";
    makeStep(`Reached end of second block. Move back to pos ${head} to erase last '1'.`, [12, 13]);

    if (head >= 0 && tape[head] === "1") {
      tape[head] = "B";
      state = "q_halt";
      makeStep(`Erase '1' at pos ${head} → 'B'. Total 1s = ${tape.filter(c => c === "1").length}. HALT.`, [14, 15]);
    }

    makeStep(`Turing machine halts. Final tape: [${tape.join(",")}]. Result: ${tape.filter(c => c === "1").length} ones = 3+2=5.`, [16]);

    return steps;
  },
};
