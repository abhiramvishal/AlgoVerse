import type { AnimationStep, VisualizationModule } from "@/types/visualization";

// Helper: build array1d step
function arr(stepNumber: number, description: string, lines: number[], cells: Array<{ val: unknown; state: "default" | "active" | "computed" | "highlighted" | "min" }>, label: string, vars: Record<string, unknown>): AnimationStep {
  return { stepNumber, description, highlightLines: lines, visualState: { type: "array1d", cells, label }, variables: vars };
}

// ── DFA Lexer ─────────────────────────────────────────────────────────────────
export const dfaLexerModule: VisualizationModule<null> = {
  id: "compiler-dfa-lexer", slug: "dfa-lexer", title: "DFA Lexer",
  category: ["compiler", "lexing"], difficulty: "intermediate",
  timeComplexity: "O(n)", spaceComplexity: "O(states)",
  description: "DFA-based lexer: scan source character by character, transition states, emit tokens when accepting states reached.",
  pythonCode: `# DFA Lexer — tokenize simple expressions

tokens = []
state = "START"
buffer = ""
input_str = "x = 42 + y"

transitions = {
    "START":   {letter: "ID", digit: "NUM", "=": "OP", "+": "OP", " ": "START"},
    "ID":      {letter: "ID", digit: "ID", other: "EMIT_ID"},
    "NUM":     {digit: "NUM", other: "EMIT_NUM"},
    "OP":      {other: "EMIT_OP"},
}

for ch in input_str + " ":
    cat = categorize(ch)   # letter | digit | operator | space
    next_state = transitions[state].get(cat, transitions[state].get("other"))
    if next_state.startswith("EMIT"):
        tokens.append((next_state[5:], buffer))
        buffer = ""
        state = transitions["START"].get(cat, "START")
    else:
        state = next_state
        if ch != " ": buffer += ch

print(tokens)  # [('ID','x'),('OP','='),('NUM','42'),('OP','+'),('ID','y')]`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const input = "x = 42 + y";
    const tokens: Array<[string, string]> = [["ID", "x"], ["OP", "="], ["NUM", "42"], ["OP", "+"], ["ID", "y"]];

    steps.push(arr(1, `DFA Lexer: scan "${input}" character by character. Transition states; emit token on accepting state.`, [1, 2, 3], [{ val: input, state: "default" }], "Input", { input }));

    let pos = 0;
    for (const [type, val] of tokens) {
      const newPos = pos + val.length;
      steps.push(arr(steps.length + 1,
        `Scan "${val}" → token type=${type}. DFA transitions: ${[...val].map((c) => `'${c}'`).join("→")}.`,
        [14, 15, 16, 17, 18, 19],
        input.split("").map((c, i) => ({
          val: c,
          state: i >= pos && i < newPos ? "active" as const : i < pos ? "computed" as const : "default" as const,
        })),
        `Scanning: "${val}" → ${type}`,
        { token: type, value: val, position: pos }));
      pos = newPos + (type === "OP" ? 2 : type === "NUM" ? 1 : 1);
    }

    steps.push(arr(steps.length + 1, `Tokenization complete: ${tokens.length} tokens.`, [22],
      tokens.map(([t, v]) => ({ val: `${t}:${v}`, state: "computed" as const })),
      "Token stream",
      { tokens: tokens.map(([t, v]) => `${t}(${v})`).join(", ") }));

    return steps;
  },
};

// ── NFA to DFA ────────────────────────────────────────────────────────────────
export const nfaToDfaModule: VisualizationModule<null> = {
  id: "compiler-nfa-to-dfa", slug: "nfa-to-dfa", title: "NFA to DFA (Subset Construction)",
  category: ["compiler", "lexing"], difficulty: "advanced",
  timeComplexity: "O(2^n) states", spaceComplexity: "O(2^n)",
  description: "Subset construction: convert NFA to equivalent DFA. Each DFA state = set of NFA states reachable from ε-closures.",
  pythonCode: `# NFA to DFA — Subset Construction

# NFA: states {0,1,2,3}, alphabet {a,b}
# 0 --a--> 1,2   (nondeterministic!)
# 1 --b--> 3
# 2 --a--> 3
# 3 = accepting

def epsilon_closure(states, nfa):
    closure = set(states)
    stack = list(states)
    while stack:
        s = stack.pop()
        for t in nfa.epsilon_transitions(s):
            if t not in closure:
                closure.add(t); stack.append(t)
    return frozenset(closure)

def nfa_to_dfa(nfa):
    start = epsilon_closure({nfa.start}, nfa)
    dfa_states = {start}
    worklist = [start]
    dfa_transitions = {}

    while worklist:
        curr = worklist.pop()
        for symbol in nfa.alphabet:
            # move: all NFA states reachable on symbol from curr
            next_nfa = set()
            for s in curr:
                next_nfa |= nfa.transitions.get((s, symbol), set())
            next_dfa = epsilon_closure(next_nfa, nfa)
            dfa_transitions[(curr, symbol)] = next_dfa
            if next_dfa not in dfa_states:
                dfa_states.add(next_dfa); worklist.append(next_dfa)
    return dfa_states, dfa_transitions`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const subsets = [
      { dfa: "{0}", on_a: "{1,2}", on_b: "∅", accepting: false },
      { dfa: "{1,2}", on_a: "{3}", on_b: "{3}", accepting: false },
      { dfa: "{3}", on_a: "∅", on_b: "∅", accepting: true },
      { dfa: "∅", on_a: "∅", on_b: "∅", accepting: false },
    ];

    steps.push(arr(1, "NFA to DFA (Subset Construction): each DFA state = subset of NFA states. Start with ε-closure of NFA start state.", [16, 17, 18],
      [{ val: "Start: {0}", state: "active" }],
      "DFA states under construction",
      { nfaStates: 4, alphabet: "a,b" }));

    for (const s of subsets) {
      steps.push(arr(steps.length + 1,
        `DFA state ${s.dfa}: on 'a' → ${s.on_a}, on 'b' → ${s.on_b}. ${s.accepting ? "ACCEPTING state." : ""}`,
        [24, 25, 26, 27, 28, 29],
        subsets.map((ss) => ({
          val: `${ss.dfa}${ss.accepting ? "★" : ""}`,
          state: ss.dfa === s.dfa ? "active" as const : "computed" as const,
        })),
        "DFA state mapping",
        { dfaState: s.dfa, onA: s.on_a, onB: s.on_b, accepting: s.accepting }));
    }

    steps.push(arr(steps.length + 1, "DFA complete. 4 DFA states from 4-state NFA. Worst case: 2^n DFA states for n NFA states.", [30],
      subsets.map((s) => ({ val: `${s.dfa}${s.accepting ? "★" : ""}`, state: s.accepting ? "highlighted" as const : "computed" as const })),
      "Final DFA",
      { dfaStates: 4, worstCase: "2^n = 16 for n=4" }));

    return steps;
  },
};

