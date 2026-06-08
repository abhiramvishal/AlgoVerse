import type { AnimationStep, VisualizationModule } from "@/types/visualization";

type AhoCorasickInput = { text: string; patterns: string[] };

const pythonCode = `from collections import deque

def aho_corasick(text, patterns):
    # Build trie
    goto = [{}]
    fail = [0]
    output = [[]]
    for p in patterns:
        state = 0
        for c in p:
            if c not in goto[state]:
                goto[state][c] = len(goto)
                goto.append({})
                fail.append(0)
                output.append([])
            state = goto[state][c]
        output[state].append(p)
    # Build failure links via BFS
    q = deque()
    for c, s in goto[0].items():
        fail[s] = 0
        q.append(s)
    while q:
        r = q.popleft()
        for c, s in goto[r].items():
            q.append(s)
            state = fail[r]
            while state and c not in goto[state]:
                state = fail[state]
            fail[s] = goto[state].get(c, 0)
            if fail[s] == s:
                fail[s] = 0
            output[s] += output[fail[s]]
    # Search
    state = 0
    results = []
    for i, c in enumerate(text):
        while state and c not in goto[state]:
            state = fail[state]
        state = goto[state].get(c, 0)
        for p in output[state]:
            results.append((i - len(p) + 1, p))
    return results`;

export const ahoCorasickModule: VisualizationModule<AhoCorasickInput> = {
  id: "string-aho-corasick",
  slug: "aho-corasick",
  title: "Aho-Corasick",
  category: ["algorithms", "string"],
  difficulty: "advanced",
  timeComplexity: "O(n + m + z)",
  spaceComplexity: "O(m * alphabet)",
  description:
    "Multi-pattern string matching using an automaton with failure links.",
  relatedTopics: ["kmp", "rabin-karp", "z-algorithm"],
  pythonCode,
  codeSteps: [],
  defaultInput: { text: "ahishers", patterns: ["he", "she", "his", "hers"] },
  generateSteps(input) {
    const steps: AnimationStep[] = [];
    const { text, patterns } = input;

    // Build trie
    const gotoTable: Record<string, number>[] = [{}];
    const fail: number[] = [0];
    const output: string[][] = [[]];

    for (const p of patterns) {
      let state = 0;
      for (const c of p) {
        if (!(c in gotoTable[state])) {
          gotoTable[state][c] = gotoTable.length;
          gotoTable.push({});
          fail.push(0);
          output.push([]);
        }
        state = gotoTable[state][c];
      }
      output[state].push(p);
    }

    steps.push({
      stepNumber: 1,
      description: `Trie built with ${gotoTable.length} states for patterns: ${patterns.join(", ")}.`,
      highlightLines: [4, 5, 6, 7, 8, 9, 10],
      visualState: {
        type: "textmatch",
        text,
        pattern: patterns.join("|"),
        textHighlight: [],
        patternHighlight: [],
        matchIndices: [],
        mismatchIndex: -1,
        offset: 0,
        label: `Trie: ${gotoTable.length} states`,
      },
      variables: { states: gotoTable.length, patterns },
    });

    // Build failure links via BFS
    const queue: number[] = [];
    for (const c in gotoTable[0]) {
      const s = gotoTable[0][c];
      fail[s] = 0;
      queue.push(s);
    }

    let qi = 0;
    while (qi < queue.length) {
      const r = queue[qi++];
      for (const c in gotoTable[r]) {
        const s = gotoTable[r][c];
        queue.push(s);
        let state = fail[r];
        while (state !== 0 && !(c in gotoTable[state])) state = fail[state];
        fail[s] = gotoTable[state][c] ?? 0;
        if (fail[s] === s) fail[s] = 0;
        output[s] = [...output[s], ...output[fail[s]]];
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: "Failure links built. Now scanning text.",
      highlightLines: [17, 18, 19, 20],
      visualState: {
        type: "textmatch",
        text,
        pattern: patterns.join("|"),
        textHighlight: [],
        patternHighlight: [],
        matchIndices: [],
        mismatchIndex: -1,
        offset: 0,
        label: "Scanning text...",
      },
      variables: { failLinks: [...fail] },
    });

    // Search
    let state = 0;
    const results: { pos: number; pattern: string }[] = [];
    const matchIndices: number[] = [];

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      while (state !== 0 && !(c in gotoTable[state])) state = fail[state];
      state = gotoTable[state][c] ?? 0;

      const matched = output[state];

      steps.push({
        stepNumber: steps.length + 1,
        description: matched.length > 0
          ? `i=${i} '${c}': state=${state}. Found: ${matched.join(", ")}!`
          : `i=${i} '${c}': state=${state}. No match.`,
        highlightLines: matched.length > 0 ? [35, 36, 37] : [32, 33, 34],
        visualState: {
          type: "textmatch",
          text,
          pattern: patterns.join("|"),
          textHighlight: [i],
          patternHighlight: [],
          matchIndices: [...matchIndices],
          mismatchIndex: -1,
          offset: i,
          label: `state=${state}${matched.length ? " MATCH: " + matched.join(",") : ""}`,
        },
        variables: { i, char: c, state, matched },
      });

      for (const p of matched) {
        const pos = i - p.length + 1;
        results.push({ pos, pattern: p });
        matchIndices.push(pos);
      }
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `Aho-Corasick complete. Found ${results.length} matches: ${results.map((r) => `"${r.pattern}"@${r.pos}`).join(", ")}.`,
      highlightLines: [38],
      visualState: {
        type: "textmatch",
        text,
        pattern: patterns.join("|"),
        textHighlight: matchIndices,
        patternHighlight: [],
        matchIndices,
        mismatchIndex: -1,
        offset: 0,
        label: `${results.length} matches found`,
      },
      variables: { results },
    });

    return steps;
  },
};
