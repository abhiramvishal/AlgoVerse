import type * as monacoEditor from "monaco-editor";

export function createLineDecorations(
  monaco: typeof monacoEditor,
  lines: number[],
): monacoEditor.editor.IModelDeltaDecoration[] {
  return lines.map((line) => ({
    range: new monaco.Range(line, 1, line, 1),
    options: {
      isWholeLine: true,
      className: "algoverse-line-highlight",
      linesDecorationsClassName: "algoverse-line-highlight-gutter",
    },
  }));
}
