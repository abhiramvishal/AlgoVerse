"use client";

import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Schema detection ─────────────────────────────────────────────────────────

type InputKind =
  | "none"          // null / undefined — nothing to configure
  | "number-array"  // number[]
  | "single-number" // number  (e.g. n-queens board size)
  | "single-string" // string  (e.g. quantum bit string "110")
  | "array-target"  // { arr: number[], target: number }
  | "array-k"       // { arr: number[], k: number }
  | "two-strings"   // { s1: string, s2: string }
  | "str-wrap"      // { str: string }
  | "json";         // everything else — editable JSON textarea

function detectKind(v: unknown): InputKind {
  if (v === null || v === undefined) return "none";
  if (typeof v === "number") return "single-number";
  if (typeof v === "string") return "single-string";
  if (Array.isArray(v) && v.every((x) => typeof x === "number")) return "number-array";
  if (typeof v === "object" && !Array.isArray(v)) {
    const o = v as Record<string, unknown>;
    if ("arr" in o && "target" in o && !("k" in o)) return "array-target";
    if ("arr" in o && "k" in o) return "array-k";
    if ("s1" in o && "s2" in o) return "two-strings";
    if ("str" in o && typeof o.str === "string" && Object.keys(o).length === 1) return "str-wrap";
  }
  return "json";
}

function parseNums(raw: string): number[] | null {
  const parts = raw.split(",").map((t) => t.trim()).filter(Boolean);
  if (!parts.length) return null;
  const nums = parts.map(Number);
  if (nums.some(isNaN)) return null;
  return nums;
}

// ─── Small layout helpers ─────────────────────────────────────────────────────

const fieldCls =
  "h-8 flex-1 bg-zinc-950/60 border-white/[0.06] text-xs text-zinc-200 placeholder-zinc-600 " +
  "focus-visible:ring-1 focus-visible:ring-indigo-500/60 focus-visible:border-indigo-500/50 rounded-xl font-mono";

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>;
}

