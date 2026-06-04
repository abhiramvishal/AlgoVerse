import { createPlaceholderModule } from "@/visualizations/placeholder";

// Lexical Analysis
export const dfaLexerModule = createPlaceholderModule(
  "dfa-lexer", "dfa-lexer", "DFA-based Lexer",
  ["compiler", "lexical-analysis"], "intermediate",
);
export const nfaToDfaModule = createPlaceholderModule(
  "nfa-to-dfa", "nfa-to-dfa", "NFA to DFA Conversion",
  ["compiler", "lexical-analysis"], "intermediate",
);
export const regexToNfaModule = createPlaceholderModule(
  "regex-to-nfa", "regex-to-nfa", "Regex to NFA",
  ["compiler", "lexical-analysis"], "intermediate",
);
export const tokenizationModule = createPlaceholderModule(
  "tokenization", "tokenization", "Tokenization",
  ["compiler", "lexical-analysis"], "beginner",
);

// Parsing
export const recursiveDescentModule = createPlaceholderModule(
  "recursive-descent", "recursive-descent", "Recursive Descent Parser",
  ["compiler", "parsing"], "intermediate",
);
export const ll1ParserModule = createPlaceholderModule(
  "ll1-parser", "ll1-parser", "LL(1) Parser",
  ["compiler", "parsing"], "advanced",
);
export const lr0ParserModule = createPlaceholderModule(
  "lr0-parser", "lr0-parser", "LR(0) Parser",
  ["compiler", "parsing"], "advanced",
);
export const lalrParserModule = createPlaceholderModule(
  "lalr-parser", "lalr-parser", "LALR Parser",
  ["compiler", "parsing"], "advanced",
);
export const earleyParserModule = createPlaceholderModule(
  "earley-parser", "earley-parser", "Earley Parser",
  ["compiler", "parsing"], "advanced",
);

// Semantic Analysis
export const symbolTableModule = createPlaceholderModule(
  "symbol-table", "symbol-table", "Symbol Table",
  ["compiler", "semantic-analysis"], "intermediate",
);
export const typeCheckingModule = createPlaceholderModule(
  "type-checking", "type-checking", "Type Checking",
  ["compiler", "semantic-analysis"], "intermediate",
);
export const astGenModule = createPlaceholderModule(
  "ast-gen", "ast-gen", "AST Generation",
  ["compiler", "semantic-analysis"], "intermediate",
);

// Code Generation
export const threeAddressCodeModule = createPlaceholderModule(
  "three-address-code", "three-address-code", "Three-Address Code",
  ["compiler", "code-generation"], "advanced",
);
export const registerAllocationModule = createPlaceholderModule(
  "register-allocation", "register-allocation", "Register Allocation",
  ["compiler", "code-generation"], "advanced",
);
export const constantFoldingModule = createPlaceholderModule(
  "constant-folding", "constant-folding", "Constant Folding",
  ["compiler", "code-generation"], "intermediate",
);
export const deadCodeEliminationModule = createPlaceholderModule(
  "dead-code-elimination", "dead-code-elimination", "Dead Code Elimination",
  ["compiler", "code-generation"], "intermediate",
);
