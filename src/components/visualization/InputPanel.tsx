"use client";

import { useMemo, useState } from "react";

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
    <div className="space-y-2 rounded-xl border border-zinc-700 bg-zinc-900/80 p-3">
      <div className="flex items-center gap-2">
        <Input
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          placeholder="Enter values: 8,4,2,9"
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
        >
          Apply
        </Button>
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      <p className="text-xs text-zinc-500">
        Custom input is encoded in the URL so each visualization state is shareable.
      </p>
    </div>
  );
}