// ── Regex to NFA ──────────────────────────────────────────────────────────────
export const regexToNfaModule: VisualizationModule<null> = {
  id: "compiler-regex-to-nfa", slug: "regex-to-nfa", title: "Regex to NFA (Thompson's)",
  category: ["compiler", "lexing"], difficulty: "advanced",
  timeComplexity: "O(n)", spaceComplexity: "O(n)",
  description: "Thompson's construction: build NFA from regex using ε-transitions for alternation, concatenation, and Kleene star.",
  pythonCode: `# Thompson's Construction: regex → NFA

# Base: single character 'a'
# (q0) --a--> (q1*)

# Concatenation: A·B
# NFA_A, then ε from A_accept to B_start, then NFA_B

# Alternation: A|B
# New start with ε to A_start and B_start
# A_accept and B_accept → ε → new accept

# Kleene Star: A*
# New start (also accept) with ε to A_start
# A_accept → ε → new accept (also back to A_start)

def thompson(regex):
    if len(regex) == 1:
        return simple_nfa(regex)
    if '|' in regex:
        a, b = split_alternation(regex)
        return alternate(thompson(a), thompson(b))
    if regex.endswith('*'):
        return kleene_star(thompson(regex[:-1]))
    # Concatenation
    a, b = split_concat(regex)
    return concatenate(thompson(a), thompson(b))`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const constructs = [
      { name: "Char 'a'", nfa: "(q0)--a-->(q1★)", desc: "Base case: two states, one transition." },
      { name: "Concat 'ab'", nfa: "(q0)--a-->(q1)--ε-->(q2)--b-->(q3★)", desc: "Concatenation: ε-link accept of A to start of B." },
      { name: "Alter 'a|b'", nfa: "(qs)--ε-->(A),(qs)--ε-->(B),(A/B)--ε-->(qa★)", desc: "Alternation: new start with ε to both; both to new accept." },
      { name: "Star 'a*'", nfa: "(qs★)--ε-->(A)--ε-->(qa★)--ε-->(qs)", desc: "Kleene star: new start (accept), loop back after match." },
    ];

    steps.push(arr(1, "Thompson's Construction: build NFA fragment for each regex operator. Compose fragments for complex regex.", [1, 2],
      constructs.map((c) => ({ val: c.name, state: "default" as const })),
      "Regex constructs",
      { regex: "Thompson 1968", complexity: "O(n) states" }));

    for (const c of constructs) {
      steps.push(arr(steps.length + 1, `${c.name}: ${c.desc} NFA: ${c.nfa}`, [17, 18, 19, 20, 21, 22, 23],
        [{ val: c.name, state: "active" }, { val: c.nfa, state: "computed" }],
        c.name,
        { construct: c.name, nfa: c.nfa }));
    }

    return steps;
  },
};

// ── Tokenization ──────────────────────────────────────────────────────────────
export const tokenizationModule: VisualizationModule<null> = {
  id: "compiler-tokenization", slug: "tokenization", title: "Tokenization",
  category: ["compiler", "lexing"], difficulty: "beginner",
  timeComplexity: "O(n)", spaceComplexity: "O(tokens)",
  description: "First phase of compilation: convert raw source text into a stream of typed tokens. Whitespace and comments removed.",
  pythonCode: `# Tokenization — Lexical Analysis

import re

TOKEN_PATTERNS = [
    ("NUMBER",   r'\d+(\.\d*)?'),
    ("ID",       r'[a-zA-Z_][a-zA-Z0-9_]*'),
    ("ASSIGN",   r'='),
    ("PLUS",     r'\+'),
    ("MINUS",    r'-'),
    ("MUL",      r'\*'),
    ("LPAREN",   r'\('),
    ("RPAREN",   r'\)'),
    ("SKIP",     r'[ \t]+'),  # skip whitespace
    ("NEWLINE",  r'\n'),
    ("MISMATCH", r'.'),       # any other char → error
]

def tokenize(code):
    tokens = []
    for mo in re.finditer('|'.join(f'(?P<{n}>{p})' for n,p in TOKEN_PATTERNS), code):
        kind = mo.lastgroup
        value = mo.group()
        if kind == "NUMBER": tokens.append(Token(kind, float(value)))
        elif kind == "ID":   tokens.append(Token(kind, value))
        elif kind == "SKIP" or kind == "NEWLINE": continue
        elif kind == "MISMATCH": raise SyntaxError(value)
        else: tokens.append(Token(kind, value))
    return tokens`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const source = "x = 3 + y * 2";
    const tokens = [
      { type: "ID", val: "x" }, { type: "ASSIGN", val: "=" }, { type: "NUMBER", val: "3" },
      { type: "PLUS", val: "+" }, { type: "ID", val: "y" }, { type: "MUL", val: "*" }, { type: "NUMBER", val: "2" },
    ];

    steps.push(arr(1, `Tokenize: "${source}". Match regex patterns left-to-right. Whitespace skipped.`, [4, 5, 6, 7, 8, 9],
      [{ val: source, state: "default" }],
      "Source code",
      { source }));

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      steps.push(arr(steps.length + 1, `Token ${i + 1}: type=${t.type}, value="${t.val}". Pattern matched: ${t.type === "ID" ? "[a-zA-Z_]+" : t.type === "NUMBER" ? "\\d+" : `'${t.val}'`}`,
        [17, 18, 19, 20, 21, 22, 23],
        tokens.map((tk, j) => ({ val: `${tk.type}:${tk.val}`, state: j === i ? "active" as const : j < i ? "computed" as const : "default" as const })),
        "Token stream",
        { token: t.type, value: t.val, position: i + 1 }));
    }

    return steps;
  },
};