function FieldLabel({ text }: { text: string }) {
  return (
    <span className="shrink-0 w-16 text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-500">
      {text}
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface InputPanelProps {
  /** The module's defaultInput — used to detect schema and reset on module change */
  defaultInput: unknown;
  /** The currently active input value — used to pre-fill fields */
  input: unknown;
  onApplyInput: (value: unknown) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InputPanel({ defaultInput, input, onApplyInput }: InputPanelProps) {
  const kind = useMemo(() => detectKind(defaultInput), [defaultInput]);

  // Individual field states
  const [arrayRaw,    setArrayRaw]    = useState("");
  const [targetRaw,   setTargetRaw]   = useState("");
  const [kRaw,        setKRaw]        = useState("");
  const [numRaw,      setNumRaw]      = useState("");
  const [strRaw,      setStrRaw]      = useState("");
  const [s1Raw,       setS1Raw]       = useState("");
  const [s2Raw,       setS2Raw]       = useState("");
  const [strWrapRaw,  setStrWrapRaw]  = useState("");
  const [jsonRaw,     setJsonRaw]     = useState("{}");
  const [error,       setError]       = useState<string | null>(null);

  // Sync fields whenever the active input changes (module switch or external update)
  useEffect(() => {
    setError(null);
    if (input === null || input === undefined) return;

    if (Array.isArray(input)) {
      setArrayRaw((input as number[]).join(", "));
      return;
    }
    if (typeof input === "number") { setNumRaw(String(input)); return; }
    if (typeof input === "string") { setStrRaw(input); return; }

    if (typeof input === "object") {
      const o = input as Record<string, unknown>;
      if ("arr" in o) setArrayRaw((o.arr as number[]).join(", "));
      if ("target" in o) setTargetRaw(String(o.target));
      if ("k" in o) setKRaw(String(o.k));
      if ("s1" in o) setS1Raw(String(o.s1));
      if ("s2" in o) setS2Raw(String(o.s2));
      if ("str" in o) setStrWrapRaw(String(o.str));
      setJsonRaw(JSON.stringify(input, null, 2));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultInput, input]);

  function handleApply() {
    setError(null);
    try {
      let value: unknown;

      switch (kind) {
        case "none": return;

        case "number-array": {
          const arr = parseNums(arrayRaw);
          if (!arr) { setError("Enter comma-separated numbers — e.g. 8, 4, 2, 9"); return; }
          if (arr.length < 2) { setError("Need at least 2 values"); return; }
          value = arr;
          break;
        }

        case "array-target": {
          const arr = parseNums(arrayRaw);
          const tgt = Number(targetRaw.trim());
          if (!arr) { setError("Array: comma-separated numbers required"); return; }
          if (isNaN(tgt)) { setError("Target must be a number"); return; }
          value = { arr, target: tgt };
          break;
        }

        case "array-k": {
          const arr = parseNums(arrayRaw);
          const k   = parseInt(kRaw.trim(), 10);
          if (!arr) { setError("Array: comma-separated numbers required"); return; }
          if (isNaN(k) || k < 1) { setError("k must be a positive integer"); return; }
          if (k > arr.length) { setError(`k (${k}) can't exceed array length (${arr.length})`); return; }
          value = { arr, k };
          break;
        }

        case "single-number": {
          const n = Number(numRaw.trim());
          if (isNaN(n)) { setError("Enter a valid number"); return; }
          value = n;
          break;
        }

        case "single-string": {
          if (!strRaw.trim()) { setError("Enter a non-empty string"); return; }
          value = strRaw.trim();
          break;
        }

        case "str-wrap": {
          if (!strWrapRaw.trim()) { setError("Enter a non-empty string"); return; }
          value = { str: strWrapRaw.trim() };
          break;
        }

        case "two-strings": {
          if (!s1Raw.trim() || !s2Raw.trim()) { setError("Both strings are required"); return; }
          value = { s1: s1Raw.trim(), s2: s2Raw.trim() };
          break;
        }

        case "json": {
          value = JSON.parse(jsonRaw);
          break;
        }
      }

      onApplyInput(value);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid input");
    }
  }

  // ── "No input" case ──────────────────────────────────────────────────────────
  if (kind === "none") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-zinc-950/30 px-4 py-2.5">
        <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-700" />
        <span className="text-[11px] text-zinc-600 font-mono">
          This algorithm runs on a fixed internal dataset
        </span>
      </div>
    );
  }

  // ── Input form ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-2.5 rounded-2xl border border-white/[0.06] bg-zinc-950/40 px-4 py-3 shadow-lg backdrop-blur-md">

      {/* Header */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-sans">
          Custom Input
        </span>
      </div>

      {/* Fields */}
      <div className="space-y-2">

        {kind === "number-array" && (
          <Row>
            <FieldLabel text="Array" />
            <Input
              value={arrayRaw}
              onChange={(e) => setArrayRaw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              placeholder="e.g. 8, 4, 2, 9, 5, 7"
              className={fieldCls}
            />
          </Row>
        )}

        {kind === "array-target" && (
          <>
            <Row>
              <FieldLabel text="Array" />
              <Input
                value={arrayRaw}
                onChange={(e) => setArrayRaw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
                placeholder="e.g. 2, 5, 8, 12, 23, 38"
                className={fieldCls}
              />
            </Row>
            <Row>
              <FieldLabel text="Target" />
              <Input
                value={targetRaw}
                onChange={(e) => setTargetRaw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
                placeholder="e.g. 23"
                className={`${fieldCls} max-w-[130px]`}
              />
            </Row>
          </>
        )}

        {kind === "array-k" && (
          <>
            <Row>
              <FieldLabel text="Array" />
              <Input
                value={arrayRaw}
                onChange={(e) => setArrayRaw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
                placeholder="e.g. 2, 1, 5, 1, 3, 2"
                className={fieldCls}
              />
            </Row>
            <Row>
              <FieldLabel text="k" />
              <Input
                value={kRaw}
                onChange={(e) => setKRaw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
                placeholder="e.g. 3"
                className={`${fieldCls} max-w-[90px]`}
              />
            </Row>
          </>
        )}

        {kind === "single-number" && (
          <Row>
            <FieldLabel text="n" />
            <Input
              value={numRaw}
              onChange={(e) => setNumRaw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              placeholder="e.g. 8"
              className={`${fieldCls} max-w-[130px]`}
            />
          </Row>
        )}

        {kind === "single-string" && (
          <Row>
            <FieldLabel text="Value" />
            <Input
              value={strRaw}
              onChange={(e) => setStrRaw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              placeholder="e.g. 110"
              className={fieldCls}
            />
          </Row>
        )}

        {kind === "str-wrap" && (
          <Row>
            <FieldLabel text="String" />
            <Input
              value={strWrapRaw}
              onChange={(e) => setStrWrapRaw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              placeholder="e.g. banana"
              className={fieldCls}
            />
          </Row>
        )}

        {kind === "two-strings" && (
          <>
            <Row>
              <FieldLabel text="String A" />
              <Input
                value={s1Raw}
                onChange={(e) => setS1Raw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
                placeholder="e.g. kitten"
                className={fieldCls}
              />
            </Row>
            <Row>
              <FieldLabel text="String B" />
              <Input
                value={s2Raw}
                onChange={(e) => setS2Raw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
                placeholder="e.g. sitting"
                className={fieldCls}
              />
            </Row>
          </>
        )}

        {kind === "json" && (
          <textarea
            value={jsonRaw}
            onChange={(e) => setJsonRaw(e.target.value)}
            rows={4}
            className={
              "w-full rounded-xl bg-zinc-950/60 border border-white/[0.06] text-[11px] " +
              "text-zinc-300 font-mono p-2.5 leading-relaxed resize-none " +
              "focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/40"
            }
            spellCheck={false}
          />
        )}
      </div>

      {/* Apply row */}
      <div className="flex items-center gap-3 pt-0.5">
        <Button
          size="sm"
          onClick={handleApply}
          className="h-8 px-4 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 hover:text-indigo-200 text-xs font-semibold active:scale-95 transition-all"
        >
          Apply
        </Button>
        {error ? (
          <p className="text-[11px] text-rose-400 font-mono leading-tight">{error}</p>
        ) : (
          <p className="text-[10px] text-zinc-600 font-mono">↵ Enter to apply</p>
        )}
      </div>
    </div>
  );
}
