"use client";

import { useEffect, useRef } from "react";
import Editor, { type Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

import { createLineDecorations } from "@/lib/code-highlighter";

interface CodePanelProps {
  code: string;
  highlightLines: number[];
}

export function CodePanel({ code, highlightLines }: CodePanelProps) {
  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationCollectionRef = useRef<editor.IEditorDecorationsCollection | null>(
    null,
  );

  useEffect(() => {
    const monaco = monacoRef.current;
    const editorInstance = editorRef.current;
    if (!monaco || !editorInstance) return;

    const decorations = createLineDecorations(monaco, highlightLines);

    if (!decorationCollectionRef.current) {
      decorationCollectionRef.current = editorInstance.createDecorationsCollection();
    }

    decorationCollectionRef.current.set(decorations);
  }, [highlightLines]);

  return (
    <div className="h-full overflow-hidden rounded-xl border border-zinc-700">
      <Editor
        height="100%"
        defaultLanguage="python"
        value={code}
        onMount={(editorInstance, monaco) => {
          editorRef.current = editorInstance;
          monacoRef.current = monaco;
        }}
        theme="vs-dark"
        options={{
          readOnly: true,
          fontSize: 13,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbersMinChars: 3,
          overviewRulerBorder: false,
          renderLineHighlight: "none",
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