// ── Recursive Descent Parser ──────────────────────────────────────────────────
export const recursiveDescentModule: VisualizationModule<null> = {
  id: "compiler-recursive-descent", slug: "recursive-descent", title: "Recursive Descent Parser",
  category: ["compiler", "parsing"], difficulty: "intermediate",
  timeComplexity: "O(n)", spaceComplexity: "O(n) call stack",
  description: "Top-down parser: one function per grammar rule. Recursively calls itself for sub-expressions. Simple but limited to LL(k) grammars.",
  pythonCode: `# Recursive Descent Parser
# Grammar: expr = term (('+' | '-') term)*
#          term = factor (('*' | '/') factor)*
#          factor = NUMBER | '(' expr ')'

tokens = []
pos = 0

def parse_expr():
    result = parse_term()
    while peek() in ('+', '-'):
        op = consume()
        right = parse_term()
        result = BinOp(op, result, right)
    return result

def parse_term():
    result = parse_factor()
    while peek() in ('*', '/'):
        op = consume()
        right = parse_factor()
        result = BinOp(op, result, right)
    return result

def parse_factor():
    if peek() == '(':
        consume('(')
        result = parse_expr()
        consume(')')
        return result
    return Number(consume())   # expect NUMBER

# Parse "3 + 4 * 2"
# expr → term + term
#   term → 3
#   term → factor * factor → 4 * 2`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const tokens2 = ["3", "+", "4", "*", "2"];
    const calls = [
      { fn: "parse_expr", desc: "Start parsing expression '3 + 4 * 2'." },
      { fn: "parse_term", desc: "parse_term(): parse left term of +." },
      { fn: "parse_factor", desc: "parse_factor(): consume '3' → Number(3)." },
      { fn: "back to parse_term", desc: "No * or /. Return 3." },
      { fn: "back to parse_expr", desc: "See '+'. Consume, parse right term." },
      { fn: "parse_term", desc: "parse_term(): parse '4 * 2'." },
      { fn: "parse_factor", desc: "parse_factor(): consume '4' → Number(4)." },
      { fn: "parse_factor for 2", desc: "See '*'. Consume, parse_factor: Number(2)." },
      { fn: "back to parse_term", desc: "Return BinOp(*, 4, 2)." },
      { fn: "back to parse_expr", desc: "Return BinOp(+, 3, BinOp(*, 4, 2)). Parse tree done!" },
    ];

    steps.push(arr(1, "Recursive Descent: one function per grammar rule. Mutual recursion builds parse tree top-down.", [1, 2, 3, 4],
      tokens2.map((t) => ({ val: t, state: "default" as const })),
      "Input tokens",
      { grammar: "expr→term((+|-)term)*, term→factor((*|/)factor)*" }));

    const callStack: string[] = [];
    for (const c of calls) {
      if (c.fn.startsWith("parse_")) callStack.push(c.fn);
      else if (c.fn.startsWith("back")) callStack.pop();
      steps.push(arr(steps.length + 1, `${c.fn}: ${c.desc}`,
        [9, 10, 11, 12, 13],
        [
          { val: `Stack:[${callStack.join("→")}]`, state: "default" as const },
          { val: c.fn, state: "active" as const },
        ],
        "Call stack",
        { function: c.fn, stackDepth: callStack.length }));
    }

    return steps;
  },
};

// ── LL(1) Parser ──────────────────────────────────────────────────────────────
export const ll1ParserModule: VisualizationModule<null> = {
  id: "compiler-ll1-parser", slug: "ll1-parser", title: "LL(1) Parser",
  category: ["compiler", "parsing"], difficulty: "advanced",
  timeComplexity: "O(n)", spaceComplexity: "O(n)",
  description: "Table-driven top-down parser. 1 lookahead token selects production. Requires LL(1) grammar (no left recursion, no ambiguity).",
  pythonCode: `# LL(1) Parser — Table-Driven

# Grammar (LL(1)-transformed):
# E  → T E'
# E' → + T E' | ε
# T  → F T'
# T' → * F T' | ε
# F  → ( E ) | id | num

# Parse Table M[A, a] = production to use
parse_table = {
    ("E",  "id"):  "E → T E'",
    ("E",  "num"): "E → T E'",
    ("E'", "+"):   "E' → + T E'",
    ("E'", ")"):   "E' → ε",
    ("E'", "$"):   "E' → ε",
    ("T",  "id"):  "T → F T'",
    ("T",  "num"): "T → F T'",
    ("T'", "*"):   "T' → * F T'",
    ("T'", "+"):   "T' → ε",
    ("T'", "$"):   "T' → ε",
    ("F",  "id"):  "F → id",
    ("F",  "num"): "F → num",
    ("F",  "("):   "F → ( E )",
}

def ll1_parse(tokens):
    stack = ["$", "E"]   # $ = end marker
    tokens.append("$")
    while stack[-1] != "$":
        top = stack[-1]
        lookahead = tokens[0]
        if top == lookahead:      # terminal match
            stack.pop(); tokens.pop(0)
        else:                     # non-terminal: look up table
            prod = parse_table[(top, lookahead)]
            stack.pop()
            stack.extend(reversed(prod.split("→")[1].split()))`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const parserSteps = [
      { stack: ["$", "E"], input: ["id", "+", "id", "$"], action: "Table lookup M[E,id] = E→T E'" },
      { stack: ["$", "E'", "T"], input: ["id", "+", "id", "$"], action: "Table lookup M[T,id] = T→F T'" },
      { stack: ["$", "E'", "T'", "F"], input: ["id", "+", "id", "$"], action: "Table lookup M[F,id] = F→id" },
      { stack: ["$", "E'", "T'", "id"], input: ["id", "+", "id", "$"], action: "Match: pop id from stack and input" },
      { stack: ["$", "E'", "T'"], input: ["+", "id", "$"], action: "Table lookup M[T',+] = T'→ε" },
      { stack: ["$", "E'"], input: ["+", "id", "$"], action: "Table lookup M[E',+] = E'→+TE'" },
      { stack: ["$", "E'", "T", "+"], input: ["+", "id", "$"], action: "Match: pop + from stack and input" },
      { stack: ["$", "E'", "T"], input: ["id", "$"], action: "Table lookup M[T,id] = T→FT'" },
      { stack: ["$", "E'", "T'", "F"], input: ["id", "$"], action: "Match id, T'→ε, E'→ε. ACCEPT." },
    ];

    steps.push(arr(1, "LL(1) Parser: table-driven. Stack + 1 lookahead token determines production. Remove left recursion for LL(1) grammar.", [12, 13, 14, 15],
      [{ val: "Grammar: E→TE', E'→+TE'|ε, T→FT'", state: "default" }],
      "LL(1) Grammar",
      { grammar: "LL(1): no left recursion, 1 lookahead" }));

    for (const s of parserSteps) {
      steps.push(arr(steps.length + 1, s.action,
        [23, 24, 25, 26, 27, 28],
        [
          { val: `Stack:[${s.stack.join(",")}]`, state: "default" as const },
          { val: `Input:[${s.input.join(",")}]`, state: "active" as const },
        ],
        s.action,
        { stack: s.stack.join(","), lookahead: s.input[0] }));
    }

    return steps;
  },
};

