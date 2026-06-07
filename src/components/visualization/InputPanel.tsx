"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InputPanelProps {
  input: unknown;
  onApplyInput: (value: number[]) => void;
}

export function InputPanel({ input, onApplyInput }: InputPanelProps) {
  const initialValue = useMemo(() => {
    if (!Array.isArray(input)) return "";
    return input.join(",");
  }, [input]);

  const [raw, setRaw] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3 rounded-2xl border border-white/5 bg-zinc-950/40 p-4 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-sans">Custom Dataset</span>
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          placeholder="Enter values: 8,4,2,9"
          className="h-9 bg-zinc-950/50 border-white/5 text-xs text-zinc-300 placeholder-zinc-500 focus-visible:ring-1 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 rounded-xl"
        />
        <Button
          size="sm"
          onClick={() => {
            const parsed = raw
              .split(",")
              .map((token) => token.trim())
              .filter(Boolean)
              .map((token) => Number(token));

            if (!parsed.length || parsed.some((value) => Number.isNaN(value))) {
              setError("Provide a comma-separated list of numbers.");
              return;
            }

            setError(null);
            onApplyInput(parsed);
          }}
          className="h-9 px-4 rounded-xl bg-zinc-900 border border-white/5 text-zinc-200 hover:bg-zinc-800 text-xs font-semibold active:scale-95 transition-all"
        >
          Apply
        </Button>
      </div>
      {error && <p className="text-xs text-rose-400 font-mono">{error}</p>}
      <p className="text-[10px] text-zinc-500 leading-normal">
        Your custom dataset is synchronized with the URL parameters for easy sharing.
      </p>
    </div>
  );
}