// ── LR(0) Parser ──────────────────────────────────────────────────────────────
export const lr0ParserModule: VisualizationModule<null> = {
  id: "compiler-lr0-parser", slug: "lr0-parser", title: "LR(0) Parser",
  category: ["compiler", "parsing"], difficulty: "advanced",
  timeComplexity: "O(n)", spaceComplexity: "O(n)",
  description: "Bottom-up shift-reduce parser. LR(0) items track parsing progress. Shift tokens onto stack; reduce when right-hand side complete.",
  pythonCode: `# LR(0) Parser — Shift-Reduce

# Grammar: S' → E, E → E + T | T, T → id

# LR(0) items: rules with a dot showing progress
# State 0: S' → · E, E → · E + T, E → · T, T → · id
# After reading 'id': T → id ·  (can REDUCE T → id)
# After reducing to T: E → T ·  (can REDUCE E → T)
# etc.

# Parsing table (action + goto)
action = {
    (0, "id"): "shift 3",
    (1, "+"):  "shift 4",
    (1, "$"):  "accept",
    (2, "+"):  "reduce E → T",
    (2, "$"):  "reduce E → T",
    (3, "+"):  "reduce T → id",
    (3, "$"):  "reduce T → id",
    (4, "id"): "shift 3",
    (5, "+"):  "reduce E → E + T",
    (5, "$"):  "reduce E → E + T",
}

def lr0_parse(tokens):
    stack = [0]   # state stack
    tokens.append("$")
    while True:
        state = stack[-1]
        token = tokens[0]
        a = action[(state, token)]
        if a == "accept": return "OK"
        elif a.startswith("shift"):
            stack.append(int(a.split()[1]))
            tokens.pop(0)
        elif a.startswith("reduce"):
            # pop RHS symbols, push goto state
            rule = a[7:]  # "E → T"
            stack = stack[:-rhs_len(rule)]
            lhs = rule.split("→")[0].strip()
            stack.append(goto[stack[-1]][lhs])`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const parseTrace = [
      { stack: "[0]", input: "id + id $", action: "shift 3" },
      { stack: "[0,3]", input: "+ id $", action: "reduce T→id" },
      { stack: "[0,2]", input: "+ id $", action: "reduce E→T" },
      { stack: "[0,1]", input: "+ id $", action: "shift 4" },
      { stack: "[0,1,4]", input: "id $", action: "shift 3" },
      { stack: "[0,1,4,3]", input: "$", action: "reduce T→id" },
      { stack: "[0,1,4,5]", input: "$", action: "reduce E→E+T" },
      { stack: "[0,1]", input: "$", action: "ACCEPT!" },
    ];

    steps.push(arr(1, "LR(0) bottom-up parser: shift tokens onto stack, reduce when RHS complete. Handles more grammars than LL(1).", [1, 2, 3],
      [{ val: "Input: id + id $", state: "default" }],
      "LR(0) parse of 'id + id'",
      { grammar: "E→E+T|T, T→id" }));

    for (const t of parseTrace) {
      steps.push(arr(steps.length + 1, `Action: ${t.action}`,
        [24, 25, 26, 27, 28, 29, 30],
        [
          { val: `Stack:${t.stack}`, state: "default" as const },
          { val: `Input:${t.input}`, state: "active" as const },
          { val: `→${t.action}`, state: t.action === "ACCEPT!" ? "highlighted" as const : "computed" as const },
        ],
        "Shift-Reduce trace",
        { stack: t.stack, input: t.input, action: t.action }));
    }

    return steps;
  },
};

// ── LALR Parser ───────────────────────────────────────────────────────────────
export const lalrParserModule: VisualizationModule<null> = {
  id: "compiler-lalr-parser", slug: "lalr-parser", title: "LALR Parser",
  category: ["compiler", "parsing"], difficulty: "advanced",
  timeComplexity: "O(n)", spaceComplexity: "O(grammar size)",
  description: "LALR(1): merges LR(1) states with same core. Used by yacc/bison. More powerful than LR(0), less than full LR(1).",
  pythonCode: `# LALR(1) Parser — Look-Ahead LR

# LALR vs LR(1):
# LR(1) items: [A → α · β, a]  (a = lookahead token)
# LALR merges LR(1) states with same core (ignore lookahead)
# This reduces state count significantly

# Example grammar: S → aAd | bAd | aBe | bBe
#                  A → c, B → c
# LR(1): states for [A→c·, d] and [B→c·, e] are DIFFERENT
# LALR: merges them into [A→c· | B→c·, {d,e}] (may cause conflicts)

# LALR construction:
# 1. Build canonical LR(1) collection
# 2. Merge states with identical cores
# 3. Check for conflicts (shift-reduce or reduce-reduce)
# 4. Build action/goto table from merged states

# Used by: yacc, bison (C/C++), ANTLR, many compiler generators

# Conflicts resolution:
# shift-reduce: prefer shift (handles dangling else)
# reduce-reduce: grammar rewrite needed (ambiguity)`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const stages = [
      { stage: "LR(1) Items", desc: "Build LR(1) items: [A→α·β, lookahead]. Track position (dot) + 1 token of lookahead.", cells: ["[E→·E+T, $]", "[E→·T, $]", "[T→·id, $,+]"] },
      { stage: "State Machine", desc: "Build automaton: each state = set of LR(1) items. Transitions on grammar symbols.", cells: ["S0→(id)→S3", "S0→(E)→S1", "S3→(+)→reduce"] },
      { stage: "Merge States", desc: "LALR: merge states with identical core (same items ignoring lookahead). Reduces from LR(1) size.", cells: ["[A→c·,d] + [B→c·,e]", "→merged: [A→c·|B→c·,{d,e}]"] },
      { stage: "Build Table", desc: "Generate action/goto table. Check for conflicts. If none → grammar is LALR(1).", cells: ["action[s3,+]=reduce", "action[s1,$]=accept", "goto[s0,E]=s1"] },
    ];

    steps.push(arr(1, "LALR(1): most common parser for programming languages. Powers yacc, bison, many compiler generators.", [1, 2, 3, 4, 5],
      [{ val: "LR(1) → merge → LALR(1)", state: "default" }],
      "LALR construction overview",
      { power: "most grammars incl. C/C++", tools: "yacc, bison, ANTLR" }));

    for (const s of stages) {
      steps.push(arr(steps.length + 1, `${s.stage}: ${s.desc}`,
        [8, 9, 10, 11],
        s.cells.map((c) => ({ val: c, state: "computed" as const })),
        s.stage,
        { stage: s.stage }));
    }

    return steps;
  },
};

// ── Earley Parser ─────────────────────────────────────────────────────────────
export const earleyParserModule: VisualizationModule<null> = {
  id: "compiler-earley-parser", slug: "earley-parser", title: "Earley Parser",
  category: ["compiler", "parsing"], difficulty: "advanced",
  timeComplexity: "O(n³) general, O(n) for unambiguous", spaceComplexity: "O(n²)",
  description: "General parsing algorithm that works for ALL context-free grammars including ambiguous ones. Used for NLP and complex grammars.",
  pythonCode: `# Earley Parser — General CFG Parser

# Earley item: (rule, dot_position, start_index)
# S[k] = set of Earley items completed up to position k

def earley_parse(grammar, tokens):
    n = len(tokens)
    S = [set() for _ in range(n + 1)]
    # Initialize with start rule
    S[0].add(Item(grammar.start_rule, dot=0, start=0))

    for k in range(n + 1):
        changed = True
        while changed:
            changed = False
            for item in list(S[k]):
                if item.is_complete():
                    # Completer: find items waiting for this rule
                    for prev in S[item.start]:
                        if prev.next_symbol() == item.rule.lhs:
                            new_item = prev.advance()
                            if new_item not in S[k]:
                                S[k].add(new_item); changed = True
                elif item.next_symbol() in grammar.nonterminals:
                    # Predictor: add items for all productions of next symbol
                    for rule in grammar.rules[item.next_symbol()]:
                        S[k].add(Item(rule, dot=0, start=k))
                else:
                    # Scanner: shift terminal if matches next token
                    if k < n and tokens[k] == item.next_symbol():
                        S[k+1].add(item.advance())
    return any(item.is_complete() and item.rule.lhs == grammar.start
               and item.start == 0 for item in S[n])`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const earleyOps = [
      { op: "Init", desc: "S[0] = {(S'→·S, 0)}. Add start item with dot at beginning.", items: ["S[0]: {S'→·S,0}"] },
      { op: "Predictor", desc: "Next symbol is non-terminal S: add all S-productions to S[0].", items: ["S[0]: {S→·E,0, S→·id,0, E→·E+T,0}"] },
      { op: "Scanner", desc: "Scan 'id': advance items where next symbol = 'id'. Add to S[1].", items: ["S[1]: {S→id·,0, T→id·,0}"] },
      { op: "Completer", desc: "S→id· is complete: find items in S[0] waiting for S. Advance them.", items: ["S[1]: {S'→S·,0} → ACCEPT!"] },
    ];

    steps.push(arr(1, "Earley Parser: works for ALL context-free grammars. Three operations: Predictor, Scanner, Completer.", [1, 2, 3, 4, 5],
      [{ val: "Grammar: S→id|E, E→E+T|T, T→id", state: "default" }],
      "Earley parsing 'id'",
      { complexity: "O(n³) general, O(n) for unambiguous" }));

    for (const op of earleyOps) {
      steps.push(arr(steps.length + 1, `${op.op}: ${op.desc}`,
        [11, 14, 20, 24],
        op.items.map((item) => ({ val: item, state: op.op === "Completer" ? "highlighted" as const : "active" as const })),
        `Earley ${op.op}`,
        { operation: op.op }));
    }

    return steps;
  },
};

// ── Symbol Table ──────────────────────────────────────────────────────────────
export const symbolTableModule: VisualizationModule<null> = {
  id: "compiler-symbol-table", slug: "symbol-table", title: "Symbol Table",
  category: ["compiler", "semantic-analysis"], difficulty: "intermediate",
  timeComplexity: "O(1) lookup (hash)", spaceComplexity: "O(symbols)",
  description: "Compiler's dictionary: maps identifiers to their type, scope, and memory location. Scoped symbol tables handle nested scopes.",
  pythonCode: `# Symbol Table — Scoped

class Symbol:
    def __init__(self, name, type, scope, offset=None):
        self.name = name; self.type = type
        self.scope = scope; self.offset = offset

class SymbolTable:
    def __init__(self, parent=None):
        self.table = {}
        self.parent = parent   # for scope chain

    def define(self, name, sym_type):
        self.table[name] = Symbol(name, sym_type, self)

    def lookup(self, name):    # O(depth) scope chain
        if name in self.table:
            return self.table[name]
        if self.parent:
            return self.parent.lookup(name)
        raise NameError(f"Undefined: {name}")

    def enter_scope(self):     # function/block → new scope
        return SymbolTable(parent=self)

# Example:
global_scope = SymbolTable()
global_scope.define("x", "int")
func_scope = global_scope.enter_scope()
func_scope.define("y", "float")
# lookup("x") in func_scope → finds in parent (global)`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const events = [
      { op: "define x=int", scope: "global", desc: "Define 'x: int' in global scope." },
      { op: "define main()", scope: "global", desc: "Define function 'main: () → void' in global scope." },
      { op: "enter main scope", scope: "main", desc: "Enter function scope. New symbol table with parent=global." },
      { op: "define a=int", scope: "main", desc: "Define 'a: int' in main scope." },
      { op: "lookup x", scope: "main", desc: "Lookup 'x': not in main scope → search parent (global) → found x=int." },
      { op: "exit main scope", scope: "global", desc: "Exit main scope. Local symbols (a) are freed." },
    ];

    steps.push(arr(1, "Symbol Table: maps identifier → type/scope/offset. Scoped: inner scope can shadow outer. Chain walk for lookup.", [7, 8, 9, 10],
      [{ val: "global:{}", state: "default" }],
      "Symbol tables (nested scopes)",
      { structure: "hash map per scope + parent pointer" }));

    const globalSyms: string[] = [];
    const mainSyms: string[] = [];
    let inMain = false;
    for (const ev of events) {
      if (ev.op.startsWith("define") && !inMain) globalSyms.push(ev.op.replace("define ", ""));
      if (ev.op === "enter main scope") inMain = true;
      if (ev.op.startsWith("define") && inMain) mainSyms.push(ev.op.replace("define ", ""));
      if (ev.op === "exit main scope") inMain = false;
      steps.push(arr(steps.length + 1, ev.desc,
        [11, 12, 17, 18, 19, 20, 21],
        [
          { val: `global:{${globalSyms.join(",")}}`, state: "default" as const },
          { val: inMain ? `main:{${mainSyms.join(",")}}` : "(no local scope)", state: inMain ? "active" as const : "default" as const },
        ],
        `Scope: ${ev.scope}`,
        { operation: ev.op, scope: ev.scope }));
    }

    return steps;
  },
};

// ── Type Checking ─────────────────────────────────────────────────────────────
export const typeCheckingModule: VisualizationModule<null> = {
  id: "compiler-type-checking", slug: "type-checking", title: "Type Checking",
  category: ["compiler", "semantic-analysis"], difficulty: "intermediate",
  timeComplexity: "O(n)", spaceComplexity: "O(n)",
  description: "Semantic analysis: verify operand types match operators. Type inference, coercion, and error reporting.",
  pythonCode: `# Type Checking — Static Analysis

class TypeChecker:
    def check(self, node):
        if isinstance(node, Number):
            return "int" if isinstance(node.val, int) else "float"

        if isinstance(node, Identifier):
            return symbol_table.lookup(node.name).type

        if isinstance(node, BinOp):
            left_type = self.check(node.left)
            right_type = self.check(node.right)

            if node.op in ('+', '-', '*', '/'):
                if left_type == right_type:
                    return left_type
                if {left_type, right_type} == {"int", "float"}:
                    return "float"  # implicit coercion
                raise TypeError(f"Cannot apply {node.op} to {left_type}, {right_type}")

            if node.op in ('<', '>', '==', '!='):
                if left_type != right_type:
                    raise TypeError("Comparison type mismatch")
                return "bool"

        if isinstance(node, Assignment):
            val_type = self.check(node.value)
            var_type = symbol_table.lookup(node.name).type
            if val_type != var_type:
                raise TypeError(f"Cannot assign {val_type} to {var_type}")`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const checks = [
      { expr: "3 + 4", types: ["int", "int"], result: "int", op: "+", ok: true },
      { expr: "3.0 + 4", types: ["float", "int"], result: "float", op: "+", ok: true, coerce: "int→float" },
      { expr: "3 + true", types: ["int", "bool"], result: "TypeError", op: "+", ok: false },
      { expr: "x < 10", types: ["int", "int"], result: "bool", op: "<", ok: true },
    ];

    steps.push(arr(1, "Type Checker: walks AST, infers types bottom-up. Checks operators are applied to compatible types.", [3, 4, 5, 6],
      [{ val: "AST traversal", state: "default" }],
      "Type checking",
      { approach: "bottom-up AST traversal" }));

    for (const c of checks) {
      steps.push(arr(steps.length + 1,
        `Check "${c.expr}": left=${c.types[0]}, right=${c.types[1]}, op=${c.op}. ${c.ok ? `Result=${c.result}${c.coerce ? ` (coerce: ${c.coerce})` : ""}` : `TypeError: cannot apply ${c.op} to ${c.types.join(",")}`}`,
        [9, 10, 11, 12, 13, 14],
        [
          { val: c.expr, state: "default" as const },
          { val: `${c.types[0]} ${c.op} ${c.types[1]}`, state: "active" as const },
          { val: `→ ${c.result}`, state: c.ok ? "computed" as const : "highlighted" as const },
        ],
        c.ok ? "Type OK" : "TYPE ERROR",
        { expression: c.expr, leftType: c.types[0], rightType: c.types[1], result: c.result }));
    }

    return steps;
  },
};

// ── AST Generation ────────────────────────────────────────────────────────────
export const astGenModule: VisualizationModule<null> = {
  id: "compiler-ast-gen", slug: "ast-gen", title: "AST Generation",
  category: ["compiler", "semantic-analysis"], difficulty: "intermediate",
  timeComplexity: "O(n)", spaceComplexity: "O(n)",
  description: "Abstract Syntax Tree: structured representation of source code after parsing. Removes syntactic sugar, keeps semantic structure.",
  pythonCode: `# AST Generation

from dataclasses import dataclass
from typing import List, Optional, Union

@dataclass
class NumberLiteral:
    value: float

@dataclass
class Identifier:
    name: str

@dataclass
class BinaryOp:
    op: str                   # '+', '-', '*', '/'
    left: 'Expr'
    right: 'Expr'

@dataclass
class Assignment:
    name: str
    value: 'Expr'

Expr = Union[NumberLiteral, Identifier, BinaryOp]

# Source: "x = 3 + y * 2"
# Parse tree (concrete) vs AST (abstract):
# AST removes: parentheses, semicolons, whitespace tokens
# AST keeps:   operator precedence in structure

ast = Assignment(
    name = "x",
    value = BinaryOp("+",
        NumberLiteral(3),
        BinaryOp("*", Identifier("y"), NumberLiteral(2))
    )
)`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];

    steps.push(arr(1, "AST: structured tree representing code semantics. Concrete parse tree includes all tokens; AST removes syntactic noise.", [25, 26, 27],
      [{ val: "Source: x = 3 + y * 2", state: "default" }],
      "Source → AST",
      { source: "x = 3 + y * 2" }));

    const nodes = [
      { id: 0, label: "Assignment(=)", x: 250, y: 30, left: 1, right: 2 },
      { id: 1, label: "ID(x)", x: 140, y: 110 },
      { id: 2, label: "BinOp(+)", x: 360, y: 110, left: 3, right: 4 },
      { id: 3, label: "Num(3)", x: 270, y: 190 },
      { id: 4, label: "BinOp(*)", x: 450, y: 190, left: 5, right: 6 },
      { id: 5, label: "ID(y)", x: 380, y: 270 },
      { id: 6, label: "Num(2)", x: 520, y: 270 },
    ];

    steps.push({
      stepNumber: 2,
      description: "AST structure: Assignment root → left=ID(x), right=BinOp(+). BinOp(+) → left=3, right=BinOp(*) → y,2. Operator precedence encoded in tree.",
      highlightLines: [26, 27, 28, 29, 30, 31, 32, 33],
      visualState: { type: "tree", nodes, highlighted: [0], comparing: [], inserted: [0, 1, 2, 3, 4, 5, 6], found: [] },
      variables: { root: "Assignment", depth: 4, nodes: 7 },
    });

    steps.push({
      stepNumber: 3,
      description: "Evaluate AST: post-order traversal. Leaves first: 3, y, 2. Then BinOp(*): y×2. Then BinOp(+): 3+(y×2). Then Assignment: x=result.",
      highlightLines: [20, 21, 22],
      visualState: {
        type: "tree", nodes,
        highlighted: [3, 5, 6, 4, 2, 1, 0],
        comparing: [],
        inserted: [0, 1, 2, 3, 4, 5, 6],
        found: [3, 5, 6, 4, 2],
      },
      variables: { traversal: "post-order", evalOrder: "leaves→parents" },
    });

    return steps;
  },
};

// ── Three-Address Code ────────────────────────────────────────────────────────
export const threeAddressCodeModule: VisualizationModule<null> = {
  id: "compiler-three-address-code", slug: "three-address-code", title: "Three-Address Code",
  category: ["compiler", "code-generation"], difficulty: "intermediate",
  timeComplexity: "O(n)", spaceComplexity: "O(n)",
  description: "Intermediate representation: each instruction has at most 3 addresses (result = op1 operator op2). Easy to optimize and translate.",
  pythonCode: `# Three-Address Code (TAC) — Intermediate Representation

# Source: x = a + b * c - d
# TAC: break into simple binary operations + temporaries

# Generate TAC for x = a + b * c - d
t1 = b * c          # t1 = b * c
t2 = a + t1         # t2 = a + t1
t3 = t2 - d         # t3 = t2 - d
x  = t3             # x = t3

# Forms of TAC instructions:
# Assignment:   x = y op z
# Copy:         x = y
# Unconditional jump: goto L
# Conditional:  if x relop y goto L
# Param:        param x
# Call:         call f, n
# Return:       return x

# Array access:  x = y[i]  or  y[i] = x
# Pointer:       x = &y, x = *y, *y = x

# SSA form (Static Single Assignment) — each variable assigned once
# x = a + b*c - d
# t1_0 = b * c
# t2_0 = a + t1_0
# x_0  = t2_0 - d`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const expr = "x = a + b * c - d";
    const tac = [
      { line: 1, code: "t1 = b * c", desc: "Compute b*c (highest precedence) → temp t1." },
      { line: 2, code: "t2 = a + t1", desc: "Compute a + t1 → temp t2." },
      { line: 3, code: "t3 = t2 - d", desc: "Compute t2 - d → temp t3." },
      { line: 4, code: "x = t3", desc: "Assign final result to x." },
    ];

    steps.push(arr(1, `TAC generation for "${expr}". Break complex expression into simple a=b op c instructions using temporaries.`, [4, 5, 6, 7, 8],
      [{ val: expr, state: "default" }],
      "Source expression",
      { source: expr }));

    for (const t of tac) {
      steps.push(arr(steps.length + 1, `Line ${t.line}: ${t.code} — ${t.desc}`,
        [6, 7, 8, 9],
        tac.map((tt, i) => ({
          val: tt.code,
          state: i + 1 === t.line ? "active" as const : i + 1 < t.line ? "computed" as const : "default" as const,
        })),
        "TAC Instructions",
        { line: t.line, instruction: t.code }));
    }

    steps.push(arr(steps.length + 1, "TAC ready for optimization (dead code, constant folding) and machine code generation.", [22, 23, 24, 25],
      [
        { val: "t1 = b*c", state: "computed" as const }, { val: "t2 = a+t1", state: "computed" as const },
        { val: "t3 = t2-d", state: "computed" as const }, { val: "x = t3", state: "computed" as const },
      ],
      "Complete TAC",
      { instructions: 4, temporaries: 3 }));

    return steps;
  },
};

// ── Register Allocation ───────────────────────────────────────────────────────
export const registerAllocationModule: VisualizationModule<null> = {
  id: "compiler-register-allocation", slug: "register-allocation", title: "Register Allocation",
  category: ["compiler", "code-generation"], difficulty: "advanced",
  timeComplexity: "O(n) with linear scan", spaceComplexity: "O(live ranges)",
  description: "Assign program variables to physical registers. Graph coloring: build interference graph, color with k colors = k registers.",
  pythonCode: `# Register Allocation — Graph Coloring

# Liveness Analysis: when is each variable live?
# Variable is live if its value might be used before overwritten

live_intervals = {
    "a": (0, 8),   # live from instruction 0 to 8
    "b": (1, 6),
    "c": (2, 5),
    "t1": (3, 7),
    "d": (4, 9),
}

# Build interference graph:
# Two variables interfere if their live ranges overlap
def build_interference(intervals):
    graph = defaultdict(set)
    vars = list(intervals.keys())
    for i, v1 in enumerate(vars):
        for v2 in vars[i+1:]:
            s1, e1 = intervals[v1]
            s2, e2 = intervals[v2]
            if s1 < e2 and s2 < e1:  # ranges overlap
                graph[v1].add(v2); graph[v2].add(v1)
    return graph

# Graph coloring with k registers:
# Greedy: assign lowest-numbered color not used by neighbors
# If can't color → spill to memory (load/store around use)

def allocate_registers(graph, k=3):
    colors = {}
    for var in graph:
        used = {colors[n] for n in graph[var] if n in colors}
        for c in range(k):
            if c not in used:
                colors[var] = c; break
        else:
            colors[var] = "SPILL"  # → spill to memory
    return colors`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const liveIntervals = [
      { var: "a", start: 0, end: 8 }, { var: "b", start: 1, end: 6 },
      { var: "c", start: 2, end: 5 }, { var: "t1", start: 3, end: 7 },
      { var: "d", start: 4, end: 9 },
    ];

    steps.push(arr(1, "Register Allocation: build interference graph from live ranges. Color graph with k colors = k registers. Spill if can't color.", [1, 2, 3],
      liveIntervals.map((li) => ({ val: `${li.var}:[${li.start}-${li.end}]`, state: "default" as const })),
      "Live intervals",
      { registers: 3, variables: liveIntervals.length }));

    // Build interference pairs
    const interferences: string[] = [];
    for (let i = 0; i < liveIntervals.length; i++) {
      for (let j = i + 1; j < liveIntervals.length; j++) {
        const a = liveIntervals[i], b = liveIntervals[j];
        if (a.start < b.end && b.start < a.end) {
          interferences.push(`${a.var}↔${b.var}`);
        }
      }
    }

    steps.push(arr(steps.length + 1,
      `Interference graph: ${interferences.length} edges where live ranges overlap.`,
      [14, 15, 16, 17, 18, 19, 20, 21],
      interferences.map((pair) => ({ val: pair, state: "active" as const })),
      "Interference graph edges",
      { edges: interferences.length }));

    // Greedy coloring
    const colors: Record<string, number | "SPILL"> = { a: 0, b: 1, c: 2, t1: "SPILL", d: 0 };
    steps.push(arr(steps.length + 1,
      "Graph coloring (greedy, k=3): a→R0, b→R1, c→R2. t1 interferes with all 3 colors → SPILL to memory.",
      [25, 26, 27, 28, 29, 30],
      Object.entries(colors).map(([v, c]) => ({
        val: `${v}→${c === "SPILL" ? "SPILL" : `R${c}`}`,
        state: c === "SPILL" ? "highlighted" as const : "computed" as const,
      })),
      "Register assignment",
      { R0: "a,d", R1: "b", R2: "c", spilled: "t1" }));

    return steps;
  },
};

// ── Constant Folding ──────────────────────────────────────────────────────────
export const constantFoldingModule: VisualizationModule<null> = {
  id: "compiler-constant-folding", slug: "constant-folding", title: "Constant Folding",
  category: ["compiler", "optimization"], difficulty: "intermediate",
  timeComplexity: "O(n) AST walk", spaceComplexity: "O(1)",
  description: "Compile-time evaluation of constant expressions. 2 + 3 → 5 before runtime. Part of compiler optimization passes.",
  pythonCode: `# Constant Folding — Compiler Optimization

def constant_fold(node):
    if isinstance(node, BinaryOp):
        left = constant_fold(node.left)
        right = constant_fold(node.right)

        # If both operands are constants, evaluate at compile time
        if isinstance(left, Constant) and isinstance(right, Constant):
            if node.op == '+': return Constant(left.val + right.val)
            if node.op == '-': return Constant(left.val - right.val)
            if node.op == '*': return Constant(left.val * right.val)
            if node.op == '/' and right.val != 0:
                return Constant(left.val / right.val)

    return BinaryOp(node.op, left, right)

# Examples:
# 2 + 3          → 5          (simple fold)
# 2 + 3 * 4      → 14         (fold sub-expression)
# x + 0          → x          (identity)
# x * 1          → x          (identity)
# x * 0          → 0          (zero property)
# if (true) ...  → remove if  (dead branch)

# Constant propagation: extends to variables with known values
# x = 5; y = x + 3  →  y = 8  (propagate x=5)`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const folds = [
      { before: "2 + 3", after: "5", desc: "Simple: evaluate 2+3=5 at compile time." },
      { before: "2 + 3 * 4", after: "14", desc: "Sub-expression: fold 3*4=12, then 2+12=14." },
      { before: "x + 0", after: "x", desc: "Identity: x+0=x. Eliminates add instruction." },
      { before: "x * 1", after: "x", desc: "Identity: x*1=x. Eliminates multiply instruction." },
      { before: "x * 0", after: "0", desc: "Zero: x*0=0 regardless of x. Replace with constant." },
      { before: "if(true){a}else{b}", after: "{a}", desc: "Dead branch: constant condition → remove else branch." },
    ];

    steps.push(arr(1, "Constant Folding: evaluate constant sub-expressions at compile time. Reduces runtime work. Part of compiler O1+ optimization.", [1, 2],
      [{ val: "AST optimization pass", state: "default" }],
      "Constant folding",
      { pass: "constant folding + propagation" }));

    for (const f of folds) {
      steps.push(arr(steps.length + 1, `Fold: "${f.before}" → "${f.after}". ${f.desc}`,
        [7, 8, 9, 10, 11, 12],
        [
          { val: f.before, state: "active" as const },
          { val: "→", state: "default" as const },
          { val: f.after, state: "computed" as const },
        ],
        f.desc,
        { before: f.before, after: f.after }));
    }

    return steps;
  },
};

// ── Dead Code Elimination ─────────────────────────────────────────────────────
export const deadCodeEliminationModule: VisualizationModule<null> = {
  id: "compiler-dead-code-elimination", slug: "dead-code-elimination", title: "Dead Code Elimination",
  category: ["compiler", "optimization"], difficulty: "intermediate",
  timeComplexity: "O(n) liveness analysis", spaceComplexity: "O(n)",
  description: "Remove code that cannot affect program output: unreachable code, computations whose results are never used.",
  pythonCode: `# Dead Code Elimination

# Type 1: Unreachable code (after return/goto)
def foo():
    return 42
    x = 10  # DEAD: never reached

# Type 2: Dead assignments (result never used)
def bar():
    x = 5    # DEAD if x not used after
    x = 10   # kills previous assignment
    return x

# Type 3: Dead branches (constant conditions)
if False:
    expensive_computation()  # DEAD: never executes

# Algorithm: liveness analysis
# Variable is LIVE if value may be read before next write
# A definition (assignment) is DEAD if variable is not live after it

def dead_code_elimination(cfg):
    # Backward dataflow analysis
    for block in reversed(cfg.blocks):
        for instr in reversed(block.instructions):
            if is_assignment(instr):
                if instr.target not in live_vars:
                    remove(instr)   # dead assignment
            update_liveness(instr)  # update live_vars set`,
  codeSteps: [],
  defaultInput: null,
  generateSteps() {
    const steps: AnimationStep[] = [];
    const instructions = [
      { line: 1, code: "t1 = a * b", live: true, reason: "t1 used later" },
      { line: 2, code: "t2 = c + d", live: false, reason: "t2 never read → DEAD" },
      { line: 3, code: "t3 = t1 + 1", live: true, reason: "t3 used in return" },
      { line: 4, code: "x = 99", live: false, reason: "x overwritten before use → DEAD" },
      { line: 5, code: "x = t3 * 2", live: true, reason: "x used in return" },
      { line: 6, code: "return x", live: true, reason: "return uses x" },
    ];

    steps.push(arr(1, "Dead Code Elimination: liveness analysis (backward). Mark instructions whose results are never used. Remove them.", [17, 18, 19, 20],
      instructions.map((i) => ({ val: i.code, state: "default" as const })),
      "Instructions (before DCE)",
      { analysis: "backward liveness" }));

    steps.push(arr(steps.length + 1, "Backward liveness analysis: start from outputs (return), mark which variables are live at each instruction.",
      [22, 23, 24, 25],
      [...instructions].reverse().map((i) => ({
        val: `${i.code} [${i.live ? "LIVE" : "DEAD"}]`,
        state: i.live ? "computed" as const : "highlighted" as const,
      })),
      "Liveness backward scan",
      { deadCount: instructions.filter((i) => !i.live).length }));

    const deadInstructions = instructions.filter((i) => !i.live);
    for (const dead of deadInstructions) {
      steps.push(arr(steps.length + 1, `Eliminate dead code: "${dead.code}" — ${dead.reason}`,
        [28, 29],
        instructions
          .filter((i) => i.line !== dead.line)
          .map((i) => ({ val: i.code, state: i.live ? "computed" as const : "highlighted" as const })),
        "After elimination",
        { removed: dead.code, reason: dead.reason }));
    }

    steps.push(arr(steps.length + 1, `DCE complete: removed ${deadInstructions.length} dead instructions. Smaller, faster code.`,
      [],
      instructions.filter((i) => i.live).map((i) => ({ val: i.code, state: "computed" as const })),
      "Optimized code",
      { originalSize: instructions.length, optimizedSize: instructions.filter((i) => i.live).length }));

    return steps;
  },
};
